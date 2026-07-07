import {
  Controller,
  Get,
  Param,
  Query,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { AdminRoles } from '../decorators/admin-roles.decorator';
import { AdminGuard } from '../guards/admin.guard';
import { AdminAuditLogInterceptor } from '../interceptors/admin-audit-log.interceptor';
import { AdminHandsService } from '../services/admin-hands.service';

@ApiTags('Admin System - Poker Hand History')
@ApiBearerAuth()
@UseGuards(AdminGuard)
@UseInterceptors(AdminAuditLogInterceptor)
@Controller('admin/hands')
export class AdminHandsController {
  constructor(private readonly handsService: AdminHandsService) {}

  @Get()
  @ApiOperation({ summary: 'Lấy lịch sử ván bài' })
  @ApiQuery({ name: 'cursor', required: false, type: String })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'tableId', required: false, type: String })
  @AdminRoles('SUPER_ADMIN', 'ADMIN', 'SUPPORT', 'GM')
  async getHands(
    @Query('cursor') cursor?: string,
    @Query('limit') limit = 20,
    @Query('tableId') tableId?: string,
  ) {
    return this.handsService.getHands(cursor, Number(limit), tableId);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Lấy chi tiết ván bài bao gồm bài tẩy và Timeline cược',
  })
  @AdminRoles('SUPER_ADMIN', 'ADMIN', 'SUPPORT', 'GM')
  async getHandDetail(@Param('id') id: string) {
    return this.handsService.getHandDetail(id);
  }
}
