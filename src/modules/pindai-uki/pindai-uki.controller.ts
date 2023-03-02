import { Controller, Get, Query } from '@nestjs/common';
import { PindaiUkiService } from './pindai-uki.service';

@Controller('pindai-uki')
export class PindaiUkiController {
  constructor(private readonly pindaiUkiService: PindaiUkiService) {}

  @Get('univ-iku')
  getUnivIku(@Query('url') url: string) {
    return this.pindaiUkiService.getUnivIku(url);
  }
}
