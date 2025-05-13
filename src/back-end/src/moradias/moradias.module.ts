import { Module } from '@nestjs/common';
import { MoradiasService } from './moradias.service';
import { MoradiasController } from './moradias.controller';
import { DatabaseModule } from 'src/database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [MoradiasController],
  providers: [MoradiasService],
  exports: [MoradiasService],
})
export class MoradiasModule {}
