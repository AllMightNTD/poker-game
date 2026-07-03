import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { createHash, randomBytes, randomUUID } from 'crypto';
import { Server } from 'socket.io';
import { GameHand } from '../entities/game_hand.entity';
import { PokerTable } from '../entities/poker_table.entity';
import { TableSession } from '../entities/table_session.entity';
import { PokerGameEngine } from './poker-game.engine';
import { PokerLobbyService } from './poker-lobby.service';
import { PokerStateService } from './poker-state.service';
import { PokerBotManager } from './poker-bot.manager';
import { PokerShowdownManager } from './poker-showdown.manager';
import { PokerActionProcessor } from './poker-action.processor';

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

  private readonly botManager = new PokerBotManager(this);
  private readonly showdownManager = new PokerShowdownManager(this);
  private readonly actionProcessor = new PokerActionProcessor(this);

  constructor(
    readonly lobbyService: PokerLobbyService,
    readonly stateService: PokerStateService,
  ) {
    this.startIdleCleanupInterval();
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
    winnersLog: any[],
    totalRakedPotAmount: number,
    tableState: any,
    seats: any[],
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
          this.logger.error(`Error refunding user ${sess.user_id}: ${err.message}`);
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
  }

  /**
   * State and DB helpers
   */
  async syncSeatStackToDb(tableId: string, userId: string, newStack: string) {
    try {
      const sess = await TableSession.findOne({
        where: { table_id: tableId, user_id: userId, member_status: 'active' },
      });
      if (sess) {
        sess.chips_at_table = newStack;
        await sess.save();
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
      seats: sanitizedSeats,
    };

    if (!this.server) return;

    const sockets = await this.server.in(`table_${roomId}`).fetchSockets();
    const seatedUserIds = seats.map((s) => String(s.user_id));

    for (const socket of sockets) {
      const socketUserId = socket.data?.user?.id;
      const isSeated = socketUserId && seatedUserIds.includes(String(socketUserId));

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
      this.logger.log(`Table ${roomId} has enough players, starting Auto-Start countdown...`);
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

      for (const seat of seats) {
        await this.stateService.deletePlayerCards(roomId, seat.user_id);
      }
      await this.stateService.setTableState(roomId, { community_cards: '' });

      const kickPlayer = async (userId: string, seatNumber: number) => {
        try {
          await this.lobbyService.leaveRoom(userId, roomId);
          this.cancelDisconnectTimeout(roomId, userId);
          this.server.to(`table_${roomId}`).emit('table:player-stood-up', {
            seat_number: seatNumber,
            user_id: userId,
          });
          activeSeatsList = activeSeatsList.filter(
            (s) => s.seat_number !== seatNumber,
          );
        } catch (err) {
          this.logger.error(
            `Error auto-kicking player ${userId}: ${err.message}`,
          );
        }
      };

      const redis = this.stateService.getRedisClient();
      const currentSeats = [...seats];
      for (const seat of currentSeats) {
        if (seat.pending_leave === '1') {
          this.logger.log(`User ${seat.user_id} has pending leave. Kicking from seat.`);
          await kickPlayer(seat.user_id, seat.seat_number);
          continue;
        }

        const statsKey = `table:${roomId}:player:${seat.user_id}:stats`;
        if (seat.status === 'sitting_out' || (seat.disconnected_at && seat.disconnected_at !== '0')) {
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
      }

      for (const seat of activeSeatsList) {
        const currentStack = parseInt(seat.stack);
        if (currentStack === 0) {
          this.logger.log(
            `User ${seat.user_id} has 0 chips. Auto-kicking from seat.`,
          );
          await kickPlayer(seat.user_id, seat.seat_number);
          continue;
        }
        if (seat.status === 'waiting_for_next_hand') {
          await this.stateService.setSeat(roomId, seat.seat_number, {
            status: 'active',
            current_bet: '0',
            has_acted: '0',
            total_contributed: '0',
          });
          seat.status = 'active';
        } else if (seat.status === 'active' || seat.status === 'folded') {
          await this.stateService.setSeat(roomId, seat.seat_number, {
            status: 'active',
            current_bet: '0',
            has_used_extra_time: '0',
            has_acted: '0',
            total_contributed: '0',
          });
          seat.status = 'active';
        }
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
      for (const player of activePlayers) {
        await this.stateService.setSeat(roomId, player.seat_number, {
          start_stack: player.stack,
        });
      }

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

      const anteAmount = dbTable ? parseInt(dbTable.ante || '0') : 0;
      let anteCollected = 0;

      if (anteAmount > 0) {
        for (const player of activePlayers) {
          const playerStack = parseInt(player.stack);
          const actualAnte = Math.min(playerStack, anteAmount);
          const newStack = playerStack - actualAnte;
          anteCollected += actualAnte;
          player.stack = newStack.toString();
          const currentContributed = parseInt(player.total_contributed || '0');
          await this.stateService.setSeat(roomId, player.seat_number, {
            stack: newStack.toString(),
            total_contributed: (currentContributed + actualAnte).toString(),
          });
          await this.syncSeatStackToDb(
            roomId,
            player.user_id,
            newStack.toString(),
          );
        }
      }

      const serverSeed = randomBytes(32).toString('hex');
      const serverSeedHash = createHash('sha256')
        .update(serverSeed)
        .digest('hex');

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
      await this.stateService.setTableState(roomId, { next_client_seed: '' });

      const shuffledDeck = PokerGameEngine.shuffleDeck(serverSeed, clientSeed);

      const uniqueCardsInDeck = new Set(shuffledDeck);
      if (shuffledDeck.length !== 52 || uniqueCardsInDeck.size !== 52) {
        throw new Error(`LỖI HỆ THỐNG: Bộ bài bị trùng lặp.`);
      }

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

      for (const player of sortedActivePlayers) {
        const cards = pocketCardsMap.get(player.user_id);
        await this.stateService.setPlayerCards(roomId, player.user_id, cards);
      }

      const remainingDeck = shuffledDeck.slice(cardIdx);
      await this.stateService.setDeck(roomId, remainingDeck);

      const integrity = await this.verifyCardIntegrity(roomId);
      if (!integrity) {
        await this.abortHand(
          roomId,
          'Card integrity check failed after dealing pocket cards.',
        );
        return;
      }

      const sbAmount = parseInt(tableStateBefore?.small_blind || '50');
      const bbAmount = sbAmount * 2;

      const sbPlayer = activePlayers.find((s) => s.seat_number === sbSeat);
      const bbPlayer = activePlayers.find((s) => s.seat_number === bbSeat);

      let sbBet = 0;
      let bbBet = 0;

      if (sbPlayer) {
        const currentStack = parseInt(sbPlayer.stack);
        sbBet = Math.min(currentStack, sbAmount);
        const sbStack = currentStack - sbBet;
        const sbContributed =
          parseInt(sbPlayer.total_contributed || '0') + sbBet;
        await this.stateService.setSeat(roomId, sbSeat, {
          stack: sbStack.toString(),
          current_bet: sbBet.toString(),
          total_contributed: sbContributed.toString(),
        });
        await this.syncSeatStackToDb(
          roomId,
          sbPlayer.user_id,
          sbStack.toString(),
        );
      }

      if (bbPlayer) {
        const currentStack = parseInt(bbPlayer.stack);
        bbBet = Math.min(currentStack, bbAmount);
        const bbStack = currentStack - bbBet;
        const bbContributed =
          parseInt(bbPlayer.total_contributed || '0') + bbBet;
        await this.stateService.setSeat(roomId, bbSeat, {
          stack: bbStack.toString(),
          current_bet: bbBet.toString(),
          total_contributed: bbContributed.toString(),
        });
        await this.syncSeatStackToDb(
          roomId,
          bbPlayer.user_id,
          bbStack.toString(),
        );
      }

      const totalPot = anteCollected + sbBet + bbBet;
      const handId = randomUUID();

      const firstTurn = findNextActiveSeat(bbSeat);

      const highestBetValue = Math.max(sbBet, bbBet);

      await this.stateService.setTableState(roomId, {
        game_stage: 'preflop',
        total_pot: totalPot.toString(),
        current_highest_bet: highestBetValue.toString(),
        last_full_raise_size: bbAmount.toString(),
        dealer_seat: dealerSeat,
        small_blind_seat: sbSeat,
        big_blind_seat: bbSeat,
        community_cards: '',
        current_turn_seat: firstTurn,
        server_seed: serverSeed,
        server_seed_hash: serverSeedHash,
        client_seed: clientSeed,
        hand_started_at: Date.now().toString(),
        current_hand_id: handId,
        is_running_board: '',
        shuffled_deck: shuffledDeck.join(','),
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
      });

      for (const player of activePlayers) {
        const pocket = await this.stateService.getPlayerCards(
          roomId,
          player.user_id,
        );
        this.server
          .to(`user_${player.user_id}`)
          .emit('table:private-cards', { pocket_cards: pocket });
      }

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
