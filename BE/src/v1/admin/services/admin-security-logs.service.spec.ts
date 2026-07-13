import { Test, TestingModule } from '@nestjs/testing';
import { AdminSecurityLogsService } from './admin-security-logs.service';

describe('AdminSecurityLogsService', () => {
  let service: AdminSecurityLogsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AdminSecurityLogsService],
    }).compile();

    service = module.get<AdminSecurityLogsService>(AdminSecurityLogsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
