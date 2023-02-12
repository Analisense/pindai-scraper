import { Controller, Get } from '@nestjs/common';
import { PindaiUkiService } from './pindai-uki.service';

@Controller('pindai-uki')
export class PindaiUkiController {
  constructor(private readonly pindaiUkiService: PindaiUkiService) {}

  @Get('university')
  getUniversity() {
    return this.pindaiUkiService.getUniversity();
  }
}
