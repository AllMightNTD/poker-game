import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { parseUserAgent } from '../../../common/utils/device-parser';
import { AdminLoginDto } from '../dto/admin-login.dto';
import { AdminRefreshTokenDto } from '../dto/admin-refresh-token.dto';
import { AdminGuard } from '../guards/admin.guard';
import { AdminService } from '../services/admin.service';

@ApiTags('Admin System')
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Admin Login Endpoint',
    description:
      'Authenticates an admin and returns a JWT token. This token has a high-security clearance.',
  })
  @ApiResponse({ status: 200, description: 'Login successful' })
  @ApiResponse({
    status: 401,
    description: 'Invalid credentials or inactive account',
  })
  async login(
    @Body() loginDto: AdminLoginDto,
    @Res({ passthrough: true }) res: Response,
    @Req() req: any,
  ) {
    const rawUserAgent = req.headers['user-agent'];
    const parsedDevice = parseUserAgent(rawUserAgent);
    const ipAddress =
      req.ip || req.headers['x-forwarded-for'] || req.connection?.remoteAddress;

    const result = await this.adminService.login(
      loginDto,
      ipAddress,
      parsedDevice,
    );

    const isProduction = process.env.NODE_ENV === 'production';

    // Lưu access token cookie (httpOnly: false để JS client đọc được phục vụ WebSocket)
    res.cookie('admin_access_token', result.admin_access_token, {
      httpOnly: false,
      secure: isProduction,
      sameSite: 'lax',
      path: '/',
      maxAge: 2 * 60 * 60 * 1000, // 2h
    });

    // Lưu refresh token cookie (httpOnly: true để chống XSS)
    res.cookie('admin_refresh_token', result.admin_refresh_token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7d
    });

    return result;
  }

  @Post('refresh-token')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Admin Refresh Token Endpoint',
    description: 'Refreshes admin credentials and returns new tokens.',
  })
  @ApiResponse({ status: 200, description: 'Token refresh successful' })
  @ApiResponse({ status: 401, description: 'Invalid refresh token' })
  async refreshToken(
    @Body() dto: AdminRefreshTokenDto,
    @Res({ passthrough: true }) res: Response,
    @Req() req: any,
  ) {
    const rawUserAgent = req.headers['user-agent'];
    const parsedDevice = parseUserAgent(rawUserAgent);
    const ipAddress =
      req.ip || req.headers['x-forwarded-for'] || req.connection?.remoteAddress;

    const result = await this.adminService.refreshToken(
      dto,
      ipAddress,
      parsedDevice,
    );

    const isProduction = process.env.NODE_ENV === 'production';

    // Lưu access token cookie
    res.cookie('admin_access_token', result.admin_access_token, {
      httpOnly: false,
      secure: isProduction,
      sameSite: 'lax',
      path: '/',
      maxAge: 2 * 60 * 60 * 1000,
    });

    // Lưu refresh token cookie (httpOnly: true)
    res.cookie('admin_refresh_token', result.admin_refresh_token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return result;
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AdminGuard)
  @ApiOperation({
    summary: 'Admin Logout Endpoint',
    description: 'Logs out the admin and revokes their refresh tokens.',
  })
  @ApiResponse({ status: 200, description: 'Logout successful' })
  async logout(@Req() req: any, @Res({ passthrough: true }) res: Response) {
    const adminId = req.admin.sub;
    await this.adminService.logout(adminId);

    const isProduction = process.env.NODE_ENV === 'production';

    // Xóa cookies khỏi trình duyệt
    res.clearCookie('admin_access_token', {
      httpOnly: false,
      secure: isProduction,
      sameSite: 'lax',
      path: '/',
    });

    res.clearCookie('admin_refresh_token', {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax',
      path: '/',
    });

    return { message: 'Admin logged out successfully' };
  }

  @Get('me')
  @UseGuards(AdminGuard)
  @ApiOperation({
    summary: 'Get Current Admin Profile',
    description: 'Returns the current logged-in admin user information.',
  })
  @ApiResponse({ status: 200, description: 'Admin profile information' })
  @ApiResponse({
    status: 401,
    description: 'Invalid admin token or unauthorized',
  })
  async getMe(@Req() req: any) {
    const adminId = req.admin.sub;
    return this.adminService.getMe(adminId);
  }

  @Get('sessions')
  @UseGuards(AdminGuard)
  @ApiOperation({
    summary: 'Get Admin Active Sessions',
    description: 'Returns all active device sessions for the current admin.',
  })
  @ApiResponse({ status: 200, description: 'List of active sessions' })
  async getSessions() {
    return this.adminService.getActiveSessions();
  }

  @Delete('sessions/:id')
  @UseGuards(AdminGuard)
  @ApiOperation({
    summary: 'Revoke Admin Active Session',
    description: 'Terminates a specific device session of this admin remotely.',
  })
  @ApiResponse({ status: 200, description: 'Session revoked' })
  async revokeSession(@Req() req: any, @Param('id') sessionId: string) {
    return this.adminService.revokeSession(sessionId);
  }
}
