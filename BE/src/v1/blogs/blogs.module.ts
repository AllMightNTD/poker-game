import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Blog } from '../entities/blog.entity';
import { GameHand } from '../entities/game_hand.entity';
import { HandAction } from '../entities/hand_action.entity';
import { HandPlayer } from '../entities/hand_player.entity';
import { BlogsController } from './blogs.controller';
import { BlogsService } from './blogs.service';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([Blog, GameHand, HandPlayer, HandAction]),
  ],
  controllers: [BlogsController],
  providers: [BlogsService],
  exports: [BlogsService],
})
export class BlogsModule {}
