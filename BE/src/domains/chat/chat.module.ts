import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Conversation } from 'src/v1/entities/conversation.entity';
import { ConversationParticipant } from 'src/v1/entities/conversation_participant.entity';
import { Message } from 'src/v1/entities/message.entity';
import { WsConnection } from 'src/v1/entities/ws_connection.entity';
import { UserPresence } from 'src/v1/entities/user_presence.entity';
import { Post } from 'src/v1/entities/post.entity';
import { MessageReaction } from 'src/v1/entities/message_reaction.entity';
import { Friend } from 'src/v1/entities/friend.entity';
import { Profile } from 'src/v1/entities/profile.entity';
import { UserBlock } from 'src/v1/entities/user_block.entity';
import { Block } from 'src/v1/entities/block.entity';

import { TypeOrmChatRepository } from './infrastructure/persistence/typeorm-chat.repository';

import { GetOrCreateConversationUseCase } from './applications/use-cases/get-or-create-conversation.use-case';
import { CheckParticipantUseCase } from './applications/use-cases/check-participant.use-case';
import { GetMessagesUseCase } from './applications/use-cases/get-messages.use-case';
import { GetConversationsUseCase } from './applications/use-cases/get-conversations.use-case';
import { MarkAsReadUseCase } from './applications/use-cases/mark-as-read.use-case';
import { MarkAllAsReadUseCase } from './applications/use-cases/mark-all-as-read.use-case';
import { TogglePinConversationUseCase } from './applications/use-cases/toggle-pin-conversation.use-case';
import { GetMediaUseCase } from './applications/use-cases/get-media.use-case';
import { LeaveConversationUseCase } from './applications/use-cases/leave-conversation.use-case';
import { ToggleMuteConversationUseCase } from './applications/use-cases/toggle-mute-conversation.use-case';
import { ToggleArchiveConversationUseCase } from './applications/use-cases/toggle-archive-conversation.use-case';
import { ToggleHideConversationUseCase } from './applications/use-cases/toggle-hide-conversation.use-case';
import { ToggleSpamConversationUseCase } from './applications/use-cases/toggle-spam-conversation.use-case';
import { ToggleRequestConversationUseCase } from './applications/use-cases/toggle-request-conversation.use-case';
import { MarkAsUnreadUseCase } from './applications/use-cases/mark-as-unread.use-case';
import { BlockUserUseCase } from './applications/use-cases/block-user.use-case';
import { UnblockUserUseCase } from './applications/use-cases/unblock-user.use-case';

const useCases = [
  GetOrCreateConversationUseCase,
  CheckParticipantUseCase,
  GetMessagesUseCase,
  GetConversationsUseCase,
  MarkAsReadUseCase,
  MarkAllAsReadUseCase,
  TogglePinConversationUseCase,
  GetMediaUseCase,
  LeaveConversationUseCase,
  ToggleMuteConversationUseCase,
  ToggleArchiveConversationUseCase,
  ToggleHideConversationUseCase,
  ToggleSpamConversationUseCase,
  ToggleRequestConversationUseCase,
  MarkAsUnreadUseCase,
  BlockUserUseCase,
  UnblockUserUseCase,
];

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Conversation,
      ConversationParticipant,
      Message,
      WsConnection,
      UserPresence,
      Post,
      MessageReaction,
      Friend,
      Profile,
      UserBlock,
      Block,
    ]),
  ],
  providers: [
    ...useCases,
    {
      provide: 'IChatRepository',
      useClass: TypeOrmChatRepository,
    },
  ],
  exports: [
    'IChatRepository',
    ...useCases,
  ],
})
export class ChatsModule {}
