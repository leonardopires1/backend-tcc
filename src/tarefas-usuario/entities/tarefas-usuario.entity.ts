import { Moradia } from '../../moradias/entities/moradia.entity';

export class Tarefa {
  id: number;
  nome: string;
  descricao?: string;
  criadoEm: Date;
  moradiaId: number;
  
  // Relacionamentos
  moradia: Moradia;
  atribuicoes: AtribuicaoTarefa[];

  constructor(
    id: number,
    nome: string,
    moradiaId: number,
    criadoEm: Date,
    descricao?: string
  ) {
    this.id = id;
    this.nome = nome;
    this.moradiaId = moradiaId;
    this.criadoEm = criadoEm;
    this.descricao = descricao;
    this.atribuicoes = [];
  }
}

export class AtribuicaoTarefa {
  id: number;
  concluida: boolean;
  tarefaId: number;
  usuarioId: number;

  // Relacionamentos
  tarefa: Tarefa;
  usuario: any; // User - evitando import circular

  constructor(
    id: number,
    tarefaId: number,
    usuarioId: number,
    concluida: boolean = false
  ) {
    this.id = id;
    this.tarefaId = tarefaId;
    this.usuarioId = usuarioId;
    this.concluida = concluida;
  }
}
