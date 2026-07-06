# Khai báo các hằng số hệ thống
POSITIONS = ["UTG", "UTG+1", "MP1", "MP2", "HJ", "CO", "BTN", "SB", "BB"]
STAGES = ["PRE_FLOP", "FLOP", "TURN", "IVER", "SHOWDOWN"]
ACTIONS = ["FOLD", "CHECK", "CALL", "RAISE"]

class PokerGame:
    def __init__(self, players):
        self.players = players  # Danh sách người chơi tham gia bàn
        self.deck = Deck()      # Bộ bài 52 lá
        self.community_cards = []
        self.pot = 0
        self.current_bet = 0

    def start_new_hand(self):
        """
        QUY TRÌNH CHIA BÀI VÀ VẬN HÀNH VÁN BÀI
        """
        self.deck.shuffle()
        self.community_cards.clear()
        self.pot = 0
        
        # 0. Thu tiền mù bắt buộc trước khi chia bài
        self.collect_blinds()

        # VÒNG 1: PRE-FLOP
        # Điều kiện chia: Bắt đầu ván bài sau khi có Blinds
        self.deal_private_cards() # Chia mỗi người 2 lá bài tẩy
        self.betting_round(stage="PRE_FLOP", start_position="UTG") 

        # VÒNG 2: FLOP
        # Điều kiện chia: Vòng Pre-flop kết thúc và còn >= 2 người chơi
        if self.count_active_players() >= 2:
            self.community_cards.extend(self.deck.burn_and_deal(3)) # Chia 3 lá bài chung đầu tiên
            self.betting_round(stage="FLOP", start_position="SB")

        # VÒNG 3: TURN
        # Điều kiện chia: Vòng Flop kết thúc và còn >= 2 người chơi
        if self.count_active_players() >= 2:
            self.community_cards.extend(self.deck.burn_and_deal(1)) # Chia 1 lá bài chung thứ 4
            self.betting_round(stage="TURN", start_position="SB")

        # VÒNG 4: RIVER
        # Điều kiện chia: Vòng Turn kết thúc và còn >= 2 người chơi
        if self.count_active_players() >= 2:
            self.community_cards.extend(self.deck.burn_and_deal(1)) # Chia 1 lá bài chung thứ 5 (cuối cùng)
            self.betting_round(stage="RIVER", start_position="SB")

        # KẾT THÚC: SHOWDOWN
        if self.count_active_players() >= 2:
            self.showdown()
        else:
            self.declare_lone_winner()