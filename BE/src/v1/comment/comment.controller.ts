import {
  Body,
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Request,
  UseGuards,
  UseInterceptors,
  UploadedFiles,
  BadRequestException,
  Param,
  Query,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { AuthGuard } from '../guards/auth.guard';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { CommentService } from './comment.service';
import { diskStorage } from 'multer';
import { extname } from 'path';
import * as fs from 'fs';
import { CommentTargetType } from 'src/constants/enums';

const storage = diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = './public/uploads/comments';
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, `${uniqueSuffix}${extname(file.originalname)}`);
  },
});

@Controller('')
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  @UseGuards(AuthGuard)
  @Get('/:targetType/:targetId')
  async getComments(
    @Param('targetType') targetType: CommentTargetType,
    @Param('targetId') targetId: string,
    @Query()
    query: { page?: number; limit?: number; sort?: 'newest' | 'oldest' },
  ) {
    return this.commentService.getComments(targetType, targetId, query);
  }

  @UseGuards(AuthGuard)
  @Get('/:commentId/replies')
  async getReplies(
    @Param('commentId') commentId: string,
    @Query() query: { page?: number; limit?: number },
  ) {
    return this.commentService.getReplies(commentId, query);
  }

  @UseGuards(AuthGuard)
  @Post('/')
  async createComment(
    @Request() req,
    @Body() createCommentDto: CreateCommentDto,
  ) {
    return this.commentService.createComment(req.user.sub, createCommentDto);
  }

  @UseGuards(AuthGuard)
  @Put('/:commentId')
  async updateComment(
    @Request() req,
    @Param('commentId') commentId: string,
    @Body() updateCommentDto: UpdateCommentDto,
  ) {
    return this.commentService.updateComment(
      req.user.sub,
      commentId,
      updateCommentDto,
    );
  }

  @UseGuards(AuthGuard)
  @Delete('/:commentId')
  async deleteComment(@Request() req, @Param('commentId') commentId: string) {
    return this.commentService.deleteComment(req.user.sub, commentId);
  }

  @UseGuards(AuthGuard)
  @Post('/upload')
  @UseInterceptors(
    FilesInterceptor('files', 1, {
      storage,
      limits: { fileSize: 20 * 1024 * 1024 }, // tối đa 20MB
    }),
  )
  async uploadFiles(@UploadedFiles() files: Express.Multer.File[]) {
    if (!files || files.length === 0) {
      throw new BadRequestException('No files uploaded');
    }
    const file = files[0];
    const fileUrl = `/uploads/comments/${file.filename}`;
    const fileType = file.mimetype.startsWith('video/') ? 'video' : 'image';

    return {
      metadata: [
        {
          file_url: fileUrl,
          type: fileType,
        },
      ],
    };
  }
}
