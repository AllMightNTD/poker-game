import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ConversationType, MessageType } from 'src/constants/enums';
import { User } from 'src/domains/users/infrastructure/persistence/typeorm-user.entity';
import { Block } from 'src/v1/entities/block.entity';
import { Conversation } from 'src/v1/entities/conversation.entity';
import { ConversationParticipant } from 'src/v1/entities/conversation_participant.entity';
import { Friend } from 'src/v1/entities/friend.entity';
import { Message } from 'src/v1/entities/message.entity';
import { MessageReaction } from 'src/v1/entities/message_reaction.entity';
import { Post } from 'src/v1/entities/post.entity';
import { Profile } from 'src/v1/entities/profile.entity';
import { UserBlock } from 'src/v1/entities/user_block.entity';
import { UserPresence } from 'src/v1/entities/user_presence.entity';
import { WsConnection } from 'src/v1/entities/ws_connection.entity';
import { In, Repository } from 'typeorm';
import { IChatRepository } from '../../domain/repositories/chat.repository.interface';

@Injectable()
export class TypeOrmChatRepository implements IChatRepository {
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
    @InjectRepository(Profile)
    private readonly profileRepo: Repository<Profile>,
    @InjectRepository(UserBlock)
    private readonly userBlockRepo: Repository<UserBlock>,
  ) {}

  async checkParticipant(
    userId: string,
    conversationId: string,
  ): Promise<boolean> {
    const participant = await this.participantRepo.findOne({
      where: { user_id: userId, conversation_id: conversationId },
    });
    return !!participant;
  }

  async getMessages(conversationId: string, page: number, limit: number) {
    const [data, total] = await this.messageRepo.findAndCount({
      where: { conversation_id: conversationId },
      order: { created_at: 'DESC' },
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
      data: data.reverse(),
      total,
      page,
      limit,
    };
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
    const blockedUsers = await this.conversationRepo.manager
      .getRepository(Block)
      .find({
        where: [{ blocker_id: userId }, { blocked_id: userId }],
      });
    const blockedUserIds = new Set(
      blockedUsers.map((b) =>
        b.blocker_id === userId ? b.blocked_id : b.blocker_id,
      ),
    );

    const query = this.conversationRepo
      .createQueryBuilder('c')
      .innerJoin('c.participants', 'p', 'p.user_id = :userId', { userId })
      .leftJoinAndSelect('c.last_message', 'lm')
      .leftJoinAndSelect('lm.sender', 'lms')
      .leftJoinAndSelect('lms.profile', 'lmsp')
      .leftJoinAndSelect('c.participants', 'all_p')
      .leftJoinAndSelect('all_p.user', 'u')
      .leftJoinAndSelect('u.profile', 'up');

    if (search) {
      query.andWhere(
        'EXISTS (' +
          'SELECT 1 FROM conversation_participants cp ' +
          'INNER JOIN users u2 ON u2.id = cp.user_id ' +
          'INNER JOIN profiles prof ON prof.user_id = u2.id ' +
          'WHERE cp.conversation_id = c.id ' +
          'AND cp.user_id != :userId ' +
          'AND (prof.full_name LIKE :searchPattern OR prof.username LIKE :searchPattern)' +
          ')',
        { userId, searchPattern: `%${search}%` },
      );
    }

    if (tab === 'archived') {
      query.andWhere('p.is_archived = :isArchived', { isArchived: true });
    } else if (tab === 'hidden') {
      query.andWhere('p.is_hidden = :isHidden', { isHidden: true });
    } else if (tab === 'spam') {
      query.andWhere('p.is_spam = :isSpam', { isSpam: true });
    } else if (tab === 'request') {
      query.andWhere('p.is_request = :isRequest', { isRequest: true });
    } else {
      query
        .andWhere('p.is_archived = :isArchived', { isArchived: false })
        .andWhere('p.is_hidden = :isHidden', { isHidden: false })
        .andWhere('p.is_spam = :isSpam', { isSpam: false })
        .andWhere('p.is_request = :isRequest', { isRequest: false });

      if (tab === 'group') {
        query.andWhere('c.type = :groupType', { groupType: 'group' });
      } else if (tab === 'unread') {
        query
          .andWhere('c.last_message_id IS NOT NULL')
          .andWhere('lm.sender_id != :userId', { userId })
          .andWhere(
            '(p.last_read_message_id IS NULL OR p.last_read_message_id != c.last_message_id)',
          );
      }
    }

    query.orderBy('c.created_at', 'DESC');

    const [conversations, total] = await query
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    let data = await Promise.all(
      conversations.map(async (conv) => {
        const currentUserParticipant = conv.participants.find(
          (p) => p.user_id === userId,
        );

        let unreadCount = 0;
        if (currentUserParticipant) {
          const lastReadId = currentUserParticipant.last_read_message_id;

          const unreadQuery = this.messageRepo
            .createQueryBuilder('m')
            .where('m.conversation_id = :convId', { convId: conv.id })
            .andWhere('m.sender_id != :userId', { userId });

          if (lastReadId) {
            const lastReadMessage = await this.messageRepo.findOne({
              where: { id: lastReadId },
            });
            if (lastReadMessage) {
              unreadQuery.andWhere('m.created_at > :lastReadTime', {
                lastReadTime: lastReadMessage.created_at,
              });
            }
          }
          unreadCount = await unreadQuery.getCount();
        }

        const otherParticipants = conv.participants.filter(
          (p) => p.user_id !== userId,
        );

        return {
          ...conv,
          unreadCount,
          is_pinned: currentUserParticipant?.is_pinned || false,
          is_archived: currentUserParticipant?.is_archived || false,
          is_hidden: currentUserParticipant?.is_hidden || false,
          is_spam: currentUserParticipant?.is_spam || false,
          is_request: currentUserParticipant?.is_request || false,
          otherParticipants: otherParticipants.map((p) => ({
            user_id: p.user_id,
            nickname: p.nickname,
            role: p.role,
            user: {
              id: p.user?.id,
              email: p.user?.email,
              profile: p.user?.profile,
              is_active_status: p.user?.is_active_status !== false,
            },
          })),
        };
      }),
    );

    data = data.filter((conv) => {
      if (conv.type === 'direct' || conv.type === 'private') {
        const otherUser = conv.otherParticipants[0]?.user_id;
        if (otherUser && blockedUserIds.has(otherUser)) {
          return false;
        }
      }
      return true;
    });

    let virtualCount = 0;
    if (!tab || tab === 'all') {
      const friendships = await this.friendRepo.find({
        where: [{ user_id: userId }, { friend_id: userId }],
        relations: [
          'user',
          'user.profile',
          'friend_user',
          'friend_user.profile',
        ],
      });

      const existingConvUserIds = new Set(
        data
          .filter((c) => c.type === 'direct' || c.type === 'private')
          .map((c) => c.otherParticipants[0]?.user_id),
      );

      for (const f of friendships) {
        const isUser1 = f.user_id === userId;
        const friendId = isUser1 ? f.friend_id : f.user_id;
        const friendUser = isUser1 ? f.friend_user : f.user;

        if (
          !existingConvUserIds.has(friendId) &&
          friendUser &&
          !blockedUserIds.has(friendId)
        ) {
          let matchesSearch = true;
          if (search) {
            const queryStr = search.toLowerCase();
            const fullName = friendUser.profile?.full_name?.toLowerCase() || '';
            const username = friendUser.profile?.username?.toLowerCase() || '';
            matchesSearch =
              fullName.includes(queryStr) || username.includes(queryStr);
          }

          if (matchesSearch) {
            virtualCount++;
            existingConvUserIds.add(friendId);
            data.push({
              id: `virtual_${friendId}`,
              type: 'direct',
              created_at: f.created_at,
              last_message: null,
              unreadCount: 0,
              is_pinned: false,
              is_archived: false,
              is_hidden: false,
              is_spam: false,
              is_request: false,
              participants: [],
              otherParticipants: [
                {
                  user_id: friendId,
                  user: {
                    id: friendUser.id,
                    email: friendUser.email,
                    profile: friendUser.profile,
                    is_active_status: friendUser.is_active_status !== false,
                  },
                },
              ],
            } as any);
          }
        }
      }
    }

    data.sort((a, b) => {
      const isPinnedA = a.is_pinned ? 1 : 0;
      const isPinnedB = b.is_pinned ? 1 : 0;

      if (isPinnedA !== isPinnedB) {
        return isPinnedB - isPinnedA;
      }

      const timeA = a.last_message
        ? new Date(a.last_message.created_at).getTime()
        : new Date(a.created_at).getTime();
      const timeB = b.last_message
        ? new Date(b.last_message.created_at).getTime()
        : new Date(b.created_at).getTime();
      return timeB - timeA;
    });

    return {
      data,
      total: total + virtualCount,
      page,
      limit,
    };
  }

  async markAsRead(userId: string, conversationId: string, messageId: string) {
    await this.participantRepo.update(
      { user_id: userId, conversation_id: conversationId },
      { last_read_message_id: messageId },
    );
  }

  async markAllAsRead(userId: string) {
    const participants = await this.participantRepo.find({
      where: { user_id: userId },
      relations: ['conversation'],
    });

    for (const participant of participants) {
      if (
        participant.conversation &&
        participant.conversation.last_message_id
      ) {
        participant.last_read_message_id =
          participant.conversation.last_message_id;
        await this.participantRepo.save(participant);
      }
    }
  }

  async togglePinConversation(
    userId: string,
    conversationId: string,
    isPinned: boolean,
  ): Promise<boolean> {
    const participant = await this.participantRepo.findOne({
      where: { user_id: userId, conversation_id: conversationId },
    });
    if (!participant) {
      throw new BadRequestException('Conversation participant not found');
    }
    participant.is_pinned = isPinned;
    await this.participantRepo.save(participant);
    return true;
  }

  async getMedia(
    conversationId: string,
    page: number,
    limit: number,
    type?: 'image' | 'video' | 'file',
  ) {
    const types: MessageType[] = [];
    if (type) {
      if (type === 'image') types.push(MessageType.IMAGE);
      if (type === 'video') types.push(MessageType.VIDEO);
      if (type === 'file') types.push(MessageType.FILE);
    } else {
      types.push(MessageType.IMAGE, MessageType.VIDEO, MessageType.FILE);
    }

    const [data, total] = await this.messageRepo.findAndCount({
      where: {
        conversation_id: conversationId,
        type: In(types),
      },
      order: { created_at: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      data,
      total,
      page,
      limit,
    };
  }

  async leaveConversation(
    userId: string,
    conversationId: string,
  ): Promise<boolean> {
    const isParticipant = await this.checkParticipant(userId, conversationId);
    if (!isParticipant) return false;

    await this.participantRepo.delete({
      conversation_id: conversationId,
      user_id: userId,
    });

    const remainingCount = await this.participantRepo.count({
      where: { conversation_id: conversationId },
    });

    if (remainingCount === 0) {
      await this.conversationRepo.delete({ id: conversationId });
    }

    return true;
  }

  async toggleMuteConversation(
    userId: string,
    conversationId: string,
    isMuted: boolean,
  ): Promise<boolean> {
    const participant = await this.participantRepo.findOne({
      where: { user_id: userId, conversation_id: conversationId },
    });
    if (!participant)
      throw new BadRequestException('Conversation participant not found');
    participant.is_muted = isMuted;
    await this.participantRepo.save(participant);
    return true;
  }

  async toggleArchiveConversation(
    userId: string,
    conversationId: string,
    isArchived: boolean,
  ): Promise<boolean> {
    const participant = await this.participantRepo.findOne({
      where: { user_id: userId, conversation_id: conversationId },
    });
    if (!participant)
      throw new BadRequestException('Conversation participant not found');
    participant.is_archived = isArchived;
    await this.participantRepo.save(participant);
    return true;
  }

  async toggleHideConversation(
    userId: string,
    conversationId: string,
    isHidden: boolean,
  ): Promise<boolean> {
    const participant = await this.participantRepo.findOne({
      where: { user_id: userId, conversation_id: conversationId },
    });
    if (!participant)
      throw new BadRequestException('Conversation participant not found');
    participant.is_hidden = isHidden;
    await this.participantRepo.save(participant);
    return true;
  }

  async toggleSpamConversation(
    userId: string,
    conversationId: string,
    isSpam: boolean,
  ): Promise<boolean> {
    const participant = await this.participantRepo.findOne({
      where: { user_id: userId, conversation_id: conversationId },
    });
    if (!participant)
      throw new BadRequestException('Conversation participant not found');
    participant.is_spam = isSpam;
    await this.participantRepo.save(participant);
    return true;
  }

  async toggleRequestConversation(
    userId: string,
    conversationId: string,
    isRequest: boolean,
  ): Promise<boolean> {
    const participant = await this.participantRepo.findOne({
      where: { user_id: userId, conversation_id: conversationId },
    });
    if (!participant)
      throw new BadRequestException('Conversation participant not found');
    participant.is_request = isRequest;
    await this.participantRepo.save(participant);
    return true;
  }

  async markAsUnread(userId: string, conversationId: string): Promise<boolean> {
    const participant = await this.participantRepo.findOne({
      where: { user_id: userId, conversation_id: conversationId },
    });
    if (!participant)
      throw new BadRequestException('Conversation participant not found');
    participant.last_read_message_id = null;
    await this.participantRepo.save(participant);
    return true;
  }

  async blockUser(blockerId: string, blockedId: string): Promise<boolean> {
    let block = await this.userBlockRepo.findOne({
      where: { blocker_id: blockerId, blocked_id: blockedId },
    });
    if (!block) {
      block = this.userBlockRepo.create({
        blocker_id: blockerId,
        blocked_id: blockedId,
      });
      await this.userBlockRepo.save(block);
    }
    return true;
  }

  async unblockUser(blockerId: string, blockedId: string): Promise<boolean> {
    await this.userBlockRepo.delete({
      blocker_id: blockerId,
      blocked_id: blockedId,
    });
    return true;
  }

  async getOrCreateConversation(userId: string, friendId: string) {
    const friendExists = await this.conversationRepo.manager
      .getRepository(User)
      .findOne({ where: { id: friendId } });

    if (!friendExists) {
      throw new NotFoundException('Friend/User not found');
    }

    const existingConversation = await this.conversationRepo
      .createQueryBuilder('c')
      .innerJoin('c.participants', 'p1', 'p1.user_id = :userId', { userId })
      .innerJoin('c.participants', 'p2', 'p2.user_id = :friendId', { friendId })
      .where('c.type IN (:...types)', {
        types: [ConversationType.PRIVATE, ConversationType.DIRECT],
      })
      .orderBy('c.created_at', 'DESC')
      .getOne();

    let conversationId: string;

    if (existingConversation) {
      conversationId = existingConversation.id;
    } else {
      const newConversation = this.conversationRepo.create({
        type: ConversationType.DIRECT,
        created_by: userId,
      });
      const savedConversation =
        await this.conversationRepo.save(newConversation);
      conversationId = savedConversation.id;

      await this.participantRepo.save([
        { conversation_id: savedConversation.id, user_id: userId },
        { conversation_id: savedConversation.id, user_id: friendId },
      ]);
    }

    const conversation = await this.conversationRepo.findOne({
      where: { id: conversationId },
      relations: ['participants'],
    });

    return {
      conversation_id: conversation.id,
      theme_color: conversation.theme_color,
      emoji: conversation.emoji,
      background_image: conversation.background_image,
      participants: conversation.participants.map((p) => ({
        user_id: p.user_id,
        nickname: p.nickname,
      })),
    };
  }
}
