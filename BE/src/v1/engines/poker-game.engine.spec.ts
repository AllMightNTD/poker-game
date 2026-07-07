import { PokerGameEngine } from './poker-game.engine';

describe('PokerGameEngine - Unit Tests', () => {
  describe('splitPot Logic', () => {
    it('[POT-001] Tạo Side Pot đơn giản: 3 người All-in với số chip lệch nhau (1000, 500, 500)', () => {
      const playerBetStates = [
        { seat: 1, bet: 1000, folded: false, allIn: true }, // Player A
        { seat: 2, bet: 500, folded: false, allIn: true }, // Player B
        { seat: 3, bet: 500, folded: false, allIn: true }, // Player C
      ];

      const pots = PokerGameEngine.splitPot(playerBetStates);

      // Theo kịch bản POT-001, hệ thống phải tạo ra 2 pot:
      // Pot 1 (Main): 500 + 500 + 500 = 1500 (Dành cho A, B, C)
      // Pot 2 (Uncalled Refund): 1000 - 500 = 500 (Trả lại cho A)

      expect(pots.length).toBe(2);

      // Main Pot
      expect(pots[0].amount).toBe(1500);
      expect(pots[0].eligibleSeats).toEqual(expect.arrayContaining([1, 2, 3]));
      expect(pots[0].isUncalled).toBe(false);

      // Side Pot 1 (Refund)
      expect(pots[1].amount).toBe(500);
      expect(pots[1].eligibleSeats).toEqual([1]);
      expect(pots[1].isUncalled).toBe(true);
    });

    it('[POT-002] Tạo nhiều Side Pot phức tạp: 3 người All-in khác mức (100, 300, 500)', () => {
      const playerBetStates = [
        { seat: 1, bet: 100, folded: false, allIn: true }, // Player A
        { seat: 2, bet: 300, folded: false, allIn: true }, // Player B
        { seat: 3, bet: 500, folded: false, allIn: true }, // Player C
      ];

      const pots = PokerGameEngine.splitPot(playerBetStates);

      // Hệ thống phải chia thành 3 Pot:
      // Main Pot: 100 + 100 + 100 = 300 (A, B, C)
      // Side Pot 1: 200 + 200 = 400 (B, C)
      // Side Pot 2 (Uncalled Refund): 200 (C)

      expect(pots.length).toBe(3);

      // Main Pot
      expect(pots[0].amount).toBe(300);
      expect(pots[0].eligibleSeats).toEqual(expect.arrayContaining([1, 2, 3]));
      expect(pots[0].isUncalled).toBe(false);

      // Side Pot 1
      expect(pots[1].amount).toBe(400);
      expect(pots[1].eligibleSeats).toEqual(expect.arrayContaining([2, 3]));
      expect(pots[1].isUncalled).toBe(false);

      // Side Pot 2 (Refund)
      expect(pots[2].amount).toBe(200);
      expect(pots[2].eligibleSeats).toEqual([3]);
      expect(pots[2].isUncalled).toBe(true);
    });

    it('Dead money từ người Fold phải gộp vào Pot trước đó một cách chính xác', () => {
      const playerBetStates = [
        { seat: 1, bet: 1000, folded: false, allIn: true }, // Player A
        { seat: 2, bet: 200, folded: true, allIn: false }, // Player B (Folded)
        { seat: 3, bet: 1000, folded: false, allIn: true }, // Player C
      ];

      const pots = PokerGameEngine.splitPot(playerBetStates);

      // Player B fold sau khi cược 200.
      // 200 này là dead money, nằm chung trong Main Pot.
      // Main Pot: 200(A) + 200(B) + 200(C) = 600 (A, C)
      // Side Pot 1: 800(A) + 800(C) = 1600 (A, C)
      // Nhưng vì tập hợp người có quyền ở Main Pot và Side Pot 1 giống nhau [A, C], chúng sẽ được gộp lại.
      // Tổng Pot: 600 + 1600 = 2200 (A, C)

      expect(pots.length).toBe(1);
      expect(pots[0].amount).toBe(2200);
      expect(pots[0].eligibleSeats).toEqual(expect.arrayContaining([1, 3]));
      expect(pots[0].isUncalled).toBe(false);
    });
  });
});
