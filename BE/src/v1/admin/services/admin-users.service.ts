import { Injectable, NotFoundException } from '@nestjs/common';
import { User } from '../../entities/user.entity';
import { decodeCursor, buildCursorPaginationResponse } from '../../utils/pagination.util';

@Injectable()
export class AdminUsersService {
  async getUsers(cursor: string | undefined, limit: number, search: string) {
    const query = User.createQueryBuilder('user')
      .select(['user.id', 'user.user_name', 'user.email', 'user.status', 'user.is_active_status', 'user.created_at']);
    
    if (search) {
      query.where('(user.user_name LIKE :search OR user.email LIKE :search)', { search: `%${search}%` });
    }

    if (cursor) {
      const decoded = decodeCursor(cursor);
      if (decoded) {
        query.andWhere(
          '(user.created_at < :time OR (user.created_at = :time AND user.id < :id))',
          { time: decoded.time, id: decoded.id }
        );
      }
    }

    query.orderBy('user.created_at', 'DESC').addOrderBy('user.id', 'DESC');
    query.take(limit + 1);

    const users = await query.getMany();
    return buildCursorPaginationResponse(users, limit);
  }

  async banUser(id: string, reason: string) {
    const user = await User.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    
    user.status = 'BANNED';
    user.is_active_status = false;
    await user.save();
    
    return { success: true, message: 'User has been banned', user_id: id };
  }
}
