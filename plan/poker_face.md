class PokerPlayer:
    def __init__(self, name, position):
        self.name = name
        self.position = position # Thuộc mảng POSITIONS
        self.hand = []           # 2 lá bài tẩy
        self.is_folded = False

    def evaluate_hand_strength(self, community_cards):
        """ Trả về điểm số sức mạnh của bài từ 0.0 (rác) đến 1.0 (tuyệt đối) """
        return HandEvaluator.score(self.hand, community_cards)

    def decide_action(self, current_stage, current_bet, times_raised_before_me):
        hand_strength = self.evaluate_hand_strength(current_stage)
        
        # -------------------------------------------------------------
        # KHỐI LOGIC 1: EARLY POSITION (UTG, UTG+1) - Chơi cực chặt
        # -------------------------------------------------------------
        if self.position in ["UTG", "UTG+1"]:
            if hand_strength >= 0.85: # Bài siêu mạnh: AA, KK, QQ, AK...
                return ACTIONS["RAISE"]
            elif current_stage == "PRE_FLOP": 
                # Ở EP vòng Pre-flop không thể CHECK vì có Big Blind chặn phía sau
                return ACTIONS["FOLD"] 
            else:
                return ACTIONS["CHECK"] if current_bet == 0 else ACTIONS["FOLD"]

        # -------------------------------------------------------------
        # KHỐI LOGIC 2: MIDDLE POSITION (MP1, MP2, HJ) - Mở rộng một chút
        # -------------------------------------------------------------
        elif self.position in ["MP1", "MP2", "HJ"]:
            if hand_strength >= 0.75:
                return ACTIONS["RAISE"]
            elif current_bet == 0:
                return ACTIONS["CHECK"]
            elif current_bet > 0 and hand_strength >= 0.60:
                return ACTIONS["CALL"] # Theo bài nếu bài tạm ổn
            else:
                return ACTIONS["FOLD"]

        # -------------------------------------------------------------
        # KHỐI LOGIC 3: LATE POSITION (CO, BTN) - Vị trí cướp pot/tấn công
        # -------------------------------------------------------------
        elif self.position in ["CO", "BTN"]:
            if times_raised_before_me == 0: 
                # Chưa ai Raise trước mình -> Chủ động Raise để ép đối thủ (Steal)
                if hand_strength >= 0.45: 
                    return ACTIONS["RAISE"]
                else:
                    return ACTIONS["FOLD"]
            else: 
                # Đã có người Raise trước
                if hand_strength >= 0.70:
                    return ACTIONS["RAISE"] # Re-raise (3-bet)
                elif hand_strength >= 0.55:
                    return ACTIONS["CALL"]
                else:
                    return ACTIONS["FOLD"]

        # -------------------------------------------------------------
        # KHỐI LOGIC 4: BLINDS (SB, BB) - Phòng thủ vị trí xấu
        # -------------------------------------------------------------
        elif self.position in ["SB", "BB"]:
            if current_stage == "PRE_FLOP" and self.position == "BB" and current_bet == 0:
                # ĐẶC QUYỀN CỦA BIG BLIND: Không ai raise trước đó, được quyền xem Flop miễn phí
                return ACTIONS["CHECK"]
                
            if hand_strength >= 0.80:
                return ACTIONS["RAISE"] # Sẵn sàng khô máu bảo vệ blind
            elif current_bet > 0 and hand_strength >= 0.65:
                return ACTIONS["CALL"]
            else:
                # Check nếu không mất thêm tiền, nếu phải bỏ thêm tiền thì Fold
                return ACTIONS["CHECK"] if current_bet == 0 else ACTIONS["FOLD"]