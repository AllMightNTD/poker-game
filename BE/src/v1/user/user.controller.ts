import {
  Controller,
  Get,
  Param,
  Request,
  UseGuards,
  Delete,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { AuthGuard } from '../guards/auth.guard';
import { UserService } from './user.service';
import { Wallet } from '../entities/wallet.entity';

@ApiTags('👤 User')
@Controller('')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('/me')
  @UseGuards(AuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Thông tin người dùng hiện tại',
    description: 'Lấy thông tin profile của người dùng đang đăng nhập.',
  })
  @ApiResponse({
    status: 200,
    description: 'Thông tin user',
    schema: {
      example: {
        id: 'uuid',
        email: 'player1@poker.com',
        user_name: 'PokerKing99',
        avatar_url: 'https://cdn.poker.gg/avatars/uuid.png',
        status: 'active',
        created_at: '2026-07-06T05:00:00.000Z',
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Chưa đăng nhập hoặc token hết hạn',
  })
  async getMe(@Request() req) {
    return this.userService.getMe(req.user.sub);
  }

  @Get('/chips')
  @UseGuards(AuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Số dư chips hiện tại',
    description:
      'Lấy số dư chips trong ví của người dùng. Tự động tạo ví với 50M chips nếu chưa có.',
  })
  @ApiResponse({
    status: 200,
    description: 'Số dư chips',
    schema: {
      example: { chips_balance: '50000000' },
    },
  })
  @ApiResponse({ status: 401, description: 'Chưa đăng nhập' })
  async getChips(@Request() req) {
    let wallet = await Wallet.findOne({ where: { user_id: req.user.sub } });
    if (!wallet) {
      wallet = new Wallet();
      wallet.user_id = req.user.sub;
      wallet.chips_balance = '50000000';
      await wallet.save();
    }
    return { chips_balance: wallet.chips_balance };
  }

  @Get('/:id/stats')
  @UseGuards(AuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Thống kê chỉ số Poker của người chơi',
    description:
      'Lấy các chỉ số Poker bao gồm VPIP, PFR, số ván và trận thắng lớn nhất.',
  })
  @ApiResponse({ status: 200, description: 'Chỉ số Poker' })
  async getUserStats(@Param('id') userId: string) {
    return this.userService.getUserPokerStats(userId);
  }

  @Get('/sessions')
  @UseGuards(AuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Danh sách các phiên hoạt động',
    description: 'Lấy toàn bộ các thiết bị/phiên đang đăng nhập của user này.',
  })
  @ApiResponse({ status: 200, description: 'Danh sách sessions' })
  async getSessions(@Request() req) {
    return this.userService.getActiveSessions(req.user.sub);
  }

  @Delete('/sessions/:id')
  @UseGuards(AuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Đăng xuất một phiên/thiết bị từ xa',
    description: 'Thu hồi refresh token của một phiên đăng nhập cụ thể.',
  })
  @ApiResponse({ status: 200, description: 'Thu hồi thành công' })
  async revokeSession(@Param('id') sessionId: string, @Request() req) {
    return this.userService.revokeSession(req.user.sub, sessionId);
  }
}
