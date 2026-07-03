import { Controller, Get, Request, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../../guards/auth.guard';
import { PokerLobbyService } from '../poker-lobby.service';

@Controller('v1/user')
@UseGuards(AuthGuard)
export class UserController {
  constructor(private readonly lobbyService: PokerLobbyService) {}

  @Get('chips')
  async getChips(@Request() req) {
    const userId = req.user.sub;
    return this.lobbyService.getUserChips(userId);
  }
}
