export default interface FormData {
    nome: string;
    email: string;
    senha: string;
    confirmarSenha: string;
    cpf: string;
    genero: string;
    telefone: string;
    [key: string]: any; // For any additional fields
}