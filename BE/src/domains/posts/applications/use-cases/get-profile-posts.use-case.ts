import { Inject, Injectable } from '@nestjs/common';
import { IPostRepository } from '../../domain/repositories/post.repository.interface';

@Injectable()
export class GetProfilePostsUseCase {
  constructor(
    @Inject('IPostRepository')
    private readonly postRepository: IPostRepository,
  ) {}

  async execute(
    targetUserId: string,
    currentUserId: string,
    page: number = 1,
    limit: number = 10,
  ) {
    return this.postRepository.getProfilePosts(
      targetUserId,
      currentUserId,
      page,
      limit,
    );
  }
}
