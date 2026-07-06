1. Player Join Room
TC1 - Join room thành công
Given:
Room đang WAITING
Seat còn trống

When:
Player A join room

Expect:
- Player được add vào room
- Player có seat
- Stack đúng buyin
- Broadcast PLAYER_JOINED
- Broadcast TABLE_STATE
- Player receive PRIVATE_STATE
- Spectator count giảm
TC2 - Join full table
Given:
9/9 seat

When:
Player B join

Expect:
- Reject
- ROOM_FULL
- Không add vào room
TC3 - Join duplicate
Player đã trong room

join lần nữa

Expect

- reject
- ALREADY_IN_ROOM
TC4 - Join khi room STARTING_HAND

Poker chuẩn:

Có thể join

Nhưng:

spectator=true

Đợi hand sau mới seat

Không được ngồi giữa hand.

TC5 - Join khi room SHOWDOWN
Join

=> spectator

Đợi next hand
TC6 - Join room đang CANCEL
Reject
ROOM_CANCELLED
TC7 - Join room deleted
Reject
ROOM_NOT_FOUND
2. Player Leave Room
TC8 Leave trước khi game bắt đầu
WAITING

Player leave

Expect

remove seat

broadcast PLAYER_LEFT
TC9 Leave khi đang action

Đây là case cực quan trọng.

Poker CG:

Player click Leave

KHÔNG remove ngay

mark

pendingLeave=true

Player vẫn phải hoàn thành hand.

TC10 Leave khi Fold rồi
Player fold

click leave

Expect

pendingLeave=true

Hand kết thúc

remove seat
TC11 Leave ở showdown
pendingLeave=true

Pot chia xong

remove
TC12 Leave spectator
leave

socket.leave(room)

Done
TC13 Leave rồi reconnect ngay
leave

disconnect

connect

Expect

không auto seat
3. Room Cancel

Poker chuẩn.

Cancel chỉ xảy ra khi:

Không đủ player

trước khi deal
TC14
2 player

1 player leave

Countdown hết

Expect

ROOM_CANCELLED
TC15
dealer chưa deal

owner cancel

Expect

refund buyin

remove room
TC16
đang hand

cancel

Expect

reject

HAND_RUNNING

Không được cancel giữa hand.

4. Room Delete

Delete khác cancel.

Delete chỉ khi:

room empty

không running

không spectator

TC17
Room empty

delete

Expect

redis remove

memory remove

broadcast ROOM_DELETED
TC18
room còn player

delete

reject
5. Disconnect

Đây là phần nhiều bug nhất.

TC19 Disconnect khi waiting
disconnect

expect

remove player

broadcast leave
TC20 Disconnect khi đang hand

Poker chuẩn:

KHÔNG remove

mark disconnected=true

start reconnect timer
TC21 reconnect trong timeout
30 sec

connect

Expect

resume

same seat

same cards

same stack
TC22 reconnect timeout
timeout

auto fold

hand end

remove
TC23 disconnect khi all-in
disconnect

player vẫn allin

hand continue

showdown

remove sau hand
TC24 disconnect spectator
remove socket

Done
6. Join room khác

Đây là case nhiều server sai.

TC25
Player ở room A

join room B

Expect

reject

ALREADY_IN_ROOM

PokerStars cũng không cho join 2 cash table nếu hệ thống quy định 1 bàn/1 người.

TC26 Auto leave rồi join
Player click join B

System

leave A

join B

Expect

A remove

B add
TC27 Join room khác khi hand running

Poker chuẩn:

A running

join B

Expect

pendingLeave

Sau hand

join B
TC28 Join room khác khi disconnect
Disconnect A

Reconnect

join B

Expect

A cleanup

B join
7. Room State
TC29
0 player

delete
TC30
1 player

waiting
TC31
2 player

countdown
TC32
countdown

1 player leave

cancel countdown
TC33
countdown

player join

countdown continue
TC34
deal

new player join

spectator
8. Socket Test
TC35
double connect

same user

Expect

old socket kick

new socket active
TC36
multiple tabs

Expect

only one active seat
TC37
disconnect

connect

disconnect

connect

10 lần

Không duplicate
9. Race Condition
TC38

Hai người click seat cùng lúc

Expect

1 success

1 fail
TC39

Join + delete room

cùng lúc

Không crash
TC40

Leave + deal

cùng lúc

Không mất seat

Không duplicate player
TC41

Disconnect đúng lúc dealer deal

Player vẫn được chia bài

Reconnect thấy đúng hole cards
TC42

Disconnect đúng lúc action

Timer tiếp tục

Timeout

Auto fold
10. Broadcast Test

Mỗi action phải kiểm tra:

PLAYER_JOINED

PLAYER_LEFT

ROOM_UPDATED

TABLE_STATE

PLAYER_DISCONNECTED

PLAYER_RECONNECTED

ROOM_CANCELLED

ROOM_DELETED

Không được:

gửi duplicate event
gửi sai room
gửi cho socket đã rời phòng
mất event khi reconnect
11. Redis Consistency

Sau mỗi test cần verify:

Room

Seat

Player

Pot

Deck

ActionIndex

DealerIndex

Spectator

SocketRoom

UserRoom

ReconnectMap

Không được tồn tại:

Seat tồn tại
nhưng UserRoom không có

↓

UserRoom có
nhưng Room không có

↓

SocketRoom sai

↓

Ghost Player

↓

Ghost Seat