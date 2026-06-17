import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Comment } from '../entities/comment.entity';
import { Post } from '../entities/post.entity';
import { CommentController } from './comment.controller';
import { CommentService } from './comment.service';
import { CommentsModule } from 'src/domains/comments/comments.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Comment, Post]),
    CommentsModule,
  ],
  controllers: [CommentController],
  providers: [CommentService],
  exports: [CommentService, CommentsModule],
})
export class CommentModule {}
