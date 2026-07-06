import { Module } from '@nestjs/common';
import { RouterModule, Routes } from '@nestjs/core';
import { AdminModule } from './admin/admin.module';
import { AuthModule } from './auth/auth.module';
import { BlogsModule } from './blogs/blogs.module';
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
    module: BlogsModule,
  },
  {
    path: 'v1',
    module: AdminModule,
  }
];

@Module({
  imports: [RouterModule.register(routes)],
  exports: [RouterModule],
})
export class AppV1Route { }
