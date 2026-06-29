import { Global, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AdminModule } from './admin/admin.module';
import { AppV1Route } from './app-v1.route';
import { AuthModule } from './auth/auth.module';
import { ChatModule } from './chat/chat.module';
import { FriendModule } from './friend/friend.module';
import { JwtRefreshStrategy } from './strategy/jwt-refresh.strategy';
import { UserModule } from './user/user.module';
import { PostModule } from './post/post.module';
import { CommentModule } from './comment/comment.module';
import { StoryModule } from './story/story.module';
import { NotificationModule } from './notification/notification.module';
import { SearchModule } from './search/search.module';
import { GroupsModule } from '../domains/groups/groups.module';
import { PageModule } from './page/page.module';
import { PokerLobbyModule } from './poker-lobby/poker-lobby.module';

@Global()
@Module({
  imports: [
    JwtModule.registerAsync({
      global: true,
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('JWT_SECRET') || 'hard-to-guess-secret',
        signOptions: { expiresIn: '1h' },
      }),
    }),
    AppV1Route,
    AuthModule,
    ChatModule,
    UserModule,
    PokerLobbyModule,
    AdminModule,
    FriendModule,
    PostModule,
    CommentModule,
    StoryModule,
    NotificationModule,
    SearchModule,
    GroupsModule,
    PageModule,
  ],

  providers: [JwtRefreshStrategy],
  exports: [JwtModule],
})
export class AppV1Module {
  // empty
}
