import {
  Injectable,
  Logger,
  BadRequestException,
  NotFoundException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { BotProfileGenerator, BotProfile } from './bot-profile.generator';
import { BotSeatManager } from './bot-seat.manager';
import { BotActionScheduler } from '../schedulers/bot-action.scheduler';
import { BotDecisionEngine } from '../engines/bot-decision.engine';
import { AddBotDto, BotDifficulty } from '../dto/bot-config.dto';
import { PokerStateService } from '../../services/poker-state.service';
import { PokerGameService } from '../../services/poker-game.service';
import { PokerSeatState } from '../../types/poker.types';

@Injectable()
export class BotService {
  private readonly logger = new Logger(BotService.name);

  constructor(
    private readonly profileGenerator: BotProfileGenerator,
    private readonly seatManager: BotSeatManager,
    private readonly scheduler: BotActionScheduler,
    private readonly decisionEngine: BotDecisionEngine,
    private readonly stateService: PokerStateService,
    @Inject(forwardRef(() => PokerGameService))
    private readonly gameService: PokerGameService,
  ) {}

  /**
   * Thêm Bot vào phòng đấu
   */
  async addBotsToRoom(roomId: string, dto: AddBotDto): Promise<BotProfile[]> {
    const tableState = await this.stateService.getTableState(roomId);
    if (!tableState) {
      throw new NotFoundException(`Phòng chơi ${roomId} không tồn tại.`);
    }

    const count = dto.count || 1;
    const addedBots: BotProfile[] = [];
    const defaultChips =
      dto.chips || parseInt(tableState.big_blind || '100', 10) * 100;

    for (let i = 0; i < count; i++) {
      const availableSeat = await this.seatManager.findAvailableSeat(
        roomId,
        parseInt(tableState.max_seats || '9', 10),
      );
      if (!availableSeat) {
        if (addedBots.length === 0) {
          throw new BadRequestException('Bàn chơi đã đầy ghế trống.');
        }
        break;
      }

      const profile = this.profileGenerator.generateProfile(
        count === 1 ? dto.displayName : undefined,
        dto.avatar,
        dto.country,
      );

      const botSeatState: PokerSeatState = {
        seat_number: availableSeat,
        user_id: profile.id,
        username: profile.displayName,
        avatar_url: profile.avatar,
        country: profile.country,
        stack: String(defaultChips),
        current_bet: '0',
        status: 'waiting_for_next_hand',
        is_bot: '1',
        bot_difficulty: dto.difficulty || BotDifficulty.MEDIUM,
      };

      await this.stateService.setSeat(
        roomId,
        availableSeat,
        botSeatState as any,
      );
      addedBots.push(profile);
      this.logger.log(
        `[BotService] Added Bot ${profile.displayName} (Difficulty ${dto.difficulty}) to Seat ${availableSeat} in Room ${roomId}`,
      );
    }

    // Auto-ready bots so they are included in next hand start
    await this.seatManager.autoReadyBots(roomId);

    // Sync realtime cho toàn bộ client trong phòng biết có bot mới
    await this.gameService.broadcastTableState(roomId);

    return addedBots;
  }

  /**
   * Đuổi Bot khỏi phòng
   */
  async removeBotFromRoom(roomId: string, botUserId: string): Promise<boolean> {
    const seats = await this.stateService.getAllSeats(roomId);
    const targetSeat = seats.find(
      (s) => s.user_id === botUserId && s.is_bot === '1',
    );

    if (!targetSeat) {
      throw new NotFoundException('Không tìm thấy Bot chỉ định trong phòng.');
    }

    // Clear any active scheduler timers for this bot seat
    this.scheduler.cancelTimer(`${roomId}:${targetSeat.seat_number}`);

    // Remove seat from Redis
    await this.stateService.deleteSeat(roomId, targetSeat.seat_number);
    this.logger.log(
      `[BotService] Removed Bot ${targetSeat.username} (Seat ${targetSeat.seat_number}) from Room ${roomId}`,
    );
    return true;
  }

  /**
   * Xử lý khi đến lượt hành động của Bot
   */
  async handleBotTurn(roomId: string, turnSeatNumber: number) {
    const tableState = await this.stateService.getTableState(roomId);
    if (!tableState || tableState.game_stage === 'ended') return;

    const seats = await this.stateService.getAllSeats(roomId);
    const botSeat = seats.find((s) => s.seat_number === turnSeatNumber);

    if (!botSeat || botSeat.is_bot !== '1' || botSeat.status !== 'active') {
      return;
    }

    const difficulty =
      (botSeat.bot_difficulty as BotDifficulty) || BotDifficulty.MEDIUM;
    const delayMs = this.scheduler.calculateHumanThinkingDelay(difficulty);

    this.scheduler.scheduleAction(roomId, turnSeatNumber, delayMs, async () => {
      await this.executeBotDecision(roomId, turnSeatNumber, difficulty);
    });
  }

  /**
   * Tính toán và thực thi hành động của Bot
   */
  private async executeBotDecision(
    roomId: string,
    turnSeatNumber: number,
    difficulty: BotDifficulty,
  ) {
    const lockAcquired = await this.stateService.acquireLock(roomId);
    if (!lockAcquired) {
      // Retry in 500ms if lock was busy
      setTimeout(() => this.handleBotTurn(roomId, turnSeatNumber), 500);
      return;
    }

    try {
      const tableState = await this.stateService.getTableState(roomId);
      if (!tableState || tableState.game_stage === 'ended') return;
      if (parseInt(tableState.current_turn_seat || '0', 10) !== turnSeatNumber)
        return;

      const seats = await this.stateService.getAllSeats(roomId);
      const botSeat = seats.find((s) => s.seat_number === turnSeatNumber);
      if (!botSeat || botSeat.is_bot !== '1' || botSeat.status !== 'active')
        return;

      const pocketCards = await this.stateService.getPlayerCards(
        roomId,
        botSeat.user_id,
      );
      const communityCards = tableState.community_cards
        ? tableState.community_cards.split(',')
        : [];

      const decision = this.decisionEngine.decideAction(difficulty, {
        roomId,
        botSeatNumber: turnSeatNumber,
        botSeat,
        allSeats: seats,
        tableState,
        pocketCards,
        communityCards,
        currentHighestBet: parseInt(tableState.current_highest_bet || '0', 10),
        currentBotBet: parseInt(String(botSeat.current_bet || '0'), 10),
        bigBlindAmount: parseInt(tableState.big_blind || '100', 10),
        potSize: parseInt(tableState.main_pot || '0', 10),
        gameStage: tableState.game_stage || 'preflop',
      });

      this.logger.log(
        `[BotService] Bot ${botSeat.username} (Seat ${turnSeatNumber}, Diff ${difficulty}) executed: ${decision.action.toUpperCase()} (${decision.amount} chips) - Reason: ${decision.reason}`,
      );

      await this.gameService.processPlayerAction(
        roomId,
        turnSeatNumber,
        decision.action,
        decision.amount,
      );
    } catch (err: any) {
      this.logger.error(
        `[BotService] Failed to execute bot action: ${err.message}`,
      );
    } finally {
      await this.stateService.releaseLock(roomId);
    }
  }
}
