import { Inject, Injectable } from '@nestjs/common';
import { IStoryRepository } from '../../domain/repositories/story.repository.interface';

@Injectable()
export class ReactStoryUseCase {
  constructor(
    @Inject('IStoryRepository')
    private readonly storyRepository: IStoryRepository,
  ) {}

  async execute(userId: string, storyId: string, emoji: string) {
    return this.storyRepository.reactStory(userId, storyId, emoji);
  }
}
