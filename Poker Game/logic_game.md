# Poker Game Backend Logic Plan

## 1. Card Dealing Flow

### 1.1 Deck Initialization

-   Khởi tạo bộ bài 52 lá.
-   Thực hiện Fisher-Yates Shuffle.
-   Lưu deck vào Redis theo `hand:{handId}:deck`.
-   Mọi thao tác chia bài sử dụng `POP` để đảm bảo không trùng lá.

### 1.2 Pre-Flop

1.  Chia mỗi người chơi 2 Pocket Cards.
2.  Lưu vào `player_hand_cards`.
3.  Gửi bài qua Private WebSocket.

### 1.3 Flop

-   Burn 1 lá.
-   Lật 3 Community Cards.
-   Cập nhật `game_hands.community_cards`.
-   Broadcast tới toàn bộ bàn.

### 1.4 Turn

-   Burn 1 lá.
-   Lật 1 Community Card.
-   Broadcast.

### 1.5 River

-   Burn 1 lá.
-   Lật Community Card cuối.
-   Broadcast.

------------------------------------------------------------------------

## 2. Position & Blind Rotation

### Dealer (D)

-   Hành động cuối ở các vòng Post-Flop.

### Small Blind (SB)

-   Người chơi hoạt động đầu tiên bên trái Dealer.
-   Đóng 1/2 Big Blind.

### Big Blind (BB)

-   Người chơi hoạt động đầu tiên bên trái Small Blind.
-   Đóng Big Blind.

### Dead Button Logic

-   Bỏ qua ghế Sit Out/Disconnected.
-   BB luôn di chuyển tới người chơi active tiếp theo.
-   Dealer và SB được tính lại theo BB.

### Heads-up

-   Dealer đồng thời là Small Blind.
-   Dealer hành động trước ở Pre-Flop.

------------------------------------------------------------------------

## 3. Betting Engine

### Pot Collection

-   Call
-   Bet
-   Raise
-   All-in

Cập nhật: - current_bet - current_pot

### Side Pot

1.  Thu toàn bộ contribution.
2.  Sort tăng dần.
3.  Tạo Main Pot.
4.  Tạo các Side Pot.
5.  Lưu `side_pots_json`.

``` json
[
  {
    "pot_id":0,
    "pot_name":"Main Pot",
    "amount":300000,
    "eligible_user_ids":[101,102,103]
  }
]
```

------------------------------------------------------------------------

## 4. Hand Evaluation

Thứ tự bài:

1.  Straight Flush
2.  Four of a Kind
3.  Full House
4.  Flush
5.  Straight
6.  Three of a Kind
7.  Two Pair
8.  One Pair
9.  High Card

### Algorithm

-   Cactus Kev
-   Perfect Hash
-   Lookup O(1)

------------------------------------------------------------------------

## 5. Rake

### Private Room

-   rake_rate = 0
-   rake_cap = 0

### System Room

    Calculated = Pot × Rate
    Final = min(Calculated, Cap)
    Net Payout = Pot - Final

------------------------------------------------------------------------

## 6. Stack Synchronization

``` sql
BEGIN TRANSACTION;

UPDATE room_members
SET current_stack = current_stack + :net_payout;

INSERT INTO system_revenue(...);

UPDATE game_hands
SET hand_stage='ENDED';

COMMIT;
```

Rollback nếu có lỗi.

------------------------------------------------------------------------

## 7. Redis Keys

``` text
hand:{handId}:deck
hand:{handId}:community
hand:{handId}:pots
hand:{handId}:current_turn
hand:{handId}:current_bet
hand:{handId}:dealer
hand:{handId}:small_blind
hand:{handId}:big_blind
hand:{handId}:players
hand:{handId}:timer
hand:{handId}:stage
```

------------------------------------------------------------------------

## 8. Hand Flow

``` text
Create Hand
→ Shuffle
→ Save Redis
→ Assign Dealer/SB/BB
→ Collect Blinds
→ Deal Cards
→ Pre-Flop
→ Flop
→ Turn
→ River
→ Showdown
→ Evaluate
→ Settle Pots
→ Calculate Rake
→ Update Stack
→ Save History
→ Rotate Dealer
→ Next Hand
```

1. **Logic Xáo & Chia bài (RNG):** Tri triển thuật toán xáo bài Fisher-Yates $O(n)$ trên Server và quy trình bốc/hủy bài (`Burn card`) qua từng vòng cược (Pre-flop, Flop, Turn, River).
2. **Logic Blinds & Dead Button:** Quy tắc dịch chuyển vị trí các nút cược bắt buộc (`D`, `SB`, `BB`) khi xuất hiện trường hợp người chơi đứng dậy thoát bàn hoặc vắng mặt (`AWAY`).
3. **Thuật toán Phân tách Hũ phụ (Side Pot):** Công thức toán học xử lý gom chip cược theo từng hạn mức tài sản tăng dần từ thấp đến cao khi có một hoặc nhiều nhà cùng chọn lệnh `All-in`.
4. **Giải thuật Tra cứu So bài siêu tốc:** Cách thức mã hóa cấu trúc bit-mask số nguyên tố cho 52 lá bài (Cactus Kev) đưa độ phức tạp so bài về mức lí tưởng $O(1)$ qua một bảng tra cứu (Look-up Table).
5. **Logic Cắt phế Rake phân cấp phòng:** Tự động hóa bộ quy tắc miễn hoàn toàn tiền phế đối với các phòng Custom/Private và thực thi cắt phế tự động kèm mức chặn trần (`Rake Cap`) đối với các phòng chơi Sự kiện/Hệ thống.
6. **Đồng bộ Quỹ Stack (Database Transaction):** Chuẩn hóa mã lệnh bao bọc giao dịch SQL đồng bộ hóa an toàn số dư tài sản và bắn Event WebSocket cập nhật trực tiếp lên màn hình người chơi ngay sau khi kết toán mỗi ván bài.