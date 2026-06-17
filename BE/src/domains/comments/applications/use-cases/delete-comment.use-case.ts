import { Inject, Injectable } from '@nestjs/common';
import { ICommentRepository } from '../../domain/repositories/comment.repository.interface';

@Injectable()
export class DeleteCommentUseCase {
  constructor(
    @Inject('ICommentRepository')
    private readonly commentRepository: ICommentRepository,
  ) {}

  async execute(userId: string, commentId: string) {
    return this.commentRepository.deleteComment(userId, commentId);
  }
}
