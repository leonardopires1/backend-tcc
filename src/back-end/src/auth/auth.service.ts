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
  
    @Inject('')
    private readonly jwtService: JwtService;
  
    async signin(
      params: { email: string; password: string },
    ): Promise<{ access_token: string }> {
      const user = await this.userService.findOne(params.email);
      if (!user) throw new NotFoundException('User not found');

      if (!user.senha)
        throw new BadRequestException('User password is missing');

      const passwordMatch = await bcrypt.compare(params.password, user.senha);
      if (!passwordMatch) throw new UnauthorizedException('Invalid credentials');
  
      const payload = { sub: user.id };
  
      return { access_token: await this.jwtService.signAsync(payload) };
    }
  }