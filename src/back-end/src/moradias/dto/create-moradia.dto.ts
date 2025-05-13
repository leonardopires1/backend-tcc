export class CreateMoradiaDto {
  nome: string;
  endereco?: string;
  donoId: number;
  moradoresIds: number[];
  tarefas: {
    nome: string;
    descricao?: string;
    recorrencia: string;
  }[];
  despesas: {
    nome: string;
    valorTotal: number;
    vencimento: Date;
    tipo?: string;
  }[];
}
