import {
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto) {
    // Validar se senhas coincidem
    if (createUserDto.senha !== createUserDto.confirmarSenha) {
      throw new HttpException(
        'Senha e confirmação de senha não coincidem',
        HttpStatus.BAD_REQUEST,
      );
    }

    // Verificar campos únicos
    await this.checkUniqueFields(createUserDto);

    const senhaHash = await bcrypt.hash(createUserDto.senha, 12); // Aumentado para 12 rounds

    return this.prisma.usuario.create({
      data: {
        nome: createUserDto.nome,
        email: createUserDto.email.toLowerCase(), // Normalizar email
        senha: senhaHash,
        cpf: createUserDto.cpf.replace(/\D/g, ''), // Remover caracteres especiais
        genero: createUserDto.genero,
        telefone: createUserDto.telefone.replace(/\D/g, ''), // Remover caracteres especiais
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
  }

  private async checkUniqueFields(createUserDto: CreateUserDto) {
    const fieldsToCheck = [
      { field: 'email', value: createUserDto.email.toLowerCase() },
      { field: 'cpf', value: createUserDto.cpf.replace(/\D/g, '') },
      { field: 'telefone', value: createUserDto.telefone.replace(/\D/g, '') },
    ];

    for (const { field, value } of fieldsToCheck) {
      if (!value) continue;
      
      // Validação específica para CPF
      if (field === 'cpf') {
        if (value.length !== 11) {
          throw new HttpException(
            'CPF deve ter 11 dígitos.',
            HttpStatus.BAD_REQUEST,
          );
        }
        if (!this.isValidCPF(value)) {
          throw new HttpException(
            'CPF inválido.',
            HttpStatus.BAD_REQUEST,
          );
        }
      }

      // Validação para telefone
      if (field === 'telefone' && (value.length < 10 || value.length > 11)) {
        throw new HttpException(
          'Telefone deve ter 10 ou 11 dígitos.',
          HttpStatus.BAD_REQUEST,
        );
      }

      const existingUser = await this.prisma.usuario.findFirst({
        where: { [field]: value },
      });

      if (existingUser) {
        throw new HttpException(
          `${field.charAt(0).toUpperCase() + field.slice(1)} já está em uso.`,
          HttpStatus.CONFLICT, // Mudança para 409 Conflict
        );
      }
    }
  }

  private isValidCPF(cpf: string): boolean {
    // Algoritmo de validação de CPF
    if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false;

    let sum = 0;
    for (let i = 0; i < 9; i++) {
      sum += parseInt(cpf.charAt(i)) * (10 - i);
    }
    let remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(cpf.charAt(9))) return false;

    sum = 0;
    for (let i = 0; i < 10; i++) {
      sum += parseInt(cpf.charAt(i)) * (11 - i);
    }
    remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    return remainder === parseInt(cpf.charAt(10));
  }

  async findAll() {
    return this.prisma.usuario.findMany({
      select: {
        id: true,
        nome: true,
        email: true,
        moradiaDono: {
          select: {
            id: true,
            nome: true,
            endereco: true,
          },
        },
      },
    });
  }

  async findOne(email: string) {
    const user = await this.prisma.usuario.findUnique({
      where: { email },
      select: {
        id: true,
        nome: true,
        email: true,
        senha: true,
        moradiaDono: {
          select: {
            id: true,
            nome: true,
            endereco: true,
          },
        },
      },
    });
    if (!user) throw new NotFoundException('Usuário não encontrado');
    return user;
  }

  async findOneById(id: number) {
    try {
      const user = await this.prisma.usuario.findUnique({
        where: { id },
        select: {
          id: true,
          nome: true,
          email: true,
          cpf: true,
          telefone: true,
          genero: true,
          criadoEm: true,
          moradiaDono: {
            select: {
              id: true,
              nome: true,
              endereco: true,
            },
          },
        },
      });

      if (!user) {
        throw new NotFoundException('Usuário não encontrado');
      }

      return user;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new HttpException(
        'Erro interno do servidor',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    try {
      return await this.prisma.usuario.update({
        where: { id },
        data: updateUserDto,
        select: {
          id: true,
          nome: true,
          email: true,
        },
      });
    } catch {
      throw new NotFoundException(
        'Usuário não encontrado ou erro ao atualizar',
      );
    }
  }

  async updateAvatar(userId: string, file: string) {
    if (file) {
      await this.prisma.usuario.update({
        where: { id: +userId },
        data: { avatarUrl: file },
      });
    }
  }

  async remove(id: number) {
    try {
      return await this.prisma.usuario.delete({
        where: { id },
        select: {
          id: true,
          nome: true,
          email: true,
        },
      });
    } catch {
      throw new NotFoundException('Usuário não encontrado ou erro ao remover');
    }
  }
}
