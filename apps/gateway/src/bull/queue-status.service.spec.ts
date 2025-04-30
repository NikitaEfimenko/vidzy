import { Test, TestingModule } from '@nestjs/testing';
import { QueueStatusService } from './queue-status.service';

describe('QueueStatusService', () => {
  let service: QueueStatusService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [QueueStatusService],
    }).compile();

    service = module.get<QueueStatusService>(QueueStatusService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
