import { Controller, Get, Request, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../guards/auth.guard';
import { PokerLobbyService } from '../services/poker-lobby.service';

@Controller('user')
@UseGuards(AuthGuard)
export class UserController {
  constructor(private readonly lobbyService: PokerLobbyService) {}

  @Get('chips')
  async getChips(@Request() req) {
    const userId = req.user.sub;
    return this.lobbyService.getUserChips(userId);
  }
}
