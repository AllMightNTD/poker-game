import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { AdminGuard } from '../guards/admin.guard';
import { AdminRoles } from '../decorators/admin-roles.decorator';
import { AdminSecurityLogsService } from '../services/admin-security-logs.service';

@ApiTags('Admin System - Security Logs')
@ApiBearerAuth()
@UseGuards(AdminGuard)
@Controller('admin/security-logs')
export class AdminSecurityLogsController {
  constructor(private readonly securityLogsService: AdminSecurityLogsService) {}

  @Get()
  @ApiOperation({
    summary: 'Lấy danh sách nhật ký cảnh báo bảo mật / thông đồng',
    description: 'Hỗ trợ Cursor Pagination và tìm kiếm',
  })
  @ApiQuery({ name: 'cursor', required: false, type: String })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  @AdminRoles('SUPER_ADMIN', 'ADMIN')
  async getSecurityLogs(
    @Query('cursor') cursor?: string,
    @Query('limit') limit = 50,
    @Query('search') search = '',
  ) {
    return this.securityLogsService.getSecurityLogs(
      cursor,
      Number(limit),
      search,
    );
  }
}
