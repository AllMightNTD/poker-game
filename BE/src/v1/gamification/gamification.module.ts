import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PlayerStats } from './entities/player-stats.entity';
import { Achievement } from './entities/achievement.entity';
import { LeaderboardEntry } from './entities/leaderboard-entry.entity';
import { PlayerStatsService } from './services/player-stats.service';
import { GamificationController } from './controllers/gamification.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([PlayerStats, Achievement, LeaderboardEntry]),
  ],
  providers: [PlayerStatsService],
  controllers: [GamificationController],
  exports: [PlayerStatsService],
})
export class GamificationModule {}
