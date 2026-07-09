import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
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
    description:
      'Trả về số lượng người đang online, số bàn đang hoạt động và tổng jackpot hôm nay.',
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
  @ApiResponse({
    status: 401,
    description: 'Chưa đăng nhập hoặc token hết hạn',
  })
  async getStats() {
    return this.lobbyService.getLobbyStats();
  }

  @Get('recent')
  @ApiOperation({
    summary: 'Danh sách bàn chơi gần đây',
    description: 'Trả về các phòng/bàn chơi mà người chơi đã tham gia gần đây.',
  })
  @ApiResponse({
    status: 200,
    description: 'Lấy danh sách bàn chơi gần đây thành công',
  })
  async getRecentRooms(@Request() req) {
    return this.lobbyService.getRecentRooms(req.user.sub);
  }

  @Get('leaderboard')
  @ApiOperation({
    summary: 'Bảng xếp hạng cao thủ',
    description: 'Trả về top 10 người chơi sở hữu nhiều chip nhất.',
  })
  @ApiResponse({
    status: 200,
    description: 'Lấy bảng xếp hạng thành công',
  })
  async getLeaderboard() {
    return this.lobbyService.getLeaderboard();
  }

  @Get('active-players')
  @ApiOperation({
    summary: 'Danh sách người chơi online/active',
    description:
      'Mô phỏng danh sách bạn bè hoặc người chơi khác đang chơi tại các bàn.',
  })
  @ApiResponse({
    status: 200,
    description: 'Lấy danh sách người chơi online thành công',
  })
  async getActivePlayers(@Request() req) {
    return this.lobbyService.getActivePlayers(req.user.sub);
  }

  @Get('events/active')
  @ApiOperation({
    summary: 'Danh sách sự kiện đang hoạt động',
    description:
      'Trả về các sự kiện quảng cáo / giải đấu đang hoạt động trên Banner sảnh.',
  })
  @ApiResponse({
    status: 200,
    description: 'Lấy danh sách sự kiện thành công',
  })
  async getActiveEvents() {
    return this.lobbyService.getActiveEvents();
  }
}
