import { BullModule } from '@nestjs/bullmq';
import { CacheModule } from '@nestjs/cache-manager';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  AcceptLanguageResolver,
  HeaderResolver,
  I18nModule,
} from 'nestjs-i18n';
import path from 'path';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import databaseConfig from './config/database';
import { SeedModule } from './database/seed/seed.module';
import { MailModule } from './mail/mail.module';
import { AppV1Module } from './v1/app-v1.module';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      load: [databaseConfig],
    }),
    /**Queue Config */
    BullModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        connection: {
          host: configService.get<string>('REDIS_HOST', 'localhost'),
          port: configService.get<number>('REDIS_PORT', 6380), // thay 6379 thành 6380,
          password: configService.get<string>('REDIS_PASSWORD'),
        },
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
    I18nModule.forRoot({
      fallbackLanguage: 'en', // ngôn ngữ mặc định nếu không tìm thấy
      fallbacks: {
        'ja-*': 'ja', // nếu client gửi ja-JP, ja-Jpan, ... → dùng ja
      },
      loaderOptions: {
        path: path.join(__dirname, '/i18n/'), // thư mục chứa file ngôn ngữ
        watch: true, // auto reload khi dev (tùy chọn)
      },
      resolvers: [new HeaderResolver(['x-lang']), AcceptLanguageResolver],
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
