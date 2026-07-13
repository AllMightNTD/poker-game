import { Injectable } from '@nestjs/common';
import { AuditLog } from '../../entities/audit_log.entity';
import {
  decodeCursor,
  buildCursorPaginationResponse,
} from '../../utils/pagination.util';

@Injectable()
export class AdminSecurityLogsService {
  async getSecurityLogs(
    cursor: string | undefined,
    limit: number = 50,
    search: string = '',
  ) {
    const query = AuditLog.createQueryBuilder('log')
      .leftJoinAndSelect('log.user', 'user')
      .leftJoinAndSelect('log.room', 'room')
      .where('log.event_type = :eventType', { eventType: 'CHEAT_DETECTED' });

    if (search) {
      query.andWhere(
        '(user.user_name LIKE :search OR log.description LIKE :search OR log.ip_address LIKE :search)',
        { search: `%${search}%` },
      );
    }

    if (cursor) {
      const decoded = decodeCursor(cursor);
      if (decoded) {
        query.andWhere(
          '(log.created_at < :time OR (log.created_at = :time AND log.id < :id))',
          { time: decoded.time, id: decoded.id },
        );
      }
    }

    query.orderBy('log.created_at', 'DESC').addOrderBy('log.id', 'DESC');
    query.take(limit + 1);

    const logs = await query.getMany();
    return buildCursorPaginationResponse(logs, limit);
  }
}
