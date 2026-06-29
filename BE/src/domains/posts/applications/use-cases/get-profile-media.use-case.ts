import { Inject, Injectable } from '@nestjs/common';
import { IPostRepository } from '../../domain/repositories/post.repository.interface';

@Injectable()
export class GetProfileMediaUseCase {
  constructor(
    @Inject('IPostRepository')
    private readonly postRepository: IPostRepository,
  ) {}

  async execute(
    targetUserId: string,
    currentUserId: string,
    type: 'IMAGE' | 'VIDEO',
    page: number,
    limit: number,
  ) {
    return this.postRepository.getProfileMedia(
      targetUserId,
      currentUserId,
      type,
      page,
      limit,
    );
  }
}
