import {
  Logger,
  UseGuards,
  UsePipes,
  ValidationPipe,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { OnEvent } from '@nestjs/event-emitter';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { PokerTable } from '../entities/poker_table.entity';
import { User } from '../entities/user.entity';
import { TableSession } from '../entities/table_session.entity';
import { Wallet } from '../entities/wallet.entity';
import { PokerLobbyService } from '../services/poker-lobby.service';
import { PokerStateService } from '../services/poker-state.service';
import { PokerGameService } from '../services/poker-game.service';
import { BotService } from '../bots/services/bot.service';
import { corsOriginFn } from '../../config/cors.config';
import { Throttle } from '@nestjs/throttler';
import { CustomThrottlerGuard } from '../../common/guards/custom-throttler.guard';

@WebSocketGateway({
  cors: {
    origin: corsOriginFn,
    credentials: true,
  },
  transports: ['websocket'],
  pingInterval: 25000,
  pingTimeout: 60000,
})
@UsePipes(
  new ValidationPipe({
    transform: true,
    whitelist: true,
  }),
)
@UseGuards(CustomThrottlerGuard)
@Throttle({ default: { limit: 20, ttl: 60000 } }) // 20 actions / minute max for web sockets
export class PokerLobbyGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private logger = new Logger(PokerLobbyGateway.name);
  private statsInterval: NodeJS.Timeout;

  constructor(
    private readonly lobbyService: PokerLobbyService,
    private readonly stateService: PokerStateService,
    private readonly jwtService: JwtService,
    private readonly gameService: PokerGameService,
    @Inject(forwardRef(() => BotService))
    private readonly botService: BotService,
  ) {}

  afterInit(server: Server) {
    this.logger.log('PokerLobbyGateway Initialized');
    this.gameService.setServer(server);

    // Broadcast stats định kỳ sảnh chờ mỗi 8 giây
    this.statsInterval = setInterval(async () => {
      try {
        const stats = await this.lobbyService.getLobbyStats();
        this.server.to('lobby_channel').emit('lobby:stats-update', stats);
      } catch (err) {
        this.logger.error(`Error broadcasting lobby stats: ${err.message}`);
      }
    }, 8000);
  }

  @OnEvent('user.session.revoked')
  async handleUserSessionRevoked(payload: {
    userId: string;
    sessionId: string;
  }) {
    this.logger.log(`[SESSION EVENT] Revoking user session: ${payload.userId}`);
    if (!this.server) return;
    try {
      const sockets = await this.server
        .in(`user_${payload.userId}`)
        .fetchSockets();
      for (const socket of sockets) {
        socket.emit('auth:force_logout', {
          message: 'Phiên đăng nhập của bạn đã bị thu hồi bởi quản trị viên.',
        });
        socket.disconnect(true);
      }
    } catch (err) {
      this.logger.error(`Error in handleUserSessionRevoked: ${err.message}`);
    }
  }

  @OnEvent('poker.seat.sit_out')
  handleSeatSitOut(payload: {
    roomId: string;
    userId: string;
    seatNumber: number;
  }) {
    if (!this.server) return;
    this.server.to(`table_${payload.roomId}`).emit('table:player-sat-out', {
      seat_number: payload.seatNumber,
      user_id: payload.userId,
      status: 'sitting_out',
    });
    this.logger.log(
      `[SIT-OUT] User ${payload.userId} at seat ${payload.seatNumber} on table ${payload.roomId}`,
    );
  }

  @OnEvent('poker.seat.sit_back')
  handleSeatSitBack(payload: {
    roomId: string;
    userId: string;
    seatNumber: number;
    status: string;
  }) {
    if (!this.server) return;
    this.server.to(`table_${payload.roomId}`).emit('table:player-sat-back', {
      seat_number: payload.seatNumber,
      user_id: payload.userId,
      status: payload.status,
    });
    this.logger.log(
      `[SIT-BACK] User ${payload.userId} at seat ${payload.seatNumber} → status: ${payload.status} on table ${payload.roomId}`,
    );
  }

  async handleConnection(client: Socket) {
    try {
      const token =
        client.handshake.auth?.token ||
        client.handshake.query?.token ||
        client.handshake.headers?.authorization?.split(' ')[1];

      if (!token) {
        throw new Error('Không tìm thấy Token xác thực.');
      }

      const decoded = this.jwtService.verify(token);
      client.data.user = { id: decoded.sub };
      await client.join(`user_${decoded.sub}`);
      this.logger.log(
        `Socket Client connected: ${client.id} (User: ${decoded.sub})`,
      );
    } catch (err) {
      const isExpired =
        err.name === 'TokenExpiredError' || err.message?.includes('expired');
      if (isExpired) {
        this.logger.warn(
          `Socket Connection rejected: JWT expired for client ${client.id}`,
        );
      } else {
        this.logger.error(`SOCKET CONNECTION AUTH ERROR: ${err.message}`);
      }

      client.emit('auth:error', {
        code: isExpired ? 'JWT_EXPIRED' : 'AUTH_FAILED',
        message: 'Xác thực Socket thất bại: ' + err.message,
      });
      client.disconnect(true);
    }
  }

  async handleDisconnect(client: Socket) {
    this.logger.log(
      `Client disconnected: ${client.id} (IP: ${this.getClientIp(client)})`,
    );
    this.lobbyService.removeLobbySubscriber(client.id);

    const userId = client.data?.user?.id;
    if (!userId) return;

    // Kiểm tra xem người dùng còn socket nào khác (ví dụ mở nhiều tab) không
    const remainingSockets = await this.server
      .in(`user_${userId}`)
      .fetchSockets();
    const isFullyDisconnected = remainingSockets.length === 0;

    // Sử dụng subscribedRooms tự quản lý thay vì client.rooms đã bị xoá
    const subscribedRooms: Set<string> = client.data?.subscribedRooms;
    if (subscribedRooms) {
      for (const roomId of subscribedRooms) {
        if (isFullyDisconnected) {
          await this.gameService.handlePlayerConnectionLost(roomId, userId);
        }

        // Kiểm tra xem phòng còn ai kết nối không
        this.gameService.checkAndStartEmptyRoomTimer(roomId);
      }
    }
  }

  /**
   * Đăng ký sảnh chờ
   */
  @SubscribeMessage('lobby:subscribe')
  async handleLobbySubscribe(@ConnectedSocket() client: Socket) {
    try {
      client.join('lobby_channel');
      const userId = client.data?.user?.id;
      this.lobbyService.addLobbySubscriber(client.id, userId);
      const stats = await this.lobbyService.getLobbyStats();
      client.emit('lobby:stats-update', stats);
    } catch (err) {
      client.emit('error', { message: 'Lỗi đăng ký sảnh chờ: ' + err.message });
    }
  }

  /**
   * Đăng ký phòng chơi / Bàn đấu (Subscriber/Spectator)
   */
  @SubscribeMessage('table:subscribe')
  async handleTableSubscribe(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { room_id: string },
  ) {
    const roomId = data.room_id;
    const userId = client.data?.user?.id;

    if (!roomId) {
      client.emit('error', { message: 'room_id là bắt buộc' });
      return;
    }

    client.join(`table_${roomId}`);

    // Theo dõi room để xử lý khi disconnect
    if (!client.data.subscribedRooms) {
      client.data.subscribedRooms = new Set<string>();
    }
    client.data.subscribedRooms.add(roomId);

    this.logger.log(`Socket ${client.id} subscribed to table_${roomId}`);

    if (userId) {
      await client.join(`user_${userId}`);
      this.gameService.cancelEmptyRoomTimer(roomId); // Có người reconnect -> hủy Empty Room Timer
      this.gameService.cancelDisconnectTimeout(roomId, userId);

      // Khôi phục trạng thái active nếu đang disconnected trên Redis
      const seats = await this.stateService.getAllSeats(roomId);
      const mySeat = seats.find((s) => s.user_id === userId);
      if (mySeat && mySeat.disconnected_at && mySeat.disconnected_at !== '0') {
        const updateData: Record<string, string> = { disconnected_at: '0' };
        if (mySeat.status === 'disconnected') {
          updateData.status = 'active';
        }
        await this.stateService.setSeat(roomId, mySeat.seat_number, updateData);

        this.server.to(`table_${roomId}`).emit('table:player-reconnected', {
          user_id: userId,
          seat_number: mySeat.seat_number,
        });
      }

      // Gửi riêng bài tẩy bảo mật cho Hero
      const myCards = await this.stateService.getPlayerCards(roomId, userId);
      if (myCards.length > 0) {
        client.emit('table:private-cards', { pocket_cards: myCards });
      }
    }

    // Broadcast trạng thái mới nhất cho người dùng mới
    await this.gameService.broadcastTableState(roomId);
  }

  /**

  /**
   * Client gửi Hành động (Fold, Check, Call, Raise, All-in)
   */
  @SubscribeMessage('table:action')
  async handleTableAction(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    data: { room_id: string; action_type: string; amount?: number },
  ) {
    const roomId = data.room_id;
    const userId = client.data?.user?.id;

    if (!roomId || !userId) return;

    // Distributed lock để tránh cược đè
    const lockAcquired = await this.stateService.acquireLock(roomId);
    if (!lockAcquired) {
      client.emit('error', {
        message: 'Hệ thống đang xử lý cược, vui lòng thử lại.',
      });
      return;
    }

    try {
      const tableState = await this.stateService.getTableState(roomId);
      if (!tableState) {
        throw new Error('Không tìm thấy thông tin bàn chơi.');
      }

      const seats = await this.stateService.getAllSeats(roomId);
      const currentTurnSeat = parseInt(tableState.current_turn_seat);
      const activeSeat = seats.find((s) => s.seat_number === currentTurnSeat);
      if (!activeSeat || activeSeat.user_id !== userId) {
        throw new Error('Chưa tới lượt hành động của bạn.');
      }

      // Reset số lần timeout liên tiếp về 0 khi có hành động thủ công hợp lệ
      const statsKey = `table:${roomId}:player:${userId}:stats`;
      const redisClient = this.stateService.getRedisClient();
      await redisClient.hset(statsKey, 'consecutive_timeouts', '0');

      // Xử lý hành động cược
      await this.gameService.processPlayerAction(
        roomId,
        currentTurnSeat,
        data.action_type,
        data.amount || 0,
      );
    } catch (err) {
      client.emit('error', { message: err.message });
      await this.gameService.broadcastTableState(roomId);
    } finally {
      await this.stateService.releaseLock(roomId);
    }
  }

  /**
   * Client xin thêm thời gian suy nghĩ (+30s)
   */
  @SubscribeMessage('table:extra-time:request')
  async handleExtraTimeRequest(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { room_id: string },
  ) {
    const roomId = data.room_id;
    const userId = client.data?.user?.id;
    if (!roomId || !userId) return;

    try {
      const tableState = await this.stateService.getTableState(roomId);
      const currentTurnSeat = parseInt(tableState?.current_turn_seat || '0');

      const seats = await this.stateService.getAllSeats(roomId);
      const activeSeat = seats.find((s) => s.seat_number === currentTurnSeat);

      if (!activeSeat || activeSeat.user_id !== userId) {
        throw new Error('Chưa tới lượt hành động của bạn.');
      }

      if (activeSeat.has_used_extra_time === '1') {
        throw new Error('Bạn đã sử dụng lượt Extra Time trong ván này rồi.');
      }

      // Cập nhật đã dùng Extra time
      await this.stateService.setSeat(roomId, currentTurnSeat, {
        has_used_extra_time: '1',
      });

      // Gia hạn timer hành động lên 30s
      this.gameService.startActionTimer(roomId, currentTurnSeat, 30);

      this.server.to(`table_${roomId}`).emit('table:extra-time-activated', {
        seat_number: currentTurnSeat,
        extra_seconds: 30,
      });
    } catch (err) {
      client.emit('error', { message: err.message });
    }
  }

  private getClientIp(socket: Socket): string {
    const forwarded = socket.handshake.headers['x-forwarded-for'];
    if (forwarded) {
      const ip = Array.isArray(forwarded)
        ? forwarded[0]
        : forwarded.split(',')[0];
      return ip.trim();
    }
    return socket.handshake.address;
  }

  private getClassCSubnet(ip: string): string {
    if (ip === '::1' || ip === '127.0.0.1') return '127.0.0.1';
    const parts = ip.split('.');
    if (parts.length >= 3) {
      return `${parts[0]}.${parts[1]}.${parts[2]}`;
    }
    return ip;
  }

  /**
   * Client gửi Yêu cầu xin ngồi vào ghế (Spectator -> Host approval)
   */
  @SubscribeMessage('table:request-sit')
  async handleRequestSit(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    data: { room_id: string; seat_number: number; amount: number },
  ) {
    const roomId = data.room_id;
    const userId = client.data?.user?.id;
    if (!roomId || !userId) return;

    try {
      const table = await PokerTable.findOne({
        where: { id: roomId, is_active: true },
      });
      if (!table) {
        throw new Error('Bàn chơi không tồn tại.');
      }

      if (data.seat_number < 1 || data.seat_number > table.max_players) {
        throw new Error('Vị trí ghế không hợp lệ.');
      }

      // Check tournament late registration
      if (
        table.mode === 'TOURNAMENT' &&
        table.tournament_settings?.late_registration_minutes
      ) {
        if (table.tournament_settings.start_time) {
          const startTimeMs = new Date(
            table.tournament_settings.start_time,
          ).getTime();
          const lateRegMs =
            table.tournament_settings.late_registration_minutes * 60000;
          if (Date.now() > startTimeMs + lateRegMs) {
            throw new Error(
              'Giải đấu đã hết hạn đăng ký muộn (Late Registration).',
            );
          }
        }
      }

      // Check ghế trống trên Redis
      const existingSeat = await this.stateService.getSeat(
        roomId,
        data.seat_number,
      );
      if (existingSeat) {
        throw new Error('Ghế này đã có người ngồi.');
      }

      // Check ghế trống trên MySQL
      const occupiedDb = await TableSession.findOne({
        where: {
          table_id: roomId,
          seat_number: data.seat_number,
          member_status: 'active',
        },
      });
      if (occupiedDb) {
        throw new Error('Ghế này đã có người ngồi.');
      }

      const min = BigInt(table.min_buyin);
      const max = BigInt(table.max_buyin);
      const amt = BigInt(data.amount);

      if (amt < min || amt > max) {
        throw new Error(`Số tiền buy-in phải từ ${min} đến ${max} chip.`);
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
        throw new Error('Bạn đang ngồi tại một ghế khác ở bàn này.');
      }

      // Check wallet balance
      const wallet = await Wallet.findOne({ where: { user_id: userId } });
      if (!wallet || BigInt(wallet.chips_balance) < amt) {
        throw new Error('Số dư chips không đủ.');
      }

      const userIp = this.getClientIp(client);
      const userSubnet = this.getClassCSubnet(userIp);

      const antiCollusionLevel =
        table.custom_settings?.anti_collusion_level || 'LOW';

      if (
        antiCollusionLevel !== 'LOW' &&
        userIp !== '127.0.0.1' &&
        userIp !== '::1'
      ) {
        const seats = await this.stateService.getAllSeats(roomId);
        for (const seat of seats) {
          if (seat.is_bot === '1') continue;
          const seatIp = seat.ip || '127.0.0.1';
          if (seatIp !== '127.0.0.1' && seatIp !== '::1') {
            if (antiCollusionLevel === 'HIGH') {
              const seatSubnet = this.getClassCSubnet(String(seatIp));
              if (seatSubnet === userSubnet) {
                throw new Error(
                  'Địa chỉ IP (cùng đường truyền) của bạn bị trùng lặp với người chơi khác tại bàn này (Chống thông đồng Mức Cao).',
                );
              }
            } else if (antiCollusionLevel === 'MEDIUM') {
              if (seatIp === userIp) {
                throw new Error(
                  'Địa chỉ IP của bạn bị trùng lặp với người chơi khác tại bàn này (Chống thông đồng Mức Trung).',
                );
              }
            }
          }
        }
      }

      // Lấy username & avatar của user
      const user = await PokerTable.getRepository().manager.findOne(User, {
        where: { id: userId },
      });

      const requestId = `req_${Date.now()}_${userId}`;
      const requestData = {
        request_id: requestId,
        user_id: userId,
        username: user?.user_name || user?.email?.split('@')[0] || 'Guest',
        avatar: user?.avatar_url || '',
        seat_number: data.seat_number,
        amount: data.amount,
        timestamp: Date.now(),
        ip: userIp,
      };

      const redis = this.stateService.getRedisClient();
      await redis.hset(
        `table:${roomId}:sit-requests`,
        requestId,
        JSON.stringify(requestData),
      );

      // Broadcast sự kiện cập nhật danh sách yêu cầu
      await this.gameService.broadcastSitRequests(roomId);

      client.emit('table:sit-request-submitted', {
        success: true,
        request_id: requestId,
      });
    } catch (err) {
      client.emit('error', { message: err.message });
    }
  }

  /**
   * Host phản hồi yêu cầu xin ngồi vào ghế (Chấp nhận / Từ chối)
   */
  @SubscribeMessage('table:respond-sit')
  async handleRespondSit(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    data: { room_id: string; request_id: string; approve: boolean },
  ) {
    const roomId = data.room_id;
    const userId = client.data?.user?.id;
    if (!roomId || !userId) return;

    try {
      const table = await PokerTable.findOne({
        where: { id: roomId, is_active: true },
      });
      if (!table) {
        throw new Error('Bàn chơi không tồn tại.');
      }

      if (table.owner_id !== userId) {
        throw new Error('Chỉ chủ phòng mới có quyền phê duyệt yêu cầu.');
      }

      const redis = this.stateService.getRedisClient();
      const requestStr = await redis.hget(
        `table:${roomId}:sit-requests`,
        data.request_id,
      );
      if (!requestStr) {
        throw new Error('Yêu cầu không tồn tại hoặc đã hết hạn.');
      }

      const request = JSON.parse(requestStr);

      if (data.approve) {
        // Thực hiện Buy-in
        await this.lobbyService.buyIn(request.user_id, {
          room_id: roomId,
          amount: request.amount,
          seat_number: request.seat_number,
          ip: request.ip,
        });

        // Gửi sự kiện thành công riêng cho người xin
        this.server.to(`user_${request.user_id}`).emit('table:sit-approved', {
          seat_number: request.seat_number,
          amount: request.amount,
        });

        // Broadcast trạng thái bàn mới
        await this.gameService.broadcastTableState(roomId);

        // Auto-start game if enough players are seated
        await this.gameService.checkAndNotifyWaitingState(roomId);
      } else {
        // Gửi sự kiện từ chối
        this.server.to(`user_${request.user_id}`).emit('table:sit-declined', {
          seat_number: request.seat_number,
          reason: 'Yêu cầu của bạn bị chủ phòng từ chối.',
        });
      }

      // Xóa yêu cầu khỏi Redis
      await redis.hdel(`table:${roomId}:sit-requests`, data.request_id);

      // Broadcast cập nhật danh sách yêu cầu mới
      await this.gameService.broadcastSitRequests(roomId);
    } catch (err) {
      client.emit('error', { message: err.message });
    }
  }

  /**
   * Lấy danh sách yêu cầu ngồi (dành cho chủ phòng khi mới join)
   */
  @SubscribeMessage('table:get-sit-requests')
  async handleGetSitRequests(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { room_id: string },
  ) {
    const roomId = data.room_id;
    if (!roomId) return;
    try {
      const redis = this.stateService.getRedisClient();
      const requestsRaw = await redis.hgetall(`table:${roomId}:sit-requests`);
      const list = Object.values(requestsRaw).map((v) => JSON.parse(v));
      client.emit('table:sit-requests-list', { requests: list });
    } catch (err) {
      client.emit('error', { message: err.message });
    }
  }

  /**
   * Host bắt đầu ván bài mới (Start Game)
   */
  @SubscribeMessage('table:start-game')
  async handleStartGame(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { room_id: string; client_seed?: string },
  ) {
    const roomId = data.room_id;
    const userId = client.data?.user?.id;

    console.log(`User ${userId} trying to start game on table ${roomId}`);

    if (!roomId || !userId) return;

    try {
      const table = await PokerTable.findOne({
        where: { id: roomId, is_active: true },
      });
      if (!table) {
        throw new Error('Bàn chơi không tồn tại.');
      }

      if (table.owner_id !== userId) {
        throw new Error('Chỉ chủ phòng mới có quyền bắt đầu ván đấu.');
      }

      if (table.status === 'paused') {
        throw new Error('Phòng đang được tạm dừng, không thể bắt đầu ván mới.');
      }

      const tableState = await this.stateService.getTableState(roomId);
      const stage = tableState?.game_stage || 'waiting';
      if (stage !== 'waiting' && stage !== 'ended') {
        throw new Error('Ván bài đã bắt đầu rồi.');
      }

      const seats = await this.stateService.getAllSeats(roomId);
      const readyPlayers = seats.filter(
        (s) =>
          (s.status === 'active' ||
            s.status === 'waiting_for_next_hand' ||
            s.status === 'ready' ||
            s.status === 'sitting') &&
          parseInt(s.stack) > 0,
      );

      if (readyPlayers.length < 2) {
        throw new Error(
          'Cần tối thiểu 2 người chơi có phỉnh để bắt đầu ván bài.',
        );
      }

      await this.gameService.startNewHand(roomId, data.client_seed);
    } catch (err) {
      client.emit('error', { message: err.message });
    }
  }

  @SubscribeMessage('table:set-client-seed')
  async handleSetClientSeed(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { room_id: string; client_seed: string },
  ) {
    const roomId = data.room_id;
    const userId = client.data?.user?.id;
    if (!roomId || !userId || !data.client_seed) return;

    try {
      const seats = await this.stateService.getAllSeats(roomId);
      const isPlayer = seats.some((s) => s.user_id === userId);
      if (!isPlayer) {
        throw new Error('Bạn không phải là người chơi trong bàn này.');
      }

      await this.stateService.setTableState(roomId, {
        next_client_seed: data.client_seed,
      });

      client.emit('table:client-seed-updated', {
        client_seed: data.client_seed,
      });
    } catch (err) {
      client.emit('error', { message: err.message });
    }
  }

  /**
   * Client gửi tin nhắn Chat trong bàn chơi
   */
  @SubscribeMessage('table:chat-message')
  async handleChatMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { room_id: string; message: string },
  ) {
    const roomId = data.room_id;
    const userId = client.data?.user?.id;
    if (!roomId || !userId || !data.message?.trim()) return;

    try {
      const table = await PokerTable.findOne({
        where: { id: roomId, is_active: true },
      });
      if (!table) throw new Error('Bàn chơi không tồn tại.');

      const allowChat = table.custom_settings?.allow_chat !== false;
      if (!allowChat) {
        client.emit('error', { message: 'Chủ phòng đã tắt tính năng chat.' });
        return;
      }

      const seats = await this.stateService.getAllSeats(roomId);
      const senderSeat = seats.find((s) => s.user_id === userId);
      const senderUser = await User.findOne({ where: { id: userId } });

      const payload = {
        user_id: userId,
        username: senderUser ? senderUser.user_name : 'Khán giả',
        avatar:
          senderUser?.avatar_url ||
          `https://api.dicebear.com/7.x/adventurer/svg?seed=${senderUser?.user_name || 'spectator'}`,
        seat_number: senderSeat ? senderSeat.seat_number : null,
        message: data.message.trim(),
        timestamp: Date.now(),
      };

      await this.stateService.pushChatMessage(roomId, JSON.stringify(payload));

      this.server
        .to(`table_${roomId}`)
        .emit('table:chat-message-received', payload);
    } catch (err) {
      client.emit('error', { message: err.message });
    }
  }

  @SubscribeMessage('table:rit-vote')
  async handleRitVote(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { room_id: string; agree: boolean },
  ) {
    const roomId = data.room_id;
    const userId = client.data?.user?.id;
    if (!roomId || !userId) return;

    const lockAcquired = await this.stateService.acquireLock(roomId);
    if (!lockAcquired) {
      client.emit('error', { message: 'Hệ thống đang bận, vui lòng thử lại.' });
      return;
    }

    try {
      const tableState = await this.stateService.getTableState(roomId);
      if (
        !tableState ||
        !tableState.rit_voters ||
        tableState.rit_voters === 'completed'
      ) {
        return;
      }

      const voters = tableState.rit_voters.split(',');
      if (!voters.includes(userId)) {
        throw new Error('Bạn không có quyền biểu quyết RIT.');
      }

      if (data.agree) {
        const yesVotes = tableState.rit_votes_yes
          ? tableState.rit_votes_yes.split(',')
          : [];
        if (!yesVotes.includes(userId)) {
          yesVotes.push(userId);
          await this.stateService.setTableState(roomId, {
            rit_votes_yes: yesVotes.join(','),
          });
        }
      } else {
        const noVotes = tableState.rit_votes_no
          ? tableState.rit_votes_no.split(',')
          : [];
        if (!noVotes.includes(userId)) {
          noVotes.push(userId);
          await this.stateService.setTableState(roomId, {
            rit_votes_no: noVotes.join(','),
          });
        }
      }

      const updatedState = await this.stateService.getTableState(roomId);
      const yesVotesNew = updatedState.rit_votes_yes
        ? updatedState.rit_votes_yes.split(',')
        : [];
      const noVotesNew = updatedState.rit_votes_no
        ? updatedState.rit_votes_no.split(',')
        : [];
      const totalVoted = yesVotesNew.length + noVotesNew.length;

      this.server.to(`table_${roomId}`).emit('table:rit-vote-updated', {
        yes_count: yesVotesNew.length,
        no_count: noVotesNew.length,
        total_voters: voters.length,
      });

      if (totalVoted >= voters.length) {
        await this.stateService.releaseLock(roomId);
        await this.gameService.finalizeRitVoting(roomId);
        return;
      }
    } catch (err) {
      client.emit('error', { message: err.message });
    } finally {
      await this.stateService.releaseLock(roomId);
    }
  }

  @SubscribeMessage('table:set-muck')
  async handleSetMuck(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { room_id: string; muck: boolean },
  ) {
    const roomId = data.room_id;
    const userId = client.data?.user?.id;
    if (!roomId || !userId) return;

    try {
      const seats = await this.stateService.getAllSeats(roomId);
      const seat = seats.find((s) => s.user_id === userId);
      if (seat) {
        await this.stateService.setSeat(roomId, seat.seat_number, {
          muck_cards: data.muck ? '1' : '0',
        });
        await this.gameService.broadcastTableState(roomId);
      }
    } catch (err) {
      client.emit('error', { message: err.message });
    }
  }

  @SubscribeMessage('table:rabbit-hunt')
  async handleRabbitHunt(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { room_id: string },
  ) {
    const roomId = data.room_id;
    const userId = client.data?.user?.id;
    if (!roomId || !userId) return;

    try {
      const dbTable = await PokerTable.findOne({ where: { id: roomId } });
      if (!dbTable || !dbTable.custom_settings?.allow_rabbit_hunt) {
        throw new Error('Tính năng Rabbit Hunting không được bật ở bàn này.');
      }

      const tableState = await this.stateService.getTableState(roomId);
      if (!tableState || tableState.game_stage !== 'ended') {
        throw new Error('Chỉ có thể săn thỏ khi ván đấu đã kết thúc.');
      }

      const deck = await this.stateService.getDeck(roomId);
      if (!deck || deck.length === 0) {
        throw new Error('Không còn lá bài nào trong bộ bài.');
      }

      const community = tableState.community_cards
        ? tableState.community_cards.split(',')
        : [];
      const cardsNeeded = 5 - community.length;
      if (cardsNeeded <= 0) {
        throw new Error('Đã chia đủ bài chung.');
      }

      const rabbitCards = deck.slice(0, cardsNeeded);

      this.server.to(`table_${roomId}`).emit('table:rabbit-cards', {
        user_id: userId,
        rabbit_cards: rabbitCards,
      });
    } catch (err) {
      client.emit('error', { message: err.message });
    }
  }

  /**
   * Client lấy lịch sử Chat trong bàn chơi (phục vụ cuộn vô hạn)
   */
  @SubscribeMessage('table:get-chat-history')
  async handleGetChatHistory(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { room_id: string; offset: number; limit: number },
  ) {
    const roomId = data.room_id;
    const userId = client.data?.user?.id;
    if (!roomId || !userId) return;

    try {
      const offset = Number(data.offset) || 0;
      const limit = Number(data.limit) || 20;
      const historyJson = await this.stateService.getChatHistory(
        roomId,
        offset,
        limit,
      );
      const history = historyJson.map((h) => JSON.parse(h));

      client.emit('table:chat-history-loaded', {
        room_id: roomId,
        history,
        offset,
        limit,
        hasMore: history.length === limit,
      });
    } catch (err) {
      client.emit('error', { message: err.message });
    }
  }

  /**
   * Client ném vật phẩm (Throwable Item / Emotes)
   */
  @SubscribeMessage('table:throwable-item')
  async handleThrowableItem(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    data: { room_id: string; item_id: string; target_seat: number },
  ) {
    const roomId = data.room_id;
    const userId = client.data?.user?.id;
    if (!roomId || !userId || !data.item_id) return;

    try {
      const table = await PokerTable.findOne({
        where: { id: roomId, is_active: true },
      });
      if (!table) throw new Error('Bàn chơi không tồn tại.');

      const allowEmotes = table.custom_settings?.allow_emotes !== false;
      if (!allowEmotes) {
        client.emit('error', {
          message: 'Chủ phòng đã tắt tính năng ném vật phẩm.',
        });
        return;
      }

      const seats = await this.stateService.getAllSeats(roomId);
      const senderSeat = seats.find((s) => s.user_id === userId);
      if (!senderSeat) {
        throw new Error('Bạn không ngồi trong bàn để ném vật phẩm.');
      }

      const payload = {
        sender_seat: senderSeat.seat_number,
        target_seat: data.target_seat,
        item_id: data.item_id,
        timestamp: Date.now(),
      };

      this.server
        .to(`table_${roomId}`)
        .emit('table:throwable-item-received', payload);
    } catch (err) {
      client.emit('error', { message: err.message });
    }
  }

  @SubscribeMessage('add_bot')
  async handleAddBot(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    data: {
      roomId: string;
      count?: number;
      difficulty?: any;
      displayName?: string;
      avatar?: string;
      country?: string;
      chips?: number;
    },
  ) {
    try {
      const bots = await this.botService.addBotsToRoom(data.roomId, {
        count: data.count || 1,
        difficulty: data.difficulty,
        displayName: data.displayName,
        avatar: data.avatar,
        country: data.country,
        chips: data.chips,
      });

      await this.gameService.broadcastTableState(data.roomId);
      client.emit('bot_added_success', { count: bots.length, bots });
    } catch (err: any) {
      client.emit('error', { message: err.message });
    }
  }

  @SubscribeMessage('remove_bot')
  async handleRemoveBot(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { roomId: string; botUserId: string },
  ) {
    try {
      await this.botService.removeBotFromRoom(data.roomId, data.botUserId);
      await this.gameService.broadcastTableState(data.roomId);
      client.emit('bot_removed_success', { botUserId: data.botUserId });
    } catch (err: any) {
      client.emit('error', { message: err.message });
    }
  }
}
