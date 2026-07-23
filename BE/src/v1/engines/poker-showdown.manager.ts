import { UserStatus } from '../../constants/user-status';
import { PokerTable } from '../entities/poker_table.entity';
import { ProvablyFairAudit } from '../entities/provably_fair_audit.entity';
import { TableSession } from '../entities/table_session.entity';
import { User } from '../entities/user.entity';
import { PokerGameService } from '../services/poker-game.service';
import {
  PokerSeatState,
  PokerTableState,
  WinnerLog,
} from '../types/poker.types';
import { PokerGameEngine } from './poker-game.engine';

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

    const community1 = tableState.community_cards
      ? tableState.community_cards.split(',')
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

    // 0. Chuẩn bị dữ liệu cập nhật Refund
    const refundRedisUpdates: {
      seat_number: number;
      user_id: string;
      stack: string;
      total_contributed: string;
    }[] = [];

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

        refundRedisUpdates.push({
          seat_number: seat.seat_number,
          user_id: userId,
          stack: newStack.toString(),
          total_contributed: newContributed.toString(),
        });
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

    // 3. Chuẩn bị dữ liệu cập nhật Winner stack
    const winnersRedisUpdates: {
      seat_number: number;
      user_id: string;
      stack: string;
    }[] = [];

    for (const winner of winnersLog) {
      const winnerSeat = seats.find(
        (s) => s.seat_number === winner.seat_number,
      );
      if (winnerSeat) {
        const currentStack = parseInt(winnerSeat.stack || '0');
        const newStack = currentStack + winner.win_amount;
        winnerSeat.stack = newStack.toString();

        winnersRedisUpdates.push({
          seat_number: winner.seat_number,
          user_id: winnerSeat.user_id,
          stack: newStack.toString(),
        });
      }
    }

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

        const seatSuccess = Math.abs(expectedNewStack - actualNewStack) <= 1;
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
      }
    }

    // Decrypt the server seed for audit log and hand history
    let serverSeedPlain = '';
    if (tableState.encrypted_server_seed && tableState.auth_tag) {
      try {
        serverSeedPlain =
          this.gameService.provablyFairService.decryptServerSeed(
            tableState.encrypted_server_seed,
            tableState.auth_tag,
          );
      } catch (err) {
        this.gameService.logger.error(
          `Failed to decrypt server seed for table ${roomId}: ${err.message}`,
        );
      }
    }

    // Get nonce and serverSeedHash from database synchronously (Read-only) to pass to clients
    let nonce: number | null = null;
    let serverSeedHash: string | null = null;
    if (tableState.provably_fair_audit_id) {
      try {
        const audit = await ProvablyFairAudit.findOne({
          where: { id: tableState.provably_fair_audit_id },
        });
        if (audit) {
          nonce = audit.nonce;
          serverSeedHash = audit.server_seed_hash;
        }
      } catch (err) {
        this.gameService.logger.error(
          `Failed to fetch provably fair audit for table ${roomId}: ${err.message}`,
        );
      }
    }

    const zeroStackPlayers = seats.filter((s) => parseInt(s.stack) === 0);

    // ==========================================
    // DB TRANSACTION (保证 ACID)
    // ==========================================
    try {
      await this.gameService.dataSource.transaction(async (manager) => {
        // A. Cập nhật stack Refund vào DB
        for (const update of refundRedisUpdates) {
          await this.gameService.syncSeatStackToDb(
            roomId,
            update.user_id,
            update.stack,
            manager,
          );
        }

        // B. Cập nhật stack Winner vào DB
        for (const update of winnersRedisUpdates) {
          await this.gameService.syncSeatStackToDb(
            roomId,
            update.user_id,
            update.stack,
            manager,
          );
        }

        // C. Phạt user nếu Reconciliation thất bại
        for (const detail of reconciliationDetails) {
          if (!detail.success) {
            this.gameService.logger.error(
              `[RECONCILIATION ERROR] Money Exploit Detected! User ${detail.user_id} on seat ${detail.seat_number} of table ${roomId}. ` +
                `Start stack: ${detail.start_stack}, Bet: ${detail.total_bet}, Won: ${detail.won_amount}, Expected: ${detail.expected_stack}, Actual: ${detail.actual_stack}`,
            );
            const user = await manager.findOne(User, {
              where: { id: detail.user_id },
            });
            if (user) {
              user.status = UserStatus.BANNED;
              await manager.save(user);
              this.gameService.logger.warn(
                `[RECONCILIATION] User ${detail.user_id} has been BANNED due to chip discrepancy.`,
              );
            }
          } else {
            this.gameService.logger.log(
              `[RECONCILIATION] Success for User ${detail.user_id} on seat ${detail.seat_number}. Stack verified: ${detail.actual_stack}`,
            );
          }
        }

        // D. Cập nhật DB TableSession cho Busted Players
        for (const player of zeroStackPlayers) {
          const session = await manager.findOne(TableSession, {
            where: {
              table_id: roomId,
              user_id: player.user_id,
              member_status: 'active',
            },
          });
          if (session) {
            session.member_status = 'left';
            session.left_at = new Date();
            await manager.save(session);
          }
        }
      });
    } catch (txError) {
      this.gameService.logger.error(
        `[SHOWDOWN TRANSACTION ERROR] Rollbacked database changes for room ${roomId}: ${txError.message}`,
        txError.stack,
      );
      throw txError;
    }

    // ==========================================
    // REDIS STATE UPDATE (Chạy sau khi Tx thành công)
    // ==========================================

    // 0. Update Redis Refund
    for (const update of refundRedisUpdates) {
      await this.gameService.stateService.setSeat(roomId, update.seat_number, {
        stack: update.stack,
        total_contributed: update.total_contributed,
      });
      this.gameService.logger.log(
        `[REFUND] User ${update.user_id} refunded stack ${update.stack} uncalled bet.`,
      );
    }

    // 3. Update Redis Winner Stack
    for (const update of winnersRedisUpdates) {
      await this.gameService.stateService.setSeat(roomId, update.seat_number, {
        stack: update.stack,
      });
    }

    // ==========================================
    // ASYNCHRONOUS HAND HISTORY QUEUEING (BullMQ)
    // ==========================================
    try {
      // Đọc bài tẩy của các seats còn lại từ Redis
      const seatsWithCards = await Promise.all(
        seats.map(async (seat) => {
          const pocketCards =
            await this.gameService.stateService.getPlayerCards(
              roomId,
              seat.user_id,
            );
          return {
            user_id: seat.user_id,
            username: seat.username,
            avatar: seat.avatar,
            seat_number: seat.seat_number,
            stack: seat.stack,
            total_contributed: seat.total_contributed,
            muck_cards: seat.muck_cards,
            pocketCards,
          };
        }),
      );

      // Đọc buffered actions từ Redis
      const bufferedActions = await this.gameService.stateService.getActionLogs(
        tableState.current_hand_id || '0',
      );

      await this.gameService.historyQueue.add(
        'log-history',
        {
          roomId,
          totalPotAmount,
          rakeCalculated: rakeCalculated.toString(),
          rakeRate,
          tableState: {
            dealer_seat: tableState.dealer_seat,
            small_blind_seat: tableState.small_blind_seat,
            big_blind_seat: tableState.big_blind_seat,
            community_cards: tableState.community_cards,
            game_stage: tableState.game_stage,
            client_seed: tableState.client_seed,
            shuffled_deck: tableState.shuffled_deck,
            provably_fair_audit_id: tableState.provably_fair_audit_id,
            current_hand_id: tableState.current_hand_id,
            room_name: tableState.room_name,
          },
          serverSeedPlain,
          seats: seatsWithCards,
          winnersLog,
          userRakeShares,
          reconciliationSuccess,
          reconciliationDetails,
          bufferedActions,
        },
        {
          attempts: 3,
          backoff: {
            type: 'exponential',
            delay: 5000,
          },
          removeOnComplete: true,
          removeOnFail: false,
        },
      );
    } catch (queueErr) {
      this.gameService.logger.error(
        `Failed to enqueue hand history logging job for room ${roomId}: ${queueErr.message}`,
        queueErr.stack,
      );
    }

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
          const isAllIn =
            parseInt(seat.stack || '0') === 0 &&
            parseInt(seat.total_contributed || '0') > 0;
          const shouldMuck =
            !isWinner &&
            !isAllIn &&
            autoMuck &&
            dbTable?.custom_settings?.allow_muck;
          return {
            user_id: seat.user_id,
            seat_number: seat.seat_number,
            pocket_cards: shouldMuck ? [] : pocketCards,
            is_mucked: shouldMuck,
          };
        }),
    );

    const playerResults = seats
      .map((seat) => {
        const winnerData = winnersLog.find((w) => w.user_id === seat.user_id);
        const wonAmount = winnerData ? winnerData.win_amount : 0;
        const contributed = parseInt(seat.total_contributed || '0');

        // Calculate net result for the hand
        // Note: seat.total_contributed has already been adjusted for uncalled refunds
        const netResult = wonAmount - contributed;

        return {
          user_id: seat.user_id,
          seat_number: seat.seat_number,
          win_amount: wonAmount,
          net_result: netResult,
        };
      })
      .filter((r) => r.win_amount !== 0 || r.net_result !== 0);

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
      player_results: playerResults,
      provably_fair: {
        server_seed_plain: serverSeedPlain || null,
        server_seed_hash: serverSeedHash || null,
        client_seed: tableState.client_seed,
        nonce: nonce || null,
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
