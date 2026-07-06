import { Injectable, NotFoundException } from '@nestjs/common';
import { PokerTable } from '../../entities/poker_table.entity';
import { decodeCursor, buildCursorPaginationResponse } from '../../utils/pagination.util';

@Injectable()
export class AdminTablesService {
  async getTables(cursor: string | undefined, limit: number, search: string) {
    const query = PokerTable.createQueryBuilder('table');
    
    if (search) {
      query.where('table.name LIKE :search', { search: `%${search}%` });
    }

    if (cursor) {
      const decoded = decodeCursor(cursor);
      if (decoded) {
        query.andWhere(
          '(table.created_at < :time OR (table.created_at = :time AND table.id < :id))',
          { time: decoded.time, id: decoded.id }
        );
      }
    }

    query.orderBy('table.created_at', 'DESC').addOrderBy('table.id', 'DESC');
    query.take(limit + 1);

    const tables = await query.getMany();
    return buildCursorPaginationResponse(tables, limit);
  }

  async closeTable(id: string) {
    const table = await PokerTable.findOne({ where: { id } });
    if (!table) throw new NotFoundException('Table not found');
    
    table.status = 'closed';
    await table.save();
    return { success: true, message: 'Table has been closed' };
  }
}
