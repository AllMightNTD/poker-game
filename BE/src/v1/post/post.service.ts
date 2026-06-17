import { Injectable } from '@nestjs/common';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';

import { CreatePostUseCase } from 'src/domains/posts/applications/use-cases/create-post.use-case';
import { GetFeedPostsUseCase } from 'src/domains/posts/applications/use-cases/get-feed-posts.use-case';
import { GetProfilePostsUseCase } from 'src/domains/posts/applications/use-cases/get-profile-posts.use-case';
import { ToggleReactionUseCase } from 'src/domains/posts/applications/use-cases/toggle-reaction.use-case';
import { UpdatePostUseCase } from 'src/domains/posts/applications/use-cases/update-post.use-case';

@Injectable()
export class PostService {
  constructor(
    private readonly createPostUseCase: CreatePostUseCase,
    private readonly getFeedPostsUseCase: GetFeedPostsUseCase,
    private readonly getProfilePostsUseCase: GetProfilePostsUseCase,
    private readonly toggleReactionUseCase: ToggleReactionUseCase,
    private readonly updatePostUseCase: UpdatePostUseCase,
  ) {}

  async createPost(userId: string, createPostDto: CreatePostDto) {
    return this.createPostUseCase.execute(userId, createPostDto);
  }

  async getFeedPosts(userId: string, page = 1, limit = 10) {
    return this.getFeedPostsUseCase.execute(userId, page, limit);
  }

  async getProfilePosts(targetUserId: string, currentUserId: string) {
    return this.getProfilePostsUseCase.execute(targetUserId, currentUserId);
  }

  async toggleReaction(userId: string, postId: string, type: any) {
    return this.toggleReactionUseCase.execute(userId, postId, type);
  }

  async updatePost(userId: string, postId: string, updatePostDto: UpdatePostDto) {
    return this.updatePostUseCase.execute(userId, postId, updatePostDto);
  }
}
