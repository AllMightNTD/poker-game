import { Injectable } from '@nestjs/common';
import { AdminAuditLog } from '../../entities/admin_audit_log.entity';
import {
  decodeCursor,
  buildCursorPaginationResponse,
} from '../../utils/pagination.util';

@Injectable()
export class AdminAuditLogsService {
  async getAuditLogs(
    cursor: string | undefined,
    limit: number = 50,
    search: string = '',
  ) {
    const query = AdminAuditLog.createQueryBuilder('log');

    if (search) {
      query.where(
        '(log.admin_id LIKE :search OR log.action LIKE :search OR log.resource LIKE :search)',
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
