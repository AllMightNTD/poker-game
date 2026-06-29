import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/v1/entities/user.entity';
import { Profile } from 'src/v1/entities/profile.entity';
import { RefreshToken } from 'src/v1/entities/refresh_token.entity';
import { TypeOrmAuthRepository } from './infrastructure/persistence/typeorm-auth.repository';
import { AuthController } from './presenters/auth.controller';
import { MailModule } from 'src/mail/mail.module';

import { RegisterUseCase } from './applications/use-cases/register.use-case';
import { LoginUseCase } from './applications/use-cases/login.use-case';
import { LogoutUseCase } from './applications/use-cases/logout.use-case';
import { ForgotPasswordUseCase } from './applications/use-cases/forgot-password.use-case';
import { ResetPasswordUseCase } from './applications/use-cases/reset-password.use-case';
import { ValidateFacebookUserUseCase } from './applications/use-cases/validate-facebook-user.use-case';

const useCases = [
  RegisterUseCase,
  LoginUseCase,
  LogoutUseCase,
  ForgotPasswordUseCase,
  ResetPasswordUseCase,
  ValidateFacebookUserUseCase,
];

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Profile, RefreshToken]),
    MailModule,
  ],
  controllers: [AuthController],
  providers: [
    ...useCases,
    {
      provide: 'IAuthRepository',
      useClass: TypeOrmAuthRepository,
    },
  ],
  exports: ['IAuthRepository', ...useCases],
})
export class AuthModule {}
