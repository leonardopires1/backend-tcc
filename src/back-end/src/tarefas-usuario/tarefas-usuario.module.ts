import { Module } from '@nestjs/common';
import { TarefasUsuarioService } from './tarefas-usuario.service';
import { TarefasUsuarioController } from './tarefas-usuario.controller';
import { DatabaseModule } from 'src/database/database.module';

@Module({
  controllers: [TarefasUsuarioController],
  providers: [TarefasUsuarioService],
  imports: [DatabaseModule],
})
export class TarefasUsuarioModule {}
