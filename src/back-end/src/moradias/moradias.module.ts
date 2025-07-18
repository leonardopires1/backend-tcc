import { Module } from '@nestjs/common';
import { MoradiasService } from './moradias.service';
import { MoradiasController } from './moradias.controller';
import { DatabaseModule } from 'src/database/database.module';
import { RegrasMoradiaController } from 'src/regra-moradia/regra-moradia.controller';
import { RegraMoradiaService } from 'src/regra-moradia/regra-moradia.service';
import { ComodidadesMoradiaService } from 'src/comodidades-moradia/comodidades-moradia.service';

@Module({
  imports: [DatabaseModule, RegraMoradiaService, ComodidadesMoradiaService],
  controllers: [MoradiasController],
  providers: [MoradiasService, RegraMoradiaService],
  exports: [MoradiasService],
})
export class MoradiasModule {}
