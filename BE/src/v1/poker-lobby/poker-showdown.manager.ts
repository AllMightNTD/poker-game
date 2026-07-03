import { UserStatus } from 'src/constants/user-status';
import { GameHand, HandStage } from '../entities/game_hand.entity';
import { HandAction } from '../entities/hand_action.entity';
import { HandPlayer } from '../entities/hand_player.entity';
import { PokerTable } from '../entities/poker_table.entity';
import { SystemRevenue } from '../entities/system_revenue.entity';
import { TableSession } from '../entities/table_session.entity';
import { User } from '../entities/user.entity';
import { PokerGameEngine } from './poker-game.engine';
import { PokerGameService } from './poker-game.service';

export class PokerShowdownManager {
  constructor(private readonly gameService: PokerGameService) { }

  async processShowdown(roomId: string) {
    this.gameService.logger.log(`[SHOWDOWN] START roomId=${roomId}`);

    const tableState = await this.gameService.stateService.getTableState(roomId);
    const seats = await this.gameService.stateService.getAllSeats(roomId);
    const community = tableState.community_cards ? tableState.community_cards.split(',') : [];

    const dbTable = await PokerTable.findOne({ where: { id: roomId } });
    const maxPlayers = dbTable ? dbTable.max_players : 9;

    const activePlayers = seats.filter(
      s => parseInt(s.total_contributed || '0') > 0 && s.status !== 'folded',
    );

    const evaluatedPlayers = await Promise.all(
      activePlayers.map(async p => {
        const pocket = await this.gameService.stateService.getPlayerCards(roomId, p.user_id);
        const evalResult = PokerGameEngine.evaluate7CardHand([
          ...pocket,
          ...community,
        ]);

        this.gameService.logger.log(`[SHOWDOWN] eval player seat=${p.seat_number} user=${p.user_id} pocket=${pocket.join(',')} score=${evalResult.score} hand=${evalResult.name}`);

        return {
          seat: p.seat_number,
          user_id: p.user_id,
          username: p.username,
          pocket,
          score: evalResult.score,
          handName: evalResult.name,
        };
      }),
    );

    console.log('evaluatedPlayers', evaluatedPlayers);


    const playerBetStates = seats.map(s => ({
      seat: s.seat_number,
      bet: parseInt(s.total_contributed || '0'),
      folded: s.status === 'folded',
      allIn: parseInt(s.stack || '0') === 0 && parseInt(s.total_contributed || '0') > 0,
    }));

    const pots = PokerGameEngine.splitPot(playerBetStates);
    const winnerMap = new Map();
    let totalRakedPot = 0;

    for (const [i, pot] of pots.entries()) {
      if (!pot.isUncalled) {
        totalRakedPot += pot.amount;
      }

      const eligibleEvaluations = evaluatedPlayers.filter(p =>
        pot.eligibleSeats.includes(p.seat),
      );

      if (eligibleEvaluations.length === 0) {
        continue;
      }

      let maxScore = -1;
      let potWinners: typeof eligibleEvaluations = [];

      for (const player of eligibleEvaluations) {
        if (player.score > maxScore) {
          maxScore = player.score;
          potWinners = [player];
        } else if (player.score === maxScore) {
          potWinners.push(player);
        }
      }

      const winShare = Math.floor(pot.amount / potWinners.length);
      let remainder = pot.amount % potWinners.length;

      const dealerSeatNum = parseInt(tableState.dealer_seat || '1');

      potWinners.sort((a, b) => {
        const distA = (a.seat - dealerSeatNum - 1 + maxPlayers) % maxPlayers;
        const distB = (b.seat - dealerSeatNum - 1 + maxPlayers) % maxPlayers;
        return distA - distB;
      });

      for (const winner of potWinners) {
        const extraChip = remainder > 0 ? 1 : 0;
        if (remainder > 0) remainder--;

        const finalWinAmount = winShare + extraChip;

        const existing = winnerMap.get(winner.user_id);
        const potLabel = pot.isUncalled ? 'Trả lại (Uncalled)' : (pots.length === 1 ? undefined : (i === 0 ? 'Main Pot' : `Side Pot ${i}`));

        if (existing) {
          existing.win_amount += finalWinAmount;
          if (!existing.pots) existing.pots = [];
          existing.pots.push({ label: potLabel, amount: finalWinAmount });
          console.log('[Process Showndown Existing]', JSON.stringify(existing), JSON.stringify(winnerMap));

        } else {
          winnerMap.set(winner.user_id, {
            user_id: winner.user_id,
            seat_number: winner.seat,
            username: winner.username,
            win_amount: finalWinAmount,
            hand_name: winner.handName,
            pocket_cards: winner.pocket,
            pots: [{ label: potLabel, amount: finalWinAmount }]
          });
        }
      }
    }

    const winnersLog = Array.from(winnerMap.values());

    console.log('[Process ShowDown Winner Log]', JSON.stringify(winnersLog));

    await this.finalizeAndBroadcastHand(roomId, winnersLog, totalRakedPot, tableState, seats);
  }

  async endHandEarly(roomId: string, winnerSeatNumber: number) {
    const tableState = await this.gameService.stateService.getTableState(roomId);
    if (!tableState) return;

    const seats = await this.gameService.stateService.getAllSeats(roomId);
    const winnerSeat = seats.find(s => s.seat_number === winnerSeatNumber);
    if (!winnerSeat) return;

    const playerBetStates = seats.map(s => ({
      seat: s.seat_number,
      bet: parseInt(s.total_contributed || '0'),
      folded: s.status === 'folded',
      allIn: parseInt(s.stack || '0') === 0 && parseInt(s.total_contributed || '0') > 0,
    }));

    const pots = PokerGameEngine.splitPot(playerBetStates);
    let totalRakedPot = 0;
    let totalWin = 0;

    for (const pot of pots) {
      if (pot.eligibleSeats.includes(winnerSeatNumber)) {
        totalWin += pot.amount;
        if (!pot.isUncalled) {
          totalRakedPot += pot.amount;
        }
      }
    }

    const winnersLog = [{
      user_id: winnerSeat.user_id,
      seat_number: winnerSeatNumber,
      username: winnerSeat.username,
      win_amount: totalWin,
      hand_name: 'Opponents Folded',
      pocket_cards: [],
      pots: [{ label: undefined, amount: totalWin }]
    }];

    console.log('winnerLog EndHandEarly', winnersLog);


    await this.finalizeAndBroadcastHand(roomId, winnersLog, totalRakedPot, tableState, seats);
  }

  async finalizeAndBroadcastHand(
    roomId: string,
    winnersLog: any[],
    totalRakedPotAmount: number,
    tableState: any,
    seats: any[]
  ) {
    // 1. Cập nhật Stack người thắng
    const winnerPromises = winnersLog.map(async (winner) => {
      const winnerSeat = seats.find(s => s.seat_number === winner.seat_number);
      if (winnerSeat) {
        const currentStack = parseInt(winnerSeat.stack || '0');
        const newStack = currentStack + winner.win_amount;
        winnerSeat.stack = newStack.toString();
        await this.gameService.stateService.setSeat(roomId, winner.seat_number, {
          stack: newStack.toString(),
        });
        await this.gameService.syncSeatStackToDb(roomId, winnerSeat.user_id, newStack.toString());
      }
    });
    await Promise.all(winnerPromises);

    // 1.B. Reconciliation đối soát số phỉnh (Audit Trail & Anti-Money Exploit)
    for (const seat of seats) {
      if (seat.start_stack) {
        const startStack = parseInt(seat.start_stack, 10);
        const totalChipsBetEarly = parseInt(seat.total_contributed || '0', 10);
        const seatWinner = winnersLog.find(w => w.seat_number === seat.seat_number);
        const wonAmount = seatWinner ? seatWinner.win_amount : 0;

        const netGainLoss = wonAmount - totalChipsBetEarly;
        const expectedNewStack = startStack + netGainLoss;
        const actualNewStack = parseInt(seat.stack, 10);

        if (expectedNewStack !== actualNewStack) {
          this.gameService.logger.error(
            `[RECONCILIATION ERROR] Money Exploit Detected! User ${seat.user_id} on seat ${seat.seat_number} of table ${roomId}. ` +
            `Start stack: ${startStack}, Bet: ${totalChipsBetEarly}, Won: ${wonAmount}, Expected: ${expectedNewStack}, Actual: ${actualNewStack}`
          );
          // Block user account
          const user = await User.findOne({ where: { id: seat.user_id } });
          if (user) {
            user.status = UserStatus.BANNED;
            await user.save();
            this.gameService.logger.warn(`[RECONCILIATION] User ${seat.user_id} has been BANNED due to chip discrepancy.`);
          }
        } else {
          this.gameService.logger.log(
            `[RECONCILIATION] Success for User ${seat.user_id} on seat ${seat.seat_number}. Stack verified: ${actualNewStack}`
          );
        }
      }
    }

    // 2. Khấu trừ Rake (mặc định 5%)
    const dbTable = await PokerTable.findOne({ where: { id: roomId } });
    const rakeRate = dbTable ? dbTable.rake_rate : 5.0;
    const rakeCap = dbTable ? BigInt(dbTable.rake_cap) : BigInt(0);

    let rakeCalculated = BigInt(0);

    if (tableState.game_stage && tableState.game_stage !== 'preflop') {
      rakeCalculated = BigInt(Math.floor((totalRakedPotAmount * rakeRate) / 100));
      if (rakeCap > BigInt(0) && rakeCalculated > rakeCap) {
        rakeCalculated = rakeCap;
      }
    }

    const totalPotAmount = parseInt(tableState.total_pot || '0');

    // 3. Lưu lịch sử GameHand vào DB
    const hand = new GameHand();
    hand.table_id = roomId;
    hand.dealer_seat = parseInt(tableState.dealer_seat || '1');
    hand.small_blind_seat = parseInt(tableState.small_blind_seat || '0');
    hand.big_blind_seat = parseInt(tableState.big_blind_seat || '0');
    hand.community_cards = tableState.community_cards;
    hand.total_pot = totalPotAmount.toString();
    hand.rake_amount = rakeCalculated.toString();
    hand.hand_stage = (tableState.game_stage || 'preflop') as HandStage;
    hand.server_seed = tableState.server_seed || null;
    hand.client_seed = tableState.client_seed || null;
    hand.shuffled_deck = tableState.shuffled_deck || null;
    hand.ended_at = new Date();
    await hand.save();

    // 4. Lưu System Revenue
    if (rakeCalculated > BigInt(0)) {
      const revenue = new SystemRevenue();
      revenue.room_id = roomId;
      revenue.hand_id = hand.id;
      revenue.revenue_amount = rakeCalculated.toString();
      revenue.rake_rate_applied = rakeRate;
      revenue.pot_total = totalPotAmount.toString();
      await revenue.save();
    }

    // 5. Lưu HandPlayer
    const handPlayerPromises = seats.map(async (seat) => {
      const seatWinner = winnersLog.find(w => w.seat_number === seat.seat_number);
      const wonAmount = seatWinner ? seatWinner.win_amount : 0;
      const pocketCards = await this.gameService.stateService.getPlayerCards(roomId, seat.user_id);

      const totalChipsBetEarly = parseInt(seat.total_contributed || '0');
      const hp = new HandPlayer();
      hp.hand_id = hand.id;
      hp.user_id = seat.user_id;
      hp.hole_cards = pocketCards.join(',');
      hp.chips_before = (parseInt(seat.stack) + totalChipsBetEarly - wonAmount).toString();
      hp.chips_bet = totalChipsBetEarly.toString();
      hp.chips_won = wonAmount.toString();
      hp.net_gain_loss = (wonAmount - totalChipsBetEarly).toString();
      hp.is_winner = wonAmount > 0;
      hp.seat_number = seat.seat_number;
      await hp.save();
    });
    await Promise.all(handPlayerPromises);

    // 6. Lưu HandAction
    const bufferedActions = await this.gameService.stateService.getActionLogs(tableState.current_hand_id || '0');
    const handActionPromises = bufferedActions.map(async (actStr, idx) => {
      const actObj = JSON.parse(actStr);
      const action = new HandAction();
      action.hand_id = hand.id;
      action.user_id = actObj.user_id;
      action.seat_number = actObj.seat_number;
      action.stage = actObj.stage;
      action.action_type = actObj.action_type;
      action.amount = actObj.amount.toString();
      action.action_order = idx + 1;
      await action.save();
    });
    await Promise.all(handActionPromises);

    // 7. Dọn dẹp Action Timer và action logs
    this.gameService.clearActionTimer(roomId);
    if (tableState.current_hand_id) {
      await this.gameService.stateService.deleteActionLogs(tableState.current_hand_id);
    }

    // 8. Phát sự kiện hand-ended
    // Gửi bài của TẤT CẢ player không fold để FE có thể reveal đúng
    const allHandsForBroadcast = await Promise.all(
      seats
        .filter(s => s.status !== 'folded' && parseInt(s.total_contributed || '0') > 0)
        .map(async (seat) => {
          const pocketCards = await this.gameService.stateService.getPlayerCards(roomId, seat.user_id);
          return {
            user_id: seat.user_id,
            seat_number: seat.seat_number,
            pocket_cards: pocketCards,
          };
        })
    );

    console.log('[Finalize And BroadCast Hand] allHandsForBroadcast', JSON.stringify(allHandsForBroadcast));
    console.log('[Finalize And BroadCast Hand]winnersLog', JSON.stringify(winnersLog));
    console.log('[Finalize And BroadCast Hand]totalPotAmount', totalPotAmount);
    console.log('[Finalize And BroadCast Hand]rakeCalculated', rakeCalculated.toString());
    console.log('[Finalize And BroadCast Hand]tableState.server_seed', tableState.server_seed);
    console.log('[Finalize And BroadCast Hand]tableState.client_seed', tableState.client_seed);



    this.gameService.server.to(`table_${roomId}`).emit('table:hand-ended', {
      winners: winnersLog,
      all_hands: allHandsForBroadcast,
      total_pot: totalPotAmount,
      rake_amount: rakeCalculated.toString(),
      provably_fair: {
        server_seed_plain: tableState.server_seed,
        client_seed: tableState.client_seed,
      },
    });

    // 9. Reset Table State sang stage ended
    await this.gameService.stateService.setTableState(roomId, {
      game_stage: 'ended',
      total_pot: '0',
      current_highest_bet: '0',
      current_turn_seat: '0',
      is_running_board: '',
    });

    await this.gameService.broadcastTableState(roomId);

    // 10. Xử lý người chơi hết chip (Bust)
    const zeroStackPlayers = seats.filter(s => parseInt(s.stack) === 0);
    if (zeroStackPlayers.length > 0) {
      const bustPromises = zeroStackPlayers.map(async (player) => {
        this.gameService.server.to(`table_${roomId}`).emit('table:player-busted', {
          seat_number: player.seat_number,
          user_id: player.user_id,
        });

        this.gameService.server.to(`table_${roomId}`).emit('table:player-left-seat', {
          seat_number: player.seat_number,
          user_id: player.user_id,
        });

        await this.gameService.stateService.deleteSeat(roomId, player.seat_number);
        await this.gameService.stateService.deletePlayerCards(roomId, player.user_id);

        const session = await TableSession.findOne({
          where: { table_id: roomId, user_id: player.user_id, member_status: 'active' }
        });
        if (session) {
          session.member_status = 'left';
          session.left_at = new Date();
          await session.save();
        }
      });
      await Promise.all(bustPromises);

      await this.gameService.broadcastTableState(roomId);
    }

    // Auto-start ván mới sau 5s (giảm từ 11s để UX mượt hơn)
    setTimeout(async () => {
      try {
        this.gameService.logger.log(`[Auto-starting new hand] for room ${roomId} after delay.`);
        await this.gameService.startNewHand(roomId);
      } catch (e) {
        this.gameService.logger.error(`[Auto-starting new hand] Failed to auto-start new hand: ${e.message}`, e.stack);
      }
    }, 5000);
  }
}
