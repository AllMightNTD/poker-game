import {
  Controller,
  Post,
  Body,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiBody, ApiTags } from '@nestjs/swagger';
import { AdminRoles } from '../decorators/admin-roles.decorator';
import { AuditAction } from '../decorators/audit-action.decorator';
import { AdminGuard } from '../guards/admin.guard';
import { AdminAuditLogInterceptor } from '../interceptors/admin-audit-log.interceptor';
import { PokerLobbyGateway } from '../../gateways/poker-lobby.gateway';

@ApiTags('Admin System - Broadcast Announcement')
@ApiBearerAuth()
@UseGuards(AdminGuard)
@UseInterceptors(AdminAuditLogInterceptor)
@Controller('admin/system')
export class AdminSystemController {
  constructor(private readonly lobbyGateway: PokerLobbyGateway) {}

  @Post('broadcast')
  @ApiOperation({
    summary: 'Phát thông báo hệ thống',
    description:
      'Gửi thông báo marquee chạy chữ tới toàn bộ người chơi đang online',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'Hệ thống sẽ bảo trì vào 24h hôm nay!',
        },
      },
    },
  })
  @AdminRoles('SUPER_ADMIN', 'ADMIN')
  @AuditAction('BROADCAST_SYSTEM_MESSAGE', 'system')
  async broadcast(@Body('message') message: string) {
    if (!message || !message.trim()) {
      return { success: false, message: 'Message cannot be empty' };
    }

    this.lobbyGateway.server.emit('system:broadcast', {
      message: message.trim(),
    });

    return { success: true, message: 'Broadcast sent successfully' };
  }
}
