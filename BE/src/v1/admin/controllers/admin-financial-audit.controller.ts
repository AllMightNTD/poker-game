import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AdminGuard } from '../guards/admin.guard';
import { AdminRoles } from '../decorators/admin-roles.decorator';
import { AdminFinancialAuditService } from '../services/admin-financial-audit.service';

@ApiTags('Admin System - Financial Audit')
@ApiBearerAuth()
@UseGuards(AdminGuard)
@Controller('admin/financial-audit')
export class AdminFinancialAuditController {
  constructor(
    private readonly financialAuditService: AdminFinancialAuditService,
  ) {}

  @Get('chip-dumping')
  @ApiOperation({
    summary: 'Lấy danh sách các cảnh báo bơm chip (Chip Dumping)',
    description:
      'Phát hiện các hành vi thông đồng chuyển chip bất hợp pháp qua bàn chơi',
  })
  @AdminRoles('SUPER_ADMIN', 'ADMIN')
  async getChipDumpingAlerts() {
    const alerts = await this.financialAuditService.getChipDumpingAlerts();
    return { data: alerts };
  }
}
