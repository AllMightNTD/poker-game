import { PokerSeatState, PokerTableState } from '../../../types/poker.types';

export interface BotDecisionContext {
  roomId: string;
  botSeatNumber: number;
  botSeat: PokerSeatState;
  allSeats: PokerSeatState[];
  tableState: PokerTableState;
  pocketCards: string[];
  communityCards: string[];
  currentHighestBet: number;
  currentBotBet: number;
  bigBlindAmount: number;
  potSize: number;
  gameStage: string;
}

export interface BotDecisionResult {
  action: 'fold' | 'check' | 'call' | 'raise';
  amount: number;
  reason?: string;
}

export interface IBotStrategy {
  decide(context: BotDecisionContext): BotDecisionResult;
}
