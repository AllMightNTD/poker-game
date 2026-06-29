import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { IPostRepository } from '../../domain/repositories/post.repository.interface';
import { Post } from 'src/v1/entities/post.entity';
import { PostMedia } from 'src/v1/entities/post_media.entity';
import { Reaction } from 'src/v1/entities/reaction.entity';
import { Friend } from 'src/v1/entities/friend.entity';
import { PostGateway } from 'src/v1/post/post.gateway';
import {
  Audience,
  ReactionTargetType,
  ReactionType,
} from 'src/constants/enums';

@Injectable()
export class TypeOrmPostRepository implements IPostRepository {
  constructor(
    @InjectRepository(Post)
    private readonly postRepository: Repository<Post>,
    @InjectRepository(PostMedia)
    private readonly postMediaRepository: Repository<PostMedia>,
    @InjectRepository(Reaction)
    private readonly reactionRepository: Repository<Reaction>,
    private readonly dataSource: DataSource,
    private readonly postGateway: PostGateway,
  ) {}

  async getPostById(id: string): Promise<any> {
    return this.postRepository.findOne({
      where: { id },
      relations: ['user', 'user.profile', 'media'],
    });
  }

  async createPost(userId: string, createPostDto: any): Promise<any> {
    const {
      content,
      audience,
      type,
      feeling,
      location_name,
      post_background,
      media,
      group_id,
    } = createPostDto;

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const post = queryRunner.manager.create(Post, {
        user_id: userId,
        content,
        audience,
        type:
          type ||
          (media && media.length > 0
            ? media[0].type === 'video'
              ? ('video' as any)
              : ('photo' as any)
            : ('text' as any)),
        feeling,
        location_name,
        post_background,
        group_id,
      });

      const savedPost = await queryRunner.manager.save(post);

      if (media && media.length > 0) {
        const postMediaEntities = media.map((m, index) => {
          return queryRunner.manager.create(PostMedia, {
            post_id: savedPost.id,
            file_url: m.file_url,
            type: m.type as any,
            sort_order: m.sort_order ?? index,
          });
        });
        await queryRunner.manager.save(postMediaEntities);
      }

      await queryRunner.commitTransaction();

      const completePost = await this.getPostById(savedPost.id);
      const [attachedPost] = await this.attachReactionsToPosts(
        [completePost],
        userId,
      );
      this.broadcastNewPostRealtime(attachedPost);

      return attachedPost;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new BadRequestException('Failed to create post: ' + error.message);
    } finally {
      await queryRunner.release();
    }
  }

  async getFeedPosts(
    userId: string,
    page: number = 1,
    limit: number = 10,
  ): Promise<any> {
    const skip = (page - 1) * limit;

    const friendRecords = await this.dataSource.getRepository(Friend).find({
      where: { user_id: userId },
      select: ['friend_id'],
    });
    const friendIds = friendRecords.map((f) => f.friend_id);

    const query = this.postRepository
      .createQueryBuilder('post')
      .leftJoinAndSelect('post.user', 'user')
      .leftJoinAndSelect('user.profile', 'profile')
      .leftJoinAndSelect('post.media', 'media')
      .orderBy('post.created_at', 'DESC')
      .skip(skip)
      .take(limit);

    if (friendIds.length > 0) {
      query.where(
        'post.audience = :public OR post.user_id = :userId OR (post.audience = :friends AND post.user_id IN (:...friendIds))',
        {
          public: Audience.PUBLIC,
          userId,
          friends: Audience.FRIENDS,
          friendIds,
        },
      );
    } else {
      query.where('post.audience = :public OR post.user_id = :userId', {
        public: Audience.PUBLIC,
        userId,
      });
    }

    const [posts, total] = await query.getManyAndCount();
    const data = await this.attachReactionsToPosts(posts, userId);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getProfilePosts(
    targetUserId: string,
    currentUserId: string,
    page: number = 1,
    limit: number = 10,
  ): Promise<any> {
    const skip = (page - 1) * limit;

    if (targetUserId === currentUserId) {
      const [posts, total] = await this.postRepository.findAndCount({
        where: { user_id: targetUserId },
        order: { created_at: 'DESC' },
        relations: ['user', 'user.profile', 'media'],
        skip,
        take: limit,
      });
      const data = await this.attachReactionsToPosts(posts, currentUserId);
      return {
        data,
        meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
      };
    }

    const isFriend = await this.dataSource.getRepository(Friend).findOne({
      where: { user_id: currentUserId, friend_id: targetUserId },
    });

    const query = this.postRepository
      .createQueryBuilder('post')
      .leftJoinAndSelect('post.user', 'user')
      .leftJoinAndSelect('user.profile', 'profile')
      .leftJoinAndSelect('post.media', 'media')
      .where('post.user_id = :targetUserId', { targetUserId })
      .orderBy('post.created_at', 'DESC')
      .skip(skip)
      .take(limit);

    if (isFriend) {
      query.andWhere('post.audience IN (:...audiences)', {
        audiences: [Audience.PUBLIC, Audience.FRIENDS],
      });
    } else {
      query.andWhere('post.audience = :public', { public: Audience.PUBLIC });
    }

    const [posts, total] = await query.getManyAndCount();
    const data = await this.attachReactionsToPosts(posts, currentUserId);
    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async getProfileMedia(
    targetUserId: string,
    currentUserId: string,
    type: 'IMAGE' | 'VIDEO',
    page: number = 1,
    limit: number = 20,
  ): Promise<any> {
    const skip = (page - 1) * limit;

    const query = this.postMediaRepository
      .createQueryBuilder('media')
      .innerJoinAndSelect('media.post', 'post')
      .where('post.user_id = :targetUserId', { targetUserId })
      .andWhere('media.type = :type', { type: type.toLowerCase() })
      .orderBy('media.created_at', 'DESC')
      .skip(skip)
      .take(limit);

    if (targetUserId !== currentUserId) {
      const isFriend = await this.dataSource.getRepository(Friend).findOne({
        where: { user_id: currentUserId, friend_id: targetUserId },
      });

      if (isFriend) {
        query.andWhere('post.audience IN (:...audiences)', {
          audiences: [Audience.PUBLIC, Audience.FRIENDS],
        });
      } else {
        query.andWhere('post.audience = :public', { public: Audience.PUBLIC });
      }
    }

    const [mediaItems, total] = await query.getManyAndCount();

    return {
      data: mediaItems,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async deleteMedia(userId: string, mediaId: string): Promise<any> {
    const media = await this.postMediaRepository.findOne({
      where: { id: mediaId },
      relations: ['post'],
    });

    if (!media) {
      throw new NotFoundException('Media not found');
    }
    if (media.post.user_id !== userId) {
      throw new BadRequestException(
        'You are not authorized to delete this media',
      );
    }

    await this.postMediaRepository.remove(media);

    // If post has no more media, update post type back to 'text'
    const remainingCount = await this.postMediaRepository.count({
      where: { post_id: media.post_id },
    });
    if (
      remainingCount === 0 &&
      (media.post.type === 'photo' || media.post.type === 'video')
    ) {
      await this.postRepository.update(media.post_id, { type: 'text' as any });
    }

    return { success: true, mediaId };
  }

  async deletePost(userId: string, postId: string): Promise<any> {
    const post = await this.postRepository.findOne({ where: { id: postId } });
    if (!post) {
      throw new NotFoundException('Post not found');
    }
    if (post.user_id !== userId) {
      throw new BadRequestException(
        'You are not authorized to delete this post',
      );
    }
    await this.postRepository.remove(post);
    return { success: true };
  }

  async toggleReaction(userId: string, postId: string, type: string) {
    const post = await this.postRepository.findOne({ where: { id: postId } });
    if (!post) {
      throw new NotFoundException('Post not found');
    }

    const existingReaction = await this.reactionRepository.findOne({
      where: {
        user_id: userId,
        target_id: postId,
        target_type: ReactionTargetType.POST,
      },
    });

    let action: 'created' | 'updated' | 'deleted';
    let userReaction: string | null = null;

    if (existingReaction) {
      if (existingReaction.type === type) {
        await this.reactionRepository.remove(existingReaction);
        post.reaction_count = Math.max(0, post.reaction_count - 1);
        await this.postRepository.save(post);
        action = 'deleted';
      } else {
        existingReaction.type = type;
        await this.reactionRepository.save(existingReaction);
        userReaction = type;
        action = 'updated';
      }
    } else {
      const newReaction = this.reactionRepository.create({
        user_id: userId,
        target_id: postId,
        target_type: ReactionTargetType.POST,
        type,
      });
      await this.reactionRepository.save(newReaction);
      post.reaction_count = post.reaction_count + 1;
      await this.postRepository.save(post);
      userReaction = type;
      action = 'created';
    }

    const reactionStats = await this.reactionRepository
      .createQueryBuilder('reaction')
      .select('reaction.type', 'type')
      .addSelect('COUNT(reaction.id)', 'count')
      .where(
        'reaction.target_id = :postId AND reaction.target_type = :targetType',
        {
          postId,
          targetType: ReactionTargetType.POST,
        },
      )
      .groupBy('reaction.type')
      .getRawMany();

    const stats = reactionStats.reduce(
      (acc, current) => {
        acc[current.type] = parseInt(current.count, 10);
        return acc;
      },
      {} as Record<string, number>,
    );

    this.broadcastReactionRealtime(post, stats);

    return {
      action,
      userReaction,
      reactionCount: post.reaction_count,
      stats,
      postUserId: post.user_id,
    };
  }

  async updatePost(
    userId: string,
    postId: string,
    updatePostDto: any,
  ): Promise<any> {
    const post = await this.postRepository.findOne({ where: { id: postId } });
    if (!post) {
      throw new NotFoundException('Post not found');
    }

    if (post.user_id !== userId) {
      throw new BadRequestException('You are not authorized to edit this post');
    }

    const {
      content,
      audience,
      type,
      feeling,
      location_name,
      post_background,
      media,
    } = updatePostDto;

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      if (content !== undefined) post.content = content;
      if (audience !== undefined) post.audience = audience;
      if (type !== undefined) post.type = type;
      post.feeling = feeling !== undefined ? feeling : post.feeling;
      post.location_name =
        location_name !== undefined ? location_name : post.location_name;
      post.post_background =
        post_background !== undefined ? post_background : post.post_background;

      await queryRunner.manager.save(post);

      if (media !== undefined) {
        await queryRunner.manager.delete(PostMedia, { post_id: postId });

        if (media.length > 0) {
          const postMediaEntities = media.map((m, index) => {
            return queryRunner.manager.create(PostMedia, {
              post_id: postId,
              file_url: m.file_url,
              type: m.type as any,
              sort_order: m.sort_order ?? index,
            });
          });
          await queryRunner.manager.save(postMediaEntities);
        }
      }

      await queryRunner.commitTransaction();

      const completePost = await this.getPostById(postId);
      const [attachedPost] = await this.attachReactionsToPosts(
        [completePost],
        userId,
      );
      this.broadcastPostUpdateRealtime(attachedPost);

      return attachedPost;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new BadRequestException('Failed to update post: ' + error.message);
    } finally {
      await queryRunner.release();
    }
  }

  private async attachReactionsToPosts(
    posts: Post[],
    userId: string,
  ): Promise<any[]> {
    return Promise.all(
      posts.map(async (post) => {
        const userReact = await this.reactionRepository.findOne({
          where: {
            user_id: userId,
            target_id: post.id,
            target_type: ReactionTargetType.POST,
          },
        });

        const reactStats = await this.reactionRepository
          .createQueryBuilder('reaction')
          .select('reaction.type', 'type')
          .addSelect('COUNT(reaction.id)', 'count')
          .where(
            'reaction.target_id = :postId AND reaction.target_type = :targetType',
            {
              postId: post.id,
              targetType: ReactionTargetType.POST,
            },
          )
          .groupBy('reaction.type')
          .getRawMany();

        const stats = reactStats.reduce(
          (acc, current) => {
            acc[current.type] = parseInt(current.count, 10);
            return acc;
          },
          {} as Record<string, number>,
        );

        return {
          ...post,
          userReaction: userReact ? userReact.type : null,
          reactionStats: stats,
        };
      }),
    );
  }

  private async broadcastNewPostRealtime(post: any) {
    try {
      const authorId = post.user_id;

      if (post.audience === Audience.PUBLIC) {
        this.postGateway.broadcastNewPost(post, [], 'public');
      } else if (post.audience === Audience.ONLY_ME) {
        this.postGateway.broadcastNewPost(post, [authorId], 'only_me');
      } else if (post.audience === Audience.FRIENDS) {
        const friends = await this.dataSource.manager.find(Friend, {
          where: [{ user_id: authorId }, { friend_id: authorId }],
        });

        const friendIds = friends.map((f) =>
          f.user_id === authorId ? f.friend_id : f.user_id,
        );
        const recipientUserIds = Array.from(new Set([authorId, ...friendIds]));

        this.postGateway.broadcastNewPost(post, recipientUserIds, 'friends');
      }
    } catch (error) {
      console.error(
        '[PostRepository] Error during realtime post broadcasting:',
        error.message,
      );
    }
  }

  private async broadcastPostUpdateRealtime(post: any) {
    try {
      const authorId = post.user_id;

      if (post.audience === Audience.PUBLIC) {
        this.postGateway.broadcastPostUpdate(post, [], 'public');
      } else if (post.audience === Audience.ONLY_ME) {
        this.postGateway.broadcastPostUpdate(post, [authorId], 'only_me');
      } else if (post.audience === Audience.FRIENDS) {
        const friends = await this.dataSource.manager.find(Friend, {
          where: [{ user_id: authorId }, { friend_id: authorId }],
        });

        const friendIds = friends.map((f) =>
          f.user_id === authorId ? f.friend_id : f.user_id,
        );
        const recipientUserIds = Array.from(new Set([authorId, ...friendIds]));

        this.postGateway.broadcastPostUpdate(post, recipientUserIds, 'friends');
      }
    } catch (error) {
      console.error(
        '[PostRepository] Error during realtime post update broadcasting:',
        error.message,
      );
    }
  }

  private async broadcastReactionRealtime(post: Post, stats: any) {
    try {
      const authorId = post.user_id;
      const payload = {
        reactionCount: post.reaction_count,
        stats,
      };

      if (post.audience === Audience.PUBLIC) {
        this.postGateway.broadcastPostReaction(post.id, payload, [], 'public');
      } else if (post.audience === Audience.ONLY_ME) {
        this.postGateway.broadcastPostReaction(
          post.id,
          payload,
          [authorId],
          'only_me',
        );
      } else if (post.audience === Audience.FRIENDS) {
        const friends = await this.dataSource.manager.find(Friend, {
          where: [{ user_id: authorId }, { friend_id: authorId }],
        });

        const friendIds = friends.map((f) =>
          f.user_id === authorId ? f.friend_id : f.user_id,
        );
        const recipientUserIds = Array.from(new Set([authorId, ...friendIds]));

        this.postGateway.broadcastPostReaction(
          post.id,
          payload,
          recipientUserIds,
          'friends',
        );
      }
    } catch (error) {
      console.error(
        '[PostRepository] Error during realtime reaction broadcasting:',
        error.message,
      );
    }
  }
}
