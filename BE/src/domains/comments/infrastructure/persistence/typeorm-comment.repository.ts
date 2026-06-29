import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, IsNull } from 'typeorm';
import { ICommentRepository } from '../../domain/repositories/comment.repository.interface';
import { Comment } from 'src/v1/entities/comment.entity';
import { Post } from 'src/v1/entities/post.entity';
import { Friend } from 'src/v1/entities/friend.entity';
import { CommentGateway } from 'src/v1/comment/comment.gateway';
import { CommentTargetType, Audience } from 'src/constants/enums';

@Injectable()
export class TypeOrmCommentRepository implements ICommentRepository {
  constructor(
    @InjectRepository(Comment)
    private readonly commentRepository: Repository<Comment>,
    @InjectRepository(Post)
    private readonly postRepository: Repository<Post>,
    private readonly commentGateway: CommentGateway,
    private readonly dataSource: DataSource,
  ) {}

  private async getRecipientUserIds(
    post: Post,
  ): Promise<{ recipientIds: string[]; audience: string }> {
    const authorId = post.user_id;

    if (post.audience === Audience.PUBLIC) {
      return { recipientIds: [], audience: 'public' };
    } else if (post.audience === Audience.ONLY_ME) {
      return { recipientIds: [authorId], audience: 'only_me' };
    } else if (post.audience === Audience.FRIENDS) {
      const friends = await this.dataSource.manager.find(Friend, {
        where: [{ user_id: authorId }, { friend_id: authorId }],
      });

      const friendIds = friends.map((f) =>
        f.user_id === authorId ? f.friend_id : f.user_id,
      );
      const recipientIds = Array.from(new Set([authorId, ...friendIds]));
      return { recipientIds, audience: 'friends' };
    }

    return { recipientIds: [], audience: 'public' };
  }

  async getComments(
    targetType: CommentTargetType,
    targetId: string,
    query: { page?: number; limit?: number; sort?: 'newest' | 'oldest' },
  ) {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;
    const sort = query.sort || 'oldest';
    const skip = (page - 1) * limit;

    const post = await this.postRepository.findOne({ where: { id: targetId } });
    if (!post) throw new NotFoundException('Post not found');

    const [comments, total] = await this.commentRepository.findAndCount({
      where: {
        post_id: targetId,
        parent_id: IsNull(),
        is_hidden: false,
      },
      relations: ['user', 'user.profile'],
      order: {
        created_at: sort === 'newest' ? 'DESC' : 'ASC',
      },
      skip,
      take: limit,
    });

    const commentsWithReplies = await Promise.all(
      comments.map(async (comment) => {
        const [replies, replyCount] = await this.commentRepository.findAndCount(
          {
            where: {
              parent_id: comment.id,
              is_hidden: false,
            },
            relations: ['user', 'user.profile'],
            order: {
              created_at: 'ASC',
            },
            take: 3,
          },
        );

        return {
          ...comment,
          replies,
          reply_count: replyCount,
        };
      }),
    );

    return {
      comments: commentsWithReplies,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getReplies(
    commentId: string,
    query: { page?: number; limit?: number },
  ) {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;
    const skip = (page - 1) * limit;

    const parentComment = await this.commentRepository.findOne({
      where: { id: commentId },
    });
    if (!parentComment) {
      throw new NotFoundException('Parent comment not found');
    }

    const [replies, total] = await this.commentRepository.findAndCount({
      where: {
        parent_id: commentId,
        is_hidden: false,
      },
      relations: ['user', 'user.profile'],
      order: {
        created_at: 'ASC',
      },
      skip,
      take: limit,
    });

    return {
      replies,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async createComment(userId: string, dto: any) {
    const { target_id, parent_id, content, media_url, sticker_url, type } = dto;
    const postId = target_id || dto.post_id;

    if (!content?.trim() && !media_url && !sticker_url) {
      throw new BadRequestException(
        'Comment must contain text, media, or a sticker',
      );
    }

    const post = await this.postRepository.findOne({ where: { id: postId } });
    if (!post) throw new NotFoundException('Post not found');

    let parentComment: Comment | null = null;
    if (parent_id) {
      parentComment = await this.commentRepository.findOne({
        where: { id: parent_id },
      });
      if (!parentComment)
        throw new NotFoundException('Parent comment not found');
      if (parentComment.parent_id) {
        dto.parent_id = parentComment.parent_id;
      }
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const newComment = queryRunner.manager.create(Comment, {
        post_id: postId,
        parent_id: dto.parent_id || null,
        user_id: userId,
        content: content?.trim(),
        media_url,
        sticker_url,
        type: type || (media_url ? 'media' : 'text'),
      });

      const savedComment = await queryRunner.manager.save(Comment, newComment);

      if (dto.parent_id) {
        await queryRunner.manager.increment(
          Comment,
          { id: dto.parent_id },
          'reply_count',
          1,
        );
      }

      if (post) {
        await queryRunner.manager.increment(
          Post,
          { id: postId },
          'comment_count',
          1,
        );
      }

      await queryRunner.commitTransaction();

      const fullComment = await this.commentRepository.findOne({
        where: { id: savedComment.id },
        relations: ['user', 'user.profile'],
      });

      if (post) {
        const { recipientIds, audience } = await this.getRecipientUserIds(post);
        const payload = {
          ...fullComment,
          postId: postId,
          parentId: dto.parent_id || null,
        };
        this.commentGateway.broadcastCommentCreated(
          payload,
          recipientIds,
          audience,
        );
      }

      return fullComment;
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async updateComment(userId: string, commentId: string, dto: any) {
    const comment = await this.commentRepository.findOne({
      where: { id: commentId },
    });
    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    if (comment.user_id !== userId) {
      throw new ForbiddenException(
        'You are not authorized to edit this comment',
      );
    }

    const { content, media_url, sticker_url } = dto;
    if (!content?.trim() && !media_url && !sticker_url) {
      throw new BadRequestException('Comment cannot be empty');
    }

    comment.content = content?.trim() || null;
    comment.media_url = media_url || null;
    comment.sticker_url = sticker_url || null;

    const saved = await this.commentRepository.save(comment);

    const fullComment = await this.commentRepository.findOne({
      where: { id: saved.id },
      relations: ['user', 'user.profile'],
    });

    const post = await this.postRepository.findOne({
      where: { id: comment.post_id },
    });
    if (post) {
      const { recipientIds, audience } = await this.getRecipientUserIds(post);
      const payload = {
        ...fullComment,
        postId: comment.post_id,
        parentId: comment.parent_id || null,
      };
      this.commentGateway.broadcastCommentUpdated(
        payload,
        recipientIds,
        audience,
      );
    }

    return fullComment;
  }

  async deleteComment(userId: string, commentId: string) {
    const comment = await this.commentRepository.findOne({
      where: { id: commentId },
    });
    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    let isPostAuthor = false;
    let post: Post | null = null;
    post = await this.postRepository.findOne({
      where: { id: comment.post_id },
    });
    if (post && post.user_id === userId) {
      isPostAuthor = true;
    }

    if (comment.user_id !== userId && !isPostAuthor) {
      throw new ForbiddenException(
        'You are not authorized to delete this comment',
      );
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      if (comment.parent_id) {
        await queryRunner.manager.decrement(
          Comment,
          { id: comment.parent_id },
          'reply_count',
          1,
        );
      } else {
        const childRepliesCount = await this.commentRepository.count({
          where: { parent_id: comment.id },
        });

        if (post) {
          const totalToDecrement = childRepliesCount + 1;
          await queryRunner.manager.decrement(
            Post,
            { id: comment.post_id },
            'comment_count',
            totalToDecrement,
          );
        }

        await queryRunner.manager.delete(Comment, { parent_id: comment.id });
      }

      if (!comment.parent_id && post && comment.parent_id === null) {
      } else if (comment.parent_id && post) {
        await queryRunner.manager.decrement(
          Post,
          { id: comment.post_id },
          'comment_count',
          1,
        );
      }

      await queryRunner.manager.delete(Comment, { id: commentId });

      await queryRunner.commitTransaction();

      if (post) {
        const { recipientIds, audience } = await this.getRecipientUserIds(post);
        const payload = {
          commentId,
          parentId: comment.parent_id || undefined,
          postId: comment.post_id,
        };
        this.commentGateway.broadcastCommentDeleted(
          payload,
          recipientIds,
          audience,
        );
      }

      return { success: true };
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }
}
