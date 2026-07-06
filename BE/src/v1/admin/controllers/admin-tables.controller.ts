import { Controller, Get, Param, Post, UseGuards, UseInterceptors, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { AdminGuard } from '../guards/admin.guard';
import { AdminRoles } from '../decorators/admin-roles.decorator';
import { AuditAction } from '../decorators/audit-action.decorator';
import { AdminAuditLogInterceptor } from '../interceptors/admin-audit-log.interceptor';
import { AdminTablesService } from '../services/admin-tables.service';

@ApiTags('Admin System - Poker Tables')
@ApiBearerAuth()
@UseGuards(AdminGuard)
@UseInterceptors(AdminAuditLogInterceptor)
@Controller('admin/tables')
export class AdminTablesController {
  constructor(private readonly tablesService: AdminTablesService) {}

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách bàn Poker đang hoạt động' })
  @ApiQuery({ name: 'cursor', required: false, type: String })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  @AdminRoles('SUPER_ADMIN', 'ADMIN', 'GM')
  async getTables(
    @Query('cursor') cursor?: string,
    @Query('limit') limit = 20,
    @Query('search') search = ''
  ) {
    return this.tablesService.getTables(cursor, Number(limit), search);
  }

  @Post(':id/close')
  @ApiOperation({ summary: 'Đóng bàn Poker khẩn cấp' })
  @AdminRoles('SUPER_ADMIN', 'ADMIN', 'GM')
  @AuditAction('FORCE_CLOSE_TABLE', 'poker_tables')
  async closeTable(@Param('id') id: string) {
    return this.tablesService.closeTable(id);
  }
}
