import { Global, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppV1Route } from './app-v1.route';
import { AuthModule } from './auth/auth.module';
import { JwtRefreshStrategy } from './strategy/jwt-refresh.strategy';
import { UserModule } from './user/user.module';
import { PokerLobbyModule } from './modules/poker-lobby.module';
import { BlogsModule } from './blogs/blogs.module';

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
  ],

  providers: [JwtRefreshStrategy],
  exports: [JwtModule],
})
export class AppV1Module {
  // empty
}
