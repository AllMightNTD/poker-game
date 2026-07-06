Không nên có nút "Bắt đầu ván đấu" Điều kiện bắt đầu hand mới

Ví dụ:

eligiblePlayers =
seats.filter(seat =>
    seat.playerId != null &&
    seat.stack > 0 &&
    !seat.isSitOut
);

Nếu

eligiblePlayers >= 2

→ tự động bắt đầu.

Nếu

eligiblePlayers < 2

→ bàn chuyển sang trạng thái chờ.

Luồng Reset
Settlement
        │
        ▼
Clear Pot
Clear Side Pots
Clear Community Cards
Clear Current Bet
Clear Action History
Clear Winner
Clear Timers

Rotate Dealer

↓

Assign SB

↓

Reset những gì?
Table
Pot

Main Pot

Side Pots

Current Bet

Highest Bet

Last Raise

Street

Community Cards

Winner

Seat
Current Bet = 0

Fold = false

AllIn = false

HasActed = false

Hole Cards = []

Action = NONE
Timer
Action Timer

Showdown Timer

Animation Timer

đều phải clear.

Countdown

Thông thường:

Showdown

↓

Hiển thị Winner

↓

3 giây

↓

Start New Hand

Trong 3 giây này

Client hiển thị:

Player A wins

+500

Next Hand Starting...

Nếu chỉ còn 1 player

Ví dụ

Player B bust.

Player C leave seat.

Chỉ còn

Player A.

Sau Reset

eligiblePlayers =1

Server

Table = WAITING

Không chia bài.

Broadcast

{
    "type":"WAITING_FOR_PLAYERS",
    "requiredPlayers":2
}
Nếu player rebuy

Ví dụ

Player A

1000

Player B

0

B

Rebuy

1000

Server

eligiblePlayers =2

↓

Countdown

↓

Start New Hand

Điều kiện không được Start New Hand

Không nên bắt đầu hand mới nếu:

Có dưới 2 người chơi đủ điều kiện.
Table đang trong trạng thái STARTING (tránh gọi lặp).
Đang có countdown khác chạy.
Đang xử lý reconnect hoặc rebuy chưa hoàn tất (nếu hệ thống của bạn hỗ trợ giữ chỗ trong thời gian ngắn).
Đề xuất State Machine
                  +----------------------+
                  |      WAITING         |
                  +----------+-----------+
                             |
                 eligiblePlayers >= 2
                             |
                             ▼
                  +----------------------+
                  |      STARTING        |
                  | (Countdown 3-5s)     |
                  +----------+-----------+
                             |
                             ▼
                  +----------------------+
                  |      PRE_FLOP        |
                  +----------+-----------+
                             |
                             ▼
                  FLOP → TURN → RIVER
                             |
                             ▼
                  +----------------------+
                  |      SHOWDOWN        |
                  +----------+-----------+
                             |
                             ▼
                  +----------------------+
                  |     SETTLEMENT       |
                  +----------+-----------+
                             |
                             ▼
                  +----------------------+
                  |      RESETTING       |
                  +----------+-----------+
                             |
                +------------+------------+
                |                         |
     eligiblePlayers < 2       eligiblePlayers >= 2
                |                         |
                ▼                         ▼
          WAITING                 STARTING

Assign BB

↓

Shuffle

↓

Deal Cards
