import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import { IS_PUBLIC_KEY } from '../common/decorators/user.decorator';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private reflector: Reflector,
    private configService: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    
    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);
    
    if (!token) {
      throw new UnauthorizedException({
        message: 'Token de acesso não fornecido',
        error: 'missing_token',
        statusCode: 401,
      });
    }

    try {
      const secret = this.configService.get<string>('jwt.secret');
      const payload = await this.jwtService.verifyAsync(token, { secret });
      
      // Anexa o payload completo ao request para acesso posterior
      request['user'] = payload;
      
      console.log('✅ Token validado para usuário:', payload.sub);
    } catch (error) {
      console.log('❌ Erro na validação do token:', error.message);
      
      if (error.name === 'TokenExpiredError') {
        throw new UnauthorizedException({
          message: 'Token expirado',
          error: 'token_expired',
          statusCode: 401,
        });
      } else if (error.name === 'JsonWebTokenError') {
        throw new UnauthorizedException({
          message: 'Token inválido',
          error: 'invalid_token',
          statusCode: 401,
        });
      } else {
        throw new UnauthorizedException({
          message: 'Falha na autenticação',
          error: 'auth_failed',
          statusCode: 401,
        });
      }
    }
    
    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
