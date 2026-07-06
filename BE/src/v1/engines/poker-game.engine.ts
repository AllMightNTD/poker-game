import * as crypto from 'crypto';

export interface PokerPlayerState {
  seat: number;
  bet: number;
  folded: boolean;
  allIn: boolean;
}

export interface SidePot {
  amount: number;
  eligibleSeats: number[];
  isUncalled?: boolean;
}

export class PokerGameEngine {
  /**
   * Deterministic Fisher-Yates Shuffle using HMAC-SHA512 of Server Seed & Client Seed
   * Provably Fair algorithm
   */
  static shuffleDeck(serverSeed: string, clientSeed: string): string[] {
    const deck = [
      '2C', '3C', '4C', '5C', '6C', '7C', '8C', '9C', 'TC', 'JC', 'QC', 'KC', 'AC', // Clubs
      '2D', '3D', '4D', '5D', '6D', '7D', '8D', '9D', 'TD', 'JD', 'QD', 'KD', 'AD', // Diamonds
      '2H', '3H', '4H', '5H', '6H', '7H', '8H', '9H', 'TH', 'JH', 'QH', 'KH', 'AH', // Hearts
      '2S', '3S', '4S', '5S', '6S', '7S', '8S', '9S', 'TS', 'JS', 'QS', 'KS', 'AS', // Spades
    ];

    const hmac = crypto.createHmac('sha512', clientSeed);
    hmac.update(serverSeed);
    const hash = hmac.digest();

    let byteIndex = 0;
    for (let i = deck.length - 1; i > 0; i--) {
      // Re-hash if byteIndex exceeds length
      if (byteIndex + 1 >= hash.length) {
        byteIndex = 0;
      }
      const randVal = (hash[byteIndex] << 8) | hash[byteIndex + 1];
      const j = randVal % (i + 1);
      byteIndex += 2;

      // Swap cards
      const temp = deck[i];
      deck[i] = deck[j];
      deck[j] = temp;
    }
    return deck;
  }

  /**
   * Phân tách Side Pots khi có người chơi All-in
   * Chuẩn Poker quốc tế
   */
  static splitPot(players: PokerPlayerState[]): SidePot[] {
    const remaining = players
      .filter(p => p.bet > 0)
      .map(p => ({
        ...p,
        remaining: p.bet,
      }));

    const pots: SidePot[] = [];

    while (true) {
      const contributors = remaining.filter(p => p.remaining > 0);
      if (contributors.length === 0) break;

      const minContribution = Math.min(...contributors.map(p => p.remaining));
      const amount = contributors.length * minContribution;
      const eligibleSeats = contributors.filter(p => !p.folded).map(p => p.seat);
      const isUncalled = contributors.length === 1; // Uncalled bet if only 1 contributor

      if (amount > 0) {
        if (eligibleSeats.length > 0) {
          pots.push({ amount, eligibleSeats, isUncalled });
        } else if (pots.length > 0) {
          // Dead money from folded players goes to the previous pot
          pots[pots.length - 1].amount += amount;
        } else {
          // Should not happen unless everyone folded (handled by endHandEarly before)
          pots.push({ amount, eligibleSeats, isUncalled });
        }
      }

      for (const p of contributors) {
        p.remaining -= minContribution;
      }
    }

    // Merge pots with exactly the same eligible seats and uncalled status
    const mergedPots: SidePot[] = [];
    for (const pot of pots) {
      if (mergedPots.length === 0) {
        mergedPots.push(pot);
        continue;
      }
      const lastPot = mergedPots[mergedPots.length - 1];
      const sameSeats =
        lastPot.eligibleSeats.length === pot.eligibleSeats.length &&
        lastPot.eligibleSeats.every(s => pot.eligibleSeats.includes(s));
      const sameUncalled = lastPot.isUncalled === pot.isUncalled;

      if (sameSeats && sameUncalled) {
        lastPot.amount += pot.amount;
      } else {
        mergedPots.push(pot);
      }
    }

    return mergedPots;
  }

  /**
   * So bài 7 lá Texas Hold'em
   * Trả về tay bài mạnh nhất trong 21 tổ hợp bài 5 lá
   */
  static evaluate7CardHand(cards: string[]): { score: number; name: string } {
    if (cards.length < 5) {
      return { score: 0, name: 'High Card' };
    }

    const combos = this.getCombinations(cards, 5);
    let bestHand = { score: -1, name: '' };

    for (const combo of combos) {
      const evaluated = this.evaluate5CardHand(combo);
      if (evaluated.score > bestHand.score) {
        bestHand = evaluated;
      }
    }

    return bestHand;
  }

  private static getCombinations(array: string[], k: number): string[][] {
    const result: string[][] = [];
    const helper = (start: number, combo: string[]) => {
      if (combo.length === k) {
        result.push([...combo]);
        return;
      }
      for (let i = start; i < array.length; i++) {
        combo.push(array[i]);
        helper(i + 1, combo);
        combo.pop();
      }
    };
    helper(0, []);
    return result;
  }

  private static evaluate5CardHand(cards: string[]): { score: number; name: string } {
    const rankMap: Record<string, number> = {
      '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9,
      'T': 10, 'J': 11, 'Q': 12, 'K': 13, 'A': 14
    };

    // Phân tích tay bài
    const parsed = cards.map(c => ({
      rank: rankMap[c[0]],
      suit: c[1]
    }));

    // Sắp xếp giảm dần theo rank
    parsed.sort((a, b) => b.rank - a.rank);

    const ranks = parsed.map(p => p.rank);
    const suits = parsed.map(p => p.suit);

    const isFlush = suits.every(s => s === suits[0]);

    // Check Straight (5 liên tiếp)
    let isStraight = false;
    let straightHigh = 0;

    // Trường hợp sảnh chuẩn
    if (
      ranks[0] - ranks[4] === 4 &&
      new Set(ranks).size === 5
    ) {
      isStraight = true;
      straightHigh = ranks[0];
    }
    // Trường hợp sảnh hạ (A-2-3-4-5)
    else if (
      ranks[0] === 14 &&
      ranks[1] === 5 &&
      ranks[2] === 4 &&
      ranks[3] === 3 &&
      ranks[4] === 2
    ) {
      isStraight = true;
      straightHigh = 5; // sảnh 5-cao
    }

    // Tần suất xuất hiện của các rank
    const counts: Record<number, number> = {};
    for (const r of ranks) {
      counts[r] = (counts[r] || 0) + 1;
    }

    const freq = Object.entries(counts)
      .map(([rank, count]) => ({ rank: parseInt(rank), count }))
      .sort((a, b) => b.count - a.count || b.rank - a.rank);

    // Thể loại bài:
    // 8: Straight Flush
    // 7: Four of a Kind
    // 6: Full House
    // 5: Flush
    // 4: Straight
    // 3: Three of a Kind
    // 2: Two Pair
    // 1: One Pair
    // 0: High Card

    let category = 0;
    let tieBreaker = 0;
    let name = 'High Card';

    if (isStraight && isFlush) {
      category = 8;
      tieBreaker = straightHigh;
      name = straightHigh === 14 ? 'Royal Flush' : 'Straight Flush';
    } else if (freq[0].count === 4) {
      category = 7;
      tieBreaker = freq[0].rank * 15 + freq[1].rank;
      name = 'Four of a Kind';
    } else if (freq[0].count === 3 && freq[1].count === 2) {
      category = 6;
      tieBreaker = freq[0].rank * 15 + freq[1].rank;
      name = 'Full House';
    } else if (isFlush) {
      category = 5;
      tieBreaker = ranks.reduce((acc, r, idx) => acc + r * Math.pow(15, 4 - idx), 0);
      name = 'Flush';
    } else if (isStraight) {
      category = 4;
      tieBreaker = straightHigh;
      name = 'Straight';
    } else if (freq[0].count === 3) {
      category = 3;
      tieBreaker = freq[0].rank * 225 + freq[1].rank * 15 + freq[2].rank;
      name = 'Three of a Kind';
    } else if (freq[0].count === 2 && freq[1].count === 2) {
      category = 2;
      tieBreaker = freq[0].rank * 225 + freq[1].rank * 15 + freq[2].rank;
      name = 'Two Pair';
    } else if (freq[0].count === 2) {
      category = 1;
      tieBreaker = freq[0].rank * Math.pow(15, 3) +
        freq[1].rank * Math.pow(15, 2) +
        freq[2].rank * 15 +
        freq[3].rank;
      name = 'One Pair';
    } else {
      category = 0;
      tieBreaker = ranks.reduce((acc, r, idx) => acc + r * Math.pow(15, 4 - idx), 0);
      name = 'High Card';
    }

    const score = category * 10000000 + tieBreaker;
    return { score, name };
  }
}
