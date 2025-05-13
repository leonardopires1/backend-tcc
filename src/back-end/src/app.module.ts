import { Module } from '@nestjs/common';
import { UsersModule } from './users/users.module';
import { AuthService } from './auth/auth.service';
import { AuthModule } from './auth/auth.module';
import { Prisma } from '@prisma/client';
import { DatabaseModule } from './database/database.module';

@Module({
  imports: [UsersModule, AuthModule, DatabaseModule],
})
export class AppModule {}
