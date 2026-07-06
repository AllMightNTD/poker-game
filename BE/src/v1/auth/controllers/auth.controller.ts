import {
  Controller, Get, Post, Req, Body, UseGuards, HttpCode, HttpStatus,
} from '@nestjs/common';
import {
  ApiTags, ApiOperation, ApiResponse, ApiBody, ApiBearerAuth, ApiExcludeEndpoint,
} from '@nestjs/swagger';
import { FacebookAuthGuard } from '../guards/facebook-auth.guard';
import { AuthService } from '../services/auth/auth.service';
import { AuthGuard } from '../../guards/auth.guard';
import { RegisterDto, LoginDto, RefreshTokenDto } from '../dto/auth.dto';
import { RequestPasswordResetDto } from '../dto/request-reset-password.dto';
import { ResetPasswordDto } from '../dto/reset-password.dto';

@ApiTags('🔐 Authentication')
@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiExcludeEndpoint()
  @Get('facebook')
  @UseGuards(FacebookAuthGuard)
  async facebookLogin() {
    // Redirected by Passport to Facebook
  }

  @ApiExcludeEndpoint()
  @Get('facebook/callback')
  @UseGuards(FacebookAuthGuard)
  async facebookLoginCallback(@Req() req) {
    return this.authService.validateFacebookUser(req.user);
  }

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Đăng ký tài khoản mới',
    description: 'Tạo tài khoản người chơi mới. Tự động khởi tạo ví với 50M chips.',
  })
  @ApiBody({ type: RegisterDto })
  @ApiResponse({
    status: 201,
    description: 'Đăng ký thành công',
    schema: {
      example: {
        message: 'User registered successfully',
        user: { id: 'uuid', email: 'player1@poker.com', user_name: 'PokerKing99' },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Email hoặc username đã tồn tại / Validation error' })
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Đăng nhập',
    description: 'Xác thực người dùng và trả về access token (2h) + refresh token (7 ngày).',
  })
  @ApiBody({ type: LoginDto })
  @ApiResponse({
    status: 200,
    description: 'Đăng nhập thành công',
    schema: {
      example: {
        access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        refresh_token: 'uuid4.plaintext-refresh-token',
        user: { id: 'uuid', email: 'player1@poker.com', user_name: 'PokerKing99' },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Sai email hoặc mật khẩu' })
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Quên mật khẩu',
    description: 'Gửi email đặt lại mật khẩu đến địa chỉ email đã đăng ký.',
  })
  @ApiBody({ type: RequestPasswordResetDto })
  @ApiResponse({ status: 200, description: 'Link đặt lại mật khẩu đã được gửi' })
  @ApiResponse({ status: 400, description: 'Email không hợp lệ' })
  async forgotPassword(@Body() requestPasswordResetDto: RequestPasswordResetDto) {
    return this.authService.forgotPassword(requestPasswordResetDto);
  }

  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Đặt lại mật khẩu',
    description: 'Đặt lại mật khẩu mới bằng token nhận được qua email.',
  })
  @ApiBody({ type: ResetPasswordDto })
  @ApiResponse({ status: 200, description: 'Mật khẩu đã được đặt lại thành công' })
  @ApiResponse({ status: 400, description: 'Token không hợp lệ hoặc đã hết hạn' })
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return this.authService.resetPassword(resetPasswordDto);
  }

  @Post('refresh-token')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Làm mới Access Token',
    description: 'Sử dụng refresh token để lấy access token mới mà không cần đăng nhập lại. Refresh token sẽ được xoay vòng (Token Rotation).',
  })
  @ApiBody({ type: RefreshTokenDto })
  @ApiResponse({
    status: 200,
    description: 'Access token mới',
    schema: {
      example: {
        access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        refresh_token: 'new-uuid4.new-plaintext-refresh-token',
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Refresh token không hợp lệ hoặc đã hết hạn' })
  async refreshToken(@Body() refreshTokenDto: RefreshTokenDto) {
    return this.authService.refreshToken(refreshTokenDto);
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Đăng xuất',
    description: 'Thu hồi (revoke) tất cả refresh token của người dùng hiện tại.',
  })
  @ApiResponse({ status: 200, description: 'Đăng xuất thành công' })
  @ApiResponse({ status: 401, description: 'Chưa đăng nhập' })
  async logout(@Req() req) {
    return this.authService.logout(req.user.sub);
  }

  @ApiExcludeEndpoint()
  @Get('test')
  public getTest(@Req() request) {
    return 1;
  }
}
