export default interface Moradia {
    id: number;
    nome: string;
    descricao: string;
    endereco: string;
    criadoEm?: string;
    donoId: number;
    moradores?: Array<{
        id: number;
    }>;
    regras?: string[];
    comodidades?: string[];
    // Campos adicionais para melhor experiência
    preco?: number;
    vagasDisponiveis?: number;
    totalVagas?: number;
    imagens?: string[];
    avaliacoes?: Array<{
        id: number;
        nota: number;
        comentario: string;
        usuario: string;
        data: string;
    }>;
    localizacao?: {
        latitude: number;
        longitude: number;
    };
}