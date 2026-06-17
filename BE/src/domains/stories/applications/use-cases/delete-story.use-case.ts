import { Inject, Injectable } from '@nestjs/common';
import { IStoryRepository } from '../../domain/repositories/story.repository.interface';

@Injectable()
export class DeleteStoryUseCase {
  constructor(
    @Inject('IStoryRepository')
    private readonly storyRepository: IStoryRepository,
  ) {}

  async execute(userId: string, storyId: string) {
    return this.storyRepository.deleteStory(userId, storyId);
  }
}
