import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AdminLoginDto } from '../dto/admin-login.dto';
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
  async login(@Body() loginDto: AdminLoginDto) {
    return this.adminService.login(loginDto);
  }
}
