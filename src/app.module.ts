import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { envValidationSchema } from './config/env-validation.schema';
import { GreetingModule } from './modules/greeting/greeting.module';
import { PrismaModule } from './prisma/prisma.module';
import { PindaiUkiModule } from './modules/pindai-uki/pindai-uki.module';
import { PindaiPtModule } from './modules/pindai-pt/pindai-pt.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      validationSchema: envValidationSchema,
    }),
    PrismaModule,
    GreetingModule,
    PindaiUkiModule,
    PindaiPtModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
