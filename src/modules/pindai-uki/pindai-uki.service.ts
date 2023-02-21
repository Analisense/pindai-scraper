import { Injectable, Logger } from '@nestjs/common';
import puppeteer, { Browser } from 'puppeteer';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class PindaiUkiService {
  constructor(private readonly prisma: PrismaService) {}
  private readonly logger = new Logger(PindaiUkiService.name);
  // private url = 'https://pindai.kemdikbud.go.id/web/iku2020/';

  async getUniversity(url: string) {
    try {
      const univData = await this.getUniv(url);

      for (let index = 0; index < univData.length; index++) {
        const insertData = univData[index];
        await this.prisma.pindaiUki.upsert({
          where: {
            name: insertData.name,
          },
          create: insertData,
          update: insertData,
        });
      }
      return univData;
    } catch (error) {
      this.logger.error(error);
      throw error;
    }
  }

  getUniv = async (url: string) => {
    const browser: Browser = await puppeteer.launch({ headless: true });

    const page = await browser.newPage();
    await page.setViewport({ width: 1920, height: 1080 });
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

    await page.goto(url);

    // get all <tr> element
    const allUnivData: any = await page.$$eval(
      'tr',
      (elements: HTMLTableRowElement[]) => {
        return Array.from(elements).map((el) => {
          // check if there is cells
          if (!el.cells[0].textContent) {
            // get cells content
            return {
              uuid: el.cells[4].firstElementChild
                ? el.cells[4].firstElementChild
                    .getAttribute('href')
                    .match(/\w+-\w+-\w+-\w+-\w+/)[0]
                : null,
              name: el.cells[1].textContent,
              jenis_pt: el.cells[2].textContent,
              jenis_satker: el.cells[3].textContent,
              aksi: el.cells[4].firstElementChild
                ? el.cells[4].firstElementChild.getAttribute('href')
                : null,
            };
          }
        });
      },
    );

    const output = allUnivData.filter((data) => data !== null);

    for (let index = 0; index < output.length; index++) {
      const univ = output[index];
      const detailIku = [];
      console.log('Now scraping IKU detail from : ' + univ.name);
      for (let tahun = 2020; tahun < new Date().getFullYear(); tahun++) {
        const data = await this.getDetailUniv(
          univ.aksi.replace(/\d{4}/, tahun),
          browser,
        );
        detailIku.push({ [tahun]: data });
      }
      console.log('Finish scraping IKU detail from : ' + univ.name);
      console.log('================================================');
      output[index]['detailIku'] = detailIku;
    }

    await browser.close();
    console.log('Finish scraping all IKU Data');
    return output;
  };

  getDetailUniv = async (url: string, browser: Browser) => {
    const page = await browser.newPage();
    await page.setViewport({ width: 1920, height: 1080 });
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

    await page.goto(url, { waitUntil: 'load', timeout: 50000 });

    // get all tr
    const table: string[][] = await page.$$eval(
      'tr',
      (elements: HTMLTableRowElement[]) => {
        // tr
        return Array.from(elements).map((element) => {
          //cells of tr
          return Array.from(element.cells).map((cell) => {
            //get textContent of cells of tr
            return cell.textContent;
          });
        });
      },
    );
    //separate the header
    const header = table.shift();

    //map it again to more better structure
    const output: any[] = table.map((item: string[]) => {
      const objOutput = {};
      header.forEach((head, index) => (objOutput[head] = item[index]));

      return { [item[0]]: objOutput };
    });

    await page.close();
    return output;
  };
}
