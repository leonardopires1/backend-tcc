import { Test, TestingModule } from '@nestjs/testing';
import { TarefasUsuarioService } from './tarefas-usuario.service';

describe('TarefasUsuarioService', () => {
  let service: TarefasUsuarioService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TarefasUsuarioService],
    }).compile();

    service = module.get<TarefasUsuarioService>(TarefasUsuarioService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
