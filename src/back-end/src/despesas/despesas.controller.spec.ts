import { Test, TestingModule } from '@nestjs/testing';
import { DespesasController } from './despesas.controller';
import { DespesasService } from './despesas.service';

// Mock do DespesasService
const mockDespesasService = {
  create: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
};

describe('DespesasController', () => {
  let controller: DespesasController;
  let service: DespesasService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DespesasController],
      providers: [
        {
          provide: DespesasService,
          useValue: mockDespesasService,
        },
      ],
    }).compile();

    controller = module.get<DespesasController>(DespesasController);
    service = module.get<DespesasService>(DespesasService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should have access to dependencies', () => {
    expect(service).toBeDefined();
  });
});
