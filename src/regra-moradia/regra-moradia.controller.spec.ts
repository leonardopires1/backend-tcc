import { Test, TestingModule } from '@nestjs/testing';
import { RegrasMoradiaController } from './regra-moradia.controller';

describe('RegrasMoradiaController', () => {
  let controller: RegrasMoradiaController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RegrasMoradiaController],
    }).compile();

    controller = module.get<RegrasMoradiaController>(RegrasMoradiaController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
