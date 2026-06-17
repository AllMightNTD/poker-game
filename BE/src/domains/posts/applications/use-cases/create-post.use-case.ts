import { Inject, Injectable } from '@nestjs/common';
import { IPostRepository } from '../../domain/repositories/post.repository.interface';

@Injectable()
export class CreatePostUseCase {
  constructor(
    @Inject('IPostRepository')
    private readonly postRepository: IPostRepository,
  ) {}

  async execute(userId: string, createPostDto: any) {
    return this.postRepository.createPost(userId, createPostDto);
  }
}
