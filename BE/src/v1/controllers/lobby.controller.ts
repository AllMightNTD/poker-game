import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '../guards/auth.guard';
import { PokerLobbyService } from '../services/poker-lobby.service';

@ApiTags('🏠 Lobby')
@ApiBearerAuth('access-token')
@Controller('lobby')
@UseGuards(AuthGuard)
export class LobbyController {
  constructor(private readonly lobbyService: PokerLobbyService) {}

  @Get('stats')
  @ApiOperation({
    summary: 'Thống kê tổng quan sảnh',
    description: 'Trả về số lượng người đang online, số bàn đang hoạt động và tổng jackpot hôm nay.',
  })
  @ApiResponse({
    status: 200,
    description: 'Thống kê sảnh thành công',
    schema: {
      example: {
        online_players: 1452,
        active_tables: 8,
        total_jackpot_pot: 1358742000,
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Chưa đăng nhập hoặc token hết hạn' })
  async getStats() {
    return this.lobbyService.getLobbyStats();
  }
}
