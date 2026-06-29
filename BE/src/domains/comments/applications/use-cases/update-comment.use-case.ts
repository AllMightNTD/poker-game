import { Inject, Injectable } from '@nestjs/common';
import { ICommentRepository } from '../../domain/repositories/comment.repository.interface';

@Injectable()
export class UpdateCommentUseCase {
  constructor(
    @Inject('ICommentRepository')
    private readonly commentRepository: ICommentRepository,
  ) {}

  async execute(userId: string, commentId: string, updateCommentDto: any) {
    return this.commentRepository.updateComment(
      userId,
      commentId,
      updateCommentDto,
    );
  }
}
