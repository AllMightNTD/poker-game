import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatGateway } from './chat.gateway';
import { ChatService } from './chat.service';
import { ChatController } from './chat.controller';
import { Conversation } from '../entities/conversation.entity';
import { ConversationParticipant } from '../entities/conversation_participant.entity';
import { Message } from '../entities/message.entity';
import { WsConnection } from '../entities/ws_connection.entity';
import { UserPresence } from '../entities/user_presence.entity';
import { Post } from '../entities/post.entity';
import { MessageReaction } from '../entities/message_reaction.entity';
import { Friend } from '../entities/friend.entity';
import { Profile } from '../entities/profile.entity';
import { UserBlock } from '../entities/user_block.entity';
import { ChatsModule } from 'src/domains/chat/chat.module';

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
    ]),
    ChatsModule,
  ],
  controllers: [ChatController],
  providers: [ChatGateway, ChatService],
  exports: [ChatGateway, ChatService],
})
export class ChatModule {}
