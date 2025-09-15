import { Moradia } from '../../moradias/entities/moradia.entity';

export class Despesa {
  id: number;
  nome: string;
  valorTotal: number;
  vencimento: Date;
  tipo?: string;
  criadoEm: Date;
  moradiaId: number;

  // Relacionamentos
  moradia: Moradia;
  usuarios: DespesaUsuario[];

  constructor(
    id: number,
    nome: string,
    valorTotal: number,
    vencimento: Date,
    moradiaId: number,
    criadoEm: Date,
    tipo?: string
  ) {
    this.id = id;
    this.nome = nome;
    this.valorTotal = valorTotal;
    this.vencimento = vencimento;
    this.moradiaId = moradiaId;
    this.criadoEm = criadoEm;
    this.tipo = tipo;
    this.usuarios = [];
  }

  // Métodos de negócio
  calcularValorPorUsuario(numeroUsuarios: number): number {
    return this.valorTotal / numeroUsuarios;
  }

  verificarVencimento(): boolean {
    return new Date() > this.vencimento;
  }
}

export class DespesaUsuario {
  id: number;
  valor: number;
  pago: boolean;
  dataPagamento?: Date;
  usuarioId: number;
  despesaId: number;

  // Relacionamentos
  usuario: any; // User - evitando import circular
  despesa: Despesa;

  constructor(
    id: number,
    valor: number,
    usuarioId: number,
    despesaId: number,
    pago: boolean = false,
    dataPagamento?: Date
  ) {
    this.id = id;
    this.valor = valor;
    this.usuarioId = usuarioId;
    this.despesaId = despesaId;
    this.pago = pago;
    this.dataPagamento = dataPagamento;
  }

  // Métodos de negócio
  marcarComoPago(): void {
    this.pago = true;
    this.dataPagamento = new Date();
  }

  calcularAtraso(): number {
    if (!this.despesa) return 0;
    const hoje = new Date();
    const vencimento = this.despesa.vencimento;
    return hoje > vencimento ? Math.ceil((hoje.getTime() - vencimento.getTime()) / (1000 * 60 * 60 * 24)) : 0;
  }
}
