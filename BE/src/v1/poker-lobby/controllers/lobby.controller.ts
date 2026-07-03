import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../../guards/auth.guard';
import { PokerLobbyService } from '../poker-lobby.service';

@Controller('v1/lobby')
@UseGuards(AuthGuard)
export class LobbyController {
  constructor(private readonly lobbyService: PokerLobbyService) {}

  @Get('stats')
  async getStats() {
    return this.lobbyService.getLobbyStats();
  }
}
