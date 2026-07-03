import { PokerGameEngine } from './src/v1/poker-lobby/poker-game.engine';

// 9 Players.
// P1: All-in 100
// P2: Folded after betting 50
// P3: All-in 300
// P4: All-in 600
// P5: Calls 1000
// P6: All-in 1000
// P7: Folded after betting 0
// P8: Folded after betting 200
// P9: Calls 1000, then folds? No, P9 calls 1000.

const playerBetStates = [
  { seat: 1, bet: 100, folded: false, allIn: true },
  { seat: 2, bet: 50, folded: true, allIn: false },
  { seat: 3, bet: 300, folded: false, allIn: true },
  { seat: 4, bet: 600, folded: false, allIn: true },
  { seat: 5, bet: 1000, folded: false, allIn: false },
  { seat: 6, bet: 1000, folded: false, allIn: true },
  { seat: 7, bet: 0, folded: true, allIn: false },
  { seat: 8, bet: 200, folded: true, allIn: false },
  { seat: 9, bet: 1000, folded: false, allIn: false },
];

const pots = PokerGameEngine.splitPot(playerBetStates);
console.log(JSON.stringify(pots, null, 2));

