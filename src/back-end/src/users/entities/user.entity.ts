export class User {
    id: number;
    nome: string;
    email: string;
    senha: string;
    cpf: string;
    telefone: string;
    genero: string;
    criadoEm: Date;
    moradiaId?: number;
    resetToken?: string;
    resetTokenExp?: Date;
    avatarUrl?: string;

    // Relacionamentos
    moradiasDono: any[]; // Moradia[] - evitando import circular
    moradia?: any; // Moradia - evitando import circular
    atribuicoesTarefas: any[]; // AtribuicaoTarefa[]
    despesasUsuario: any[]; // DespesaUsuario[]
    moradias: any[]; // Moradia[] - relacionamento moradores

    constructor(
        id: number,
        nome: string,
        email: string,
        senha: string,
        cpf: string,
        telefone: string,
        genero: string,
        criadoEm: Date,
        moradiaId?: number,
        avatarUrl?: string
    ) {
        this.id = id;
        this.nome = nome;
        this.email = email;
        this.senha = senha;
        this.cpf = cpf;
        this.telefone = telefone;
        this.genero = genero;
        this.criadoEm = criadoEm;
        this.moradiaId = moradiaId;
        this.avatarUrl = avatarUrl;
        this.moradiasDono = [];
        this.atribuicoesTarefas = [];
        this.despesasUsuario = [];
        this.moradias = [];
    }

    // Métodos de negócio
    atualizarPerfil(nome?: string, telefone?: string, avatarUrl?: string): void {
        if (nome) this.nome = nome;
        if (telefone) this.telefone = telefone;
        if (avatarUrl) this.avatarUrl = avatarUrl;
    }

    alterarSenha(novaSenha: string): void {
        this.senha = novaSenha;
    }

    definirTokenReset(token: string, expiracao: Date): void {
        this.resetToken = token;
        this.resetTokenExp = expiracao;
    }

    limparTokenReset(): void {
        this.resetToken = undefined;
        this.resetTokenExp = undefined;
    }

    tokenResetValido(): boolean {
        return this.resetToken !== undefined && 
               this.resetTokenExp !== undefined && 
               new Date() < this.resetTokenExp;
    }

    obterIdade(): number {
        // Assumindo que temos data de nascimento (não está no schema atual)
        const hoje = new Date();
        const nascimento = this.criadoEm; // Usando criadoEm como placeholder
        return hoje.getFullYear() - nascimento.getFullYear();
    }
}
