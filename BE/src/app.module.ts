import { ThrottlerStorageRedisService } from '@nest-lab/throttler-storage-redis';
import { BullModule } from '@nestjs/bullmq';
import { CacheModule } from '@nestjs/cache-manager';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import databaseConfig from './config/database';
import mailConfig from './config/mail.config';
import { SeedModule } from './database/seed/seed.module';
import { MailModule } from './mail/mail.module';
import { AppV1Module } from './v1/modules/app-v1.module';

@Module({
  imports: [
    EventEmitterModule.forRoot(),
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      load: [databaseConfig, mailConfig],
    }),
    /**Queue Config */
    BullModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const redisHost = configService.get<string>('REDIS_HOST', 'localhost');
        const isUpstash = redisHost.includes('upstash.io');
        return {
          connection: {
            host: redisHost,
            port: configService.get<number>('REDIS_PORT', 6379),
            password: configService.get<string>('REDIS_PASSWORD'),
            tls: isUpstash ? {} : undefined,
            // Upstash Free does not support noeviction policy
            enableReadyCheck: false,
            // Must be null: BullMQ Worker uses XREAD BLOCK (blocking commands)
            // Setting commandTimeout would kill the poll cycle every N ms
            maxRetriesPerRequest: null,
            // Exponential backoff reconnect: 200ms -> 3s cap
            retryStrategy: (times: number) => Math.min(times * 200, 3000),
          },
          defaultJobOptions: { removeOnComplete: true, removeOnFail: true },
        };
      },
    }),

    /** Throttler / Rate Limit */
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        throttlers: [
          {
            ttl: 60000,
            limit: 100,
          },
        ],
        storage: new ThrottlerStorageRedisService({
          host: configService.get<string>('REDIS_HOST', 'localhost'),
          port: configService.get<number>('REDIS_PORT', 6379),
          password: configService.get<string>('REDIS_PASSWORD'),
          tls: configService
            .get<string>('REDIS_HOST', '')
            .includes('upstash.io')
            ? {}
            : undefined,
          // Upstash does not support CONFIG commands
          enableReadyCheck: false,
          maxRetriesPerRequest: null,
          // Exponential backoff reconnect: 200ms -> 3s cap
          retryStrategy: (times: number) => Math.min(times * 200, 3000),
        }),
      }),
    }),

    AppV1Module,
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) =>
        configService.get('database'),
    }),
    SeedModule,

    /**Cache Module */
    CacheModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        ttl: configService.get<number>('CACHE_TTL'),
        max: configService.get<number>('CACHE_MAX_SIZE'),
      }),
    }),
    MailModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
