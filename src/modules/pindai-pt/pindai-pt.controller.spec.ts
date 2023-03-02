import { Test, TestingModule } from '@nestjs/testing';
import { PindaiPtController } from './pindai-pt.controller';
import { PindaiPtService } from './pindai-pt.service';

describe('PindaiPtController', () => {
  let controller: PindaiPtController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PindaiPtController],
      providers: [PindaiPtService],
    }).compile();

    controller = module.get<PindaiPtController>(PindaiPtController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
