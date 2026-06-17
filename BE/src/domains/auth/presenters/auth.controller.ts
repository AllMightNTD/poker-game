import { Controller, Get, Post, Req, Body, UseGuards } from '@nestjs/common';
import { FacebookAuthGuard } from 'src/v1/auth/guards/facebook-auth.guard';
import { AuthGuard } from 'src/v1/guards/auth.guard';

import { RegisterUseCase } from '../applications/use-cases/register.use-case';
import { LoginUseCase } from '../applications/use-cases/login.use-case';
import { LogoutUseCase } from '../applications/use-cases/logout.use-case';
import { ForgotPasswordUseCase } from '../applications/use-cases/forgot-password.use-case';
import { ResetPasswordUseCase } from '../applications/use-cases/reset-password.use-case';
import { ValidateFacebookUserUseCase } from '../applications/use-cases/validate-facebook-user.use-case';

@Controller()
export class AuthController {
  constructor(
    private readonly registerUseCase: RegisterUseCase,
    private readonly loginUseCase: LoginUseCase,
    private readonly logoutUseCase: LogoutUseCase,
    private readonly forgotPasswordUseCase: ForgotPasswordUseCase,
    private readonly resetPasswordUseCase: ResetPasswordUseCase,
    private readonly validateFacebookUserUseCase: ValidateFacebookUserUseCase,
  ) {}

  @Get('facebook')
  @UseGuards(FacebookAuthGuard)
  async facebookLogin() {
    // Handled by Passport
  }

  @Get('facebook/callback')
  @UseGuards(FacebookAuthGuard)
  async facebookLoginCallback(@Req() req) {
    return this.validateFacebookUserUseCase.execute(req.user);
  }

  @Post('register')
  async register(@Body() registerDto: any) {
    return this.registerUseCase.execute(registerDto);
  }

  @Post('login')
  async login(@Body() loginDto: any) {
    return this.loginUseCase.execute(loginDto);
  }

  @Post('forgot-password')
  async forgotPassword(@Body() requestPasswordResetDto: any) {
    return this.forgotPasswordUseCase.execute(requestPasswordResetDto);
  }

  @Post('reset-password')
  async resetPassword(@Body() resetPasswordDto: any) {
    return this.resetPasswordUseCase.execute(resetPasswordDto);
  }

  @UseGuards(AuthGuard)
  @Post('logout')
  async logout(@Req() req) {
    return this.logoutUseCase.execute(req.user.sub);
  }

  @Get('test')
  public getTest(@Req() request) {
    return 1;
  }
}
