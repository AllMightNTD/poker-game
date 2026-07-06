# Poker Architecture - Bust Player to Spectator

## Overview
Khi người chơi hết chip (stack = 0), **không kick khỏi room**.
- Leave Seat
- Chuyển sang **SPECTATING**
- Có thể xem bàn, chat, rebuy và ngồi lại.

## Player State

```text
JOIN_ROOM
    │
    ▼
SPECTATING
    │
Join Seat
    ▼
SITTING
    │
Buy-in
    ▼
WAITING_NEXT_HAND
    │
Start Hand
    ▼
PLAYING
    │
Hand End
    ▼
WAITING_NEXT_HAND

Nếu stack = 0:

PLAYING
    │
    ▼
BUSTED
    │
Leave Seat
    ▼
SPECTATING
```

## PlayerState

```ts
enum PlayerState {
  SPECTATING,
  SITTING,
  WAITING_NEXT_HAND,
  PLAYING,
  ALL_IN,
  FOLDED,
  BUSTED
}
```

## Hand End Flow

```text
Settlement
    │
Update Stack
    │
Stack == 0 ?
 ├── No  -> WAITING_NEXT_HAND -> Start New Hand
 └── Yes -> BUSTED -> Leave Seat -> SPECTATING
```

## Bust Flow

1. Settlement.
2. Update stack.
3. Nếu stack == 0:
   - state = BUSTED
   - remove seat
   - state = SPECTATING
   - Broadcast PLAYER_BUSTED
   - Broadcast PLAYER_LEFT_SEAT

## Không kick khỏi room

Player vẫn:
- Xem bàn
- Chat
- Rebuy
- Join seat lại

Chỉ rời room khi:
- Leave Room
- Disconnect timeout

## Điều kiện Start New Hand

```ts
eligiblePlayers = players.filter(p =>
    p.stack > 0 &&
    !p.isSitOut &&
    p.state === PlayerState.WAITING_NEXT_HAND
);
```

## Events

- HAND_RESULT
- PLAYER_BUSTED
- PLAYER_LEFT_SEAT
- PLAYER_STATE_CHANGED
- PLAYER_REBUY
- PLAYER_JOIN_SEAT

## Player vs Seat

Player tồn tại trong Room.
Seat chỉ là vị trí trên bàn.

Bust:
- Xóa Seat -> Player.
- Player chuyển sang SPECTATING.
- Có thể rebuy và ngồi lại.

## Complete Flow

```text
Join Room
    │
    ▼
SPECTATING
    │
Join Seat
    ▼
SITTING
    │
Buy-in
    ▼
WAITING_NEXT_HAND
    │
Start Hand
    ▼
PLAYING
    │
Settlement
    │
 ├── Stack > 0 -> WAITING_NEXT_HAND
 └── Stack == 0
         ▼
     PLAYER_BUSTED
         ▼
      Leave Seat
         ▼
      SPECTATING
         ├── Rebuy -> Join Seat -> WAITING_NEXT_HAND
         └── Leave Room
```
