import { Test, TestingModule } from '@nestjs/testing';
import { MoradiasController } from './moradias.controller';
import { MoradiasService } from './moradias.service';

// Mock do MoradiasService
const mockMoradiasService = {
  create: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  findAllByDono: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
  adicionarMembro: jest.fn(),
  upload: jest.fn(),
};

describe('MoradiasController', () => {
  let controller: MoradiasController;
  let service: MoradiasService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MoradiasController],
      providers: [
        {
          provide: MoradiasService,
          useValue: mockMoradiasService,
        },
      ],
    }).compile();

    controller = module.get<MoradiasController>(MoradiasController);
    service = module.get<MoradiasService>(MoradiasService);
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
