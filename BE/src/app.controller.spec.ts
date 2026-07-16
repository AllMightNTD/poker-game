import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppController', () => {
  let appController: AppController;
  let appService: AppService;

  const mockSystemInfo = {
    status: 'ok',
    name: 'Poker Platform API',
    version: '1.0.0',
    environment: 'test',
    uptime: '0h 0m 1s',
    timestamp: '2026-07-16T00:00:00.000Z',
    services: {
      database: 'connected',
      redis: 'connected',
    },
  };

  beforeEach(async () => {
    const mockAppService = {
      getSystemInfo: jest.fn().mockResolvedValue(mockSystemInfo),
    };

    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [{ provide: AppService, useValue: mockAppService }],
    }).compile();

    appController = app.get<AppController>(AppController);
    appService = app.get<AppService>(AppService);
  });

  describe('root', () => {
    it('should return system info with status ok', async () => {
      const result = await appController.getSystemInfo();
      expect(result.status).toBe('ok');
      expect(result.name).toBe('Poker Platform API');
      expect(result.services).toBeDefined();
      expect(result.services.database).toBe('connected');
      expect(result.services.redis).toBe('connected');
      expect(appService.getSystemInfo).toHaveBeenCalled();
    });
  });
});
