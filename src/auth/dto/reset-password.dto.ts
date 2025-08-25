import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MinLength, Matches } from 'class-validator';

export class ResetPasswordDto {
  @ApiProperty({
    description: 'Token de recuperação de senha',
    example: 'abc123def456ghi789',
  })
  @IsNotEmpty({ message: 'Token é obrigatório' })
  @IsString({ message: 'Token deve ser uma string' })
  token: string;

  @ApiProperty({
    description: 'Nova senha do usuário',
    example: 'NovaSenha123!',
  })
  @IsNotEmpty({ message: 'Nova senha é obrigatória' })
  @IsString({ message: 'Nova senha deve ser uma string' })
  @MinLength(6, { message: 'Nova senha deve ter pelo menos 6 caracteres' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
    message: 'Nova senha deve conter pelo menos uma letra minúscula, uma maiúscula e um número',
  })
  novaSenha: string;

  @ApiProperty({
    description: 'Confirmação da nova senha',
    example: 'NovaSenha123!',
  })
  @IsNotEmpty({ message: 'Confirmação de senha é obrigatória' })
  @IsString({ message: 'Confirmação de senha deve ser uma string' })
  confirmarNovaSenha: string;
}
