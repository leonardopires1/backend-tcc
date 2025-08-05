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
import { RegraMoradiaService } from 'src/regra-moradia/regra-moradia.service';
import { ComodidadesMoradiaService } from 'src/comodidades-moradia/comodidades-moradia.service';

@Injectable()
export class MoradiasService {
  @Inject()
  private readonly prisma: PrismaService;
  @Inject()
  private readonly regrasMoradiaService: RegraMoradiaService;
  @Inject()
  private readonly comodidadesMoradiaService: ComodidadesMoradiaService;

  async create(createMoradiaDto: CreateMoradiaDto) {
    const {
      nome,
      endereco,
      donoId,
      moradoresIds = [],
      tarefas = [],
      despesas = [],
      regras = { id: [] },
      comodidades = [{ nome: '', descricao: '' }],
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
      },
    });

    if (regras.id.length > 0) {
      await this.regrasMoradiaService.registerRegraMoradia(
        novaMoradia.id,
        regras.id,
      );
    }

    if (comodidades.length > 0) {
      await Promise.all(
        comodidades.map((comodidade) =>
          this.comodidadesMoradiaService.addComodidadeToMoradia(
            novaMoradia.id,
            { nome: comodidade.nome, descricao: comodidade.descricao || '' }
          )
        )
      );
    }

    // Atualiza o usuário dono para vinculá-lo à nova moradia
    await this.prisma.usuario.update({
      where: { id: donoId },
      data: {
        moradiaId: novaMoradia.id,
      },
    });

    // Conecta o dono ao relacionamento de moradores
    await this.prisma.moradia.update({
      where: { id: novaMoradia.id },
      data: {
        moradores: {
          connect: { id: donoId },
        },
      },
    });

    // Atualiza os demais usuários para vinculá-los à nova moradia (se houver)
    await Promise.all(
      moradoresIds.map((id) =>
        this.prisma.usuario.update({
          where: { id },
          data: {
            moradiaId: novaMoradia.id,
          },
        }),
      ),
    );

    // Conecta os demais moradores ao relacionamento (se houver)
    if (moradoresIds.length > 0) {
      await this.prisma.moradia.update({
        where: { id: novaMoradia.id },
        data: {
          moradores: {
            connect: moradoresIds.map((id) => ({ id })),
          },
        },
      });
    }

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
        moradores: { 
          select: { 
            id: true, 
            nome: true, 
            email: true 
          } 
        },
        _count: {
          select: {
            moradores: true,
          },
        },
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
        comodidades: true,
        dono: { select: { id: true, nome: true, email: true } },
        moradores: { 
          select: { 
            id: true, 
            nome: true, 
            email: true, 
            telefone: true 
          } 
        },
        _count: {
          select: {
            moradores: true,
            tarefas: true,
            despesas: true,
          },
        },
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
    console.log(`🗑️  Iniciando remoção da moradia ID: ${id}`);
    
    try {
      // Inicia uma transação com timeout estendido (30 segundos)
      const result = await this.prisma.$transaction(async (prisma) => {
        const moradiaRemovida = await prisma.moradia.delete({
          where: {
            id,
          },
          select: {
            id: true,
            nome: true,
            endereco: true,
          },
        });
        console.log(`✅ Moradia removida:`, moradiaRemovida);

        return moradiaRemovida;
      }, {
        timeout: 30000, // 30 segundos de timeout
        maxWait: 10000, // Máximo 10 segundos para conseguir uma conexão
      });

      console.log(`🎉 Moradia ${id} removida com sucesso!`);
      return result;
    } catch (error) {
      console.error(`❌ Erro ao remover moradia ${id}:`, error);
      console.error(`❌ Stack trace:`, error.stack);
      throw new NotFoundException('Moradia não encontrada ou erro ao remover');
    }
  }
}
