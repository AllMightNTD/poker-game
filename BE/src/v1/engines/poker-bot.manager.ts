import { PokerBotAI } from './poker-bot.ai';
import { PokerGameService } from '../services/poker-game.service';

export class PokerBotManager {
  constructor(private readonly gameService: PokerGameService) {}

  async checkAndTriggerBotAction(roomId: string) {
    try {
      const tableState = await this.gameService.stateService.getTableState(roomId);
      if (!tableState || tableState.game_stage === 'ended') return;

      const currentTurnSeat = parseInt(tableState.current_turn_seat || '0');
      if (currentTurnSeat === 0) return;

      const seats = await this.gameService.stateService.getAllSeats(roomId);
      const activeSeat = seats.find(s => s.seat_number === currentTurnSeat);
      if (!activeSeat || activeSeat.is_bot !== '1' || activeSeat.status !== 'active') {
        return;
      }

      const delay = 1500 + Math.random() * 1500;
      setTimeout(async () => {
        const lockAcquired = await this.gameService.stateService.acquireLock(roomId);
        if (!lockAcquired) {
          this.checkAndTriggerBotAction(roomId);
          return;
        }

        try {
          const currentTableState = await this.gameService.stateService.getTableState(roomId);
          if (!currentTableState || currentTableState.game_stage === 'ended') return;
          if (parseInt(currentTableState.current_turn_seat || '0') !== currentTurnSeat) return;

          const currentSeats = await this.gameService.stateService.getAllSeats(roomId);
          const currentBotSeat = currentSeats.find(s => s.seat_number === currentTurnSeat);
          if (!currentBotSeat || currentBotSeat.is_bot !== '1' || currentBotSeat.status !== 'active') return;

          const pocket = await this.gameService.stateService.getPlayerCards(roomId, currentBotSeat.user_id);
          const community = currentTableState.community_cards ? currentTableState.community_cards.split(',') : [];

          const handStrength = PokerBotAI.getHandStrength(pocket, community);

          const dealerSeat = parseInt(currentTableState.dealer_seat || '1');
          const positionLabel = PokerBotAI.getPositionLabel(currentTurnSeat, dealerSeat, currentSeats);

          const currentBet = parseInt(String(currentBotSeat.current_bet || '0'));
          const highestBet = parseInt(currentTableState.current_highest_bet || '0');
          const botStack = parseInt(currentBotSeat.stack || '0');
          const sbAmount = parseInt(currentTableState.small_blind || '50');

          const timesRaised = highestBet > sbAmount * 2 ? 1 : 0;

          const decision = PokerBotAI.decideAction(
            positionLabel,
            handStrength,
            currentTableState.game_stage || 'preflop',
            currentBet,
            highestBet,
            timesRaised,
            sbAmount * 2,
            botStack,
          );

          this.gameService.logger.log(`Bot ${currentBotSeat.username} (Seat ${currentTurnSeat}, Pos ${positionLabel}, Strength ${handStrength.toFixed(2)}) decides: ${decision.action} with amount ${decision.amount}`);

          await this.gameService.processPlayerAction(roomId, currentTurnSeat, decision.action, decision.amount);

        } catch (err) {
          this.gameService.logger.error(`Error executing bot action: ${err.message}`);
        } finally {
          await this.gameService.stateService.releaseLock(roomId);
        }
      }, delay);

    } catch (err) {
      this.gameService.logger.error(`Error in checkAndTriggerBotAction: ${err.message}`);
    }
  }
}
