import { PokerGameEngine } from './src/v1/poker-lobby/poker-game.engine';

const communityCards = ['AS', 'KS', 'QS', 'JS', '2H'];

const pockets = [
  ['TS', '3C'], // P1: Royal Flush
  ['9S', '8S'], // P2: Straight Flush (King high)
  ['AH', 'AD'], // P3: Three of a kind (Aces)
  ['KH', 'KD'], // P4: Three of a kind (Kings)
  ['QC', 'QD'], // P5: Three of a kind (Queens)
  ['JC', 'JD'], // P6: Three of a kind (Jacks)
  ['2C', '2D'], // P7: Three of a kind (Twos)
  ['7H', '7C'], // P8: Pair of 7s
  ['5H', '6C'], // P9: High card Ace
];

for (let i = 0; i < 9; i++) {
  const allCards = [...communityCards, ...pockets[i]];
  const evalHand = PokerGameEngine.evaluate7CardHand(allCards);
  console.log(`P${i + 1} Hand: ${evalHand.name}, Score: ${evalHand.score}`);
}
