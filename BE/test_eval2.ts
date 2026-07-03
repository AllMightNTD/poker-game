import { PokerGameEngine } from './src/v1/poker-lobby/poker-game.engine';

const p3 = ['TD', 'AH', '4C', '2S', '3H'];
const r3 = PokerGameEngine.evaluate7CardHand(p3);
console.log('p3:', r3);

const p4 = ['4C', 'AS', '4C', '2S', '3H'];
const r4 = PokerGameEngine.evaluate7CardHand(p4);
console.log('p4:', r4);
