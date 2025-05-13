import { Test, TestingModule } from '@nestjs/testing';
import { MoradiasController } from './moradias.controller';
import { MoradiasService } from './moradias.service';

describe('MoradiasController', () => {
  let controller: MoradiasController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MoradiasController],
      providers: [MoradiasService],
    }).compile();

    controller = module.get<MoradiasController>(MoradiasController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
