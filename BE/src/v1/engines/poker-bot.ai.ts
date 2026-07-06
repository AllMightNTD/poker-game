import { PokerGameEngine } from './poker-game.engine';
import { PokerSeatState } from '../types/poker.types';

export class PokerBotAI {
  /**
   * Tính toán sức mạnh bài của Bot từ 0.0 (rác) đến 1.0 (tuyệt đối)
   */
  static getHandStrength(pocket: string[], community: string[]): number {
    if (!pocket || pocket.length < 2) return 0.1;

    if (!community || community.length === 0) {
      return this.evaluatePreflopStrength(pocket[0], pocket[1]);
    }

    const evalResult = PokerGameEngine.evaluate7CardHand([...pocket, ...community]);
    const category = Math.floor(evalResult.score / 10000000);
    const tie = evalResult.score % 10000000;

    // Ánh xạ category (0-8) sang strength (0-1)
    let base = 0;
    let range = 0;

    switch (category) {
      case 0: // High Card
        base = 0.0;
        range = 0.15;
        break;
      case 1: // One Pair
        base = 0.15;
        range = 0.20;
        break;
      case 2: // Two Pair
        base = 0.35;
        range = 0.20;
        break;
      case 3: // Three of a Kind
        base = 0.55;
        range = 0.10;
        break;
      case 4: // Straight
        base = 0.65;
        range = 0.10;
        break;
      case 5: // Flush
        base = 0.75;
        range = 0.10;
        break;
      case 6: // Full House
        base = 0.85;
        range = 0.07;
        break;
      case 7: // Four of a Kind
        base = 0.92;
        range = 0.05;
        break;
      case 8: // Straight/Royal Flush
        base = 0.97;
        range = 0.03;
        break;
      default:
        return 0.1;
    }

    // Chuẩn hóa tiebreaker (tối đa ~750,000) vào khoảng giá trị của category
    const normalizedTie = Math.min(1.0, tie / 800000);
    return base + normalizedTie * range;
  }

  private static evaluatePreflopStrength(card1: string, card2: string): number {
    const r1 = card1[0];
    const s1 = card1[1];
    const r2 = card2[0];
    const s2 = card2[1];

    const rankVals: Record<string, number> = {
      '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9,
      'T': 10, 'J': 11, 'Q': 12, 'K': 13, 'A': 14
    };

    const v1 = rankVals[r1] || 2;
    const v2 = rankVals[r2] || 2;

    const high = Math.max(v1, v2);
    const low = Math.min(v1, v2);
    const suited = s1 === s2;
    const pair = v1 === v2;

    if (pair) {
      // Pairs: AA (1.0), KK (0.95), ..., 22 (0.50)
      return 0.5 + (high - 2) * (0.5 / 12);
    }

    // Non-pairs
    let score = (high + low) / 28;
    if (suited) {
      score += 0.15;
    }
    if (high - low === 1) {
      score += 0.05;
    }
    return Math.min(0.9, Math.max(0.1, score));
  }

  /**
   * Xác định nhãn vị trí (UTG, BTN, SB, BB...) cho ghế chơi
   */
  static getPositionLabel(
    seatNumber: number,
    dealerSeat: number,
    seats: PokerSeatState[],
  ): string {
    const activeSeats = seats
      .filter(s => s.status === 'active' || s.status === 'folded')
      .map(s => s.seat_number)
      .sort((a, b) => a - b);

    if (activeSeats.length === 0) return 'BTN';

    let dealerIndex = activeSeats.indexOf(dealerSeat);
    if (dealerIndex === -1) {
      dealerIndex = activeSeats.findIndex(s => s >= dealerSeat);
      if (dealerIndex === -1) dealerIndex = 0;
    }

    const orderedSeats: number[] = [];
    for (let i = 1; i <= activeSeats.length; i++) {
      const idx = (dealerIndex + i) % activeSeats.length;
      orderedSeats.push(activeSeats[idx]);
    }

    const seatOrderIndex = orderedSeats.indexOf(seatNumber);
    const N = activeSeats.length;

    if (N === 2) {
      if (seatOrderIndex === 0) return 'BB';
      return 'BTN';
    }

    if (seatOrderIndex === N - 1) return 'BTN';
    if (seatOrderIndex === 0) return 'SB';
    if (seatOrderIndex === 1) return 'BB';
    if (seatOrderIndex === 2) return 'UTG';
    if (seatOrderIndex === 3) return 'UTG+1';
    if (seatOrderIndex === 4) return 'MP1';
    if (seatOrderIndex === 5) return 'MP2';
    if (seatOrderIndex === 6) return 'HJ';
    if (seatOrderIndex === 7) return 'CO';
    return 'MP1';
  }

  /**
   * Đưa ra hành động cược dựa theo ma trận chiến thuật
   */
  static decideAction(
    position: string,
    handStrength: number,
    stage: string,
    currentBet: number,
    highestBet: number,
    timesRaisedBeforeMe: number,
    bigBlindAmount: number,
    botStack: number,
  ): { action: string; amount: number } {
    const callAmount = highestBet - currentBet;
    const ACTIONS = { FOLD: 'fold', CHECK: 'check', CALL: 'call', RAISE: 'raise' };

    // EARLY POSITION (UTG, UTG+1)
    if (position === 'UTG' || position === 'UTG+1') {
      if (handStrength >= 0.85) {
        return { action: ACTIONS.RAISE, amount: this.calculateRaiseAmount(highestBet, bigBlindAmount, botStack) };
      } else if (stage === 'preflop') {
        return callAmount === 0 ? { action: ACTIONS.CHECK, amount: 0 } : { action: ACTIONS.FOLD, amount: 0 };
      } else {
        return callAmount === 0 ? { action: ACTIONS.CHECK, amount: 0 } : { action: ACTIONS.FOLD, amount: 0 };
      }
    }

    // MIDDLE POSITION (MP1, MP2, HJ)
    if (position === 'MP1' || position === 'MP2' || position === 'HJ') {
      if (handStrength >= 0.75) {
        return { action: ACTIONS.RAISE, amount: this.calculateRaiseAmount(highestBet, bigBlindAmount, botStack) };
      } else if (callAmount === 0) {
        return { action: ACTIONS.CHECK, amount: 0 };
      } else if (callAmount > 0 && handStrength >= 0.60) {
        return { action: ACTIONS.CALL, amount: 0 };
      } else {
        return { action: ACTIONS.FOLD, amount: 0 };
      }
    }

    // LATE POSITION (CO, BTN)
    if (position === 'CO' || position === 'BTN') {
      if (timesRaisedBeforeMe === 0) {
        if (handStrength >= 0.45) {
          return { action: ACTIONS.RAISE, amount: this.calculateRaiseAmount(highestBet, bigBlindAmount, botStack) };
        } else {
          return callAmount === 0 ? { action: ACTIONS.CHECK, amount: 0 } : { action: ACTIONS.FOLD, amount: 0 };
        }
      } else {
        if (handStrength >= 0.70) {
          return { action: ACTIONS.RAISE, amount: this.calculateRaiseAmount(highestBet, bigBlindAmount, botStack) };
        } else if (handStrength >= 0.55) {
          return { action: ACTIONS.CALL, amount: 0 };
        } else {
          return { action: ACTIONS.FOLD, amount: 0 };
        }
      }
    }

    // BLINDS (SB, BB)
    if (position === 'SB' || position === 'BB') {
      if (stage === 'preflop' && position === 'BB' && callAmount === 0) {
        return { action: ACTIONS.CHECK, amount: 0 };
      }

      if (handStrength >= 0.80) {
        return { action: ACTIONS.RAISE, amount: this.calculateRaiseAmount(highestBet, bigBlindAmount, botStack) };
      } else if (callAmount > 0 && handStrength >= 0.65) {
        return { action: ACTIONS.CALL, amount: 0 };
      } else {
        return callAmount === 0 ? { action: ACTIONS.CHECK, amount: 0 } : { action: ACTIONS.FOLD, amount: 0 };
      }
    }

    return callAmount === 0 ? { action: ACTIONS.CHECK, amount: 0 } : { action: ACTIONS.FOLD, amount: 0 };
  }

  private static calculateRaiseAmount(highestBet: number, bigBlindAmount: number, botStack: number): number {
    const baseRaise = highestBet > 0 ? highestBet * 3 : bigBlindAmount * 3;
    return Math.min(botStack, baseRaise);
  }
}
