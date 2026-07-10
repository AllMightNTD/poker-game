import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { PlayerStatsService } from '../services/player-stats.service';

@ApiTags('Gamification')
@Controller('gamification')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class GamificationController {
  constructor(private readonly statsService: PlayerStatsService) { }

  @Get('me/stats')
  async getMyStats(@Req() req) {
    const userId = req.user.id;
    return this.statsService.getStats(userId);
  }

  @Get('me/achievements')
  async getMyAchievements(@Req() req) {
    const userId = req.user.id;
    return this.statsService.getAchievements(userId);
  }

  @Get('leaderboard')
  async getLeaderboard() {
    return this.statsService.getLeaderboard();
  }
}
