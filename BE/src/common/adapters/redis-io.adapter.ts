import { IoAdapter } from '@nestjs/platform-socket.io';
import { ServerOptions } from 'socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import Redis from 'ioredis';
import { INestApplicationContext, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export class RedisIoAdapter extends IoAdapter {
  private adapterConstructor: ReturnType<typeof createAdapter>;
  private readonly logger = new Logger(RedisIoAdapter.name);

  constructor(private readonly app: INestApplicationContext) {
    super(app);
  }

  async connectToRedis(): Promise<void> {
    const configService = this.app.get(ConfigService);
    const host = configService.get<string>('REDIS_HOST', 'localhost');
    const port = configService.get<number>('REDIS_PORT', 6379);
    const password = configService.get<string>('REDIS_PASSWORD');
    const isUpstash = host.includes('upstash.io');

    const redisConfig = {
      host,
      port,
      password: password || undefined,
      tls: isUpstash ? {} : undefined,
      enableReadyCheck: false,
      maxRetriesPerRequest: null,
      retryStrategy: (times: number) => Math.min(times * 500, 5000),
    };

    const pubClient = new Redis(redisConfig);
    const subClient = new Redis(redisConfig);

    pubClient.on('error', (err) => {
      this.logger.error(`Redis Publisher connection error: ${err.message}`);
    });

    subClient.on('error', (err) => {
      this.logger.error(`Redis Subscriber connection error: ${err.message}`);
    });

    const connectionTimeout = new Promise<void>((_, reject) =>
      setTimeout(
        () => reject(new Error('Redis connection timeout after 10 seconds')),
        10000,
      ),
    );

    const connectionPromises = Promise.all([
      new Promise<void>((resolve, reject) => {
        pubClient.once('ready', () => {
          this.logger.log('Redis Publisher is ready.');
          resolve();
        });
        pubClient.once('error', (err) => reject(err));
      }),
      new Promise<void>((resolve, reject) => {
        subClient.once('ready', () => {
          this.logger.log('Redis Subscriber is ready.');
          resolve();
        });
        subClient.once('error', (err) => reject(err));
      }),
    ]);

    try {
      await Promise.race([connectionPromises, connectionTimeout]);
      this.adapterConstructor = createAdapter(pubClient, subClient);
      this.logger.log(
        'Redis IoAdapter successfully connected and initialized.',
      );
    } catch (err) {
      this.logger.error(`Failed to initialize Redis IoAdapter: ${err.message}`);
      throw err;
    }
  }

  createIOServer(port: number, options?: ServerOptions): any {
    const server = super.createIOServer(port, options);
    server.adapter(this.adapterConstructor);
    return server;
  }
}
