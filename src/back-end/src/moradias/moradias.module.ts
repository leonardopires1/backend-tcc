import { Module } from '@nestjs/common';
import { MoradiasService } from './moradias.service';
import { MoradiasController } from './moradias.controller';
import { DatabaseModule } from 'src/database/database.module';
import { RegraMoradiaModule } from 'src/regra-moradia/regra-moradia.module';
import { ComodidadesMoradiaModule } from 'src/comodidades-moradia/comodidades-moradia.module';

@Module({
  imports: [DatabaseModule, RegraMoradiaModule, ComodidadesMoradiaModule],
  controllers: [MoradiasController],
  providers: [MoradiasService],
  exports: [MoradiasService],
})
export class MoradiasModule {}
