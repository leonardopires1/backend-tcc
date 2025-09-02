import { Test, TestingModule } from '@nestjs/testing';
import { HttpException, HttpStatus } from '@nestjs/common';
import { UsersService } from './users.service';
import { PrismaService } from '../database/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcrypt';

// Mock do bcrypt
jest.mock('bcrypt');
const mockedBcrypt = bcrypt as jest.Mocked<typeof bcrypt>;

describe('UsersService', () => {
  let service: UsersService;
  let prismaService: PrismaService;

  const mockPrismaService = {
    usuario: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    const createUserDto: CreateUserDto = {
      nome: 'João Silva',
      email: 'joao@email.com',
      senha: 'senha123A',
      confirmarSenha: 'senha123A',
      cpf: '11144477735', // CPF válido para testes
      telefone: '11987654321',
      genero: 'Masculino',
    };

    it('should create a user successfully', async () => {
      const hashedPassword = 'hashedPassword123';
      const expectedUser = {
        id: 1,
        nome: 'João Silva',
        email: 'joao@email.com',
        cpf: '11144477735',
        telefone: '11987654321',
        genero: 'Masculino',
        criadoEm: new Date(),
      };

      mockedBcrypt.hash.mockResolvedValue(hashedPassword as never);
      (prismaService.usuario.findFirst as jest.Mock).mockResolvedValue(null);
      (prismaService.usuario.create as jest.Mock).mockResolvedValue(expectedUser);

      const result = await service.create(createUserDto);

      expect(mockedBcrypt.hash).toHaveBeenCalledWith('senha123A', 12);
      expect(prismaService.usuario.create).toHaveBeenCalledWith({
        data: {
          nome: 'João Silva',
          email: 'joao@email.com',
          senha: hashedPassword,
          cpf: '11144477735',
          genero: 'Masculino',
          telefone: '11987654321',
        },
        select: {
          id: true,
          nome: true,
          email: true,
          cpf: true,
          telefone: true,
          genero: true,
          criadoEm: true,
        },
      });
      expect(result).toEqual(expectedUser);
    });

    it('should throw error when passwords do not match', async () => {
      const invalidDto = { ...createUserDto, confirmarSenha: 'senhadiferente' };

      await expect(service.create(invalidDto)).rejects.toThrow(
        new HttpException(
          'Senha e confirmação de senha não coincidem',
          HttpStatus.BAD_REQUEST,
        ),
      );
    });

    it('should throw error when email already exists', async () => {
      (prismaService.usuario.findFirst as jest.Mock).mockResolvedValue({ id: 1 });

      await expect(service.create(createUserDto)).rejects.toThrow(
        new HttpException('Email já está em uso.', HttpStatus.CONFLICT),
      );
    });
  });

  describe('findAll', () => {
    it('should return an array of users', async () => {
      const expectedUsers = [
        { id: 1, nome: 'João', email: 'joao@email.com' },
        { id: 2, nome: 'Maria', email: 'maria@email.com' },
      ];

      (prismaService.usuario.findMany as jest.Mock).mockResolvedValue(expectedUsers);

      const result = await service.findAll();

      expect(result).toEqual(expectedUsers);
      expect(prismaService.usuario.findMany).toHaveBeenCalledWith({
        select: {
          id: true,
          nome: true,
          email: true,
          moradiasDono: {
            select: {
              id: true,
              nome: true,
              endereco: true,
            },
          },
        },
      });
    });
  });

  describe('findOne', () => {
    it('should return a user when found', async () => {
      const email = 'joao@email.com';
      const expectedUser = {
        id: 1,
        nome: 'João',
        email,
        senha: 'hashedPassword',
      };

      (prismaService.usuario.findUnique as jest.Mock).mockResolvedValue(expectedUser);

      const result = await service.findOne(email);

      expect(result).toEqual(expectedUser);
      expect(prismaService.usuario.findUnique).toHaveBeenCalledWith({
        where: { email },
        select: {
          id: true,
          nome: true,
          email: true,
          cpf: true,
          telefone: true,
          genero: true,
          moradiaId: true,
          senha: true,
          moradiasDono: {
            select: {
              id: true,
              nome: true,
              endereco: true,
            },
          },
        },
      });
    });

    it('should throw NotFoundException when user not found', async () => {
      const email = 'inexistente@email.com';
      
      (prismaService.usuario.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(service.findOne(email)).rejects.toThrow(
        'Usuário não encontrado',
      );
    });
  });
});
