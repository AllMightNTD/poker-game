import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { Blog } from '../entities/blog.entity';
import { CrawlLog } from '../entities/crawl-log.entity';
import { BlogsCrawlerService } from './blogs-crawler.service';

@Module({
  imports: [
    ConfigModule,
    ScheduleModule.forRoot(), // Đăng ký NestJS Scheduler cho Cron Jobs
    TypeOrmModule.forFeature([Blog, CrawlLog]),
  ],
  providers: [BlogsCrawlerService],
  exports: [BlogsCrawlerService],
})
export class BlogsCrawlerModule {}
