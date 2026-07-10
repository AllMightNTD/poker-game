import { UserStatus } from '../../constants/user-status';
import { GameHand, HandStage } from '../entities/game_hand.entity';
import { HandAction } from '../entities/hand_action.entity';
import { HandPlayer } from '../entities/hand_player.entity';
import { PokerTable } from '../entities/poker_table.entity';
import { SystemRevenue } from '../entities/system_revenue.entity';
import { TableSession } from '../entities/table_session.entity';
import { User } from '../entities/user.entity';
import { PokerGameEngine } from './poker-game.engine';
import { PokerGameService } from '../services/poker-game.service';
import {
  PokerSeatState,
  PokerTableState,
  WinnerLog,
} from '../types/poker.types';

export class PokerShowdownManager {
  constructor(private readonly gameService: PokerGameService) {}

  async processShowdown(roomId: string) {
    this.gameService.logger.log(`[SHOWDOWN] START roomId=${roomId}`);

    const tableState =
      await this.gameService.stateService.getTableState(roomId);
    const seats = await this.gameService.stateService.getAllSeats(roomId);

    const dbTable = await PokerTable.findOne({ where: { id: roomId } });
    const maxPlayers = dbTable ? dbTable.max_players : 9;

    const activePlayers = seats.filter(
      (s) => parseInt(s.total_contributed || '0') > 0 && s.status !== 'folded',
    );

    const isRitActive = tableState.is_rit_active === '1';
    const community1 = tableState.community_cards
      ? tableState.community_cards.split(',')
      : [];
    const community2 =
      isRitActive && tableState.rit_board2_cards
        ? tableState.rit_board2_cards.split(',')
        : [];

    const evaluatedPlayers1 = await Promise.all(
      activePlayers.map(async (p) => {
        const pocket = await this.gameService.stateService.getPlayerCards(
          roomId,
          p.user_id,
        );
        const evalResult = PokerGameEngine.evaluate7CardHand([
          ...pocket,
          ...community1,
        ]);

        this.gameService.logger.log(
          `[SHOWDOWN] Board 1 eval player seat=${p.seat_number} user=${p.user_id} pocket=${pocket.join(',')} score=${evalResult.score} hand=${evalResult.name}`,
        );

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

    let evaluatedPlayers2: typeof evaluatedPlayers1 = [];
    if (isRitActive) {
      evaluatedPlayers2 = await Promise.all(
        activePlayers.map(async (p) => {
          const pocket = await this.gameService.stateService.getPlayerCards(
            roomId,
            p.user_id,
          );
          const evalResult = PokerGameEngine.evaluate7CardHand([
            ...pocket,
            ...community2,
          ]);

          this.gameService.logger.log(
            `[SHOWDOWN] Board 2 eval player seat=${p.seat_number} user=${p.user_id} pocket=${pocket.join(',')} score=${evalResult.score} hand=${evalResult.name}`,
          );

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
    }

    const playerBetStates = seats.map((s) => ({
      seat: s.seat_number,
      bet: parseInt(s.total_contributed || '0'),
      folded: s.status === 'folded',
      allIn:
        parseInt(s.stack || '0') === 0 &&
        parseInt(s.total_contributed || '0') > 0,
    }));

    const pots = PokerGameEngine.splitPot(playerBetStates);
    const winnerMap = new Map();
    let totalRakedPot = 0;
    const uncalledRefunds = new Map<string, number>();
    const dealerSeatNum = parseInt(tableState.dealer_seat || '1');

    for (const [i, pot] of pots.entries()) {
      if (pot.isUncalled) {
        const seatNum = pot.eligibleSeats[0];
        const player = seats.find((s) => s.seat_number === seatNum);
        if (player) {
          uncalledRefunds.set(
            player.user_id,
            (uncalledRefunds.get(player.user_id) || 0) + pot.amount,
          );
        }
        continue;
      }

      totalRakedPot += pot.amount;

      if (isRitActive) {
        const amount1 = Math.floor(pot.amount / 2) + (pot.amount % 2);
        const amount2 = Math.floor(pot.amount / 2);

        // Distribute for Board 1
        if (amount1 > 0) {
          const eligible1 = evaluatedPlayers1.filter((p) =>
            pot.eligibleSeats.includes(p.seat),
          );
          if (eligible1.length > 0) {
            let maxScore = -1;
            let potWinners: typeof eligible1 = [];
            for (const player of eligible1) {
              if (player.score > maxScore) {
                maxScore = player.score;
                potWinners = [player];
              } else if (player.score === maxScore) {
                potWinners.push(player);
              }
            }
            const winShare = Math.floor(amount1 / potWinners.length);
            let remainder = amount1 % potWinners.length;
            potWinners.sort((a, b) => {
              const distA =
                (a.seat - dealerSeatNum - 1 + maxPlayers) % maxPlayers;
              const distB =
                (b.seat - dealerSeatNum - 1 + maxPlayers) % maxPlayers;
              return distA - distB;
            });
            for (const winner of potWinners) {
              const extraChip = remainder > 0 ? 1 : 0;
              if (remainder > 0) remainder--;
              const finalWinAmount = winShare + extraChip;
              const existing = winnerMap.get(winner.user_id);
              const potLabel =
                pots.length === 1 ? 'Board 1' : `Board 1 - Pot ${i}`;
              if (existing) {
                existing.win_amount += finalWinAmount;
                if (!existing.pots) existing.pots = [];
                existing.pots.push({ label: potLabel, amount: finalWinAmount });
              } else {
                winnerMap.set(winner.user_id, {
                  user_id: winner.user_id,
                  seat_number: winner.seat,
                  username: winner.username,
                  win_amount: finalWinAmount,
                  hand_name: winner.handName,
                  pocket_cards: winner.pocket,
                  pots: [{ label: potLabel, amount: finalWinAmount }],
                });
              }
            }
          }
        }

        // Distribute for Board 2
        if (amount2 > 0) {
          const eligible2 = evaluatedPlayers2.filter((p) =>
            pot.eligibleSeats.includes(p.seat),
          );
          if (eligible2.length > 0) {
            let maxScore = -1;
            let potWinners: typeof eligible2 = [];
            for (const player of eligible2) {
              if (player.score > maxScore) {
                maxScore = player.score;
                potWinners = [player];
              } else if (player.score === maxScore) {
                potWinners.push(player);
              }
            }
            const winShare = Math.floor(amount2 / potWinners.length);
            let remainder = amount2 % potWinners.length;
            potWinners.sort((a, b) => {
              const distA =
                (a.seat - dealerSeatNum - 1 + maxPlayers) % maxPlayers;
              const distB =
                (b.seat - dealerSeatNum - 1 + maxPlayers) % maxPlayers;
              return distA - distB;
            });
            for (const winner of potWinners) {
              const extraChip = remainder > 0 ? 1 : 0;
              if (remainder > 0) remainder--;
              const finalWinAmount = winShare + extraChip;
              const existing = winnerMap.get(winner.user_id);
              const potLabel =
                pots.length === 1 ? 'Board 2' : `Board 2 - Pot ${i}`;
              if (existing) {
                existing.win_amount += finalWinAmount;
                if (!existing.pots) existing.pots = [];
                existing.pots.push({ label: potLabel, amount: finalWinAmount });
              } else {
                winnerMap.set(winner.user_id, {
                  user_id: winner.user_id,
                  seat_number: winner.seat,
                  username: winner.username,
                  win_amount: finalWinAmount,
                  hand_name: winner.handName,
                  pocket_cards: winner.pocket,
                  pots: [{ label: potLabel, amount: finalWinAmount }],
                });
              }
            }
          }
        }
      } else {
        const eligibleEvaluations = evaluatedPlayers1.filter((p) =>
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
          const potLabel =
            pots.length === 1
              ? undefined
              : i === 0
                ? 'Main Pot'
                : `Side Pot ${i}`;

          if (existing) {
            existing.win_amount += finalWinAmount;
            if (!existing.pots) existing.pots = [];
            existing.pots.push({ label: potLabel, amount: finalWinAmount });
          } else {
            winnerMap.set(winner.user_id, {
              user_id: winner.user_id,
              seat_number: winner.seat,
              username: winner.username,
              win_amount: finalWinAmount,
              hand_name: winner.handName,
              pocket_cards: winner.pocket,
              pots: [{ label: potLabel, amount: finalWinAmount }],
            });
          }
        }
      }
    }

    const winnersLog = Array.from(winnerMap.values());

    console.log('[Process ShowDown Winner Log]', JSON.stringify(winnersLog));

    await this.finalizeAndBroadcastHand(
      roomId,
      winnersLog,
      totalRakedPot,
      tableState,
      seats,
      uncalledRefunds,
    );
  }

  async endHandEarly(roomId: string, winnerSeatNumber: number) {
    const tableState =
      await this.gameService.stateService.getTableState(roomId);
    if (!tableState) return;

    const seats = await this.gameService.stateService.getAllSeats(roomId);
    const winnerSeat = seats.find((s) => s.seat_number === winnerSeatNumber);
    if (!winnerSeat) return;

    const playerBetStates = seats.map((s) => ({
      seat: s.seat_number,
      bet: parseInt(s.total_contributed || '0'),
      folded: s.status === 'folded',
      allIn:
        parseInt(s.stack || '0') === 0 &&
        parseInt(s.total_contributed || '0') > 0,
    }));

    const pots = PokerGameEngine.splitPot(playerBetStates);
    let totalRakedPot = 0;
    let totalWin = 0;
    const uncalledRefunds = new Map<string, number>();

    for (const pot of pots) {
      if (pot.isUncalled) {
        const seatNum = pot.eligibleSeats[0];
        const player = seats.find((s) => s.seat_number === seatNum);
        if (player) {
          uncalledRefunds.set(
            player.user_id,
            (uncalledRefunds.get(player.user_id) || 0) + pot.amount,
          );
        }
        continue;
      }

      if (pot.eligibleSeats.includes(winnerSeatNumber)) {
        totalWin += pot.amount;
        totalRakedPot += pot.amount;
      }
    }

    const winnersLog = [
      {
        user_id: winnerSeat.user_id,
        seat_number: winnerSeatNumber,
        username: winnerSeat.username,
        win_amount: totalWin,
        hand_name: 'Opponents Folded',
        pocket_cards: [],
        pots: [{ label: undefined, amount: totalWin }],
      },
    ];

    console.log('winnerLog EndHandEarly', winnersLog);

    await this.finalizeAndBroadcastHand(
      roomId,
      winnersLog,
      totalRakedPot,
      tableState,
      seats,
      uncalledRefunds,
    );
  }

  async finalizeAndBroadcastHand(
    roomId: string,
    winnersLog: WinnerLog[],
    totalRakedPotAmount: number,
    tableState: PokerTableState,
    seats: PokerSeatState[],
    uncalledRefunds: Map<string, number> = new Map(),
  ) {
    let totalPotAmount = parseInt(tableState.total_pot || '0');

    // 0. Xử lý Uncalled Refunds (trả lại tiền cược không ai theo)
    for (const [userId, refundAmount] of uncalledRefunds.entries()) {
      const seat = seats.find((s) => s.user_id === userId);
      if (seat) {
        const currentStack = parseInt(seat.stack || '0');
        const newStack = currentStack + refundAmount;
        seat.stack = newStack.toString();

        const currentContributed = parseInt(seat.total_contributed || '0');
        const newContributed = Math.max(0, currentContributed - refundAmount);
        seat.total_contributed = newContributed.toString();

        totalPotAmount -= refundAmount;

        await this.gameService.stateService.setSeat(roomId, seat.seat_number, {
          stack: newStack.toString(),
          total_contributed: newContributed.toString(),
        });
        await this.gameService.syncSeatStackToDb(
          roomId,
          userId,
          newStack.toString(),
        );
        this.gameService.logger.log(
          `[REFUND] User ${userId} refunded ${refundAmount} uncalled bet.`,
        );
      }
    }

    // 1. Khấu trừ Rake (mặc định 0 cho Home Game)
    const dbTable = await PokerTable.findOne({
      where: { id: roomId },
      relations: ['club'],
    });
    const rakeRate =
      dbTable?.club?.club_rake_rate !== undefined
        ? Number(dbTable.club.club_rake_rate)
        : (dbTable?.rake_rate ?? 0);
    const rakeCap =
      dbTable && dbTable.rake_cap !== undefined
        ? BigInt(dbTable.rake_cap)
        : BigInt(0);

    let rakeCalculated = BigInt(0);

    if (tableState.game_stage && tableState.game_stage !== 'preflop') {
      rakeCalculated = BigInt(
        Math.floor((totalRakedPotAmount * rakeRate) / 100),
      );
      if (rakeCap > BigInt(0) && rakeCalculated > rakeCap) {
        rakeCalculated = rakeCap;
      }
    }

    // 2. Trừ Rake từ số tiền thắng của người chơi
    const totalWinAmount = winnersLog.reduce((acc, w) => acc + w.win_amount, 0);
    const userRakeShares: { userId: string; rakePaid: string }[] = [];

    if (rakeCalculated > BigInt(0) && totalWinAmount > 0) {
      const rakeNum = Number(rakeCalculated);
      let remainingRake = rakeNum;

      for (let i = 0; i < winnersLog.length; i++) {
        const w = winnersLog[i];
        if (i === winnersLog.length - 1) {
          w.win_amount -= remainingRake;
          w.pots[w.pots.length - 1].amount -= remainingRake; // Update the last pot amount for UI
          userRakeShares.push({
            userId: w.user_id,
            rakePaid: remainingRake.toString(),
          });
        } else {
          const rakeShare = Math.floor(
            (w.win_amount / totalWinAmount) * rakeNum,
          );
          w.win_amount -= rakeShare;
          w.pots[w.pots.length - 1].amount -= rakeShare;
          remainingRake -= rakeShare;
          userRakeShares.push({
            userId: w.user_id,
            rakePaid: rakeShare.toString(),
          });
        }
      }
    }

    // 3. Cập nhật Stack người thắng
    const winnerPromises = winnersLog.map(async (winner) => {
      const winnerSeat = seats.find(
        (s) => s.seat_number === winner.seat_number,
      );
      if (winnerSeat) {
        const currentStack = parseInt(winnerSeat.stack || '0');
        const newStack = currentStack + winner.win_amount;
        winnerSeat.stack = newStack.toString();
        await this.gameService.stateService.setSeat(
          roomId,
          winner.seat_number,
          {
            stack: newStack.toString(),
          },
        );
        await this.gameService.syncSeatStackToDb(
          roomId,
          winnerSeat.user_id,
          newStack.toString(),
        );
      }
    });
    await Promise.all(winnerPromises);

    // 1.B. Reconciliation đối soát số phỉnh (Audit Trail & Anti-Money Exploit)
    let reconciliationSuccess = true;
    const reconciliationDetails = [];

    for (const seat of seats) {
      if (seat.start_stack) {
        const startStack = parseInt(seat.start_stack, 10);
        const totalChipsBetEarly = parseInt(seat.total_contributed || '0', 10);
        const seatWinner = winnersLog.find(
          (w) => w.seat_number === seat.seat_number,
        );
        const wonAmount = seatWinner ? seatWinner.win_amount : 0;

        const netGainLoss = wonAmount - totalChipsBetEarly;
        const expectedNewStack = startStack + netGainLoss;
        const actualNewStack = parseInt(seat.stack, 10);

        const seatSuccess = expectedNewStack === actualNewStack;
        if (!seatSuccess) {
          reconciliationSuccess = false;
        }

        reconciliationDetails.push({
          user_id: seat.user_id,
          seat_number: seat.seat_number,
          start_stack: startStack,
          total_bet: totalChipsBetEarly,
          won_amount: wonAmount,
          expected_stack: expectedNewStack,
          actual_stack: actualNewStack,
          success: seatSuccess,
        });

        if (!seatSuccess) {
          this.gameService.logger.error(
            `[RECONCILIATION ERROR] Money Exploit Detected! User ${seat.user_id} on seat ${seat.seat_number} of table ${roomId}. ` +
              `Start stack: ${startStack}, Bet: ${totalChipsBetEarly}, Won: ${wonAmount}, Expected: ${expectedNewStack}, Actual: ${actualNewStack}`,
          );
          // Block user account
          const user = await User.findOne({ where: { id: seat.user_id } });
          if (user) {
            user.status = UserStatus.BANNED;
            await user.save();
            this.gameService.logger.warn(
              `[RECONCILIATION] User ${seat.user_id} has been BANNED due to chip discrepancy.`,
            );
          }
        } else {
          this.gameService.logger.log(
            `[RECONCILIATION] Success for User ${seat.user_id} on seat ${seat.seat_number}. Stack verified: ${actualNewStack}`,
          );
        }
      }
    }

    // totalPotAmount already has refund subtracted

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

    // Emit event
    this.gameService.eventEmitter.emit('poker.hand.completed', {
      roomId,
      handId: hand.id,
      totalPot: totalPotAmount,
      rakeAmount: rakeCalculated.toString(),
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
      const seatWinner = winnersLog.find(
        (w) => w.seat_number === seat.seat_number,
      );
      const wonAmount = seatWinner ? seatWinner.win_amount : 0;
      const pocketCards = await this.gameService.stateService.getPlayerCards(
        roomId,
        seat.user_id,
      );

      const totalChipsBetEarly = parseInt(seat.total_contributed || '0');
      const hp = new HandPlayer();
      hp.hand_id = hand.id;
      hp.user_id = seat.user_id;
      hp.hole_cards = pocketCards.join(',');
      hp.chips_before = (
        parseInt(seat.stack) +
        totalChipsBetEarly -
        wonAmount
      ).toString();
      hp.chips_bet = totalChipsBetEarly.toString();
      hp.chips_won = wonAmount.toString();
      hp.net_gain_loss = (wonAmount - totalChipsBetEarly).toString();
      hp.is_winner = wonAmount > 0;
      hp.seat_number = seat.seat_number;
      await hp.save();
    });
    await Promise.all(handPlayerPromises);

    // 6. Lưu HandAction
    const bufferedActions = await this.gameService.stateService.getActionLogs(
      tableState.current_hand_id || '0',
    );
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
      await this.gameService.stateService.deleteActionLogs(
        tableState.current_hand_id,
      );
    }

    // 8. Phát sự kiện hand-ended
    // Gửi bài của TẤT CẢ player không fold để FE có thể reveal đúng
    const winnerUserIds = winnersLog.map((w) => w.user_id);

    const allHandsForBroadcast = await Promise.all(
      seats
        .filter(
          (s) =>
            s.status !== 'folded' && parseInt(s.total_contributed || '0') > 0,
        )
        .map(async (seat) => {
          const pocketCards =
            await this.gameService.stateService.getPlayerCards(
              roomId,
              seat.user_id,
            );
          const isWinner = winnerUserIds.includes(seat.user_id);
          const autoMuck = seat.muck_cards === '1';
          const shouldMuck =
            !isWinner && autoMuck && dbTable?.custom_settings?.allow_muck;
          return {
            user_id: seat.user_id,
            seat_number: seat.seat_number,
            pocket_cards: shouldMuck ? [] : pocketCards,
            is_mucked: shouldMuck,
          };
        }),
    );

    console.log(
      '[Finalize And BroadCast Hand] allHandsForBroadcast',
      JSON.stringify(allHandsForBroadcast),
    );
    console.log(
      '[Finalize And BroadCast Hand]winnersLog',
      JSON.stringify(winnersLog),
    );
    console.log('[Finalize And BroadCast Hand]totalPotAmount', totalPotAmount);
    console.log(
      '[Finalize And BroadCast Hand]rakeCalculated',
      rakeCalculated.toString(),
    );
    console.log(
      '[Finalize And BroadCast Hand]tableState.server_seed',
      tableState.server_seed,
    );
    console.log(
      '[Finalize And BroadCast Hand]tableState.client_seed',
      tableState.client_seed,
    );

    this.gameService.server.to(`table_${roomId}`).emit('table:hand-ended', {
      winners: winnersLog,
      all_hands: allHandsForBroadcast,
      total_pot: totalPotAmount,
      rake_amount: rakeCalculated.toString(),
      rit_board2_cards:
        tableState.is_rit_active === '1' && tableState.rit_board2_cards
          ? tableState.rit_board2_cards.split(',')
          : [],
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
    const zeroStackPlayers = seats.filter((s) => parseInt(s.stack) === 0);
    if (zeroStackPlayers.length > 0) {
      const bustPromises = zeroStackPlayers.map(async (player) => {
        this.gameService.server
          .to(`table_${roomId}`)
          .emit('table:player-busted', {
            seat_number: player.seat_number,
            user_id: player.user_id,
          });

        this.gameService.server
          .to(`table_${roomId}`)
          .emit('table:player-left-seat', {
            seat_number: player.seat_number,
            user_id: player.user_id,
          });

        await this.gameService.stateService.deleteSeat(
          roomId,
          player.seat_number,
        );
        await this.gameService.stateService.deletePlayerCards(
          roomId,
          player.user_id,
        );

        const session = await TableSession.findOne({
          where: {
            table_id: roomId,
            user_id: player.user_id,
            member_status: 'active',
          },
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
        this.gameService.logger.log(
          `[Auto-starting new hand] for room ${roomId} after delay.`,
        );
        await this.gameService.startNewHand(roomId);
      } catch (e) {
        this.gameService.logger.error(
          `[Auto-starting new hand] Failed to auto-start new hand: ${e.message}`,
          e.stack,
        );
      }
    }, 5000);
  }
}
