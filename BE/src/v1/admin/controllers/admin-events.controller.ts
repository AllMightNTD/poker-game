import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AdminRoles } from '../decorators/admin-roles.decorator';
import { AuditAction } from '../decorators/audit-action.decorator';
import { AdminGuard } from '../guards/admin.guard';
import { AdminAuditLogInterceptor } from '../interceptors/admin-audit-log.interceptor';
import { AdminEventsService } from '../services/admin-events.service';
import { CreateEventDto, UpdateEventDto } from '../dto/event.dto';

@ApiTags('Admin Events')
@ApiBearerAuth()
@UseGuards(AdminGuard)
@UseInterceptors(AdminAuditLogInterceptor)
@Controller('admin/events')
export class AdminEventsController {
  constructor(private readonly eventsService: AdminEventsService) {}

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách tất cả sự kiện (Admin)' })
  @AdminRoles('SUPER_ADMIN', 'ADMIN')
  async getAll(
    @Query('search') search?: string,
    @Query('active') active?: string,
  ) {
    const activeOnly = active !== undefined ? active === 'true' : undefined;
    return this.eventsService.getAllEvents(search, activeOnly);
  }

  @Post()
  @ApiOperation({ summary: 'Tạo sự kiện mới' })
  @AdminRoles('SUPER_ADMIN', 'ADMIN')
  @AuditAction('CREATE_EVENT', 'event')
  async create(@Body() dto: CreateEventDto) {
    return this.eventsService.createEvent(dto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Cập nhật sự kiện' })
  @AdminRoles('SUPER_ADMIN', 'ADMIN')
  @AuditAction('UPDATE_EVENT', 'event')
  async update(@Param('id') id: string, @Body() dto: UpdateEventDto) {
    return this.eventsService.updateEvent(id, dto);
  }

  @Patch(':id/toggle')
  @ApiOperation({ summary: 'Bật/Tắt trạng thái sự kiện' })
  @AdminRoles('SUPER_ADMIN', 'ADMIN')
  @AuditAction('TOGGLE_EVENT', 'event')
  async toggle(@Param('id') id: string) {
    return this.eventsService.toggleEvent(id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Xóa sự kiện' })
  @AdminRoles('SUPER_ADMIN', 'ADMIN')
  @AuditAction('DELETE_EVENT', 'event')
  async delete(@Param('id') id: string) {
    return this.eventsService.deleteEvent(id);
  }
}
