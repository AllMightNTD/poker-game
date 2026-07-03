import { PokerGameEngine } from './src/v1/poker-lobby/poker-game.engine';

const players = [
  { seat: 1, bet: 1000, folded: false, allIn: false },
  { seat: 2, bet: 1000, folded: false, allIn: false },
  { seat: 3, bet: 1000, folded: false, allIn: false }
];
console.log('Test 1:', PokerGameEngine.splitPot(players));

const players2 = [
  { seat: 1, bet: 500, folded: true, allIn: false },
  { seat: 2, bet: 1000, folded: false, allIn: true },
  { seat: 3, bet: 2000, folded: false, allIn: false }
];
console.log('Test 2:', PokerGameEngine.splitPot(players2));
