# Texas Hold'em No Limit -- Betting Flow & Action Rules

> Tài liệu mô tả đầy đủ luồng hành động (betting flow) trong Texas
> Hold'em No Limit, bao gồm các action của player, quy tắc
> raise/re-raise, all-in, minimum raise, reopen betting và side pot.

## 1. Các Action của Player

  ----------------------------------------------------------------------------
  Action                 Điều kiện                    Ý nghĩa
  ---------------------- ---------------------------- ------------------------
  Fold                   Luôn được phép               Bỏ bài và không tham gia
                                                      ván hiện tại

  Check                  `currentBet == highestBet`   Không cược thêm

  Bet                    `highestBet == 0`            Đặt cược đầu tiên

  Call                   `highestBet > currentBet`    Theo mức cược hiện tại

  Raise                  Đã có người cược             Theo cược và tăng thêm

  All-in                 Luôn được phép               Đặt toàn bộ stack

  Call All-in            Stack không đủ để call       Theo bằng toàn bộ stack

  Raise All-in           All-in lớn hơn mức call và   Raise bằng toàn bộ stack
                         đủ minimum raise             
  ----------------------------------------------------------------------------

## 2. Betting Round

Một betting round kết thúc khi: - Tất cả player còn trong hand đã Fold,
Call hoặc All-in. - Không còn action hợp lệ.

## 3. Check

Chỉ hợp lệ khi:

``` text
currentBet == highestBet
```

## 4. Bet

Chỉ xuất hiện khi:

``` text
highestBet == 0
```

## 5. Call

Call đưa `currentBet` của player lên bằng `highestBet`.

## 6. Raise

Raise = Call + Increase.

Ví dụ:

``` text
highestBet = 300
Raise lên 800

Call 300
Raise thêm 500
```

## 7. Minimum Raise

Minimum Raise luôn dựa trên **Full Raise gần nhất**, không dựa trên Big
Blind (ngoại trừ lần mở cược đầu tiên preflop).

Ví dụ:

``` text
BB = 100

A Raise lên 300

Raise amount = 300 - 100 = 200

Raise tiếp theo tối thiểu = 500
```

## 8. Re-raise

Raise sau một Raise khác.

## 9. All-in

-   Call All-in: stack không đủ để call.
-   Raise All-in: all-in đủ minimum raise.

## 10. Incomplete Raise

Nếu phần tăng thêm nhỏ hơn `lastFullRaiseSize`:

-   `highestBet` vẫn tăng.
-   Không cập nhật `lastFullRaiseSize`.
-   Không reopen betting.

## 11. Reopen Betting

Chỉ xảy ra khi có **Full Raise**.

Incomplete Raise không mở lại quyền Raise cho player đã action trước đó.

## 12. Side Pot

Ví dụ:

``` text
A =1000
B =500
C =200

Main Pot = 600
Side Pot1 = 600
Side Pot2 = 500
```

## 13. State cần lưu

-   highestBet
-   lastFullRaiseSize
-   currentPlayer
-   lastAggressor
-   currentBet
-   stack
-   pot
-   sidePots
-   playersActed
-   activePlayers
-   allInPlayers
-   bettingRound
-   dealerPosition
-   smallBlind
-   bigBlind

## 14. Rule quan trọng

1.  Minimum Raise dựa trên Full Raise gần nhất.
2.  Raise = Call + Increase.
3.  Call All-in không phải Raise.
4.  All-in chỉ là Full Raise nếu đủ minimum raise.
5.  Incomplete Raise không reopen betting.
6.  Bet chỉ xuất hiện khi chưa có ai cược.
7.  Check chỉ hợp lệ khi currentBet == highestBet.
8.  Side Pot được tạo khi nhiều player all-in.
9.  Betting Round kết thúc khi tất cả player đã Fold, Call hoặc All-in.
