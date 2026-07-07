# PLAN-poker-room-creation

## 🟢 PHASE 1: Tổng quan và Phạm vi (Scope)
Mục tiêu: Nâng cấp luồng Tạo phòng (Create Room) trong Poker Game để hỗ trợ cấu trúc Payload mới chia thành 3 nhóm thông tin rõ ràng: Thông tin cơ bản, Cấu hình luật chơi, và Cấu hình đặc trưng theo Chế độ (`CUSTOM` hoặc `TOURNAMENT`).

### Phân tích hiện trạng:
- **Entity (`poker_table.entity.ts`)**: Hiện tại lưu trữ phẳng, đã có `name`, `game_type`, `small_blind`, `big_blind`, `min_buyin`, `max_buyin`, `rake_rate`, `rake_cap`. Thiếu các trường: `mode`, `turn_time_limit`, `time_bank`, `is_private`, `password`, và toàn bộ các field của Tournament.
- **DTO (`create-room.dto.ts`)**: Cấu trúc cũ là phẳng, thiếu các trường cấu hình thời gian và chưa có validate nested object cho `custom_config` và `tournament_config`.
- **Controller/Service**: Cần điều chỉnh logic mapping dữ liệu từ request payload mới vào DB.

---

## 🟡 PHASE 2: Các bước thực thi chiến lược (Blueprint)

### Giai đoạn 1: Cập nhật Database Schema (Entity)
Cần bổ sung các cột mới vào `poker_table.entity.ts` để lưu trữ trạng thái. Vì Tournament có nhiều field riêng, ta có thể lưu dưới dạng cột `nullable` hoặc JSON. Ở đây, thêm các cột trực tiếp để dễ query:
- Bổ sung `mode` (varchar: 'CUSTOM', 'TOURNAMENT', default: 'CUSTOM').
- Bổ sung cấu hình thời gian: `turn_time_limit` (int, default 15), `time_bank` (int, default 30).
- Bổ sung cho CUSTOM: `is_private` (boolean, default false), `password` (varchar, nullable). (Lưu ý: Mật khẩu nên được hash trước khi lưu).
- Bổ sung cho TOURNAMENT: `buy_in_fee` (bigint), `starting_chip` (bigint), `blind_up_interval` (int), `blind_structure_id` (varchar/int), `payout_structure_id` (varchar/int), `start_time` (timestamp).

### Giai đoạn 2: Refactor `CreateRoomDto`
Tạo lại cấu trúc `CreateRoomDto` với `class-validator` và `class-transformer` để support Nested Object và Conditional Validation:
1. **General Info & Game Rules**: `room_name`, `game_type`, `mode`, `max_players`, `small_blind`, `min_buy_in`, `max_buy_in`, `turn_time_limit`, `time_bank`.
2. **Nested DTOs**:
   - `CustomConfigDto`: `is_private`, `password`, `rake_rate`, `rake_cap`.
   - `TournamentConfigDto`: `buy_in_fee`, `starting_chip`, `blind_up_interval`, `blind_structure_id`, `payout_structure_id`, `start_time`.
3. **Conditional Validation**:
   - Nếu `mode === 'CUSTOM'`, bắt buộc (hoặc validate) `custom_config`.
   - Nếu `mode === 'TOURNAMENT'`, bắt buộc (hoặc validate) `tournament_config`.

### Giai đoạn 3: Cập nhật Logic `PokerLobbyService` và `RoomsController`
- Sửa đổi `RoomsController.createRoom` để nhận và show đúng Swagger schema.
- Trong `PokerLobbyService.createRoom`:
  - Map `room_name` -> `name`.
  - Tự động tính `big_blind = small_blind * 2` (nếu không truyền riêng).
  - Trích xuất dữ liệu từ `custom_config` hoặc `tournament_config` dựa vào `mode` để lưu xuống DB.
  - Xử lý hash mật khẩu nếu `mode === 'CUSTOM'` và `is_private === true`.

---

## 🔵 PHASE 3: Phân công (Surgical Distribution)
- **`backend-specialist`**: Thực hiện refactor toàn bộ BE (Entity, DTO, Service, Controller).
- **`orchestrator`**: Đảm bảo cấu trúc DB mở rộng an toàn, không ảnh hưởng đến các record phòng cũ (cần xử lý default values cẩn thận).

---

## 🔴 PHASE 4: Kiểm thử (Verification Plan)
- **Test Case 1 (CUSTOM)**: Gửi Request POST tạo phòng CUSTOM với `custom_config`, check DB xem `is_private`, hash `password`, và `big_blind` có đúng x2 không.
- **Test Case 2 (TOURNAMENT)**: Gửi Request POST tạo phòng TOURNAMENT, kiểm tra lỗi nếu thiếu `tournament_config`, và check DB xem các field giải đấu có được lưu chính xác không.
- **Swagger UI**: Kiểm tra xem giao diện Swagger có hiển thị đúng cấu trúc nested JSON như mong đợi hay không.
