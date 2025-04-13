import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from 'src/database/prisma.service';
import { Prisma, PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  @Inject()
  private readonly prisma: PrismaService;

  async create(createUserDto: CreateUserDto) {
    const senhaHash = await bcrypt.hash(createUserDto.senha, 10);

    return await this.prisma.usuario.create({
      data: { ...createUserDto, senha: senhaHash },
      select: {
        id: true,
        nome: true,
        email: true,
      },
    });
  }

  async findAll() {
    return await this.prisma.usuario.findMany();
  }

  async findOne(email: string ) {
    const user = await this.prisma.usuario.findUnique({
      where: { email },
    });
    if (!user) throw new NotFoundException('Usuário não encontrado');
    return user;
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return this.prisma.usuario.update({
      where: { id },
      data: updateUserDto,
      select: {
        id: true,
        nome: true,
        email: true,
      },
    });
  }

  remove(id: number) {
    return this.prisma.usuario.delete({
      where: { id },
    });  
  }
}
