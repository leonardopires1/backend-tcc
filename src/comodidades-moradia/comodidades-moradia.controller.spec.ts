import { Test, TestingModule } from '@nestjs/testing';
import { ComodidadesMoradiaController } from './comodidades-moradia.controller';

describe('ComodidadesMoradiaController', () => {
  let controller: ComodidadesMoradiaController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ComodidadesMoradiaController],
    }).compile();

    controller = module.get<ComodidadesMoradiaController>(ComodidadesMoradiaController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
