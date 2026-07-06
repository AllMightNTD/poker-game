# Tài Liệu Đặc Tả Kỹ Thuật: Cải Tiến Luồng Vòng Đời Trận Đấu (Poker Game Lifecycle)

Tài liệu này chuẩn hóa kế hoạch cải tiến luồng chuyển trạng thái (State Machine) cho hệ thống Poker, tối ưu hóa trải nghiệm người dùng đối với mô hình **Phòng Riêng (Private Room)** có chủ phòng (Host).

---

## 1. Giai Đoạn 1: Chờ Bắt Đầu Bàn (Initial Game)

Khi một phòng chơi mới vừa được khởi tạo, hệ thống sẽ mặc định rơi vào trạng thái thiết lập ban đầu.

### Trạng thái hệ thống: `WAITING_FOR_START`

### Điều kiện kích hoạt:
* Có ít nhất **2 người chơi (Players)** đã thực hiện ngồi vào bàn và nạp tiền (**Buy-in**) thành công.
* **Đối với Chủ phòng (Host):** Giao diện hiển thị nút **"Bắt đầu ván đấu"**.
* **Đối với các người chơi khác:** Trạng thái chờ, chỉ nhìn thấy thông báo hệ thống đang đợi Host bắt đầu.

### Ví dụ kịch bản:
```
[Host] và [Player B] cùng ngồi vào bàn
                 │
                 ▼
    Nút "Bắt đầu ván đấu" xuất hiện (Chỉ hiển thị phía Host)
                 │
                 ▼
         Host nhấn nút: START GAME
                 │
                 ▼
    Hệ thống chuyển trạng thái: PRE_FLOP (Hand #1)
```

---

## 2. Giai Đoạn 2: Trận Đấu Liên Tục (Continuous Game)

Sau khi ván đấu đầu tiên (`Hand #1`) kết thúc, hệ thống tự động chuyển sang cơ chế vận hành khép kín do Server hoàn toàn điều khiển để đảm bảo trận đấu diễn ra mượt mà.

### Luồng xử lý tự động sau mỗi Hand:
$$	ext{Settlement (Tổng kết/Chung tiền)} \longrightarrow 	ext{Reset Hand} \longrightarrow 	ext{Check Eligible Players} \longrightarrow 	ext{Countdown (Đếm ngược)} \longrightarrow 	ext{Hand mới}$$

### Ví dụ chu kỳ lặp:
* **Sau Hand #1:** `Settlement` $ightarrow$ `Reset` $ightarrow$ `Check Players` $ightarrow$ `Countdown` $ightarrow$ **Hand #2**
* **Sau Hand #2:** `Settlement` $ightarrow$ `Reset` $ightarrow$ `Check Players` $ightarrow$ `Countdown` $ightarrow$ **Hand #3**
* *Quá trình này lặp lại liên tục và không giới hạn.*

### Quy tắc đặc thù trong giai đoạn này:
* Nút **"Bắt đầu ván đấu"** sẽ hoàn toàn ẩn đi (không xuất hiện lại nữa).
* Server tự động quản lý và điều khiển toàn bộ vòng đời của các Hand tiếp theo mà không cần sự can thiệp thủ công từ Host.

---

## 3. Quy Định Điều Kiện Xuất Hiện Lại Nút "Bắt Đầu Ván Đấu"

Nút **"Bắt đầu ván đấu"** chỉ được phép xuất hiện lại khi bàn chơi quay về trạng thái ban đầu do không đủ số lượng người chơi tối thiểu để duy trì vòng lặp tự động.

### Điều kiện kích hoạt lại:
$$	ext{eligiblePlayers} < 2$$

### Ví dụ kịch bản xử lý:
```
Trận đấu đang ở [Hand #10]
           │
           ▼
[Player B] cháy túi (Bust)
           │
           ▼
[Player C] rời phòng (Leave)
           │
           ▼
Bàn chơi chỉ còn duy nhất [Host]
           │
           ▼
Hệ thống chuyển sang trạng thái: WAITING_FOR_PLAYERS
```

Nếu sau đó có thêm người chơi mới tham gia: `[Player D] Join` $ightarrow$ `[Player E] Join`.

### Phân tích & Khuyến nghị phương án thiết kế:

* **Phương án A (Giống PokerStars, GGPoker):** Ngay khi đủ $\ge 2$ người, hệ thống tự động chạy `Countdown` $ightarrow$ `Auto Start` mà không cần Host bấm nút. (Phù hợp với phòng công cộng/public).
* **Phương án B (Khuyến nghị cho dự án này):** Hệ thống quay về trạng thái `WAITING_FOR_START`. Host bắt buộc phải nhấn **"Bắt đầu ván đấu"** một lần nữa để kích hoạt chu kỳ mới.

**Lý do chọn Phương án B:** Vì đây là mô hình phòng riêng (Private Room) có chủ phòng, việc trao quyền chủ động cho Host quyết định thời điểm gầy lại bàn mới (ví dụ: chờ thêm bạn bè vào đủ, hoặc chỉnh sửa cấu hình giải đấu) là hợp lý và tối ưu nhất về mặt trải nghiệm.

---

## 4. Sơ Đồ Khái Quát Toàn Bộ Luồng Cải Tiến (Luồng Chuẩn)

```
[Room Created]
      │
      ▼
[WAITING_FOR_START] ◄────────────────────────────────────────┐
      │                                                      │
(Có đủ >= 2 players)                                         │
      │                                                      │
      ▼                                                      │
[Host nhấn "Bắt đầu ván đấu"]                                │
      │                                                      │
      ▼                                                      │
[Hand #1] ──► [Hand #2] ──► [Hand #3] ──► ...                │
      │                                                      │
      ▼ (Nếu eligiblePlayers < 2)                             │
      │                                                      │
[WAITING_FOR_PLAYERS]                                        │
      │                                                      │
(Khi có đủ >= 2 players trở lại)                             │
      │                                                      │
      └──────────────────────────────────────────────────────┘
```
