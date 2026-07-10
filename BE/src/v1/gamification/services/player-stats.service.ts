import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PokerHandCompletedEvent } from '../../services/audit.service';
import { Achievement } from '../entities/achievement.entity';
import { PlayerStats } from '../entities/player-stats.entity';

const LEVEL_THRESHOLDS = [
  { name: 'diamond', min_xp: 50000 },
  { name: 'platinum', min_xp: 20000 },
  { name: 'gold', min_xp: 10000 },
  { name: 'silver', min_xp: 3000 },
  { name: 'bronze', min_xp: 0 },
];

@Injectable()
export class PlayerStatsService {
  private readonly logger = new Logger(PlayerStatsService.name);

  constructor(
    @InjectRepository(PlayerStats)
    private readonly statsRepo: Repository<PlayerStats>,
    @InjectRepository(Achievement)
    private readonly achRepo: Repository<Achievement>,
  ) {}

  async getStats(userId: string) {
    let stats = await this.statsRepo.findOne({ where: { user_id: userId } });
    if (!stats) {
      stats = this.statsRepo.create({ user_id: userId });
      await this.statsRepo.save(stats);
    }
    return stats;
  }

  async getAchievements(userId: string) {
    return this.achRepo.find({
      where: { user_id: userId },
      order: { unlocked_at: 'DESC' },
    });
  }

  async getLeaderboard() {
    // Simulated leaderboard directly from stats table (ordered by biggest chips won)
    const topStats = await this.statsRepo.find({
      order: { total_chips_won: 'DESC' },
      take: 50,
      relations: ['user'],
    });

    return topStats.map((stat, index) => ({
      id: stat.user_id,
      user_id: stat.user_id,
      user: {
        id: stat.user?.id,
        username: stat.user?.user_name,
        avatar: stat.user?.avatar_url,
      },
      rank: index + 1,
      chips_won: stat.total_chips_won,
      hands_played: stat.hands_played,
    }));
  }

  // B-BE-02: update sau moi hand complete
  @OnEvent('poker.hand.completed')
  async handleHandCompleted(payload: PokerHandCompletedEvent) {
    try {
      this.logger.debug(`Processing gamification for hand ${payload.handId}`);

      const userShares = payload.userRakeShares || [];
      const userIds = payload.winners.map((w) => w.user_id);
      const uniqueUserIds = [
        ...new Set([...userIds, ...userShares.map((s) => s.userId)]),
      ];

      for (const userId of uniqueUserIds) {
        let stats = await this.statsRepo.findOne({
          where: { user_id: userId },
        });
        if (!stats) {
          stats = this.statsRepo.create({ user_id: userId });
        }

        // Calculate gains
        const isWinner = payload.winners.some((w) => w.user_id === userId);
        const winAmount = isWinner
          ? payload.winners
              .filter((w) => w.user_id === userId)
              .reduce((acc, val) => acc + BigInt(val.win_amount), BigInt(0))
          : BigInt(0);
        const rakePaid = BigInt(
          userShares.find((s) => s.userId === userId)?.rakePaid || 0,
        );

        stats.hands_played += 1;
        if (isWinner) {
          stats.hands_won += 1;

          // Check FIRST_WIN achievement
          if (stats.hands_won === 1) {
            const ach = await this.achRepo.findOne({
              where: { user_id: userId, type: 'FIRST_WIN' },
            });
            if (!ach) {
              const newAch = this.achRepo.create({
                user_id: userId,
                type: 'FIRST_WIN',
              });
              await this.achRepo.save(newAch);
              this.logger.log(`User ${userId} unlocked FIRST_WIN`);
            }
          }
        }

        stats.total_chips_won = (
          BigInt(stats.total_chips_won) + winAmount
        ).toString();
        stats.total_rake_paid = (
          BigInt(stats.total_rake_paid) + rakePaid
        ).toString();

        if (winAmount > BigInt(stats.biggest_pot)) {
          stats.biggest_pot = winAmount.toString();
        }

        // XP Formula: 10 XP per hand played, +50 XP if won
        let xpGained = 10;
        if (isWinner) xpGained += 50;

        stats.current_xp += xpGained;

        // Level Up Check
        for (const level of LEVEL_THRESHOLDS) {
          if (stats.current_xp >= level.min_xp) {
            if (stats.level !== level.name) {
              stats.level = level.name;
              this.logger.log(`User ${userId} leveled up to ${level.name}`);
              // TODO: Emit socket event for real-time notify
            }
            break;
          }
        }

        await this.statsRepo.save(stats);
      }
    } catch (err) {
      this.logger.error(
        `Error processing gamification for hand ${payload.handId}`,
        err,
      );
    }
  }
}
