import { Test, TestingModule } from '@nestjs/testing';
import { RegraMoradiaService } from './regra-moradia.service';

describe('RegraMoradiaService', () => {
  let service: RegraMoradiaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RegraMoradiaService],
    }).compile();

    service = module.get<RegraMoradiaService>(RegraMoradiaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
