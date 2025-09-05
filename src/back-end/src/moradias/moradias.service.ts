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
      imagemUrl,
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
          imagemUrl,
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

          comodidades: {
            create: comodidades
              .filter((comodidade) => comodidade.nome && comodidade.nome.trim())
              .map((comodidade) => ({
                nome: comodidade.nome,
                descricao: comodidade.descricao,
              })),
          },
          // REMOVIDO: Dono não é mais automaticamente adicionado como morador
          // Ele pode ser adicionado separadamente se necessário
        },
      });

      console.log(`🏠 Moradia criada: ${novaMoradia.id} - Dono: ${donoId}`);
      
      console.log(`👤 Usuário ${donoId} definido como dono da moradia ${novaMoradia.id}`);

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
        imagemUrl: true, // Incluir imagem da moradia
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
        imagemUrl: true, // Incluir imagem da moradia
        dono: { select: { id: true, nome: true, email: true } },
        moradores: {
          select: { id: true, nome: true, email: true }
        }
      }
    });
    
    return moradias;
  }

  async findByUser(userId: number) {
    // Buscar moradia onde o usuário é morador OU dono
    const usuario = await this.prisma.usuario.findUnique({
      where: { id: userId },
      include: {
        moradia: {
          select: {
            id: true,
            nome: true,
            descricao: true,
            endereco: true,
            valorMensalidade: true,
            imagemUrl: true,
            dono: { select: { id: true, nome: true, email: true } },
            moradores: {
              select: { 
                id: true, 
                nome: true, 
                email: true, 
                telefone: true, 
                genero: true 
              }
            }
          }
        },
        moradiasDono: {
          select: {
            id: true,
            nome: true,
            descricao: true,
            endereco: true,
            valorMensalidade: true,
            imagemUrl: true,
            dono: { select: { id: true, nome: true, email: true } },
            moradores: {
              select: { 
                id: true, 
                nome: true, 
                email: true, 
                telefone: true, 
                genero: true 
              }
            }
          }
        }
      }
    });

    if (!usuario) {
      throw new NotFoundException('Usuário não encontrado');
    }

    // Se é morador de uma moradia, retornar essa moradia
    if (usuario.moradia) {
      return [usuario.moradia];
    }

    // Se é dono de moradias, retornar a primeira (ou todas se necessário)
    if (usuario.moradiasDono && usuario.moradiasDono.length > 0) {
      return usuario.moradiasDono;
    }

    // Usuário não tem moradia
    return [];
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
        imagemUrl: true, // Incluir imagem da moradia
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
    const { nome, endereco, donoId, valorMensalidade, imagemUrl } = updateMoradiaDto;

    const data: any = {
      ...(nome && { nome }),
      ...(endereco && { endereco }),
      ...(valorMensalidade && { valorMensalidade }),
      ...(imagemUrl !== undefined && { imagemUrl }), // Permite atualizar imagemUrl mesmo que seja null
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
          imagemUrl: true, // Incluir imagem da moradia
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
      include: {
        moradiasDono: true, // Incluir moradias onde é dono
      }
    });

    if (!usuario) {
      throw new HttpException('Usuário não encontrado', HttpStatus.NOT_FOUND);
    }

    // Verificar se o usuário já é dono desta moradia específica
    const jaDonoDesta = usuario.moradiasDono.some(m => m.id === moradiaId);
    if (jaDonoDesta) {
      throw new HttpException('Usuário é dono desta moradia e não pode ser adicionado como morador', HttpStatus.BAD_REQUEST);
    }

    // Verificar se o usuário já está em uma moradia COMO MORADOR (não como dono)
    if (usuario.moradiaId) {
      throw new HttpException('Usuário já faz parte de uma moradia como morador', HttpStatus.BAD_REQUEST);
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
          imagemUrl: true, // Incluir imagem da moradia
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
            imagemUrl: true, // Incluir imagem da moradia
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
