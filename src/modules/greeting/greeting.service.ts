import { Injectable, Logger } from '@nestjs/common';
import puppeteer from 'puppeteer';
import { PrismaService } from 'src/prisma/prisma.service';
import GreetingDto from './dto/greeting.dto';

@Injectable()
export class GreetingService {
  constructor(private readonly prisma: PrismaService) {}
  private readonly logger = new Logger(GreetingService.name);

  async getProfileGithub() {
    try {
      const data = this.puppeteerProfileGithub;

      const result = await data();
      // * Print result in console
      console.log(result);

      // * Insert into mongo db and return the result
      return await this.prisma.greeting.createMany({
        data: result,
      });
    } catch (error) {
      this.logger.error(error);
      throw error;
    }
  }

  puppeteerProfileGithub = async () => {
    // Launch the browser
    const browser = await puppeteer.launch({ headless: false });

    // Create a page
    const page = await browser.newPage();

    // Go to your site
    await page.goto('https://github.com/gidachmad');

    //  ! Get just one elements with selector 'h1.vcard-names > span, with removed \n and \t'
    const nameValue = await page.$eval('h1.vcard-names > span.p-name', (el) => {
      return el.textContent.replace(/\t/g, '').trim();
    });

    //  ! Get just one elements with selector 'h1.vcard-names > span, with removed \n and \t'
    const usernameValue = await page.$eval(
      'h1.vcard-names > span.p-nickname',
      (el) => {
        return el.textContent.replace(/\t/g, '').trim();
      },
    );

    //  ! Get all elements with selector 'div.p-note.user-profile-bio.mb-3.js-user-profile-bio.f4, with removed \n and \t'
    const greetingMsg = await page.$$eval(
      'div.p-note.user-profile-bio.mb-3.js-user-profile-bio.f4',
      (elements) => {
        return elements.map((el) => el.textContent.replace(/\t/g, '').trim());
      },
    );

    // Close browser.
    await browser.close();

    const output: GreetingDto = {
      name: nameValue,
      username: usernameValue,
      greetingMsg: greetingMsg[0],
    };

    return output;
  };
}
