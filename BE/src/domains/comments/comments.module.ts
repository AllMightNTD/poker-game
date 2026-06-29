import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Comment } from 'src/v1/entities/comment.entity';
import { Post } from 'src/v1/entities/post.entity';
import { TypeOrmCommentRepository } from './infrastructure/persistence/typeorm-comment.repository';
import { CommentGateway } from 'src/v1/comment/comment.gateway';

import { GetCommentsUseCase } from './applications/use-cases/get-comments.use-case';
import { GetRepliesUseCase } from './applications/use-cases/get-replies.use-case';
import { CreateCommentUseCase } from './applications/use-cases/create-comment.use-case';
import { UpdateCommentUseCase } from './applications/use-cases/update-comment.use-case';
import { DeleteCommentUseCase } from './applications/use-cases/delete-comment.use-case';

const useCases = [
  GetCommentsUseCase,
  GetRepliesUseCase,
  CreateCommentUseCase,
  UpdateCommentUseCase,
  DeleteCommentUseCase,
];

@Module({
  imports: [TypeOrmModule.forFeature([Comment, Post])],
  providers: [
    ...useCases,
    CommentGateway,
    {
      provide: 'ICommentRepository',
      useClass: TypeOrmCommentRepository,
    },
  ],
  exports: ['ICommentRepository', ...useCases, CommentGateway],
})
export class CommentsModule {}
