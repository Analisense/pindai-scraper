import { Injectable, Logger } from '@nestjs/common';
import { number } from 'joi';
import { resolve } from 'path';
import puppeteer, { Browser, Page } from 'puppeteer';
import HelperClass from 'src/common/helper/helper-class';
import { PrismaService } from 'src/prisma/prisma.service';
import PindaiUkiDto from './dto/pindai-uki.dto';

@Injectable()
export class PindaiUkiService {
  constructor(private readonly prisma: PrismaService) {}
  private readonly logger = new Logger(PindaiUkiService.name);
  private url = 'https://pindai.kemdikbud.go.id/web/iku2021/';

  async getUniversity() {
    try {
      const univData = await this.getUniv();
      console.log({ detailiku: univData[0].detailIku });
      console.log(typeof univData[0].aksi);

      for (let index = 0; index < univData.length; index++) {
        const insertData = univData[index];
        await this.prisma.pindaiUki.create({
          data: insertData,
        });
      }
      return univData;
    } catch (error) {
      this.logger.error(error);
      throw error;
    }
  }

  getUniv = async () => {
    const browser: Browser = await puppeteer.launch({ headless: true });

    const page = await browser.newPage();

    await page.goto(this.url);

    // get all <tr> element
    const allUnivData: any = await page.$$eval(
      'tr',
      (elements: HTMLTableRowElement[]) => {
        return Array.from(elements).map((el) => {
          if (!el.cells[0].textContent) {
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
      // if (index % 10 === 0) {
      //   console.log('now waiting for 5 seconds');
      //   await HelperClass.sleepNow(5000);
      // }
      const univ = output[index];
      const detailIku = await this.getDetailUniv(univ.name, univ.aksi, browser);
      output[index]['detailIku'] = detailIku;
    }

    await browser.close();
    console.log('Finish scraping all IKU Data');
    return output;
  };

  getDetailUniv = async (name: string, url: string, browser: Browser) => {
    console.log('Now scraping IKU detail from : ' + name);
    const page = await browser.newPage();

    await page.goto(url);

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

    console.log('Finish scraping IKU detail from : ' + name);
    await page.close();
    return output;
  };
}
