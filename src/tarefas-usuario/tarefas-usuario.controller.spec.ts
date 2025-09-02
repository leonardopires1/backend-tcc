import { Test, TestingModule } from '@nestjs/testing';
import { TarefasUsuarioController } from './tarefas-usuario.controller';
import { TarefasUsuarioService } from './tarefas-usuario.service';

// Mock do TarefasUsuarioService
const mockTarefasUsuarioService = {
  create: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
};

describe('TarefasUsuarioController', () => {
  let controller: TarefasUsuarioController;
  let service: TarefasUsuarioService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TarefasUsuarioController],
      providers: [
        {
          provide: TarefasUsuarioService,
          useValue: mockTarefasUsuarioService,
        },
      ],
    }).compile();

    controller = module.get<TarefasUsuarioController>(TarefasUsuarioController);
    service = module.get<TarefasUsuarioService>(TarefasUsuarioService);
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
