import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Friend } from '../entities/friend.entity';
import { FriendRequest } from '../entities/friend_request.entity';
import { User } from '../entities/user.entity';
import { Notification } from '../entities/notification.entity';
import { FriendController } from './friend.controller';
import { FriendService } from './friend.service';
import { FriendsModule } from 'src/domains/friends/friends.module';
import { ChatModule } from '../chat/chat.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Friend, FriendRequest, User, Notification]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('JWT_SECRET') || 'hard-to-guess-secret',
        signOptions: { expiresIn: '1h' },
      }),
    }),
    FriendsModule,
    ChatModule,
  ],
  controllers: [FriendController],
  providers: [FriendService],
  exports: [FriendService, FriendsModule],
})
export class FriendModule {}
