export class Regras {
  id: number;
  titulo: string;
  descricao?: string;

  // Relacionamentos
  regrasMoradia: RegrasMoradia[];

  constructor(
    id: number,
    titulo: string,
    descricao?: string
  ) {
    this.id = id;
    this.titulo = titulo;
    this.descricao = descricao;
    this.regrasMoradia = [];
  }

  // Métodos de negócio
  atualizarTitulo(novoTitulo: string): void {
    this.titulo = novoTitulo;
  }

  atualizarDescricao(novaDescricao: string): void {
    this.descricao = novaDescricao;
  }
}

export class RegrasMoradia {
  id: number;
  moradiaId: number;
  regraId: number;

  // Relacionamentos
  moradia: any; // Moradia - evitando import circular
  regra: Regras;

  constructor(
    id: number,
    moradiaId: number,
    regraId: number
  ) {
    this.id = id;
    this.moradiaId = moradiaId;
    this.regraId = regraId;
  }
}