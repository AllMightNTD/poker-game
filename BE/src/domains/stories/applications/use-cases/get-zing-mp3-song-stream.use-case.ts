import { Inject, Injectable } from '@nestjs/common';
import { IStoryRepository } from '../../domain/repositories/story.repository.interface';

@Injectable()
export class GetZingMp3SongStreamUseCase {
  constructor(
    @Inject('IStoryRepository')
    private readonly storyRepository: IStoryRepository,
  ) {}

  async execute(songId: string) {
    return this.storyRepository.getZingMp3SongStream(songId);
  }
}
