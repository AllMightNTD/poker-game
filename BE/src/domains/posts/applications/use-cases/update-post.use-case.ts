import { Inject, Injectable } from '@nestjs/common';
import { IPostRepository } from '../../domain/repositories/post.repository.interface';

@Injectable()
export class UpdatePostUseCase {
  constructor(
    @Inject('IPostRepository')
    private readonly postRepository: IPostRepository,
  ) {}

  async execute(userId: string, postId: string, updatePostDto: any) {
    return this.postRepository.updatePost(userId, postId, updatePostDto);
  }
}
