import { BadRequestException, Body, Controller, HttpCode, HttpStatus, Inject, Post } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
    @Inject()
    private readonly authService: AuthService;

    @Post('signin')
    @HttpCode(HttpStatus.OK)
    async signin(@Body() body: { email: string; senha: string }) {
        const { email, senha } = body;
        console.log('email', email);
        console.log('senha', senha);
        return await this.authService.signin({ email, senha });
    }
}