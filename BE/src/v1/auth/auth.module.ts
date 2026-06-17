import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { AuthController } from './controllers/auth.controller';
import { AuthService } from './services/auth/auth.service';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../entities/user.entity';
import { Profile } from '../entities/profile.entity';
import { RefreshToken } from '../entities/refresh_token.entity';
import { FacebookStrategy } from '../strategy/facebook.strategy';
import { MailModule } from 'src/mail/mail.module';
import { AuthModule as DomainsAuthModule } from 'src/domains/auth/auth.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    TypeOrmModule.forFeature([User, Profile, RefreshToken]),
    PassportModule.register({ defaultStrategy: 'facebook' }),
    MailModule,
    DomainsAuthModule,
  ],
  providers: [AuthService, FacebookStrategy],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}
