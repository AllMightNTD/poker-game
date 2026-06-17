import { Inject, Injectable } from '@nestjs/common';
import { IStoryRepository } from '../../domain/repositories/story.repository.interface';

@Injectable()
export class GetZingMp3SongLyricsUseCase {
  constructor(
    @Inject('IStoryRepository')
    private readonly storyRepository: IStoryRepository,
  ) {}

  async execute(songId: string) {
    return this.storyRepository.getZingMp3SongLyrics(songId);
  }
}
