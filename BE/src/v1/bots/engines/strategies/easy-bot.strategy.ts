import { Injectable } from '@nestjs/common';
import {
  BotDecisionContext,
  BotDecisionResult,
  IBotStrategy,
} from './bot-strategy.interface';
import { PokerBotAI } from '../../../engines/poker-bot.ai';

@Injectable()
export class EasyBotStrategy implements IBotStrategy {
  decide(ctx: BotDecisionContext): BotDecisionResult {
    const callAmount = ctx.currentHighestBet - ctx.currentBotBet;
    const handStrength = PokerBotAI.getHandStrength(
      ctx.pocketCards,
      ctx.communityCards,
    );
    const botStack = parseInt(ctx.botSeat.stack || '0', 10);

    // Easy AI has 35% intentional mistake / random choice factor
    const isMistake = Math.random() < 0.35;

    if (isMistake) {
      if (callAmount === 0) {
        if (Math.random() < 0.7) {
          return { action: 'check', amount: 0, reason: 'Easy: Passive Check' };
        } else {
          const smallBet = Math.min(botStack, ctx.bigBlindAmount * 2);
          return {
            action: 'raise',
            amount: smallBet,
            reason: 'Easy: Random Small Bet',
          };
        }
      } else {
        if (Math.random() < 0.6) {
          return { action: 'call', amount: 0, reason: 'Easy: Calling mistake' };
        } else {
          return { action: 'fold', amount: 0, reason: 'Easy: Passive Fold' };
        }
      }
    }

    // Standard Easy decision logic
    if (handStrength >= 0.8) {
      const raiseAmt = Math.min(
        botStack,
        Math.max(ctx.bigBlindAmount * 2, ctx.currentHighestBet * 2),
      );
      return {
        action: 'raise',
        amount: raiseAmt,
        reason: 'Easy: Strong Hand Bet',
      };
    } else if (handStrength >= 0.4) {
      return callAmount === 0
        ? { action: 'check', amount: 0, reason: 'Easy: Medium Hand Check' }
        : { action: 'call', amount: 0, reason: 'Easy: Medium Hand Call' };
    } else {
      return callAmount === 0
        ? { action: 'check', amount: 0, reason: 'Easy: Weak Hand Check' }
        : { action: 'fold', amount: 0, reason: 'Easy: Weak Hand Fold' };
    }
  }
}
