import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WsConnection } from '../entities/ws_connection.entity';
import { UserPresence } from '../entities/user_presence.entity';
import { Post } from '../entities/post.entity';
import { MessageReaction } from '../entities/message_reaction.entity';
import { Friend } from '../entities/friend.entity';
import { Profile } from '../entities/profile.entity';
import { Message } from '../entities/message.entity';
import { Conversation } from '../entities/conversation.entity';
import { ConversationParticipant } from '../entities/conversation_participant.entity';
import { User } from '../entities/user.entity';
import { DeviceType, PresenceStatus, MessageType } from 'src/constants/enums';
import { SendMessageDto } from './dto/send-message.dto';

import { IChatRepository } from 'src/domains/chat/domain/repositories/chat.repository.interface';
import { GetOrCreateConversationUseCase } from 'src/domains/chat/applications/use-cases/get-or-create-conversation.use-case';
import { CheckParticipantUseCase } from 'src/domains/chat/applications/use-cases/check-participant.use-case';
import { GetMessagesUseCase } from 'src/domains/chat/applications/use-cases/get-messages.use-case';
import { GetConversationsUseCase } from 'src/domains/chat/applications/use-cases/get-conversations.use-case';
import { MarkAsReadUseCase } from 'src/domains/chat/applications/use-cases/mark-as-read.use-case';
import { MarkAllAsReadUseCase } from 'src/domains/chat/applications/use-cases/mark-all-as-read.use-case';
import { TogglePinConversationUseCase } from 'src/domains/chat/applications/use-cases/toggle-pin-conversation.use-case';
import { GetMediaUseCase } from 'src/domains/chat/applications/use-cases/get-media.use-case';
import { LeaveConversationUseCase } from 'src/domains/chat/applications/use-cases/leave-conversation.use-case';
import { ToggleMuteConversationUseCase } from 'src/domains/chat/applications/use-cases/toggle-mute-conversation.use-case';
import { ToggleArchiveConversationUseCase } from 'src/domains/chat/applications/use-cases/toggle-archive-conversation.use-case';
import { ToggleHideConversationUseCase } from 'src/domains/chat/applications/use-cases/toggle-hide-conversation.use-case';
import { ToggleSpamConversationUseCase } from 'src/domains/chat/applications/use-cases/toggle-spam-conversation.use-case';
import { ToggleRequestConversationUseCase } from 'src/domains/chat/applications/use-cases/toggle-request-conversation.use-case';
import { MarkAsUnreadUseCase } from 'src/domains/chat/applications/use-cases/mark-as-unread.use-case';
import { BlockUserUseCase } from 'src/domains/chat/applications/use-cases/block-user.use-case';
import { UnblockUserUseCase } from 'src/domains/chat/applications/use-cases/unblock-user.use-case';

@Injectable()
export class ChatService implements OnModuleInit {
  private readonly logger = new Logger(ChatService.name);

  constructor(
    @Inject('IChatRepository')
    private readonly chatRepository: IChatRepository,
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
    @InjectRepository(Profile)
    private readonly profileRepo: Repository<Profile>,
    @InjectRepository(Message)
    private readonly messageRepo: Repository<Message>,
    @InjectRepository(Conversation)
    private readonly conversationRepo: Repository<Conversation>,
    @InjectRepository(ConversationParticipant)
    private readonly participantRepo: Repository<ConversationParticipant>,

    private readonly getOrCreateConversationUseCase: GetOrCreateConversationUseCase,
    private readonly checkParticipantUseCase: CheckParticipantUseCase,
    private readonly getMessagesUseCase: GetMessagesUseCase,
    private readonly getConversationsUseCase: GetConversationsUseCase,
    private readonly markAsReadUseCase: MarkAsReadUseCase,
    private readonly markAllAsReadUseCase: MarkAllAsReadUseCase,
    private readonly togglePinConversationUseCase: TogglePinConversationUseCase,
    private readonly getMediaUseCase: GetMediaUseCase,
    private readonly leaveConversationUseCase: LeaveConversationUseCase,
    private readonly toggleMuteConversationUseCase: ToggleMuteConversationUseCase,
    private readonly toggleArchiveConversationUseCase: ToggleArchiveConversationUseCase,
    private readonly toggleHideConversationUseCase: ToggleHideConversationUseCase,
    private readonly toggleSpamConversationUseCase: ToggleSpamConversationUseCase,
    private readonly toggleRequestConversationUseCase: ToggleRequestConversationUseCase,
    private readonly markAsUnreadUseCase: MarkAsUnreadUseCase,
    private readonly blockUserUseCase: BlockUserUseCase,
    private readonly unblockUserUseCase: UnblockUserUseCase,
  ) {}

  async onModuleInit() {
    try {
      const serverId = process.env.APP_SERVER_ID || 'node-1';
      await this.wsConnectionRepo.delete({ server_id: serverId });
      this.logger.log(`Cleaned up zombie connections for server ${serverId}`);
    } catch (error) {
      this.logger.warn(
        `Could not clean up zombie connections: ${error.message}`,
      );
    }
  }

  async handleConnection(userId: string, socketId: string) {
    try {
      const newConnection = this.wsConnectionRepo.create({
        user_id: userId,
        socket_id: socketId,
        server_id: 'node-1',
        device_type: DeviceType.WEB,
        connected_at: new Date(),
        last_ping_at: new Date(),
      });
      await this.wsConnectionRepo.save(newConnection);

      let presence = await this.userPresenceRepo.findOne({
        where: { user_id: userId },
      });
      if (!presence) {
        presence = this.userPresenceRepo.create({ user_id: userId });
      }
      presence.status = PresenceStatus.ONLINE;
      presence.last_seen_at = new Date();
      const savedPresence = await this.userPresenceRepo.save(presence);

      this.logger.log(`User ${userId} connected with socket ${socketId}`);
      return savedPresence;
    } catch (error) {
      this.logger.error(
        `Error in handleConnection for user ${userId}: ${error.message}`,
      );
      return null;
    }
  }

  async handleDisconnect(socketId: string) {
    try {
      const connection = await this.wsConnectionRepo.findOne({
        where: { socket_id: socketId },
      });
      if (connection) {
        const userId = connection.user_id;
        await this.wsConnectionRepo.remove(connection);

        const activeConnections = await this.wsConnectionRepo.count({
          where: { user_id: userId },
        });
        if (activeConnections === 0) {
          const presence = await this.userPresenceRepo.findOne({
            where: { user_id: userId },
          });
          if (presence) {
            presence.status = PresenceStatus.OFFLINE;
            presence.last_seen_at = new Date();
            await this.userPresenceRepo.save(presence);
          }
        }
        this.logger.log(
          `User ${userId} disconnected, socket ${socketId} removed`,
        );
      }
    } catch (error) {
      this.logger.error(
        `Error in handleDisconnect for socket ${socketId}: ${error.message}`,
      );
    }
  }

  async checkParticipant(
    userId: string,
    conversationId: string,
  ): Promise<boolean> {
    return this.checkParticipantUseCase.execute(userId, conversationId);
  }

  async getConversationParticipantIds(
    conversationId: string,
  ): Promise<string[]> {
    const participants = await this.participantRepo.find({
      where: { conversation_id: conversationId },
      select: ['user_id'],
    });
    return participants.map((p) => p.user_id);
  }

  async saveMessage(userId: string, dto: SendMessageDto): Promise<Message> {
    const message = this.messageRepo.create({
      conversation_id: dto.conversation_id,
      sender_id: userId,
      content: dto.content,
      type: dto.type || MessageType.TEXT,
      reply_to_id: dto.reply_to_id,
    });

    const savedMessage = await this.messageRepo.save(message);

    await this.conversationRepo.update(
      { id: dto.conversation_id },
      { last_message_id: savedMessage.id },
    );

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
      { last_ping_at: new Date() },
    );
  }

  async markAsRead(userId: string, conversationId: string, messageId: string) {
    return this.markAsReadUseCase.execute(userId, conversationId, messageId);
  }

  async markAllAsRead(userId: string): Promise<boolean> {
    await this.markAllAsReadUseCase.execute(userId);
    return true;
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
    const message = await this.messageRepo.findOne({
      where: { id: messageId, sender_id: userId },
    });
    if (!message) return null;

    message.content = content;
    message.edited_at = new Date();
    return this.messageRepo.save(message);
  }

  async deleteMessage(userId: string, messageId: string) {
    const message = await this.messageRepo.findOne({
      where: { id: messageId, sender_id: userId },
    });
    if (!message) return false;

    await this.messageRepo.softRemove(message);
    return true;
  }

  async getMessages(conversationId: string, page: number, limit: number) {
    return this.getMessagesUseCase.execute(conversationId, page, limit);
  }

  async updateThemeColor(
    userId: string,
    conversationId: string,
    color: string,
  ) {
    const isParticipant = await this.checkParticipant(userId, conversationId);
    if (!isParticipant) return null;

    await this.conversationRepo.update(
      { id: conversationId },
      { theme_color: color },
    );
    return color;
  }

  async updateMainEmoji(userId: string, conversationId: string, emoji: string) {
    const isParticipant = await this.checkParticipant(userId, conversationId);
    if (!isParticipant) return null;

    await this.conversationRepo.update(
      { id: conversationId },
      { emoji: emoji },
    );
    return emoji;
  }

  async updateNickname(
    userId: string,
    conversationId: string,
    targetUserId: string,
    nickname: string,
  ) {
    const isSenderParticipant = await this.checkParticipant(
      userId,
      conversationId,
    );
    const isTargetParticipant = await this.checkParticipant(
      targetUserId,
      conversationId,
    );
    if (!isSenderParticipant || !isTargetParticipant) return null;

    await this.participantRepo.update(
      { conversation_id: conversationId, user_id: targetUserId },
      { nickname: nickname || null },
    );
    return { targetUserId, nickname };
  }

  async updateBackgroundImage(
    userId: string,
    conversationId: string,
    bgUrl: string,
  ) {
    const isParticipant = await this.checkParticipant(userId, conversationId);
    if (!isParticipant) return null;

    await this.conversationRepo.update(
      { id: conversationId },
      { background_image: bgUrl || null },
    );
    return bgUrl;
  }

  async getFriendUserIds(userId: string): Promise<string[]> {
    const friendships = await this.friendRepo.find({
      where: [{ user_id: userId }, { friend_id: userId }],
    });
    const friendIds = friendships.map((f) =>
      f.user_id === userId ? f.friend_id : f.user_id,
    );
    return Array.from(new Set(friendIds));
  }

  async getUserPresence(userId: string): Promise<UserPresence | null> {
    return this.userPresenceRepo.findOne({ where: { user_id: userId } });
  }

  async countActiveConnections(userId: string): Promise<number> {
    return this.wsConnectionRepo.count({ where: { user_id: userId } });
  }

  async updateUserPresenceStatus(
    userId: string,
    status: PresenceStatus,
  ): Promise<UserPresence> {
    let presence = await this.userPresenceRepo.findOne({
      where: { user_id: userId },
    });
    if (!presence) {
      presence = this.userPresenceRepo.create({ user_id: userId });
    }
    presence.status = status;
    presence.last_seen_at = new Date();
    return this.userPresenceRepo.save(presence);
  }

  async updateUserVisibility(
    userId: string,
    isInvisible: boolean,
  ): Promise<UserPresence> {
    let presence = await this.userPresenceRepo.findOne({
      where: { user_id: userId },
    });
    if (!presence) {
      presence = this.userPresenceRepo.create({ user_id: userId });
    }
    presence.is_invisible = isInvisible;
    presence.last_seen_at = new Date();
    return this.userPresenceRepo.save(presence);
  }

  async getUserProfile(userId: string): Promise<Profile | null> {
    return await this.profileRepo.findOne({
      where: { user_id: userId },
    });
  }

  async getConversations(
    userId: string,
    page: number,
    limit: number,
    search?: string,
    tab?:
      | 'all'
      | 'unread'
      | 'group'
      | 'request'
      | 'archived'
      | 'hidden'
      | 'spam',
  ) {
    return this.getConversationsUseCase.execute(
      userId,
      page,
      limit,
      search,
      tab,
    );
  }

  async getMedia(
    conversationId: string,
    page: number,
    limit: number,
    type?: 'image' | 'video' | 'file',
  ) {
    return this.getMediaUseCase.execute(conversationId, page, limit, type);
  }

  async leaveConversation(userId: string, conversationId: string) {
    return this.leaveConversationUseCase.execute(userId, conversationId);
  }

  async togglePinConversation(
    userId: string,
    conversationId: string,
    isPinned: boolean,
  ): Promise<boolean> {
    return this.togglePinConversationUseCase.execute(
      userId,
      conversationId,
      isPinned,
    );
  }

  async getUserActiveStatus(userId: string): Promise<boolean> {
    const user = await this.conversationRepo.manager
      .getRepository(User)
      .findOne({ where: { id: userId } });
    return user?.is_active_status !== false;
  }

  async toggleMuteConversation(
    userId: string,
    conversationId: string,
    isMuted: boolean,
  ): Promise<boolean> {
    return this.toggleMuteConversationUseCase.execute(
      userId,
      conversationId,
      isMuted,
    );
  }

  async toggleArchiveConversation(
    userId: string,
    conversationId: string,
    isArchived: boolean,
  ): Promise<boolean> {
    return this.toggleArchiveConversationUseCase.execute(
      userId,
      conversationId,
      isArchived,
    );
  }

  async toggleHideConversation(
    userId: string,
    conversationId: string,
    isHidden: boolean,
  ): Promise<boolean> {
    return this.toggleHideConversationUseCase.execute(
      userId,
      conversationId,
      isHidden,
    );
  }

  async toggleSpamConversation(
    userId: string,
    conversationId: string,
    isSpam: boolean,
  ): Promise<boolean> {
    return this.toggleSpamConversationUseCase.execute(
      userId,
      conversationId,
      isSpam,
    );
  }

  async toggleRequestConversation(
    userId: string,
    conversationId: string,
    isRequest: boolean,
  ): Promise<boolean> {
    return this.toggleRequestConversationUseCase.execute(
      userId,
      conversationId,
      isRequest,
    );
  }

  async markAsUnread(userId: string, conversationId: string): Promise<boolean> {
    return this.markAsUnreadUseCase.execute(userId, conversationId);
  }

  async blockUser(blockerId: string, blockedId: string): Promise<boolean> {
    return this.blockUserUseCase.execute(blockerId, blockedId);
  }

  async unblockUser(blockerId: string, blockedId: string): Promise<boolean> {
    return this.unblockUserUseCase.execute(blockerId, blockedId);
  }

  async getOrCreateConversation(userId: string, friendId: string) {
    return this.getOrCreateConversationUseCase.execute(userId, friendId);
  }
}
