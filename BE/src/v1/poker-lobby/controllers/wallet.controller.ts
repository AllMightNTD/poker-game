import { Controller, Post, Headers, Request, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthGuard } from '../../guards/auth.guard';
import { PokerLobbyService } from '../poker-lobby.service';

@Controller('v1/wallet')
@UseGuards(AuthGuard)
export class WalletController {
  constructor(private readonly lobbyService: PokerLobbyService) {}

  @Post('free-chips')
  @HttpCode(HttpStatus.OK)
  async getFreeChips(
    @Request() req,
    @Headers('x-idempotency-key') idempotencyKey: string,
  ) {
    const userId = req.user.sub;
    return this.lobbyService.claimFreeChips(userId, idempotencyKey);
  }
}
