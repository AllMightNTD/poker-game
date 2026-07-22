export class PotOddsCalculator {
  /**
   * Tính Pot Odds tỷ lệ % (BetToCall / (CurrentPot + BetToCall))
   */
  static calculatePotOdds(potSize: number, callAmount: number): number {
    if (callAmount <= 0) return 0;
    const totalPotAfterCall = potSize + callAmount;
    return callAmount / totalPotAfterCall;
  }

  /**
   * Tính Implied Odds giả định người chơi sẽ thắng thêm 1-2 BBs ở các vòng sau
   */
  static calculateImpliedOdds(
    potSize: number,
    callAmount: number,
    estimatedFutureWinnings: number,
  ): number {
    if (callAmount <= 0) return 0;
    const totalImpliedPot = potSize + estimatedFutureWinnings + callAmount;
    return callAmount / totalImpliedPot;
  }
}
