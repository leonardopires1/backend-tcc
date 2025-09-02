import { Test, TestingModule } from '@nestjs/testing';
import { ComodidadesMoradiaService } from './comodidades-moradia.service';
import { PrismaService } from '../database/prisma.service';

// Mock do PrismaService
const mockPrismaService = {
  comodidade: {
    findUnique: jest.fn(),
    create: jest.fn(),
    findMany: jest.fn(),
    findFirst: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
};

describe('ComodidadesMoradiaService', () => {
  let service: ComodidadesMoradiaService;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ComodidadesMoradiaService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<ComodidadesMoradiaService>(ComodidadesMoradiaService);
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
