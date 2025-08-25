import { forwardRef, Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UsersModule } from 'src/users/users.module';
import { JwtModule } from '@nestjs/jwt';
import { AuthGuard } from './auth.guard';
import { DatabaseModule } from 'src/database/database.module';
import { EmailModule } from 'src/email/email.module';

@Module({
  imports: [
    DatabaseModule,
    EmailModule,
    forwardRef(() => UsersModule),
    JwtModule.register({
      global: true,
      secret: process.env.SECRET_KEY || 'defaultSecretKey',
      signOptions: { expiresIn: '86400s' },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, AuthGuard],
  exports: [AuthService, AuthGuard],
})
export class AuthModule {}
