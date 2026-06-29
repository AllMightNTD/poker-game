import { Injectable } from '@nestjs/common';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';

import { CreatePostUseCase } from 'src/domains/posts/applications/use-cases/create-post.use-case';
import { GetFeedPostsUseCase } from 'src/domains/posts/applications/use-cases/get-feed-posts.use-case';
import { GetProfilePostsUseCase } from 'src/domains/posts/applications/use-cases/get-profile-posts.use-case';
import { ToggleReactionUseCase } from 'src/domains/posts/applications/use-cases/toggle-reaction.use-case';
import { UpdatePostUseCase } from 'src/domains/posts/applications/use-cases/update-post.use-case';
import { DeletePostUseCase } from 'src/domains/posts/applications/use-cases/delete-post.use-case';
import { GetProfileMediaUseCase } from 'src/domains/posts/applications/use-cases/get-profile-media.use-case';
import { DeleteMediaUseCase } from 'src/domains/posts/applications/use-cases/delete-media.use-case';
import { NotificationService } from '../notification/notification.service';

@Injectable()
export class PostService {
  constructor(
    private readonly createPostUseCase: CreatePostUseCase,
    private readonly getFeedPostsUseCase: GetFeedPostsUseCase,
    private readonly getProfilePostsUseCase: GetProfilePostsUseCase,
    private readonly toggleReactionUseCase: ToggleReactionUseCase,
    private readonly updatePostUseCase: UpdatePostUseCase,
    private readonly deletePostUseCase: DeletePostUseCase,
    private readonly getProfileMediaUseCase: GetProfileMediaUseCase,
    private readonly deleteMediaUseCase: DeleteMediaUseCase,
    private readonly notificationService: NotificationService,
  ) {}

  async createPost(userId: string, createPostDto: CreatePostDto) {
    return this.createPostUseCase.execute(userId, createPostDto);
  }

  async getFeedPosts(userId: string, page = 1, limit = 10) {
    return this.getFeedPostsUseCase.execute(userId, page, limit);
  }

  async getProfilePosts(
    targetUserId: string,
    currentUserId: string,
    page: number = 1,
    limit: number = 10,
  ) {
    return this.getProfilePostsUseCase.execute(
      targetUserId,
      currentUserId,
      page,
      limit,
    );
  }

  async toggleReaction(userId: string, postId: string, type: any) {
    const result = await this.toggleReactionUseCase.execute(
      userId,
      postId,
      type,
    );

    // send notification if created and user is not the owner
    if (
      result.action === 'created' &&
      result.postUserId &&
      result.postUserId !== userId
    ) {
      await this.notificationService.createNotification({
        user_id: result.postUserId,
        actor_id: userId,
        type: 'POST_LIKE',
        payload: {
          message: 'đã bày tỏ cảm xúc về bài viết của bạn.',
          postId,
        },
      });
    }
    return result;
  }

  async updatePost(
    userId: string,
    postId: string,
    updatePostDto: UpdatePostDto,
  ) {
    return this.updatePostUseCase.execute(userId, postId, updatePostDto);
  }

  async deletePost(userId: string, postId: string) {
    return this.deletePostUseCase.execute(userId, postId);
  }

  async getProfileMedia(
    targetUserId: string,
    currentUserId: string,
    type: 'IMAGE' | 'VIDEO',
    page: number = 1,
    limit: number = 20,
  ) {
    return this.getProfileMediaUseCase.execute(
      targetUserId,
      currentUserId,
      type,
      page,
      limit,
    );
  }

  async deleteMedia(userId: string, mediaId: string) {
    return this.deleteMediaUseCase.execute(userId, mediaId);
  }
}
