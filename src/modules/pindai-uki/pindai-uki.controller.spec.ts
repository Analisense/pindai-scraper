import { Test, TestingModule } from '@nestjs/testing';
import { PindaiUkiController } from './pindai-uki.controller';
import { PindaiUkiService } from './pindai-uki.service';

describe('PindaiUkiController', () => {
  let controller: PindaiUkiController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PindaiUkiController],
      providers: [PindaiUkiService],
    }).compile();

    controller = module.get<PindaiUkiController>(PindaiUkiController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
