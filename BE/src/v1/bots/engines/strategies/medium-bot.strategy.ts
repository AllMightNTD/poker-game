import { Injectable } from '@nestjs/common';
import {
  BotDecisionContext,
  BotDecisionResult,
  IBotStrategy,
} from './bot-strategy.interface';
import { PokerBotAI } from '../../../engines/poker-bot.ai';
import { PotOddsCalculator } from '../utils/pot-odds.calculator';

@Injectable()
export class MediumBotStrategy implements IBotStrategy {
  decide(ctx: BotDecisionContext): BotDecisionResult {
    const callAmount = ctx.currentHighestBet - ctx.currentBotBet;
    const handStrength = PokerBotAI.getHandStrength(
      ctx.pocketCards,
      ctx.communityCards,
    );
    const botStack = parseInt(ctx.botSeat.stack || '0', 10);
    const potOdds = PotOddsCalculator.calculatePotOdds(ctx.potSize, callAmount);

    // Occasional Bluff (15% probability)
    const isBluff =
      Math.random() < 0.15 && ctx.gameStage !== 'preflop' && callAmount === 0;
    if (isBluff) {
      const bluffAmt = Math.min(botStack, Math.floor(ctx.potSize * 0.5));
      if (bluffAmt > 0) {
        return {
          action: 'raise',
          amount: bluffAmt,
          reason: 'Medium: Half-Pot Bluff',
        };
      }
    }

    if (handStrength >= 0.75) {
      const raiseAmt = Math.min(
        botStack,
        ctx.currentHighestBet > 0
          ? ctx.currentHighestBet * 3
          : ctx.bigBlindAmount * 3,
      );
      return {
        action: 'raise',
        amount: raiseAmt,
        reason: 'Medium: Value Raise',
      };
    } else if (handStrength >= 0.5) {
      if (callAmount === 0) {
        return { action: 'check', amount: 0, reason: 'Medium: Solid Check' };
      }
      // If handStrength is better than required pot odds, call
      if (handStrength >= potOdds) {
        return { action: 'call', amount: 0, reason: 'Medium: Pot Odds Call' };
      }
      return { action: 'fold', amount: 0, reason: 'Medium: Bad Pot Odds Fold' };
    } else if (handStrength >= 0.3) {
      if (callAmount === 0) {
        return { action: 'check', amount: 0, reason: 'Medium: Weak Check' };
      }
      if (potOdds < 0.2 && callAmount <= ctx.bigBlindAmount * 2) {
        return { action: 'call', amount: 0, reason: 'Medium: Cheap Call' };
      }
      return { action: 'fold', amount: 0, reason: 'Medium: Fold' };
    } else {
      return callAmount === 0
        ? { action: 'check', amount: 0, reason: 'Medium: Free Check' }
        : { action: 'fold', amount: 0, reason: 'Medium: Fold Trash' };
    }
  }
}
