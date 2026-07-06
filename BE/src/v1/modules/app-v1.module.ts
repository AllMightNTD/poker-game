import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { AppV1Route } from '../app-v1.route';
import { AuthModule } from '../auth/auth.module';
import { BlogsModule } from '../blogs/blogs.module';
import { JwtRefreshStrategy } from '../strategy/jwt-refresh.strategy';
import { UserModule } from '../user/user.module';
import { AdminModule } from './admin.module';
import { PokerLobbyModule } from './poker-lobby.module';

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
    UserModule,
    PokerLobbyModule,
    BlogsModule,
    AdminModule,
  ],

  providers: [JwtRefreshStrategy],
  exports: [JwtModule],
})
export class AppV1Module {
  // empty
}
