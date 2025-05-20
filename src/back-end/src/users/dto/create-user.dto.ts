export class CreateUserDto {
  nome: string;
  email: string;
  senha: string;
  confirmarSenha: string;
  cpf: string;
  telefone: string;
  genero: 'Feminino' | 'Masculino' | 'Não-binário' | 'Outro';
}
