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
import { AuthGuard } from '../../guards/auth.guard';
import { PokerLobbyService } from '../poker-lobby.service';
import { PokerLobbyGateway } from '../poker-lobby.gateway';
import { PokerGameService } from '../poker-game.service';
import { Response } from 'express';
import { PokerTable } from '../../entities/poker_table.entity';

@Controller('v1/rooms')
@UseGuards(AuthGuard)
export class RoomsController {
  constructor(
    private readonly lobbyService: PokerLobbyService,
    private readonly lobbyGateway: PokerLobbyGateway,
    private readonly gameService: PokerGameService,
  ) {}

  @Post(':roomId/seats/join')
  @HttpCode(HttpStatus.OK)
  async joinSeat(
    @Request() req,
    @Param('roomId') roomId: string,
    @Body() body: { seat_number: number; display_name: string; buy_in_chips: number },
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
      this.lobbyGateway.server.to(`table_${roomId}`).emit('join_request_created', {
        request_id: result.request_id,
        seat_number: body.seat_number,
        display_name: body.display_name,
        buy_in_chips: body.buy_in_chips,
      });
      await this.gameService.broadcastSitRequests(roomId);
    }

    return result;
  }

  @Get()
  async getRooms(
    @Query('search_name') searchName?: string,
    @Query('blind_category') blindCategory?: string,
    @Query('status') status?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.lobbyService.getRooms({ search_name: searchName, blind_category: blindCategory, status, page, limit });
  }

  @Post('join-request')
  @HttpCode(HttpStatus.OK)
  async joinRequest(@Request() req, @Body('room_id') roomId: string) {
    return this.lobbyService.joinRoomRequest(req.user.sub, roomId);
  }

  @Post('spectate')
  @HttpCode(HttpStatus.OK)
  async spectate(@Request() req, @Body('room_id') roomId: string) {
    return this.lobbyService.spectateRoom(req.user.sub, roomId);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createRoom(@Request() req, @Body() body: any) {
    return this.lobbyService.createRoom(req.user.sub, body);
  }

  @Post('buy-in')
  @HttpCode(HttpStatus.OK)
  async buyIn(@Request() req, @Body() body: { room_id: string; amount: number; seat_number: number; custom_name?: string }) {
    const result = await this.lobbyService.buyIn(req.user.sub, body);
    await this.gameService.syncRoomState(body.room_id);
    return result;
  }

  @Post('sit-action')
  @HttpCode(HttpStatus.OK)
  async sitAction(@Request() req, @Body() body: { room_id: string; action: 'sit_out' | 'sit_back' }) {
    const result = await this.lobbyService.sitAction(req.user.sub, body);
    await this.gameService.syncRoomState(body.room_id);
    return result;
  }

  @Post('leave')
  @HttpCode(HttpStatus.OK)
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
  async updateConfig(@Request() req, @Param('id') id: string, @Body() body: { small_blind: number }) {
    return this.lobbyService.updateRoomConfig(req.user.sub, id, body);
  }

  @Post(':id/pause')
  @HttpCode(HttpStatus.OK)
  async togglePause(@Request() req, @Param('id') id: string, @Body() body: { paused: boolean }) {
    const result = await this.lobbyService.toggleRoomPause(req.user.sub, id, body.paused);
    
    await this.gameService.broadcastLobbyRoomStatus(id);
    this.lobbyGateway.server.to(`table_${id}`).emit('table:status-changed', { status: result.status });

    if (!body.paused) {
      await this.gameService.checkAndNotifyWaitingState(id);
    }
    return result;
  }

  @Post(':id/kick')
  @HttpCode(HttpStatus.OK)
  async kickPlayer(@Request() req, @Param('id') id: string, @Body() body: { target_user_id: string }) {
    const result = await this.lobbyService.kickPlayer(req.user.sub, id, body.target_user_id);

    this.gameService.cancelDisconnectTimeout(id, body.target_user_id);
    await this.gameService.syncRoomState(id);
    this.gameService.checkAndStartEmptyRoomTimer(id);

    return result;
  }

  @Post(':id/force-sit-out')
  @HttpCode(HttpStatus.OK)
  async forceSitOut(@Request() req, @Param('id') id: string, @Body() body: { target_user_id: string }) {
    const result = await this.lobbyService.forceSitOut(req.user.sub, id, body.target_user_id);
    await this.gameService.syncRoomState(id);
    return result;
  }

  @Post(':id/modify-stack')
  @HttpCode(HttpStatus.OK)
  async modifyStack(@Request() req, @Param('id') id: string, @Body() body: { target_user_id: string; action: 'add' | 'subtract'; amount: number }) {
    return this.lobbyService.modifyStack(req.user.sub, id, body);
  }

  @Get(':id/stats')
  async getTableStats(@Request() req, @Param('id') id: string) {
    return this.lobbyService.getTableStats(req.user.sub, id);
  }

  @Get(':id/stats/export')
  async exportTableStats(@Request() req, @Param('id') id: string, @Res() res: Response) {
    return this.lobbyService.exportTableStats(req.user.sub, id, res);
  }

  @Post(':roomId/bots/add')
  @HttpCode(HttpStatus.OK)
  async addBot(@Request() req, @Param('roomId') roomId: string, @Body() body: { seat_number: number; display_name?: string; buy_in_chips?: number }) {
    const userId = req.user.sub;
    const table = await PokerTable.findOne({ where: { id: roomId, is_active: true } });
    if (!table || table.owner_id !== userId) throw new Error('Bàn chơi không tồn tại hoặc không có quyền.');

    const result = await this.lobbyService.addBotToSeat(roomId, body);
    await this.gameService.syncRoomState(roomId);
    return result;
  }

  @Post(':roomId/bots/remove')
  @HttpCode(HttpStatus.OK)
  async removeBot(@Request() req, @Param('roomId') roomId: string, @Body() body: { seat_number: number }) {
    const userId = req.user.sub;
    const table = await PokerTable.findOne({ where: { id: roomId, is_active: true } });
    if (!table || table.owner_id !== userId) throw new Error('Bàn chơi không tồn tại hoặc không có quyền.');

    const result = await this.lobbyService.removeBotFromSeat(roomId, body.seat_number);
    await this.gameService.syncRoomState(roomId);
    return result;
  }
}
