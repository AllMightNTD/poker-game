import { Injectable } from '@nestjs/common';
import { RegisterDto, LoginDto } from '../../dto/auth.dto';
import { RequestPasswordResetDto } from '../../dto/request-reset-password.dto';
import { ResetPasswordDto } from '../../dto/reset-password.dto';

import { RegisterUseCase } from 'src/domains/auth/applications/use-cases/register.use-case';
import { LoginUseCase } from 'src/domains/auth/applications/use-cases/login.use-case';
import { LogoutUseCase } from 'src/domains/auth/applications/use-cases/logout.use-case';
import { ForgotPasswordUseCase } from 'src/domains/auth/applications/use-cases/forgot-password.use-case';
import { ResetPasswordUseCase } from 'src/domains/auth/applications/use-cases/reset-password.use-case';
import { ValidateFacebookUserUseCase } from 'src/domains/auth/applications/use-cases/validate-facebook-user.use-case';

@Injectable()
export class AuthService {
  constructor(
    private readonly registerUseCase: RegisterUseCase,
    private readonly loginUseCase: LoginUseCase,
    private readonly logoutUseCase: LogoutUseCase,
    private readonly forgotPasswordUseCase: ForgotPasswordUseCase,
    private readonly resetPasswordUseCase: ResetPasswordUseCase,
    private readonly validateFacebookUserUseCase: ValidateFacebookUserUseCase,
  ) {}

  async validateFacebookUser(facebookUser: any) {
    return this.validateFacebookUserUseCase.execute(facebookUser);
  }

  async register(registerDto: RegisterDto) {
    return this.registerUseCase.execute(registerDto);
  }

  async login(loginDto: LoginDto) {
    return this.loginUseCase.execute(loginDto);
  }

  async logout(userId: string) {
    return this.logoutUseCase.execute(userId);
  }

  async forgotPassword(requestPasswordResetDto: RequestPasswordResetDto) {
    return this.forgotPasswordUseCase.execute(requestPasswordResetDto);
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto) {
    return this.resetPasswordUseCase.execute(resetPasswordDto);
  }
}
