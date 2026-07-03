import { PokerGameEngine } from './src/v1/poker-lobby/poker-game.engine';

const playerBetStates = [
  { seat: 1, bet: 1000, folded: false, allIn: true },
  { seat: 2, bet: 3000, folded: false, allIn: true },
  { seat: 3, bet: 3000, folded: false, allIn: true },
  { seat: 4, bet: 500, folded: true, allIn: false },
];

const pots = PokerGameEngine.splitPot(playerBetStates);
console.log(JSON.stringify(pots, null, 2));

const playerBetStates2 = [
  { seat: 1, bet: 1500, folded: false, allIn: true }, // A goes all in for 1500
  { seat: 2, bet: 2000, folded: false, allIn: false }, // B calls and bets more? (no, B bet 2000)
];
const pots2 = PokerGameEngine.splitPot(playerBetStates2);
console.log(JSON.stringify(pots2, null, 2));

