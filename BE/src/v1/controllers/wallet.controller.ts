import {
  Controller,
  Post,
  Headers,
  Request,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiHeader,
} from '@nestjs/swagger';
import { AuthGuard } from '../guards/auth.guard';
import { PokerLobbyService } from '../services/poker-lobby.service';

@ApiTags('💰 Wallet')
@ApiBearerAuth('access-token')
@Controller('wallet')
@UseGuards(AuthGuard)
export class WalletController {
  constructor(private readonly lobbyService: PokerLobbyService) {}

  @Post('free-chips')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Nhận chips miễn phí',
    description: `Nhận **5,000,000 chips** miễn phí vào ví.
- Yêu cầu header \`X-Idempotency-Key\` (UUID duy nhất) để chống spam.
- Mỗi key chỉ được dùng 1 lần trong vòng 5 giây.`,
  })
  @ApiHeader({
    name: 'x-idempotency-key',
    required: true,
    description: 'UUID duy nhất để chống spam (ví dụ: crypto.randomUUID())',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({
    status: 200,
    description: 'Nhận chips thành công',
    schema: {
      example: {
        success: true,
        chips_balance: '55000000',
        added_amount: '5000000',
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Thiếu X-Idempotency-Key' })
  @ApiResponse({ status: 401, description: 'Chưa đăng nhập' })
  @ApiResponse({ status: 409, description: 'Yêu cầu trùng lặp (đang xử lý)' })
  async getFreeChips(
    @Request() req,
    @Headers('x-idempotency-key') idempotencyKey: string,
  ) {
    const userId = req.user.sub;
    return this.lobbyService.claimFreeChips(userId, idempotencyKey);
  }
}
