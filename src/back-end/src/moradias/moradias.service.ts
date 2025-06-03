import {
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateMoradiaDto } from './dto/create-moradia.dto';
import { UpdateMoradiaDto } from './dto/update-moradia.dto';
import { PrismaService } from 'src/database/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class MoradiasService {
  @Inject()
  private readonly prisma: PrismaService;

  async create(createMoradiaDto: CreateMoradiaDto) {
    const {
      nome,
      endereco,
      donoId,
      moradoresIds = [],
      tarefas = [],
      despesas = [],
      regras = { id: [] },
      comodidades = [],
    } = createMoradiaDto;

    // Verifica se o dono existe
    const dono = await this.prisma.usuario.findUnique({
      where: { id: donoId },
    });
    if (!dono) {
      throw new HttpException(
        'Usuário donoId não encontrado.',
        HttpStatus.BAD_REQUEST,
      );
    }

    // Verifica se algum morador já está em outra moradia
    const moradoresOcupados = await this.prisma.usuario.findMany({
      where: {
        id: { in: moradoresIds },
        moradiaId: { not: null }, // Corrigido para usar moradiaId
      },
      select: { id: true },
    });

    if (moradoresOcupados.length > 0) {
      const ids = moradoresOcupados.map((u) => u.id).join(', ');
      throw new HttpException(
        `Usuário(s) já vinculados a outra moradia: ${ids}`,
        HttpStatus.BAD_REQUEST,
      );
    }

    // Cria a moradia (sem moradores ainda)
    const novaMoradia = await this.prisma.moradia.create({
      data: {
        nome,
        endereco,
        dono: { connect: { id: donoId } },
        tarefas: {
          create: tarefas.map((tarefa) => ({
            nome: tarefa.nome,
            descricao: tarefa.descricao,
            recorrencia: tarefa.recorrencia,
          })),
        },
        despesas: {
          create: despesas.map((despesa) => ({
            nome: despesa.nome,
            valorTotal: despesa.valorTotal,
            vencimento: new Date(despesa.vencimento),
            tipo: despesa.tipo,
          })),
        },
        regrasMoradia: {
          connect: regras.id.map((id) => ({ id })),
        },
        comodidades: {
          create: comodidades.map((comodidade) => ({
            nome: comodidade.nome,
            descricao: comodidade.descricao,
          })),
        },
    }});

    // Atualiza os usuários para vinculá-los à nova moradia
    await Promise.all(
      moradoresIds.map((id) =>
        this.prisma.usuario.update({
          where: { id },
          data: {
            moradiaId: novaMoradia.id, // Corrigido para moradiaId
          },
        }),
      ),
    );

    return novaMoradia;
  }

  async findAll() {
    return this.prisma.moradia.findMany({
      select: {
        id: true,
        nome: true,
        descricao: true, 
        endereco: true,
        dono: { select: { id: true, nome: true, email: true } },
      },
    });
  }

  async findOne(id: number) {
    const moradia = await this.prisma.moradia.findUnique({
      where: { id },
      select: {
        id: true,
        nome: true,
        endereco: true,
        descricao: true,
        regrasMoradia: true,
        dono: { select: { id: true, nome: true, email: true } },
      },
    });
    console.log('Moradia encontrada:', moradia);

    if (!moradia) throw new NotFoundException('Moradia não encontrada');
    return moradia;
  }

  async update(id: number, updateMoradiaDto: UpdateMoradiaDto) {
    const { nome, endereco, donoId } = updateMoradiaDto;

    const data: Prisma.MoradiaUpdateInput = {
      ...(nome && { nome }),
      ...(endereco && { endereco }),
      ...(donoId && { dono: { connect: { id: donoId } } }),
    };

    try {
      return await this.prisma.moradia.update({
        where: { id },
        data: data,
        select: {
          id: true,
          nome: true,
          endereco: true,
          dono: { select: { id: true, nome: true, email: true } },
        },
      });
    } catch {
      throw new NotFoundException(
        'Moradia não encontrada ou erro ao atualizar',
      );
    }
  }

  async remove(id: number) {
    try {
      // Inicia uma transação
      const result = await this.prisma.$transaction(async (prisma) => {
        // Primeiro, exclui as tarefas associadas à moradia
        await prisma.tarefa.deleteMany({
          where: {
            moradiaId: id,
          },
        });

        // Em seguida, exclui as despesas associadas à moradia
        await prisma.despesa.deleteMany({
          where: {
            moradiaId: id,
          },
        });

        // Por fim, exclui a moradia
        return prisma.moradia.delete({
          where: {
            id,
          },
          select: {
            id: true,
            nome: true,
            endereco: true,
          },
        });
      });

      return result;
    } catch (error) {
      throw new NotFoundException('Moradia não encontrada ou erro ao remover');
    }
  }
}
