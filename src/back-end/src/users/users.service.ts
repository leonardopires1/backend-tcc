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
    // await this.checkUniqueFields(createUserDto);

    const senhaHash = await bcrypt.hash(createUserDto.senha, 10);

    return this.prisma.usuario.create({
      data: {
        nome: createUserDto.nome,
        email: createUserDto.email,
        senha: senhaHash,
        cpf: createUserDto.cpf,
        genero: createUserDto.genero,
        telefone: createUserDto.telefone,
      },
      select: {
        id: true,
        nome: true,
        email: true,
      },
    });
  }

  private async checkUniqueFields(createUserDto: CreateUserDto) {
    const fieldsToCheck = [
      { field: 'email', value: createUserDto.email },
      { field: 'cpf', value: createUserDto.cpf },
      { field: 'telefone', value: createUserDto.telefone },
    ];

    for (const { field, value } of fieldsToCheck) {
      if (!value) continue; // Pula se o valor não foi enviado
      if (field === 'cpf' && value.length !== 11) {
        throw new HttpException(
          'CPF deve ter 11 dígitos.',
          HttpStatus.BAD_REQUEST,
        );
      }
      const existingUser = await this.prisma.usuario.findFirst({
        where: { [field]: value },
      });

      if (existingUser) {
        throw new HttpException(
          `${field.charAt(0).toUpperCase() + field.slice(1)} já está em uso.`,
          HttpStatus.BAD_REQUEST,
        );
      }
    }
  }

  async findAll() {
    return this.prisma.usuario.findMany({
      select: {
        id: true,
        nome: true,
        email: true,
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
      },
    });
    if (!user) throw new NotFoundException('Usuário não encontrado');
    return user;
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
