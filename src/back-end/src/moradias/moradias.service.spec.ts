import { Test, TestingModule } from '@nestjs/testing';
import { MoradiasService } from './moradias.service';
import { PrismaService } from '../database/prisma.service';
import { RegraMoradiaService } from '../regra-moradia/regra-moradia.service';
import { ComodidadesMoradiaService } from '../comodidades-moradia/comodidades-moradia.service';

// Mocks
const mockPrismaService = {
  moradia: {
    create: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    findFirst: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  usuario: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    update: jest.fn(),
  },
  $transaction: jest.fn(),
};

const mockRegraMoradiaService = {};
const mockComodidadesMoradiaService = {};

describe('MoradiasService', () => {
  let service: MoradiasService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MoradiasService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: RegraMoradiaService,
          useValue: mockRegraMoradiaService,
        },
        {
          provide: ComodidadesMoradiaService,
          useValue: mockComodidadesMoradiaService,
        },
      ],
    }).compile();

    service = module.get<MoradiasService>(MoradiasService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
