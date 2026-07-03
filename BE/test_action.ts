// Poker Action Processor Raise Logic Test
function processAction(
  actualAction: string,
  amount: number,
  stack: number,
  currentBet: number,
  highestBet: number,
  lastFullRaiseSize: number
) {
  let actionCost = 0;
  let isFullRaise = false;
  let originalHighestBet = highestBet;

  if (actualAction === 'call') {
    actionCost = highestBet - currentBet;
    if (actionCost >= stack) {
      actionCost = stack;
      actualAction = 'allin';
    }
    stack -= actionCost;
    currentBet += actionCost;
  } else if (actualAction === 'raise') {
    const targetBet = amount;
    if (targetBet > currentBet + stack) {
      return { error: 'Số chip cược vượt quá số phỉnh bạn đang có.' };
    }
    if (targetBet <= highestBet) {
      return { error: `Cược tối thiểu phải lớn hơn mức cược cao nhất: ${highestBet}` };
    }
    if (actualAction === 'raise' && targetBet < highestBet + lastFullRaiseSize) {
      if (targetBet !== currentBet + stack) {
        return { error: `Raise tối thiểu phải là: ${highestBet + lastFullRaiseSize}` };
      }
    }
    actionCost = targetBet - currentBet;
    if (actionCost >= stack) {
      actionCost = stack;
      actualAction = 'allin';
      currentBet += actionCost;
      stack = 0;
      if (currentBet > originalHighestBet) {
        const increase = currentBet - originalHighestBet;
        if (increase >= lastFullRaiseSize) {
          isFullRaise = true;
          lastFullRaiseSize = increase;
        }
        highestBet = currentBet;
      }
    } else {
      stack -= actionCost;
      const increase = targetBet - originalHighestBet;
      if (increase >= lastFullRaiseSize) {
        isFullRaise = true;
        lastFullRaiseSize = increase;
      }
      currentBet = targetBet;
      highestBet = targetBet;
    }
  } else if (actualAction === 'allin') {
    actionCost = stack;
    currentBet += actionCost;
    stack = 0;
    if (currentBet > originalHighestBet) {
      const increase = currentBet - originalHighestBet;
      if (increase >= lastFullRaiseSize) {
        isFullRaise = true;
        lastFullRaiseSize = increase;
      }
      highestBet = currentBet;
    }
  }

  return { actualAction, actionCost, stack, currentBet, highestBet, lastFullRaiseSize };
}

console.log("TEST A All In:");
console.log(processAction('allin', 1000, 1000, 0, 0, 0));

console.log("TEST B Call (A is all in for 1000):");
console.log(processAction('call', 0, 2000, 0, 1000, 1000));

console.log("TEST B Raise All In (A is all in for 1000):");
console.log(processAction('raise', 2000, 2000, 0, 1000, 1000));
