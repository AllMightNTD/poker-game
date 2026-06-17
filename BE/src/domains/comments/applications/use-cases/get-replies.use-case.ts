import { Inject, Injectable } from '@nestjs/common';
import { ICommentRepository } from '../../domain/repositories/comment.repository.interface';

@Injectable()
export class GetRepliesUseCase {
  constructor(
    @Inject('ICommentRepository')
    private readonly commentRepository: ICommentRepository,
  ) {}

  async execute(commentId: string, query: any) {
    return this.commentRepository.getReplies(commentId, query);
  }
}
