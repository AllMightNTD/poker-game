# Poker Table Responsive Refactor Plan (Next.js 16)

## 1. Mục tiêu

Refactor giao diện Poker Table theo hướng **Mobile First**, tối ưu trải nghiệm người chơi trên Desktop, Tablet và Mobile nhưng vẫn giữ nguyên toàn bộ business logic hiện tại.

### Mục tiêu chính

* Làm nổi bật bàn chơi (Poker Table).
* Hero luôn nằm ở vị trí thuận tiện nhất để thao tác.
* Không cần scroll khi chơi.
* Responsive theo từng loại thiết bị.
* Giữ nguyên toàn bộ logic game.
* Component hóa theo chuẩn Next.js 16 App Router.

---

# 2. Responsive Layout

## Desktop (>1280px)

```
┌──────────────────────────────────────────────────────────────┐
│ Header                                                       │
├───────────────┬──────────────────────────────┬───────────────┤
│ Chat          │                              │ Hand History  │
│               │         Poker Table          │               │
│               │                              │               │
├───────────────┴──────────────────────────────┴───────────────┤
│ Hero Cards                                                   │
│ Hero Information                                             │
│ Fold | Check | Call | Raise                                 │
└──────────────────────────────────────────────────────────────┘
```

### Đặc điểm

* Chat sidebar bên trái.
* Hand History bên phải.
* Hero luôn nằm dưới bàn chơi.
* Action Bar cố định phía dưới.

---

## Tablet (768px - 1280px)

```
Header

Poker Table

Hero

Action Buttons
```

### Đặc điểm

* Ẩn Chat Sidebar.
* Ẩn History Sidebar.
* Chat & History chuyển thành Drawer.
* Poker Table chiếm gần toàn bộ màn hình.

---

## Mobile (<768px)

```
Header

Pot

Community Cards

Poker Table

Hero Panel

Action Bar
```

### Đặc điểm

* Không còn Sidebar.
* Hero luôn ở dưới.
* Action Bar Sticky Bottom.
* Chat và History mở bằng Bottom Sheet.

---

# 3. Table Scale

## Hiện tại

```
max-width: 850px
aspect-ratio: 9 / 5
```

## Đề xuất

Tạo custom hook:

```tsx
useTableScale()
```

Ví dụ:

```tsx
export function useTableScale() {
    const isMobile = useMediaQuery("(max-width:768px)");

    if (isMobile) {
        return {
            scale: 1.18,
            aspect: "1 / 1"
        };
    }

    return {
        scale: 1,
        aspect: "9 / 5"
    };
}
```

Áp dụng:

```tsx
<div
    style={{
        transform: `scale(${scale})`
    }}
>
```

Mục tiêu:

* Mobile: bàn chơi lớn hơn (~85–90% màn hình).
* Desktop: giữ kích thước hiện tại.

---

# 4. Hero Panel

## Hiện tại

```
Player

Cards

Buttons
```

## Đề xuất

```
AK

DungTien

2,500,000

██████████ Timer

Fold   Check   Call   Raise
```

### Thay đổi

* Hero luôn nằm dưới cùng.
* Timer hiển thị rõ ràng.
* Thông tin Hero tách riêng khỏi Player Seat.
* Giống trải nghiệm PokerStars.

---

# 5. Player Seat

## Desktop

```
🙂

DungTien

250K

Raise
```

### Hiển thị

* Avatar
* Tên
* Chips
* Last Action

---

## Mobile

```
🙂

250K

Raise
```

### Thay đổi

* Ẩn tên mặc định.
* Chỉ hiển thị khi người dùng nhấn vào Player.
* Giảm kích thước Player Panel để tăng diện tích bàn chơi.

---

# 6. Chat

## Desktop

```
Sidebar
```

### Chức năng

* Hiển thị liên tục.
* Không ảnh hưởng Poker Table.

---

## Mobile

```
Floating Chat Button

↓

Bottom Sheet
```

### Chức năng

* Mở khi cần.
* Không chiếm diện tích màn hình.

---

# 7. Hand History

## Desktop

```
Sidebar
```

## Mobile

```
Floating Button

↓

Bottom Sheet
```

### Mục tiêu

* Không che Poker Table.
* Chỉ hiển thị khi người chơi cần xem.

---

# 8. Action Bar

## Desktop

```
Fold

Check

Call

Raise
```

---

## Mobile

```
Fold    Check    Call

────────────────────────

Quick Bet

MIN

1/2 POT

POT

ALL IN

────────────────────────

Raise Slider

────────────────────────

RAISE
```

### Mục tiêu

* Sticky Bottom.
* Không cần scroll.
* Thao tác một tay thuận tiện.

---

# 9. Pot Display

## Hiện tại

Pot khá nhỏ.

## Đề xuất

```
──────────────

POT

245,000

──────────────
```

### Thay đổi

* Đặt chính giữa Community Cards.
* Font lớn hơn.
* Màu vàng nổi bật.
* Dễ quan sát.

---

# 10. Community Cards

### Hiển thị

```
🂡 🂱 🂾 🃑 🂺
```

### Thay đổi

* Là trung tâm của bàn chơi.
* Card spacing lớn hơn.
* Animation khi chia bài.
* Scale theo thiết bị.

---

# 11. Hero Position

## Desktop

```
Poker Table

──────────────

Hero Cards

Hero Information

Action Bar
```

## Mobile

```
Pot

Board

Poker Table

──────────────

Hero

──────────────

Action Bar
```

### Mục tiêu

* Hero không bị Player khác che.
* Người chơi luôn tập trung vào bài của mình.

---

# 12. Responsive Rules

| Thành phần  | Desktop      | Tablet    | Mobile       |
| ----------- | ------------ | --------- | ------------ |
| Chat        | Sidebar      | Drawer    | Bottom Sheet |
| History     | Sidebar      | Drawer    | Bottom Sheet |
| Hero        | Bottom       | Bottom    | Bottom       |
| Action Bar  | Bottom       | Sticky    | Sticky       |
| Table       | 70% màn hình | 80%       | 85–90%       |
| Player Name | Hiện         | Hiện      | Ẩn mặc định  |
| Pot         | Trung tâm    | Trung tâm | Trung tâm    |

---

# 13. Animation

Sử dụng **Framer Motion**.

Bao gồm:

* Chia bài (Deal Animation).
* Chip bay vào Pot.
* Active Player Glow.
* Countdown Timer Animation.
* Hero Pulse Effect.
* Dealer Button Animation.
* Community Card Flip.
* Pot Win Animation.
* Toast Animation.
* Player Action Animation (Fold, Check, Call, Raise, All-in).

---

# 14. Performance

* React.memo cho Player Seat.
* React.memo cho Poker Card.
* useMemo cho Community Cards.
* useCallback cho Action Handlers.
* Tách state sang custom hooks.
* Lazy load Chat & History.
* Giảm re-render khi Timer cập nhật.

---

# 15. Next.js 16 Architecture

```
app/
└── poker-game/
    └── [id]/
        ├── page.tsx
        ├── loading.tsx
        ├── error.tsx
        └── components/
            ├── layout/
            ├── table/
            ├── hero/
            ├── chat/
            ├── history/
            ├── settings/
            ├── ui/
            └── hooks/
```

### Tách component

* TableHeader
* PokerTable
* PlayerSeat
* HeroPanel
* ActionBar
* CommunityCards
* PotDisplay
* ChatDrawer
* HistoryDrawer
* SettingsModal
* PokerCard
* Avatar
* Timer
* Toast

---

# 16. Kết quả mong muốn

* Mobile-first UI.
* Hero luôn là trung tâm thao tác.
* Poker Table chiếm tối đa diện tích hiển thị.
* Không cần cuộn khi chơi.
* Giao diện tương tự các ứng dụng Poker hiện đại (PokerStars, GGPoker, WSOP).
* Dễ mở rộng và bảo trì theo chuẩn Next.js 16 App Router.
