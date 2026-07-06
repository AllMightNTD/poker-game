import { PokerGameService } from '../services/poker-game.service';
import { TableSession } from '../entities/table_session.entity';
import { PokerTable } from '../entities/poker_table.entity';
import { HandStage } from '../entities/game_hand.entity';

export class PokerActionProcessor {
  constructor(private readonly gameService: PokerGameService) {}

  async processPlayerAction(
    roomId: string,
    seatNumber: number,
    actionType: string,
    amount: number,
  ) {
    const tableState = await this.gameService.stateService.getTableState(roomId);
    const seats = await this.gameService.stateService.getAllSeats(roomId);
    const activeSeat = seats.find(s => s.seat_number === seatNumber);

    const currentStage = tableState?.game_stage || 'waiting';
    const activeBettingStages = ['preflop', 'flop', 'turn', 'river'];
    if (!activeBettingStages.includes(currentStage.toLowerCase())) {
      throw new Error('Trận đấu đang không trong lượt đặt cược.');
    }

    const allowedActions = ['fold', 'check', 'call', 'raise', 'bet', 'allin'];
    const actualActionRaw = actionType?.toLowerCase();
    if (!allowedActions.includes(actualActionRaw)) {
      throw new Error('Hành động không hợp lệ.');
    }

    if (actualActionRaw === 'raise' || actualActionRaw === 'bet') {
      if (typeof amount !== 'number' || isNaN(amount) || !isFinite(amount) || amount < 0) {
        throw new Error('Số tiền cược không hợp lệ.');
      }
    }

    let stack = parseInt(activeSeat.stack);
    let currentBet = parseInt(activeSeat.current_bet || '0');
    let highestBet = parseInt(tableState.current_highest_bet || '0');
    const originalHighestBet = highestBet;
    let lastFullRaiseSize = parseInt(tableState.last_full_raise_size || '0');
    const dbTableForBB = await PokerTable.findOne({ where: { id: roomId } });
    const bbAmount = dbTableForBB ? parseInt(dbTableForBB.big_blind || '100') : 100;
    if (lastFullRaiseSize === 0) lastFullRaiseSize = bbAmount;

    let actionCost = 0;
    let actualAction = actionType.toLowerCase();
    let isFullRaise = false;

    // 1. Phân loại và tính toán chi phí chip
    if (actualAction === 'fold') {
      await this.gameService.stateService.setSeat(roomId, seatNumber, { status: 'folded' });
    } else if (actualAction === 'check') {
      if (currentBet < highestBet) {
        throw new Error('Không thể Check do mức cược của bạn thấp hơn mức cược hiện tại.');
      }
    } else if (actualAction === 'call') {
      actionCost = highestBet - currentBet;
      if (actionCost >= stack) {
        actionCost = stack;
        actualAction = 'allin';
      }
      stack -= actionCost;
      currentBet += actionCost;
    } else if (actualAction === 'raise' || actualAction === 'bet') {
      const targetBet = amount;
      if (targetBet > currentBet + stack) {
        throw new Error('Số chip cược vượt quá số phỉnh bạn đang có.');
      }
      if (targetBet <= highestBet) {
        throw new Error(`Cược tối thiểu phải lớn hơn mức cược cao nhất: ${highestBet}`);
      }
      if (actualAction === 'raise' && targetBet < highestBet + lastFullRaiseSize) {
        if (targetBet !== currentBet + stack) {
          throw new Error(`Raise tối thiểu phải là: ${highestBet + lastFullRaiseSize}`);
        }
      }
      actionCost = targetBet - currentBet;
      if (actionCost >= stack) {
        actionCost = stack;
        actualAction = 'allin';
        currentBet += actionCost;
        stack = 0;
        if (currentBet > originalHighestBet) {
          const increase = currentBet - originalHighestBet;
          if (increase >= lastFullRaiseSize) {
            isFullRaise = true;
            lastFullRaiseSize = increase;
          }
          highestBet = currentBet;
        }
      } else {
        stack -= actionCost;
        const increase = targetBet - originalHighestBet;
        if (increase >= lastFullRaiseSize) {
          isFullRaise = true;
          lastFullRaiseSize = increase;
        }
        currentBet = targetBet;
        highestBet = targetBet;
      }
    } else if (actualAction === 'allin') {
      actionCost = stack;
      currentBet += actionCost;
      stack = 0;
      if (currentBet > originalHighestBet) {
        const increase = currentBet - originalHighestBet;
        if (increase >= lastFullRaiseSize) {
          isFullRaise = true;
          lastFullRaiseSize = increase;
        }
        highestBet = currentBet;
      }
    }

    // 2. Cập nhật trạng thái Ghế ngồi lên Redis
    let nextStatus = activeSeat.status;
    if (actualAction === 'fold') {
      nextStatus = 'folded';
    } else if (actualAction === 'allin') {
      nextStatus = 'active';
    }

    const prevContributed = parseInt(activeSeat.total_contributed || '0');
    await this.gameService.stateService.setSeat(roomId, seatNumber, {
      stack: stack.toString(),
      current_bet: currentBet.toString(),
      status: nextStatus,
      has_acted: '1',
      total_contributed: (prevContributed + actionCost).toString(),
    });

    if (isFullRaise) {
      const otherActiveSeats = seats.filter(s => s.seat_number !== seatNumber && s.status === 'active');
      for (const os of otherActiveSeats) {
        await this.gameService.stateService.setSeat(roomId, os.seat_number, {
          has_acted: '0',
        });
      }
    }
    await this.gameService.syncSeatStackToDb(roomId, activeSeat.user_id, stack.toString());

    // 3. Cập nhật Pot & Highest Bet
    const currentPot = parseInt(tableState.total_pot || '0') + actionCost;
    await this.gameService.stateService.setTableState(roomId, {
      total_pot: currentPot.toString(),
      current_highest_bet: highestBet.toString(),
      last_full_raise_size: lastFullRaiseSize.toString(),
    });

    const actionLog = {
      seat_number: seatNumber,
      user_id: activeSeat.user_id,
      action_type: actualAction,
      amount: actionCost,
      stage: tableState.game_stage || 'preflop',
      timestamp: Date.now(),
    };
    await this.gameService.stateService.pushActionLog(tableState.current_hand_id || '0', JSON.stringify(actionLog));

    this.gameService.server.to(`table_${roomId}`).emit('table:action-recorded', {
      seat_number: seatNumber,
      action_type: actualAction,
      amount: actionCost,
      new_stack: stack,
      total_pot: currentPot,
    });

    // 4. Chuyển lượt đi tiếp theo hoặc kết thúc sớm
    const updatedSeats = await this.gameService.stateService.getAllSeats(roomId);
    const activePlayers = updatedSeats.filter(s => s.status === 'active');

    if (activePlayers.length === 1) {
      await this.gameService.endHandEarly(roomId, activePlayers[0].seat_number);
    } else if (activePlayers.length === 0) {
      await this.gameService.endHandEarly(roomId, seatNumber);
    } else {
      await this.advanceTurn(roomId);
    }
  }

  async advanceTurn(roomId: string) {
    const tableState = await this.gameService.stateService.getTableState(roomId);
    if (!tableState) return;

    const seats = await this.gameService.stateService.getAllSeats(roomId);
    const currentTurnSeat = parseInt(tableState.current_turn_seat || '0');
    const dbTable = await PokerTable.findOne({ where: { id: roomId } });
    const maxPlayers = dbTable ? dbTable.max_players : 9;

    const activePlayers = seats.filter(s => s.status === 'active');
    const highestBet = parseInt(tableState.current_highest_bet || '0');

    const playersNeedToAct = activePlayers.filter(s => parseInt(s.stack || '0') > 0);
    const anyoneNotActed = playersNeedToAct.some(p => p.has_acted !== '1');

    const allBetsEqual = activePlayers.every(s => {
      const playerBet = parseInt(s.current_bet || '0');
      const isAllIn = parseInt(s.stack || '0') === 0;
      return playerBet === highestBet || isAllIn;
    });

    const isRoundOver = !anyoneNotActed && allBetsEqual;

    if (isRoundOver) {
      await this.advanceStreet(roomId);
    } else {
      let nextSeatNum = currentTurnSeat;
      let found = false;

      for (let i = 0; i < maxPlayers; i++) {
        nextSeatNum = (nextSeatNum % maxPlayers) + 1;
        const seat = seats.find(s => s.seat_number === nextSeatNum);
        if (seat && seat.status === 'active' && parseInt(seat.stack || '0') > 0) {
          found = true;
          break;
        }
      }

      if (found) {
        await this.gameService.stateService.setTableState(roomId, { current_turn_seat: nextSeatNum.toString() });
        this.gameService.server.to(`table_${roomId}`).emit('table:turn-change', {
          seat_number: nextSeatNum,
          time_limit: 30,
        });
        this.gameService.startActionTimer(roomId, nextSeatNum, 30);
        await this.gameService.broadcastTableState(roomId);
        this.gameService.checkAndTriggerBotAction(roomId);
      } else {
        await this.advanceStreet(roomId);
      }
    }
  }

  async advanceStreet(roomId: string) {
    const tableState = await this.gameService.stateService.getTableState(roomId);
    if (!tableState) return;

    this.gameService.clearActionTimer(roomId);

    const currentStage = tableState.game_stage as HandStage;
    const seats = await this.gameService.stateService.getAllSeats(roomId);
    const activePlayers = seats.filter((s) => s.status === 'active');
    const activeNonAllIn = activePlayers.filter((s) => parseInt(s.stack || '0') > 0);

    const dbTable = await PokerTable.findOne({ where: { id: roomId } });
    const maxPlayers = dbTable ? dbTable.max_players : 9;

    const isAutoRunBoard = activePlayers.length >= 2 && activeNonAllIn.length <= 1;

    let nextStage: HandStage = 'showdown';
    if (currentStage === 'preflop') nextStage = 'flop';
    else if (currentStage === 'flop') nextStage = 'turn';
    else if (currentStage === 'turn') nextStage = 'river';

    let streetPotGained = 0;
    for (const s of seats) {
      streetPotGained += parseInt(s.current_bet || '0');
    }
    const newTotalPot = parseInt(tableState.total_pot || '0'); // Already accumulated in processPlayerAction

    let updatedCommunityCards = tableState.community_cards || '';
    let deck = await this.gameService.stateService.getDeck(roomId);

    if (nextStage === 'flop' && deck.length >= 3) {
      const flopCards = [deck.shift(), deck.shift(), deck.shift()];
      updatedCommunityCards = flopCards.join(',');
    } else if ((nextStage === 'turn' || nextStage === 'river') && deck.length >= 1) {
      const nextCard = deck.shift();
      updatedCommunityCards = updatedCommunityCards ? `${updatedCommunityCards},${nextCard}` : nextCard;
    }

    await this.gameService.stateService.setDeck(roomId, deck);

    for (const seat of seats) {
      await this.gameService.stateService.setSeat(roomId, seat.seat_number, {
        current_bet: '0',
        has_acted: '0',
      });
    }

    await this.gameService.stateService.setTableState(roomId, {
      game_stage: nextStage,
      total_pot: newTotalPot.toString(),
      current_highest_bet: '0',
      last_full_raise_size: '0',
      community_cards: updatedCommunityCards,
      current_turn_seat: '0',
    });

    this.gameService.server.to(`table_${roomId}`).emit('table:street-advanced', {
      game_stage: nextStage,
      community_cards: updatedCommunityCards ? updatedCommunityCards.split(',') : [],
      total_pot: newTotalPot,
    });

    if (nextStage === 'showdown') {
      await this.gameService.processShowdown(roomId);
    } else if (isAutoRunBoard) {
      const triggerAutoRun = (retryCount = 0) => {
        setTimeout(async () => {
          const hasLock = await this.gameService.stateService.acquireLock(roomId);
          if (!hasLock) {
            if (retryCount < 10) {
              triggerAutoRun(retryCount + 1);
            } else {
              this.gameService.logger.error(`Failed to acquire lock for Auto Run Board on table ${roomId} after 10 attempts.`);
            }
            return;
          }
          try {
            await this.advanceStreet(roomId);
          } finally {
            await this.gameService.stateService.releaseLock(roomId);
          }
        }, retryCount === 0 ? 2000 : 200);
      };
      triggerAutoRun();
    } else {
      let firstActSeat = parseInt(tableState.dealer_seat || '1');
      let foundFirst = false;

      for (let i = 0; i < maxPlayers; i++) {
        firstActSeat = (firstActSeat % maxPlayers) + 1;
        const s = seats.find((seat) => seat.seat_number === firstActSeat);
        if (s && s.status === 'active' && parseInt(s.stack || '0') > 0) {
          foundFirst = true;
          break;
        }
      }

      if (foundFirst) {
        await this.gameService.stateService.setTableState(roomId, { current_turn_seat: firstActSeat.toString() });
        this.gameService.server.to(`table_${roomId}`).emit('table:turn-change', {
          seat_number: firstActSeat,
          time_limit: 30,
        });
        this.gameService.startActionTimer(roomId, firstActSeat, 30);
        this.gameService.checkAndTriggerBotAction(roomId);
      } else {
        await this.advanceStreet(roomId);
      }
    }
    await this.gameService.broadcastTableState(roomId);
  }

  async executeAutoAction(roomId: string, seatNumber: number) {
    const lockAcquired = await this.gameService.stateService.acquireLock(roomId);
    if (!lockAcquired) {
      setTimeout(async () => {
        await this.executeAutoAction(roomId, seatNumber);
      }, 100);
      return;
    }

    try {
      const tableState = await this.gameService.stateService.getTableState(roomId);
      if (!tableState) return;

      const currentTurnSeat = parseInt(tableState.current_turn_seat || '0');
      if (currentTurnSeat !== seatNumber) {
        return;
      }

      const seats = await this.gameService.stateService.getAllSeats(roomId);
      const seat = seats.find(s => s.seat_number === seatNumber);

      if (!seat || (seat.status !== 'active' && seat.status !== 'disconnected' && seat.status !== 'sitting_out')) return;

      const currentBet = parseInt(seat.current_bet || '0');
      const highestBet = parseInt(tableState.current_highest_bet || '0');

      const action = currentBet >= highestBet ? 'check' : 'fold';
      await this.processPlayerAction(roomId, seatNumber, action, 0);

      const statsKey = `table:${roomId}:player:${seat.user_id}:stats`;
      const redis = this.gameService.stateService.getRedisClient();
      const timeouts = await redis.hincrby(statsKey, 'consecutive_timeouts', 1);

      if (timeouts >= 2) {
        this.gameService.logger.log(`User ${seat.user_id} timed out 2 times consecutively. Forcing sit-out.`);
        await this.gameService.stateService.setSeat(roomId, seatNumber, {
          status: 'sitting_out',
        });

        const session = await TableSession.findOne({
          where: {
            table_id: roomId,
            user_id: seat.user_id,
            member_status: 'active',
          },
        });
        if (session) {
          session.member_status = 'sitting_out';
          await session.save();
        }
      }
    } catch (err) {
      this.gameService.logger.error(`Error during auto action for seat ${seatNumber}: ${err.message}`);
    } finally {
      await this.gameService.stateService.releaseLock(roomId);
    }
  }
}
