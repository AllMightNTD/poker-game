import { Injectable } from '@nestjs/common';
import {
  BotDecisionContext,
  BotDecisionResult,
  IBotStrategy,
} from './bot-strategy.interface';
import { PokerBotAI } from '../../../engines/poker-bot.ai';
import { PotOddsCalculator } from '../utils/pot-odds.calculator';
import { EVCalculator } from '../utils/ev.calculator';

@Injectable()
export class HardBotStrategy implements IBotStrategy {
  decide(ctx: BotDecisionContext): BotDecisionResult {
    const callAmount = ctx.currentHighestBet - ctx.currentBotBet;
    const handStrength = PokerBotAI.getHandStrength(
      ctx.pocketCards,
      ctx.communityCards,
    );
    const botStack = parseInt(ctx.botSeat.stack || '0', 10);
    const dealerSeat = parseInt(ctx.tableState.dealer_seat || '1', 10);

    const position = PokerBotAI.getPositionLabel(
      ctx.botSeatNumber,
      dealerSeat,
      ctx.allSeats,
    );

    const isLatePosition = position === 'BTN' || position === 'CO';
    const potOdds = PotOddsCalculator.calculatePotOdds(ctx.potSize, callAmount);
    const ev = EVCalculator.calculateEV(handStrength, ctx.potSize, callAmount);

    // 1. Continuation Bet (C-Bet) on Flop in Late Position
    if (ctx.gameStage === 'flop' && isLatePosition && callAmount === 0) {
      if (handStrength >= 0.4 || Math.random() < 0.45) {
        // C-Bet 45% of time even on air
        const cbetAmt = Math.min(botStack, Math.floor(ctx.potSize * 0.6));
        if (cbetAmt > 0) {
          return {
            action: 'raise',
            amount: cbetAmt,
            reason: 'Hard: C-Bet Flop',
          };
        }
      }
    }

    // 2. Check-Raise Trap / Semi-Bluff
    if (
      ctx.gameStage !== 'preflop' &&
      !isLatePosition &&
      callAmount > 0 &&
      handStrength >= 0.7
    ) {
      if (Math.random() < 0.3) {
        // 30% Check-Raise Trap
        const checkRaiseAmt = Math.min(botStack, ctx.currentHighestBet * 3);
        return {
          action: 'raise',
          amount: checkRaiseAmt,
          reason: 'Hard: Check-Raise Trap',
        };
      }
    }

    // 3. Positive EV or Premium Hand -> Aggressive Value Bet
    if (handStrength >= 0.85) {
      const raiseAmt = Math.min(
        botStack,
        ctx.currentHighestBet > 0
          ? ctx.currentHighestBet * 3.5
          : ctx.bigBlindAmount * 4,
      );
      return {
        action: 'raise',
        amount: raiseAmt,
        reason: 'Hard: Premium Value Bet',
      };
    }

    if (ev > 0 || handStrength >= potOdds + 0.1) {
      if (handStrength >= 0.65 && isLatePosition && Math.random() < 0.6) {
        const raiseAmt = Math.min(
          botStack,
          ctx.currentHighestBet > 0
            ? ctx.currentHighestBet * 2.5
            : ctx.bigBlindAmount * 3,
        );
        return {
          action: 'raise',
          amount: raiseAmt,
          reason: 'Hard: Position Value Raise',
        };
      }
      return callAmount === 0
        ? { action: 'check', amount: 0, reason: 'Hard: EV Check' }
        : { action: 'call', amount: 0, reason: 'Hard: EV Call' };
    }

    // 4. Semi-bluff on Turn/River with Draws
    if (
      (ctx.gameStage === 'turn' || ctx.gameStage === 'river') &&
      isLatePosition &&
      Math.random() < 0.25
    ) {
      const semiBluffAmt = Math.min(botStack, Math.floor(ctx.potSize * 0.75));
      if (semiBluffAmt > 0) {
        return {
          action: 'raise',
          amount: semiBluffAmt,
          reason: 'Hard: Semi-Bluff',
        };
      }
    }

    // 5. Default Fallback
    return callAmount === 0
      ? { action: 'check', amount: 0, reason: 'Hard: Check' }
      : { action: 'fold', amount: 0, reason: 'Hard: Fold Negative EV' };
  }
}
