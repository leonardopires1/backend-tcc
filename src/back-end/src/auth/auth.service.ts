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
  
  @Injectable()
  export class AuthService {
    @Inject()
    private readonly userService: UsersService;
  
    @Inject()
    private readonly jwtService: JwtService;
  
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
  }