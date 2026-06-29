import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Delete,
  Query,
  Request,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { IsNotEmpty } from 'class-validator';

import * as fs from 'fs';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { AuthGuard } from '../guards/auth.guard';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { PostService } from './post.service';

export class ToggleReactionDto {
  @IsNotEmpty()
  type: string;
}

const storage = diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = './public/uploads/posts';
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
export class PostController {
  constructor(private readonly postService: PostService) {}

  @UseGuards(AuthGuard)
  @Post('/')
  async createPost(@Request() req, @Body() createPostDto: CreatePostDto) {
    return this.postService.createPost(req.user.sub, createPostDto);
  }

  @UseGuards(AuthGuard)
  @Get('/')
  async getFeedPosts(
    @Request() req,
    @Query('page') page = '1',
    @Query('limit') limit = '10',
  ) {
    return this.postService.getFeedPosts(
      req.user.sub,
      Number(page),
      Number(limit),
    );
  }

  @UseGuards(AuthGuard)
  @Get('/profile/:userId')
  async getProfilePosts(
    @Request() req,
    @Param('userId') targetUserId: string,
    @Query('page') page = '1',
    @Query('limit') limit = '10',
  ) {
    return this.postService.getProfilePosts(
      targetUserId,
      req.user.sub,
      Number(page),
      Number(limit),
    );
  }

  @UseGuards(AuthGuard)
  @Post('/upload')
  @UseInterceptors(
    FilesInterceptor('files', 10, {
      storage,
      limits: { fileSize: 50 * 1024 * 1024 }, // 50MB max
    }),
  )
  async uploadFiles(@UploadedFiles() files: Express.Multer.File[]) {
    if (!files || files.length === 0) {
      throw new BadRequestException('No files uploaded');
    }
    const uploadedFiles = files.map((file) => {
      const fileUrl = `/uploads/posts/${file.filename}`;
      return {
        file_url: fileUrl,
        type: file.mimetype.startsWith('video/') ? 'video' : 'image',
      };
    });
    return { metadata: uploadedFiles };
  }

  @UseGuards(AuthGuard)
  @Post('/:postId/reaction')
  async toggleReaction(
    @Request() req,
    @Param('postId') postId: string,
    @Body() toggleReactionDto: ToggleReactionDto,
  ) {
    return this.postService.toggleReaction(
      req.user.sub,
      postId,
      toggleReactionDto.type,
    );
  }

  @UseGuards(AuthGuard)
  @Put('/:postId')
  async updatePost(
    @Request() req,
    @Param('postId') postId: string,
    @Body() updatePostDto: UpdatePostDto,
  ) {
    return this.postService.updatePost(req.user.sub, postId, updatePostDto);
  }

  @UseGuards(AuthGuard)
  @Delete('/:postId')
  async deletePost(@Request() req, @Param('postId') postId: string) {
    return this.postService.deletePost(req.user.sub, postId);
  }

  @UseGuards(AuthGuard)
  @Delete('/media/:mediaId')
  async deleteMedia(@Request() req, @Param('mediaId') mediaId: string) {
    return this.postService.deleteMedia(req.user.sub, mediaId);
  }
}
