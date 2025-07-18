import { Test, TestingModule } from '@nestjs/testing';
import { ComodidadesMoradiaService } from './comodidades-moradia.service';

describe('ComodidadesMoradiaService', () => {
  let service: ComodidadesMoradiaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ComodidadesMoradiaService],
    }).compile();

    service = module.get<ComodidadesMoradiaService>(ComodidadesMoradiaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
