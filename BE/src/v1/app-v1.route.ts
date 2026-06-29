import { Module } from '@nestjs/common';
import { RouterModule, Routes } from '@nestjs/core';
import { AdminModule } from './admin/admin.module';
import { AuthModule } from './auth/auth.module';
import { ChatModule } from './chat/chat.module';
import { CommentModule } from './comment/comment.module';
import { FriendModule } from './friend/friend.module';
import { GroupsModule } from '../domains/groups/groups.module';
import { NotificationModule } from './notification/notification.module';
import { PostModule } from './post/post.module';
import { SearchModule } from './search/search.module';
import { StoryModule } from './story/story.module';
import { UserModule } from './user/user.module';

const routes: Routes = [
  {
    path: 'v1',
    children: [
      { path: 'auth', module: AuthModule },
      { path: 'user', module: UserModule },
      { path: 'admin', module: AdminModule },
      { path: 'friend', module: FriendModule },
      { path: 'chat', module: ChatModule },
      { path: 'post', module: PostModule },
      { path: 'comment', module: CommentModule },
      { path: 'stories', module: StoryModule },
      { path: 'notifications', module: NotificationModule },
      { path: 'search', module: SearchModule },
      { path: 'groups', module: GroupsModule },
    ],
  },
];

@Module({
  imports: [RouterModule.register(routes)],
  exports: [RouterModule],
})
export class AppV1Route {}
