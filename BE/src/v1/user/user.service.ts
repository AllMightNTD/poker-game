import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseService } from 'src/base/base.service';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { HandPlayer } from '../entities/hand_player.entity';
import { RefreshToken } from '../entities/refresh_token.entity';

@Injectable()
export class UserService extends BaseService<User, string> {
  protected filterableColumns: string[] = ['email', 'user_name'];

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(RefreshToken)
    private readonly refreshTokenRepository: Repository<RefreshToken>,
  ) {
    super(userRepository);
  }

  async getMe(userId: string) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async getActiveSessions(userId: string) {
    return this.refreshTokenRepository
      .createQueryBuilder('rt')
      .where('rt.user_id = :userId', { userId })
      .andWhere('rt.revoked_at IS NULL')
      .andWhere('rt.expires_at > :now', { now: new Date() })
      .orderBy('rt.created_at', 'DESC')
      .getMany();
  }

  async revokeSession(userId: string, sessionId: string) {
    const result = await this.refreshTokenRepository.update(
      { id: sessionId, user_id: userId, revoked_at: null },
      { revoked_at: new Date() },
    );
    if (result.affected === 0) {
      throw new NotFoundException('Session not found or already revoked');
    }
    return { success: true };
  }

  async getUserProfile(userId: string) {
    return this.getMe(userId);
  }

  async getUserPokerStats(userId: string) {
    const totalHands = await HandPlayer.count({
      where: { user_id: userId },
    });

    if (totalHands === 0) {
      return {
        total_hands: 0,
        vpip: 0,
        pfr: 0,
        biggest_win: '0',
      };
    }

    const vpipCount = await HandPlayer.count({
      where: { user_id: userId, vpip: true },
    });

    const pfrCount = await HandPlayer.count({
      where: { user_id: userId, pfr: true },
    });

    const result = await HandPlayer.createQueryBuilder('hp')
      .select('MAX(CAST(hp.chips_won AS SIGNED))', 'biggestWin')
      .where('hp.user_id = :userId', { userId })
      .getRawOne();

    const biggestWin = result?.biggestWin ? String(result.biggestWin) : '0';

    return {
      total_hands: totalHands,
      vpip: parseFloat(((vpipCount / totalHands) * 100).toFixed(1)),
      pfr: parseFloat(((pfrCount / totalHands) * 100).toFixed(1)),
      biggest_win: biggestWin,
    };
  }
}
