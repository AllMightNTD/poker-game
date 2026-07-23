# Level 3: CQRS Snapshot — Denormalized Read Model

## Mục tiêu

`broadcastTableState` là hàm được gọi nhiều nhất trong toàn bộ hệ thống (sau mỗi action, mỗi seat change). Hiện tại nó đang thực hiện:

```
broadcastTableState hiện tại:
  getTableState  → 1 HGETALL (Redis)
  PokerTable.findOne → 1 MySQL query
  getAllSeats → 1 pipeline (9 HGETALL) (Redis)
  ─────────────────────────────────────
  Tổng: 1 MySQL query + 10 Redis round-trips
```

Sau Level 3:
```
broadcastTableState mới:
  getTableSnapshot → 1 HGETALL (Redis)
  getTableMeta (cache) → in-memory hit (MySQL chỉ miss lần đầu)
  ─────────────────────────────────────
  Tổng: 0 MySQL query (thông thường) + 1 Redis round-trip
```

---

## Kiến trúc Snapshot Hash

Một Redis Hash duy nhất chứa toàn bộ dữ liệu cần thiết cho broadcast:

```
table:{id}:snapshot → {
  // Table-level state (broadcast-relevant only)
  game_stage: "preflop",
  total_pot: "500",
  current_highest_bet: "100",
  current_turn_seat: "3",
  dealer_seat: "1",
  small_blind_seat: "2",
  big_blind_seat: "3",
  community_cards: "As,Kh,Qd",
  last_full_raise_size: "100",

  // Seat data (prefixed: seat_{n}_)
  seat_1_user_id: "user123",
  seat_1_stack: "900",
  seat_1_status: "active",
  seat_1_current_bet: "0",
  seat_1_username: "Alice",
  seat_1_avatar: "https://...",
  seat_1_is_bot: "0",
  seat_1_has_used_extra_time: "0",

  seat_2_user_id: "user456",
  seat_2_stack: "800",
  seat_2_status: "active",
  ...
}
```

**Nguyên tắc:** Snapshot chỉ chứa các fields cần cho broadcast (không lưu `start_stack`, `encrypted_server_seed`, `shuffled_deck`, `has_acted`, v.v.). Viết luôn xảy ra **song song** với normalized writes, không tốn thêm round-trip.

---

## Table Metadata Cache

`PokerTable.findOne` trong mỗi `broadcastTableState` là lãng phí vì dữ liệu này rất ít khi thay đổi (`name`, `small_blind`, `big_blind`, `max_players`, `owner_id`).

**Giải pháp:** In-memory `Map<tableId, {data, expiresAt}>` với TTL 60 giây trong `PokerGameService`.

---

## Proposed Changes

### Component 1: poker-state.service.ts — Thêm Snapshot API

#### [MODIFY] [poker-state.service.ts](file:///home/dev_ntd/Know_Block/Know_Ledge_Block/BE/src/v1/services/poker-state.service.ts)

Thêm các phương thức:

**Broadcast-relevant seat fields (constant):**
```typescript
static readonly SNAPSHOT_SEAT_FIELDS = [
  'user_id', 'username', 'avatar', 'stack',
  'current_bet', 'status', 'has_used_extra_time', 'is_bot'
];

static readonly SNAPSHOT_TABLE_FIELDS = [
  'game_stage', 'total_pot', 'current_highest_bet', 'current_turn_seat',
  'dealer_seat', 'small_blind_seat', 'big_blind_seat',
  'community_cards', 'last_full_raise_size'
];
```

**`buildSnapshotFromSeatsAndState(pipeline, tableId, seats, tableFields)` — private helper:**
Thêm `HSET table:{id}:snapshot` vào pipeline bất cứ khi nào seats/state được cập nhật.

**`updateSnapshotSeatFields(pipeline, tableId, seatNumber, fields)` — inline helper:**
Lọc fields liên quan đến broadcast rồi HSET `seat_{n}_*` vào snapshot trong cùng pipeline.

**`updateSnapshotTableFields(pipeline, tableId, fields)` — inline helper:**
Lọc table fields liên quan đến broadcast rồi HSET vào snapshot trong cùng pipeline.

**`getTableSnapshot(tableId, maxPlayers)` → `{tableFields, seats[]}` — read method:**
1 lệnh `HGETALL table:{id}:snapshot` trả về toàn bộ dữ liệu cần thiết cho broadcast.

**`clearSeatFromSnapshot(pipeline, tableId, seatNumber)` — khi player rời ghế:**
`HDEL table:{id}:snapshot seat_{n}_*` (xóa các fields của ghế đó khỏi snapshot).

---

### Component 2: Tích hợp snapshot writes vào các write paths

#### [MODIFY] [poker-state.service.ts](file:///home/dev_ntd/Know_Block/Know_Ledge_Block/BE/src/v1/services/poker-state.service.ts)

Cập nhật 3 phương thức write chính để snapshot tự động được đồng bộ trong cùng pipeline:

| Phương thức | Thay đổi |
|---|---|
| `setMultipleSeatsAndTableState` | Thêm `updateSnapshotSeatFields` + `updateSnapshotTableFields` vào pipeline |
| `setSeatsBulk` | Thêm `updateSnapshotSeatFields` cho mỗi seat update |
| `setSeat` (single seat) | Thêm `updateSnapshotSeatFields` vào pipeline |
| `setTableState` | Thêm `updateSnapshotTableFields` vào pipeline |
| `deleteSeat` | Thêm `clearSeatFromSnapshot` vào pipeline |

---

### Component 3: poker-game.service.ts — Cập nhật broadcastTableState

#### [MODIFY] [poker-game.service.ts](file:///home/dev_ntd/Know_Block/Know_Ledge_Block/BE/src/v1/services/poker-game.service.ts)

```typescript
// Thêm in-memory cache cho PokerTable metadata
private readonly tableMetaCache = new Map<string, {
  data: Partial<PokerTable>;
  expiresAt: number;
}>();

async broadcastTableState(roomId: string) {
  // 1. Lấy snapshot (1 Redis HGETALL thay vì 10+ calls)
  const snapshot = await this.stateService.getTableSnapshot(roomId);
  
  // 2. Table meta từ cache (tránh MySQL trên mỗi broadcast)
  const dbTable = await this.getCachedTableMeta(roomId); // cache 60s
  
  // ... build payload từ snapshot ...
}

private async getCachedTableMeta(tableId: string): Promise<PokerTable | null> {
  const cached = this.tableMetaCache.get(tableId);
  if (cached && Date.now() < cached.expiresAt) return cached.data as PokerTable;
  const fresh = await PokerTable.findOne({ where: { id: tableId } });
  if (fresh) this.tableMetaCache.set(tableId, { data: fresh, expiresAt: Date.now() + 60_000 });
  return fresh;
}
```

Cũng cần cập nhật `clearSeatFromSnapshot` được gọi trong `lobbyService.leaveRoom` khi player rời ghế (xóa ghế khỏi snapshot).

---

## Open Questions

> [!IMPORTANT]
> Có một số chỗ trong `poker-lobby.service.ts` gọi `setSeat` (ví dụ khi player join ghế lần đầu). Cần đảm bảo khi player join, snapshot được build đúng. Sẽ cần xem `joinSeat` logic để bổ sung.

---

## Verification Plan

### Automated Tests
```bash
cd BE && npm run build
```

### Manual Verification
```bash
# Kiểm tra snapshot key tồn tại sau khi bàn bắt đầu
redis-cli HGETALL "table:{id}:snapshot"

# Kiểm tra snapshot được update sau action
# Giá trị seat_N_stack phải thay đổi theo action
```

---

## Impact Summary

| Metric | Trước | Sau |
|---|---|---|
| Redis reads / broadcast | 10 (1 HGETALL + 9 pipeline HGETALL) | **1 HGETALL** |
| MySQL queries / broadcast | 1 (PokerTable.findOne) | **0** (cache hit) |
| Broadcast latency (p50) | ~5-15ms | **< 1ms** |
| Write overhead | 0 (thêm vào pipeline hiện có) | **0** (inline, no extra round-trip) |
