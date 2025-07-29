import { IsEmail, IsString, MinLength, IsIn, Matches, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({ 
    description: 'Nome completo do usuário',
    example: 'João Silva',
    minLength: 2,
  })
  @IsString({ message: 'Nome deve ser uma string' })
  @MinLength(2, { message: 'Nome deve ter pelo menos 2 caracteres' })
  nome: string;

  @ApiProperty({ 
    description: 'Email do usuário',
    example: 'joao@email.com',
  })
  @IsEmail({}, { message: 'Email deve ter um formato válido' })
  email: string;

  @ApiProperty({ 
    description: 'Senha do usuário',
    example: 'minhasenha123',
    minLength: 6,
  })
  @IsString({ message: 'Senha deve ser uma string' })
  @MinLength(6, { message: 'Senha deve ter pelo menos 6 caracteres' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
    message: 'Senha deve conter pelo menos uma letra maiúscula, uma minúscula e um número',
  })
  senha: string;

  @ApiProperty({ 
    description: 'Confirmação da senha',
    example: 'minhasenha123',
  })
  @IsString({ message: 'Confirmação de senha deve ser uma string' })
  confirmarSenha: string;

  @ApiProperty({ 
    description: 'CPF do usuário (apenas números)',
    example: '12345678901',
    minLength: 11,
    maxLength: 11,
  })
  @IsString({ message: 'CPF deve ser uma string' })
  @Matches(/^\d{11}$/, { message: 'CPF deve conter exatamente 11 dígitos' })
  cpf: string;

  @ApiProperty({ 
    description: 'Telefone do usuário (apenas números)',
    example: '11987654321',
  })
  @IsString({ message: 'Telefone deve ser uma string' })
  @Matches(/^\d{10,11}$/, { message: 'Telefone deve ter 10 ou 11 dígitos' })
  telefone: string;

  @ApiProperty({ 
    description: 'Gênero do usuário',
    example: 'Masculino',
    enum: ['Feminino', 'Masculino', 'Não-binário', 'Outro'],
  })
  @IsIn(['Feminino', 'Masculino', 'Não-binário', 'Outro'], {
    message: 'Gênero deve ser: Feminino, Masculino, Não-binário ou Outro',
  })
  genero: 'Feminino' | 'Masculino' | 'Não-binário' | 'Outro';
}
