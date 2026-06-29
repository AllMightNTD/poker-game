import {
  Inject,
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { IPostRepository } from '../../domain/repositories/post.repository.interface';

@Injectable()
export class DeletePostUseCase {
  constructor(
    @Inject('IPostRepository')
    private readonly postRepository: IPostRepository,
  ) {}

  async execute(userId: string, postId: string) {
    return this.postRepository.deletePost(userId, postId);
  }
}
