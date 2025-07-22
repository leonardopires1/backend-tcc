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
      console.log('params', params);
      const user = await this.userService.findOne(params.email);
      if (!user) throw new NotFoundException('Usuário não encontrado');
  
      if (!user.senha) {
        throw new UnauthorizedException('Senha não cadastrada para este usuário');
      }
  
      const senhaMatch = await bcrypt.compare(params.senha, user.senha);
      if (!senhaMatch) throw new UnauthorizedException('Credenciais inválidas');
  
      const payload = { sub: user.id };
      const accessToken = await this.jwtService.signAsync(payload);

      // Remover senha do retorno
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