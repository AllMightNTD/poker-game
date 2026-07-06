import { Logger, UsePipes, ValidationPipe } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
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
import { corsOriginFn } from '../../config/cors.config';

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
export class PokerLobbyGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private logger = new Logger(PokerLobbyGateway.name);
  private statsInterval: NodeJS.Timeout;


  constructor(
    private readonly lobbyService: PokerLobbyService,
    private readonly stateService: PokerStateService,
    private readonly jwtService: JwtService,
    private readonly gameService: PokerGameService,
  ) { }

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
      this.logger.log(`Socket Client connected: ${client.id} (User: ${decoded.sub})`);
    } catch (err) {
      this.logger.error(`SOCKET CONNECTION AUTH ERROR: ${err.message}`);
      client.emit('error', { message: 'Xác thực Socket thất bại: ' + err.message });
      client.disconnect();
    }
  }

  async handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id} (IP: ${this.getClientIp(client)})`);
    this.lobbyService.removeLobbySubscriber(client.id);

    const userId = client.data?.user?.id;
    if (!userId) return;

    // Kiểm tra xem người dùng còn socket nào khác (ví dụ mở nhiều tab) không
    const remainingSockets = await this.server.in(`user_${userId}`).fetchSockets();
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
      this.lobbyService.addLobbySubscriber(client.id);
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
      const mySeat = seats.find(s => s.user_id === userId);
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
    @MessageBody() data: { room_id: string; action_type: string; amount?: number },
  ) {
    const roomId = data.room_id;
    const userId = client.data?.user?.id;

    if (!roomId || !userId) return;

    // Distributed lock để tránh cược đè
    const lockAcquired = await this.stateService.acquireLock(roomId);
    if (!lockAcquired) {
      client.emit('error', { message: 'Hệ thống đang xử lý cược, vui lòng thử lại.' });
      return;
    }

    try {
      const tableState = await this.stateService.getTableState(roomId);
      if (!tableState) {
        throw new Error('Không tìm thấy thông tin bàn chơi.');
      }

      const seats = await this.stateService.getAllSeats(roomId);
      const currentTurnSeat = parseInt(tableState.current_turn_seat);
      const activeSeat = seats.find(s => s.seat_number === currentTurnSeat);
      if (!activeSeat || activeSeat.user_id !== userId) {
        throw new Error('Chưa tới lượt hành động của bạn.');
      }

      // Reset số lần timeout liên tiếp về 0 khi có hành động thủ công hợp lệ
      const statsKey = `table:${roomId}:player:${userId}:stats`;
      const redisClient = this.stateService.getRedisClient();
      await redisClient.hset(statsKey, 'consecutive_timeouts', '0');

      // Xử lý hành động cược
      await this.gameService.processPlayerAction(roomId, currentTurnSeat, data.action_type, data.amount || 0);
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
      const activeSeat = seats.find(s => s.seat_number === currentTurnSeat);

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
      const ip = Array.isArray(forwarded) ? forwarded[0] : forwarded.split(',')[0];
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
    @MessageBody() data: { room_id: string; seat_number: number; amount: number },
  ) {
    const roomId = data.room_id;
    const userId = client.data?.user?.id;
    if (!roomId || !userId) return;

    try {
      const table = await PokerTable.findOne({ where: { id: roomId, is_active: true } });
      if (!table) {
        throw new Error('Bàn chơi không tồn tại.');
      }

      if (data.seat_number < 1 || data.seat_number > table.max_players) {
        throw new Error('Vị trí ghế không hợp lệ.');
      }

      // Check ghế trống trên Redis
      const existingSeat = await this.stateService.getSeat(roomId, data.seat_number);
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

      if (userIp !== '127.0.0.1' && userIp !== '::1') {
        const seats = await this.stateService.getAllSeats(roomId);
        for (const seat of seats) {
          if (seat.is_bot === '1') continue;
          const seatIp = seat.ip || '127.0.0.1';
          if (seatIp !== '127.0.0.1' && seatIp !== '::1') {
            const seatSubnet = this.getClassCSubnet(String(seatIp));
            if (seatSubnet === userSubnet) {
              throw new Error('Địa chỉ IP hoặc đường truyền của bạn bị trùng lặp với người chơi khác tại bàn này (Chống thông đồng).');
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
      await redis.hset(`table:${roomId}:sit-requests`, requestId, JSON.stringify(requestData));

      // Broadcast sự kiện cập nhật danh sách yêu cầu
      await this.gameService.broadcastSitRequests(roomId);

      client.emit('table:sit-request-submitted', { success: true, request_id: requestId });
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
    @MessageBody() data: { room_id: string; request_id: string; approve: boolean },
  ) {
    const roomId = data.room_id;
    const userId = client.data?.user?.id;
    if (!roomId || !userId) return;

    try {
      const table = await PokerTable.findOne({ where: { id: roomId, is_active: true } });
      if (!table) {
        throw new Error('Bàn chơi không tồn tại.');
      }

      if (table.owner_id !== userId) {
        throw new Error('Chỉ chủ phòng mới có quyền phê duyệt yêu cầu.');
      }

      const redis = this.stateService.getRedisClient();
      const requestStr = await redis.hget(`table:${roomId}:sit-requests`, data.request_id);
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
      const list = Object.values(requestsRaw).map(v => JSON.parse(v));
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
      const table = await PokerTable.findOne({ where: { id: roomId, is_active: true } });
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
      const readyPlayers = seats.filter(s => (s.status === 'active' || s.status === 'waiting_for_next_hand') && parseInt(s.stack) > 0);

      if (readyPlayers.length < 2) {
        throw new Error('Cần tối thiểu 2 người chơi có phỉnh để bắt đầu ván bài.');
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
      const isPlayer = seats.some(s => s.user_id === userId);
      if (!isPlayer) {
        throw new Error('Bạn không phải là người chơi trong bàn này.');
      }

      await this.stateService.setTableState(roomId, {
        next_client_seed: data.client_seed,
      });

      client.emit('table:client-seed-updated', { client_seed: data.client_seed });
    } catch (err) {
      client.emit('error', { message: err.message });
    }
  }
}
