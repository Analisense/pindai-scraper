import { Test, TestingModule } from '@nestjs/testing';
import { PindaiUkiService } from './pindai-uki.service';

describe('PindaiUkiService', () => {
  let service: PindaiUkiService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PindaiUkiService],
    }).compile();

    service = module.get<PindaiUkiService>(PindaiUkiService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
