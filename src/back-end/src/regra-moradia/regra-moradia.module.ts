import { Module } from '@nestjs/common';
import { RegraMoradiaService } from './regra-moradia.service';
import { RegrasMoradiaController } from './regra-moradia.controller';
import { DatabaseModule } from 'src/database/database.module';

@Module({
  providers: [RegraMoradiaService],
  controllers: [RegrasMoradiaController],
  exports: [RegraMoradiaService],
  imports: [DatabaseModule],
})
export class RegraMoradiaModule {}
