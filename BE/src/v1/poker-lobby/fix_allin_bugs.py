file_path = "src/v1/poker-lobby/poker-lobby.gateway.ts"

with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# ==============================================================================
# BUG 1: advanceTurn triggers advanceStreet prematurely when activeNonAllIn.length <= 1
# but remaining players haven't acted yet (e.g. heads-up A all-in, B hasn't called)
# FIX: Change <= 1 to === 0  (only skip to next street if NOBODY has chips)
# ==============================================================================
old_advance_turn_condition = """    // 2. Xử lý Logic chuyển Street hoặc chuyển Turn
    if (isRoundOver || activeNonAllIn.length <= 1) {
      // Nếu chỉ còn 1 người còn chip (những người khác đã fold hoặc all-in sạch) -> Kết thúc betting round ngay
      await this.advanceStreet(roomId);"""

new_advance_turn_condition = """    // 2. Xử lý Logic chuyển Street hoặc chuyển Turn
    // isRoundOver: tất cả người có chip đã hành động và bets bằng nhau
    // activeNonAllIn.length === 0: tất cả mọi người đều all-in, không ai cần hành động nữa
    if (isRoundOver || activeNonAllIn.length === 0) {
      await this.advanceStreet(roomId);"""

if old_advance_turn_condition in content:
    content = content.replace(old_advance_turn_condition, new_advance_turn_condition)
    print("BUG 1 FIXED: advanceTurn premature trigger (<=1 → ===0)")
else:
    print("BUG 1: Target not found")

# ==============================================================================
# BUG 2: processShowdown uses current_bet (reset to 0 each street) for pot split.
# After Run the Board, all current_bets are 0 → splitPot returns [] → nobody wins.
# FIX: Track total_contributed per seat, use it instead of current_bet in splitPot.
# ==============================================================================

# 2a. Reset total_contributed in startNewHand seat reset block (waiting_for_next_hand branch)
old_reset_waiting = """        if (seat.status === 'waiting_for_next_hand') {
          await this.stateService.setSeat(roomId, seat.seat_number, {
            status: 'active',
            current_bet: '0',
            has_acted: '0',
          });"""
new_reset_waiting = """        if (seat.status === 'waiting_for_next_hand') {
          await this.stateService.setSeat(roomId, seat.seat_number, {
            status: 'active',
            current_bet: '0',
            has_acted: '0',
            total_contributed: '0',
          });"""

if old_reset_waiting in content:
    content = content.replace(old_reset_waiting, new_reset_waiting)
    print("BUG 2a FIXED: total_contributed reset (waiting_for_next_hand branch)")
else:
    print("BUG 2a: Target not found")

# 2b. Reset total_contributed in startNewHand seat reset block (active/folded branch)
old_reset_active = """        } else if (seat.status === 'active' || seat.status === 'folded') {
          await this.stateService.setSeat(roomId, seat.seat_number, {
            status: 'active',
            current_bet: '0',
            has_used_extra_time: '0',
            has_acted: '0',
          });"""
new_reset_active = """        } else if (seat.status === 'active' || seat.status === 'folded') {
          await this.stateService.setSeat(roomId, seat.seat_number, {
            status: 'active',
            current_bet: '0',
            has_used_extra_time: '0',
            has_acted: '0',
            total_contributed: '0',
          });"""

if old_reset_active in content:
    content = content.replace(old_reset_active, new_reset_active)
    print("BUG 2b FIXED: total_contributed reset (active/folded branch)")
else:
    print("BUG 2b: Target not found")

# 2c. Track ante in total_contributed
old_ante_setSeat = """          await this.stateService.setSeat(roomId, player.seat_number, {
            stack: newStack.toString(),
          });
          await this.syncSeatStackToDb(roomId, player.user_id, newStack.toString());
        }
      }

      // Tạo Server Seed Hash công khai (Provably Fair)"""

new_ante_setSeat = """          const currentContributed = parseInt(player.total_contributed || '0');
          await this.stateService.setSeat(roomId, player.seat_number, {
            stack: newStack.toString(),
            total_contributed: (currentContributed + actualAnte).toString(),
          });
          await this.syncSeatStackToDb(roomId, player.user_id, newStack.toString());
        }
      }

      // Tạo Server Seed Hash công khai (Provably Fair)"""

if old_ante_setSeat in content:
    content = content.replace(old_ante_setSeat, new_ante_setSeat)
    print("BUG 2c FIXED: track ante in total_contributed")
else:
    print("BUG 2c: Target not found")

# 2d. Track SB in total_contributed
old_sb_setSeat = """      if (sbPlayer) {
        const currentStack = parseInt(sbPlayer.stack);
        sbBet = Math.min(currentStack, sbAmount);
        const sbStack = currentStack - sbBet;
        await this.stateService.setSeat(roomId, sbSeat, {
          stack: sbStack.toString(),
          current_bet: sbBet.toString(),
        });
        await this.syncSeatStackToDb(roomId, sbPlayer.user_id, sbStack.toString());
      }"""

new_sb_setSeat = """      if (sbPlayer) {
        const currentStack = parseInt(sbPlayer.stack);
        sbBet = Math.min(currentStack, sbAmount);
        const sbStack = currentStack - sbBet;
        const sbContributed = parseInt(sbPlayer.total_contributed || '0') + sbBet;
        await this.stateService.setSeat(roomId, sbSeat, {
          stack: sbStack.toString(),
          current_bet: sbBet.toString(),
          total_contributed: sbContributed.toString(),
        });
        await this.syncSeatStackToDb(roomId, sbPlayer.user_id, sbStack.toString());
      }"""

if old_sb_setSeat in content:
    content = content.replace(old_sb_setSeat, new_sb_setSeat)
    print("BUG 2d FIXED: track SB blind in total_contributed")
else:
    print("BUG 2d: Target not found")

# 2e. Track BB in total_contributed
old_bb_setSeat = """      if (bbPlayer) {
        const currentStack = parseInt(bbPlayer.stack);
        bbBet = Math.min(currentStack, bbAmount);
        const bbStack = currentStack - bbBet;
        await this.stateService.setSeat(roomId, bbSeat, {
          stack: bbStack.toString(),
          current_bet: bbBet.toString(),
        });
        await this.syncSeatStackToDb(roomId, bbPlayer.user_id, bbStack.toString());
      }"""

new_bb_setSeat = """      if (bbPlayer) {
        const currentStack = parseInt(bbPlayer.stack);
        bbBet = Math.min(currentStack, bbAmount);
        const bbStack = currentStack - bbBet;
        const bbContributed = parseInt(bbPlayer.total_contributed || '0') + bbBet;
        await this.stateService.setSeat(roomId, bbSeat, {
          stack: bbStack.toString(),
          current_bet: bbBet.toString(),
          total_contributed: bbContributed.toString(),
        });
        await this.syncSeatStackToDb(roomId, bbPlayer.user_id, bbStack.toString());
      }"""

if old_bb_setSeat in content:
    content = content.replace(old_bb_setSeat, new_bb_setSeat)
    print("BUG 2e FIXED: track BB blind in total_contributed")
else:
    print("BUG 2e: Target not found")

# 2f. Track action cost in total_contributed inside processPlayerAction
# The seat state update block — add total_contributed tracking
old_seat_state_update = """    let nextStatus = activeSeat.status;
    if (actualAction === 'fold') {
      nextStatus = 'folded';
    } else if (actualAction === 'allin') {
      nextStatus = 'active';
    }

    await this.stateService.setSeat(roomId, seatNumber, {
      stack: stack.toString(),
      current_bet: currentBet.toString(),
      status: nextStatus,
      has_acted: '1',
    });"""

new_seat_state_update = """    let nextStatus = activeSeat.status;
    if (actualAction === 'fold') {
      nextStatus = 'folded';
    } else if (actualAction === 'allin') {
      nextStatus = 'active';
    }

    const prevContributed = parseInt(activeSeat.total_contributed || '0');
    await this.stateService.setSeat(roomId, seatNumber, {
      stack: stack.toString(),
      current_bet: currentBet.toString(),
      status: nextStatus,
      has_acted: '1',
      total_contributed: (prevContributed + actionCost).toString(),
    });"""

if old_seat_state_update in content:
    content = content.replace(old_seat_state_update, new_seat_state_update)
    print("BUG 2f FIXED: track actionCost in total_contributed in processPlayerAction")
else:
    print("BUG 2f: Target not found")

# 2g. Fix processShowdown to use total_contributed instead of current_bet for splitPot
old_player_bet_states = """    // Xử lý phân chia Side Pot
    // Tạo cấu trúc cược của từng player đóng góp trong ván
    const playerBetStates = seats.map(s => ({
      seat: s.seat_number,
      bet: parseInt(s.current_bet || '0'), // Hoặc cộng dồn lượng bet suốt cả ván
      folded: s.status === 'folded',
      allIn: parseInt(s.stack) === 0,
    }));"""

new_player_bet_states = """    // Xử lý phân chia Side Pot
    // Dùng total_contributed (tích lũy cả ván) thay vì current_bet (chỉ là cược vòng hiện tại, đã bị reset mỗi street)
    const playerBetStates = seats.map(s => ({
      seat: s.seat_number,
      bet: parseInt(s.total_contributed || '0'),
      folded: s.status === 'folded',
      allIn: parseInt(s.stack) === 0,
    }));"""

if old_player_bet_states in content:
    content = content.replace(old_player_bet_states, new_player_bet_states)
    print("BUG 2g FIXED: processShowdown splitPot uses total_contributed")
else:
    print("BUG 2g: Target not found")

# 2h. Fix HandPlayer saving in processShowdown to use total_contributed
old_hp_chips_bet = """      const hp = new HandPlayer();
      hp.hand_id = hand.id;
      hp.user_id = seat.user_id;
      hp.hole_cards = pocketCards.join(',');
      hp.chips_before = (parseInt(seat.stack) + parseInt(seat.current_bet || '0') - wonAmount).toString();
      hp.chips_bet = (seat.current_bet || '0').toString();
      hp.chips_won = wonAmount.toString();
      hp.net_gain_loss = (wonAmount - parseInt(seat.current_bet || '0')).toString();
      hp.is_winner = wonAmount > 0;
      await hp.save();
    }

    // Lưu nhật ký cược hành động từ Redis cache sang MySQL"""

new_hp_chips_bet = """      const totalChipsBet = parseInt(seat.total_contributed || '0');
      const hp = new HandPlayer();
      hp.hand_id = hand.id;
      hp.user_id = seat.user_id;
      hp.hole_cards = pocketCards.join(',');
      hp.chips_before = (parseInt(seat.stack) + totalChipsBet - wonAmount).toString();
      hp.chips_bet = totalChipsBet.toString();
      hp.chips_won = wonAmount.toString();
      hp.net_gain_loss = (wonAmount - totalChipsBet).toString();
      hp.is_winner = wonAmount > 0;
      await hp.save();
    }

    // Lưu nhật ký cược hành động từ Redis cache sang MySQL"""

if old_hp_chips_bet in content:
    content = content.replace(old_hp_chips_bet, new_hp_chips_bet)
    print("BUG 2h FIXED: HandPlayer chips_bet uses total_contributed in processShowdown")
else:
    print("BUG 2h: Target not found")

# 2i. Fix HandPlayer saving in endHandEarly to use total_contributed
old_hp_early = """      const hp = new HandPlayer();
      hp.hand_id = hand.id;
      hp.user_id = seat.user_id;
      hp.hole_cards = pocketCards.join(',');
      hp.chips_before = (parseInt(seat.stack) + parseInt(seat.current_bet || '0') - wonAmount).toString();
      hp.chips_bet = (seat.current_bet || '0').toString();
      hp.chips_won = wonAmount.toString();
      hp.net_gain_loss = (wonAmount - parseInt(seat.current_bet || '0')).toString();
      hp.is_winner = wonAmount > 0;
      await hp.save();
    }

    // 6. Lưu HandAction"""

new_hp_early = """      const totalChipsBetEarly = parseInt(seat.total_contributed || '0');
      const hp = new HandPlayer();
      hp.hand_id = hand.id;
      hp.user_id = seat.user_id;
      hp.hole_cards = pocketCards.join(',');
      hp.chips_before = (parseInt(seat.stack) + totalChipsBetEarly - wonAmount).toString();
      hp.chips_bet = totalChipsBetEarly.toString();
      hp.chips_won = wonAmount.toString();
      hp.net_gain_loss = (wonAmount - totalChipsBetEarly).toString();
      hp.is_winner = wonAmount > 0;
      await hp.save();
    }

    // 6. Lưu HandAction"""

if old_hp_early in content:
    content = content.replace(old_hp_early, new_hp_early)
    print("BUG 2i FIXED: HandPlayer chips_bet uses total_contributed in endHandEarly")
else:
    print("BUG 2i: Target not found")

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)

print("\nAll fixes applied!")
