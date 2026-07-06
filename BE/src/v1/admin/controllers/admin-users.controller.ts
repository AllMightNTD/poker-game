import { Body, Controller, Get, Param, Post, Query, UseGuards, UseInterceptors } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { AdminRoles } from '../decorators/admin-roles.decorator';
import { AuditAction } from '../decorators/audit-action.decorator';
import { AdminGuard } from '../guards/admin.guard';
import { AdminAuditLogInterceptor } from '../interceptors/admin-audit-log.interceptor';
import { AdminUsersService } from '../services/admin-users.service';

@ApiTags('Admin System - User Management')
@ApiBearerAuth()
@UseGuards(AdminGuard)
@UseInterceptors(AdminAuditLogInterceptor)
@Controller('users')
export class AdminUsersController {
  constructor(private readonly adminUsersService: AdminUsersService) { }

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách User', description: 'Hỗ trợ phân trang và tìm kiếm theo tên/email' })
  @ApiQuery({ name: 'cursor', required: false, type: String })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  @AdminRoles('SUPER_ADMIN', 'ADMIN', 'SUPPORT', 'GM')
  async getUsers(
    @Query('cursor') cursor?: string,
    @Query('limit') limit = 20,
    @Query('search') search = ''
  ) {
    return this.adminUsersService.getUsers(cursor, Number(limit), search);
  }

  @Post(':id/ban')
  @ApiOperation({ summary: 'Khóa tài khoản User', description: 'Thay đổi status user sang BANNED' })
  @ApiBody({ schema: { type: 'object', properties: { reason: { type: 'string', example: 'Gian lận game' } } } })
  @AdminRoles('SUPER_ADMIN', 'ADMIN')
  @AuditAction('BAN_USER', 'users')
  async banUser(@Param('id') id: string, @Body('reason') reason: string) {
    return this.adminUsersService.banUser(id, reason);
  }
}
