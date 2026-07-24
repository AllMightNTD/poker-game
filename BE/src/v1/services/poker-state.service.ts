import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import { PokerTableState, PokerSeatState } from '../types/poker.types';

@Injectable()
export class PokerStateService implements OnModuleInit {
  private redis: Redis;

  static readonly SNAPSHOT_SEAT_FIELDS = [
    'user_id',
    'username',
    'avatar',
    'stack',
    'current_bet',
    'status',
    'has_used_extra_time',
    'is_bot',
    'pending_add_amount',
    'pending_remove_amount',
  ];

  static readonly SNAPSHOT_TABLE_FIELDS = [
    'game_stage',
    'total_pot',
    'current_highest_bet',
    'current_turn_seat',
    'dealer_seat',
    'small_blind_seat',
    'big_blind_seat',
    'community_cards',
    'last_full_raise_size',
    'pending_shuffle_seats',
  ];

  constructor(private readonly configService: ConfigService) {}

  /**
   * Helper private: Ánh xạ seats và table fields thành snapshot phẳng
   */
  private buildSnapshotFields(
    seats: PokerSeatState[],
    tableFields: Record<string, string | number>,
  ): Record<string, string | number> {
    const snapshot: Record<string, string | number> = {};

    // Map table fields
    for (const field of PokerStateService.SNAPSHOT_TABLE_FIELDS) {
      if (tableFields[field] !== undefined && tableFields[field] !== null) {
        snapshot[field] = tableFields[field];
      }
    }

    // Map seats
    for (const seat of seats) {
      const seatNum = seat.seat_number;
      for (const field of PokerStateService.SNAPSHOT_SEAT_FIELDS) {
        if (seat[field] !== undefined && seat[field] !== null) {
          snapshot[`seat_${seatNum}_${field}`] = seat[field] as string | number;
        }
      }
    }

    return snapshot;
  }

  /**
   * Thêm lệnh HSET ghi toàn bộ snapshot vào pipeline
   */
  buildSnapshotFromSeatsAndState(
    pipeline: any,
    tableId: string,
    seats: PokerSeatState[],
    tableFields: Record<string, string | number>,
  ): void {
    const fields = this.buildSnapshotFields(seats, tableFields);
    if (Object.keys(fields).length > 0) {
      pipeline.hset(`table:${tableId}:snapshot`, fields);
    }
  }

  /**
   * Cập nhật một phần fields của ghế ngồi vào snapshot
   */
  updateSnapshotSeatFields(
    pipeline: any,
    tableId: string,
    seatNumber: number,
    fields: Record<string, string | number>,
  ): void {
    const updateFields: Record<string, string | number> = {};
    const prefix = `seat_${seatNumber}_`;
    for (const field of PokerStateService.SNAPSHOT_SEAT_FIELDS) {
      if (fields[field] !== undefined && fields[field] !== null) {
        updateFields[`${prefix}${field}`] = fields[field];
      }
    }
    // Default is_bot to '0' if user_id is set but is_bot is undefined
    if (fields.user_id && fields.is_bot === undefined) {
      updateFields[`${prefix}is_bot`] = '0';
    }
    if (Object.keys(updateFields).length > 0) {
      pipeline.hset(`table:${tableId}:snapshot`, updateFields);
    }
  }

  /**
   * Cập nhật một phần fields của bàn chơi vào snapshot
   */
  updateSnapshotTableFields(
    pipeline: any,
    tableId: string,
    fields: Record<string, string | number>,
  ): void {
    const updateFields: Record<string, string | number> = {};
    for (const field of PokerStateService.SNAPSHOT_TABLE_FIELDS) {
      if (fields[field] !== undefined && fields[field] !== null) {
        updateFields[field] = fields[field];
      }
    }
    if (Object.keys(updateFields).length > 0) {
      pipeline.hset(`table:${tableId}:snapshot`, updateFields);
    }
  }

  /**
   * Xóa các fields liên quan đến ghế ngồi khỏi snapshot
   */
  clearSeatFromSnapshot(
    pipeline: any,
    tableId: string,
    seatNumber: number,
  ): void {
    const fieldsToDel = PokerStateService.SNAPSHOT_SEAT_FIELDS.map(
      (f) => `seat_${seatNumber}_${f}`,
    );
    pipeline.hdel(`table:${tableId}:snapshot`, ...fieldsToDel);
  }

  onModuleInit() {
    const host = this.configService.get<string>('REDIS_HOST', 'localhost');
    const port = this.configService.get<number>('REDIS_PORT', 6380);
    const password = this.configService.get<string>('REDIS_PASSWORD');
    const isUpstash = host.includes('upstash.io');

    this.redis = new Redis({
      host,
      port,
      password: password || undefined,
      // TLS is required for Upstash Redis cloud connections
      tls: isUpstash ? {} : undefined,
      // Upstash does not support Redis CONFIG commands (READY check)
      enableReadyCheck: false,
      // Allow long-running commands (e.g. BLPOP in BullMQ)
      maxRetriesPerRequest: null,
      // Exponential backoff reconnect: 500ms → 5s cap
      retryStrategy: (times) => Math.min(times * 500, 5000),
    });

    // Catch unhandled Redis errors to prevent server crash
    this.redis.on('error', (err) => {
      console.error('[PokerStateService] Redis error:', err.message);
    });
  }

  getRedisClient(): Redis {
    return this.redis;
  }

  /**
   * Khóa bàn chơi chống race-conditions (Redis Distributed Lock)
   */
  async acquireLock(tableId: string, ttlMs = 2000): Promise<boolean> {
    const key = `lock:table:${tableId}`;
    const result = await this.redis.set(key, '1', 'PX', ttlMs, 'NX');
    return result === 'OK';
  }

  async releaseLock(tableId: string): Promise<void> {
    const key = `lock:table:${tableId}`;
    await this.redis.del(key);
  }

  /**
   * Lưu/Đọc Trạng thái bàn chơi
   */
  async getTableState(tableId: string): Promise<PokerTableState | null> {
    const key = `table:${tableId}:state`;
    const data = await this.redis.hgetall(key);
    return Object.keys(data).length > 0 ? data : null;
  }

  async getTableSnapshot(
    tableId: string,
    maxPlayers = 9,
  ): Promise<{ tableState: PokerTableState | null; seats: PokerSeatState[] }> {
    const key = `table:${tableId}:snapshot`;
    const data = await this.redis.hgetall(key);

    if (Object.keys(data).length === 0) {
      return { tableState: null, seats: [] };
    }

    // Parse table state fields
    const tableState: PokerTableState = {};
    for (const field of PokerStateService.SNAPSHOT_TABLE_FIELDS) {
      if (data[field] !== undefined) {
        tableState[field] = data[field];
      }
    }

    // Parse seats
    const seats: PokerSeatState[] = [];
    for (let i = 1; i <= maxPlayers; i++) {
      const seatPrefix = `seat_${i}_`;
      const seatData: Record<string, any> = {};
      let hasSeatData = false;

      for (const field of PokerStateService.SNAPSHOT_SEAT_FIELDS) {
        const keyInSnapshot = `${seatPrefix}${field}`;
        if (data[keyInSnapshot] !== undefined) {
          seatData[field] = data[keyInSnapshot];
          hasSeatData = true;
        }
      }

      if (hasSeatData) {
        seats.push({
          ...seatData,
          seat_number: i,
        } as unknown as PokerSeatState);
      }
    }

    return { tableState, seats };
  }

  async setTableState(
    tableId: string,
    fields: Record<string, string | number>,
  ): Promise<void> {
    const key = `table:${tableId}:state`;
    const pipeline = this.redis.pipeline();
    pipeline.hset(key, {
      ...fields,
      last_activity: Date.now().toString(),
    });
    this.updateSnapshotTableFields(pipeline, tableId, fields);
    await pipeline.exec();
  }

  async deleteTableState(tableId: string): Promise<void> {
    const key = `table:${tableId}:state`;
    await this.redis.del(key);
  }

  /**
   * Lưu/Đọc Trạng thái ghế ngồi
   */
  async getSeat(
    tableId: string,
    seatNumber: number,
  ): Promise<PokerSeatState | null> {
    const key = `table:${tableId}:seat:${seatNumber}`;
    const data = await this.redis.hgetall(key);
    return Object.keys(data).length > 0
      ? (data as unknown as PokerSeatState)
      : null;
  }

  async setSeat(
    tableId: string,
    seatNumber: number,
    fields: Record<string, string | number>,
  ): Promise<void> {
    const key = `table:${tableId}:seat:${seatNumber}`;
    const pipeline = this.redis.pipeline();
    pipeline.hset(key, fields);
    this.updateSnapshotSeatFields(pipeline, tableId, seatNumber, fields);
    await pipeline.exec();
  }

  async deleteSeat(tableId: string, seatNumber: number): Promise<void> {
    const key = `table:${tableId}:seat:${seatNumber}`;
    const pipeline = this.redis.pipeline();
    pipeline.del(key);
    this.clearSeatFromSnapshot(pipeline, tableId, seatNumber);
    await pipeline.exec();
  }

  async getAllSeats(
    tableId: string,
    maxPlayers = 9,
  ): Promise<PokerSeatState[]> {
    // Pipeline: fetch all seat hashes in a single round-trip instead of N sequential HGETALL calls
    const pipeline = this.redis.pipeline();
    for (let i = 1; i <= maxPlayers; i++) {
      pipeline.hgetall(`table:${tableId}:seat:${i}`);
    }
    const results = await pipeline.exec();

    const seats: PokerSeatState[] = [];
    if (!results) return seats;

    for (let i = 0; i < maxPlayers; i++) {
      const [err, data] = results[i] as [Error | null, Record<string, string>];
      if (err || !data || Object.keys(data).length === 0) continue;
      seats.push({
        ...data,
        seat_number: i + 1,
      } as PokerSeatState);
    }
    return seats;
  }

  /**
   * Pipeline: Cập nhật nhiều ghế ngồi trong 1 round-trip Redis
   * Input: Map từ seatNumber → fields
   */
  async setSeatsBulk(
    tableId: string,
    updates: Map<number, Record<string, string | number>>,
  ): Promise<void> {
    if (updates.size === 0) return;
    const pipeline = this.redis.pipeline();
    for (const [seatNumber, fields] of updates.entries()) {
      pipeline.hset(`table:${tableId}:seat:${seatNumber}`, fields);
      this.updateSnapshotSeatFields(pipeline, tableId, seatNumber, fields);
    }
    await pipeline.exec();
  }

  /**
   * Pipeline: Cập nhật nhiều ghế + table state đồng thời trong 1 round-trip Redis.
   * Đây là phương thức nòng cốt cho hot path của action processor.
   * stackChanges (optional): khi có giá trị, sẽ XADD event vào Redis Stream trong cùng pipeline.
   */
  async setMultipleSeatsAndTableState(
    tableId: string,
    seatUpdates: Map<number, Record<string, string | number>>,
    tableStateFields?: Record<string, string | number>,
    actionLogEntry?: { handId: string; logJson: string },
    stackChanges?: Array<{ userId: string; newStack: string; reason: string }>,
  ): Promise<void> {
    const pipeline = this.redis.pipeline();
    const now = Date.now().toString();

    // Write all seat updates
    for (const [seatNumber, fields] of seatUpdates.entries()) {
      pipeline.hset(`table:${tableId}:seat:${seatNumber}`, fields);
      this.updateSnapshotSeatFields(pipeline, tableId, seatNumber, fields);
    }

    // Write table state atomically alongside seat updates
    if (tableStateFields && Object.keys(tableStateFields).length > 0) {
      pipeline.hset(`table:${tableId}:state`, {
        ...tableStateFields,
        last_activity: now,
      });
      this.updateSnapshotTableFields(pipeline, tableId, tableStateFields);
    }

    // Append action log if provided
    if (actionLogEntry) {
      pipeline.rpush(
        `hand:${actionLogEntry.handId}:actions`,
        actionLogEntry.logJson,
      );
    }

    // Publish stack-change events to Redis Stream (inline, zero extra round-trip)
    if (stackChanges?.length) {
      for (const change of stackChanges) {
        pipeline.xadd(
          'stream:stack-changes',
          '*', // auto-generate stream ID
          'table_id',
          tableId,
          'user_id',
          change.userId,
          'new_stack',
          change.newStack,
          'reason',
          change.reason,
          'ts',
          now,
        );
      }
    }

    await pipeline.exec();
  }

  /**
   * Lưu/Đọc Bài tẩy của từng người chơi (Bảo mật)
   */
  async getPlayerCards(tableId: string, userId: string): Promise<string[]> {
    const key = `table:${tableId}:player:${userId}:cards`;
    const cardsStr = await this.redis.get(key);
    return cardsStr ? cardsStr.split(',') : [];
  }

  async setPlayerCards(
    tableId: string,
    userId: string,
    cards: string[],
  ): Promise<void> {
    const key = `table:${tableId}:player:${userId}:cards`;
    if (cards.length === 0) {
      await this.redis.del(key);
    } else {
      await this.redis.set(key, cards.join(','));
    }
  }

  async deletePlayerCards(tableId: string, userId: string): Promise<void> {
    const key = `table:${tableId}:player:${userId}:cards`;
    await this.redis.del(key);
  }

  /**
   * Pipeline: Xóa bài ẩn của nhiều người chơi trong 1 round-trip
   */
  async deletePlayerCardsBulk(
    tableId: string,
    userIds: string[],
  ): Promise<void> {
    if (!userIds.length) return;
    const pipeline = this.redis.pipeline();
    for (const userId of userIds) {
      pipeline.del(`table:${tableId}:player:${userId}:cards`);
    }
    await pipeline.exec();
  }

  /**
   * Pipeline: Ghi bài ẩn của nhiều người chơi + còn lại của bộ bài trong 1 round-trip
   */
  async setPlayerCardsBulk(
    tableId: string,
    cardsMap: Map<string, string[]>,
    remainingDeck?: string[],
  ): Promise<void> {
    const pipeline = this.redis.pipeline();
    for (const [userId, cards] of cardsMap.entries()) {
      const key = `table:${tableId}:player:${userId}:cards`;
      if (cards.length === 0) {
        pipeline.del(key);
      } else {
        pipeline.set(key, cards.join(','));
      }
    }
    if (remainingDeck !== undefined) {
      const deckKey = `table:${tableId}:deck`;
      pipeline.del(deckKey);
      if (remainingDeck.length > 0) {
        pipeline.rpush(deckKey, ...remainingDeck);
      }
    }
    await pipeline.exec();
  }

  /**
   * Lưu/Đọc Bộ bài còn lại
   */
  async getDeck(tableId: string): Promise<string[]> {
    const key = `table:${tableId}:deck`;
    return this.redis.lrange(key, 0, -1);
  }

  async setDeck(tableId: string, deck: string[]): Promise<void> {
    const key = `table:${tableId}:deck`;
    await this.redis.del(key);
    if (deck.length > 0) {
      await this.redis.rpush(key, ...deck);
    }
  }

  /**
   * Lưu Nhật ký Hành động tạm thời vào Redis List
   */
  async pushActionLog(handId: string, actionLogJson: string): Promise<void> {
    const key = `hand:${handId}:actions`;
    await this.redis.rpush(key, actionLogJson);
  }

  async getActionLogs(handId: string): Promise<string[]> {
    const key = `hand:${handId}:actions`;
    return this.redis.lrange(key, 0, -1);
  }

  async deleteActionLogs(handId: string): Promise<void> {
    const key = `hand:${handId}:actions`;
    await this.redis.del(key);
  }

  /**
   * Quản lý Spectators
   */
  async addSpectator(tableId: string, socketId: string): Promise<void> {
    const key = `table:${tableId}:spectators`;
    await this.redis.sadd(key, socketId);
  }

  async removeSpectator(tableId: string, socketId: string): Promise<void> {
    const key = `table:${tableId}:spectators`;
    await this.redis.srem(key, socketId);
  }

  async getSpectatorsCount(tableId: string): Promise<number> {
    const key = `table:${tableId}:spectators`;
    return this.redis.scard(key);
  }

  /**
   * Xoá toàn bộ Key liên quan tới Table (Dùng khi Destroy Room)
   */
  async deleteAllTableKeys(tableId: string): Promise<void> {
    // Xoá tất cả table keys
    let cursor = '0';
    do {
      const [nextCursor, keys] = await this.redis.scan(
        cursor,
        'MATCH',
        `table:${tableId}:*`,
        'COUNT',
        100,
      );
      cursor = nextCursor;
      if (keys.length > 0) {
        await this.redis.del(...keys);
      }
    } while (cursor !== '0');

    // Xoá tất cả lock keys của table
    cursor = '0';
    do {
      const [nextCursor, keys] = await this.redis.scan(
        cursor,
        'MATCH',
        `lock:table:${tableId}*`,
        'COUNT',
        100,
      );
      cursor = nextCursor;
      if (keys.length > 0) {
        await this.redis.del(...keys);
      }
    } while (cursor !== '0');
  }

  /**
   * Lưu Chat Message vào Redis List
   */
  async pushChatMessage(tableId: string, chatJson: string): Promise<void> {
    const key = `table:${tableId}:chats`;
    await this.redis.rpush(key, chatJson);
    await this.redis.ltrim(key, -1000, -1);
  }

  /**
   * Lấy Lịch sử Chat phân trang từ đuôi (mới nhất)
   */
  async getChatHistory(
    tableId: string,
    offset: number,
    limit: number,
  ): Promise<string[]> {
    const key = `table:${tableId}:chats`;
    const start = -limit - offset;
    const end = -1 - offset;
    return this.redis.lrange(key, start, end);
  }
}
