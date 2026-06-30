# Poker Lobby Code Review
## Mục tiêu

Review toàn bộ các điểm có nguy cơ gây lỗi nghiêm trọng trong Poker Lobby, tập trung vào:

- Duplicate cards giữa các hand.
- Race condition.
- Sai logic chia bài.
- Sai logic betting.
- Sai state management.
- Khả năng gây mất tính công bằng (Provably Fair).

---

# CRITICAL (P0)

Các lỗi có khả năng làm hỏng game hoặc tạo duplicate card.

---

## 1. startNewHand() không có Distributed Lock

### Mức độ

⭐⭐⭐⭐⭐ Critical

### Hiện trạng

PokerStateService đã hỗ trợ

```ts
acquireLock(tableId)
releaseLock(tableId)
```

nhưng startNewHand() không sử dụng.

Ví dụ:

```
Showdown
        ↓
 setTimeout()

        ↓
 startNewHand()
```

đồng thời

```
Player rebuy

↓

startNewHand()
```

hoặc

```
Player sit in

↓

startNewHand()
```

Hai thread cùng chạy.

### Hậu quả

Có thể xảy ra

- shuffle 2 lần
- setDeck ghi đè
- playerCards ghi đè
- community dùng deck khác
- duplicate cards
- corrupted table state

### Fix

```
AcquireLock(roomId)

try{

    ...

}
finally{

    ReleaseLock(roomId)

}
```

---

## 2. Không clear Player Cards trước khi chia hand mới

### Mức độ

⭐⭐⭐⭐⭐ Critical

Hiện tại chỉ overwrite

```
setPlayerCards()
```

Nếu giữa quá trình chia bài xảy ra exception

Ví dụ

```
Player1 OK

Player2 OK

Player3 Exception
```

Redis sẽ lưu

```
P1 = new cards

P2 = new cards

P3 = old cards

P4 = old cards
```

Hand tiếp theo có thể đọc bài cũ.

### Fix

Đầu startNewHand()

```
deletePlayerCards(all players)
```

sau đó mới shuffle và deal.

---

## 3. Không kiểm tra duplicate sau khi shuffle

### Mức độ

⭐⭐⭐⭐⭐ Critical

Hiện tại không verify deck.

Nếu shuffle có bug hoặc deck bị sửa ngoài ý muốn sẽ không phát hiện.

### Fix

```
Set(deck).size == 52
```

Nếu khác

```
throw
```

---

## 4. Không verify duplicate sau khi chia bài

### Mức độ

⭐⭐⭐⭐⭐ Critical

Sau khi chia xong nên verify

```
Pocket Cards
+
Community
```

không được trùng.

### Fix

```
Set(all dealt cards)
```

Nếu size không đúng

```
Abort Hand
```

---

# HIGH (P1)

---

## 5. current_highest_bet luôn bằng Big Blind

### Mức độ

⭐⭐⭐⭐ High

Hiện tại

```
current_highest_bet = bbAmount
```

Nhưng

```
BB all-in
```

Ví dụ

```
Blind =100

Stack =70
```

Highest bet vẫn là

```
100
```

trong khi thực tế

```
70
```

### Hậu quả

Sai betting logic.

### Fix

```
current_highest_bet = bbBet
```

---

## 6. HandId sử dụng Date.now()

### Mức độ

⭐⭐⭐⭐ High

```
const handId = Date.now()
```

Nếu

- nhiều table
- multi thread

có thể trùng.

### Fix

```
UUID
```

---

## 7. Chia bài không theo vòng

### Mức độ

⭐⭐⭐⭐ High

Hiện tại

```
Player1

2 cards

↓

Player2

2 cards
```

Poker chuẩn

```
Round1

P1

P2

P3

...

Round2

P1

P2

P3
```

### Hậu quả

Không duplicate

nhưng sai luật Poker.

---

## 8. activePlayers được tính trước khi reset trạng thái

### Mức độ

⭐⭐⭐⭐ High

Hiện tại

```
activePlayers

↓

reset seats
```

Nếu sau này logic status thay đổi sẽ dễ sinh bug.

### Fix

Reset trước.

Sau đó mới tính activePlayers.

---

## 9. Không clear Action Log

### Mức độ

⭐⭐⭐⭐ High

Redis

```
hand:{id}:actions
```

không thấy clear.

Có thể replay sai.

---

# MEDIUM (P2)

---

## 10. Provably Fair chưa đúng chuẩn

Hiện tại

```
clientSeed

=

client-user-Date.now()
```

Thực tế

Date.now()

do server tạo.

Client không thật sự tham gia tạo randomness.

### Fix

Frontend gửi clientSeed.

---

## 11. Dealer Rotation phụ thuộc state hiện tại

Dealer được tính từ

```
tableState
```

Nếu state sai có thể chọn dealer sai.

---

## 12. Mutation trực tiếp object seats

Có

```
seats.splice()
```

trong lúc đang xử lý.

Dễ gây side-effect.

---

# Đã kiểm tra và KHÔNG phải nguyên nhân

## Deck Redis

Hiện tại

```
DEL

RPUSH
```

đúng.

Không append.

---

## Player Cards Redis

Hiện tại

```
SET
```

overwrite.

Không append.

---

## Community Cards

Đã reset

```
community_cards=""
```

đầu hand.

Không phát hiện bug.

---

# Những phần cần review tiếp

## 1.

advanceStreet()

Đặc biệt

```
getDeck()

↓

deal flop

↓

turn

↓

river
```

Đây hiện là nghi phạm lớn nhất gây duplicate.

---

## 2.

processShowdown()

Kiểm tra

- race condition
- timer
- đọc player cards
- reset state

---

## 3.

PokerGameEngine.shuffleDeck()

Kiểm tra

- Fisher-Yates
- RNG
- Seed
- Duplicate
- Mutation

---

## 4.

Tất cả nơi gọi

```
startNewHand()
```

Cần chắc chắn chỉ có

ONE

thread được phép chạy.

---

# Các đề xuất cải thiện kiến trúc

## 1.

Toàn bộ startNewHand nên chạy trong Transaction Logic

```
Acquire Lock

↓

Reset State

↓

Delete Player Cards

↓

Shuffle

↓

Verify Deck

↓

Deal

↓

Verify Dealt Cards

↓

Save Deck

↓

Save Player Cards

↓

Save Table State

↓

Broadcast

↓

Release Lock
```

---

## 2.

Mọi thay đổi deck nên thông qua một API duy nhất

Ví dụ

```
drawCard()

↓

Redis LPOP

↓

return card
```

Không nên

```
getDeck()

↓

deck.pop()

↓

setDeck()
```

vì rất dễ race-condition.

---

## 3.

Thêm Integrity Check

Sau mỗi hand

verify

- Deck size
- Pocket cards
- Community
- Total unique cards = 52

Nếu sai

```
Abort Hand

Log Error
```

để tránh phát hành hand lỗi.

---

# Mức độ ưu tiên sửa

| Priority | Vấn đề | Mức độ |
|----------|---------|---------|
| P0 | startNewHand không lock | ⭐⭐⭐⭐⭐ |
| P0 | Không clear Player Cards | ⭐⭐⭐⭐⭐ |
| P0 | Không verify deck sau shuffle | ⭐⭐⭐⭐⭐ |
| P0 | Không verify duplicate cards | ⭐⭐⭐⭐⭐ |
| P1 | current_highest_bet sai khi BB all-in | ⭐⭐⭐⭐ |
| P1 | HandId dùng Date.now() | ⭐⭐⭐⭐ |
| P1 | Chia bài không theo vòng | ⭐⭐⭐⭐ |
| P1 | activePlayers tính trước reset | ⭐⭐⭐⭐ |
| P1 | Không clear action logs | ⭐⭐⭐⭐ |
| P2 | Provably Fair chưa chuẩn | ⭐⭐⭐ |
| P2 | Dealer rotation phụ thuộc state | ⭐⭐⭐ |
| P2 | Mutation trực tiếp mảng seats | ⭐⭐⭐ |