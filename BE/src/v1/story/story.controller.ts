import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Request,
  UseGuards,
  UseInterceptors,
  UploadedFiles,
  BadRequestException,
  Query,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import * as fs from 'fs';
import { AuthGuard } from '../guards/auth.guard';
import { StoryService } from './story.service';
import { CreateStoryDto } from './dto/create-story.dto';

const storage = diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = './public/uploads/stories';
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
@UseGuards(AuthGuard)
export class StoryController {
  constructor(private readonly storyService: StoryService) {}

  @Post()
  async createStory(@Request() req, @Body() createStoryDto: CreateStoryDto) {
    const userId = req.user.sub;
    return await this.storyService.createStory(userId, createStoryDto);
  }

  @Get('feed')
  async getStoryFeed(@Request() req) {
    const userId = req.user.sub;
    return await this.storyService.getStoryFeed(userId);
  }

  @Get('archive')
  async getStoryArchive(@Request() req) {
    const userId = req.user.sub;
    return await this.storyService.getStoryArchive(userId);
  }

  @Post('upload')
  @UseInterceptors(
    FilesInterceptor('files', 1, {
      storage,
      limits: { fileSize: 50 * 1024 * 1024 }, // Tối đa 50MB cho Video ngắn
    }),
  )
  async uploadFiles(@UploadedFiles() files: Express.Multer.File[]) {
    if (!files || files.length === 0) {
      throw new BadRequestException('No files uploaded');
    }
    const file = files[0];
    const fileUrl = `/uploads/stories/${file.filename}`;
    const fileType = file.mimetype.startsWith('video/') ? 'video' : 'image';

    return {
      file_url: fileUrl,
      type: fileType,
    };
  }

  @Post(':id/view')
  async viewStory(@Request() req, @Param('id') storyId: string) {
    const userId = req.user.sub;
    return await this.storyService.viewStory(userId, storyId);
  }

  @Get(':id/viewers')
  async getStoryViewers(@Request() req, @Param('id') storyId: string) {
    const userId = req.user.sub;
    return await this.storyService.getStoryViewers(userId, storyId);
  }

  @Post(':id/react')
  async reactStory(@Request() req, @Param('id') storyId: string, @Body() body: { emoji: string }) {
    const userId = req.user.sub;
    return await this.storyService.reactStory(userId, storyId, body.emoji);
  }

  @Delete(':id')
  async deleteStory(@Request() req, @Param('id') storyId: string) {
    const userId = req.user.sub;
    return await this.storyService.deleteStory(userId, storyId);
  }

  @Get('zingmp3/search')
  async searchZingMp3(@Query('q') query: string) {
    if (!query) return [];
    return await this.storyService.searchZingMp3(query);
  }

  @Get('zingmp3/song/:id')
  async getZingMp3SongStream(@Param('id') songId: string) {
    return await this.storyService.getZingMp3SongStream(songId);
  }

  @Get('zingmp3/lyrics/:id')
  async getZingMp3SongLyrics(@Param('id') songId: string) {
    return await this.storyService.getZingMp3SongLyrics(songId);
  }
}
