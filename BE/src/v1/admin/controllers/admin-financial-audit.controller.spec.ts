import { Test, TestingModule } from '@nestjs/testing';
import { AdminFinancialAuditController } from './admin-financial-audit.controller';
import { AdminFinancialAuditService } from '../services/admin-financial-audit.service';
import { JwtService } from '@nestjs/jwt';

describe('AdminFinancialAuditController', () => {
  let controller: AdminFinancialAuditController;
  let service: AdminFinancialAuditService;

  beforeEach(async () => {
    const mockFinancialAuditService = {
      getChipDumpingAlerts: jest.fn().mockResolvedValue([
        {
          dumper: { id: 'user-1', username: 'PlayerA' },
          receiver: { id: 'user-2', username: 'PlayerB' },
          joint_hands: 5,
          total_dumper_bet: 100000,
          total_receiver_won: 95000,
          total_receiver_net: 95000,
          risk_level: 'MEDIUM',
        },
      ]),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AdminFinancialAuditController],
      providers: [
        {
          provide: AdminFinancialAuditService,
          useValue: mockFinancialAuditService,
        },
        {
          provide: JwtService,
          useValue: { verifyAsync: jest.fn() },
        },
      ],
    }).compile();

    controller = module.get<AdminFinancialAuditController>(
      AdminFinancialAuditController,
    );
    service = module.get<AdminFinancialAuditService>(
      AdminFinancialAuditService,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should return chip dumping alerts', async () => {
    const result = await controller.getChipDumpingAlerts();
    expect(result).toHaveProperty('data');
    expect(result.data).toHaveLength(1);
    expect(result.data[0].risk_level).toBe('MEDIUM');
    expect(service.getChipDumpingAlerts).toHaveBeenCalled();
  });
});
