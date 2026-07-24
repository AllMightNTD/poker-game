import { ConfigService } from '@nestjs/config';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Test, TestingModule } from '@nestjs/testing';
import { DataSource } from 'typeorm';
import { PokerTable } from '../entities/poker_table.entity';
import { CloseReason } from '../enums/close-reason.enum';
import { RoomCleanupService } from './poker-cleanup.service';
import { PokerGameService } from './poker-game.service';
import { PokerLobbyService } from './poker-lobby.service';
import { PokerStateService } from './poker-state.service';
import { PokerStreamService } from './poker-stream.service';
import { ProvablyFairService } from './provably-fair.service';

jest.mock('../entities/table_session.entity', () => ({
  TableSession: {
    find: jest.fn().mockResolvedValue([]),
    findOne: jest.fn(),
    count: jest.fn().mockResolvedValue(0),
  },
}));

jest.mock('../entities/poker_table.entity', () => ({
  PokerTable: {
    find: jest.fn().mockResolvedValue([]),
    findOne: jest.fn(),
  },
}));

describe('RoomCleanupService & Poker Auto-Close Suite', () => {
  let cleanupService: RoomCleanupService;
  let gameService: PokerGameService;
  let stateService: jest.Mocked<any>;
  let lobbyService: jest.Mocked<any>;

  const mockServer = {
    to: jest.fn().mockImplementation(() => ({
      emit: jest.fn(),
    })),
    in: jest.fn().mockImplementation(() => ({
      fetchSockets: jest.fn().mockResolvedValue([]),
    })),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    stateService = {
      getTableState: jest.fn(),
      setTableState: jest.fn().mockResolvedValue(undefined),
      deleteAllTableKeys: jest.fn().mockResolvedValue(undefined),
      deleteActionLogs: jest.fn().mockResolvedValue(undefined),
      getTableSnapshot: jest
        .fn()
        .mockResolvedValue({ tableState: null, seats: [] }),
      getAllSeats: jest.fn().mockResolvedValue([]),
      acquireLock: jest.fn().mockResolvedValue(true),
      releaseLock: jest.fn().mockResolvedValue(true),
      getRedisClient: jest.fn().mockReturnValue({
        pipeline: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue([]),
        }),
      }),
    };

    lobbyService = {
      leaveRoom: jest.fn().mockResolvedValue(true),
    };

    const configServiceMock = {
      get: jest.fn((key: string, defaultVal: any) => defaultVal),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RoomCleanupService,
        PokerGameService,
        { provide: PokerLobbyService, useValue: lobbyService },
        { provide: PokerStateService, useValue: stateService },
        { provide: ConfigService, useValue: configServiceMock },
        {
          provide: PokerStreamService,
          useValue: { streamStackChange: jest.fn() },
        },
        { provide: EventEmitter2, useValue: { emit: jest.fn() } },
        { provide: ProvablyFairService, useValue: {} },
        { provide: DataSource, useValue: {} },
        {
          provide: 'BullQueue_poker-game-history',
          useValue: {
            add: jest.fn(),
          },
        },
      ],
    }).compile();

    cleanupService = module.get<RoomCleanupService>(RoomCleanupService);
    gameService = module.get<PokerGameService>(PokerGameService);
    gameService.setServer(mockServer as any);
  });

  afterEach(() => {
    cleanupService.onModuleDestroy();
    gameService.onModuleDestroy();
  });

  describe('Case 1: No player joined new room (>5m)', () => {
    it('should destroy room if created > 5 minutes ago and 0 players joined', async () => {
      const mockTable = {
        id: 'room_1',
        owner_id: 'user_1',
        is_active: true,
        created_at: new Date(Date.now() - 6 * 60 * 1000), // created 6m ago
      };

      (PokerTable.find as jest.Mock).mockResolvedValue([mockTable]);
      stateService.getTableState.mockResolvedValue({ game_stage: 'waiting' });
      stateService.getAllSeats.mockResolvedValue([]);

      const destroySpy = jest
        .spyOn(gameService, 'destroyRoom')
        .mockResolvedValue(undefined);

      await cleanupService.runCleanupCheck();

      expect(destroySpy).toHaveBeenCalledWith(
        'room_1',
        CloseReason.NO_PLAYER_JOIN,
      );
    });
  });

  describe('Case 2: Empty Room (Player count = 0)', () => {
    it('should trigger startRoomClosing with 30s countdown when room becomes empty', async () => {
      const mockTable = {
        id: 'room_2',
        owner_id: 'user_1',
        is_active: true,
        created_at: new Date(Date.now() - 2 * 60 * 1000), // created 2m ago
      };

      (PokerTable.find as jest.Mock).mockResolvedValue([mockTable]);
      stateService.getTableState.mockResolvedValue({ game_stage: 'waiting' });
      stateService.getAllSeats.mockResolvedValue([]);

      const startClosingSpy = jest
        .spyOn(gameService, 'startRoomClosing')
        .mockResolvedValue(undefined);

      await cleanupService.runCleanupCheck();

      expect(startClosingSpy).toHaveBeenCalledWith(
        'room_2',
        CloseReason.EMPTY_ROOM,
        30,
      );
    });
  });

  describe('Case 3: Idle Table (>20m without hand activity)', () => {
    it('should start 60s countdown if table is idle for > 20 minutes', async () => {
      const mockTable = {
        id: 'room_3',
        owner_id: 'user_1',
        is_active: true,
        created_at: new Date(Date.now() - 30 * 60 * 1000),
      };

      (PokerTable.find as jest.Mock).mockResolvedValue([mockTable]);
      stateService.getTableState.mockResolvedValue({
        game_stage: 'waiting',
        last_hand_at: (Date.now() - 25 * 60 * 1000).toString(), // 25 mins ago
      });
      stateService.getAllSeats.mockResolvedValue([
        { user_id: 'u1', status: 'active' },
        { user_id: 'u2', status: 'active' },
      ]);

      jest.spyOn(gameService, 'isUserConnectedToRoom').mockResolvedValue(true);
      const startClosingSpy = jest
        .spyOn(gameService, 'startRoomClosing')
        .mockResolvedValue(undefined);

      await cleanupService.runCleanupCheck();

      expect(startClosingSpy).toHaveBeenCalledWith(
        'room_3',
        CloseReason.IDLE_TIMEOUT,
        60,
      );
    });
  });

  describe('Case 4: All Sit Out', () => {
    it('should start 2m countdown when all seated players are sit out', async () => {
      const mockTable = {
        id: 'room_4',
        owner_id: 'user_1',
        is_active: true,
        created_at: new Date(Date.now() - 10 * 60 * 1000),
      };

      (PokerTable.find as jest.Mock).mockResolvedValue([mockTable]);
      stateService.getTableState.mockResolvedValue({
        game_stage: 'waiting',
        last_activity: (Date.now() - 15000).toString(),
      });
      stateService.getAllSeats.mockResolvedValue([
        { user_id: 'u1', status: 'sitting_out' },
        { user_id: 'u2', status: 'sitting_out' },
      ]);

      jest.spyOn(gameService, 'isUserConnectedToRoom').mockResolvedValue(true);
      const startClosingSpy = jest
        .spyOn(gameService, 'startRoomClosing')
        .mockResolvedValue(undefined);

      await cleanupService.runCleanupCheck();

      expect(startClosingSpy).toHaveBeenCalledWith(
        'room_4',
        CloseReason.ALL_SIT_OUT,
        120,
      );
    });
  });

  describe('Case 5: Owner Disconnected', () => {
    it('should start 5m countdown if owner is disconnected from room socket', async () => {
      const mockTable = {
        id: 'room_5',
        owner_id: 'owner_user',
        is_active: true,
        created_at: new Date(Date.now() - 10 * 60 * 1000),
      };

      (PokerTable.find as jest.Mock).mockResolvedValue([mockTable]);
      stateService.getTableState.mockResolvedValue({ game_stage: 'waiting' });
      stateService.getAllSeats.mockResolvedValue([
        { user_id: 'owner_user', status: 'active' },
        { user_id: 'player_2', status: 'active' },
      ]);

      jest.spyOn(gameService, 'isUserConnectedToRoom').mockResolvedValue(false);
      const startClosingSpy = jest
        .spyOn(gameService, 'startRoomClosing')
        .mockResolvedValue(undefined);

      await cleanupService.runCleanupCheck();

      expect(startClosingSpy).toHaveBeenCalledWith(
        'room_5',
        CloseReason.OWNER_TIMEOUT,
        300,
      );
    });
  });

  describe('Case 6: Room Lifetime Exceeded (> 24h)', () => {
    it('should set is_expired=1 and destroy room immediately if not in hand', async () => {
      const mockTable = {
        id: 'room_6',
        owner_id: 'user_1',
        is_active: true,
        created_at: new Date(Date.now() - 25 * 60 * 60 * 1000), // created 25 hours ago
      };

      (PokerTable.find as jest.Mock).mockResolvedValue([mockTable]);
      stateService.getTableState.mockResolvedValue({ game_stage: 'waiting' });
      stateService.getAllSeats.mockResolvedValue([
        { user_id: 'u1', status: 'active' },
      ]);

      const destroySpy = jest
        .spyOn(gameService, 'destroyRoom')
        .mockResolvedValue(undefined);

      await cleanupService.runCleanupCheck();

      expect(stateService.setTableState).toHaveBeenCalledWith('room_6', {
        is_expired: '1',
      });
      expect(destroySpy).toHaveBeenCalledWith(
        'room_6',
        CloseReason.ROOM_EXPIRED,
      );
    });
  });
});
