import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { Response } from 'express';
import { parseUserAgent } from '../../../common/utils/device-parser';
import { AuthGuard } from '../../guards/auth.guard';
import {
  LoginDto,
  RefreshTokenDto,
  RegisterDto,
  ResendOtpDto,
  VerifyOtpDto,
} from '../dto/auth.dto';
import { RequestPasswordResetDto } from '../dto/request-reset-password.dto';
import { ResetPasswordDto } from '../dto/reset-password.dto';
import { GoogleAuthGuard } from '../guards/google-auth.guard';
import { AuthService } from '../services/auth/auth.service';

@ApiTags('🔐 Authentication')
@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Đăng ký tài khoản mới',
    description:
      'Tạo tài khoản người chơi mới. Tài khoản ban đầu có trạng thái INACTIVE và cần xác thực OTP gửi qua email.',
  })
  @ApiBody({ type: RegisterDto })
  @ApiResponse({
    status: 201,
    description: 'Đăng ký thành công, mã OTP đã gửi qua email',
    schema: {
      example: {
        message:
          'Đăng ký tài khoản thành công. Vui lòng xác thực mã OTP gửi tới email của bạn.',
        user: {
          id: 'uuid',
          email: 'player1@poker.com',
          user_name: 'PokerKing99',
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Email hoặc username đã tồn tại / Validation error',
  })
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('verify-otp')
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Xác thực mã OTP',
    description: 'Xác thực tài khoản người dùng bằng token và mã OTP.',
  })
  @ApiBody({ type: VerifyOtpDto })
  @ApiResponse({
    status: 200,
    description: 'Xác thực thành công và kích hoạt tài khoản',
  })
  @ApiResponse({
    status: 400,
    description: 'Token/OTP không chính xác hoặc hết hạn',
  })
  async verifyOtp(@Body() verifyOtpDto: VerifyOtpDto) {
    return this.authService.verifyOtp(verifyOtpDto);
  }

  @Post('resend-otp')
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Gửi lại mã OTP',
    description:
      'Yêu cầu gửi lại mã OTP mới (giới hạn thời gian cool-down 60 giây).',
  })
  @ApiBody({ type: ResendOtpDto })
  @ApiResponse({
    status: 200,
    description: 'Đã gửi lại mã OTP mới qua email',
  })
  @ApiResponse({
    status: 400,
    description:
      'Email không tồn tại hoặc tài khoản đã kích hoạt / Cooldown active',
  })
  async resendOtp(@Body() resendOtpDto: ResendOtpDto) {
    return this.authService.resendOtp(resendOtpDto);
  }

  @Post('login')
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Đăng nhập',
    description:
      'Xác thực người dùng và trả về access token (2h) + refresh token (7 ngày).',
  })
  @ApiBody({ type: LoginDto })
  @ApiResponse({
    status: 200,
    description: 'Đăng nhập thành công',
    schema: {
      example: {
        access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        refresh_token: 'uuid4.plaintext-refresh-token',
        user: {
          id: 'uuid',
          email: 'player1@poker.com',
          user_name: 'PokerKing99',
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Sai email hoặc mật khẩu' })
  async login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) res: Response,
    @Req() req: any,
  ) {
    const rawUserAgent = req.headers['user-agent'];
    const parsedDevice = parseUserAgent(rawUserAgent);
    const ipAddress =
      req.ip || req.headers['x-forwarded-for'] || req.connection?.remoteAddress;

    const result = await this.authService.login(
      loginDto,
      ipAddress,
      parsedDevice,
    );
    const isProduction = process.env.NODE_ENV === 'production';

    res.cookie('accessToken', result.access_token, {
      httpOnly: false,
      secure: isProduction,
      sameSite: isProduction ? 'none' : 'lax',
      path: '/',
      maxAge: 15 * 60 * 1000, // 15m
    });

    res.cookie('refreshToken', result.refresh_token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'none' : 'lax',
      path: '/',
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30d
    });

    return result;
  }

  @Post('forgot-password')
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Quên mật khẩu',
    description: 'Gửi email đặt lại mật khẩu đến địa chỉ email đã đăng ký.',
  })
  @ApiBody({ type: RequestPasswordResetDto })
  @ApiResponse({
    status: 200,
    description: 'Link đặt lại mật khẩu đã được gửi',
  })
  @ApiResponse({ status: 400, description: 'Email không hợp lệ' })
  async forgotPassword(
    @Body() requestPasswordResetDto: RequestPasswordResetDto,
  ) {
    return this.authService.forgotPassword(requestPasswordResetDto);
  }

  @Post('reset-password')
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Đặt lại mật khẩu',
    description: 'Đặt lại mật khẩu mới bằng token nhận được qua email.',
  })
  @ApiBody({ type: ResetPasswordDto })
  @ApiResponse({
    status: 200,
    description: 'Mật khẩu đã được đặt lại thành công',
  })
  @ApiResponse({
    status: 400,
    description: 'Token không hợp lệ hoặc đã hết hạn',
  })
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return this.authService.resetPassword(resetPasswordDto);
  }

  @Post('refresh-token')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Làm mới Access Token',
    description:
      'Sử dụng refresh token để lấy access token mới mà không cần đăng nhập lại. Refresh token sẽ được xoay vòng (Token Rotation).',
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
  @ApiResponse({
    status: 401,
    description: 'Refresh token không hợp lệ hoặc đã hết hạn',
  })
  async refreshToken(
    @Body() refreshTokenDto: RefreshTokenDto,
    @Res({ passthrough: true }) res: Response,
    @Req() req: any,
  ) {
    const rawUserAgent = req.headers['user-agent'];
    const parsedDevice = parseUserAgent(rawUserAgent);
    const ipAddress =
      req.ip || req.headers['x-forwarded-for'] || req.connection?.remoteAddress;

    const token =
      refreshTokenDto?.refreshToken ||
      req.cookies?.['refreshToken'] ||
      req.cookies?.refreshToken;

    if (!token) {
      throw new UnauthorizedException('Refresh token is required');
    }

    const result = await this.authService.refreshToken(
      { refreshToken: token },
      ipAddress,
      parsedDevice,
    );
    const isProduction = process.env.NODE_ENV === 'production';

    res.cookie('accessToken', result.access_token, {
      httpOnly: false,
      secure: isProduction,
      sameSite: isProduction ? 'none' : 'lax',
      path: '/',
      maxAge: 15 * 60 * 1000, // 15m
    });

    res.cookie('refreshToken', result.refresh_token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'none' : 'lax',
      path: '/',
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30d
    });

    return result;
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Đăng xuất',
    description:
      'Thu hồi (revoke) tất cả refresh token của người dùng hiện tại.',
  })
  @ApiResponse({ status: 200, description: 'Đăng xuất thành công' })
  @ApiResponse({ status: 401, description: 'Chưa đăng nhập' })
  async logout(@Req() req: any, @Res({ passthrough: true }) res: Response) {
    const result = await this.authService.logout(req.user.sub);
    const isProduction = process.env.NODE_ENV === 'production';

    res.clearCookie('accessToken', {
      httpOnly: false,
      secure: isProduction,
      sameSite: 'lax',
      path: '/',
    });

    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax',
      path: '/',
    });

    return result;
  }

  @Get('google')
  @UseGuards(GoogleAuthGuard)
  @ApiOperation({
    summary: 'Đăng nhập bằng Google',
    description: 'Chuyển hướng người dùng đến trang xác thực của Google.',
  })
  async googleAuth(@Req() req: any) {
    // Initiates the Google OAuth flow
    console.log('googleAuth', req);
  }

  @Get('google/callback')
  @UseGuards(GoogleAuthGuard)
  @ApiOperation({
    summary: 'Callback từ Google',
    description: 'Xử lý xác thực sau khi Google trả về kết quả.',
  })
  async googleAuthRedirect(@Req() req: any, @Res() res: Response) {
    const rawUserAgent = req.headers['user-agent'];
    const parsedDevice = parseUserAgent(rawUserAgent);
    const ipAddress =
      req.ip || req.headers['x-forwarded-for'] || req.connection?.remoteAddress;

    const result = await this.authService.googleLogin(
      req.user,
      ipAddress,
      parsedDevice,
    );
    const isProduction = process.env.NODE_ENV === 'production';

    res.cookie('accessToken', result.access_token, {
      httpOnly: false,
      secure: isProduction,
      sameSite: isProduction ? 'none' : 'lax',
      path: '/',
      maxAge: 15 * 60 * 1000, // 15m
    });

    res.cookie('refreshToken', result.refresh_token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'none' : 'lax',
      path: '/',
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30d
    });

    console.log('login done');

    const webUrl = process.env.WEB_URL || 'http://localhost:3000';
    const redirectUrl = `${webUrl}?accessToken=${encodeURIComponent(result.access_token)}&refreshToken=${encodeURIComponent(result.refresh_token)}`;
    return res.redirect(redirectUrl);
  }
}
