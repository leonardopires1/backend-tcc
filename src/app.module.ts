import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { CacheModule } from '@nestjs/cache-manager';
import { APP_GUARD } from '@nestjs/core';

import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { DatabaseModule } from './database/database.module';
import { MoradiasModule } from './moradias/moradias.module';
import { RegraMoradiaModule } from './regra-moradia/regra-moradia.module';
import { ComodidadesMoradiaModule } from './comodidades-moradia/comodidades-moradia.module';
import { HealthModule } from './health/health.module';

import { AuthGuard } from './auth/auth.guard';
import { appConfig, databaseConfig, jwtConfig } from './config/configuration';
import { TarefasUsuarioModule } from './tarefas-usuario/tarefas-usuario.module';
import { DespesasModule } from './despesas/despesas.module';

@Module({
  imports: [
    // Configuração
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, databaseConfig, jwtConfig],
      envFilePath: '.env',
    }),

    // Rate Limiting
    ThrottlerModule.forRoot([
      {
        ttl: 60000, // 1 minuto
        limit: 100, // 100 requests por minuto
      },
    ]),

    // Cache
    CacheModule.register({
      isGlobal: true,
      ttl: 300, // 5 minutos
      max: 100, // máximo 100 itens em cache
    }),

    // Módulos da aplicação
    UsersModule,
    AuthModule,
    DatabaseModule,
    MoradiasModule,
    RegraMoradiaModule,
    ComodidadesMoradiaModule,
    HealthModule,
    TarefasUsuarioModule,
    DespesasModule,
  ],
  providers: [
    // AuthGuard global (todas as rotas protegidas por padrão)
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
  ],
})
export class AppModule {}
