import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Story } from 'src/v1/entities/story.entity';
import { StoryView } from 'src/v1/entities/story_view.entity';
import { Friend } from 'src/v1/entities/friend.entity';
import { Reaction } from 'src/v1/entities/reaction.entity';
import { TypeOrmStoryRepository } from './infrastructure/persistence/typeorm-story.repository';

import { CreateStoryUseCase } from './applications/use-cases/create-story.use-case';
import { GetStoryFeedUseCase } from './applications/use-cases/get-story-feed.use-case';
import { GetStoryArchiveUseCase } from './applications/use-cases/get-story-archive.use-case';
import { ViewStoryUseCase } from './applications/use-cases/view-story.use-case';
import { GetStoryViewersUseCase } from './applications/use-cases/get-story-viewers.use-case';
import { ReactStoryUseCase } from './applications/use-cases/react-story.use-case';
import { DeleteStoryUseCase } from './applications/use-cases/delete-story.use-case';
import { SearchZingMp3UseCase } from './applications/use-cases/search-zing-mp3.use-case';
import { GetZingMp3SongStreamUseCase } from './applications/use-cases/get-zing-mp3-song-stream.use-case';
import { GetZingMp3SongLyricsUseCase } from './applications/use-cases/get-zing-mp3-song-lyrics.use-case';

const useCases = [
  CreateStoryUseCase,
  GetStoryFeedUseCase,
  GetStoryArchiveUseCase,
  ViewStoryUseCase,
  GetStoryViewersUseCase,
  ReactStoryUseCase,
  DeleteStoryUseCase,
  SearchZingMp3UseCase,
  GetZingMp3SongStreamUseCase,
  GetZingMp3SongLyricsUseCase,
];

@Module({
  imports: [TypeOrmModule.forFeature([Story, StoryView, Friend, Reaction])],
  providers: [
    ...useCases,
    {
      provide: 'IStoryRepository',
      useClass: TypeOrmStoryRepository,
    },
  ],
  exports: ['IStoryRepository', ...useCases],
})
export class StoriesModule {}
