import { Inject, Injectable } from '@nestjs/common';
import { IStoryRepository } from '../../domain/repositories/story.repository.interface';

@Injectable()
export class GetStoryViewersUseCase {
  constructor(
    @Inject('IStoryRepository')
    private readonly storyRepository: IStoryRepository,
  ) {}

  async execute(userId: string, storyId: string) {
    return this.storyRepository.getStoryViewers(userId, storyId);
  }
}
