import { Controller, Get, Param, Post, Body, UseGuards, UseInterceptors, Query, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { AdminGuard } from '../guards/admin.guard';
import { AdminRoles } from '../decorators/admin-roles.decorator';
import { AuditAction } from '../decorators/audit-action.decorator';
import { AdminAuditLogInterceptor } from '../interceptors/admin-audit-log.interceptor';
import { AdminTransactionsService } from '../services/admin-transactions.service';
import { ProcessTransactionDto } from '../dto/process-transaction.dto';
import { Request } from 'express';

@ApiTags('Admin System - Transactions & Finance')
@ApiBearerAuth()
@UseGuards(AdminGuard)
@UseInterceptors(AdminAuditLogInterceptor)
@Controller('admin/transactions')
export class AdminTransactionsController {
  constructor(private readonly transactionsService: AdminTransactionsService) {}

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách Giao dịch nạp/rút', description: 'Có thể lọc theo status PENDING/APPROVED' })
  @ApiQuery({ name: 'cursor', required: false, type: String })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'status', required: false, type: String })
  @AdminRoles('SUPER_ADMIN', 'ADMIN', 'FINANCE')
  async getTransactions(
    @Query('cursor') cursor?: string,
    @Query('limit') limit = 20,
    @Query('status') status?: string
  ) {
    return this.transactionsService.getTransactions(cursor, Number(limit), status);
  }

  @Post(':id/process')
  @ApiOperation({ summary: 'Xử lý Duyệt/Từ chối giao dịch' })
  @AdminRoles('SUPER_ADMIN', 'FINANCE')
  @AuditAction('PROCESS_TRANSACTION', 'transactions')
  async processTransaction(
    @Req() req: Request,
    @Param('id') id: string, 
    @Body() dto: ProcessTransactionDto
  ) {
    const adminId = (req as any).admin?.sub || 'system';
    return this.transactionsService.processTransaction(adminId, id, dto);
  }
}
