import { Injectable, NotFoundException } from '@nestjs/common';
import { UserStatus } from 'src/constants/enums';
import { HandPlayer } from '../../entities/hand_player.entity';
import { User } from '../../entities/user.entity';
import { PokerGameService } from '../../services/poker-game.service';
import { PokerLobbyService } from '../../services/poker-lobby.service';
import {
  buildCursorPaginationResponse,
  decodeCursor,
} from '../../utils/pagination.util';

@Injectable()
export class AdminUsersService {
  constructor(
    private readonly lobbyService: PokerLobbyService,
    private readonly gameService: PokerGameService,
  ) {}

  async getUsers(cursor: string | undefined, limit: number, search: string) {
    const query = User.createQueryBuilder('user').select([
      'user.id',
      'user.user_name',
      'user.email',
      'user.status',
      'user.is_active_status',
      'user.created_at',
    ]);

    if (search) {
      query.where('(user.user_name LIKE :search OR user.email LIKE :search)', {
        search: `%${search}%`,
      });
    }

    if (cursor) {
      const decoded = decodeCursor(cursor);
      if (decoded) {
        query.andWhere(
          '(user.created_at < :time OR (user.created_at = :time AND user.id < :id))',
          { time: decoded.time, id: decoded.id },
        );
      }
    }

    query.orderBy('user.created_at', 'DESC').addOrderBy('user.id', 'DESC');
    query.take(limit + 1);

    const users = await query.getMany();
    return buildCursorPaginationResponse(users, limit);
  }

  async banUser(id: string) {
    console.log('id ', id);
    const user = await User.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User not found');

    user.status = UserStatus.BANNED;
    user.is_active_status = false;
    await user.save();

    return { success: true, message: 'User has been banned', user_id: id };
  }

  async unbanUser(id: string) {
    const user = await User.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User not found');

    user.status = UserStatus.ACTIVE;
    user.is_active_status = true;
    await user.save();

    return { success: true, message: 'User has been unbanned', user_id: id };
  }

  async kickPlayer(userId: string, roomId: string, actorAdminId: string) {
    const result = await this.lobbyService.adminKickPlayer(
      actorAdminId,
      roomId,
      userId,
    );
    this.gameService.cancelDisconnectTimeout(roomId, userId);
    await this.gameService.syncRoomState(roomId);
    this.gameService.checkAndStartEmptyRoomTimer(roomId);
    return result;
  }

  async getUserStats(id: string) {
    const user = await User.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User not found');

    const stats = await HandPlayer.createQueryBuilder('hp')
      .select('COUNT(hp.id)', 'totalHands')
      .addSelect(
        'COALESCE(SUM(CAST(hp.net_gain_loss AS DECIMAL)), 0)',
        'netProfit',
      )
      .where('hp.user_id = :userId', { userId: id })
      .getRawOne();

    const rake = await HandPlayer.createQueryBuilder('hp')
      .select(
        'COALESCE(SUM(CAST(hp.chips_bet AS DECIMAL) / NULLIF(CAST(gh.total_pot AS DECIMAL), 0) * CAST(gh.rake_amount AS DECIMAL)), 0)',
        'rakeContributed',
      )
      .innerJoin('hp.hand', 'gh')
      .where('hp.user_id = :userId', { userId: id })
      .getRawOne();

    return {
      user_id: id,
      username: user.user_name,
      total_hands: Number(stats?.totalHands || 0),
      net_profit: Number(stats?.netProfit || 0),
      rake_contributed: Math.round(Number(rake?.rakeContributed || 0)),
    };
  }
}
