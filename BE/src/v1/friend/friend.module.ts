import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Friend } from '../entities/friend.entity';
import { FriendRequest } from '../entities/friend_request.entity';
import { User } from '../entities/user.entity';
import { Notification } from '../entities/notification.entity';
import { FriendController } from './friend.controller';
import { FriendService } from './friend.service';
import { FriendsModule } from 'src/domains/friends/friends.module';
import { ChatModule } from '../chat/chat.module';
import { NotificationModule } from '../notification/notification.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Friend, FriendRequest, User, Notification]),
    FriendsModule,
    ChatModule,
    NotificationModule,
  ],
  controllers: [FriendController],
  providers: [FriendService],
  exports: [FriendService, FriendsModule],
})
export class FriendModule {}
