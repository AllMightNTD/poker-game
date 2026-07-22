import {
  Controller,
  Post,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { BotService } from '../services/bot.service';
import { AddBotDto } from '../dto/bot-config.dto';
import { AuthGuard } from '../../guards/auth.guard';

@ApiTags('🤖 Poker Bot Management')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller('poker/rooms')
export class BotController {
  constructor(private readonly botService: BotService) {}

  @Post(':roomId/bots')
  @ApiOperation({
    summary: 'Thêm Bot vào phòng Poker',
    description:
      'Cho phép chủ phòng hoặc admin thêm một hoặc nhiều Bot AI vào phòng.',
  })
  @ApiResponse({ status: 201, description: 'Thêm Bot thành công.' })
  async addBots(@Param('roomId') roomId: string, @Body() dto: AddBotDto) {
    const bots = await this.botService.addBotsToRoom(roomId, dto);
    return {
      statusCode: 201,
      message: `Thêm thành công ${bots.length} Bot vào phòng ${roomId}`,
      data: bots,
    };
  }

  @Delete(':roomId/bots/:botUserId')
  @ApiOperation({
    summary: 'Đuổi Bot khỏi phòng Poker',
    description: 'Xóa Bot được chỉ định ra khỏi phòng.',
  })
  @ApiResponse({ status: 200, description: 'Đuổi Bot thành công.' })
  async removeBot(
    @Param('roomId') roomId: string,
    @Param('botUserId') botUserId: string,
  ) {
    await this.botService.removeBotFromRoom(roomId, botUserId);
    return {
      statusCode: 200,
      message: `Đã xóa Bot ${botUserId} khỏi phòng ${roomId}`,
    };
  }
}
