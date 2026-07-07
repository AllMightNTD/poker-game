import {
  Controller,
  Get,
  Param,
  Post,
  Body,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AdminGuard } from '../guards/admin.guard';
import { AdminRoles } from '../decorators/admin-roles.decorator';
import { AuditAction } from '../decorators/audit-action.decorator';
import { AdminAuditLogInterceptor } from '../interceptors/admin-audit-log.interceptor';
import { AdminWalletsService } from '../services/admin-wallets.service';
import { UpdateWalletDto } from '../dto/update-wallet.dto';

@ApiTags('Admin System - Wallet Management')
@ApiBearerAuth()
@UseGuards(AdminGuard)
@UseInterceptors(AdminAuditLogInterceptor)
@Controller('admin/wallets')
export class AdminWalletsController {
  constructor(private readonly adminWalletsService: AdminWalletsService) {}

  @Get('user/:userId')
  @ApiOperation({ summary: 'Lấy thông tin ví của user' })
  @AdminRoles('SUPER_ADMIN', 'ADMIN', 'FINANCE', 'SUPPORT')
  async getWallet(@Param('userId') userId: string) {
    return this.adminWalletsService.getWallet(userId);
  }

  @Post('user/:userId/update')
  @ApiOperation({
    summary: 'Cập nhật số dư ví (Nạp/Trừ tiền)',
    description: 'Chỉ Finance, Admin và Super Admin mới có quyền thao tác',
  })
  @AdminRoles('SUPER_ADMIN', 'ADMIN', 'FINANCE')
  @AuditAction('UPDATE_WALLET_BALANCE', 'wallets')
  async updateWallet(
    @Param('userId') userId: string,
    @Body() dto: UpdateWalletDto,
  ) {
    return this.adminWalletsService.updateWallet(userId, dto);
  }
}
