import { Global, Module } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
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

@Global()
@Module({
  imports: [
    AppV1Route, 
    AuthModule, 
    ChatModule, 
    UserModule, 
    AdminModule, 
    FriendModule, 
    PostModule,
    CommentModule,
    StoryModule
  ],

  providers: [JwtService, JwtRefreshStrategy],
  exports: [JwtService],
})
export class AppV1Module {
  // empty
}
