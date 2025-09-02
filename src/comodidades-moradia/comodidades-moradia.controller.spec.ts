import { Test, TestingModule } from '@nestjs/testing';
import { ComodidadesMoradiaController } from './comodidades-moradia.controller';
import { ComodidadesMoradiaService } from './comodidades-moradia.service';

// Mock do ComodidadesMoradiaService
const mockComodidadesMoradiaService = {
  create: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
};

describe('ComodidadesMoradiaController', () => {
  let controller: ComodidadesMoradiaController;
  let service: ComodidadesMoradiaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ComodidadesMoradiaController],
      providers: [
        {
          provide: ComodidadesMoradiaService,
          useValue: mockComodidadesMoradiaService,
        },
      ],
    }).compile();

    controller = module.get<ComodidadesMoradiaController>(ComodidadesMoradiaController);
    service = module.get<ComodidadesMoradiaService>(ComodidadesMoradiaService);
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
