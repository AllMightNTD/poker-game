import { Inject, Injectable } from '@nestjs/common';
import { IPostRepository } from '../../domain/repositories/post.repository.interface';

@Injectable()
export class DeleteMediaUseCase {
  constructor(
    @Inject('IPostRepository')
    private readonly postRepository: IPostRepository,
  ) {}

  async execute(userId: string, mediaId: string) {
    return this.postRepository.deleteMedia(userId, mediaId);
  }
}
