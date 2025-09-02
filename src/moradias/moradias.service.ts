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
      valorMensalidade,
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

    // Verifica se algum morador já está em outra moradia (exclui o dono da verificação)
    const moradoresOcupados = await this.prisma.usuario.findMany({
      where: {
        id: { in: moradoresIds },
        moradiaId: { not: null },
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

    // Usar transação para garantir que tudo seja feito atomicamente
    const resultado = await this.prisma.$transaction(async (prisma) => {
      // Cria a moradia
      const novaMoradia = await prisma.moradia.create({
        data: {
          nome,
          endereco,
          valorMensalidade,
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
          // Adiciona o dono como morador na criação
          moradores: {
            connect: { id: donoId },
          },
        },
      });

      console.log(`🏠 Moradia criada: ${novaMoradia.id} - Dono: ${donoId}`);

      // Atualiza o usuário dono para vinculá-lo à nova moradia
      await prisma.usuario.update({
        where: { id: donoId },
        data: {
          moradiaId: novaMoradia.id,
        },
      });

      console.log(`👤 Usuário ${donoId} vinculado à moradia ${novaMoradia.id}`);

      // Atualiza os demais usuários para vinculá-los à nova moradia (se houver)
      if (moradoresIds.length > 0) {
        await Promise.all(
          moradoresIds.map((id) =>
            prisma.usuario.update({
              where: { id },
              data: {
                moradiaId: novaMoradia.id,
              },
            }),
          ),
        );

        // Conecta os demais moradores ao relacionamento
        await prisma.moradia.update({
          where: { id: novaMoradia.id },
          data: {
            moradores: {
              connect: moradoresIds.map((id) => ({ id })),
            },
          },
        });

        console.log(`👥 ${moradoresIds.length} moradores adicionais vinculados à moradia ${novaMoradia.id}`);
      }

      return novaMoradia;
    });

    // Registra regras fora da transação (se necessário)
    if (regras.id.length > 0) {
      await this.regrasMoradiaService.registerRegraMoradia(
        resultado.id,
        regras.id,
      );
    }

    // Adiciona comodidades fora da transação (se necessário)
    if (comodidades.length > 0 && comodidades[0].nome) {
      await Promise.all(
        comodidades.map((comodidade) =>
          this.comodidadesMoradiaService.addComodidadeToMoradia(
            resultado.id,
            { nome: comodidade.nome, descricao: comodidade.descricao || '' }
          )
        )
      );
    }

    return resultado;
  }

  async findAll() {
    return this.prisma.moradia.findMany({
      select: {
        id: true,
        nome: true,
        descricao: true,
        endereco: true,
        valorMensalidade: true,
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

  async findAllByDono(donoId: number) {
    // Usuário pode ser dono de múltiplas moradias, usamos findMany
    const moradias = await this.prisma.moradia.findMany({
      where: { donoId },
      select: {
        id: true,
        nome: true,
        descricao: true,
        endereco: true,
        valorMensalidade: true,
        dono: { select: { id: true, nome: true, email: true } },
        moradores: {
          select: { id: true, nome: true, email: true }
        }
      }
    });
    
    return moradias;
  }

  async findOne(id: number) {
    const moradia = await this.prisma.moradia.findUnique({
      where: { id },
      select: {
        id: true,
        nome: true,
        endereco: true,
        descricao: true,
        valorMensalidade: true,
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
    const { nome, endereco, donoId, valorMensalidade } = updateMoradiaDto;

    const data: any = {
      ...(nome && { nome }),
      ...(endereco && { endereco }),
      ...(valorMensalidade && { valorMensalidade }),
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
          valorMensalidade: true,
          dono: { select: { id: true, nome: true, email: true } },
        },
      });
    } catch {
      throw new NotFoundException(
        'Moradia não encontrada ou erro ao atualizar',
      );
    }
  }

  async adicionarMembro(moradiaId: number, usuarioId: number) {
    // Verificar se a moradia existe
    const moradia = await this.prisma.moradia.findUnique({
      where: { id: moradiaId },
      include: { 
        moradores: true,
        _count: {
          select: {
            moradores: true,
          },
        },
      },
    });

    if (!moradia) {
      throw new HttpException('Moradia não encontrada', HttpStatus.NOT_FOUND);
    }

    // Verificar se já não atingiu o limite de 4 moradores
    if (moradia.moradores.length >= 4) {
      throw new HttpException('Moradia já possui o número máximo de moradores (4)', HttpStatus.BAD_REQUEST);
    }

    // Verificar se o usuário existe
    const usuario = await this.prisma.usuario.findUnique({
      where: { id: usuarioId },
    });

    if (!usuario) {
      throw new HttpException('Usuário não encontrado', HttpStatus.NOT_FOUND);
    }

    // Verificar se o usuário já está em uma moradia
    if (usuario.moradiaId) {
      throw new HttpException('Usuário já faz parte de uma moradia', HttpStatus.BAD_REQUEST);
    }

    // Verificar se o usuário já é morador desta moradia
    const jaEhMorador = moradia.moradores.some(morador => morador.id === usuarioId);
    if (jaEhMorador) {
      throw new HttpException('Usuário já é morador desta moradia', HttpStatus.BAD_REQUEST);
    }

    // Usar transação para garantir consistência
    const resultado = await this.prisma.$transaction(async (prisma) => {
      // Atualizar o usuário para vincular à moradia
      await prisma.usuario.update({
        where: { id: usuarioId },
        data: { moradiaId: moradiaId },
      });

      // Adicionar o usuário ao relacionamento de moradores
      await prisma.moradia.update({
        where: { id: moradiaId },
        data: {
          moradores: {
            connect: { id: usuarioId },
          },
        },
      });

      // Retornar a moradia atualizada com os novos dados
      return await prisma.moradia.findUnique({
        where: { id: moradiaId },
        select: {
          id: true,
          nome: true,
          endereco: true,
          valorMensalidade: true,
          moradores: {
            select: {
              id: true,
              nome: true,
              email: true,
              telefone: true,
              genero: true,
            },
          },
          _count: {
            select: {
              moradores: true,
            },
          },
        },
      });
    });

    return resultado;
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
