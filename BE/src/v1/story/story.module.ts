import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Story } from '../entities/story.entity';
import { StoryView } from '../entities/story_view.entity';
import { Friend } from '../entities/friend.entity';
import { Reaction } from '../entities/reaction.entity';
import { StoryController } from './story.controller';
import { StoryService } from './story.service';
import { StoriesModule } from 'src/domains/stories/stories.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Story, StoryView, Friend, Reaction]),
    StoriesModule,
  ],
  controllers: [StoryController],
  providers: [StoryService],
  exports: [StoryService, StoriesModule],
})
export class StoryModule {}
