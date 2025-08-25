import { Module } from '@nestjs/common';
import { ComodidadesMoradiaController } from './comodidades-moradia.controller';
import { ComodidadesMoradiaService } from './comodidades-moradia.service';
import { DatabaseModule } from 'src/database/database.module';

@Module({
  controllers: [ComodidadesMoradiaController],
  providers: [ComodidadesMoradiaService],
  imports: [DatabaseModule],
  exports: [ComodidadesMoradiaService],
})
export class ComodidadesMoradiaModule {}
