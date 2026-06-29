import {
  Controller,
  Get,
  Param,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '../guards/auth.guard';
import { NotificationService } from './notification.service';

@Controller('')
@UseGuards(AuthGuard)
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Get()
  async getNotifications(
    @Req() req: any,
    @Query('page') page: string = '1',
    @Query('size') size: string = '20',
  ) {
    const userId = req.user.sub;
    return this.notificationService.getNotifications(
      userId,
      parseInt(page, 10),
      parseInt(size, 10),
    );
  }

  @Get('unread-count')
  async getUnreadCount(@Req() req: any) {
    const userId = req.user.sub;
    return this.notificationService.getUnreadCount(userId);
  }

  @Put('read-all')
  async markAllAsRead(@Req() req: any) {
    const userId = req.user.sub;
    await this.notificationService.markAllAsRead(userId);
    return { success: true };
  }

  @Put(':id/read')
  async markAsRead(@Req() req: any, @Param('id') id: string) {
    const userId = req.user.sub;
    const result = await this.notificationService.markAsRead(id, userId);
    return { success: result };
  }
}
