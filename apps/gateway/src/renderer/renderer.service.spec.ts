import { Test, TestingModule } from '@nestjs/testing';
import { RenderService } from './renderer.service';

describe('RendererService', () => {
  let service: RenderService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RenderService],
    }).compile();

    service = module.get<RenderService>(RenderService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
