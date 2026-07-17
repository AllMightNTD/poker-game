// src/v1/engines/poker-game-history.processor.ts
import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Injectable, Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { DataSource } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { GameHand, HandStage } from '../entities/game_hand.entity';
import { ProvablyFairAudit } from '../entities/provably_fair_audit.entity';
import { SystemRevenue } from '../entities/system_revenue.entity';
import { HandPlayer } from '../entities/hand_player.entity';
import { HandAction } from '../entities/hand_action.entity';
import { PokerTable } from '../entities/poker_table.entity';

export interface PokerGameHistoryJobData {
  roomId: string;
  totalPotAmount: number;
  rakeCalculated: string;
  rakeRate: number;
  tableState: {
    dealer_seat?: string;
    small_blind_seat?: string;
    big_blind_seat?: string;
    community_cards?: string;
    game_stage?: string;
    client_seed?: string;
    shuffled_deck?: string;
    provably_fair_audit_id?: string;
    current_hand_id?: string;
    room_name?: string;
  };
  serverSeedPlain: string;
  seats: Array<{
    user_id: string;
    username: string;
    avatar?: string;
    seat_number: number;
    stack: string;
    total_contributed: string;
    muck_cards?: string;
    pocketCards: string[];
  }>;
  winnersLog: Array<{
    user_id: string;
    seat_number: number;
    username: string;
    win_amount: number;
    hand_name: string;
    pots: Array<{
      amount: number;
      label?: string;
    }>;
  }>;
  userRakeShares: Array<{
    userId: string;
    rakePaid: string;
  }>;
  reconciliationSuccess: boolean;
  reconciliationDetails: any;
  bufferedActions: string[];
}

@Injectable()
@Processor('poker-game-history')
export class PokerGameHistoryProcessor extends WorkerHost {
  private readonly logger = new Logger(PokerGameHistoryProcessor.name);

  constructor(
    private readonly dataSource: DataSource,
    private readonly eventEmitter: EventEmitter2,
  ) {
    super();
  }

  async process(job: Job<PokerGameHistoryJobData>): Promise<any> {
    this.logger.debug(`Processing job ${job.name} (id: ${job.id})`);

    const data = job.data;
    const {
      roomId,
      totalPotAmount,
      rakeCalculated,
      rakeRate,
      tableState,
      serverSeedPlain,
      seats,
      winnersLog,
      userRakeShares,
      reconciliationSuccess,
      reconciliationDetails,
      bufferedActions,
    } = data;

    try {
      let handId = '';

      await this.dataSource.transaction(async (manager) => {
        const dbTable = await manager.findOne(PokerTable, {
          where: { id: roomId },
        });

        // 1. Save history GameHand
        const hand = new GameHand();
        hand.table_id = roomId;
        hand.dealer_seat = parseInt(tableState.dealer_seat || '1');
        hand.small_blind_seat = parseInt(tableState.small_blind_seat || '0');
        hand.big_blind_seat = parseInt(tableState.big_blind_seat || '0');
        hand.community_cards = tableState.community_cards || null;
        hand.total_pot = totalPotAmount.toString();
        hand.rake_amount = rakeCalculated;
        hand.hand_stage = (tableState.game_stage || 'preflop') as HandStage;
        hand.server_seed = serverSeedPlain || null;
        hand.client_seed = tableState.client_seed || null;
        hand.shuffled_deck = tableState.shuffled_deck || null;
        hand.ended_at = new Date();
        await manager.save(hand);
        handId = hand.id;

        // 2. Update ProvablyFairAudit
        if (tableState.provably_fair_audit_id) {
          const audit = await manager.findOne(ProvablyFairAudit, {
            where: { id: tableState.provably_fair_audit_id },
          });
          if (audit) {
            audit.hand_id = hand.id;
            audit.revealed_at = new Date();
            await manager.save(audit);
          }
        }

        // 3. Save System Revenue
        const rakeCalculatedBigInt = BigInt(rakeCalculated);
        if (rakeCalculatedBigInt > BigInt(0)) {
          const revenue = new SystemRevenue();
          revenue.room_id = roomId;
          revenue.hand_id = hand.id;
          revenue.revenue_amount = rakeCalculated;
          revenue.rake_rate_applied = rakeRate;
          revenue.pot_total = totalPotAmount.toString();
          await manager.save(revenue);
        }

        // 4. Save HandPlayer records
        const replayPlayers = [];
        const handPlayersToInsert = [];
        for (const seat of seats) {
          const seatWinner = winnersLog.find(
            (w) => w.seat_number === seat.seat_number,
          );
          const wonAmount = seatWinner ? seatWinner.win_amount : 0;
          const pocketCards = seat.pocketCards || [];

          const totalChipsBetEarly = parseInt(seat.total_contributed || '0');
          const chipsBefore = (
            parseInt(seat.stack) +
            totalChipsBetEarly -
            wonAmount
          ).toString();

          const hpData = {
            hand_id: hand.id,
            user_id: seat.user_id,
            hole_cards: pocketCards.join(','),
            chips_before: chipsBefore,
            chips_bet: totalChipsBetEarly.toString(),
            chips_won: wonAmount.toString(),
            net_gain_loss: (wonAmount - totalChipsBetEarly).toString(),
            is_winner: wonAmount > 0,
            seat_number: seat.seat_number,
            initial_stack: chipsBefore,
          };
          handPlayersToInsert.push(hpData);

          replayPlayers.push({
            user_id: seat.user_id,
            user_name: seat.username || 'Player',
            avatar_url: seat.avatar || null,
            seat_number: seat.seat_number,
            hole_cards: hpData.hole_cards,
            initial_stack: hpData.chips_before,
            chips_won: hpData.chips_won,
            net_gain_loss: hpData.net_gain_loss,
            is_winner: hpData.is_winner,
          });
        }

        if (handPlayersToInsert.length > 0) {
          await manager.insert(HandPlayer, handPlayersToInsert);
        }

        // 5. Save HandAction records
        const handActionsToInsert = [];
        const replayActions = [];
        for (let idx = 0; idx < bufferedActions.length; idx++) {
          const actObj = JSON.parse(bufferedActions[idx]);
          const playerSeat = seats.find((s) => s.user_id === actObj.user_id);

          const actData = {
            hand_id: hand.id,
            user_id: actObj.user_id,
            seat_number: actObj.seat_number,
            stage: actObj.stage,
            action_type: actObj.action_type,
            amount: actObj.amount.toString(),
            action_order: idx + 1,
            is_all_in: actObj.action_type === 'allin',
          };
          handActionsToInsert.push(actData);

          replayActions.push({
            id: undefined,
            user_id: actObj.user_id,
            user_name: playerSeat?.username || 'Player',
            seat_number: actObj.seat_number,
            stage: actObj.stage,
            action_type: actObj.action_type,
            amount: actData.amount,
            action_order: actData.action_order,
            is_all_in: actData.is_all_in,
          });
        }

        if (handActionsToInsert.length > 0) {
          await manager.insert(HandAction, handActionsToInsert);
        }

        // 6. Update GameHand Replay JSON
        hand.replay_json = {
          hand: {
            id: hand.id,
            table_name: dbTable?.name || tableState.room_name || null,
            dealer_seat: hand.dealer_seat,
            small_blind_seat: hand.small_blind_seat,
            big_blind_seat: hand.big_blind_seat,
            community_cards: hand.community_cards,
            total_pot: hand.total_pot,
            hand_stage: hand.hand_stage,
            started_at: hand.started_at,
            ended_at: hand.ended_at,
          },
          players: replayPlayers,
          actions: replayActions,
        };
        await manager.save(hand);
      });

      this.logger.log(
        `[Asynchronous Logging] Successfully saved GameHand history ${handId} for table ${roomId}.`,
      );

      // Emit hand completed event for stats, clubs, and audits
      this.eventEmitter.emit('poker.hand.completed', {
        roomId,
        handId,
        totalPot: totalPotAmount,
        rakeAmount: rakeCalculated,
        winners: winnersLog.map((w) => ({
          user_id: w.user_id,
          seat_number: w.seat_number,
          username: w.username,
          win_amount: w.win_amount,
          hand_name: w.hand_name || '',
        })),
        userRakeShares,
        reconciliationSuccess,
        reconciliationDetails,
      });
    } catch (err) {
      this.logger.error(
        `[Asynchronous Logging] Failed to save GameHand history for table ${roomId}: ${err.message}`,
        err.stack,
      );
      throw err;
    }
  }
}
