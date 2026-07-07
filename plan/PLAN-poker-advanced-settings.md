# PLAN-poker-advanced-settings

## 🟢 PHASE 1: Tổng quan và Khám phá (Scope)
Bạn vừa cung cấp một bảng cấu hình phòng chơi (Room Settings) cực kỳ chi tiết chuẩn Casino chuyên nghiệp. Bảng này bao gồm 14 tham số nâng cao, phân tách rõ ràng tác dụng lên chế độ chơi tự do (Cash/Custom) và giải đấu (Tournament).

### Phân tích các trường dữ liệu:
1. **Shared (Cả Cash & Tour)**: `table_timeout_action` (Fold/Check), `max_spectators`, `allow_chat`, `allow_emotes`, `anti_collusion_level`.
2. **Cash Game Only**: `table_visibility` (`PUBLIC`, `PRIVATE`, `FRIENDS`), `max_waiting_list`.
3. **Tournament Only**: `allow_addon`, `late_registration_minutes`, `auto_start_player_count`, `min_players_to_start`, `break_interval`, `break_duration`.
4. **Mixed**: `allow_rebuy` (Mặc định có ở Cash, có thể bật/tắt ở Tournament).

Việc bổ sung thêm 14 trường này nếu tạo thành 14 cột riêng biệt trong database sẽ làm bảng `poker_table` phình to không cần thiết.
👉 **Giải pháp tối ưu**: Sử dụng kiểu dữ liệu `JSON` (hoặc `JSONB` nếu là Postgres) để lưu trữ các cấu hình nâng cao này.

---

## 🟡 PHASE 2: Đánh giá sự ảnh hưởng đến chức năng hiện tại (System Impact Analysis)

Việc áp dụng 14 tham số này đòi hỏi chúng ta phải sửa đổi sâu vào Core Game Engine (Backend) và các luồng UI (Frontend). Dưới đây là sự ảnh hưởng chi tiết:

### 1. Luồng Lobby & Matchmaking (Sảnh chờ)
- **`table_visibility`**: API `GET /rooms` phải lọc các phòng `PRIVATE`. Nếu là `FRIENDS`, cần join với bảng bạn bè (nếu có) để quyết định hiển thị.
- **`max_spectators`**: API `POST /rooms/spectate` trước đây cho phép vào không giới hạn. Nay phải đếm số lượng connection đang xem (qua Redis/Socket) và reject nếu vượt quá giới hạn.
- **`max_waiting_list`**: (Tính năng MỚI HOÀN TOÀN) Khi phòng đủ người (`playersCount >= max_players`), thay vì văng lỗi, API `POST /rooms/join-request` sẽ đẩy user vào một Hàng đợi (Queue trên Redis). Khi có người rời bàn (`leave`), hệ thống tự động pop user từ Queue và gửi socket event báo hiệu tới lượt.

### 2. Luồng Game Logic (Poker Engine)
- **`table_timeout_action`**: 
  - *Hiện tại*: Hết thời gian (`actionEndTime`), Worker mặc định tự động Fold (nếu có người bet) hoặc Check (nếu không ai bet).
  - *Ảnh hưởng*: Nếu chủ phòng setup `AUTO_FOLD`, hệ thống Worker sẽ Fold luôn kể cả khi player hoàn toàn có quyền Check (ví dụ: ở vị trí Big Blind chưa ai raise).
- **`anti_collusion_level`**: Tác động đến logic chia bài và kiểm duyệt. Mức cao nhất (High) sẽ chặn các người chơi cùng IP hoặc cùng thiết bị (Device Fingerprint) ngồi chung bàn. Đòi hỏi update middleware chặn ở bước `buyIn`.

### 3. Luồng Giao tiếp trong phòng (In-Room Communication)
- **`allow_chat` & `allow_emotes`**: 
  - *Hiện tại*: Bất kỳ ai gửi event qua Socket đều được broadcast.
  - *Ảnh hưởng*: Tại Gateway (`poker-lobby.gateway.ts`), các event xử lý chat và ném vật phẩm (Throwable Items) phải check cờ này trong cấu hình phòng. Nếu `false`, chặn broadcast và trả về thông báo lỗi "Chủ phòng đã tắt tính năng này".

### 4. Luồng Giải Đấu (Tournament Mechanics)
Đòi hỏi xây dựng thêm hẳn một module `TournamentManager`:
- **`min_players_to_start` & `auto_start_player_count`**: Timer bắt đầu ván đầu tiên sẽ bị "đóng băng" cho đến khi đếm đủ số người ngồi trong `TableSession`.
- **`late_registration_minutes`**: API `joinRoom` phải check `Date.now() < (start_time + late_registration_minutes)`.
- **`allow_rebuy` & `allow_addon`**: Cần viết thêm 2 API mới `POST /api/v1/rooms/:id/rebuy` và `POST /api/v1/rooms/:id/addon`. Add-on chỉ được phép gọi vào đúng thời điểm nghỉ giải lao (Break time).
- **`break_interval` & `break_duration`**: Cần một Redis Cronjob đếm ngược. Cứ sau X phút (`break_interval`), Cronjob sẽ phát tín hiệu đổi `status` phòng sang `paused` trong thời gian `break_duration` phút, và block toàn bộ action (ngoại trừ Add-on).

---

## 🔵 PHASE 3: Các bước thực thi chiến lược (Blueprint)

### Giai đoạn 1: Thiết kế lại Database (Entity)
Trong `poker_table.entity.ts`, tạo 2 cột JSON mới:
- `custom_settings` (type: 'json'): Lưu visibility, waiting_list, chat_emotes, timeout_action...
- `tournament_settings` (type: 'json'): Lưu late_reg, break, addon, rebuy...

### Giai đoạn 2: Cập nhật `CreateRoomDto`
Sử dụng `class-validator` để định nghĩa cấu trúc API thật chặt chẽ (validate nested JSON).

### Giai đoạn 3: Cập nhật Controller, Service và Game Engine
- Cập nhật `PokerLobbyService.createRoom` để nhận và lưu JSON object.
- Chèn các logic "chắn cờ" (check config flags) vào các API `joinRoom`, `buyIn`, `spectateRoom` và các Socket Gateway như đã phân tích ở PHASE 2.

---

## 🔴 PHASE 4: Phân công (Surgical Distribution)
- **`database-architect`**: Update `poker_table` Entity.
- **`backend-specialist`**: Update DTO và nhúng logic kiểm tra cờ vào các Gateway/Service tương ứng. 
- **`frontend-specialist`**: Cập nhật màn hình Tạo Phòng (Create Room Modal) bằng các switch Toggles/Select Options để chủ phòng dễ dàng thiết lập 14 tham số này.
