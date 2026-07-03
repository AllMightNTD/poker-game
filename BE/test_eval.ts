import { PokerGameEngine } from './src/v1/poker-lobby/poker-game.engine';

const p1 = ['TD', 'AH', '4C', 'AS', '2H', 'JD', '9C'];
const r1 = PokerGameEngine.evaluate7CardHand(p1);
console.log('p1:', r1);

const p2 = ['4C', 'AS', '4C', 'AS', '2H', 'JD', '9C'];
const r2 = PokerGameEngine.evaluate7CardHand(p2);
console.log('p2:', r2);
