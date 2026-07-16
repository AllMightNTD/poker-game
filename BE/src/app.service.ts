import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DataSource } from 'typeorm';
import Redis from 'ioredis';

@Injectable()
export class AppService {
  private redis: Redis;

  constructor(
    private readonly dataSource: DataSource,
    private readonly configService: ConfigService,
  ) {
    const host = this.configService.get<string>('REDIS_HOST', 'localhost');
    const port = this.configService.get<number>('REDIS_PORT', 6379);
    const password = this.configService.get<string>('REDIS_PASSWORD');
    const isUpstash = host.includes('upstash.io');

    this.redis = new Redis({
      host,
      port,
      password: password || undefined,
      tls: isUpstash ? {} : undefined,
      enableReadyCheck: false,
      maxRetriesPerRequest: null,
      retryStrategy: (times) => Math.min(times * 500, 5000),
      lazyConnect: true,
    });

    this.redis.on('error', () => {
      // Silently handle to prevent crash; status will show "disconnected"
    });
  }

  async getSystemInfo() {
    const uptimeSeconds = process.uptime();
    const hours = Math.floor(uptimeSeconds / 3600);
    const minutes = Math.floor((uptimeSeconds % 3600) / 60);
    const seconds = Math.floor(uptimeSeconds % 60);
    const uptimeFormatted = `${hours}h ${minutes}m ${seconds}s`;

    // Deep check: Database
    let dbStatus = 'disconnected';
    try {
      if (this.dataSource.isInitialized) {
        await this.dataSource.query('SELECT 1');
        dbStatus = 'connected';
      }
    } catch {
      dbStatus = 'disconnected';
    }

    // Deep check: Redis
    let redisStatus = 'disconnected';
    try {
      const pong = await this.redis.ping();
      if (pong === 'PONG') {
        redisStatus = 'connected';
      }
    } catch {
      redisStatus = 'disconnected';
    }

    const allConnected =
      dbStatus === 'connected' && redisStatus === 'connected';

    return {
      status: allConnected ? 'ok' : 'degraded',
      name: 'Poker Platform API',
      version: '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      uptime: uptimeFormatted,
      timestamp: new Date().toISOString(),
      services: {
        database: dbStatus,
        redis: redisStatus,
      },
    };
  }
}
