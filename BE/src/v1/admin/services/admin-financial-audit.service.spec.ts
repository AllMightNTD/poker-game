import { Test, TestingModule } from '@nestjs/testing';
import { AdminFinancialAuditService } from './admin-financial-audit.service';
import { DataSource } from 'typeorm';

describe('AdminFinancialAuditService', () => {
  let service: AdminFinancialAuditService;
  let dataSource: DataSource;

  const mockDataSource = {
    query: jest.fn().mockResolvedValue([
      {
        dumper_id: 'user-1',
        dumper_username: 'PlayerA',
        receiver_id: 'user-2',
        receiver_username: 'PlayerB',
        joint_hands: '5',
        total_dumper_bet: '100000',
        total_receiver_won: '95000',
        total_receiver_net: '95000',
      },
    ]),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminFinancialAuditService,
        {
          provide: DataSource,
          useValue: mockDataSource,
        },
      ],
    }).compile();

    service = module.get<AdminFinancialAuditService>(AdminFinancialAuditService);
    dataSource = module.get<DataSource>(DataSource);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should query and format alerts correctly', async () => {
    const alerts = await service.getChipDumpingAlerts();
    expect(alerts).toHaveLength(1);
    expect(alerts[0].dumper.username).toBe('PlayerA');
    expect(alerts[0].receiver.username).toBe('PlayerB');
    expect(alerts[0].joint_hands).toBe(5);
    expect(alerts[0].total_receiver_net).toBe(95000);
    expect(alerts[0].risk_level).toBe('MEDIUM');
    expect(dataSource.query).toHaveBeenCalled();
  });
});
