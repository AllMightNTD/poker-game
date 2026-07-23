import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import { TableSession } from '../entities/table_session.entity';

export interface StackChangeEvent {
  table_id: string;
  user_id: string;
  new_stack: string;
  reason: 'action' | 'ante' | 'blind' | 'hand_start';
  ts: string;
}

@Injectable()
export class PokerStreamService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PokerStreamService.name);

  // Dedicated Redis client for XREADGROUP (must NOT share with pipeline client)
  private consumerRedis: Redis;
  private consumerInterval: NodeJS.Timeout;

  static readonly STREAM_KEY = 'stream:stack-changes';
  static readonly GROUP_NAME = 'stack-settlers';
  static readonly CONSUMER_NAME = 'worker-1';
  // Flush interval: 5s balances DB freshness vs load
  static readonly FLUSH_INTERVAL_MS = 5_000;
  // Max messages per batch
  static readonly BATCH_SIZE = 500;

  constructor(private readonly configService: ConfigService) {}

  async onModuleInit() {
    const host = this.configService.get<string>('REDIS_HOST', 'localhost');
    const port = this.configService.get<number>('REDIS_PORT', 6380);
    const password = this.configService.get<string>('REDIS_PASSWORD');
    const isUpstash = host.includes('upstash.io');

    this.consumerRedis = new Redis({
      host,
      port,
      password: password || undefined,
      tls: isUpstash ? {} : undefined,
      enableReadyCheck: false,
      maxRetriesPerRequest: null,
      retryStrategy: (times) => Math.min(times * 500, 5000),
    });

    this.consumerRedis.on('error', (err) => {
      this.logger.error(`[PokerStreamService] Redis error: ${err.message}`);
    });

    // Create consumer group — MKSTREAM creates the stream if it doesn't exist
    try {
      await this.consumerRedis.xgroup(
        'CREATE',
        PokerStreamService.STREAM_KEY,
        PokerStreamService.GROUP_NAME,
        '$',
        'MKSTREAM',
      );
      this.logger.log(
        `[PokerStreamService] Consumer group '${PokerStreamService.GROUP_NAME}' created`,
      );
    } catch (err) {
      // BUSYGROUP = group already exists — expected on restart
      if (!err.message?.includes('BUSYGROUP')) {
        this.logger.error(
          `[PokerStreamService] Failed to create consumer group: ${err.message}`,
        );
      }
    }

    this.startConsumer();
  }

  onModuleDestroy() {
    if (this.consumerInterval) {
      clearInterval(this.consumerInterval);
    }
    if (this.consumerRedis) {
      this.consumerRedis.disconnect();
    }
  }

  /**
   * Start background consumer loop that flushes stream events to MySQL every 5s.
   */
  private startConsumer() {
    this.consumerInterval = setInterval(async () => {
      try {
        await this.consumeBatch();
      } catch (err) {
        this.logger.error(
          `[StackConsumer] Error in consume loop: ${err.message}`,
        );
      }
    }, PokerStreamService.FLUSH_INTERVAL_MS);
    this.logger.log(
      '[PokerStreamService] Stack-change consumer started (flush every 5s)',
    );
  }

  /**
   * Read a batch from the stream, deduplicate by (table_id, user_id),
   * bulk-write to MySQL, then ACK all processed messages.
   */
  private async consumeBatch(): Promise<void> {
    const results = await this.consumerRedis.xreadgroup(
      'GROUP',
      PokerStreamService.GROUP_NAME,
      PokerStreamService.CONSUMER_NAME,
      'COUNT',
      PokerStreamService.BATCH_SIZE.toString(),
      'STREAMS',
      PokerStreamService.STREAM_KEY,
      '>', // only new, undelivered messages
    );

    if (!results || !results.length) return;

    const [, messages] = results[0] as [string, [string, string[]][]];
    if (!messages || !messages.length) return;

    // Deduplicate: keep latest stack per (table_id, user_id) — later msgs override earlier
    const latestByKey = new Map<
      string,
      { tableId: string; userId: string; newStack: string }
    >();

    for (const [, fields] of messages) {
      // fields is a flat array: [key, value, key, value, ...]
      const fieldMap: Record<string, string> = {};
      for (let i = 0; i < fields.length; i += 2) {
        fieldMap[fields[i]] = fields[i + 1];
      }

      const tableId = fieldMap['table_id'];
      const userId = fieldMap['user_id'];
      const newStack = fieldMap['new_stack'];
      if (!tableId || !userId || newStack === undefined) continue;

      latestByKey.set(`${tableId}:${userId}`, { tableId, userId, newStack });
    }

    if (latestByKey.size === 0) return;

    // Bulk MySQL update — only deduplicated entries, fire-and-forget with error capture
    await Promise.all(
      [...latestByKey.values()].map(({ tableId, userId, newStack }) =>
        TableSession.update(
          { table_id: tableId, user_id: userId, member_status: 'active' },
          { chips_at_table: newStack },
        ).catch((err) =>
          this.logger.error(
            `[StackConsumer] MySQL update failed for user ${userId}: ${err.message}`,
          ),
        ),
      ),
    );

    // ACK all messages in the batch
    const allMsgIds = messages.map(([msgId]) => msgId);
    await this.consumerRedis.xack(
      PokerStreamService.STREAM_KEY,
      PokerStreamService.GROUP_NAME,
      ...allMsgIds,
    );

    // Trim stream to prevent unbounded memory growth (approximate, ~10k entries)
    await this.consumerRedis.xtrim(
      PokerStreamService.STREAM_KEY,
      'MAXLEN',
      '~',
      '10000',
    );

    this.logger.debug(
      `[StackConsumer] Flushed ${latestByKey.size} unique stack(s) to MySQL (batch: ${messages.length} event(s))`,
    );
  }
}
