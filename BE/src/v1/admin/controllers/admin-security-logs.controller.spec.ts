import { Test, TestingModule } from '@nestjs/testing';
import { AdminSecurityLogsController } from './admin-security-logs.controller';
import { AdminSecurityLogsService } from '../services/admin-security-logs.service';
import { JwtService } from '@nestjs/jwt';

describe('AdminSecurityLogsController', () => {
  let controller: AdminSecurityLogsController;

  beforeEach(async () => {
    const mockSecurityLogsService = {
      getSecurityLogs: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AdminSecurityLogsController],
      providers: [
        {
          provide: AdminSecurityLogsService,
          useValue: mockSecurityLogsService,
        },
        {
          provide: JwtService,
          useValue: { verifyAsync: jest.fn() },
        },
      ],
    }).compile();

    controller = module.get<AdminSecurityLogsController>(
      AdminSecurityLogsController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
