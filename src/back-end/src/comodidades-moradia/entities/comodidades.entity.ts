export class Comodidades {
  id: number;
  nome: string;
  descricao?: string;
  moradiaId: number;

  // Relacionamentos
  moradia: any; // Moradia - evitando import circular

  constructor(
    id: number,
    nome: string,
    moradiaId: number,
    descricao?: string
  ) {
    this.id = id;
    this.nome = nome;
    this.moradiaId = moradiaId;
    this.descricao = descricao;
  }

  // Métodos de negócio
  atualizarNome(novoNome: string): void {
    this.nome = novoNome;
  }

  atualizarDescricao(novaDescricao: string): void {
    this.descricao = novaDescricao;
  }

  obterInformacoes(): string {
    return `${this.nome}${this.descricao ? ` - ${this.descricao}` : ''}`;
  }
}