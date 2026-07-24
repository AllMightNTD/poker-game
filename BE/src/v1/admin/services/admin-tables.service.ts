import { Injectable, NotFoundException } from '@nestjs/common';
import { PokerTable } from '../../entities/poker_table.entity';
import {
  decodeCursor,
  buildCursorPaginationResponse,
} from '../../utils/pagination.util';
import { CreateTableDto } from '../dto/create-table.dto';
import { UpdateTableDto } from '../dto/update-table.dto';
import { PokerGameService } from '../../services/poker-game.service';
import { PokerLobbyGateway } from '../../gateways/poker-lobby.gateway';

@Injectable()
export class AdminTablesService {
  constructor(
    private readonly gameService: PokerGameService,
    private readonly lobbyGateway: PokerLobbyGateway,
  ) {}

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
          { time: decoded.time, id: decoded.id },
        );
      }
    }

    query.orderBy('table.created_at', 'DESC').addOrderBy('table.id', 'DESC');
    query.take(limit + 1);

    const tables = await query.getMany();
    return buildCursorPaginationResponse(tables, limit);
  }

  async createTable(dto: CreateTableDto) {
    const table = PokerTable.create({
      name: dto.name.trim(),
      owner_id: 'system',
      game_type: dto.game_type,
      small_blind: dto.small_blind,
      big_blind: (parseInt(dto.small_blind, 10) * 2).toString(),
      ante: dto.ante || '0',
      max_players: dto.max_players,
      min_buyin: dto.min_buyin,
      max_buyin: dto.max_buyin,
      rake_rate: dto.rake_rate,
      rake_cap: dto.rake_cap,
      custom_settings: dto.custom_settings || null,
      status: 'waiting',
      is_active: true,
    });
    await table.save();
    return { success: true, table };
  }

  async updateTable(id: string, dto: UpdateTableDto) {
    const table = await PokerTable.findOne({ where: { id } });
    if (!table) throw new NotFoundException('Table not found');

    if (dto.name !== undefined) table.name = dto.name;
    if (dto.game_type !== undefined) table.game_type = dto.game_type;
    if (dto.small_blind !== undefined) {
      table.small_blind = dto.small_blind;
      table.big_blind = (parseInt(dto.small_blind, 10) * 2).toString();
    }
    if (dto.ante !== undefined) table.ante = dto.ante;
    if (dto.max_players !== undefined) table.max_players = dto.max_players;
    if (dto.min_buyin !== undefined) table.min_buyin = dto.min_buyin;
    if (dto.max_buyin !== undefined) table.max_buyin = dto.max_buyin;
    if (dto.rake_rate !== undefined) table.rake_rate = dto.rake_rate;
    if (dto.rake_cap !== undefined) table.rake_cap = dto.rake_cap;
    if (dto.custom_settings !== undefined) {
      table.custom_settings = {
        ...table.custom_settings,
        ...dto.custom_settings,
      };
    }

    await table.save();
    this.gameService.clearTableMetaCache(id);

    // Notify clients that room config has updated
    await this.gameService.syncRoomState(id);
    await this.gameService.broadcastLobbyRoomStatus(id);

    return { success: true, table };
  }

  async closeTable(id: string) {
    const table = await PokerTable.findOne({ where: { id } });
    if (!table) throw new NotFoundException('Table not found');

    table.status = 'closed';
    await table.save();
    this.gameService.clearTableMetaCache(id);

    await this.gameService.broadcastLobbyRoomStatus(id);
    this.lobbyGateway.server
      .to(`table_${id}`)
      .emit('table:status-changed', { status: 'closed' });

    return { success: true, message: 'Table has been closed' };
  }

  async pauseTable(id: string) {
    const table = await PokerTable.findOne({ where: { id } });
    if (!table) throw new NotFoundException('Table not found');

    table.status = 'paused';
    await table.save();
    this.gameService.clearTableMetaCache(id);

    await this.gameService.broadcastLobbyRoomStatus(id);
    this.lobbyGateway.server
      .to(`table_${id}`)
      .emit('table:status-changed', { status: 'paused' });

    return { success: true, status: 'paused' };
  }

  async resumeTable(id: string) {
    const table = await PokerTable.findOne({ where: { id } });
    if (!table) throw new NotFoundException('Table not found');

    table.status = 'waiting';
    await table.save();
    this.gameService.clearTableMetaCache(id);

    await this.gameService.broadcastLobbyRoomStatus(id);
    this.lobbyGateway.server
      .to(`table_${id}`)
      .emit('table:status-changed', { status: 'waiting' });
    await this.gameService.checkAndNotifyWaitingState(id);

    return { success: true, status: 'waiting' };
  }
}
