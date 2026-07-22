import { BadRequestException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Test, TestingModule } from '@nestjs/testing';
import { DataSource } from 'typeorm';
import { PokerTable } from '../entities/poker_table.entity';
import { TableSession } from '../entities/table_session.entity';
import { AntiCollusionService } from './anti-collusion.service';
import { PokerGameService } from './poker-game.service';
import { PokerLobbyService } from './poker-lobby.service';
import { PokerStateService } from './poker-state.service';

jest.mock('../entities/table_session.entity', () => ({
  TableSession: {
    findOne: jest.fn(),
  },
}));

jest.mock('../entities/poker_table.entity', () => ({
  PokerTable: {
    findOne: jest.fn(),
  },
}));

jest.mock('../entities/room_admin_log.entity', () => ({
  RoomAdminLog: jest.fn().mockImplementation(() => ({
    save: jest.fn().mockResolvedValue({}),
  })),
}));

describe('Poker Sit-Out & Sit-Back Logic Test Suite', () => {
  let lobbyService: PokerLobbyService;
  let stateService: jest.Mocked<any>;
  let gameService: jest.Mocked<any>;

  const mockRedisClient = {
    hset: jest.fn().mockResolvedValue(1),
    hgetall: jest.fn().mockResolvedValue({}),
    hincrby: jest.fn().mockResolvedValue(1),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    stateService = {
      getAllSeats: jest.fn(),
      setSeat: jest.fn(),
      getTableState: jest.fn(),
      getRedisClient: jest.fn().mockReturnValue(mockRedisClient),
    };

    gameService = {
      processPlayerAction: jest.fn().mockResolvedValue(true),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PokerLobbyService,
        { provide: PokerStateService, useValue: stateService },
        { provide: PokerGameService, useValue: gameService },
        { provide: DataSource, useValue: {} },
        { provide: EventEmitter2, useValue: { emit: jest.fn() } },
        { provide: AntiCollusionService, useValue: {} },
      ],
    }).compile();

    lobbyService = module.get<PokerLobbyService>(PokerLobbyService);
  });

  describe('sitAction - Sit Out', () => {
    it('should set seat status to sitting_out when game is in waiting state', async () => {
      const mockSession = {
        table_id: 'table_1',
        user_id: 'user_1',
        member_status: 'active',
        save: jest.fn().mockResolvedValue(true),
      };
      (TableSession.findOne as jest.Mock).mockResolvedValue(mockSession);

      stateService.getAllSeats.mockResolvedValue([
        { seat_number: 1, user_id: 'user_1', status: 'active' },
      ]);
      stateService.getTableState.mockResolvedValue({
        game_stage: 'waiting',
        current_turn_seat: '0',
      });

      const res = await lobbyService.sitAction('user_1', {
        room_id: 'table_1',
        action: 'sit_out',
      });

      expect(res).toEqual({ success: true, status: 'sitting_out' });
      expect(mockSession.member_status).toBe('sitting_out');
      expect(stateService.setSeat).toHaveBeenCalledWith('table_1', 1, {
        status: 'sitting_out',
      });
      expect(gameService.processPlayerAction).not.toHaveBeenCalled();
    });

    it('should auto-fold active player if sit out is triggered during their turn in active hand', async () => {
      const mockSession = {
        table_id: 'table_1',
        user_id: 'user_1',
        member_status: 'active',
        save: jest.fn().mockResolvedValue(true),
      };
      (TableSession.findOne as jest.Mock).mockResolvedValue(mockSession);

      stateService.getAllSeats.mockResolvedValue([
        { seat_number: 2, user_id: 'user_1', status: 'active' },
      ]);
      stateService.getTableState.mockResolvedValue({
        game_stage: 'flop',
        current_turn_seat: '2',
      });

      const res = await lobbyService.sitAction('user_1', {
        room_id: 'table_1',
        action: 'sit_out',
      });

      expect(res).toEqual({ success: true, status: 'sitting_out' });
      expect(stateService.setSeat).toHaveBeenCalledWith('table_1', 2, {
        status: 'sitting_out',
      });
      expect(gameService.processPlayerAction).toHaveBeenCalledWith(
        'table_1',
        2,
        'fold',
        0,
      );
    });
  });

  describe('sitAction - Sit Back', () => {
    it('should set seat status to active if game stage is waiting', async () => {
      const mockSession = {
        table_id: 'table_1',
        user_id: 'user_1',
        member_status: 'sitting_out',
        save: jest.fn().mockResolvedValue(true),
      };
      (TableSession.findOne as jest.Mock).mockResolvedValue(mockSession);

      stateService.getAllSeats.mockResolvedValue([
        { seat_number: 1, user_id: 'user_1', status: 'sitting_out' },
      ]);
      stateService.getTableState.mockResolvedValue({
        game_stage: 'waiting',
      });

      const res = await lobbyService.sitAction('user_1', {
        room_id: 'table_1',
        action: 'sit_back',
      });

      expect(res).toEqual({ success: true, status: 'active' });
      expect(stateService.setSeat).toHaveBeenCalledWith('table_1', 1, {
        status: 'active',
      });
      expect(mockRedisClient.hset).toHaveBeenCalledWith(
        'table:table_1:player:user_1:stats',
        'consecutive_away_hands',
        '0',
      );
      expect(mockRedisClient.hset).toHaveBeenCalledWith(
        'table:table_1:player:user_1:stats',
        'consecutive_timeouts',
        '0',
      );
    });

    it('should set seat status to waiting_for_next_hand if game is active mid-hand', async () => {
      const mockSession = {
        table_id: 'table_1',
        user_id: 'user_1',
        member_status: 'sitting_out',
        save: jest.fn().mockResolvedValue(true),
      };
      (TableSession.findOne as jest.Mock).mockResolvedValue(mockSession);

      stateService.getAllSeats.mockResolvedValue([
        { seat_number: 1, user_id: 'user_1', status: 'sitting_out' },
      ]);
      stateService.getTableState.mockResolvedValue({
        game_stage: 'turn',
      });

      const res = await lobbyService.sitAction('user_1', {
        room_id: 'table_1',
        action: 'sit_back',
      });

      expect(res).toEqual({ success: true, status: 'waiting_for_next_hand' });
      expect(stateService.setSeat).toHaveBeenCalledWith('table_1', 1, {
        status: 'waiting_for_next_hand',
      });
    });
  });

  describe('forceSitOut', () => {
    it('should throw error if user is not table owner', async () => {
      (PokerTable.findOne as jest.Mock).mockResolvedValue({
        id: 'table_1',
        owner_id: 'owner_user',
      });

      await expect(
        lobbyService.forceSitOut('other_user', 'table_1', 'target_user'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should force sit out target user and fold if active on turn', async () => {
      (PokerTable.findOne as jest.Mock).mockResolvedValue({
        id: 'table_1',
        owner_id: 'owner_user',
      });

      const mockSession = {
        table_id: 'table_1',
        user_id: 'target_user',
        member_status: 'active',
        save: jest.fn().mockResolvedValue(true),
      };
      (TableSession.findOne as jest.Mock).mockResolvedValue(mockSession);

      stateService.getAllSeats.mockResolvedValue([
        { seat_number: 3, user_id: 'target_user', status: 'active' },
      ]);
      stateService.getTableState.mockResolvedValue({
        game_stage: 'preflop',
        current_turn_seat: '3',
      });

      const res = await lobbyService.forceSitOut(
        'owner_user',
        'table_1',
        'target_user',
      );

      expect(res).toEqual({ success: true });
      expect(mockSession.member_status).toBe('sitting_out');
      expect(stateService.setSeat).toHaveBeenCalledWith('table_1', 3, {
        status: 'sitting_out',
      });
      expect(gameService.processPlayerAction).toHaveBeenCalledWith(
        'table_1',
        3,
        'fold',
        0,
      );
    });
  });
});
