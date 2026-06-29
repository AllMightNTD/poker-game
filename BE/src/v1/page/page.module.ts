import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PageController } from './page.controller';
import { PageService } from './page.service';
import { Page } from '../entities/page.entity';
import { PageAdmin } from '../entities/page_admin.entity';
import { Follow } from '../entities/follow.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Page, PageAdmin, Follow])],
  controllers: [PageController],
  providers: [PageService],
  exports: [PageService],
})
export class PageModule {}
