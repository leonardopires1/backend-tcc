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
    // First try the Authorization header as usual
    const authHeader = request.headers.authorization;
    if (authHeader) {
      const [type, token] = authHeader.split(' ');
      return type === 'Bearer' ? token : undefined;
    }

    // Fallback: allow token via query parameter (useful for image tags or clients that can't set headers)
    // Accept either `token` or `access_token` as query parameter names
    // Note: This keeps the endpoint protected, but allows the client to pass the JWT in the URL when needed.
    const anyReq = request as any;
    const qp = anyReq.query?.token || anyReq.query?.access_token;
    if (qp && typeof qp === 'string') return qp;

    // Optional: check cookies if present
    const cookieToken = anyReq.cookies?.token || anyReq.cookies?.access_token;
    if (cookieToken && typeof cookieToken === 'string') return cookieToken;

    return undefined;
  }
}
