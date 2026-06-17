import {
  Controller,
  Get,
  Param,
  Query,
  Request,
  UseGuards,
  Post,
  UseInterceptors,
  UploadedFiles,
  BadRequestException,
  Delete,
  Body,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { AuthGuard } from '../guards/auth.guard';
import { ChatService } from './chat.service';
import { diskStorage } from 'multer';
import { extname } from 'path';
import * as fs from 'fs';

const storage = diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = './public/uploads/chat';
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
export class ChatController {
  constructor(
    private readonly chatService: ChatService,
  ) { }

  @Get('/conversation/:friendId')
  async getOrCreateConversation(@Request() req, @Param('friendId') friendId: string) {
    return this.chatService.getOrCreateConversation(req.user.sub, friendId);
  }

  @Get('/messages/:conversationId')
  async getMessages(
    @Request() req,
    @Param('conversationId') conversationId: string,
    @Query('page') page = 1,
    @Query('limit') limit = 20,
  ) {
    // Kiểm tra xem user có trong conversation này không
    const isParticipant = await this.chatService.checkParticipant(req.user.sub, conversationId);
    if (!isParticipant) {
      return { data: [], total: 0 };
    }

    return this.chatService.getMessages(conversationId, page, limit);
  }

  @Get('/conversations')
  async getConversations(
    @Request() req,
    @Query('page') page = 1,
    @Query('limit') limit = 20,
    @Query('search') search?: string,
    @Query('tab') tab?: 'all' | 'unread' | 'group' | 'request' | 'archived' | 'hidden' | 'spam',
  ) {
    return this.chatService.getConversations(
      req.user.sub,
      Number(page),
      Number(limit),
      search,
      tab,
    );
  }

  @Post('/conversations/seen')
  async markSeen(
    @Request() req,
    @Body() body: { conversation_id: string; message_id: string }
  ) {
    await this.chatService.markAsRead(req.user.sub, body.conversation_id, body.message_id);
    return { success: true };
  }

  @Post('/conversations/mark-all-read')
  async markAllRead(@Request() req) {
    await this.chatService.markAllAsRead(req.user.sub);
    return { success: true };
  }

  @Post('/conversations/:id/pin')
  async pinConversation(@Request() req, @Param('id') conversationId: string) {
    const success = await this.chatService.togglePinConversation(req.user.sub, conversationId, true);
    return { success };
  }

  @Post('/conversations/:id/unpin')
  async unpinConversation(@Request() req, @Param('id') conversationId: string) {
    const success = await this.chatService.togglePinConversation(req.user.sub, conversationId, false);
    return { success };
  }

  @Get('/conversations/:id/media')
  async getMedia(
    @Request() req,
    @Param('id') conversationId: string,
    @Query('page') page = 1,
    @Query('limit') limit = 20,
    @Query('type') type?: 'image' | 'video' | 'file',
  ) {
    const isParticipant = await this.chatService.checkParticipant(req.user.sub, conversationId);
    if (!isParticipant) {
      return { data: [], total: 0 };
    }
    return this.chatService.getMedia(conversationId, Number(page), Number(limit), type);
  }

  @Delete('/conversations/:id/leave')
  async leaveConversation(@Request() req, @Param('id') conversationId: string) {
    const success = await this.chatService.leaveConversation(req.user.sub, conversationId);
    return { success };
  }

  @Post('/upload')
  @UseInterceptors(
    FilesInterceptor('files', 5, {
      storage,
      limits: { fileSize: 500 * 1024 * 1024 }, // Tối đa 500MB
      fileFilter: (req, file, cb) => {
        const allowedImageExts = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];
        const allowedVideoExts = ['.mp4', '.mov', '.webm'];
        const ext = extname(file.originalname).toLowerCase();
        
        if (allowedImageExts.includes(ext) || allowedVideoExts.includes(ext)) {
          cb(null, true);
        } else {
          cb(new BadRequestException('Invalid file type'), false);
        }
      }
    }),
  )
  async uploadFiles(@UploadedFiles() files: Express.Multer.File[]) {
    if (!files || files.length === 0) {
      throw new BadRequestException('No files uploaded');
    }

    const metadata = files.map(file => {
      const fileUrl = `/uploads/chat/${file.filename}`;
      const isVideo = file.mimetype.startsWith('video/') || ['.mp4', '.mov', '.webm'].includes(extname(file.filename).toLowerCase());
      const fileType = isVideo ? 'video' : 'image';

      // Validate size
      if (isVideo && file.size > 500 * 1024 * 1024) {
        throw new BadRequestException('Video size must be less than 500MB');
      }
      if (!isVideo && file.size > 5 * 1024 * 1024) {
        throw new BadRequestException('Image size must be less than 5MB');
      }

      return {
        file_url: fileUrl,
        type: fileType,
        filename: file.originalname,
      };
    });

    return { metadata };
  }

  @Post('/conversations/:id/mute')
  async muteConversation(@Request() req, @Param('id') conversationId: string) {
    const success = await this.chatService.toggleMuteConversation(req.user.sub, conversationId, true);
    return { success };
  }

  @Post('/conversations/:id/unmute')
  async unmuteConversation(@Request() req, @Param('id') conversationId: string) {
    const success = await this.chatService.toggleMuteConversation(req.user.sub, conversationId, false);
    return { success };
  }

  @Post('/conversations/:id/archive')
  async archiveConversation(@Request() req, @Param('id') conversationId: string) {
    const success = await this.chatService.toggleArchiveConversation(req.user.sub, conversationId, true);
    return { success };
  }

  @Post('/conversations/:id/unarchive')
  async unarchiveConversation(@Request() req, @Param('id') conversationId: string) {
    const success = await this.chatService.toggleArchiveConversation(req.user.sub, conversationId, false);
    return { success };
  }

  @Post('/conversations/:id/hide')
  async hideConversation(@Request() req, @Param('id') conversationId: string) {
    const success = await this.chatService.toggleHideConversation(req.user.sub, conversationId, true);
    return { success };
  }

  @Post('/conversations/:id/unhide')
  async unhideConversation(@Request() req, @Param('id') conversationId: string) {
    const success = await this.chatService.toggleHideConversation(req.user.sub, conversationId, false);
    return { success };
  }

  @Post('/conversations/:id/spam')
  async spamConversation(@Request() req, @Param('id') conversationId: string) {
    const success = await this.chatService.toggleSpamConversation(req.user.sub, conversationId, true);
    return { success };
  }

  @Post('/conversations/:id/unspam')
  async unspamConversation(@Request() req, @Param('id') conversationId: string) {
    const success = await this.chatService.toggleSpamConversation(req.user.sub, conversationId, false);
    return { success };
  }

  @Post('/conversations/:id/request')
  async requestConversation(@Request() req, @Param('id') conversationId: string) {
    const success = await this.chatService.toggleRequestConversation(req.user.sub, conversationId, true);
    return { success };
  }

  @Post('/conversations/:id/unrequest')
  async unrequestConversation(@Request() req, @Param('id') conversationId: string) {
    const success = await this.chatService.toggleRequestConversation(req.user.sub, conversationId, false);
    return { success };
  }

  @Post('/conversations/:id/mark-unread')
  async markUnread(@Request() req, @Param('id') conversationId: string) {
    const success = await this.chatService.markAsUnread(req.user.sub, conversationId);
    return { success };
  }

  @Post('/users/:id/block')
  async blockUser(@Request() req, @Param('id') blockedId: string) {
    const success = await this.chatService.blockUser(req.user.sub, blockedId);
    return { success };
  }

  @Post('/users/:id/unblock')
  async unblockUser(@Request() req, @Param('id') blockedId: string) {
    const success = await this.chatService.unblockUser(req.user.sub, blockedId);
    return { success };
  }
}
