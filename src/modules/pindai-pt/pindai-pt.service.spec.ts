import { Test, TestingModule } from '@nestjs/testing';
import { PindaiPtService } from './pindai-pt.service';

describe('PindaiPtService', () => {
  let service: PindaiPtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PindaiPtService],
    }).compile();

    service = module.get<PindaiPtService>(PindaiPtService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
