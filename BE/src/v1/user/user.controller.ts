import {
  Controller, Get, Request, UseGuards,
} from '@nestjs/common';
import {
  ApiTags, ApiOperation, ApiResponse, ApiBearerAuth,
} from '@nestjs/swagger';
import { AuthGuard } from '../guards/auth.guard';
import { UserService } from './user.service';
import { Wallet } from '../entities/wallet.entity';

@ApiTags('👤 User')
@Controller('')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('/hello')
  @ApiOperation({
    summary: 'Health check (i18n)',
    description: 'Kiểm tra server đang chạy và hỗ trợ đa ngôn ngữ.',
  })
  @ApiResponse({ status: 200, description: 'Lời chào' })
  getHello() {
    return 'Hello from API!';
  }

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
  @ApiResponse({ status: 401, description: 'Chưa đăng nhập hoặc token hết hạn' })
  async getMe(@Request() req) {
    return this.userService.getMe(req.user.sub);
  }

  @Get('/chips')
  @UseGuards(AuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Số dư chips hiện tại',
    description: 'Lấy số dư chips trong ví của người dùng. Tự động tạo ví với 50M chips nếu chưa có.',
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
}
