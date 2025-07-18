import { Module } from '@nestjs/common';
import { RegraMoradiaService } from './regra-moradia.service';

@Module({
  providers: [RegraMoradiaService]
})
export class RegraMoradiaModule {}
