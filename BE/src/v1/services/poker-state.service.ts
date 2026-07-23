import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import { PokerTableState, PokerSeatState } from '../types/poker.types';

@Injectable()
export class PokerStateService implements OnModuleInit {
  private redis: Redis;

  constructor(private readonly configService: ConfigService) {}

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

  async setTableState(
    tableId: string,
    fields: Record<string, string | number>,
  ): Promise<void> {
    const key = `table:${tableId}:state`;
    await this.redis.hset(key, {
      ...fields,
      last_activity: Date.now().toString(),
    });
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
    await this.redis.hset(key, fields);
  }

  async deleteSeat(tableId: string, seatNumber: number): Promise<void> {
    const key = `table:${tableId}:seat:${seatNumber}`;
    await this.redis.del(key);
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
    }

    // Write table state atomically alongside seat updates
    if (tableStateFields && Object.keys(tableStateFields).length > 0) {
      pipeline.hset(`table:${tableId}:state`, {
        ...tableStateFields,
        last_activity: now,
      });
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
