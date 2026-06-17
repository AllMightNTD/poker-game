import { Injectable } from '@nestjs/common';
import { CreateStoryDto } from './dto/create-story.dto';

import { CreateStoryUseCase } from 'src/domains/stories/applications/use-cases/create-story.use-case';
import { GetStoryFeedUseCase } from 'src/domains/stories/applications/use-cases/get-story-feed.use-case';
import { GetStoryArchiveUseCase } from 'src/domains/stories/applications/use-cases/get-story-archive.use-case';
import { ViewStoryUseCase } from 'src/domains/stories/applications/use-cases/view-story.use-case';
import { GetStoryViewersUseCase } from 'src/domains/stories/applications/use-cases/get-story-viewers.use-case';
import { ReactStoryUseCase } from 'src/domains/stories/applications/use-cases/react-story.use-case';
import { DeleteStoryUseCase } from 'src/domains/stories/applications/use-cases/delete-story.use-case';
import { SearchZingMp3UseCase } from 'src/domains/stories/applications/use-cases/search-zing-mp3.use-case';
import { GetZingMp3SongStreamUseCase } from 'src/domains/stories/applications/use-cases/get-zing-mp3-song-stream.use-case';
import { GetZingMp3SongLyricsUseCase } from 'src/domains/stories/applications/use-cases/get-zing-mp3-song-lyrics.use-case';

@Injectable()
export class StoryService {
  constructor(
    private readonly createStoryUseCase: CreateStoryUseCase,
    private readonly getStoryFeedUseCase: GetStoryFeedUseCase,
    private readonly getStoryArchiveUseCase: GetStoryArchiveUseCase,
    private readonly viewStoryUseCase: ViewStoryUseCase,
    private readonly getStoryViewersUseCase: GetStoryViewersUseCase,
    private readonly reactStoryUseCase: ReactStoryUseCase,
    private readonly deleteStoryUseCase: DeleteStoryUseCase,
    private readonly searchZingMp3UseCase: SearchZingMp3UseCase,
    private readonly getZingMp3SongStreamUseCase: GetZingMp3SongStreamUseCase,
    private readonly getZingMp3SongLyricsUseCase: GetZingMp3SongLyricsUseCase,
  ) {}

  async createStory(userId: string, createStoryDto: CreateStoryDto) {
    return this.createStoryUseCase.execute(userId, createStoryDto);
  }

  async getStoryFeed(userId: string) {
    return this.getStoryFeedUseCase.execute(userId);
  }

  async getStoryArchive(userId: string) {
    return this.getStoryArchiveUseCase.execute(userId);
  }

  async viewStory(userId: string, storyId: string) {
    return this.viewStoryUseCase.execute(userId, storyId);
  }

  async getStoryViewers(userId: string, storyId: string) {
    return this.getStoryViewersUseCase.execute(userId, storyId);
  }

  async reactStory(userId: string, storyId: string, emoji: string) {
    return this.reactStoryUseCase.execute(userId, storyId, emoji);
  }

  async deleteStory(userId: string, storyId: string) {
    return this.deleteStoryUseCase.execute(userId, storyId);
  }

  async searchZingMp3(query: string) {
    return this.searchZingMp3UseCase.execute(query);
  }

  async getZingMp3SongStream(songId: string) {
    return this.getZingMp3SongStreamUseCase.execute(songId);
  }

  async getZingMp3SongLyrics(songId: string) {
    return this.getZingMp3SongLyricsUseCase.execute(songId);
  }
}
