import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Post } from 'src/v1/entities/post.entity';
import { PostMedia } from 'src/v1/entities/post_media.entity';
import { Reaction } from 'src/v1/entities/reaction.entity';
import { TypeOrmPostRepository } from './infrastructure/persistence/typeorm-post.repository';
import { PostGateway } from 'src/v1/post/post.gateway';

import { CreatePostUseCase } from './applications/use-cases/create-post.use-case';
import { GetFeedPostsUseCase } from './applications/use-cases/get-feed-posts.use-case';
import { GetProfilePostsUseCase } from './applications/use-cases/get-profile-posts.use-case';
import { ToggleReactionUseCase } from './applications/use-cases/toggle-reaction.use-case';
import { UpdatePostUseCase } from './applications/use-cases/update-post.use-case';

const useCases = [
  CreatePostUseCase,
  GetFeedPostsUseCase,
  GetProfilePostsUseCase,
  ToggleReactionUseCase,
  UpdatePostUseCase,
];

@Module({
  imports: [
    TypeOrmModule.forFeature([Post, PostMedia, Reaction]),
  ],
  providers: [
    ...useCases,
    PostGateway,
    {
      provide: 'IPostRepository',
      useClass: TypeOrmPostRepository,
    },
  ],
  exports: [
    'IPostRepository',
    ...useCases,
    PostGateway,
  ],
})
export class PostsModule {}
