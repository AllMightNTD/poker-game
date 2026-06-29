import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class PokerStateService implements OnModuleInit {
  private redis: Redis;

  constructor(private readonly configService: ConfigService) {}

  onModuleInit() {
    const host = this.configService.get<string>('REDIS_HOST', 'localhost');
    const port = this.configService.get<number>('REDIS_PORT', 6380);
    const password = this.configService.get<string>('REDIS_PASSWORD');

    this.redis = new Redis({
      host,
      port,
      password: password || undefined,
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
  async getTableState(tableId: string): Promise<Record<string, string> | null> {
    const key = `table:${tableId}:state`;
    const data = await this.redis.hgetall(key);
    return Object.keys(data).length > 0 ? data : null;
  }

  async setTableState(tableId: string, fields: Record<string, string | number>): Promise<void> {
    const key = `table:${tableId}:state`;
    await this.redis.hset(key, fields);
  }

  async deleteTableState(tableId: string): Promise<void> {
    const key = `table:${tableId}:state`;
    await this.redis.del(key);
  }

  /**
   * Lưu/Đọc Trạng thái ghế ngồi
   */
  async getSeat(tableId: string, seatNumber: number): Promise<Record<string, string> | null> {
    const key = `table:${tableId}:seat:${seatNumber}`;
    const data = await this.redis.hgetall(key);
    return Object.keys(data).length > 0 ? data : null;
  }

  async setSeat(tableId: string, seatNumber: number, fields: Record<string, string | number>): Promise<void> {
    const key = `table:${tableId}:seat:${seatNumber}`;
    await this.redis.hset(key, fields);
  }

  async deleteSeat(tableId: string, seatNumber: number): Promise<void> {
    const key = `table:${tableId}:seat:${seatNumber}`;
    await this.redis.del(key);
  }

  async getAllSeats(tableId: string, maxPlayers = 9): Promise<Array<Record<string, string> & { seat_number: number }>> {
    const seats = [];
    for (let i = 1; i <= maxPlayers; i++) {
      const data = await this.getSeat(tableId, i);
      if (data) {
        seats.push({
          ...data,
          seat_number: i,
        });
      }
    }
    return seats;
  }

  /**
   * Lưu/Đọc Bài tẩy của từng người chơi (Bảo mật)
   */
  async getPlayerCards(tableId: string, userId: string): Promise<string[]> {
    const key = `table:${tableId}:player:${userId}:cards`;
    const cardsStr = await this.redis.get(key);
    return cardsStr ? cardsStr.split(',') : [];
  }

  async setPlayerCards(tableId: string, userId: string, cards: string[]): Promise<void> {
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
}
