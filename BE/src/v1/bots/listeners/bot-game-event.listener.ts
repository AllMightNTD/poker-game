import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { BotService } from '../services/bot.service';
import { BotSeatManager } from '../services/bot-seat.manager';
import { BotActionScheduler } from '../schedulers/bot-action.scheduler';

export interface TurnChangedEvent {
  roomId: string;
  turnSeatNumber: number;
}

export interface GameStartedEvent {
  roomId: string;
}

export interface HandEndedEvent {
  roomId: string;
}

export interface RoomResetEvent {
  roomId: string;
}

@Injectable()
export class BotGameEventListener {
  private readonly logger = new Logger(BotGameEventListener.name);

  constructor(
    private readonly botService: BotService,
    private readonly seatManager: BotSeatManager,
    private readonly scheduler: BotActionScheduler,
  ) {}

  @OnEvent('poker.turn_changed')
  async handleTurnChanged(event: TurnChangedEvent) {
    this.logger.debug(
      `[BotEventListener] Turn changed event received for Room ${event.roomId}, Seat ${event.turnSeatNumber}`,
    );
    await this.botService.handleBotTurn(event.roomId, event.turnSeatNumber);
  }

  @OnEvent('poker.hand_ended')
  async handleHandEnded(event: HandEndedEvent) {
    this.logger.debug(
      `[BotEventListener] Hand ended event received for Room ${event.roomId}`,
    );
    // Auto-rebuy any broke bots and auto-ready them for next hand
    await this.seatManager.autoRebuyBots(event.roomId);
    await this.seatManager.autoReadyBots(event.roomId);
  }

  @OnEvent('poker.room_reset')
  async handleRoomReset(event: RoomResetEvent) {
    this.logger.debug(
      `[BotEventListener] Room reset event received for Room ${event.roomId}`,
    );
    this.scheduler.cancelAllRoomTimers(event.roomId);
  }
}
