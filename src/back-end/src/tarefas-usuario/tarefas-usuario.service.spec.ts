import { Test, TestingModule } from '@nestjs/testing';
import { TarefasUsuarioService } from './tarefas-usuario.service';
import { PrismaService } from '../database/prisma.service';

// Mock do PrismaService
const mockPrismaService = {
  tarefa: {
    findUnique: jest.fn(),
    create: jest.fn(),
    findMany: jest.fn(),
    findFirst: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  atribuicaoTarefa: {
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
};

describe('TarefasUsuarioService', () => {
  let service: TarefasUsuarioService;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TarefasUsuarioService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<TarefasUsuarioService>(TarefasUsuarioService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should have access to dependencies', () => {
    expect(prismaService).toBeDefined();
  });
});
