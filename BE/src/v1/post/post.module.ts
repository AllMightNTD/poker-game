import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Post } from '../entities/post.entity';
import { PostMedia } from '../entities/post_media.entity';
import { Reaction } from '../entities/reaction.entity';
import { PostController } from './post.controller';
import { PostService } from './post.service';
import { PostsModule } from 'src/domains/posts/posts.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Post, PostMedia, Reaction]),
    PostsModule,
  ],
  controllers: [PostController],
  providers: [PostService],
  exports: [PostService, PostsModule],
})
export class PostModule {}
