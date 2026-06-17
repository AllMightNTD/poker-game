import { Controller, Get, Post, Req, Body, UseGuards } from '@nestjs/common';
import { FacebookAuthGuard } from '../guards/facebook-auth.guard';
import { AuthService } from '../services/auth/auth.service';
import { AuthGuard } from '../../guards/auth.guard';
import { RegisterDto, LoginDto } from '../dto/auth.dto';
import { RequestPasswordResetDto } from '../dto/request-reset-password.dto';
import { ResetPasswordDto } from '../dto/reset-password.dto';

@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Get('facebook')
  @UseGuards(FacebookAuthGuard)
  async facebookLogin() {
    // Luồng này sẽ được Passport xử lý và chuyển hướng sang Facebook
  }

  @Get('facebook/callback')
  @UseGuards(FacebookAuthGuard)
  async facebookLoginCallback(@Req() req) {
    return this.authService.validateFacebookUser(req.user);
  }

  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('forgot-password')
  async forgotPassword(@Body() requestPasswordResetDto: RequestPasswordResetDto) {
    return this.authService.forgotPassword(requestPasswordResetDto);
  }

  @Post('reset-password')
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return this.authService.resetPassword(resetPasswordDto);
  }

  @UseGuards(AuthGuard)
  @Post('logout')
  async logout(@Req() req) {
    return this.authService.logout(req.user.sub);
  }

  @Get('test')
  public getTest(@Req() request) {
    return 1;
  }
}
