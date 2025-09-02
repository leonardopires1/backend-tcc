import { Test, TestingModule } from '@nestjs/testing';
import { DespesasService } from './despesas.service';

describe('DespesasService', () => {
  let service: DespesasService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DespesasService],
    }).compile();

    service = module.get<DespesasService>(DespesasService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
