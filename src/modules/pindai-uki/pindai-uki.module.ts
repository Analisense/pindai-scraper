import { Module } from '@nestjs/common';
import { PindaiUkiService } from './pindai-uki.service';
import { PindaiUkiController } from './pindai-uki.controller';

@Module({
  controllers: [PindaiUkiController],
  providers: [PindaiUkiService],
})
export class PindaiUkiModule {}
