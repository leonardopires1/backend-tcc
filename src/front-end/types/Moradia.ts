export default interface Moradia {
    id: number;
    nome: string;
    descricao: string;
    endereco: string;
    valorMensalidade: number;
    criadoEm?: string;
    donoId?: number; // pode não vir em alguns selects da API
    // Alguns endpoints retornam o objeto dono ao invés de apenas donoId
    dono?: {
        id: number;
        nome?: string;
        email?: string;
    };
    moradores?: Array<{
        id: number;
    }>;
    regras?: string[];
    comodidades?: string[];
    // Campos adicionais para melhor experiência
    preco?: number; // Mantido para compatibilidade com versões anteriores
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