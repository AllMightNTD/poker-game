import { Injectable } from '@nestjs/common';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { CommentTargetType } from 'src/constants/enums';

import { GetCommentsUseCase } from 'src/domains/comments/applications/use-cases/get-comments.use-case';
import { GetRepliesUseCase } from 'src/domains/comments/applications/use-cases/get-replies.use-case';
import { CreateCommentUseCase } from 'src/domains/comments/applications/use-cases/create-comment.use-case';
import { UpdateCommentUseCase } from 'src/domains/comments/applications/use-cases/update-comment.use-case';
import { DeleteCommentUseCase } from 'src/domains/comments/applications/use-cases/delete-comment.use-case';

@Injectable()
export class CommentService {
  constructor(
    private readonly getCommentsUseCase: GetCommentsUseCase,
    private readonly getRepliesUseCase: GetRepliesUseCase,
    private readonly createCommentUseCase: CreateCommentUseCase,
    private readonly updateCommentUseCase: UpdateCommentUseCase,
    private readonly deleteCommentUseCase: DeleteCommentUseCase,
  ) {}

  async getComments(
    targetType: CommentTargetType,
    targetId: string,
    query: { page?: number; limit?: number; sort?: 'newest' | 'oldest' },
  ) {
    return this.getCommentsUseCase.execute(targetType, targetId, query);
  }

  async getReplies(
    commentId: string,
    query: { page?: number; limit?: number },
  ) {
    return this.getRepliesUseCase.execute(commentId, query);
  }

  async createComment(userId: string, dto: CreateCommentDto) {
    return this.createCommentUseCase.execute(userId, dto);
  }

  async updateComment(userId: string, commentId: string, dto: UpdateCommentDto) {
    return this.updateCommentUseCase.execute(userId, commentId, dto);
  }

  async deleteComment(userId: string, commentId: string) {
    return this.deleteCommentUseCase.execute(userId, commentId);
  }
}
