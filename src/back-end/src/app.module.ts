import { Module } from '@nestjs/common';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { DatabaseModule } from './database/database.module';
import { MoradiasModule } from './moradias/moradias.module';
import { RegraMoradiaModule } from './regra-moradia/regra-moradia.module';
import { ComodidadesMoradiaModule } from './comodidades-moradia/comodidades-moradia.module';

@Module({
  imports: [
    UsersModule,
    AuthModule,
    DatabaseModule,
    MoradiasModule,
    RegraMoradiaModule,
    ComodidadesMoradiaModule
  ],
})
export class AppModule {}
