import { Inject, Injectable } from '@nestjs/common';
import { ICommentRepository } from '../../domain/repositories/comment.repository.interface';

@Injectable()
export class CreateCommentUseCase {
  constructor(
    @Inject('ICommentRepository')
    private readonly commentRepository: ICommentRepository,
  ) {}

  async execute(userId: string, createCommentDto: any) {
    return this.commentRepository.createComment(userId, createCommentDto);
  }
}
