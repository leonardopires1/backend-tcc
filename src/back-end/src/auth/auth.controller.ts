import { 
  Body, 
  Controller, 
  HttpCode, 
  HttpStatus, 
  Post,
  Get,
  Request,
  UseGuards,
  UnauthorizedException,
  InternalServerErrorException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { 
  ApiTags, 
  ApiOperation, 
  ApiResponse, 
  ApiBody,
  ApiBearerAuth,
  ApiUnauthorizedResponse,
  ApiBadRequestResponse,
} from '@nestjs/swagger';
import { IsEmail, IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ThrottlerGuard } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { AuthGuard } from './auth.guard';
import { Public } from '../common/decorators/user.decorator';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';

class SignInDto {
  @ApiProperty({ 
    description: 'Email do usuário',
    example: 'usuario@email.com',
  })
  @IsEmail({}, { message: 'Email deve ter um formato válido' })
  @IsNotEmpty({ message: 'Email é obrigatório' })
  email: string;

  @ApiProperty({ 
    description: 'Senha do usuário',
    example: 'minhasenha123',
  })
  @IsString({ message: 'Senha deve ser uma string' })
  @IsNotEmpty({ message: 'Senha é obrigatória' })
  senha: string;
}

class LoginResponseDto {
  access_token: string;
  user: {
    id: number;
    nome: string;
    email: string;
  };
}

class ProfileResponseDto {
  id: number;
  nome: string;
  email: string;
  cpf: string;
  telefone: string;
  genero: string;
  criadoEm: Date;
}

@ApiTags('Autenticação')
@Controller('auth')
@UseGuards(ThrottlerGuard)
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('signin')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Autenticar usuário',
    description: 'Realiza login do usuário e retorna um token JWT para autenticação',
  })
  @ApiBody({
    description: 'Credenciais de login do usuário',
    schema: {
      type: 'object',
      properties: {
        email: { 
          type: 'string', 
          format: 'email',
          example: 'usuario@email.com',
          description: 'Email do usuário cadastrado',
        },
        senha: { 
          type: 'string', 
          example: 'minhasenha123',
          description: 'Senha do usuário',
        },
      },
      required: ['email', 'senha'],
    },
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Login realizado com sucesso',
    type: LoginResponseDto,
    schema: {
      type: 'object',
      properties: {
        access_token: {
          type: 'string',
          example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
          description: 'Token JWT para autenticação',
        },
        user: {
          type: 'object',
          properties: {
            id: { type: 'number', example: 1 },
            nome: { type: 'string', example: 'João Silva' },
            email: { type: 'string', example: 'joao@email.com' },
          },
        },
      },
    }
  })
  @ApiUnauthorizedResponse({
    description: 'Credenciais inválidas',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 401 },
        message: { type: 'string', example: 'Credenciais inválidas' },
        error: { type: 'string', example: 'Unauthorized' },
      },
    },
  })
  @ApiBadRequestResponse({
    description: 'Dados de entrada inválidos',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 400 },
        message: { 
          type: 'array', 
          items: { type: 'string' },
          example: ['email must be an email', 'senha should not be empty'],
        },
        error: { type: 'string', example: 'Bad Request' },
      },
    },
  })
  @ApiResponse({ status: 429, description: 'Muitas tentativas. Tente novamente mais tarde.' })
  async signin(@Body() signInDto: SignInDto) {
    try {
      console.log('🔐 Dados recebidos no signin:', { 
        email: signInDto.email, 
        senhaLength: signInDto.senha?.length || 0,
        hasEmail: !!signInDto.email,
        hasSenha: !!signInDto.senha 
      });
      
      return await this.authService.signin(signInDto);
    } catch (error) {
      console.log('❌ Erro no signin controller:', error.message);
      // Não mascarar erros específicos do auth service
      if (error instanceof UnauthorizedException || 
          error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Erro interno no servidor');
    }
  }

  @UseGuards(AuthGuard)
  @Get('profile')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Obter perfil do usuário',
    description: 'Retorna os dados completos do perfil do usuário autenticado',
  })
  @ApiResponse({
    status: 200,
    description: 'Perfil do usuário retornado com sucesso',
    type: ProfileResponseDto,
    schema: {
      type: 'object',
      properties: {
        id: { type: 'number', example: 1 },
        nome: { type: 'string', example: 'João Silva' },
        email: { type: 'string', example: 'joao@email.com' },
        cpf: { type: 'string', example: '12345678901' },
        telefone: { type: 'string', example: '11987654321' },
        genero: { type: 'string', example: 'Masculino' },
        criadoEm: { type: 'string', format: 'date-time', example: '2024-01-01T10:00:00Z' },
      },
    },
  })
  @ApiUnauthorizedResponse({
    description: 'Token inválido ou expirado',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 401 },
        message: { type: 'string', example: 'Token inválido ou expirado' },
        error: { type: 'string', example: 'Unauthorized' },
      },
    },
  })
  async getProfile(@Request() req) {
    try {
      return await this.authService.getProfile(req.user.sub);
    } catch (error) {
      throw new UnauthorizedException('Erro ao obter perfil do usuário');
    }
  }

  @Public()
  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Solicitar recuperação de senha',
    description: 'Envia email com instruções para redefinir senha do usuário',
  })
  @ApiBody({
    description: 'Email do usuário para recuperação',
    type: ForgotPasswordDto,
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Solicitação de recuperação processada',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'Se o email existir em nossa base, você receberá instruções para redefinir sua senha.',
        },
      },
    }
  })
  @ApiResponse({ status: 429, description: 'Muitas tentativas. Tente novamente mais tarde.' })
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    try {
      console.log('📧 Solicitação de recuperação de senha para:', forgotPasswordDto.email);
      return await this.authService.forgotPassword(forgotPasswordDto.email);
    } catch (error) {
      console.log('❌ Erro na recuperação de senha:', error.message);
      throw new InternalServerErrorException('Erro interno no servidor');
    }
  }

  @Public()
  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Redefinir senha',
    description: 'Redefine a senha do usuário usando o token de recuperação',
  })
  @ApiBody({
    description: 'Dados para redefinição de senha',
    type: ResetPasswordDto,
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Senha redefinida com sucesso',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'Senha redefinida com sucesso!',
        },
      },
    }
  })
  @ApiBadRequestResponse({
    description: 'Token inválido ou dados incorretos',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 400 },
        message: { type: 'string', example: 'Token inválido ou expirado' },
        error: { type: 'string', example: 'Bad Request' },
      },
    },
  })
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    try {
      console.log('🔑 Redefinição de senha solicitada');
      return await this.authService.resetPassword(
        resetPasswordDto.token,
        resetPasswordDto.novaSenha,
        resetPasswordDto.confirmarNovaSenha
      );
    } catch (error) {
      console.log('❌ Erro na redefinição de senha:', error.message);
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException('Erro interno no servidor');
    }
  }
}