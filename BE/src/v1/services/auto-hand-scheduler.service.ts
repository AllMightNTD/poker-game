import {
  Inject,
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
  forwardRef,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PokerSeatState } from '../types/poker.types';
import { PokerGameService } from './poker-game.service';
import { PokerStateService } from './poker-state.service';

export type GameStageNormalized =
  | 'WAITING'
  | 'COUNTDOWN'
  | 'STARTING'
  | 'PLAYING'
  | 'SHOWDOWN'
  | 'INTERMISSION';

export const ALLOWED_TRANSITIONS: Record<
  GameStageNormalized,
  GameStageNormalized[]
> = {
  WAITING: ['COUNTDOWN', 'STARTING'],
  COUNTDOWN: ['WAITING', 'STARTING'],
  STARTING: ['PLAYING', 'WAITING'],
  PLAYING: ['SHOWDOWN'],
  SHOWDOWN: ['INTERMISSION'],
  INTERMISSION: ['WAITING'],
};

export class PlayerStateMachine {
  static isEligible(seat: PokerSeatState, minStack: bigint = 1n): boolean {
    if (!seat || !seat.user_id) return false;
    if (seat.status === 'disconnected') return false;

    const INELIGIBLE_STATUSES = [
      'sitting_out',
      'buying_in',
      'reserved',
      'reconnecting',
      'waiting_for_blind',
      'missed_blind',
      'auto_rebuy_pending',
      'leaving',
    ];

    if (INELIGIBLE_STATUSES.includes(seat.status) || seat.is_leaving === '1') {
      return false;
    }

    const currentStack = BigInt(seat.stack || '0');
    return currentStack >= minStack;
  }
}

@Injectable()
export class AutoHandScheduler implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(AutoHandScheduler.name);
  private tickerInterval: NodeJS.Timeout | null = null;

  constructor(
    private readonly stateService: PokerStateService,
    @Inject(forwardRef(() => PokerGameService))
    private readonly gameService: PokerGameService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  onModuleInit() {
    // Distributed 500ms ticker for countdown resolution across instances
    this.tickerInterval = setInterval(() => {
      this.processDistributedTick().catch((err) => {
        this.logger.error(`Error in processDistributedTick: ${err.message}`);
      });
    }, 500);
  }

  onModuleDestroy() {
    if (this.tickerInterval) {
      clearInterval(this.tickerInterval);
      this.tickerInterval = null;
    }
  }

  /**
   * Chuẩn hóa Game Stage từ bất kỳ chuỗi đại diện nào
   */
  normalizeStage(stage?: string): GameStageNormalized {
    if (!stage) return 'WAITING';
    const upper = stage.toUpperCase();
    if (upper === 'ENDED') return 'WAITING';
    if (
      [
        'WAITING',
        'COUNTDOWN',
        'STARTING',
        'PLAYING',
        'SHOWDOWN',
        'INTERMISSION',
      ].includes(upper)
    ) {
      return upper as GameStageNormalized;
    }
    return 'WAITING';
  }

  /**
   * Kiểm tra Chuyển đổi Trạng thái theo Ma trận (Transition Matrix)
   */
  canTransition(
    fromStage: GameStageNormalized,
    toStage: GameStageNormalized,
  ): boolean {
    if (fromStage === toStage) return true;
    const allowed = ALLOWED_TRANSITIONS[fromStage] || [];
    return allowed.includes(toStage);
  }

  /**
   * Lấy danh sách Người chơi Hợp lệ (Eligible Players)
   */
  async getEligiblePlayers(roomId: string): Promise<PokerSeatState[]> {
    const seats = await this.stateService.getAllSeats(roomId);
    const dbTable = await this.gameService.getCachedTableMeta(roomId);
    const minStack = dbTable?.small_blind
      ? BigInt(dbTable.small_blind) * 2n
      : 1n;

    return seats.filter((seat) =>
      PlayerStateMachine.isEligible(seat, minStack),
    );
  }

  /**
   * Tăng sequence number phòng để ngăn ngừa Out-of-order Events
   */
  async getNextEventSeq(roomId: string): Promise<number> {
    const redis = this.stateService.getRedisClient();
    return redis.hincrby(`table:${roomId}:state`, 'event_seq', 1);
  }

  /**
   * Central Pipeline Đánh giá Trạng thái Bàn chơi (Idempotent & Multi-instance Safe)
   */
  async evaluateRoomPipeline(
    roomId: string,
    incomingSeq?: number,
  ): Promise<void> {
    const lock = await this.stateService.acquireLock(
      `scheduler:${roomId}`,
      2000,
    );
    if (!lock) return;

    try {
      const tableState = await this.stateService.getTableState(roomId);
      if (!tableState) return;

      const currentSeq = parseInt(tableState.event_seq || '0', 10);
      if (incomingSeq && incomingSeq < currentSeq) {
        this.logger.debug(
          `[Room ${roomId}] Skipping out-of-order event. Seq ${incomingSeq} < ${currentSeq}`,
        );
        return;
      }

      const currentStage = this.normalizeStage(tableState.game_stage);
      const autoStatus = tableState.auto_start_status || 'IDLE';

      // 1. Nếu ván bài đang chơi, đang lật bài hoặc đang chia bài -> Không can thiệp
      if (
        ['PLAYING', 'SHOWDOWN', 'STARTING'].includes(currentStage) ||
        autoStatus === 'STARTING'
      ) {
        return;
      }

      const eligiblePlayers = await this.getEligiblePlayers(roomId);
      const hasEnoughPlayers = eligiblePlayers.length >= 2;
      const isManualRequired =
        tableState.manual_start_required === undefined ||
        tableState.manual_start_required === '1';

      const canManualStart =
        isManualRequired &&
        hasEnoughPlayers &&
        (currentStage === 'WAITING' || currentStage === 'INTERMISSION');

      await this.stateService.setTableState(roomId, {
        can_manual_start: canManualStart ? '1' : '0',
      });

      // 2. Phát sự kiện Decoupled cho RoomCleanupService
      if (hasEnoughPlayers) {
        this.eventEmitter.emit('room.active', { roomId });
      } else {
        this.eventEmitter.emit('room.idle', { roomId });
      }

      // 3. Nếu KHÔNG đủ người chơi -> Hủy Countdown nếu đang đếm ngược
      if (!hasEnoughPlayers) {
        if (autoStatus === 'COUNTDOWN') {
          await this.cancelCountdown(
            roomId,
            'Eligible players dropped below 2',
          );
        }
        return;
      }

      // 4. Nếu là Hand 1 (Cần Host kích hoạt thủ công) -> Không tự động đếm ngược
      if (isManualRequired) {
        return;
      }

      // 5. Nếu đủ người & Hand 2+ & chưa có Countdown -> Bắt đầu Stateless Countdown 3s
      if (
        hasEnoughPlayers &&
        autoStatus === 'IDLE' &&
        currentStage === 'WAITING'
      ) {
        await this.startStatelessCountdown(roomId, 3000);
      }
    } finally {
      await this.stateService.releaseLock(`scheduler:${roomId}`);
    }
  }

  /**
   * Bắt đầu đếm ngược ván mới trong Redis (Stateless - Không giữ Timeout trong RAM)
   */
  async startStatelessCountdown(
    roomId: string,
    durationMs: number,
  ): Promise<void> {
    const redis = this.stateService.getRedisClient();
    const countdownEndAt = Date.now() + durationMs;

    // Atomic CAS từ IDLE -> COUNTDOWN trong Redis
    const luaScript = `
      local current_status = redis.call('HGET', KEYS[1], 'auto_start_status') or 'IDLE'
      if current_status == 'IDLE' then
          redis.call('HSET', KEYS[1], 'auto_start_status', 'COUNTDOWN')
          redis.call('HSET', KEYS[1], 'countdown_end_at', ARGV[1])
          redis.call('HSET', KEYS[1], 'game_stage', 'COUNTDOWN')
          return 1
      else
          return 0
      end
    `;

    const result = await redis.eval(
      luaScript,
      1,
      `table:${roomId}:state`,
      countdownEndAt.toString(),
    );

    if (result === 1) {
      this.logger.log(
        `[Room ${roomId}] Started stateless auto-start countdown for ${durationMs}ms`,
      );
      this.gameService.server
        .to(`table_${roomId}`)
        .emit('table:auto-start-countdown', {
          seconds: Math.ceil(durationMs / 1000),
          countdown_end_at: countdownEndAt,
        });
      await this.gameService.broadcastTableState(roomId);
    }
  }

  /**
   * Hủy đếm ngược (Cancel Countdown) và khôi phục trạng thái về WAITING
   */
  async cancelCountdown(roomId: string, reason: string): Promise<void> {
    const redis = this.stateService.getRedisClient();

    const luaScript = `
      local current_status = redis.call('HGET', KEYS[1], 'auto_start_status') or 'IDLE'
      if current_status == 'COUNTDOWN' then
          redis.call('HSET', KEYS[1], 'auto_start_status', 'IDLE')
          redis.call('HSET', KEYS[1], 'countdown_end_at', '0')
          redis.call('HSET', KEYS[1], 'game_stage', 'WAITING')
          return 1
      else
          return 0
      end
    `;

    const result = await redis.eval(luaScript, 1, `table:${roomId}:state`);

    if (result === 1) {
      this.logger.log(
        `[Room ${roomId}] Cancelled auto-start countdown. Reason: ${reason}`,
      );
      this.gameService.server
        .to(`table_${roomId}`)
        .emit('table:auto-start-cancelled', {
          reason,
        });
      await this.gameService.broadcastTableState(roomId);
    }
  }

  /**
   * Process Ticker định kỳ 500ms để phát hiện Countdown đã kết thúc
   */
  private async processDistributedTick(): Promise<void> {
    const redis = this.stateService.getRedisClient();
    const nowTs = Date.now();

    // Lấy tất cả các Redis keys của bàn chơi
    const keys = await redis.keys('table:*:state');
    if (!keys || keys.length === 0) return;

    for (const key of keys) {
      const match = key.match(/^table:(.+):state$/);
      if (!match) continue;
      const roomId = match[1];

      // Atomic CAS script để claim quyền trigger startHand
      const claimLua = `
        local status = redis.call('HGET', KEYS[1], 'auto_start_status') or 'IDLE'
        local end_at = tonumber(redis.call('HGET', KEYS[1], 'countdown_end_at') or '0')
        local now_ts = tonumber(ARGV[1])

        if status == 'COUNTDOWN' and end_at > 0 and now_ts >= end_at then
            redis.call('HSET', KEYS[1], 'auto_start_status', 'STARTING')
            redis.call('HSET', KEYS[1], 'countdown_end_at', '0')
            redis.call('HSET', KEYS[1], 'game_stage', 'STARTING')
            return 1
        else
            return 0
        end
      `;

      const claimed = await redis.eval(claimLua, 1, key, nowTs.toString());
      if (claimed === 1) {
        this.logger.log(
          `[Room ${roomId}] Claimed countdown expiration. Triggering startHand...`,
        );
        this.triggerHandStartWithRollback(roomId).catch((err) => {
          this.logger.error(
            `[Room ${roomId}] Unhandled error in triggerHandStart: ${err.message}`,
          );
        });
      }
    }
  }

  /**
   * Bắt đầu chia bài ván mới với cơ chế Atomic Rollback an toàn
   */
  async triggerHandStartWithRollback(roomId: string): Promise<void> {
    try {
      this.logger.log(`[Room ${roomId}] Starting new hand execution...`);
      await this.gameService.startNewHand(roomId);

      // Sau khi ván 1 bắt đầu thành công, gắn cờ manual_start_required = '0'
      await this.stateService.setTableState(roomId, {
        manual_start_required: '0',
        can_manual_start: '0',
        auto_start_status: 'PLAYING',
      });
      await this.gameService.broadcastTableState(roomId);
    } catch (error) {
      this.logger.error(
        `[Room ${roomId}] Error during startNewHand execution. Rolling back stage: ${error.message}`,
        error.stack,
      );

      // Atomic Rollback về WAITING nếu chia bài gặp lỗi
      await this.stateService.setTableState(roomId, {
        game_stage: 'WAITING',
        auto_start_status: 'IDLE',
        countdown_end_at: '0',
        can_manual_start: '1',
      });

      this.gameService.server.to(`table_${roomId}`).emit('table:error', {
        message: 'Không thể bắt đầu ván bài mới. Đã hoàn tác trạng thái bàn.',
      });
      await this.gameService.broadcastTableState(roomId);
    }
  }

  /**
   * Đánh dấu kích hoạt thủ công từ Host (Manual Start) cho Hand 1 với Atomic CAS
   */
  async handleManualStart(
    roomId: string,
    userId: string,
    clientSeed?: string,
  ): Promise<void> {
    console.log('clientSeed', clientSeed);

    const redis = this.stateService.getRedisClient();

    // Check host & table status
    const tableState = await this.stateService.getTableState(roomId);
    const dbTable = await this.gameService.getCachedTableMeta(roomId);
    if (!dbTable || dbTable.owner_id !== userId) {
      throw new Error('Chỉ chủ phòng mới có quyền bắt đầu ván đấu.');
    }

    const currentStage = this.normalizeStage(tableState?.game_stage);
    if (currentStage !== 'WAITING') {
      throw new Error('Ván bài đã bắt đầu rồi.');
    }

    const eligible = await this.getEligiblePlayers(roomId);
    if (eligible.length < 2) {
      throw new Error('Cần tối thiểu 2 người chơi hợp lệ để bắt đầu ván bài.');
    }

    // Atomic CAS để chắc chắn không double-click manual start
    const manualLua = `
      local manual_req = redis.call('HGET', KEYS[1], 'manual_start_required') or '1'
      local status = redis.call('HGET', KEYS[1], 'auto_start_status') or 'IDLE'

      if status == 'IDLE' or status == 'COUNTDOWN' then
          redis.call('HSET', KEYS[1], 'auto_start_status', 'STARTING')
          redis.call('HSET', KEYS[1], 'manual_start_required', '0')
          redis.call('HSET', KEYS[1], 'game_stage', 'STARTING')
          return 1
      else
          return 0
      end
    `;

    const result = await redis.eval(manualLua, 1, `table:${roomId}:state`);
    if (result !== 1) {
      throw new Error('Đang trong tiến trình bắt đầu ván bài khác.');
    }

    await this.triggerHandStartWithRollback(roomId);
  }
}
