import { Test, TestingModule } from '@nestjs/testing';
import { TarefasUsuarioController } from './tarefas-usuario.controller';
import { TarefasUsuarioService } from './tarefas-usuario.service';

describe('TarefasUsuarioController', () => {
  let controller: TarefasUsuarioController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TarefasUsuarioController],
      providers: [TarefasUsuarioService],
    }).compile();

    controller = module.get<TarefasUsuarioController>(TarefasUsuarioController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
