class BettingRound:
    def __init__(self, players, stage):
        self.players = players # Danh sách player chưa fold
        self.stage = stage
        self.highest_bet = 20   # Ví dụ Big Blind là 20
        
        # Tạo một dictionary để track xem player đã hành động ở vòng này chưa
        self.has_acted = {player.id: False for player in players}

    def process_action(self, player, action):
        """ Hàm xử lý khi player bấm nút """
        self.has_acted[player.id] = True

        if action == "FOLD":
            player.is_folded = True
        elif action == "CALL":
            player.bet_chips(self.highest_bet)
        elif action == "RAISE":
            self.highest_bet = action.amount
            player.bet_chips(self.highest_bet)
            # Khi có người RAISE, tất cả những người khác phải hành động lại
            self.reset_acted_except(player)
        elif action == "CHECK":
            # CHECK chỉ hợp lệ khi tiền cược của player đó đã bằng highest_bet
            pass 

        # Sau mỗi hành động, kiểm tra xem vòng cược đã kết thúc chưa để CHIA BÀI
        if self.is_round_over():
            self.go_to_next_stage() # Gọi hàm chia bài FLOP/TURN/RIVER
        else:
            self.move_to_next_player()

    def is_round_over(self):
        """
        THUẬT TOÁN QUYẾT ĐỊNH KẾT THÚC VÒNG CƯỢC
        """
        # Điều kiện 1: Tất cả player còn chơi ĐỀU PHẢI được hành động ít nhất 1 lần
        for player in self.players:
            if not player.is_folded and not self.has_acted[player.id]:
                return False # Còn người chưa được click nút -> Chưa kết thúc

        # Điều kiện 2: Số tiền cược hiện tại của những người chưa fold phải BẰNG NHAU
        active_bets = [p.current_round_bet for p in self.players if not p.is_folded]
        
        # Nếu tất cả số tiền trong active_bets bằng nhau (Tập hợp set chỉ có 1 phần tử duy nhất)
        if len(set(active_bets)) == 1:
            return True # Đủ điều kiện kết thúc vòng cược! -> CHIA BÀI
            
        return False

    def reset_acted_except(self, current_player):
        """ Nếu có người RAISE, reset trạng thái của những người khác về False """
        for p_id in self.has_acted:
            if p_id != current_player.id:
                self.has_acted[p_id] = False