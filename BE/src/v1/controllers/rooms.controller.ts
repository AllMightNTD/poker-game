import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  Request,
  UseGuards,
  HttpCode,
  HttpStatus,
  Param,
  Res,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { AuthGuard } from '../guards/auth.guard';
import { PokerLobbyService } from '../services/poker-lobby.service';
import { PokerLobbyGateway } from '../gateways/poker-lobby.gateway';
import { PokerGameService } from '../services/poker-game.service';
import { Response } from 'express';
import { PokerTable } from '../entities/poker_table.entity';
import { CreateRoomDto } from '../dto/create-room.dto';

const Auth401 = () =>
  ApiResponse({ status: 401, description: 'Chưa đăng nhập' });
const NotFound404 = () =>
  ApiResponse({ status: 404, description: 'Không tìm thấy tài nguyên' });
const BadRequest400 = () =>
  ApiResponse({ status: 400, description: 'Dữ liệu không hợp lệ' });

@ApiTags('🃏 Rooms')
@ApiBearerAuth('access-token')
@Controller('rooms')
@UseGuards(AuthGuard)
export class RoomsController {
  constructor(
    private readonly lobbyService: PokerLobbyService,
    private readonly lobbyGateway: PokerLobbyGateway,
    private readonly gameService: PokerGameService,
  ) {}

  @Get()
  @ApiOperation({
    summary: 'Danh sách phòng',
    description: 'Lấy danh sách bàn chơi với bộ lọc và phân trang offset.',
  })
  @ApiQuery({
    name: 'search_name',
    required: false,
    type: String,
    description: 'Tìm theo tên phòng',
  })
  @ApiQuery({
    name: 'blind_category',
    required: false,
    enum: ['all', 'micro', 'low', 'medium', 'high'],
    description: 'Lọc theo mức Big Blind',
  })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: ['all', 'waiting', 'running', 'paused', 'closed'],
    description: 'Lọc theo trạng thái phòng',
  })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 20 })
  @ApiResponse({
    status: 200,
    description: 'Danh sách phòng',
    schema: {
      example: {
        rooms: [
          {
            room_id: 1,
            room_name: 'High Roller',
            max_players: 9,
            current_players_count: 4,
            small_blind: 500,
            big_blind: 1000,
            min_buy_in: 20000,
            max_buy_in: 100000,
            status: 'RUNNING',
          },
        ],
        total: 42,
        page: 1,
        limit: 20,
      },
    },
  })
  async getRooms(
    @Query('search_name') searchName?: string,
    @Query('blind_category') blindCategory?: string,
    @Query('status') status?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('show_private') showPrivate?: string,
  ) {
    return this.lobbyService.getRooms({
      search_name: searchName,
      blind_category: blindCategory,
      status,
      page,
      limit,
      show_private: showPrivate,
    });
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Tạo phòng mới',
    description:
      'Tạo bàn chơi mới. Hỗ trợ mode CUSTOM (chơi tự do) và TOURNAMENT (giải đấu).',
  })
  @ApiBody({
    schema: {
      example: {
        room_name: 'Bàn VIP 1',
        game_type: 'NLH',
        mode: 'CUSTOM',
        max_players: 6,
        small_blind: 500,
        min_buy_in: 20000,
        max_buy_in: 100000,
        turn_time_limit: 20,
        time_bank: 30,
        custom_settings: {
          table_visibility: 'PRIVATE',
          password: 'vip',
          allow_rebuy: true,
          table_timeout_action: 'AUTO_FOLD',
          allow_chat: true,
          allow_emotes: true,
          max_spectators: 10,
          max_waiting_list: 5,
          anti_collusion_level: 'MEDIUM',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Phòng được tạo thành công',
    schema: {
      example: {
        success: true,
        room_id: 42,
        room_name: 'Bàn VIP 1',
        small_blind: 500,
        big_blind: 1000,
        max_players: 6,
        min_buy_in: 20000,
        max_buy_in: 100000,
        current_players_count: 0,
      },
    },
  })
  @BadRequest400()
  @Auth401()
  async createRoom(@Request() req, @Body() body: CreateRoomDto) {
    return this.lobbyService.createRoom(req.user.sub, body);
  }

  @Post(':roomId/seats/join')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Ngồi vào ghế',
    description:
      'Ngồi vào ghế chỉ định và thực hiện buy-in. Nếu phòng bật auto-approve hoặc là chủ phòng → ngồi ngay. Ngược lại → gửi yêu cầu chờ chủ phòng duyệt.',
  })
  @ApiParam({ name: 'roomId', type: String, description: 'ID của phòng' })
  @ApiBody({
    schema: {
      example: {
        seat_number: 3,
        display_name: 'PokerKing99',
        buy_in_chips: 50000,
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Kết quả ngồi ghế',
    schema: {
      example: {
        auto_approved: true,
        status: 'sitting',
        message: 'Joined successfully.',
      },
    },
  })
  @BadRequest400()
  @Auth401()
  @NotFound404()
  async joinSeat(
    @Request() req,
    @Param('roomId') roomId: string,
    @Body()
    body: { seat_number: number; display_name: string; buy_in_chips: number },
  ) {
    const userId = req.user.sub;
    const result = await this.lobbyService.joinSeat(userId, roomId, body);
    if (result.auto_approved) {
      this.lobbyGateway.server.to(`table_${roomId}`).emit('user_joined_seat', {
        room_id: Number(roomId),
        seat_number: body.seat_number,
        user_id: Number(userId),
        display_name: body.display_name,
        chips: body.buy_in_chips,
      });
      await this.gameService.syncRoomState(roomId);
    } else {
      this.lobbyGateway.server
        .to(`table_${roomId}`)
        .emit('join_request_created', {
          request_id: result.request_id,
          seat_number: body.seat_number,
          display_name: body.display_name,
          buy_in_chips: body.buy_in_chips,
        });
      await this.gameService.broadcastSitRequests(roomId);
    }
    return result;
  }

  @Post('join-request')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Kiểm tra điều kiện vào phòng',
    description:
      'Kiểm tra điều kiện (chips tối thiểu, chỗ trống) trước khi buy-in.',
  })
  @ApiBody({ schema: { example: { room_id: '42' } } })
  @ApiResponse({
    status: 200,
    description: 'Đủ điều kiện vào phòng',
    schema: {
      example: {
        success: true,
        room_id: '42',
        room_name: 'High Roller VIP',
        min_buy_in: '20000',
        max_buy_in: '200000',
        chips_balance: '55000000',
      },
    },
  })
  @BadRequest400()
  @Auth401()
  @NotFound404()
  async joinRequest(@Request() req, @Body('room_id') roomId: string) {
    return this.lobbyService.joinRoomRequest(req.user.sub, roomId);
  }

  @Post('spectate')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Xem bàn chơi (Spectate)',
    description: 'Vào phòng với tư cách khán giả, không cần chips.',
  })
  @ApiBody({ schema: { example: { room_id: '42' } } })
  @ApiResponse({
    status: 200,
    description: 'Vào xem thành công',
    schema: {
      example: { success: true, room_id: '42', room_name: 'High Roller VIP' },
    },
  })
  @Auth401()
  @NotFound404()
  async spectate(@Request() req, @Body('room_id') roomId: string) {
    return this.lobbyService.spectateRoom(req.user.sub, roomId);
  }

  @Post('buy-in')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Nạp chips vào bàn (Buy-in)',
    description:
      'Trừ chips từ ví chính và đặt vào ghế. Sử dụng transaction + pessimistic lock.',
  })
  @ApiBody({
    schema: {
      example: {
        room_id: '42',
        amount: 50000,
        seat_number: 3,
        custom_name: 'PokerKing99',
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Buy-in thành công',
    schema: {
      example: {
        success: true,
        session_id: 'uuid',
        current_stack: '50000',
        seat_number: 3,
      },
    },
  })
  @BadRequest400()
  @Auth401()
  @NotFound404()
  async buyIn(
    @Request() req,
    @Body()
    body: {
      room_id: string;
      amount: number;
      seat_number: number;
      custom_name?: string;
    },
  ) {
    const result = await this.lobbyService.buyIn(req.user.sub, body);
    await this.gameService.syncRoomState(body.room_id);
    return result;
  }

  @Post('sit-action')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Sit-out / Sit-back',
    description:
      'Chuyển trạng thái ngồi nghỉ (sit_out) hoặc quay lại chơi (sit_back).',
  })
  @ApiBody({ schema: { example: { room_id: '42', action: 'sit_out' } } })
  @ApiResponse({
    status: 200,
    description: 'Thay đổi trạng thái thành công',
    schema: { example: { success: true, status: 'sitting_out' } },
  })
  @BadRequest400()
  @Auth401()
  @NotFound404()
  async sitAction(
    @Request() req,
    @Body() body: { room_id: string; action: 'sit_out' | 'sit_back' },
  ) {
    const result = await this.lobbyService.sitAction(req.user.sub, body);
    await this.gameService.syncRoomState(body.room_id);
    return result;
  }

  @Post('leave')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Rời bàn (Cashout)',
    description:
      'Đọc stack từ Redis, hoàn trả chips về ví chính và cập nhật DB. Sử dụng Distributed Lock.',
  })
  @ApiBody({ schema: { example: { room_id: '42' } } })
  @ApiResponse({
    status: 200,
    description: 'Rời bàn thành công',
    schema: {
      example: {
        success: true,
        refunded_amount: '62500',
        new_wallet_balance: '62500000',
      },
    },
  })
  @BadRequest400()
  @Auth401()
  @NotFound404()
  async leave(@Request() req, @Body('room_id') roomId: string) {
    const userId = req.user.sub;
    const result = await this.lobbyService.leaveRoom(userId, roomId);
    this.gameService.cancelDisconnectTimeout(roomId, userId);
    await this.gameService.syncRoomState(roomId);
    this.gameService.checkAndStartEmptyRoomTimer(roomId);
    return result;
  }

  @Post(':id/config')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Cập nhật cấu hình phòng (Chủ phòng)',
    description:
      'Thay đổi mức Small/Big Blind và giới hạn buy-in. Ghi AuditLog nguyên tử.',
  })
  @ApiParam({ name: 'id', type: String, description: 'ID của phòng' })
  @ApiBody({ schema: { example: { small_blind: 1000 } } })
  @ApiResponse({
    status: 200,
    description: 'Cập nhật thành công',
    schema: { example: { success: true, small_blind: 1000, big_blind: 2000 } },
  })
  @BadRequest400()
  @Auth401()
  @NotFound404()
  async updateConfig(
    @Request() req,
    @Param('id') id: string,
    @Body() body: { small_blind: number },
  ) {
    return this.lobbyService.updateRoomConfig(req.user.sub, id, body);
  }

  @Post(':id/pause')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Tạm dừng / Tiếp tục phòng (Chủ phòng)',
    description: 'Bật/tắt chế độ tạm dừng ván đấu.',
  })
  @ApiParam({ name: 'id', type: String, description: 'ID của phòng' })
  @ApiBody({ schema: { example: { paused: true } } })
  @ApiResponse({
    status: 200,
    description: 'Thay đổi trạng thái thành công',
    schema: { example: { success: true, status: 'paused' } },
  })
  @BadRequest400()
  @Auth401()
  @NotFound404()
  async togglePause(
    @Request() req,
    @Param('id') id: string,
    @Body() body: { paused: boolean },
  ) {
    const result = await this.lobbyService.toggleRoomPause(
      req.user.sub,
      id,
      body.paused,
    );
    await this.gameService.broadcastLobbyRoomStatus(id);
    this.lobbyGateway.server
      .to(`table_${id}`)
      .emit('table:status-changed', { status: result.status });
    if (!body.paused) await this.gameService.checkAndNotifyWaitingState(id);
    return result;
  }

  @Post(':id/kick')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Kick người chơi (Chủ phòng)',
    description: 'Buộc người chơi rời bàn và cashout. Ghi AuditLog.',
  })
  @ApiParam({ name: 'id', type: String, description: 'ID của phòng' })
  @ApiBody({ schema: { example: { target_user_id: 'user-uuid' } } })
  @ApiResponse({
    status: 200,
    description: 'Kick thành công',
    schema: { example: { success: true } },
  })
  @BadRequest400()
  @Auth401()
  @NotFound404()
  async kickPlayer(
    @Request() req,
    @Param('id') id: string,
    @Body() body: { target_user_id: string },
  ) {
    const result = await this.lobbyService.kickPlayer(
      req.user.sub,
      id,
      body.target_user_id,
    );
    this.gameService.cancelDisconnectTimeout(id, body.target_user_id);
    await this.gameService.syncRoomState(id);
    this.gameService.checkAndStartEmptyRoomTimer(id);
    return result;
  }

  @Post(':id/force-sit-out')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Cưỡng chế Sit-out (Chủ phòng)',
    description: 'Ép người chơi sang trạng thái sit-out.',
  })
  @ApiParam({ name: 'id', type: String, description: 'ID của phòng' })
  @ApiBody({ schema: { example: { target_user_id: 'user-uuid' } } })
  @ApiResponse({
    status: 200,
    description: 'Thành công',
    schema: { example: { success: true } },
  })
  @BadRequest400()
  @Auth401()
  @NotFound404()
  async forceSitOut(
    @Request() req,
    @Param('id') id: string,
    @Body() body: { target_user_id: string },
  ) {
    const result = await this.lobbyService.forceSitOut(
      req.user.sub,
      id,
      body.target_user_id,
    );
    await this.gameService.syncRoomState(id);
    return result;
  }

  @Post(':id/modify-stack')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Sửa đổi stack người chơi (Chủ phòng)',
    description:
      'Cộng hoặc trừ chips trực tiếp cho người chơi. Dùng pessimistic lock + ghi AuditLog.',
  })
  @ApiParam({ name: 'id', type: String, description: 'ID của phòng' })
  @ApiBody({
    schema: {
      example: { target_user_id: 'user-uuid', action: 'add', amount: 10000 },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Sửa stack thành công',
    schema: { example: { success: true, new_stack: '60000' } },
  })
  @BadRequest400()
  @Auth401()
  @NotFound404()
  async modifyStack(
    @Request() req,
    @Param('id') id: string,
    @Body()
    body: {
      target_user_id: string;
      action: 'add' | 'subtract';
      amount: number;
    },
  ) {
    return this.lobbyService.modifyStack(req.user.sub, id, body);
  }

  @Get(':id/stats')
  @ApiOperation({
    summary: 'Thống kê P&L toàn bàn',
    description:
      'Xem báo cáo lãi/lỗ của từng người chơi tại bàn (mua vào, rút ra, chip hiện tại).',
  })
  @ApiParam({ name: 'id', type: String, description: 'ID của phòng' })
  @ApiResponse({
    status: 200,
    description: 'Thống kê thành công',
    schema: {
      example: {
        room_id: '42',
        room_name: 'High Roller VIP',
        players: [
          {
            user_id: 'uuid',
            username: 'PokerKing99',
            seat_number: 3,
            status: 'active',
            purchase_count: 50000,
            cashout_chips: 0,
            current_chips: 62500,
            net_pnl: 12500,
          },
        ],
      },
    },
  })
  @Auth401()
  @NotFound404()
  async getTableStats(@Request() req, @Param('id') id: string) {
    return this.lobbyService.getTableStats(req.user.sub, id);
  }

  @Get(':id/stats/export')
  @ApiOperation({
    summary: 'Xuất CSV thống kê P&L',
    description:
      'Tải file CSV thống kê toàn bộ người chơi tại bàn. Hỗ trợ UTF-8 BOM để hiển thị đúng tiếng Việt trên Excel.',
  })
  @ApiParam({ name: 'id', type: String, description: 'ID của phòng' })
  @ApiResponse({
    status: 200,
    description: 'File CSV',
    content: { 'text/csv': { schema: { type: 'string', format: 'binary' } } },
  })
  @Auth401()
  @NotFound404()
  async exportTableStats(
    @Request() req,
    @Param('id') id: string,
    @Res() res: Response,
  ) {
    return this.lobbyService.exportTableStats(req.user.sub, id, res);
  }

  @Post(':roomId/bots/add')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Thêm Bot vào ghế (Chủ phòng)',
    description: 'Thêm một Bot AI vào ghế trống để lấp đầy bàn.',
  })
  @ApiParam({ name: 'roomId', type: String, description: 'ID của phòng' })
  @ApiBody({
    schema: {
      example: { seat_number: 7, display_name: 'BotAlpha', buy_in_chips: 5000 },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Bot được thêm thành công',
    schema: {
      example: {
        success: true,
        bot_id: 'bot_uuid',
        username: 'BotAlpha',
        seat_number: 7,
        stack: 5000,
      },
    },
  })
  @BadRequest400()
  @Auth401()
  async addBot(
    @Request() req,
    @Param('roomId') roomId: string,
    @Body()
    body: { seat_number: number; display_name?: string; buy_in_chips?: number },
  ) {
    const userId = req.user.sub;
    const table = await PokerTable.findOne({
      where: { id: roomId, is_active: true },
    });
    if (!table || table.owner_id !== userId)
      throw new Error('Bàn chơi không tồn tại hoặc không có quyền.');
    const result = await this.lobbyService.addBotToSeat(roomId, body);
    await this.gameService.syncRoomState(roomId);
    return result;
  }

  @Post(':roomId/bots/remove')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Xóa Bot khỏi ghế (Chủ phòng)',
    description: 'Xóa một Bot AI khỏi ghế đang ngồi.',
  })
  @ApiParam({ name: 'roomId', type: String, description: 'ID của phòng' })
  @ApiBody({ schema: { example: { seat_number: 7 } } })
  @ApiResponse({
    status: 200,
    description: 'Bot được xóa thành công',
    schema: { example: { success: true } },
  })
  @BadRequest400()
  @Auth401()
  async removeBot(
    @Request() req,
    @Param('roomId') roomId: string,
    @Body() body: { seat_number: number },
  ) {
    const userId = req.user.sub;
    const table = await PokerTable.findOne({
      where: { id: roomId, is_active: true },
    });
    if (!table || table.owner_id !== userId)
      throw new Error('Bàn chơi không tồn tại hoặc không có quyền.');
    const result = await this.lobbyService.removeBotFromSeat(
      roomId,
      body.seat_number,
    );
    await this.gameService.syncRoomState(roomId);
    return result;
  }
}
