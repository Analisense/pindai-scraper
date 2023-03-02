import { Injectable, Logger } from '@nestjs/common';
import puppeteer, { Browser } from 'puppeteer';
import { puppeteer_args } from 'src/common/helper/helper-class';
import { PrismaService } from 'src/prisma/prisma.service';
import PindaiPtDto from './dto/pindai-pt.dto';

@Injectable()
export class PindaiPtService {
  constructor(private readonly prisma: PrismaService) {}
  private readonly logger = new Logger(PindaiPtService.name);

  async getUnivPt() {
    try {
      const browser: Browser = await puppeteer.launch({
        headless: true,
        args: puppeteer_args,
      });

      const datas = [];
      for (let index = 0; index <= 16; index++) {
        console.log('Now scraping index ' + index);
        const univData = await this.getUniv(
          'https://pindai.kemdikbud.go.id/web/pindaiptlist/' + index,
          browser,
        );
        console.log('Finish scraping index ' + index);
        console.log('================================================');
        datas.push(...univData);
      }
      console.log('Finish scraping All Data');
      console.log('================================================');
      await browser.close();

      for (const data of datas) {
        const insertData = data;
        await this.prisma.pindaiPt.upsert({
          where: {
            name: insertData.name,
          },
          create: insertData,
          update: insertData,
        });
      }

      return datas.length;
    } catch (error) {
      this.logger.error(error);
      throw error;
    }
  }

  getUniv = async (url: string, browser: Browser) => {
    const page = await browser.newPage();
    await page.setRequestInterception(true);

    page.on('request', (req) => {
      if (
        req.resourceType() == 'stylesheet' ||
        req.resourceType() == 'font' ||
        req.resourceType() == 'image'
      ) {
        req.abort();
      } else {
        req.continue();
      }
    });

    await page.goto(url, { waitUntil: 'domcontentloaded' });

    const allUnivData: any = await page.$$eval(
      'div[class=card-body]',
      (elements: Element[]) => {
        return Array.from(elements).map((element: any) => {
          const good = element.firstElementChild.children[2].style.width;
          const half = element.firstElementChild.children[1].style.width;
          const bad = element.firstElementChild.children[0].style.width;
          return {
            univCode: Number(
              element.lastElementChild.getAttribute('href').match(/\d+/)[0],
            ),
            name: element.textContent.replace('Detail', '').trim(),
            progress: { complete: good, lacking: half, incomplete: bad },
            aksi: element.lastElementChild.getAttribute('href'),
          };
        });
      },
    );
    for (let index = 0; index < allUnivData.length; index++) {
      const univ = allUnivData[index];
      console.log('Now scraping PT detail from : ' + univ.name);

      const data = await this.getDetailUnivPt(univ.aksi, browser);
      console.log('Finish scraping PT detail from : ' + univ.name);
      console.log('================================================');
      allUnivData[index]['detailPt'] = data;
    }

    await page.close();
    return allUnivData;
  };

  getDetailUnivPt = async (url: string, browser: Browser) => {
    const page = await browser.newPage();
    await page.setRequestInterception(true);

    page.on('request', (req) => {
      if (
        req.resourceType() == 'stylesheet' ||
        req.resourceType() == 'font' ||
        req.resourceType() == 'image'
      ) {
        req.abort();
      } else {
        req.continue();
      }
    });

    await page.goto(url, { waitUntil: 'domcontentloaded' });

    console.log('Now scraping PT indicator');
    const cardBodies = await page.$$('div[class=card-body]');
    const indikator = [];
    for (const card of cardBodies) {
      const kategori = await card.evaluate((node) => {
        return node.textContent.trim();
      });
      const nilai = await card.$$eval('a', (node) => {
        let nilaiString: string;
        switch (node.length) {
          case 1:
            nilaiString = 'Tidak Bagus';
            break;
          case 2:
            nilaiString = 'Kurang Bagus';
            break;
          case 3:
            nilaiString = 'Sangat Bagus';
            break;
          default:
            nilaiString = 'Data Tidak Ditemukan';
            break;
        }
        return nilaiString;
      });
      indikator.push({ kategori, nilai });
    }

    const tableBody = await page.$('tbody');
    const tableRow = await tableBody.$$('tr');

    if (tableRow.length == 0) {
      page.close();
      return { indikator, prodiData: null };
    }

    console.log('Now scraping PT Prodi');
    const prodiData = [];
    for (const row of tableRow) {
      const rowContent = await row.evaluate((node) => {
        let akreditasi = node.cells[3].firstElementChild.className.replace(
          'btn btn-icon ',
          '',
        );
        let akreditasiInt = node.cells[4].firstElementChild.className.replace(
          'btn btn-icon ',
          '',
        );
        let dosenMinimum = node.cells[5].firstElementChild.className.replace(
          'btn btn-icon ',
          '',
        );

        akreditasi == 'btn-success'
          ? (akreditasi = 'Sudah Memenuhi')
          : (akreditasi = 'Belum Memenuhi');
        akreditasiInt == 'btn-success'
          ? (akreditasiInt = 'Sudah Memenuhi')
          : (akreditasiInt = 'Belum Memenuhi');
        dosenMinimum == 'btn-success'
          ? (dosenMinimum = 'Sudah Memenuhi')
          : (dosenMinimum = 'Belum Memenuhi');

        return {
          'Nama Prodi': node.cells[1].textContent,
          'Program Pendidikan': node.cells[2].textContent,
          Akreditasi: akreditasi,
          'Akreditasi Internasional': akreditasiInt,
          'Memenuhi Dosen Minimum': dosenMinimum,
        };
      });
      prodiData.push(rowContent);
    }

    page.close();
    return { indikator, prodiData };
  };
}
