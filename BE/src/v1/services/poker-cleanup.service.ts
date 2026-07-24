import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PokerTable } from '../entities/poker_table.entity';
import { CloseReason } from '../enums/close-reason.enum';
import { PokerGameService } from './poker-game.service';
import { PokerStateService } from './poker-state.service';

@Injectable()
export class RoomCleanupService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RoomCleanupService.name);
  private cleanupInterval: NodeJS.Timeout;

  constructor(
    private readonly gameService: PokerGameService,
    private readonly stateService: PokerStateService,
    private readonly configService: ConfigService,
  ) {}

  onModuleInit() {
    this.startCleanupScheduler();
  }

  onModuleDestroy() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
  }

  private startCleanupScheduler() {
    const intervalMs = this.configService.get<number>(
      'POKER_CLEANUP_INTERVAL_MS',
      30000,
    );
    this.cleanupInterval = setInterval(async () => {
      await this.runCleanupCheck();
    }, intervalMs);
    this.logger.log(
      `RoomCleanupService initialized with ${intervalMs}ms interval.`,
    );
  }

  async runCleanupCheck() {
    try {
      const activeTables = await PokerTable.find({
        where: { is_active: true },
      });
      const now = Date.now();

      const noPlayerJoinTimeout = this.configService.get<number>(
        'POKER_NO_PLAYER_JOIN_TIMEOUT_MS',
        5 * 60 * 1000,
      );
      const emptyRoomTimeout = this.configService.get<number>(
        'POKER_EMPTY_ROOM_TIMEOUT_MS',
        30 * 1000,
      );
      const idleTimeout = this.configService.get<number>(
        'POKER_IDLE_TIMEOUT_MS',
        20 * 60 * 1000,
      );
      const idleCountdownSec = this.configService.get<number>(
        'POKER_IDLE_COUNTDOWN_SEC',
        60,
      );
      const allSitOutTimeout = this.configService.get<number>(
        'POKER_ALL_SIT_OUT_TIMEOUT_MS',
        2 * 60 * 1000,
      );
      const ownerTimeout = this.configService.get<number>(
        'POKER_OWNER_TIMEOUT_MS',
        5 * 60 * 1000,
      );
      const maxLifetime = this.configService.get<number>(
        'POKER_ROOM_MAX_LIFETIME_MS',
        24 * 60 * 60 * 1000,
      );

      for (const table of activeTables) {
        // Multi-instance lock per table
        const lockAcquired = await this.stateService.acquireLock(
          `cleanup:${table.id}`,
        );
        if (!lockAcquired) continue;

        try {
          await this.evaluateRoom(table, now, {
            noPlayerJoinTimeout,
            emptyRoomTimeout,
            idleTimeout,
            idleCountdownSec,
            allSitOutTimeout,
            ownerTimeout,
            maxLifetime,
          });
        } catch (err) {
          this.logger.error(
            `Error evaluating room ${table.id}: ${err.message}`,
          );
        } finally {
          await this.stateService.releaseLock(`cleanup:${table.id}`);
        }
      }
    } catch (err) {
      this.logger.error(`Error in runCleanupCheck: ${err.message}`);
    }
  }

  private async evaluateRoom(table: PokerTable, now: number, config: any) {
    const roomId = table.id;
    const redisState = await this.stateService.getTableState(roomId);
    const createdAt = new Date(table.created_at).getTime();
    const roomLifetime = now - createdAt;

    // Handle Ghost tables (active in DB but missing Redis state)
    if (!redisState) {
      if (roomLifetime > config.noPlayerJoinTimeout) {
        this.logger.warn(
          `[GHOST_TABLE] Table ${roomId} has no Redis state and created > 5m ago. Destroying...`,
        );
        await this.gameService.destroyRoom(roomId, CloseReason.NO_PLAYER_JOIN);
      }
      return;
    }

    const isClosing = redisState.is_closing === '1';
    const closingTimerEnd = parseInt(redisState.closing_timer_end || '0');
    const gameStage = redisState.game_stage || 'waiting';
    const isPlayingHand = gameStage !== 'waiting' && gameStage !== 'ended';

    // If currently in closing countdown, check if countdown has expired
    if (isClosing && closingTimerEnd > 0) {
      if (now >= closingTimerEnd) {
        this.logger.log(
          `[AUTO_CLOSE_TIMEOUT] Closing countdown expired for room ${roomId}. Finalizing close...`,
        );
        const reason =
          (redisState.closing_reason as CloseReason) ||
          CloseReason.IDLE_TIMEOUT;

        // Spec Case 5: Owner Disconnect handling at timeout expiration
        if (reason === CloseReason.OWNER_TIMEOUT) {
          const hasTransferred = await this.gameService.tryTransferHost(roomId);
          if (hasTransferred) {
            await this.gameService.cancelRoomClosing(roomId);
            return;
          }
        }

        await this.gameService.destroyRoom(roomId, reason);
      }
      return;
    }

    // Fetch active seats / players
    const seats = await this.stateService.getAllSeats(roomId);
    const seatedPlayers = seats.filter((s) => s.user_id && s.user_id !== '');
    const activeSeatedPlayers = seats.filter(
      (s) =>
        s.user_id &&
        s.user_id !== '' &&
        (s.status === 'active' || s.status === 'waiting_for_next_hand'),
    );

    // --- CASE 6: Room Lifetime Exceeded (> 24 hours) ---
    if (roomLifetime > config.maxLifetime) {
      this.logger.warn(
        `[CASE 6] Room ${roomId} lifetime exceeded 24h (${Math.floor(roomLifetime / 3600000)}h).`,
      );
      await this.stateService.setTableState(roomId, { is_expired: '1' });
      if (!isPlayingHand) {
        await this.gameService.destroyRoom(roomId, CloseReason.ROOM_EXPIRED);
        return;
      }
      // If playing hand, it will close when hand ends
    }

    // Never close if actively playing a hand
    if (isPlayingHand) {
      return;
    }

    // --- CASE 1: Room vừa tạo nhưng không có ai join (> 5 phút) ---
    if (
      seatedPlayers.length === 0 &&
      roomLifetime > config.noPlayerJoinTimeout
    ) {
      this.logger.warn(
        `[CASE 1] Room ${roomId} created > 5m ago with 0 players. Closing...`,
      );
      await this.gameService.destroyRoom(roomId, CloseReason.NO_PLAYER_JOIN);
      return;
    }

    // --- CASE 2: Không còn player trong room (Player Count = 0) ---
    if (
      seatedPlayers.length === 0 &&
      roomLifetime <= config.noPlayerJoinTimeout
    ) {
      this.logger.log(
        `[CASE 2] Room ${roomId} has 0 players. Starting 30s countdown...`,
      );
      await this.gameService.startRoomClosing(
        roomId,
        CloseReason.EMPTY_ROOM,
        Math.floor(config.emptyRoomTimeout / 1000),
      );
      return;
    }

    // --- CASE 4: Tất cả player đều Sit Out ---
    if (seatedPlayers.length > 0 && activeSeatedPlayers.length === 0) {
      this.logger.log(
        `[CASE 4] All players sit out in room ${roomId}. Starting 2m countdown...`,
      );
      await this.gameService.startRoomClosing(
        roomId,
        CloseReason.ALL_SIT_OUT,
        Math.floor(config.allSitOutTimeout / 1000),
      );
      return;
    }

    // --- CASE 5: Chủ phòng Disconnect ---
    const ownerId = table.owner_id;
    if (ownerId && ownerId !== 'system') {
      const isOwnerConnected = await this.gameService.isUserConnectedToRoom(
        roomId,
        ownerId,
      );
      if (!isOwnerConnected) {
        this.logger.log(
          `[CASE 5] Owner ${ownerId} disconnected from room ${roomId}. Starting 5m countdown...`,
        );
        await this.gameService.startRoomClosing(
          roomId,
          CloseReason.OWNER_TIMEOUT,
          Math.floor(config.ownerTimeout / 1000),
        );
        return;
      }
    }

    // --- CASE 3: Không có hand nào được chơi / Idle > 20 phút ---
    const lastHandAt =
      parseInt(redisState.last_hand_at || redisState.last_activity || '0') ||
      createdAt;
    if (now - lastHandAt > config.idleTimeout) {
      this.logger.log(
        `[CASE 3] Room ${roomId} idle for > 20m. Starting 60s countdown...`,
      );
      await this.gameService.startRoomClosing(
        roomId,
        CloseReason.IDLE_TIMEOUT,
        config.idleCountdownSec,
      );
      return;
    }
  }
}
