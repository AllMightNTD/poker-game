import { Logger, UsePipes, ValidationPipe } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

import { ChatService } from './chat.service';
import { SendMessageDto } from './dto/send-message.dto';
import { PresenceStatus } from 'src/constants/enums';
import { User } from '../entities/user.entity';

@WebSocketGateway({
  cors: {
    origin: ['http://localhost:3000'],
    credentials: true,
  },
  transports: ['websocket'],
})
@UsePipes(
  new ValidationPipe({
    transform: true,
    whitelist: true,
  }),
)
export class ChatGateway
  implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private logger = new Logger(ChatGateway.name);

  constructor(
    private readonly jwtService: JwtService,
    private readonly chatService: ChatService,
  ) { }

  afterInit() {
    this.logger.log('WebSocket Server Initialized');
  }

  async handleConnection(client: Socket) {
    try {
      const token =
        client.handshake.auth?.token ||
        client.handshake.headers?.authorization?.split(' ')[1];

      if (!token) {
        throw new Error('No token');
      }

      const decoded = this.jwtService.verify(token);
      const userId = decoded.sub;

      client.data.user = {
        id: userId,
      };

      const presence = await this.chatService.handleConnection(
        userId,
        client.id,
      );

      client.join(`user_${userId}`);

      client.emit('connected', {
        message: 'Successfully connected',
      });

      this.logger.log(
        `Client connected: ${client.id} (User: ${userId})`,
      );

      // Broadcast presence status to friends
      if (presence) {
        const isActive = await this.chatService.getUserActiveStatus(userId);
        const broadcastStatus = (presence.is_invisible || !isActive) ? PresenceStatus.OFFLINE : PresenceStatus.ONLINE;
        await this.broadcastPresenceUpdate(userId, broadcastStatus, presence.last_seen_at);
      }
    } catch (error) {
      this.logger.error(`SOCKET AUTH ERROR: ${error.message}`);
      client.emit("error", {
        message: error.message,
      });
      client.disconnect();
    }
  }

  async handleDisconnect(client: Socket) {
    const userId = client.data?.user?.id;
    await this.chatService.handleDisconnect(client.id);
    this.logger.log(
      `Socket disconnected: ${client.id}`,
    );

    if (userId) {
      const activeConnections = await this.chatService.countActiveConnections(userId);
      if (activeConnections === 0) {
        const presence = await this.chatService.getUserPresence(userId);
        const lastSeen = presence?.last_seen_at || new Date();
        await this.broadcastPresenceUpdate(userId, PresenceStatus.OFFLINE, lastSeen);
      }
    }
  }

  @SubscribeMessage('ping')
  handlePing(@ConnectedSocket() client: Socket) {
    client.emit('pong', {
      time: new Date(),
    });
  }

  @SubscribeMessage('joinConversation')
  async handleJoinConversation(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { conversation_id: string },
  ) {
    const userId = client.data.user.id;
    const isParticipant = await this.chatService.checkParticipant(userId, data.conversation_id);

    if (isParticipant) {
      client.join(`conversation_${data.conversation_id}`);
      this.logger.log(`User ${userId} joined conversation ${data.conversation_id}`);
    } else {
      client.emit('error', { message: 'You are not a participant of this conversation' });
    }
  }

  @SubscribeMessage('sendMessage')
  async handleSendMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() dto: SendMessageDto,
  ) {
    const userId = client.data.user.id;

    console.log("sendMessage", dto);

    // 1. Kiểm tra participant
    const isParticipant = await this.chatService.checkParticipant(userId, dto.conversation_id);
    if (!isParticipant) {
      client.emit('error', { message: 'Unauthorized' });
      return;
    }

    // 2. Lưu tin nhắn
    const savedMessage = await this.chatService.saveMessage(userId, dto);

    // 3. Broadcast cho tất cả trong room NGOẠI TRỪ người gửi
    client.to(`conversation_${dto.conversation_id}`).emit('newMessage', savedMessage);

    // 4. Emit riêng messageSent cho người gửi để confirm
    client.emit('messageSent', savedMessage);
  }

  @SubscribeMessage('deleteMessage')
  async handleDeleteMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { conversation_id: string; message_id: string },
  ) {
    const userId = client.data.user.id;
    const deleted = await this.chatService.deleteMessage(userId, data.message_id);
    if (deleted) {
      this.server.to(`conversation_${data.conversation_id}`).emit('messageDeleted', {
        message_id: data.message_id,
        conversation_id: data.conversation_id,
      });
    } else {
      client.emit('error', { message: 'Failed to delete message' });
    }
  }

  @SubscribeMessage('seenMessage')
  async handleSeenMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { conversation_id: string; message_id: string },
  ) {
    const userId = client.data.user.id;
    await this.chatService.markAsRead(userId, data.conversation_id, data.message_id);
    this.server.to(`conversation_${data.conversation_id}`).emit('messageSeen', {
      user_id: userId,
      conversation_id: data.conversation_id,
      message_id: data.message_id,
    });
  }

  @SubscribeMessage('changeThemeColor')
  async handleChangeThemeColor(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { conversation_id: string; theme_color: string },
  ) {
    const userId = client.data.user.id;
    const color = await this.chatService.updateThemeColor(userId, data.conversation_id, data.theme_color);
    if (color) {
      this.server.to(`conversation_${data.conversation_id}`).emit('themeColorChanged', {
        conversation_id: data.conversation_id,
        theme_color: color,
      });
    } else {
      client.emit('error', { message: 'Unauthorized or failed to update theme' });
    }
  }

  @SubscribeMessage('changeMainEmoji')
  async handleChangeMainEmoji(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { conversation_id: string; emoji: string },
  ) {
    const userId = client.data.user.id;
    const emoji = await this.chatService.updateMainEmoji(userId, data.conversation_id, data.emoji);
    if (emoji) {
      this.server.to(`conversation_${data.conversation_id}`).emit('mainEmojiChanged', {
        conversation_id: data.conversation_id,
        emoji: emoji,
      });
    } else {
      client.emit('error', { message: 'Unauthorized or failed to update emoji' });
    }
  }

  @SubscribeMessage('changeNickname')
  async handleChangeNickname(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { conversation_id: string; target_user_id: string; nickname: string },
  ) {
    const userId = client.data.user.id;
    const res = await this.chatService.updateNickname(userId, data.conversation_id, data.target_user_id, data.nickname);
    if (res) {
      this.server.to(`conversation_${data.conversation_id}`).emit('nicknameChanged', {
        conversation_id: data.conversation_id,
        target_user_id: data.target_user_id,
        nickname: data.nickname,
      });
    } else {
      client.emit('error', { message: 'Unauthorized or failed to update nickname' });
    }
  }

  @SubscribeMessage('changeBackgroundImage')
  async handleChangeBackgroundImage(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { conversation_id: string; background_image: string },
  ) {
    const userId = client.data.user.id;
    const bgUrl = await this.chatService.updateBackgroundImage(userId, data.conversation_id, data.background_image);
    if (bgUrl !== null) {
      this.server.to(`conversation_${data.conversation_id}`).emit('backgroundImageChanged', {
        conversation_id: data.conversation_id,
        background_image: bgUrl,
      });
    } else {
      client.emit('error', { message: 'Unauthorized or failed to update background image' });
    }
  }

  // ---- NEW PRESENCE SYSTEM WEBSOCKET HANDLERS ----

  async broadcastPresenceUpdate(userId: string, status: string, lastSeenAt: Date) {
    try {
      const friendIds = await this.chatService.getFriendUserIds(userId);
      for (const friendId of friendIds) {
        this.server.to(`user_${friendId}`).emit('userPresenceChange', {
          userId,
          status,
          last_seen_at: lastSeenAt,
        });
      }
    } catch (error) {
      this.logger.error(`Error broadcasting presence for user ${userId}: ${error.message}`);
    }
  }

  @SubscribeMessage('heartbeat')
  async handleHeartbeat(@ConnectedSocket() client: Socket) {
    const userId = client.data?.user?.id;
    if (userId) {
      await this.chatService.updateLastPing(client.id);
      client.emit('heartbeatAck', { time: new Date() });
    }
  }

  @SubscribeMessage('user_idle')
  async handleUserIdle(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { is_idle: boolean },
  ) {
    const userId = client.data?.user?.id;
    if (userId) {
      const newStatus = data.is_idle ? PresenceStatus.AWAY : PresenceStatus.ONLINE;
      const presence = await this.chatService.updateUserPresenceStatus(userId, newStatus);
      if (presence) {
        const isActive = await this.chatService.getUserActiveStatus(userId);
        const broadcastStatus = (presence.is_invisible || !isActive) ? PresenceStatus.OFFLINE : newStatus;
        await this.broadcastPresenceUpdate(userId, broadcastStatus, presence.last_seen_at);
      }
    }
  }

  @SubscribeMessage('change_visibility')
  async handleChangeVisibility(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { is_invisible: boolean },
  ) {
    const userId = client.data?.user?.id;
    if (userId) {
      const presence = await this.chatService.updateUserVisibility(userId, data.is_invisible);
      if (presence) {
        const isActive = await this.chatService.getUserActiveStatus(userId);
        const broadcastStatus = (presence.is_invisible || !isActive) ? PresenceStatus.OFFLINE : presence.status;
        await this.broadcastPresenceUpdate(userId, broadcastStatus, presence.last_seen_at);
        client.emit('visibilityChanged', { is_invisible: presence.is_invisible });
      }
    }
  }

  @SubscribeMessage('typing_start')
  async handleTypingStart(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { conversation_id: string },
  ) {
    const userId = client.data.user.id;
    client.to(`conversation_${data.conversation_id}`).emit('user_typing_start', {
      conversation_id: data.conversation_id,
      user_id: userId,
    });
  }

  @SubscribeMessage('typing_stop')
  async handleTypingStop(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { conversation_id: string },
  ) {
    const userId = client.data.user.id;
    client.to(`conversation_${data.conversation_id}`).emit('user_typing_stop', {
      conversation_id: data.conversation_id,
      user_id: userId,
    });
  }

  @SubscribeMessage('joinStoryRoom')
  async handleJoinStoryRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { storyOwnerId: string },
  ) {
    client.join(`story_user_${data.storyOwnerId}`);
    this.logger.log(`Socket ${client.id} joined story room of user ${data.storyOwnerId}`);
  }

  @SubscribeMessage('leaveStoryRoom')
  async handleLeaveStoryRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { storyOwnerId: string },
  ) {
    client.leave(`story_user_${data.storyOwnerId}`);
    this.logger.log(`Socket ${client.id} left story room of user ${data.storyOwnerId}`);
  }

  @SubscribeMessage('sendStoryReaction')
  async handleSendStoryReaction(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { storyOwnerId: string; storyId: string; emoji: string },
  ) {
    const userId = client.data.user.id;
    const profile = await this.chatService.getUserProfile(userId);
    
    const reactionPayload = {
      storyId: data.storyId,
      emoji: data.emoji,
      userId,
      userName: profile?.full_name || 'Người dùng KnowBlock',
      avatarUrl: profile?.avatar_url || null,
    };

    // Broadcast tới tất cả client đang ở trong room story của owner này
    this.server.to(`story_user_${data.storyOwnerId}`).emit('newStoryReaction', reactionPayload);
    this.logger.log(`User ${userId} reacted ${data.emoji} to story ${data.storyId}`);
  }
}