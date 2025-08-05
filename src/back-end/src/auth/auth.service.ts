import {
    BadRequestException,
    Inject,
    Injectable,
    NotFoundException,
    UnauthorizedException,
  } from '@nestjs/common';
  import { UsersService } from 'src/users/users.service';
  import * as bcrypt from 'bcrypt';
  import { JwtService } from '@nestjs/jwt';
  import { PrismaService } from 'src/database/prisma.service';
  import { EmailService } from 'src/email/email.service';
  import * as crypto from 'crypto';
  
  @Injectable()
  export class AuthService {
    @Inject()
    private readonly userService: UsersService;
  
    @Inject()
    private readonly jwtService: JwtService;

    @Inject()
    private readonly prisma: PrismaService;

    @Inject()
    private readonly emailService: EmailService;
  
  async signin(
    params: { email: string; senha: string },
  ): Promise<{ access_token: string; user: any }> {
    console.log('🔐 AuthService.signin - params:', params);
    // Normalizar email para lowercase como no cadastro
    const normalizedEmail = params.email.toLowerCase().trim();
    console.log('📧 Email normalizado:', normalizedEmail);
    
    const user = await this.userService.findOne(normalizedEmail);
    if (!user) {
      console.log('❌ Usuário não encontrado para email:', normalizedEmail);
      throw new NotFoundException('Usuário não encontrado');
    }
    
    console.log('✅ Usuário encontrado, verificando senha...');
    const senhaMatch = await bcrypt.compare(params.senha, user.senha);
    if (!senhaMatch) {
      console.log('❌ Senha não confere');
      throw new UnauthorizedException('Credenciais inválidas');
    }
    
    console.log('✅ Senha confere, gerando token...');
    const payload = { sub: user.id };
    const accessToken = await this.jwtService.signAsync(payload);      // Remover senha do retorno
      const { senha, ...userWithoutPassword } = user;
  
      return { 
        access_token: accessToken,
        user: userWithoutPassword,
      };
    }

    async getProfile(userId: number) {
      const user = await this.userService.findOneById(userId);
      if (!user) {
        throw new NotFoundException('Usuário não encontrado');
      }
      
      return user;
    }

    async forgotPassword(email: string): Promise<{ message: string }> {
      console.log('🔑 Iniciando recuperação de senha para:', email);
      
      // Normalizar email
      const normalizedEmail = email.toLowerCase().trim();
      
      // Verificar se usuário existe
      const user = await this.prisma.usuario.findUnique({
        where: { email: normalizedEmail },
        select: { id: true, email: true, nome: true }
      });

      if (!user) {
        // Por segurança, sempre retornar sucesso mesmo se usuário não existir
        console.log('❌ Usuário não encontrado, mas retornando sucesso por segurança');
        return { 
          message: 'Se o email existir em nossa base, você receberá instruções para redefinir sua senha.' 
        };
      }

      // Gerar token de reset
      const resetToken = crypto.randomBytes(32).toString('hex');
      const resetTokenExp = new Date(Date.now() + 3600000); // 1 hora

      // Salvar token no banco
      await this.prisma.usuario.update({
        where: { id: user.id },
        data: {
          resetToken,
          resetTokenExp,
        },
      });

      console.log('✅ Token de reset gerado para usuário:', user.id);
      
      // Enviar email de recuperação
      const emailSent = await this.emailService.sendPasswordResetEmail(
        user.email,
        resetToken,
        user.nome
      );

      if (emailSent) {
        console.log('✅ Email de recuperação enviado para:', user.email);
      } else {
        console.log('⚠️ Falha no envio do email, mas token foi salvo');
      }

      return { 
        message: 'Se o email existir em nossa base, você receberá instruções para redefinir sua senha.',
        // Em desenvolvimento, retornar o token para facilitar testes
        ...(process.env.NODE_ENV === 'development' && { token: resetToken })
      };
    }

    async resetPassword(token: string, novaSenha: string, confirmarNovaSenha: string): Promise<{ message: string }> {
      console.log('🔑 Iniciando reset de senha com token');
      
      // Verificar se senhas coincidem
      if (novaSenha !== confirmarNovaSenha) {
        throw new BadRequestException('Nova senha e confirmação não coincidem');
      }

      // Buscar usuário pelo token
      const user = await this.prisma.usuario.findFirst({
        where: {
          resetToken: token,
          resetTokenExp: {
            gt: new Date(), // Token ainda válido
          },
        },
        select: { id: true, email: true }
      });

      if (!user) {
        throw new BadRequestException('Token inválido ou expirado');
      }

      // Hash da nova senha
      const senhaHash = await bcrypt.hash(novaSenha, 12);

      // Atualizar senha e limpar tokens
      await this.prisma.usuario.update({
        where: { id: user.id },
        data: {
          senha: senhaHash,
          resetToken: null,
          resetTokenExp: null,
        },
      });

      console.log('✅ Senha redefinida com sucesso para usuário:', user.id);

      return { message: 'Senha redefinida com sucesso!' };
    }
  }