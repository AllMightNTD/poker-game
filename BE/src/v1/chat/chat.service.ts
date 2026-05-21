import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Conversation } from '../entities/conversation.entity';
import { ConversationParticipant } from '../entities/conversation_participant.entity';
import { Message } from '../entities/message.entity';
import { Post } from '../entities/post.entity';
import { UserPresence } from '../entities/user_presence.entity';
import { WsConnection } from '../entities/ws_connection.entity';
import { MessageReaction } from '../entities/message_reaction.entity';
import { DeviceType, PresenceStatus, MessageType } from 'src/constants/enums';
import { SendMessageDto } from './dto/send-message.dto';
import { Friend } from '../entities/friend.entity';

@Injectable()
export class ChatService implements OnModuleInit {
  private readonly logger = new Logger(ChatService.name);

  constructor(
    @InjectRepository(Conversation)
    private readonly conversationRepo: Repository<Conversation>,
    @InjectRepository(ConversationParticipant)
    private readonly participantRepo: Repository<ConversationParticipant>,
    @InjectRepository(Message)
    private readonly messageRepo: Repository<Message>,
    @InjectRepository(WsConnection)
    private readonly wsConnectionRepo: Repository<WsConnection>,
    @InjectRepository(UserPresence)
    private readonly userPresenceRepo: Repository<UserPresence>,
    @InjectRepository(Post)
    private readonly postRepo: Repository<Post>,
    @InjectRepository(MessageReaction)
    private readonly reactionRepo: Repository<MessageReaction>,
    @InjectRepository(Friend)
    private readonly friendRepo: Repository<Friend>,
  ) {}

  async onModuleInit() {
    try {
      // Khi server khởi chạy, xóa tất cả các kết nối cũ của chính nó (tránh zombie records)
      const serverId = process.env.APP_SERVER_ID || 'node-1';
      await this.wsConnectionRepo.delete({ server_id: serverId });
      this.logger.log(`Cleaned up zombie connections for server ${serverId}`);
    } catch (error) {
      this.logger.warn(`Could not clean up zombie connections: ${error.message}. This is normal if the table doesn't exist yet.`);
    }
  }

  async handleConnection(userId: string, socketId: string) {
    try {
      // 1. Save WS Connection
      const newConnection = this.wsConnectionRepo.create({
        user_id: userId,
        socket_id: socketId,
        server_id: 'node-1', // Có thể config động nếu scale
        device_type: DeviceType.WEB, // Default
        connected_at: new Date(),
        last_ping_at: new Date(),
      });
      await this.wsConnectionRepo.save(newConnection);

      // 2. Update User Presence
      let presence = await this.userPresenceRepo.findOne({ where: { user_id: userId } });
      if (!presence) {
        presence = this.userPresenceRepo.create({ user_id: userId });
      }
      presence.status = PresenceStatus.ONLINE;
      presence.last_seen_at = new Date();
      const savedPresence = await this.userPresenceRepo.save(presence);

      this.logger.log(`User ${userId} connected with socket ${socketId}`);
      return savedPresence;
    } catch (error) {
      this.logger.error(`Error in handleConnection for user ${userId}: ${error.message}`);
      return null;
    }
  }

  async handleDisconnect(socketId: string) {
    try {
      const connection = await this.wsConnectionRepo.findOne({ where: { socket_id: socketId } });
      if (connection) {
        const userId = connection.user_id;
        await this.wsConnectionRepo.remove(connection);

        // Kiểm tra xem user còn connection nào khác không (nếu đăng nhập nhiều thiết bị)
        const activeConnections = await this.wsConnectionRepo.count({ where: { user_id: userId } });
        if (activeConnections === 0) {
          const presence = await this.userPresenceRepo.findOne({ where: { user_id: userId } });
          if (presence) {
            presence.status = PresenceStatus.OFFLINE;
            presence.last_seen_at = new Date();
            await this.userPresenceRepo.save(presence);
          }
        }
        this.logger.log(`User ${userId} disconnected, socket ${socketId} removed`);
      }
    } catch (error) {
      this.logger.error(`Error in handleDisconnect for socket ${socketId}: ${error.message}`);
    }
  }

  async checkParticipant(userId: string, conversationId: string): Promise<boolean> {
    const participant = await this.participantRepo.findOne({
      where: { user_id: userId, conversation_id: conversationId },
    });
    return !!participant;
  }

  async saveMessage(userId: string, dto: SendMessageDto): Promise<Message> {
    // Lưu message
    const message = this.messageRepo.create({
      conversation_id: dto.conversation_id,
      sender_id: userId,
      content: dto.content,
      type: dto.type || MessageType.TEXT,
      reply_to_id: dto.reply_to_id,
    });
    
    const savedMessage = await this.messageRepo.save(message);

    // Cập nhật last_message_id ở Conversation
    await this.conversationRepo.update(
      { id: dto.conversation_id },
      { last_message_id: savedMessage.id }
    );

    // Query full message with relations
    return this.messageRepo.findOne({
      where: { id: savedMessage.id },
      relations: [
        'sender',
        'sender.profile',
        'reply_to',
        'reply_to.sender',
        'reply_to.sender.profile',
      ],
    });
  }

  async incrementPostView(postId: string) {
    await this.postRepo.increment({ id: postId }, 'view_count', 1);
  }

  async updateLastPing(socketId: string) {
    await this.wsConnectionRepo.update(
      { socket_id: socketId },
      { last_ping_at: new Date() }
    );
  }

  async markAsRead(userId: string, conversationId: string, messageId: string) {
    await this.participantRepo.update(
      { user_id: userId, conversation_id: conversationId },
      { last_read_message_id: messageId }
    );
  }

  async addReaction(userId: string, messageId: string, emoji: string) {
    const reaction = this.reactionRepo.create({
      user_id: userId,
      message_id: messageId,
      emoji: emoji,
    });
    return this.reactionRepo.save(reaction);
  }

  async removeReaction(userId: string, messageId: string, emoji: string) {
    await this.reactionRepo.delete({
      user_id: userId,
      message_id: messageId,
      emoji: emoji,
    });
  }

  async editMessage(userId: string, messageId: string, content: string) {
    const message = await this.messageRepo.findOne({ where: { id: messageId, sender_id: userId } });
    if (!message) return null;

    message.content = content;
    message.edited_at = new Date();
    return this.messageRepo.save(message);
  }

  async deleteMessage(userId: string, messageId: string) {
    const message = await this.messageRepo.findOne({ where: { id: messageId, sender_id: userId } });
    if (!message) return false;

    await this.messageRepo.softRemove(message);
    return true;
  }

  async getMessages(conversationId: string, page: number, limit: number) {
    const [data, total] = await this.messageRepo.findAndCount({
      where: { conversation_id: conversationId },
      order: { created_at: 'ASC' },
      skip: (page - 1) * limit,
      take: limit,
      relations: [
        'sender',
        'sender.profile',
        'reply_to',
        'reply_to.sender',
        'reply_to.sender.profile',
      ],
    });

    return {
      data,
      total,
      page,
      limit,
    };
  }

  async updateThemeColor(userId: string, conversationId: string, color: string) {
    const isParticipant = await this.checkParticipant(userId, conversationId);
    if (!isParticipant) return null;

    await this.conversationRepo.update({ id: conversationId }, { theme_color: color });
    return color;
  }

  async updateMainEmoji(userId: string, conversationId: string, emoji: string) {
    const isParticipant = await this.checkParticipant(userId, conversationId);
    if (!isParticipant) return null;

    await this.conversationRepo.update({ id: conversationId }, { emoji: emoji });
    return emoji;
  }

  async updateNickname(userId: string, conversationId: string, targetUserId: string, nickname: string) {
    const isSenderParticipant = await this.checkParticipant(userId, conversationId);
    const isTargetParticipant = await this.checkParticipant(targetUserId, conversationId);
    if (!isSenderParticipant || !isTargetParticipant) return null;

    await this.participantRepo.update({ conversation_id: conversationId, user_id: targetUserId }, { nickname: nickname || null });
    return { targetUserId, nickname };
  }

  async updateBackgroundImage(userId: string, conversationId: string, bgUrl: string) {
    const isParticipant = await this.checkParticipant(userId, conversationId);
    if (!isParticipant) return null;

    await this.conversationRepo.update({ id: conversationId }, { background_image: bgUrl || null });
    return bgUrl;
  }

  // ---- NEW PRESENCE SYSTEM HELPERS ----

  async getFriendUserIds(userId: string): Promise<string[]> {
    const friendships = await this.friendRepo.find({
      where: [
        { user_id: userId },
        { friend_id: userId },
      ],
    });
    const friendIds = friendships.map((f) => (f.user_id === userId ? f.friend_id : f.user_id));
    return Array.from(new Set(friendIds));
  }

  async getUserPresence(userId: string): Promise<UserPresence | null> {
    return this.userPresenceRepo.findOne({ where: { user_id: userId } });
  }

  async countActiveConnections(userId: string): Promise<number> {
    return this.wsConnectionRepo.count({ where: { user_id: userId } });
  }

  async updateUserPresenceStatus(userId: string, status: PresenceStatus): Promise<UserPresence> {
    let presence = await this.userPresenceRepo.findOne({ where: { user_id: userId } });
    if (!presence) {
      presence = this.userPresenceRepo.create({ user_id: userId });
    }
    presence.status = status;
    presence.last_seen_at = new Date();
    return this.userPresenceRepo.save(presence);
  }

  async updateUserVisibility(userId: string, isInvisible: boolean): Promise<UserPresence> {
    let presence = await this.userPresenceRepo.findOne({ where: { user_id: userId } });
    if (!presence) {
      presence = this.userPresenceRepo.create({ user_id: userId });
    }
    presence.is_invisible = isInvisible;
    presence.last_seen_at = new Date();
    return this.userPresenceRepo.save(presence);
  }
}
