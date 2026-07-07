import { Controller, Get, UseGuards, UseInterceptors } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AdminRoles } from '../decorators/admin-roles.decorator';
import { AdminGuard } from '../guards/admin.guard';
import { AdminAuditLogInterceptor } from '../interceptors/admin-audit-log.interceptor';
import { AdminRevenueService } from '../services/admin-revenue.service';

@ApiTags('Admin System - Revenue Reports')
@ApiBearerAuth()
@UseGuards(AdminGuard)
@UseInterceptors(AdminAuditLogInterceptor)
@Controller('admin/revenue')
export class AdminRevenueController {
  constructor(private readonly revenueService: AdminRevenueService) {}

  @Get('stats')
  @ApiOperation({ summary: 'Lấy báo cáo doanh thu hệ thống (Rake & Nạp/rút)' })
  @AdminRoles('SUPER_ADMIN', 'ADMIN', 'SUPPORT')
  async getRevenueStats() {
    return this.revenueService.getRevenueStats();
  }
}
