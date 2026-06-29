import { Injectable } from '@nestjs/common';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { CommentTargetType } from 'src/constants/enums';

import { GetCommentsUseCase } from 'src/domains/comments/applications/use-cases/get-comments.use-case';
import { GetRepliesUseCase } from 'src/domains/comments/applications/use-cases/get-replies.use-case';
import { CreateCommentUseCase } from 'src/domains/comments/applications/use-cases/create-comment.use-case';
import { UpdateCommentUseCase } from 'src/domains/comments/applications/use-cases/update-comment.use-case';
import { DeleteCommentUseCase } from 'src/domains/comments/applications/use-cases/delete-comment.use-case';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Comment } from '../entities/comment.entity';
import { Post } from '../entities/post.entity';
import { NotificationService } from '../notification/notification.service';

@Injectable()
export class CommentService {
  constructor(
    private readonly getCommentsUseCase: GetCommentsUseCase,
    private readonly getRepliesUseCase: GetRepliesUseCase,
    private readonly createCommentUseCase: CreateCommentUseCase,
    private readonly updateCommentUseCase: UpdateCommentUseCase,
    private readonly deleteCommentUseCase: DeleteCommentUseCase,
    @InjectRepository(Comment)
    private readonly commentRepo: Repository<Comment>,
    @InjectRepository(Post) private readonly postRepo: Repository<Post>,
    private readonly notificationService: NotificationService,
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
    const result = await this.createCommentUseCase.execute(userId, dto);
    const postId = dto.target_id || dto.post_id;

    // Notification logic
    try {
      if (dto.parent_id) {
        // This is a reply to a comment
        const parentComment = await this.commentRepo.findOne({
          where: { id: dto.parent_id },
        });
        if (parentComment && parentComment.user_id !== userId) {
          await this.notificationService.createNotification({
            user_id: parentComment.user_id,
            actor_id: userId,
            type: 'COMMENT_REPLY',
            payload: {
              message: 'đã trả lời bình luận của bạn.',
              postId: postId || parentComment.post_id,
              commentId: result.id,
            },
          });
        }
      } else if (dto.target_type === CommentTargetType.POST || dto.post_id) {
        // This is a comment on a post
        const post = await this.postRepo.findOne({ where: { id: postId } });
        if (post && post.user_id !== userId) {
          await this.notificationService.createNotification({
            user_id: post.user_id,
            actor_id: userId,
            type: 'POST_COMMENT',
            payload: {
              message: 'đã bình luận bài viết của bạn.',
              postId: postId,
              commentId: result.id,
            },
          });
        }
      }
    } catch (err) {
      console.error('Failed to create comment notification:', err);
    }

    return result;
  }

  async updateComment(
    userId: string,
    commentId: string,
    dto: UpdateCommentDto,
  ) {
    return this.updateCommentUseCase.execute(userId, commentId, dto);
  }

  async deleteComment(userId: string, commentId: string) {
    return this.deleteCommentUseCase.execute(userId, commentId);
  }
}
