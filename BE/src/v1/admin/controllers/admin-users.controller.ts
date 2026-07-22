import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Request,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { AdminRoles } from '../decorators/admin-roles.decorator';
import { AuditAction } from '../decorators/audit-action.decorator';
import { AdminGuard } from '../guards/admin.guard';
import { AdminAuditLogInterceptor } from '../interceptors/admin-audit-log.interceptor';
import { AdminUsersService } from '../services/admin-users.service';

@ApiTags('Admin System - User Management')
@ApiBearerAuth()
@UseGuards(AdminGuard)
@UseInterceptors(AdminAuditLogInterceptor)
@Controller('admin/users')
export class AdminUsersController {
  constructor(private readonly adminUsersService: AdminUsersService) {}

  @Get()
  @ApiOperation({
    summary: 'Lấy danh sách User',
    description: 'Hỗ trợ phân trang và tìm kiếm theo tên/email',
  })
  @ApiQuery({ name: 'cursor', required: false, type: String })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  @AdminRoles('SUPER_ADMIN', 'ADMIN', 'SUPPORT', 'GM')
  async getUsers(
    @Query('cursor') cursor?: string,
    @Query('limit') limit = 20,
    @Query('search') search = '',
  ) {
    return this.adminUsersService.getUsers(cursor, Number(limit), search);
  }

  @Post(':id/ban')
  @ApiOperation({
    summary: 'Khóa tài khoản User',
    description: 'Thay đổi status user sang BANNED',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: { reason: { type: 'string', example: 'Gian lận game' } },
    },
  })
  @AdminRoles('SUPER_ADMIN', 'ADMIN')
  @AuditAction('BAN_USER', 'users')
  async banUser(@Param('id') id: string, @Body('reason') reason: string) {
    console.log('reason ', reason);
    return this.adminUsersService.banUser(id);
  }

  @Post(':id/unban')
  @ApiOperation({
    summary: 'Mở khóa tài khoản User',
    description: 'Thay đổi status user sang ACTIVE',
  })
  @AdminRoles('SUPER_ADMIN', 'ADMIN')
  @AuditAction('UNBAN_USER', 'users')
  async unbanUser(@Param('id') id: string) {
    return this.adminUsersService.unbanUser(id);
  }

  @Post(':id/kick')
  @ApiOperation({
    summary: 'Trục xuất người chơi khỏi bàn đấu',
    description: 'Cưỡng chế người chơi rời bàn và thực hiện cashout',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: { roomId: { type: 'string', example: '1' } },
    },
  })
  @AdminRoles('SUPER_ADMIN', 'ADMIN', 'GM')
  @AuditAction('FORCE_KICK_PLAYER', 'users')
  async kickPlayer(
    @Request() req,
    @Param('id') id: string,
    @Body('roomId') roomId: string,
  ) {
    const adminId = req.user?.sub || 'system';
    return this.adminUsersService.kickPlayer(id, roomId, adminId);
  }

  @Get(':id/stats')
  @ApiOperation({
    summary: 'Lấy thống kê chi tiết của người chơi',
    description: 'Tính tổng hand đã chơi, rake đóng góp và Net Win/Loss',
  })
  @AdminRoles('SUPER_ADMIN', 'ADMIN', 'SUPPORT', 'GM')
  async getUserStats(@Param('id') id: string) {
    return this.adminUsersService.getUserStats(id);
  }
}
