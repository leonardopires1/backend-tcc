import { Test, TestingModule } from '@nestjs/testing';
import { MoradiasService } from './moradias.service';

describe('MoradiasService', () => {
  let service: MoradiasService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MoradiasService],
    }).compile();

    service = module.get<MoradiasService>(MoradiasService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
