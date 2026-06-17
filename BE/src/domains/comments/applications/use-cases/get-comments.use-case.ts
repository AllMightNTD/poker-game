import { Inject, Injectable } from '@nestjs/common';
import { ICommentRepository } from '../../domain/repositories/comment.repository.interface';

@Injectable()
export class GetCommentsUseCase {
  constructor(
    @Inject('ICommentRepository')
    private readonly commentRepository: ICommentRepository,
  ) {}

  async execute(targetType: any, targetId: string, query: any) {
    return this.commentRepository.getComments(targetType, targetId, query);
  }
}
