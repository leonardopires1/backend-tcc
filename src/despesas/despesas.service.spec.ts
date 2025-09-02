import { Test, TestingModule } from '@nestjs/testing';
import { DespesasService } from './despesas.service';
import { PrismaService } from '../database/prisma.service';

// Mock do PrismaService
const mockPrismaService = {
  despesa: {
    findUnique: jest.fn(),
    create: jest.fn(),
    findMany: jest.fn(),
    findFirst: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
};

describe('DespesasService', () => {
  let service: DespesasService;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DespesasService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<DespesasService>(DespesasService);
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
