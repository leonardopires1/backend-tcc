import { Test, TestingModule } from '@nestjs/testing';
import { RegrasMoradiaController } from './regra-moradia.controller';
import { RegraMoradiaService } from './regra-moradia.service';

// Mock do RegraMoradiaService
const mockRegraMoradiaService = {
  create: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
};

describe('RegrasMoradiaController', () => {
  let controller: RegrasMoradiaController;
  let service: RegraMoradiaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RegrasMoradiaController],
      providers: [
        {
          provide: RegraMoradiaService,
          useValue: mockRegraMoradiaService,
        },
      ],
    }).compile();

    controller = module.get<RegrasMoradiaController>(RegrasMoradiaController);
    service = module.get<RegraMoradiaService>(RegraMoradiaService);
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
