import { Module } from '@nestjs/common';
import { RouterModule, Routes } from '@nestjs/core';
import { AuthModule } from './auth/auth.module';
import { BlogsModule } from './blogs/blogs.module';
import { BotModule } from './bots/bot.module';
import { ClubsModule } from './clubs/clubs.module';
import { AdminModule } from './modules/admin.module';
import { PokerLobbyModule } from './modules/poker-lobby.module';
import { UserModule } from './user/user.module';

const routes: Routes = [
  {
    path: 'v1',
    children: [
      { path: 'auth', module: AuthModule },
      { path: 'user', module: UserModule },
    ],
  },
  {
    path: 'v1',
    module: PokerLobbyModule,
  },
  {
    path: 'v1',
    module: BotModule,
  },
  {
    path: 'v1',
    module: BlogsModule,
  },
  {
    path: 'v1',
    module: AdminModule,
  },
  {
    path: 'v1',
    module: ClubsModule,
  },
];

@Module({
  imports: [RouterModule.register(routes)],
  exports: [RouterModule],
})
export class AppV1Route {}
