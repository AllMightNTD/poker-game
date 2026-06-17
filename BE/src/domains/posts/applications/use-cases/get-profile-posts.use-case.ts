import { Inject, Injectable } from '@nestjs/common';
import { IPostRepository } from '../../domain/repositories/post.repository.interface';

@Injectable()
export class GetProfilePostsUseCase {
  constructor(
    @Inject('IPostRepository')
    private readonly postRepository: IPostRepository,
  ) {}

  async execute(targetUserId: string, currentUserId: string) {
    return this.postRepository.getProfilePosts(targetUserId, currentUserId);
  }
}
