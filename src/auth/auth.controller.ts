import { BadRequestException, Body, Controller, HttpCode, HttpStatus, Inject, Post } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
    @Inject()
    private readonly authService: AuthService;

    @Post('signin')
    @HttpCode(HttpStatus.OK)
    async signin(@Body() body: { email: string; password: string }) {
        const { email, password } = body;
        if (!email || !password) {
            throw new BadRequestException('Email and password are required');
        }
        return await this.authService.signin({ email, password });
    }
}