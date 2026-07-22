import { Injectable } from '@nestjs/common';
import { BotDifficulty } from '../dto/bot-config.dto';
import { EasyBotStrategy } from './strategies/easy-bot.strategy';
import { MediumBotStrategy } from './strategies/medium-bot.strategy';
import { HardBotStrategy } from './strategies/hard-bot.strategy';
import {
  BotDecisionContext,
  BotDecisionResult,
} from './strategies/bot-strategy.interface';

@Injectable()
export class BotDecisionEngine {
  constructor(
    private readonly easyStrategy: EasyBotStrategy,
    private readonly mediumStrategy: MediumBotStrategy,
    private readonly hardStrategy: HardBotStrategy,
  ) {}

  decideAction(
    difficulty: BotDifficulty,
    context: BotDecisionContext,
  ): BotDecisionResult {
    switch (difficulty) {
      case BotDifficulty.EASY:
        return this.easyStrategy.decide(context);
      case BotDifficulty.HARD:
        return this.hardStrategy.decide(context);
      case BotDifficulty.MEDIUM:
      default:
        return this.mediumStrategy.decide(context);
    }
  }
}
