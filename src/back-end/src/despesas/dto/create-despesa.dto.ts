export class CreateDespesaDto {
    titulo: string;
    valorTotal: number;
    vencimento: Date;
    tipo: string;
    idMoradia: number;
    idsUsuarios: number[];
}
