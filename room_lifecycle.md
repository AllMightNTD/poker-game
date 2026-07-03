Mục tiêu

Đảm bảo rằng:

Không có room bị "treo" (Zombie Room).
Player có thể reconnect khi mất mạng.
Room được reset đúng lúc.
Không ảnh hưởng tới các hand đang diễn ra.
Có cơ chế tự dọn dẹp khi server gặp lỗi.
I. Các trạng thái của Room
CREATED
    │
    ▼
WAITING_PLAYER
    │
    ▼
RUNNING
    │
    ▼
HAND_FINISHED
    │
    ▼
WAITING_NEXT_HAND
    │
    └──────────────┐
                   │
                   ▼
               RUNNING

Ngoài các trạng thái của game, room sẽ có thêm Room Lifecycle:

ACTIVE
IDLE
DESTROYED
ACTIVE

Điều kiện:

Có ít nhất 1 player connected.
Hoặc hand đang diễn ra.
Có hoạt động trong khoảng thời gian gần.
IDLE

Điều kiện:

Không còn player connected.
Room chờ reconnect.
DESTROYED

Điều kiện:

Không còn ai reconnect trong thời gian quy định.
Room được reset và giải phóng hoàn toàn.
II. Player State
CONNECTED
│
├── DISCONNECTED
│      │
│      ├── CONNECTED (Reconnect)
│      └── LEFT (Timeout)
│
├── SIT_OUT
│
└── LEFT
III. Các Timer
1. Action Timer

Dùng cho mỗi lượt chơi.

Ví dụ:

15s

Hết thời gian:

Auto Fold
Auto Check
Auto Call
2. Reconnect Timer

Bắt đầu khi player disconnect.

Ví dụ:

60s

Nếu reconnect:

Cancel Timer

Nếu không reconnect:

Player -> LEFT
3. Empty Room Timer

Điều kiện:

Connected Player = 0

Server:

Start Empty Room Timer

Ví dụ:

30s

Nếu có người reconnect:

Cancel Timer

Nếu không:

Destroy Room
4. Idle Cleanup Timer

Cron Job.

Ví dụ:

Every 1 minute

Kiểm tra:

lastActivity

Nếu:

Now - lastActivity > 10 phút

↓

Destroy Room.

Đây là lớp bảo vệ cuối cùng nếu timer bị lỗi.

IV. lastActivity

Mỗi Room sẽ có:

lastActivity: number

Mỗi event đều update:

Join
Leave
Sit Out
Bet
Raise
Call
Fold
Check
Showdown
Chat
Reconnect
room.lastActivity = Date.now();
V. Heartbeat

Client gửi heartbeat:

30s
PING

↓

Server

PONG

Server cập nhật:

player.lastSeen = Date.now();

Nếu:

60s không heartbeat

↓

Player chuyển thành

DISCONNECTED

Không phụ thuộc hoàn toàn vào sự kiện disconnect.

VI. Điều kiện Destroy Room

Room chỉ được destroy khi:

Điều kiện 1
Connected Player = 0
Điều kiện 2

Reconnect Timer hết.

Điều kiện 3

Không còn hand cần xử lý.

Ví dụ:

Không còn:

showdown
side pot
animation
timer
Điều kiện 4

Cron xác nhận room không hoạt động.

VII. Destroy Room Process
Destroy Room
        │
        ▼
Stop Action Timer
        │
        ▼
Stop Showdown Timer
        │
        ▼
Stop New Hand Timer
        │
        ▼
Clear Players
        │
        ▼
Clear Spectators
        │
        ▼
Reset Pot
        │
        ▼
Reset Deck
        │
        ▼
Reset Community Cards
        │
        ▼
Reset Dealer
        │
        ▼
Reset Stage
        │
        ▼
Remove Redis Cache
        │
        ▼
Remove RoomManager Memory
        │
        ▼
Broadcast ROOM_DESTROYED
VIII. Reconnect Flow
Player Disconnect
        │
        ▼
Player -> DISCONNECTED
        │
        ▼
Reconnect Timer Start
        │
        ├───────────────┐
        │               │
Reconnect         Timeout
        │               │
        ▼               ▼
CONNECTED          LEFT
IX. Empty Room Flow
Last Connected Player Disconnect
                │
                ▼
Connected Player = 0
                │
                ▼
Start Empty Room Timer
                │
        ┌───────┴────────┐
        │                │
Reconnect         Timeout
        │                │
        ▼                ▼
Cancel Timer     Destroy Room
X. Kiến trúc đề xuất
RoomManager
│
├── Room
│      ├── Players
│      ├── Spectators
│      ├── Stage
│      ├── Pot
│      ├── Board
│      ├── Dealer
│      ├── lastActivity
│      ├── reconnectTimers
│      ├── actionTimer
│      ├── showdownTimer
│      ├── nextHandTimer
│      └── emptyRoomTimer
│
├── CleanupService (Cron)
│
├── HeartbeatService
│
└── ReconnectService
XI. Luồng hoàn chỉnh
Player Join
      │
      ▼
Room ACTIVE
      │
      ▼
Game Running
      │
      ▼
Player Disconnect
      │
      ▼
Start Reconnect Timer
      │
      ▼
Còn player connected?
      │
 ┌────┴────┐
 │         │
Có         Không
 │          │
 │          ▼
 │    Start Empty Room Timer
 │          │
 ▼          ▼
Reconnect?  Reconnect?
 │          │
 │          ├───────────────┐
 │          │               │
 ▼          ▼               ▼
Resume    Cancel Timer   Timeout
 │                          │
 ▼                          ▼
Continue Game         Destroy Room
