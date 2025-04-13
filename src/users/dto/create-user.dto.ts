export class CreateUserDto {
  nome: string;
  email: string;
  senha: string;
  cpf: string;
  telefone: string;
  dataNascimento: Date;
  genero: 'Feminino' | 'Masculino' | 'Não-binário' | 'Outro';
}
