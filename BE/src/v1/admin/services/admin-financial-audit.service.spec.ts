import { Test, TestingModule } from '@nestjs/testing';
import { DataSource } from 'typeorm';
import { AdminFinancialAuditService } from './admin-financial-audit.service';

describe('AdminFinancialAuditService', () => {
  let service: AdminFinancialAuditService;

  const mockDataSource = {
    query: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminFinancialAuditService,
        {
          provide: DataSource,
          useValue: mockDataSource,
        },
      ],
    }).compile();

    service = module.get<AdminFinancialAuditService>(
      AdminFinancialAuditService,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return LOW risk level when net < 100,000 and hands < 5', async () => {
    mockDataSource.query.mockResolvedValue([
      {
        dumper_id: 'u1',
        dumper_username: 'DumperA',
        receiver_id: 'u2',
        receiver_username: 'ReceiverA',
        joint_hands: '3',
        total_dumper_bet: '80000',
        total_receiver_won: '70000',
        total_receiver_net: '70000',
      },
    ]);

    const alerts = await service.getChipDumpingAlerts();
    expect(alerts).toHaveLength(1);
    expect(alerts[0].risk_level).toBe('LOW');
    expect(alerts[0].joint_hands).toBe(3);
    expect(alerts[0].total_receiver_net).toBe(70000);
  });

  it('should return MEDIUM risk level when net >= 100,000 or hands >= 5', async () => {
    mockDataSource.query.mockResolvedValue([
      {
        dumper_id: 'u1',
        dumper_username: 'DumperB',
        receiver_id: 'u2',
        receiver_username: 'ReceiverB',
        joint_hands: '6', // >= 5 hands triggers MEDIUM
        total_dumper_bet: '120000',
        total_receiver_won: '90000',
        total_receiver_net: '90000', // net < 100,000 but hands >= 5
      },
      {
        dumper_id: 'u3',
        dumper_username: 'DumperC',
        receiver_id: 'u4',
        receiver_username: 'ReceiverC',
        joint_hands: '4',
        total_dumper_bet: '150000',
        total_receiver_won: '110000',
        total_receiver_net: '110000', // net >= 100,000 triggers MEDIUM
      },
    ]);

    const alerts = await service.getChipDumpingAlerts();
    expect(alerts).toHaveLength(2);
    expect(alerts[0].risk_level).toBe('MEDIUM');
    expect(alerts[1].risk_level).toBe('MEDIUM');
  });

  it('should return HIGH risk level when net >= 500,000 or hands >= 10', async () => {
    mockDataSource.query.mockResolvedValue([
      {
        dumper_id: 'u1',
        dumper_username: 'DumperD',
        receiver_id: 'u2',
        receiver_username: 'ReceiverD',
        joint_hands: '11', // >= 10 hands triggers HIGH
        total_dumper_bet: '200000',
        total_receiver_won: '150000',
        total_receiver_net: '150000',
      },
      {
        dumper_id: 'u3',
        dumper_username: 'DumperE',
        receiver_id: 'u4',
        receiver_username: 'ReceiverE',
        joint_hands: '4',
        total_dumper_bet: '600000',
        total_receiver_won: '550000',
        total_receiver_net: '550000', // net >= 500,000 triggers HIGH
      },
    ]);

    const alerts = await service.getChipDumpingAlerts();
    expect(alerts).toHaveLength(2);
    expect(alerts[0].risk_level).toBe('HIGH');
    expect(alerts[1].risk_level).toBe('HIGH');
  });

  it('should propagate database query exceptions', async () => {
    mockDataSource.query.mockRejectedValue(new Error('DB connection failed'));
    await expect(service.getChipDumpingAlerts()).rejects.toThrow(
      'DB connection failed',
    );
  });
});
