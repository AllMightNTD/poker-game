import { EventEmitter2 } from '@nestjs/event-emitter';
import { Test, TestingModule } from '@nestjs/testing';
import {
  AutoHandScheduler,
  PlayerStateMachine,
} from './auto-hand-scheduler.service';
import { PokerGameService } from './poker-game.service';
import { PokerStateService } from './poker-state.service';

describe('AutoHandScheduler & PlayerStateMachine', () => {
  let scheduler: AutoHandScheduler;
  let mockStateService: any;
  let mockGameService: any;
  let mockEventEmitter: any;
  let mockRedis: any;

  beforeEach(async () => {
    mockRedis = {
      hincrby: jest.fn().mockResolvedValue(1),
      eval: jest.fn(),
      keys: jest.fn().mockResolvedValue([]),
    };

    mockStateService = {
      getAllSeats: jest.fn().mockResolvedValue([]),
      getTableState: jest.fn().mockResolvedValue({}),
      setTableState: jest.fn().mockResolvedValue(true),
      acquireLock: jest.fn().mockResolvedValue(true),
      releaseLock: jest.fn().mockResolvedValue(true),
      getRedisClient: jest.fn().mockReturnValue(mockRedis),
    };

    mockGameService = {
      getCachedTableMeta: jest.fn().mockResolvedValue({ small_blind: '50' }),
      startNewHand: jest.fn().mockResolvedValue(true),
      broadcastTableState: jest.fn().mockResolvedValue(true),
      server: {
        to: jest.fn().mockReturnValue({
          emit: jest.fn(),
        }),
      },
    };

    mockEventEmitter = {
      emit: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AutoHandScheduler,
        { provide: PokerStateService, useValue: mockStateService },
        { provide: PokerGameService, useValue: mockGameService },
        { provide: EventEmitter2, useValue: mockEventEmitter },
      ],
    }).compile();

    scheduler = module.get<AutoHandScheduler>(AutoHandScheduler);
  });

  describe('PlayerStateMachine.isEligible', () => {
    it('should return false if seat has no user_id', () => {
      const seat = { seat_number: 1, stack: '1000', status: 'active' } as any;
      expect(PlayerStateMachine.isEligible(seat, 100n)).toBe(false);
    });

    it('should return false if seat status is disconnected or sitting_out', () => {
      const seat1 = {
        seat_number: 1,
        user_id: 'u1',
        stack: '1000',
        status: 'disconnected',
      } as any;
      const seat2 = {
        seat_number: 2,
        user_id: 'u2',
        stack: '1000',
        status: 'sitting_out',
      } as any;
      expect(PlayerStateMachine.isEligible(seat1, 100n)).toBe(false);
      expect(PlayerStateMachine.isEligible(seat2, 100n)).toBe(false);
    });

    it('should return false if stack is below minimum blind requirement', () => {
      const seat = {
        seat_number: 1,
        user_id: 'u1',
        stack: '50',
        status: 'active',
      } as any;
      expect(PlayerStateMachine.isEligible(seat, 100n)).toBe(false);
    });

    it('should return true for eligible player', () => {
      const seat = {
        seat_number: 1,
        user_id: 'u1',
        stack: '1000',
        status: 'active',
      } as any;
      expect(PlayerStateMachine.isEligible(seat, 100n)).toBe(true);
    });
  });

  describe('Stage Normalization & Transition Matrix', () => {
    it('should normalize legacy "ended" stage to "WAITING"', () => {
      expect(scheduler.normalizeStage('ended')).toBe('WAITING');
      expect(scheduler.normalizeStage('ENDED')).toBe('WAITING');
      expect(scheduler.normalizeStage('playing')).toBe('PLAYING');
    });

    it('should correctly evaluate transition matrix rules', () => {
      expect(scheduler.canTransition('WAITING', 'COUNTDOWN')).toBe(true);
      expect(scheduler.canTransition('COUNTDOWN', 'STARTING')).toBe(true);
      expect(scheduler.canTransition('STARTING', 'PLAYING')).toBe(true);
      expect(scheduler.canTransition('PLAYING', 'SHOWDOWN')).toBe(true);
      expect(scheduler.canTransition('SHOWDOWN', 'INTERMISSION')).toBe(true);
      expect(scheduler.canTransition('INTERMISSION', 'WAITING')).toBe(true);

      // Invalid transitions
      expect(scheduler.canTransition('PLAYING', 'COUNTDOWN')).toBe(false);
    });
  });

  describe('evaluateRoomPipeline', () => {
    it('should emit room.idle when eligible players drop below 2', async () => {
      mockStateService.getAllSeats.mockResolvedValue([
        { seat_number: 1, user_id: 'u1', stack: '1000', status: 'active' },
      ]);
      mockStateService.getTableState.mockResolvedValue({
        game_stage: 'WAITING',
        auto_start_status: 'IDLE',
      });

      await scheduler.evaluateRoomPipeline('table_1');

      expect(mockEventEmitter.emit).toHaveBeenCalledWith('room.idle', {
        roomId: 'table_1',
      });
    });

    it('should start countdown if eligible players >= 2 and hand 2+ (manual_start_required = "0")', async () => {
      mockStateService.getAllSeats.mockResolvedValue([
        { seat_number: 1, user_id: 'u1', stack: '1000', status: 'active' },
        { seat_number: 2, user_id: 'u2', stack: '1000', status: 'active' },
      ]);
      mockStateService.getTableState.mockResolvedValue({
        game_stage: 'WAITING',
        auto_start_status: 'IDLE',
        manual_start_required: '0',
      });
      mockRedis.eval.mockResolvedValue(1);

      await scheduler.evaluateRoomPipeline('table_1');

      expect(mockEventEmitter.emit).toHaveBeenCalledWith('room.active', {
        roomId: 'table_1',
      });
      expect(mockRedis.eval).toHaveBeenCalled();
    });
  });

  describe('triggerHandStartWithRollback', () => {
    it('should perform atomic rollback to WAITING if startNewHand throws error', async () => {
      mockGameService.startNewHand.mockRejectedValue(
        new Error('Deck shuffle error'),
      );

      await scheduler.triggerHandStartWithRollback('table_1');

      expect(mockStateService.setTableState).toHaveBeenCalledWith('table_1', {
        game_stage: 'WAITING',
        auto_start_status: 'IDLE',
        countdown_end_at: '0',
        can_manual_start: '1',
      });
    });
  });
});
