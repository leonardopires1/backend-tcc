import { Usuario, Moradia } from "@prisma/client";


export class User {
    private id: string;
    private nome: string;
    private email: string;
    private senha: string;
    private cpf: string;
    private telefone: string;
    private dataNascimento: Date;
    private genero: string;
    private criadoEm: Date;
    private moradiaDono: Moradia | null;
    private moradiaMorador: Moradia | null;

    constructor(
        id: string,
        nome: string,
        email: string,
        senha: string,
        cpf: string,
        telefone: string,
        dataNascimento: Date,
        genero: string,
        criadoEm: Date,
        moradiaDono: Moradia | null = null,
        moradiaMorador: Moradia | null = null
    ) {
        this.id = id;
        this.nome = nome;
        this.email = email;
        this.senha = senha;
        this.cpf = cpf;
        this.telefone = telefone;
        this.dataNascimento = dataNascimento;
        this.genero = genero;
        this.criadoEm = criadoEm;
        this.moradiaDono = moradiaDono;
        this.moradiaMorador = moradiaMorador;
    }
}
