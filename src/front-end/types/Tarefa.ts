export interface Tarefa {
  id: number;
  nome: string;
  descricao?: string;
  criadoEm: string;
  moradiaId: number;
  atribuicoes?: AtribuicaoTarefa[];
}

export interface AtribuicaoTarefa {
  id: number;
  concluida: boolean;
  tarefaId: number;
  usuarioId: number;
  tarefa?: Tarefa;
}

export interface CreateTarefaDto {
  nome: string;
  descricao?: string;
  idMoradia: number;
}

export interface UpdateTarefaDto {
  nome?: string;
  descricao?: string;
}
