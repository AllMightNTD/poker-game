import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import * as crypto from 'crypto';
import { Response } from 'express';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { withTransaction } from 'src/common/helpers/transaction.helper';
import { UserStatus } from 'src/constants/user-status';
import { DataSource } from 'typeorm';
import { CreateRoomDto } from '../dto/create-room.dto';
import { AuditLog } from '../entities/audit_log.entity';
import { PokerTable } from '../entities/poker_table.entity';
import { RoomAdminLog } from '../entities/room_admin_log.entity';
import { SystemRevenue } from '../entities/system_revenue.entity';
import { TableSession } from '../entities/table_session.entity';
import { User } from '../entities/user.entity';
import { Wallet } from '../entities/wallet.entity';
import { PromoEvent } from '../entities/event.entity';
import { PokerStateService } from './poker-state.service';

@Injectable()
export class PokerLobbyService {
  private idempotencyKeys = new Map<string, number>();
  private activeLobbySubscribers = new Set<string>();

  constructor(
    private readonly stateService: PokerStateService,
    private readonly dataSource: DataSource,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  // Tracks active socket connections at lobby level
  addLobbySubscriber(clientId: string) {
    this.activeLobbySubscribers.add(clientId);
  }

  removeLobbySubscriber(clientId: string) {
    this.activeLobbySubscribers.delete(clientId);
  }

  getLobbySubscriberCount(): number {
    return this.activeLobbySubscribers.size;
  }

  async getActiveEvents(): Promise<PromoEvent[]> {
    const now = new Date();
    const query = PromoEvent.createQueryBuilder('event').where(
      'event.is_active = :isActive',
      { isActive: true },
    );

    query.andWhere('(event.start_date IS NULL OR event.start_date <= :now)', {
      now,
    });
    query.andWhere('(event.end_date IS NULL OR event.end_date >= :now)', {
      now,
    });

    query.orderBy('event.created_at', 'DESC');

    return query.getMany();
  }

  /**
   * 1. GET /api/v1/lobby/stats
   * Chức năng: Lấy thông tin tổng quan của sảnh chơi
   */
  async getLobbyStats() {
    // 1. Số người online = Số socket sub + một hạt giống cơ bản để sảnh trông sống động (ví dụ: 1428)
    const onlinePlayers = 1428 + this.getLobbySubscriberCount();

    // 2. Số bàn active = Số bàn có status là running hoặc waiting
    const activeTables = await PokerTable.count({
      where: [
        { status: 'running', is_active: true },
        { status: 'waiting', is_active: true },
      ],
    });

    // 3. Hũ Pot hôm nay (Jackpot) = Tổng doanh thu system_revenue hôm nay hoặc mock 1.2B
    const revenueSum = await SystemRevenue.createQueryBuilder('sr')
      .select('SUM(CAST(sr.revenue_amount AS DECIMAL))', 'total')
      .getRawOne();

    const baseJackpot = 1200000000; // 1.2B
    const actualRevenue = parseFloat(revenueSum?.total || '0');
    const totalJackpot = baseJackpot + actualRevenue;

    return {
      online_players: onlinePlayers,
      active_tables: activeTables || 6, // Fallback to 6 mock tables if database has none
      total_jackpot_pot: totalJackpot,
    };
  }

  /**
   * 2. GET /api/v1/user/chips
   * Chức năng: Lấy số dư chips hiện tại của người chơi
   */
  async getUserChips(userId: string) {
    let wallet = await Wallet.findOne({ where: { user_id: userId } });
    if (!wallet) {
      wallet = new Wallet();
      wallet.user_id = userId;
      wallet.chips_balance = '50000000'; // Cho sẵn 50M chips khi tạo mới
      await wallet.save();
    }
    return {
      chips_balance: wallet.chips_balance,
    };
  }

  /**
   * 3. POST /api/v1/wallet/free-chips
   * Chức năng: Nhận Chips Miễn Phí (anti-spam bằng Idempotency Key)
   */
  async claimFreeChips(userId: string, idempotencyKey: string) {
    if (!idempotencyKey) {
      throw new BadRequestException('X-Idempotency-Key header is required');
    }

    const now = Date.now();
    // Clean up expired keys (> 5s)
    for (const [key, exp] of this.idempotencyKeys.entries()) {
      if (now > exp) {
        this.idempotencyKeys.delete(key);
      }
    }

    // Check duplicate key
    if (this.idempotencyKeys.has(idempotencyKey)) {
      throw new ConflictException(
        'Yêu cầu đang được xử lý, vui lòng không spam!',
      );
    }

    // Set key expiry after 5 seconds
    this.idempotencyKeys.set(idempotencyKey, now + 5000);

    // Use transaction + pessimistic_write to prevent race conditions
    return withTransaction(this.dataSource, async (qr) => {
      const wallet = await qr.manager.findOne(Wallet, {
        where: { user_id: userId },
        lock: { mode: 'pessimistic_write' },
      });

      let targetWallet = wallet;
      if (!targetWallet) {
        targetWallet = qr.manager.create(Wallet, {
          user_id: userId,
          chips_balance: '0',
        });
      }

      const currentChips = BigInt(targetWallet.chips_balance);
      const freeChips = BigInt('5000000'); // 5M free chips
      targetWallet.chips_balance = (currentChips + freeChips).toString();
      await qr.manager.save(targetWallet);

      // Emit wallet adjustment event
      this.eventEmitter.emit('poker.wallet.adjust', {
        userId,
        amount: 5000000,
        type: 'free_chips',
        referenceId: idempotencyKey,
      });

      return {
        success: true,
        chips_balance: targetWallet.chips_balance,
        added_amount: '5000000',
      };
    });
  }

  /**
   * 4. GET /api/v1/rooms
   * Chức năng: Lấy danh sách các bàn chơi kèm theo bộ lọc
   */
  async getRooms(query: {
    search_name?: string;
    blind_category?: string;
    status?: string;
    page?: number;
    limit?: number;
    show_private?: string;
  }) {
    const searchName = query.search_name || '';
    const blindCategory = query.blind_category || 'all';
    const statusFilter =
      query.status && query.status !== 'all'
        ? query.status.toLowerCase()
        : null;
    const page = Math.max(1, Number(query.page || 1));
    const limit = Math.max(1, Number(query.limit || 20));
    const showPrivate = query.show_private === 'true';

    // Xây dựng query builder
    const queryBuilder = PokerTable.createQueryBuilder('table');

    // Mặc định chỉ lấy bàn is_active, trừ khi explicitly filter CLOSED
    if (statusFilter === 'closed') {
      queryBuilder.where('table.status = :status', { status: 'closed' });
    } else {
      queryBuilder.where('table.is_active = :isActive', { isActive: true });
      if (statusFilter) {
        queryBuilder.andWhere('table.status = :status', {
          status: statusFilter,
        });
      }
    }

    if (searchName) {
      queryBuilder.andWhere('table.name LIKE :searchName', {
        searchName: `%${searchName}%`,
      });
    }

    if (!showPrivate) {
      // Filter out PRIVATE rooms from the public lobby
      queryBuilder.andWhere(
        `(JSON_EXTRACT(table.custom_settings, '$.table_visibility') IS NULL OR JSON_UNQUOTE(JSON_EXTRACT(table.custom_settings, '$.table_visibility')) != 'PRIVATE')`,
      );
    }

    // Lọc theo Big Blind Category
    if (blindCategory === 'micro') {
      // Big blind <= 2000
      queryBuilder.andWhere('CAST(table.big_blind AS DECIMAL) <= :limit', {
        limit: 2000,
      });
    } else if (blindCategory === 'low') {
      // 2000 < Big blind <= 10000
      queryBuilder.andWhere(
        'CAST(table.big_blind AS DECIMAL) > :low AND CAST(table.big_blind AS DECIMAL) <= :high',
        { low: 2000, high: 10000 },
      );
    } else if (blindCategory === 'medium') {
      // 10000 < Big blind <= 50000
      queryBuilder.andWhere(
        'CAST(table.big_blind AS DECIMAL) > :low AND CAST(table.big_blind AS DECIMAL) <= :high',
        { low: 10000, high: 50000 },
      );
    } else if (blindCategory === 'high') {
      // Big blind > 50000
      queryBuilder.andWhere('CAST(table.big_blind AS DECIMAL) > :limit', {
        limit: 50000,
      });
    }

    // Phân trang
    queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .orderBy('table.created_at', 'DESC');

    const [tables, total] = await queryBuilder.getManyAndCount();

    // Map kết quả & lấy thông tin người chơi động từ table_sessions
    const rooms = await Promise.all(
      tables.map(async (t) => {
        // Đếm số lượng session active
        const playersCount = await TableSession.count({
          where: {
            table_id: t.id,
            member_status: 'active',
          },
        });

        return {
          room_id: parseInt(t.id),
          room_name: t.name,
          game_type: t.game_type,
          table_visibility: t.custom_settings?.table_visibility || 'PUBLIC',
          max_players: t.max_players,
          current_players_count: playersCount,
          small_blind: parseInt(t.small_blind),
          big_blind: parseInt(t.big_blind),
          min_buy_in: parseInt(t.min_buyin),
          max_buy_in: parseInt(t.max_buyin),
          status: (t.status || 'waiting').toUpperCase(),
        };
      }),
    );

    return {
      rooms,
      total,
      page,
      limit,
    };
  }

  /**
   * 5. POST /api/v1/rooms/join-request
   * Chức năng: Đăng ký vào bàn
   */
  async joinRoomRequest(userId: string, roomId: string) {
    const table = await PokerTable.findOne({
      where: { id: roomId, is_active: true },
    });
    if (!table) {
      throw new NotFoundException('Bàn chơi không tồn tại hoặc đã bị đóng.');
    }

    // Đếm số lượng players hiện tại
    const playersCount = await TableSession.count({
      where: {
        table_id: roomId,
        member_status: 'active',
      },
    });

    if (playersCount >= table.max_players) {
      throw new BadRequestException('Bàn chơi đã đầy chỗ.');
    }

    // Check chips ví
    const wallet = await Wallet.findOne({ where: { user_id: userId } });
    const userChips = BigInt(wallet?.chips_balance || '0');
    const minBuyin = BigInt(table.min_buyin);

    if (userChips < minBuyin) {
      throw new BadRequestException(
        'Số dư chips không đủ để tối thiểu buy-in vào bàn này.',
      );
    }

    return {
      success: true,
      room_id: table.id,
      room_name: table.name,
      min_buy_in: table.min_buyin,
      max_buy_in: table.max_buyin,
      chips_balance: wallet.chips_balance,
    };
  }

  /**
   * 6. POST /api/v1/rooms/spectate
   * Chức năng: Xem bàn chơi với tư cách khán giả
   */
  async spectateRoom(userId: string, roomId: string) {
    const table = await PokerTable.findOne({
      where: { id: roomId, is_active: true },
    });
    if (!table) {
      throw new NotFoundException('Bàn chơi không tồn tại hoặc đã bị đóng.');
    }

    const maxSpectators = table.custom_settings?.max_spectators || 0;

    // Check max spectators via Redis Set (we track userIds of spectators)
    const redis = this.stateService.getRedisClient();
    const spectatorsKey = `table:${roomId}:spectators`;

    if (maxSpectators > 0) {
      const currentSpectators = await redis.scard(spectatorsKey);
      if (currentSpectators >= maxSpectators) {
        // Only block if this user isn't already a spectator
        const isAlreadySpectating = await redis.sismember(
          spectatorsKey,
          userId,
        );
        if (!isAlreadySpectating) {
          throw new ConflictException(
            `Phòng đã đạt giới hạn tối đa ${maxSpectators} người xem.`,
          );
        }
      }
    }

    // Add user to spectators set and set an expiry (e.g., 2 hours) so it doesn't leak forever if they disconnect ungracefully
    await redis.sadd(spectatorsKey, userId);
    await redis.expire(spectatorsKey, 7200);

    return {
      success: true,
      room_id: table.id,
      room_name: table.name,
    };
  }

  /**
   * 7. POST /api/v1/rooms
   * Chức năng: Tạo bàn chơi mới
   */
  async createRoom(userId: string, body: CreateRoomDto) {
    if (!body.room_name || !body.room_name.trim()) {
      throw new BadRequestException('Tên bàn chơi không được để trống.');
    }

    const sb = parseInt(body.small_blind.toString(), 10);
    if (isNaN(sb) || sb <= 0) {
      throw new BadRequestException('Mức Small Blind không hợp lệ.');
    }

    const maxPlayers = body.max_players ? Number(body.max_players) : 9;
    const minBuyin = body.min_buy_in
      ? body.min_buy_in.toString()
      : (sb * 40).toString();
    const maxBuyin = body.max_buy_in
      ? body.max_buy_in.toString()
      : (sb * 200).toString();
    const gameType = body.game_type || 'NLH';
    const mode = body.mode || 'CUSTOM';

    let customSettings = null;
    if (body.custom_settings) {
      customSettings = { ...body.custom_settings };
      // Hash the password if it exists and table is PRIVATE
      if (
        customSettings.table_visibility === 'PRIVATE' &&
        customSettings.password
      ) {
        customSettings.password = crypto
          .createHash('sha256')
          .update(customSettings.password)
          .digest('hex');
      }
    }

    let tournamentSettings = null;
    if (body.tournament_settings) {
      tournamentSettings = { ...body.tournament_settings };
    }

    // Wrap table creation + session cleanup in one atomic transaction
    const table = await withTransaction(this.dataSource, async (qr) => {
      const newTable = qr.manager.create(PokerTable, {
        name: body.room_name.trim(),
        owner_id: userId,
        game_type: gameType,
        mode: mode,
        small_blind: sb.toString(),
        big_blind: (sb * 2).toString(),
        max_players: maxPlayers,
        min_buyin: minBuyin,
        max_buyin: maxBuyin,
        ante: '0',
        custom_settings: customSettings,
        tournament_settings: tournamentSettings,
        status: 'waiting',
        is_active: true,
      });
      await qr.manager.save(newTable);

      // Cleanup stale sessions from any previous table with the same ID (ID reuse safety)
      await qr.manager.update(
        TableSession,
        { table_id: newTable.id, member_status: 'active' },
        { member_status: 'left', left_at: new Date() },
      );

      return newTable;
    });

    // Flush Redis ghost state after DB commit
    await this.stateService.deleteAllTableKeys(table.id);

    return {
      success: true,
      room_id: parseInt(table.id),
      room_name: table.name,
      small_blind: sb,
      big_blind: sb * 2,
      max_players: table.max_players,
      min_buy_in: parseInt(table.min_buyin),
      max_buy_in: parseInt(table.max_buyin),
      current_players_count: 0,
    };
  }

  /**
   * Buy-in vào bàn chơi (Trừ ví chính, lưu Stack lên Redis và DB)
   */
  async buyIn(
    userId: string,
    body: {
      room_id: string;
      amount: number;
      seat_number: number;
      custom_name?: string;
      ip?: string;
    },
  ) {
    const table = await PokerTable.findOne({
      where: { id: body.room_id, is_active: true },
    });
    if (!table) {
      throw new NotFoundException('Bàn chơi không tồn tại.');
    }

    if (body.seat_number < 1 || body.seat_number > table.max_players) {
      throw new BadRequestException('Vị trí ghế không hợp lệ.');
    }

    // Check ghế trống trên Redis
    const existingSeat = await this.stateService.getSeat(
      body.room_id,
      body.seat_number,
    );
    if (existingSeat) {
      throw new ConflictException('Ghế này đã có người ngồi.');
    }

    // Check ghế trống trên MySQL
    const occupiedDb = await TableSession.findOne({
      where: {
        table_id: body.room_id,
        seat_number: body.seat_number,
        member_status: 'active',
      },
    });
    if (occupiedDb) {
      throw new ConflictException('Ghế này đã có người ngồi.');
    }

    const min = BigInt(table.min_buyin);
    const max = BigInt(table.max_buyin);
    const amt = BigInt(body.amount);

    if (amt < min || amt > max) {
      throw new BadRequestException(
        `Số tiền buy-in phải từ ${min} đến ${max} chip.`,
      );
    }

    // Check user đang ngồi ở ghế khác
    const activeSession = await TableSession.findOne({
      where: {
        table_id: body.room_id,
        user_id: userId,
        member_status: 'active',
      },
    });
    if (activeSession) {
      throw new BadRequestException(
        'Bạn đang ngồi tại một ghế khác ở bàn này.',
      );
    }

    // Giao dịch trừ tiền ví chính & tạo session
    const queryRunner =
      PokerTable.getRepository().manager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const wallet = await queryRunner.manager.findOne(Wallet, {
        where: { user_id: userId },
        lock: { mode: 'pessimistic_write' },
      });

      if (!wallet || BigInt(wallet.chips_balance) < amt) {
        throw new BadRequestException('Số dư chips không đủ.');
      }

      wallet.chips_balance = (BigInt(wallet.chips_balance) - amt).toString();
      await queryRunner.manager.save(wallet);

      const session = new TableSession();
      session.table_id = body.room_id;
      session.user_id = userId;
      session.seat_number = body.seat_number;
      session.chips_at_table = amt.toString();
      session.member_status = 'active';
      await queryRunner.manager.save(session);

      await queryRunner.commitTransaction();

      // Emit wallet adjustment event
      this.eventEmitter.emit('poker.wallet.adjust', {
        userId,
        amount: -Number(amt),
        type: 'buyin',
        referenceId: session.id,
      });

      // Lấy username & avatar của user
      const user = await queryRunner.manager.findOne(User, {
        where: { id: userId },
      });

      await this.stateService.setSeat(body.room_id, body.seat_number, {
        user_id: userId,
        username:
          body.custom_name ||
          user?.user_name ||
          user?.email?.split('@')[0] ||
          'Guest',
        avatar: user?.avatar_url || '',
        stack: amt.toString(),
        current_bet: '0',
        status: 'waiting_for_next_hand',
        disconnected_at: '0',
        has_used_extra_time: '0',
        ip: body.ip || '127.0.0.1',
      });

      // Tăng số lượng chip nạp lũy kế trên Redis
      const redis = this.stateService.getRedisClient();
      await redis.hincrby(
        `table:${body.room_id}:player:${userId}:stats`,
        'purchase_count',
        body.amount,
      );

      return {
        success: true,
        session_id: session.id,
        current_stack: amt.toString(),
        seat_number: body.seat_number,
      };
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Thay đổi trạng thái ngồi chơi (Sit-out hoặc Sit-back)
   */
  async sitAction(
    userId: string,
    body: { room_id: string; action: 'sit_out' | 'sit_back' },
  ) {
    const session = await TableSession.findOne({
      where: {
        table_id: body.room_id,
        user_id: userId,
        member_status: body.action === 'sit_out' ? 'active' : 'sitting_out',
      },
    });

    let targetSession = session;
    if (!targetSession) {
      targetSession = await TableSession.findOne({
        where: {
          table_id: body.room_id,
          user_id: userId,
          member_status: body.action === 'sit_out' ? 'sitting_out' : 'active',
        },
      });
    }

    if (!targetSession) {
      throw new NotFoundException(
        'Không tìm thấy phiên chơi của bạn tại bàn này.',
      );
    }

    const seats = await this.stateService.getAllSeats(body.room_id);
    const heroSeat = seats.find((s) => s.user_id === userId);
    if (!heroSeat) {
      throw new NotFoundException(
        'Không tìm thấy ghế chơi của bạn trên cache.',
      );
    }

    const newStatus = body.action === 'sit_out' ? 'sitting_out' : 'active';
    targetSession.member_status = newStatus;
    await targetSession.save();

    await this.stateService.setSeat(body.room_id, heroSeat.seat_number, {
      status: newStatus,
    });

    return { success: true, status: newStatus };
  }

  /**
   * Rời bàn / Cashout (Đọc stack từ Redis, hoàn trả ví chính, cập nhật DB)
   */
  async leaveRoom(userId: string, roomId: string) {
    const session = await TableSession.findOne({
      where: {
        table_id: roomId,
        user_id: userId,
        member_status: 'active',
      },
    });

    let activeSession = session;
    if (!activeSession) {
      activeSession = await TableSession.findOne({
        where: {
          table_id: roomId,
          user_id: userId,
          member_status: 'sitting_out',
        },
      });
    }

    if (!activeSession) {
      // Check if user is in spectator list in Redis
      const redis = this.stateService.getRedisClient();
      const spectatorsKey = `table:${roomId}:spectators`;
      const isSpectator = await redis.sismember(spectatorsKey, userId);
      if (isSpectator) {
        await redis.srem(spectatorsKey, userId);
      }
      return {
        success: true,
        message: 'Khán giả rời phòng thành công',
      };
    }

    return this.processLeave(userId, roomId, activeSession);
  }

  private async processLeave(
    userId: string,
    roomId: string,
    session: TableSession,
  ) {
    const seats = await this.stateService.getAllSeats(roomId);
    const heroSeat = seats.find((s) => s.user_id === userId);

    let finalStackStr = session.chips_at_table;
    if (heroSeat) {
      finalStackStr = heroSeat.stack;
    }

    const finalStack = BigInt(finalStackStr);

    const hasLock = await this.stateService.acquireLock(roomId);
    if (!hasLock) {
      throw new Error('Hệ thống đang bận, vui lòng thử lại sau giây lát.');
    }

    try {
      const tableState = await this.stateService.getTableState(roomId);
      const isHandRunning =
        tableState &&
        tableState.game_stage &&
        tableState.game_stage !== 'ended' &&
        tableState.game_stage !== 'waiting';

      if (
        isHandRunning &&
        heroSeat &&
        ['active', 'folded', 'allin'].includes(heroSeat.status)
      ) {
        // Set pending leave
        await this.stateService.setSeat(roomId, heroSeat.seat_number, {
          pending_leave: '1',
        });
        return {
          success: true,
          pending: true,
          message: 'Bạn sẽ rời bàn sau khi ván đấu hiện tại kết thúc.',
        };
      }

      if (isHandRunning && heroSeat && heroSeat.start_stack) {
        const startStack = parseInt(heroSeat.start_stack, 10);
        const totalChipsBetEarly = parseInt(
          heroSeat.total_contributed || '0',
          10,
        );
        const expectedStack = startStack - totalChipsBetEarly;
        const actualNewStack = parseInt(heroSeat.stack, 10);

        if (expectedStack !== actualNewStack) {
          const logger = new Logger('ReconciliationLeave');
          logger.error(
            `[RECONCILIATION LEAVE ERROR] Money Exploit Detected on Leave! User ${userId} of table ${roomId}. ` +
              `Start stack: ${startStack}, Bet: ${totalChipsBetEarly}, Expected: ${expectedStack}, Actual: ${actualNewStack}`,
          );
          // Block user
          const user = await User.findOne({ where: { id: userId } });
          if (user) {
            user.status = UserStatus.BANNED;
            await user.save();
          }

          // Ghi Audit Log vào database
          try {
            const audit = new AuditLog();
            audit.event_type = 'CHEAT_DETECTED';
            audit.user_id = userId;
            audit.description = `Money Exploit Detected on Leave in Room ${roomId}`;
            audit.metadata = {
              roomId,
              startStack,
              totalChipsBetEarly,
              expectedStack,
              actualNewStack,
            };
            await audit.save();
          } catch (e) {
            logger.error(`Không thể lưu AuditLog: ${e.message}`);
          }

          throw new BadRequestException(
            'Phát hiện sai lệch số phỉnh bất thường. Tài khoản đã bị khóa để kiểm tra.',
          );
        }
      }

      const queryRunner =
        PokerTable.getRepository().manager.connection.createQueryRunner();
      await queryRunner.connect();
      await queryRunner.startTransaction();

      try {
        const wallet = await queryRunner.manager.findOne(Wallet, {
          where: { user_id: userId },
          lock: { mode: 'pessimistic_write' },
        });

        if (!wallet) {
          throw new NotFoundException('Không tìm thấy ví người dùng.');
        }

        wallet.chips_balance = (
          BigInt(wallet.chips_balance) + finalStack
        ).toString();
        await queryRunner.manager.save(wallet);

        session.member_status = 'left';
        session.left_at = new Date();
        session.chips_at_table = '0';
        await queryRunner.manager.save(session);

        await queryRunner.commitTransaction();

        // Emit wallet adjustment event
        this.eventEmitter.emit('poker.wallet.adjust', {
          userId,
          amount: Number(finalStack),
          type: 'refund',
          referenceId: session.id,
        });

        // Cập nhật lũy kế cashout và dọn dẹp Redis
        const redis = this.stateService.getRedisClient();
        await redis.hincrby(
          `table:${roomId}:player:${userId}:stats`,
          'cashout_chips',
          Number(finalStack),
        );

        if (heroSeat) {
          await this.stateService.deleteSeat(roomId, heroSeat.seat_number);
          await this.stateService.deletePlayerCards(roomId, userId);
        }

        return {
          success: true,
          refunded_amount: finalStack.toString(),
          new_wallet_balance: wallet.chips_balance,
        };
      } catch (err) {
        await queryRunner.rollbackTransaction();
        throw err;
      } finally {
        await queryRunner.release();
      }
    } finally {
      await this.stateService.releaseLock(roomId);
    }
  }

  /**
   * Thay đổi cấu hình Small Blind dành cho Chủ bàn
   */
  async updateRoomConfig(
    userId: string,
    roomId: string,
    body: { small_blind: number },
  ) {
    const table = await PokerTable.findOne({ where: { id: roomId } });
    if (!table) {
      throw new NotFoundException('Bàn chơi không tồn tại.');
    }

    if (table.owner_id !== userId) {
      throw new BadRequestException(
        'Chỉ chủ phòng mới được thay đổi cấu hình.',
      );
    }

    const sb = parseInt(body.small_blind.toString(), 10);
    if (isNaN(sb) || sb <= 0) {
      throw new BadRequestException('Mức Small Blind không hợp lệ.');
    }

    const bb = sb * 2;

    // Table update + AuditLog in single atomic transaction
    await withTransaction(this.dataSource, async (qr) => {
      await qr.manager.update(
        PokerTable,
        { id: roomId },
        {
          small_blind: sb.toString(),
          big_blind: bb.toString(),
          min_buyin: (sb * 40).toString(),
          max_buyin: (sb * 200).toString(),
        },
      );

      const log = qr.manager.create(RoomAdminLog, {
        room_id: roomId,
        actor_id: userId,
        log_type: 'config_change',
        description: `Chủ phòng thay đổi Small Blind thành ${sb} (Big Blind: ${bb})`,
      });
      await qr.manager.save(log);
    });

    await this.stateService.setTableState(roomId, {
      small_blind: sb,
      big_blind: bb,
    });

    return {
      success: true,
      small_blind: sb,
      big_blind: bb,
    };
  }

  /**
   * Tạm dừng hoặc tiếp tục phòng chơi dành cho Chủ bàn
   */
  async toggleRoomPause(userId: string, roomId: string, paused: boolean) {
    const table = await PokerTable.findOne({ where: { id: roomId } });
    if (!table) {
      throw new NotFoundException('Bàn chơi không tồn tại.');
    }

    if (table.owner_id !== userId) {
      throw new BadRequestException('Chỉ chủ phòng mới có quyền tạm dừng.');
    }

    if (paused) {
      table.status = 'paused';
    } else {
      table.status = 'waiting';
    }

    await table.save();

    return {
      success: true,
      status: table.status,
    };
  }

  /**
   * Kick người chơi ra khỏi bàn
   */
  async kickPlayer(userId: string, roomId: string, targetUserId: string) {
    const table = await PokerTable.findOne({ where: { id: roomId } });
    if (!table) {
      throw new NotFoundException('Bàn chơi không tồn tại.');
    }

    if (table.owner_id !== userId) {
      throw new BadRequestException(
        'Chỉ chủ phòng mới có quyền kick người chơi.',
      );
    }

    if (targetUserId === userId) {
      throw new BadRequestException('Bạn không thể tự kick chính mình.');
    }

    const session = await TableSession.findOne({
      where: {
        table_id: roomId,
        user_id: targetUserId,
        member_status: 'active',
      },
    });

    let activeSession = session;
    if (!activeSession) {
      activeSession = await TableSession.findOne({
        where: {
          table_id: roomId,
          user_id: targetUserId,
          member_status: 'sitting_out',
        },
      });
    }

    if (!activeSession) {
      throw new NotFoundException('Không tìm thấy người chơi này tại bàn.');
    }

    await this.processLeave(targetUserId, roomId, activeSession);

    // AuditLog is written atomically only if leave succeeds
    await withTransaction(this.dataSource, async (qr) => {
      const log = qr.manager.create(RoomAdminLog, {
        room_id: roomId,
        actor_id: userId,
        target_id: targetUserId,
        log_type: 'kick',
        description: `Chủ phòng kick user ${targetUserId} ra khỏi bàn.`,
      });
      await qr.manager.save(log);
    });

    return { success: true };
  }

  /**
   * Admin cưỡng chế kick người chơi ra khỏi bàn
   */
  async adminKickPlayer(actorId: string, roomId: string, targetUserId: string) {
    const table = await PokerTable.findOne({ where: { id: roomId } });
    if (!table) {
      throw new NotFoundException('Bàn chơi không tồn tại.');
    }

    const session = await TableSession.findOne({
      where: {
        table_id: roomId,
        user_id: targetUserId,
        member_status: 'active',
      },
    });

    let activeSession = session;
    if (!activeSession) {
      activeSession = await TableSession.findOne({
        where: {
          table_id: roomId,
          user_id: targetUserId,
          member_status: 'sitting_out',
        },
      });
    }

    if (!activeSession) {
      throw new NotFoundException('Không tìm thấy người chơi này tại bàn.');
    }

    await this.processLeave(targetUserId, roomId, activeSession);

    await withTransaction(this.dataSource, async (qr) => {
      const log = qr.manager.create(RoomAdminLog, {
        room_id: roomId,
        actor_id: actorId,
        target_id: targetUserId,
        log_type: 'kick',
        description: `Admin kick user ${targetUserId} ra khỏi bàn.`,
      });
      await qr.manager.save(log);
    });

    return { success: true };
  }

  /**
   * Cưỡng chế người chơi đi vắng (Force Sit-out)
   */
  async forceSitOut(userId: string, roomId: string, targetUserId: string) {
    const table = await PokerTable.findOne({ where: { id: roomId } });
    if (!table) {
      throw new NotFoundException('Bàn chơi không tồn tại.');
    }

    if (table.owner_id !== userId) {
      throw new BadRequestException(
        'Chỉ chủ phòng mới có quyền cưỡng chế Sit-out.',
      );
    }

    const session = await TableSession.findOne({
      where: {
        table_id: roomId,
        user_id: targetUserId,
        member_status: 'active',
      },
    });

    if (!session) {
      throw new NotFoundException(
        'Không tìm thấy người chơi này ở trạng thái active tại bàn.',
      );
    }

    session.member_status = 'sitting_out';
    await session.save();

    const seats = await this.stateService.getAllSeats(roomId);
    const targetSeat = seats.find((s) => s.user_id === targetUserId);
    if (targetSeat) {
      await this.stateService.setSeat(roomId, targetSeat.seat_number, {
        status: 'sitting_out',
      });
    }

    const log = new RoomAdminLog();
    log.room_id = roomId;
    log.actor_id = userId;
    log.target_id = targetUserId;
    log.log_type = 'mute';
    log.description = `Chủ phòng cưỡng chế Sit-out user ${targetUserId}`;
    await log.save();

    return { success: true };
  }

  /**
   * Cộng/trừ phỉnh trực tiếp cho người chơi (Bàn Custom)
   */
  async modifyStack(
    userId: string,
    roomId: string,
    body: {
      target_user_id: string;
      action: 'add' | 'subtract';
      amount: number;
    },
  ) {
    const table = await PokerTable.findOne({ where: { id: roomId } });
    if (!table) {
      throw new NotFoundException('Bàn chơi không tồn tại.');
    }

    if (table.owner_id !== userId) {
      throw new BadRequestException(
        'Chỉ chủ phòng mới có quyền sửa đổi Stack.',
      );
    }

    const seats = await this.stateService.getAllSeats(roomId);
    const targetSeat = seats.find((s) => s.user_id === body.target_user_id);
    if (!targetSeat) {
      throw new NotFoundException(
        'Không tìm thấy thông tin ghế chơi trên cache.',
      );
    }

    const amt = BigInt(body.amount);
    let currentRedisStack = BigInt(targetSeat.stack);

    if (body.action === 'add') {
      currentRedisStack += amt;
    } else {
      currentRedisStack =
        currentRedisStack < amt ? BigInt(0) : currentRedisStack - amt;
    }

    const newStack = currentRedisStack.toString();

    // Wrap DB session update + AuditLog in a single transaction with pessimistic lock
    await withTransaction(this.dataSource, async (qr) => {
      const session = await qr.manager.findOne(TableSession, {
        where: [
          {
            table_id: roomId,
            user_id: body.target_user_id,
            member_status: 'active',
          },
          {
            table_id: roomId,
            user_id: body.target_user_id,
            member_status: 'sitting_out',
          },
        ],
        lock: { mode: 'pessimistic_write' },
      });

      if (!session) {
        throw new NotFoundException('Người chơi không ở tại ghế chơi.');
      }

      session.chips_at_table = newStack;
      await qr.manager.save(session);

      const log = qr.manager.create(RoomAdminLog, {
        room_id: roomId,
        actor_id: userId,
        target_id: body.target_user_id,
        log_type: 'config_change',
        description: `Chủ phòng ${body.action === 'add' ? 'cộng' : 'trừ'} ${body.amount} phỉnh cho user ${body.target_user_id}. Stack mới: ${newStack}`,
      });
      await qr.manager.save(log);
    });

    // Update Redis after DB commit succeeds
    await this.stateService.setSeat(roomId, targetSeat.seat_number, {
      stack: newStack,
    });

    return {
      success: true,
      new_stack: newStack,
    };
  }

  /**
   * Lấy Báo cáo/Thống kê lãi lỗ toàn bộ người chơi tại bàn
   */
  async getTableStats(userId: string, roomId: string) {
    const table = await PokerTable.findOne({ where: { id: roomId } });
    if (!table) {
      throw new NotFoundException('Bàn chơi không tồn tại.');
    }

    const sessions = await TableSession.find({
      where: { table_id: roomId },
    });

    const redis = this.stateService.getRedisClient();
    const seats = await this.stateService.getAllSeats(roomId);

    const players = await Promise.all(
      sessions.map(async (sess) => {
        const user = await PokerTable.getRepository().manager.findOne(User, {
          where: { id: sess.user_id },
        });
        const username =
          user?.user_name || user?.email?.split('@')[0] || 'Guest';

        const currentSeat = seats.find((s) => s.user_id === sess.user_id);
        const seat_number = currentSeat
          ? currentSeat.seat_number
          : sess.seat_number;
        const status = sess.member_status;

        const statsKey = `table:${roomId}:player:${sess.user_id}:stats`;
        const redisStats = await redis.hgetall(statsKey);

        const purchase_count =
          parseInt(redisStats.purchase_count || sess.chips_at_table) || 0;
        const cashout_chips = parseInt(redisStats.cashout_chips || '0') || 0;
        const current_chips = currentSeat ? parseInt(currentSeat.stack) : 0;
        const net_pnl = current_chips + cashout_chips - purchase_count;

        return {
          user_id: sess.user_id,
          username,
          seat_number,
          status,
          purchase_count,
          cashout_chips,
          current_chips,
          net_pnl,
        };
      }),
    );

    return {
      room_id: roomId,
      room_name: table.name,
      players,
    };
  }

  /**
   * Xuất CSV thống kê báo cáo (UTF-8 BOM hỗ trợ Excel tiếng Việt)
   */
  async exportTableStats(userId: string, roomId: string, res: Response) {
    const statsData = await this.getTableStats(userId, roomId);

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=poker_stats_room_${roomId}.csv`,
    );

    // Ghi UTF-8 BOM
    res.write('\uFEFF');

    let csvContent =
      'Tên người chơi,Vị trí ghế,Trạng thái,Tổng nạp (Buy-in),Tổng rút (Cashout),Số chip còn lại,Lãi/Lỗ ròng (P&L)\n';
    for (const p of statsData.players) {
      csvContent += `"${p.username}",${p.seat_number},"${p.status}",${p.purchase_count},${p.cashout_chips},${p.current_chips},${p.net_pnl}\n`;
    }

    res.write(csvContent);
    res.end();
  }

  /**
   * Tham gia vào ghế chơi (REST API /api/v1/rooms/:roomId/seats/join)
   */
  async joinSeat(
    userId: string,
    roomId: string,
    body: { seat_number: number; display_name: string; buy_in_chips: number },
  ) {
    const table = await PokerTable.findOne({
      where: { id: roomId, is_active: true },
    });
    if (!table) {
      throw new NotFoundException('Bàn chơi không tồn tại.');
    }

    if (body.seat_number < 1 || body.seat_number > table.max_players) {
      throw new BadRequestException('Vị trí ghế không hợp lệ.');
    }

    if (!body.display_name || body.display_name.trim().length === 0) {
      throw new BadRequestException('Tên hiển thị không hợp lệ.');
    }

    const min = BigInt(table.min_buyin);
    const max = BigInt(table.max_buyin);
    const amt = BigInt(body.buy_in_chips);

    if (amt < min || amt > max) {
      throw new BadRequestException('Buy-in amount is invalid.');
    }

    // Check user balance
    const wallet = await Wallet.findOne({ where: { user_id: userId } });
    if (!wallet || BigInt(wallet.chips_balance) < amt) {
      throw new BadRequestException('Insufficient chips.');
    }

    // Check ghế trống trên Redis
    const existingSeat = await this.stateService.getSeat(
      roomId,
      body.seat_number,
    );
    if (existingSeat) {
      throw new BadRequestException('Seat already occupied.');
    }

    // Check ghế trống trên MySQL
    const occupiedDb = await TableSession.findOne({
      where: {
        table_id: roomId,
        seat_number: body.seat_number,
        member_status: 'active',
      },
    });
    if (occupiedDb) {
      throw new BadRequestException('Seat already occupied.');
    }

    // Check user đang ngồi ở ghế khác
    const activeSession = await TableSession.findOne({
      where: {
        table_id: roomId,
        user_id: userId,
        member_status: 'active',
      },
    });
    if (activeSession) {
      throw new BadRequestException('User already occupies a seat.');
    }

    const isOwner = table.owner_id === userId;
    const isAutoApprove = table.auto_approve;

    if (isOwner || isAutoApprove) {
      // Case A & Option 1: Sit Directly / Auto Approve
      await this.buyIn(userId, {
        room_id: roomId,
        amount: body.buy_in_chips,
        seat_number: body.seat_number,
        custom_name: body.display_name,
      });

      return {
        auto_approved: true,
        status: 'sitting',
        message: 'Joined successfully.',
      };
    } else {
      // Case B - Option 2: Require Host Approval
      const requestId = `req_${Date.now()}_${userId}`;
      const user = await PokerTable.getRepository().manager.findOne(User, {
        where: { id: userId },
      });

      const requestData = {
        request_id: requestId,
        user_id: userId,
        username:
          body.display_name ||
          user?.user_name ||
          user?.email?.split('@')[0] ||
          'Guest',
        avatar: user?.avatar_url || '',
        seat_number: body.seat_number,
        amount: body.buy_in_chips,
        timestamp: Date.now(),
      };

      const redis = this.stateService.getRedisClient();
      await redis.hset(
        `table:${roomId}:sit-requests`,
        requestId,
        JSON.stringify(requestData),
      );

      return {
        auto_approved: false,
        status: 'pending',
        request_id: requestId,
        owner_id: table.owner_id,
        message: 'Join request has been sent.',
      };
    }
  }

  async addBotToSeat(
    roomId: string,
    body: { seat_number: number; display_name?: string; buy_in_chips?: number },
  ) {
    const seatIndex = body.seat_number;
    const existingSeat = await this.stateService.getSeat(roomId, seatIndex);
    if (existingSeat) {
      throw new BadRequestException('Ghế ngồi đã có người hoặc bot.');
    }

    const botId = `bot_${crypto.randomUUID()}`;
    const name =
      body.display_name || `Bot_${Math.floor(1000 + Math.random() * 9000)}`;
    const amt = body.buy_in_chips || 5000;

    await this.stateService.setSeat(roomId, seatIndex, {
      user_id: botId,
      username: name,
      avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(name)}`,
      stack: amt.toString(),
      current_bet: '0',
      status: 'waiting_for_next_hand',
      disconnected_at: '0',
      has_used_extra_time: '0',
      is_bot: '1',
    });

    return {
      success: true,
      bot_id: botId,
      username: name,
      seat_number: seatIndex,
      stack: amt,
    };
  }

  async removeBotFromSeat(roomId: string, seatIndex: number) {
    const seat = await this.stateService.getSeat(roomId, seatIndex);
    if (!seat) {
      throw new BadRequestException('Ghế ngồi trống.');
    }
    if (seat.is_bot !== '1') {
      throw new BadRequestException('Chỉ có thể xóa Bot bằng chức năng này.');
    }

    await this.stateService.deleteSeat(roomId, seatIndex);
    return { success: true };
  }

  async getRecentRooms(userId: string) {
    const sessions = await TableSession.createQueryBuilder('session')
      .leftJoinAndSelect('session.table', 'table')
      .where('session.user_id = :userId', { userId })
      .orderBy('session.created_at', 'DESC')
      .limit(10)
      .getMany();

    const roomsMap = new Map();
    for (const session of sessions) {
      const table = session.table;
      if (!table || !table.is_active || roomsMap.has(table.id)) continue;

      const playersCount = await TableSession.count({
        where: {
          table_id: table.id,
          member_status: 'active',
        },
      });

      roomsMap.set(table.id, {
        room_id: parseInt(table.id),
        room_name: table.name,
        max_players: table.max_players,
        current_players_count: playersCount,
        small_blind: parseInt(table.small_blind),
        big_blind: parseInt(table.big_blind),
        min_buy_in: parseInt(table.min_buyin),
        max_buy_in: parseInt(table.max_buyin),
        status: (table.status || 'waiting').toUpperCase(),
        played_at: session.created_at,
      });
    }

    return Array.from(roomsMap.values());
  }

  async getLeaderboard() {
    const wallets = await Wallet.createQueryBuilder('wallet')
      .leftJoinAndSelect('wallet.user', 'user')
      .orderBy('CAST(wallet.chips_balance AS DECIMAL)', 'DESC')
      .limit(10)
      .getMany();

    return wallets.map((w, index) => ({
      rank: index + 1,
      username: w.user?.user_name || w.user?.email?.split('@')[0] || 'Guest',
      avatar: w.user?.avatar_url || '',
      chips: w.chips_balance,
    }));
  }

  async getActivePlayers(userId: string) {
    const sessions = await TableSession.createQueryBuilder('session')
      .leftJoinAndSelect('session.user', 'user')
      .leftJoinAndSelect('session.table', 'table')
      .where('session.member_status = :status', { status: 'active' })
      .andWhere('session.user_id != :userId', { userId })
      .orderBy('session.joined_at', 'DESC')
      .limit(10)
      .getMany();

    return sessions.map((s) => ({
      user_id: s.user_id,
      username: s.user?.user_name || s.user?.email?.split('@')[0] || 'Player',
      avatar: s.user?.avatar_url || '',
      table_id: s.table_id,
      table_name: s.table?.name || 'Vegas Room',
    }));
  }
}
