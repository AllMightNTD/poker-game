export class EVCalculator {
  /**
   * EV = (Equity * TotalPotIfWin) - ((1 - Equity) * CostToCall)
   */
  static calculateEV(
    equity: number,
    currentPot: number,
    costToCall: number,
  ): number {
    const winAmount = currentPot;
    const loseAmount = costToCall;
    return equity * winAmount - (1 - equity) * loseAmount;
  }

  /**
   * EV Raise = (FoldEquity * Pot) + (1 - FoldEquity) * [(Equity * PotAfterCall) - ((1 - Equity) * RaiseAmount)]
   */
  static calculateRaiseEV(
    equity: number,
    foldEquity: number,
    potSize: number,
    raiseAmount: number,
  ): number {
    const immediateWin = foldEquity * potSize;
    const calledEv =
      (1 - foldEquity) *
      (equity * (potSize + raiseAmount) - (1 - equity) * raiseAmount);
    return immediateWin + calledEv;
  }
}
