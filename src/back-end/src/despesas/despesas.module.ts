import { Module } from '@nestjs/common';
import { DespesasService } from './despesas.service';
import { DespesasController } from './despesas.controller';
import { DatabaseModule } from 'src/database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [DespesasController],
  providers: [DespesasService],
  exports: [DespesasService]
})
export class DespesasModule {}
