import { Controller, Get } from '@nestjs/common';
import { PindaiPtService } from './pindai-pt.service';

@Controller('pindai-pt')
export class PindaiPtController {
  constructor(private readonly pindaiPtService: PindaiPtService) {}

  @Get('univ-pt')
  getUnivPt() {
    return this.pindaiPtService.getUnivPt();
  }
}
