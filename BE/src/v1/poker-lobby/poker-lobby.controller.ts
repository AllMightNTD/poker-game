import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  Headers,
  Request,
  UseGuards,
  HttpCode,
  HttpStatus,
  Param,
  Res,
} from '@nestjs/common';
import { AuthGuard } from '../guards/auth.guard';
import { PokerLobbyService } from './poker-lobby.service';
import { Response } from 'express';

/**
 * Controller: Sảnh (Lobby stats)
 * Route: /api/v1/lobby/*
 */
@Controller('v1/lobby')
@UseGuards(AuthGuard)
export class LobbyController {
  constructor(private readonly lobbyService: PokerLobbyService) {}

  @Get('stats')
  async getStats() {
    return this.lobbyService.getLobbyStats();
  }
}

/**
 * Controller: Ví / Nhận Chips (Wallet operations)
 * Route: /api/v1/wallet/*
 */
@Controller('v1/wallet')
@UseGuards(AuthGuard)
export class WalletController {
  constructor(private readonly lobbyService: PokerLobbyService) {}

  @Post('free-chips')
  @HttpCode(HttpStatus.OK)
  async getFreeChips(
    @Request() req,
    @Headers('x-idempotency-key') idempotencyKey: string,
  ) {
    const userId = req.user.sub;
    return this.lobbyService.claimFreeChips(userId, idempotencyKey);
  }
}

/**
 * Controller: Người chơi (User operations)
 * Route: /api/v1/user/*
 */
@Controller('v1/user')
@UseGuards(AuthGuard)
export class UserController {
  constructor(private readonly lobbyService: PokerLobbyService) {}

  @Get('chips')
  async getChips(@Request() req) {
    const userId = req.user.sub;
    return this.lobbyService.getUserChips(userId);
  }
}

/**
 * Controller: Bàn chơi / Bộ lọc (Rooms & actions)
 * Route: /api/v1/rooms/*
 */
@Controller('v1/rooms')
@UseGuards(AuthGuard)
export class RoomsController {
  constructor(private readonly lobbyService: PokerLobbyService) {}

  @Get()
  async getRooms(
    @Query('search_name') searchName?: string,
    @Query('blind_category') blindCategory?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.lobbyService.getRooms({
      search_name: searchName,
      blind_category: blindCategory,
      page,
      limit,
    });
  }

  @Post('join-request')
  @HttpCode(HttpStatus.OK)
  async joinRequest(@Request() req, @Body('room_id') roomId: string) {
    const userId = req.user.sub;
    return this.lobbyService.joinRoomRequest(userId, roomId);
  }

  @Post('spectate')
  @HttpCode(HttpStatus.OK)
  async spectate(@Request() req, @Body('room_id') roomId: string) {
    const userId = req.user.sub;
    return this.lobbyService.spectateRoom(userId, roomId);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createRoom(@Request() req, @Body() body: any) {
    const userId = req.user.sub;
    return this.lobbyService.createRoom(userId, body);
  }

  @Post('buy-in')
  @HttpCode(HttpStatus.OK)
  async buyIn(
    @Request() req,
    @Body() body: { room_id: string; amount: number; seat_number: number },
  ) {
    const userId = req.user.sub;
    return this.lobbyService.buyIn(userId, body);
  }

  @Post('sit-action')
  @HttpCode(HttpStatus.OK)
  async sitAction(
    @Request() req,
    @Body() body: { room_id: string; action: 'sit_out' | 'sit_back' },
  ) {
    const userId = req.user.sub;
    return this.lobbyService.sitAction(userId, body);
  }

  @Post('leave')
  @HttpCode(HttpStatus.OK)
  async leave(@Request() req, @Body('room_id') roomId: string) {
    const userId = req.user.sub;
    return this.lobbyService.leaveRoom(userId, roomId);
  }

  @Post(':id/config')
  @HttpCode(HttpStatus.OK)
  async updateConfig(
    @Request() req,
    @Param('id') id: string,
    @Body() body: { small_blind: number },
  ) {
    const userId = req.user.sub;
    return this.lobbyService.updateRoomConfig(userId, id, body);
  }

  @Post(':id/kick')
  @HttpCode(HttpStatus.OK)
  async kickPlayer(
    @Request() req,
    @Param('id') id: string,
    @Body() body: { target_user_id: string },
  ) {
    const userId = req.user.sub;
    return this.lobbyService.kickPlayer(userId, id, body.target_user_id);
  }

  @Post(':id/force-sit-out')
  @HttpCode(HttpStatus.OK)
  async forceSitOut(
    @Request() req,
    @Param('id') id: string,
    @Body() body: { target_user_id: string },
  ) {
    const userId = req.user.sub;
    return this.lobbyService.forceSitOut(userId, id, body.target_user_id);
  }

  @Post(':id/modify-stack')
  @HttpCode(HttpStatus.OK)
  async modifyStack(
    @Request() req,
    @Param('id') id: string,
    @Body() body: { target_user_id: string; action: 'add' | 'subtract'; amount: number },
  ) {
    const userId = req.user.sub;
    return this.lobbyService.modifyStack(userId, id, body);
  }

  @Get(':id/stats')
  async getTableStats(@Request() req, @Param('id') id: string) {
    const userId = req.user.sub;
    return this.lobbyService.getTableStats(userId, id);
  }

  @Get(':id/stats/export')
  async exportTableStats(
    @Request() req,
    @Param('id') id: string,
    @Res() res: Response,
  ) {
    const userId = req.user.sub;
    return this.lobbyService.exportTableStats(userId, id, res);
  }
}

