import { Test, TestingModule } from '@nestjs/testing';
import { AdminHandsService } from './admin-hands.service';

describe('AdminHandsService', () => {
  let service: AdminHandsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AdminHandsService],
    }).compile();

    service = module.get<AdminHandsService>(AdminHandsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
