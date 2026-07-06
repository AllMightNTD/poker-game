import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { AdminGuard } from '../guards/admin.guard';
import { AdminRoles } from '../decorators/admin-roles.decorator';
import { AdminAuditLogsService } from '../services/admin-audit-logs.service';

@ApiTags('Admin System - Audit Logs')
@ApiBearerAuth()
@UseGuards(AdminGuard)
@Controller('admin/audit-logs')
export class AdminAuditLogsController {
  constructor(private readonly auditLogsService: AdminAuditLogsService) {}

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách Audit Logs', description: 'Hỗ trợ Cursor Pagination và tìm kiếm' })
  @ApiQuery({ name: 'cursor', required: false, type: String })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  @AdminRoles('SUPER_ADMIN', 'ADMIN')
  async getAuditLogs(
    @Query('cursor') cursor?: string,
    @Query('limit') limit = 50,
    @Query('search') search = ''
  ) {
    return this.auditLogsService.getAuditLogs(cursor, Number(limit), search);
  }
}
