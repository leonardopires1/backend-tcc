import { User } from '../../users/entities/user.entity';
import { Tarefa } from '../../tarefas-usuario/entities/tarefas-usuario.entity';
import { Despesa } from '../../despesas/entities/despesa.entity';
import { RegrasMoradia } from '../../regra-moradia/entities/regras.entity';
import { Comodidades } from '../../comodidades-moradia/entities/comodidades.entity';

export class Moradia {
  id: number;
  nome: string;
  descricao: string;
  endereco?: string;
  criadoEm: Date;
  valorMensalidade: number;
  imagemUrl?: string;
  donoId: number;

  // Relacionamentos
  dono: User;
  moradores: User[];
  usuarios: User[];
  tarefas: Tarefa[];
  despesas: Despesa[];
  regrasMoradia: RegrasMoradia[];
  comodidades: Comodidades[];

  constructor(
    id: number,
    nome: string,
    descricao: string,
    endereco: string,
    criadoEm: Date,
    valorMensalidade: number,
    donoId: number,
    imagemUrl?: string
  ) {
    this.id = id;
    this.nome = nome;
    this.descricao = descricao;
    this.endereco = endereco;
    this.criadoEm = criadoEm;
    this.valorMensalidade = valorMensalidade;
    this.donoId = donoId;
    this.imagemUrl = imagemUrl;
    this.moradores = [];
    this.usuarios = [];
    this.tarefas = [];
    this.despesas = [];
    this.regrasMoradia = [];
    this.comodidades = [];
  }

  // Métodos de negócio
  adicionarMorador(usuario: User): void {
    if (!this.moradores.find(m => m.id === usuario.id)) {
      this.moradores.push(usuario);
    }
  }

  removerMorador(usuarioId: number): void {
    this.moradores = this.moradores.filter(m => m.id !== usuarioId);
  }

  calcularValorPorMorador(): number {
    const numMoradores = this.moradores.length;
    return numMoradores > 0 ? this.valorMensalidade / numMoradores : this.valorMensalidade;
  }

  adicionarTarefa(tarefa: Tarefa): void {
    this.tarefas.push(tarefa);
  }

  adicionarDespesa(despesa: Despesa): void {
    this.despesas.push(despesa);
  }

  adicionarComodidade(comodidade: Comodidades): void {
    this.comodidades.push(comodidade);
  }

  adicionarRegra(regrasMoradia: RegrasMoradia): void {
    this.regrasMoradia.push(regrasMoradia);
  }

  obterTotalDespesasAtivas(): number {
    return this.despesas.reduce((total, despesa) => total + despesa.valorTotal, 0);
  }

  obterTarefasPendentes(): Tarefa[] {
    return this.tarefas.filter(tarefa => 
      tarefa.atribuicoes.some(attr => !attr.concluida)
    );
  }

  atualizarInformacoes(nome?: string, descricao?: string, endereco?: string, valorMensalidade?: number): void {
    if (nome) this.nome = nome;
    if (descricao) this.descricao = descricao;
    if (endereco) this.endereco = endereco;
    if (valorMensalidade) this.valorMensalidade = valorMensalidade;
  }
}
