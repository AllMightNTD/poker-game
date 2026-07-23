import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Queue } from 'bullmq';
import { InjectQueue } from '@nestjs/bullmq';
import { randomBytes, randomUUID } from 'crypto';
import { Server } from 'socket.io';
import { DataSource } from 'typeorm';
import { GameHand } from '../entities/game_hand.entity';
import { PokerTable } from '../entities/poker_table.entity';
import { TableSession } from '../entities/table_session.entity';
import { PokerLobbyService } from './poker-lobby.service';
import { PokerStateService } from './poker-state.service';
import { PokerStreamService } from './poker-stream.service';
import { ProvablyFairService } from './provably-fair.service';
import { ProvablyFairAudit } from '../entities/provably_fair_audit.entity';
import { PokerBotManager } from '../engines/poker-bot.manager';
import { PokerShowdownManager } from '../engines/poker-showdown.manager';
import { PokerActionProcessor } from '../engines/poker-action.processor';
import {
  PokerSeatState,
  PokerTableState,
  WinnerLog,
} from '../types/poker.types';

@Injectable()
export class PokerGameService implements OnModuleDestroy {
  readonly logger = new Logger(PokerGameService.name);
  server: Server;

  // Quản lý Timers hành động (Key: roomId)
  readonly actionTimers = new Map<
    string,
    { timeout: NodeJS.Timeout; expiresAt: number; currentSeat: number }
  >();
  // Quản lý Disconnect Protection (Key: roomId:userId)
  readonly disconnectTimeouts = new Map<string, NodeJS.Timeout>();

  // Quản lý Empty Room Timers (Key: roomId)
  readonly emptyRoomTimers = new Map<string, NodeJS.Timeout>();

  // Quản lý Auto-Start Timers (Key: roomId)
  readonly autoStartTimers = new Map<string, NodeJS.Timeout>();

  private idleCleanupInterval: NodeJS.Timeout;
  // Stack-change audit trail is now handled by PokerStreamService (Redis Streams)

  private readonly botManager = new PokerBotManager(this);
  private readonly showdownManager = new PokerShowdownManager(this);
  private readonly actionProcessor = new PokerActionProcessor(this);

  constructor(
    readonly lobbyService: PokerLobbyService,
    readonly stateService: PokerStateService,
    readonly streamService: PokerStreamService,
    readonly eventEmitter: EventEmitter2,
    readonly provablyFairService: ProvablyFairService,
    readonly dataSource: DataSource,
    @InjectQueue('poker-game-history') readonly historyQueue: Queue,
  ) {
    this.startIdleCleanupInterval();
    // PokerStreamService starts its own consumer via OnModuleInit lifecycle hook
  }

  setServer(server: Server) {
    this.server = server;
  }

  cancelDisconnectTimeout(roomId: string, userId: string) {
    const dcKey = `${roomId}:${userId}`;
    if (this.disconnectTimeouts.has(dcKey)) {
      clearTimeout(this.disconnectTimeouts.get(dcKey));
      this.disconnectTimeouts.delete(dcKey);
      this.logger.log(
        `Canceled disconnect timeout for user ${userId} on table ${roomId}`,
      );
    }
  }

  /**
   * Xử lý khi mất kết nối mạng (Disconnect Protection 30s)
   */
  async handlePlayerConnectionLost(roomId: string, userId: string) {
    const seats = await this.stateService.getAllSeats(roomId);
    const playerSeat = seats.find((s) => s.user_id === userId);

    if (
      !playerSeat ||
      playerSeat.status === 'folded' ||
      playerSeat.status === 'sitting_out' ||
      (playerSeat.status === 'active' &&
        parseInt(playerSeat.stack || '0') === 0)
    ) {
      return;
    }

    await this.stateService.setSeat(roomId, playerSeat.seat_number, {
      status: 'disconnected',
      disconnected_at: Date.now().toString(),
    });

    this.server.to(`table_${roomId}`).emit('table:player-disconnected', {
      user_id: userId,
      seat_number: playerSeat.seat_number,
    });

    const dcKey = `${roomId}:${userId}`;
    const timeout = setTimeout(async () => {
      this.logger.warn(
        `Disconnect Protection expired for user ${userId} on table ${roomId}`,
      );
      this.disconnectTimeouts.delete(dcKey);

      await this.stateService.setSeat(roomId, playerSeat.seat_number, {
        status: 'sitting_out',
      });

      const tableState = await this.stateService.getTableState(roomId);
      if (
        tableState &&
        parseInt(tableState.current_turn_seat) === playerSeat.seat_number
      ) {
        await this.executeAutoAction(roomId, playerSeat.seat_number);
      }
      await this.checkAndNotifyWaitingState(roomId);
    }, 30000);

    this.disconnectTimeouts.set(dcKey, timeout);
  }

  /**
   * Helper: Broadcast danh sách yêu cầu xin ngồi vào bàn
   */
  async broadcastSitRequests(roomId: string) {
    try {
      const redis = this.stateService.getRedisClient();
      const requestsRaw = await redis.hgetall(`table:${roomId}:sit-requests`);
      const list = Object.values(requestsRaw).map((v) => JSON.parse(v));
      this.server
        .to(`table_${roomId}`)
        .emit('table:sit-requests-list', { requests: list });
    } catch (err) {
      this.logger.error(`Error broadcasting sit requests: ${err.message}`);
    }
  }

  /**
   * Bot Manager Delegations
   */
  checkAndTriggerBotAction(roomId: string) {
    return this.botManager.checkAndTriggerBotAction(roomId);
  }

  /**
   * Showdown Manager Delegations
   */
  processShowdown(roomId: string) {
    return this.showdownManager.processShowdown(roomId);
  }

  endHandEarly(roomId: string, winnerSeatNumber: number) {
    return this.showdownManager.endHandEarly(roomId, winnerSeatNumber);
  }

  finalizeAndBroadcastHand(
    roomId: string,
    winnersLog: WinnerLog[],
    totalRakedPotAmount: number,
    tableState: PokerTableState,
    seats: PokerSeatState[],
  ) {
    return this.showdownManager.finalizeAndBroadcastHand(
      roomId,
      winnersLog,
      totalRakedPotAmount,
      tableState,
      seats,
    );
  }

  /**
   * Action Processor Delegations
   */
  processPlayerAction(
    roomId: string,
    seatNumber: number,
    actionType: string,
    amount: number,
  ) {
    return this.actionProcessor.processPlayerAction(
      roomId,
      seatNumber,
      actionType,
      amount,
    );
  }

  advanceTurn(roomId: string) {
    return this.actionProcessor.advanceTurn(roomId);
  }

  advanceStreet(roomId: string) {
    return this.actionProcessor.advanceStreet(roomId);
  }

  executeAutoAction(roomId: string, seatNumber: number) {
    return this.actionProcessor.executeAutoAction(roomId, seatNumber);
  }

  /**
   * Timers Management
   */
  startActionTimer(roomId: string, seatNumber: number, seconds = 30) {
    if (this.actionTimers.has(roomId)) {
      clearTimeout(this.actionTimers.get(roomId).timeout);
    }

    const expiresAt = Date.now() + seconds * 1000;
    const timeout = setTimeout(async () => {
      this.logger.warn(`Seat ${seatNumber} action timeout on table ${roomId}`);
      this.actionTimers.delete(roomId);
      await this.executeAutoAction(roomId, seatNumber);
    }, seconds * 1000);

    this.actionTimers.set(roomId, {
      timeout,
      expiresAt,
      currentSeat: seatNumber,
    });

    this.eventEmitter.emit('poker.turn_changed', {
      roomId,
      turnSeatNumber: seatNumber,
    });
  }

  clearActionTimer(roomId: string) {
    if (this.actionTimers.has(roomId)) {
      clearTimeout(this.actionTimers.get(roomId).timeout);
      this.actionTimers.delete(roomId);
    }
  }

  clearAllTableTimers(roomId: string) {
    this.clearActionTimer(roomId);

    for (const [key, timeout] of this.disconnectTimeouts.entries()) {
      if (key.startsWith(`${roomId}:`)) {
        clearTimeout(timeout);
        this.disconnectTimeouts.delete(key);
      }
    }
  }

  startEmptyRoomTimer(roomId: string) {
    if (this.emptyRoomTimers.has(roomId)) {
      return;
    }
    this.logger.log(`Starting empty room timer (60s) for table ${roomId}`);
    const timeout = setTimeout(async () => {
      this.emptyRoomTimers.delete(roomId);
      this.logger.warn(
        `Empty room timer expired for table ${roomId}. Destroying room cache...`,
      );
      await this.destroyRoom(roomId);
    }, 60000);
    this.emptyRoomTimers.set(roomId, timeout);
  }

  checkAndStartEmptyRoomTimer(roomId: string) {
    if (!this.server) return;
    const roomAdapter = this.server.sockets.adapter.rooms.get(
      `table_${roomId}`,
    );
    const connectedCount = roomAdapter ? roomAdapter.size : 0;
    if (connectedCount === 0) {
      this.startEmptyRoomTimer(roomId);
    }
  }

  cancelEmptyRoomTimer(roomId: string) {
    if (this.emptyRoomTimers.has(roomId)) {
      clearTimeout(this.emptyRoomTimers.get(roomId));
      this.emptyRoomTimers.delete(roomId);
      this.logger.log(`Canceled empty room timer for table ${roomId}`);
    }
  }

  async destroyRoom(roomId: string) {
    this.logger.log(`Destroying room ${roomId}...`);

    this.clearAllTableTimers(roomId);
    this.cancelEmptyRoomTimer(roomId);

    // Lấy thông tin hand hiện tại để xoá action logs nếu có
    const tableState = await this.stateService.getTableState(roomId);
    if (tableState && tableState.current_hand_id) {
      await this.stateService.deleteActionLogs(tableState.current_hand_id);
    }

    try {
      const activeSessions = await TableSession.find({
        where: [
          { table_id: roomId, member_status: 'active' },
          { table_id: roomId, member_status: 'sitting_out' },
          { table_id: roomId, member_status: 'disconnected' },
        ],
      });
      for (const sess of activeSessions) {
        try {
          await this.lobbyService.leaveRoom(sess.user_id, roomId);
          this.logger.log(`Refunded user ${sess.user_id} on room destroy.`);
        } catch (err) {
          this.logger.error(
            `Error refunding user ${sess.user_id}: ${err.message}`,
          );
        }
      }
    } catch (e) {
      this.logger.error(
        `Error fetching table sessions on destroy: ${e.message}`,
      );
    }

    // Xoá triệt để TẤT CẢ keys trên Redis liên quan tới table này (sau khi đã cashout)
    await this.stateService.deleteAllTableKeys(roomId);

    try {
      const table = await PokerTable.findOne({ where: { id: roomId } });
      if (table) {
        table.is_active = false;
        table.status = 'closed';
        await table.save();
        this.logger.log(
          `Table ${roomId} marked as inactive/closed in database.`,
        );
      }
    } catch (e) {
      this.logger.error(
        `Error updating table is_active on destroy: ${e.message}`,
      );
    }

    this.server.to(`table_${roomId}`).emit('table:destroyed', { roomId });
    await this.broadcastTableState(roomId);
    await this.broadcastLobbyRoomStatus(roomId);
  }

  async broadcastLobbyRoomStatus(roomId: string) {
    if (!this.server) return;
    try {
      const table = await PokerTable.findOne({ where: { id: roomId } });
      if (!table) return;
      const playersCount = await TableSession.count({
        where: { table_id: roomId, member_status: 'active' },
      });
      this.server.to('lobby_channel').emit('lobby:room-status-changed', {
        room_id: parseInt(roomId),
        current_players_count: playersCount,
        status: (table.status || 'WAITING').toUpperCase(),
      });
    } catch (e) {
      this.logger.error(
        `Error broadcasting lobby room status for room ${roomId}: ${e.message}`,
      );
    }
  }

  private startIdleCleanupInterval() {
    this.idleCleanupInterval = setInterval(async () => {
      try {
        const tables = await PokerTable.find({ where: { is_active: true } });
        for (const table of tables) {
          const state = await this.stateService.getTableState(table.id);
          if (state) {
            const lastActivity = parseInt(state.last_activity || '0');
            if (
              lastActivity > 0 &&
              Date.now() - lastActivity > 10 * 60 * 1000
            ) {
              this.logger.warn(
                `Table ${table.id} has been idle for over 10 minutes. Destroying...`,
              );
              await this.destroyRoom(table.id);
            }
          }
        }
      } catch (err) {
        this.logger.error(`Error in idle cleanup: ${err.message}`);
      }
    }, 60000);
  }

  onModuleDestroy() {
    if (this.idleCleanupInterval) {
      clearInterval(this.idleCleanupInterval);
    }
    // PokerStreamService consumer is stopped via its own OnModuleDestroy lifecycle hook
  }

  /**
   * State and DB helpers
   */
  async syncSeatStackToDb(
    tableId: string,
    userId: string,
    newStack: string,
    manager?: any,
  ) {
    try {
      const repo = manager ? manager.getRepository(TableSession) : TableSession;
      const sess = await repo.findOne({
        where: { table_id: tableId, user_id: userId, member_status: 'active' },
      });
      if (sess) {
        sess.chips_at_table = newStack;
        if (manager) {
          await manager.save(sess);
        } else {
          await sess.save();
        }
      }
    } catch (e) {
      this.logger.error(
        `Failed to sync stack to DB for user ${userId}: ${e.message}`,
      );
    }
  }

  async broadcastTableState(roomId: string) {
    let tableState = await this.stateService.getTableState(roomId);
    const dbTable = await PokerTable.findOne({ where: { id: roomId } });

    if (!tableState) {
      if (!dbTable) return;
      const initialFields = {
        room_name: dbTable.name || 'Bàn Poker',
        game_stage: 'waiting',
        total_pot: '0',
        current_highest_bet: '0',
        dealer_seat: '1',
        small_blind_seat: '0',
        big_blind_seat: '0',
        current_turn_seat: '0',
        community_cards: '',
      };
      await this.stateService.setTableState(roomId, initialFields);
      tableState = await this.stateService.getTableState(roomId);
      if (!tableState) return;
    }

    const seats = await this.stateService.getAllSeats(roomId);
    const sanitizedSeats = seats.map((s) => ({
      seatIndex: s.seat_number,
      id: s.user_id,
      name: s.username,
      avatar: s.avatar,
      chips: s.stack,
      current_bet: s.current_bet,
      status: s.status,
      has_used_extra_time: s.has_used_extra_time === '1',
      isBot: s.is_bot === '1',
    }));

    const timer = this.actionTimers.get(roomId);
    const remainingTimer = timer
      ? Math.max(0, Math.floor((timer.expiresAt - Date.now()) / 1000))
      : 0;

    const payload = {
      room_id: roomId,
      room_name: dbTable?.name || tableState.room_name,
      status: dbTable?.status || 'waiting',
      owner_id: dbTable?.owner_id || '',
      min_buyin: dbTable?.min_buyin ? Number(dbTable.min_buyin) : 0,
      max_buyin: dbTable?.max_buyin ? Number(dbTable.max_buyin) : 0,
      small_blind: dbTable?.small_blind ? Number(dbTable.small_blind) : 50,
      big_blind: dbTable?.big_blind ? Number(dbTable.big_blind) : 100,
      game_stage: tableState.game_stage || 'ended',
      community_cards: tableState.community_cards
        ? tableState.community_cards.split(',')
        : [],
      total_pot: parseInt(tableState.total_pot || '0'),
      current_highest_bet: parseInt(tableState.current_highest_bet || '0'),
      last_full_raise_size: parseInt(tableState.last_full_raise_size || '0'),
      dealer_seat: parseInt(tableState.dealer_seat || '1'),
      small_blind_seat: parseInt(tableState.small_blind_seat || '0'),
      big_blind_seat: parseInt(tableState.big_blind_seat || '0'),
      current_turn_seat: parseInt(tableState.current_turn_seat || '0'),
      remaining_time: remainingTimer,
      expires_at: timer ? timer.expiresAt : 0,
      seats: sanitizedSeats,
    };

    if (!this.server) return;

    const sockets = await this.server.in(`table_${roomId}`).fetchSockets();
    const seatedUserIds = seats.map((s) => String(s.user_id));

    for (const socket of sockets) {
      const socketUserId = socket.data?.user?.id;
      const isSeated =
        socketUserId && seatedUserIds.includes(String(socketUserId));

      const maskedSeats = sanitizedSeats.map((s) => {
        const isBot = s.isBot;
        const isHero = socketUserId && String(s.id) === String(socketUserId);
        if (!isSeated && !isBot && !isHero) {
          return {
            ...s,
            name: `Player ${s.seatIndex}`,
            avatar: `https://api.dicebear.com/7.x/adventurer/svg?seed=Player${s.seatIndex}`,
          };
        }
        return s;
      });

      socket.emit('table:state', {
        ...payload,
        seats: maskedSeats,
      });
    }
  }

  async verifyCardIntegrity(roomId: string): Promise<boolean> {
    const deck = await this.stateService.getDeck(roomId);
    const tableState = await this.stateService.getTableState(roomId);
    const community = tableState?.community_cards
      ? tableState.community_cards.split(',')
      : [];
    const seats = await this.stateService.getAllSeats(roomId);

    const allCollectedCards: string[] = [...deck, ...community];

    for (const seat of seats) {
      const pocket = await this.stateService.getPlayerCards(
        roomId,
        seat.user_id,
      );
      if (pocket && pocket.length > 0) {
        allCollectedCards.push(...pocket);
      }
    }

    const cleanCards = allCollectedCards.filter((c) => c && c.trim() !== '');
    const uniqueCards = new Set(cleanCards);

    if (uniqueCards.size !== cleanCards.length) {
      this.logger.error(
        `CARD INTEGRITY FAILURE on table ${roomId}: Duplicate cards detected!`,
      );
      return false;
    }

    const validSuits = ['C', 'D', 'H', 'S'];
    const validRanks = [
      '2',
      '3',
      '4',
      '5',
      '6',
      '7',
      '8',
      '9',
      'T',
      'J',
      'Q',
      'K',
      'A',
    ];
    for (const card of cleanCards) {
      if (card.length !== 2) return false;
      const rank = card[0];
      const suit = card[1];
      if (!validRanks.includes(rank) || !validSuits.includes(suit)) {
        this.logger.error(
          `CARD INTEGRITY FAILURE on table ${roomId}: Invalid card format: ${card}`,
        );
        return false;
      }
    }

    return true;
  }

  async checkAndNotifyWaitingState(roomId: string) {
    const tableState = await this.stateService.getTableState(roomId);
    if (!tableState || tableState.game_stage !== 'waiting') return;

    const seats = await this.stateService.getAllSeats(roomId);
    const eligiblePlayers = seats.filter(
      (s) =>
        (s.status === 'active' || s.status === 'waiting_for_next_hand') &&
        parseInt(s.stack) > 0,
    );

    const canStart = eligiblePlayers.length >= 2;

    // Đồng bộ status database
    let isPaused = false;
    try {
      const dbTable = await PokerTable.findOne({ where: { id: roomId } });
      if (dbTable) {
        if (dbTable.status === 'paused') {
          isPaused = true;
        } else if (dbTable.status !== 'waiting') {
          dbTable.status = 'waiting';
          await dbTable.save();
          // Emit lobby status when changed
          await this.broadcastLobbyRoomStatus(roomId);
        }
      }
    } catch (e) {
      this.logger.error(`Lỗi cập nhật status waiting cho phòng: ${e.message}`);
    }

    if (isPaused || !canStart) {
      if (this.autoStartTimers.has(roomId)) {
        clearTimeout(this.autoStartTimers.get(roomId));
        this.autoStartTimers.delete(roomId);
      }
    }

    if (isPaused) {
      this.server.to(`table_${roomId}`).emit('table:waiting-for-players', {
        required: 2,
        current: eligiblePlayers.length,
        starting: false,
        can_start: false,
        paused: true,
      });
      return;
    }

    this.server.to(`table_${roomId}`).emit('table:waiting-for-players', {
      required: 2,
      current: eligiblePlayers.length,
      starting: canStart,
      can_start: canStart,
    });

    if (canStart && !this.autoStartTimers.has(roomId)) {
      this.logger.log(
        `Table ${roomId} has enough players, starting Auto-Start countdown...`,
      );
      const timer = setTimeout(() => {
        this.logger.log(`Auto-starting table ${roomId}...`);
        this.autoStartTimers.delete(roomId);
        this.startNewHand(roomId);
      }, 6000); // 6 seconds countdown so players can see the message
      this.autoStartTimers.set(roomId, timer);
    }
  }

  async syncRoomState(roomId: string) {
    await this.broadcastTableState(roomId);
    await this.broadcastLobbyRoomStatus(roomId);
    await this.checkAndNotifyWaitingState(roomId);
  }

  async startNewHand(roomId: string, clientSeedOverride?: string) {
    const lockAcquired = await this.stateService.acquireLock(roomId);
    if (!lockAcquired) {
      this.logger.warn(
        `Could not acquire lock for startNewHand on table ${roomId}. Skipping.`,
      );
      return;
    }

    try {
      this.clearActionTimer(roomId);

      const tableStateBefore = await this.stateService.getTableState(roomId);
      if (tableStateBefore && tableStateBefore.current_hand_id) {
        await this.stateService.deleteActionLogs(
          tableStateBefore.current_hand_id,
        );
      }

      const currentStage = tableStateBefore?.game_stage || 'waiting';
      if (currentStage !== 'ended' && currentStage !== 'waiting') {
        this.logger.warn(
          `Table ${roomId} is already in stage ${currentStage}. Skipping startNewHand.`,
        );
        return;
      }

      const seats = await this.stateService.getAllSeats(roomId);
      let activeSeatsList = [...seats];

      // Pipeline: xóa bài cũ + reset community_cards trong 1 round-trip
      const pipelineClear = this.stateService.getRedisClient().pipeline();
      for (const seat of seats) {
        pipelineClear.del(`table:${roomId}:player:${seat.user_id}:cards`);
      }
      pipelineClear.hset(`table:${roomId}:state`, {
        community_cards: '',
        last_activity: Date.now().toString(),
      });
      await pipelineClear.exec();

      const kickedSeatNumbers: number[] = [];
      const kickPlayer = async (userId: string, seatNumber: number) => {
        try {
          await this.lobbyService.leaveRoom(userId, roomId);
          this.cancelDisconnectTimeout(roomId, userId);
          this.server.to(`table_${roomId}`).emit('table:player-stood-up', {
            seat_number: seatNumber,
            user_id: userId,
          });
          kickedSeatNumbers.push(seatNumber);
        } catch (err) {
          this.logger.error(
            `Error auto-kicking player ${userId}: ${err.message}`,
          );
        }
      };

      const redis = this.stateService.getRedisClient();
      const currentSeats = [...seats];
      await Promise.all(
        currentSeats.map(async (seat) => {
          if (seat.pending_leave === '1') {
            this.logger.log(
              `User ${seat.user_id} has pending leave. Kicking from seat.`,
            );
            await kickPlayer(seat.user_id, seat.seat_number);
            return;
          }

          const statsKey = `table:${roomId}:player:${seat.user_id}:stats`;
          if (
            seat.status === 'sitting_out' ||
            (seat.disconnected_at && seat.disconnected_at !== '0')
          ) {
            const awayCount = await redis.hincrby(
              statsKey,
              'consecutive_away_hands',
              1,
            );
            if (awayCount >= 5) {
              this.logger.log(
                `User ${seat.user_id} has been sitting out or disconnected for 5 hands. Auto-kicking.`,
              );
              await kickPlayer(seat.user_id, seat.seat_number);
            }
          } else {
            await redis.hset(statsKey, 'consecutive_away_hands', '0');
          }
        }),
      );

      if (kickedSeatNumbers.length > 0) {
        activeSeatsList = activeSeatsList.filter(
          (s) => !kickedSeatNumbers.includes(s.seat_number),
        );
        kickedSeatNumbers.length = 0;
      }

      await Promise.all(
        activeSeatsList.map(async (seat) => {
          const currentStack = parseInt(seat.stack);
          if (currentStack === 0) {
            this.logger.log(
              `User ${seat.user_id} has 0 chips. Auto-kicking from seat.`,
            );
            await kickPlayer(seat.user_id, seat.seat_number);
          }
        }),
      );

      if (kickedSeatNumbers.length > 0) {
        activeSeatsList = activeSeatsList.filter(
          (s) => !kickedSeatNumbers.includes(s.seat_number),
        );
      }

      // === PIPELINE: Activate all remaining seats in 1 round-trip ===
      const seatActivationUpdates = new Map<
        number,
        Record<string, string | number>
      >();
      for (const seat of activeSeatsList) {
        if (parseInt(seat.stack) === 0) continue; // already kicked
        if (
          seat.status === 'waiting_for_next_hand' ||
          seat.status === 'ready' ||
          seat.status === 'sitting'
        ) {
          seatActivationUpdates.set(seat.seat_number, {
            status: 'active',
            current_bet: '0',
            has_acted: '0',
            total_contributed: '0',
          });
          seat.status = 'active';
        } else if (seat.status === 'active' || seat.status === 'folded') {
          seatActivationUpdates.set(seat.seat_number, {
            status: 'active',
            current_bet: '0',
            has_used_extra_time: '0',
            has_acted: '0',
            total_contributed: '0',
          });
          seat.status = 'active';
        }
      }
      if (seatActivationUpdates.size > 0) {
        await this.stateService.setSeatsBulk(roomId, seatActivationUpdates);
      }

      const activePlayers = activeSeatsList.filter(
        (s) => s.status === 'active' && parseInt(s.stack) > 0,
      );

      if (activePlayers.length < 2) {
        this.clearAllTableTimers(roomId);
        await this.stateService.setTableState(roomId, {
          game_stage: 'waiting',
          total_pot: '0',
          current_highest_bet: '0',
          current_turn_seat: '0',
          community_cards: '',
        });
        await this.broadcastTableState(roomId);
        this.server
          .to(`table_${roomId}`)
          .emit('table:board-reset-state', { message: 'Bàn đã được reset' });
        await this.checkAndNotifyWaitingState(roomId);
        return;
      }

      // Record starting stack for all active players for reconciliation audit trail
      // Pipeline: ghi start_stack cho tất cả players trong 1 round-trip
      const startStackUpdates = new Map<
        number,
        Record<string, string | number>
      >();
      for (const player of activePlayers) {
        startStackUpdates.set(player.seat_number, {
          start_stack: player.stack,
        });
      }
      await this.stateService.setSeatsBulk(roomId, startStackUpdates);

      let dealerSeat = parseInt(tableStateBefore?.dealer_seat || '0');
      if (dealerSeat === 0) {
        const lastHand = await GameHand.findOne({
          where: { table_id: roomId },
          order: { started_at: 'DESC' },
        });
        if (lastHand) {
          dealerSeat = lastHand.dealer_seat;
        }
      }

      const dbTable = await PokerTable.findOne({ where: { id: roomId } });
      const maxPlayers = dbTable ? dbTable.max_players : 9;

      const findNextActiveSeat = (start: number): number => {
        let current = start;
        for (let i = 0; i < maxPlayers; i++) {
          current = (current % maxPlayers) + 1;
          const seat = activeSeatsList.find((s) => s.seat_number === current);
          if (seat && seat.status === 'active' && parseInt(seat.stack) > 0) {
            return current;
          }
        }
        return activePlayers[0].seat_number;
      };

      dealerSeat = findNextActiveSeat(dealerSeat);
      const sbSeat = findNextActiveSeat(dealerSeat);
      const bbSeat = findNextActiveSeat(sbSeat);

      const sbAmount = dbTable ? parseInt(dbTable.small_blind || '50') : 50;
      const bbAmount = dbTable ? parseInt(dbTable.big_blind || '100') : 100;
      const anteAmount = dbTable ? parseInt(dbTable.ante || '0') : 0;

      let isBombPot = false;
      if (dbTable?.custom_settings?.allow_bomb_pot) {
        const nextHandBomb = tableStateBefore?.next_hand_bomb_pot === '1';
        if (nextHandBomb || Math.random() < 0.1) {
          isBombPot = true;
        }
      }

      let anteCollected = 0;
      let sbBet = 0;
      let bbBet = 0;

      if (isBombPot) {
        const bombPotAnte = bbAmount * 5;
        const actualAntesMap = new Map<number, number>();
        for (const player of activePlayers) {
          const playerStack = parseInt(player.stack);
          const actualAnte = Math.min(playerStack, bombPotAnte);
          anteCollected += actualAnte;
          actualAntesMap.set(player.seat_number, actualAnte);
          player.stack = (playerStack - actualAnte).toString();
        }

        // Pipeline: ghi ante cho tất cả players + publish stream events trong 1 round-trip
        const bombAnteUpdates = new Map<
          number,
          Record<string, string | number>
        >();
        const bombAnteStreamEvents: Array<{
          userId: string;
          newStack: string;
          reason: string;
        }> = [];
        for (const player of activePlayers) {
          const actualAnte = actualAntesMap.get(player.seat_number) || 0;
          const currentContributed = parseInt(player.total_contributed || '0');
          bombAnteUpdates.set(player.seat_number, {
            stack: player.stack,
            total_contributed: (currentContributed + actualAnte).toString(),
          });
          if (actualAnte > 0) {
            bombAnteStreamEvents.push({
              userId: player.user_id,
              newStack: player.stack,
              reason: 'ante',
            });
          }
        }
        if (bombAnteUpdates.size > 0) {
          // Inline XADD into the same setSeatsBulk pipeline via direct Redis pipeline
          const redis = this.stateService.getRedisClient();
          const antePipeline = redis.pipeline();
          const ts = Date.now().toString();
          for (const [seatNum, fields] of bombAnteUpdates.entries()) {
            antePipeline.hset(`table:${roomId}:seat:${seatNum}`, fields);
          }
          for (const ev of bombAnteStreamEvents) {
            antePipeline.xadd(
              'stream:stack-changes',
              '*',
              'table_id',
              roomId,
              'user_id',
              ev.userId,
              'new_stack',
              ev.newStack,
              'reason',
              ev.reason,
              'ts',
              ts,
            );
          }
          await antePipeline.exec();
        }
      } else {
        if (anteAmount > 0) {
          const actualAntesMap = new Map<number, number>();
          for (const player of activePlayers) {
            const playerStack = parseInt(player.stack);
            const actualAnte = Math.min(playerStack, anteAmount);
            anteCollected += actualAnte;
            actualAntesMap.set(player.seat_number, actualAnte);
            player.stack = (playerStack - actualAnte).toString();
          }

          // Pipeline: ghi ante cho tất cả players + publish stream events trong 1 round-trip
          const anteUpdates = new Map<
            number,
            Record<string, string | number>
          >();
          const anteStreamEvents: Array<{
            userId: string;
            newStack: string;
            reason: string;
          }> = [];
          for (const player of activePlayers) {
            const actualAnte = actualAntesMap.get(player.seat_number) || 0;
            const currentContributed = parseInt(
              player.total_contributed || '0',
            );
            anteUpdates.set(player.seat_number, {
              stack: player.stack,
              total_contributed: (currentContributed + actualAnte).toString(),
            });
            if (actualAnte > 0) {
              anteStreamEvents.push({
                userId: player.user_id,
                newStack: player.stack,
                reason: 'ante',
              });
            }
          }
          if (anteUpdates.size > 0) {
            const redis = this.stateService.getRedisClient();
            const antePipeline = redis.pipeline();
            const ts = Date.now().toString();
            for (const [seatNum, fields] of anteUpdates.entries()) {
              antePipeline.hset(`table:${roomId}:seat:${seatNum}`, fields);
            }
            for (const ev of anteStreamEvents) {
              antePipeline.xadd(
                'stream:stack-changes',
                '*',
                'table_id',
                roomId,
                'user_id',
                ev.userId,
                'new_stack',
                ev.newStack,
                'reason',
                ev.reason,
                'ts',
                ts,
              );
            }
            await antePipeline.exec();
          }
        }

        const sbPlayer = activePlayers.find((s) => s.seat_number === sbSeat);
        const bbPlayer = activePlayers.find((s) => s.seat_number === bbSeat);

        // Pipeline: ghi blind cho SB/BB + publish stream events trong 1 round-trip
        const blindBulkUpdates = new Map<
          number,
          Record<string, string | number>
        >();
        const blindStreamEvents: Array<{
          userId: string;
          newStack: string;
          reason: string;
        }> = [];

        if (sbPlayer) {
          const currentStack = parseInt(sbPlayer.stack);
          sbBet = Math.min(currentStack, sbAmount);
          const sbStack = currentStack - sbBet;
          const sbContributed =
            parseInt(sbPlayer.total_contributed || '0') + sbBet;
          blindBulkUpdates.set(sbSeat, {
            stack: sbStack.toString(),
            current_bet: sbBet.toString(),
            total_contributed: sbContributed.toString(),
          });
          if (sbBet > 0)
            blindStreamEvents.push({
              userId: sbPlayer.user_id,
              newStack: sbStack.toString(),
              reason: 'blind',
            });
        }

        if (bbPlayer) {
          const currentStack = parseInt(bbPlayer.stack);
          bbBet = Math.min(currentStack, bbAmount);
          const bbStack = currentStack - bbBet;
          const bbContributed =
            parseInt(bbPlayer.total_contributed || '0') + bbBet;
          blindBulkUpdates.set(bbSeat, {
            stack: bbStack.toString(),
            current_bet: bbBet.toString(),
            total_contributed: bbContributed.toString(),
          });
          if (bbBet > 0)
            blindStreamEvents.push({
              userId: bbPlayer.user_id,
              newStack: bbStack.toString(),
              reason: 'blind',
            });
        }

        if (blindBulkUpdates.size > 0) {
          const redis = this.stateService.getRedisClient();
          const blindPipeline = redis.pipeline();
          const ts = Date.now().toString();
          for (const [seatNum, fields] of blindBulkUpdates.entries()) {
            blindPipeline.hset(`table:${roomId}:seat:${seatNum}`, fields);
          }
          for (const ev of blindStreamEvents) {
            blindPipeline.xadd(
              'stream:stack-changes',
              '*',
              'table_id',
              roomId,
              'user_id',
              ev.userId,
              'new_stack',
              ev.newStack,
              'reason',
              ev.reason,
              'ts',
              ts,
            );
          }
          await blindPipeline.exec();
        }
      }

      // 1. Get the last nonce for this table to calculate the next nonce
      const lastAudit = await ProvablyFairAudit.findOne({
        where: { table_id: roomId },
        order: { created_at: 'DESC' },
      });
      const nonce = lastAudit ? lastAudit.nonce + 1 : 1;

      // 2. Generate and hash the server seed
      const serverSeed = this.provablyFairService.generateServerSeed();
      const serverSeedHash =
        this.provablyFairService.hashServerSeed(serverSeed);

      // 3. Encrypt the server seed (AES-256-GCM)
      const { encryptedSeed, authTag } =
        this.provablyFairService.encryptServerSeed(serverSeed);

      let clientSeed = clientSeedOverride;
      if (!clientSeed) {
        clientSeed = tableStateBefore?.next_client_seed;
      }
      if (!clientSeed) {
        const representative = activeSeatsList.find(
          (s) => s.seat_number === dealerSeat,
        );
        clientSeed =
          representative && representative.status !== 'disconnected'
            ? `client-${representative.user_id}-${Date.now()}`
            : randomBytes(16).toString('hex');
      }
      await this.stateService.setTableState(roomId, {
        next_client_seed: '',
        next_hand_bomb_pot: '',
      });

      // 4. Shuffle the deck using ChaCha20 seeded by Combined Final Seed
      const shuffledDeck = this.provablyFairService.shuffleDeck(
        serverSeed,
        clientSeed,
        nonce,
      );

      const uniqueCardsInDeck = new Set(shuffledDeck);
      if (shuffledDeck.length !== 52 || uniqueCardsInDeck.size !== 52) {
        throw new Error(`LỖI HỆ THỐNG: Bộ bài bị trùng lặp.`);
      }

      // Calculate Deck Hash
      const deckHash = this.provablyFairService.calculateDeckHash(shuffledDeck);

      // 5. Create a ProvablyFairAudit record (revealed_at remains null during the hand)
      const audit = new ProvablyFairAudit();
      audit.table_id = roomId;
      audit.hand_id = '0'; // placeholder updated at showdown
      audit.server_seed_hash = serverSeedHash;
      audit.encrypted_server_seed = encryptedSeed;
      audit.auth_tag = authTag;
      audit.client_seed = clientSeed;
      audit.nonce = nonce;
      audit.deck_hash = deckHash;
      audit.algorithm_version = 'ChaCha20-v1';
      await audit.save();

      const sortedActivePlayers = [...activePlayers].sort((a, b) => {
        const distA =
          (a.seat_number - dealerSeat - 1 + maxPlayers) % maxPlayers;
        const distB =
          (b.seat_number - dealerSeat - 1 + maxPlayers) % maxPlayers;
        return distA - distB;
      });

      let cardIdx = 0;
      const pocketCardsMap = new Map<string, string[]>();
      for (const player of sortedActivePlayers) {
        pocketCardsMap.set(player.user_id, []);
      }

      for (const player of sortedActivePlayers) {
        pocketCardsMap.get(player.user_id).push(shuffledDeck[cardIdx++]);
      }
      for (const player of sortedActivePlayers) {
        pocketCardsMap.get(player.user_id).push(shuffledDeck[cardIdx++]);
      }

      // Pipeline: ghi bài ẩn của tất cả người chơi + bộ bài còn lại trong 1 round-trip
      let remainingDeck = shuffledDeck.slice(cardIdx);
      let communityCards = '';
      if (isBombPot) {
        const flopCards = remainingDeck.slice(0, 3);
        remainingDeck = remainingDeck.slice(3);
        communityCards = flopCards.join(',');
      }
      await this.stateService.setPlayerCardsBulk(
        roomId,
        pocketCardsMap,
        remainingDeck,
      );

      const integrity = await this.verifyCardIntegrity(roomId);
      if (!integrity) {
        await this.abortHand(
          roomId,
          'Card integrity check failed after dealing pocket cards.',
        );
        return;
      }

      const totalPot = anteCollected + sbBet + bbBet;
      const handId = randomUUID();

      const firstTurn = isBombPot ? sbSeat : findNextActiveSeat(bbSeat);
      const highestBetValue = Math.max(sbBet, bbBet);

      await this.stateService.setTableState(roomId, {
        game_stage: isBombPot ? 'flop' : 'preflop',
        total_pot: totalPot.toString(),
        current_highest_bet: isBombPot ? '0' : highestBetValue.toString(),
        last_full_raise_size: isBombPot ? '0' : bbAmount.toString(),
        dealer_seat: dealerSeat,
        small_blind_seat: sbSeat,
        big_blind_seat: bbSeat,
        community_cards: communityCards,
        current_turn_seat: firstTurn,
        encrypted_server_seed: encryptedSeed,
        auth_tag: authTag,
        provably_fair_nonce: nonce.toString(),
        provably_fair_audit_id: audit.id,
        server_seed_hash: serverSeedHash,
        client_seed: clientSeed,
        hand_started_at: Date.now().toString(),
        current_hand_id: handId,
        is_running_board: '',
        shuffled_deck: shuffledDeck.join(','),
        is_bomb_pot: isBombPot ? '1' : '0',
        is_rit_active: '0',
        rit_board2_cards: '',
        rit_voters: '',
        rit_votes_yes: '',
        rit_votes_no: '',
      });

      // Đồng bộ trạng thái chạy vào DB
      if (dbTable) {
        try {
          dbTable.status = 'running';
          await dbTable.save();
          await this.broadcastLobbyRoomStatus(roomId);
        } catch (e) {
          this.logger.error(
            `Lỗi cập nhật status running cho phòng: ${e.message}`,
          );
        }
      }

      this.server.to(`table_${roomId}`).emit('table:hand-started', {
        hand_id: handId,
        dealer_seat: dealerSeat,
        small_blind_seat: sbSeat,
        big_blind_seat: bbSeat,
        server_seed_hash: serverSeedHash,
        client_seed: clientSeed,
        nonce: nonce,
        is_bomb_pot: isBombPot,
        community_cards: communityCards ? communityCards.split(',') : [],
      });

      await Promise.all(
        activePlayers.map(async (player) => {
          const pocket = await this.stateService.getPlayerCards(
            roomId,
            player.user_id,
          );
          this.server
            .to(`user_${player.user_id}`)
            .emit('table:private-cards', { pocket_cards: pocket });
        }),
      );

      this.startActionTimer(roomId, firstTurn, 30);
      await this.broadcastTableState(roomId);
      this.checkAndTriggerBotAction(roomId);
    } catch (err) {
      this.logger.error(`Error in startNewHand: ${err.message}`, err.stack);
    } finally {
      await this.stateService.releaseLock(roomId);
    }
  }

  async abortHand(roomId: string, reason: string) {
    this.logger.error(`Aborting hand on table ${roomId}. Reason: ${reason}`);

    this.clearAllTableTimers(roomId);

    await this.stateService.setTableState(roomId, {
      game_stage: 'ended',
      total_pot: '0',
      current_highest_bet: '0',
      current_turn_seat: '0',
      community_cards: '',
    });

    const seats = await this.stateService.getAllSeats(roomId);
    for (const seat of seats) {
      await this.stateService.setSeat(roomId, seat.seat_number, {
        current_bet: '0',
        has_acted: '0',
        status:
          seat.status === 'active' || seat.status === 'folded'
            ? 'active'
            : seat.status,
      });
      await this.stateService.deletePlayerCards(roomId, seat.user_id);
    }

    await this.stateService.setDeck(roomId, []);

    const tableState = await this.stateService.getTableState(roomId);
    if (tableState && tableState.current_hand_id) {
      await this.stateService.deleteActionLogs(tableState.current_hand_id);
    }

    this.server.to(`table_${roomId}`).emit('table:hand-aborted', { reason });
    await this.broadcastTableState(roomId);
  }
}
