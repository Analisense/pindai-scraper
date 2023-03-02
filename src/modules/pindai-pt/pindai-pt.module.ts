import { Module } from '@nestjs/common';
import { PindaiPtService } from './pindai-pt.service';
import { PindaiPtController } from './pindai-pt.controller';

@Module({
  controllers: [PindaiPtController],
  providers: [PindaiPtService],
})
export class PindaiPtModule {}
