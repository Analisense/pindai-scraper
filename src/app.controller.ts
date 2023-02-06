import { Controller, Get } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Controller()
export class AppController {
  constructor(private configService: ConfigService) {}

  @Get()
  appInfo() {
    return {
      name: this.configService.get<string>('APP_NAME'),
      desc:
        'Scraping - ' +
        this.configService.get<string>('APP_NAME') +
        ' API Service | Analisense',
      version: '1.0.0',
      status: 'API Services Ready!',
    };
  }
}
