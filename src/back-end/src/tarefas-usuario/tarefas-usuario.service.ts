import { Injectable } from '@nestjs/common';
import { CreateTarefasUsuarioDto } from './dto/create-tarefas-usuario.dto';
import { UpdateTarefasUsuarioDto } from './dto/update-tarefas-usuario.dto';
import { PrismaService } from 'src/database/prisma.service';

@Injectable()
export class TarefasUsuarioService {
  constructor(private readonly prisma: PrismaService) {}

  create(createTarefasUsuarioDto: CreateTarefasUsuarioDto) {
    return this.prisma.tarefa.create({
      data: {
        ...createTarefasUsuarioDto,
        moradia: {
          connect: { id: createTarefasUsuarioDto.idMoradia }
        }
      }
    });
  }

  findAll() {
    return this.prisma.tarefa.findMany({
      include: {
        atribuicoes: {
          include: {
            usuario: {
              select: {
                id: true,
                nome: true,
                email: true
              }
            }
          }
        }
      }
    });
  }

  findByMoradia(moradiaId: number) {
    return this.prisma.tarefa.findMany({
      where: {
        moradiaId: moradiaId
      },
      include: {
        atribuicoes: {
          include: {
            usuario: {
              select: {
                id: true,
                nome: true,
                email: true
              }
            }
          }
        }
      }
    });
  }

  findOne(id: number) {
    return this.prisma.tarefa.findUnique({
      where: { id }
    });
  }

  update(id: number, updateTarefasUsuarioDto: UpdateTarefasUsuarioDto) {
    return this.prisma.tarefa.update({
      where: { id },
      data: updateTarefasUsuarioDto
    });
  }

  atribuiAoUsuario(idUsuario: number, idTarefas: number[]) {
    return this.prisma.atribuicaoTarefa.createMany({
      data: idTarefas.map(idTarefa => ({
        usuarioId: idUsuario,
        tarefaId: idTarefa,
        concluida: false,
      }))
    });
  }

  remove(id: number) {
    return `This action removes a #${id} tarefasUsuario`;
  }
}
