import { Module } from '@nestjs/common';
import { RouterModule, Routes } from '@nestjs/core';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { PokerLobbyModule } from './modules/poker-lobby.module';
import { BlogsModule } from './blogs/blogs.module';

const routes: Routes = [
  {
    path: 'v1',
    children: [
      { path: 'auth', module: AuthModule },
      { path: 'user', module: UserModule },
      { path: 'blogs', module: BlogsModule },
      { path: '', module: PokerLobbyModule },
    ],
  },
];

@Module({
  imports: [RouterModule.register(routes)],
  exports: [RouterModule],
})
export class AppV1Route {}
