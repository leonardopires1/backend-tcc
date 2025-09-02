import { Test, TestingModule } from '@nestjs/testing';
import { RegraMoradiaService } from './regra-moradia.service';
import { PrismaService } from '../database/prisma.service';

// Mock do PrismaService
const mockPrismaService = {
  regraMoradia: {
    findUnique: jest.fn(),
    create: jest.fn(),
    findMany: jest.fn(),
    findFirst: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
};

describe('RegraMoradiaService', () => {
  let service: RegraMoradiaService;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RegraMoradiaService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<RegraMoradiaService>(RegraMoradiaService);
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
