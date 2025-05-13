import { Module } from '@nestjs/common';
import { UsersModule } from './users/users.module';
import { AuthService } from './auth/auth.service';
import { AuthModule } from './auth/auth.module';
import { Prisma } from '@prisma/client';
import { DatabaseModule } from './database/database.module';
import { MoradiasModule } from './moradias/moradias.module';

@Module({
  imports: [UsersModule, AuthModule, DatabaseModule, MoradiasModule],
})
export class AppModule {}
