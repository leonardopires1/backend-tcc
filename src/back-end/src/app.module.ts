import { Module } from '@nestjs/common';
import { UsersModule } from './users/users.module';
import { AuthService } from './auth/auth.service';
import { AuthModule } from './auth/auth.module';
import { Prisma } from '@prisma/client';
import { DatabaseModule } from './database/database.module';
import { MoradiasModule } from './moradias/moradias.module';
import { MailModule } from './mail/mail.module';
import { RegraMoradiaModule } from './regra-moradia/regra-moradia.module';
import { RegrasMoradiaController } from './regra-moradia/regra-moradia.controller';

@Module({
  imports: [UsersModule, AuthModule, DatabaseModule, MoradiasModule, MailModule, RegraMoradiaModule],
  controllers: [RegrasMoradiaController],
})
export class AppModule {}
