# Kế hoạch Refactor & Redesign Trang Chủ Sảnh Poker (Lobby)

Tài liệu này phác thảo kế hoạch nâng cấp toàn diện giao diện và tích hợp API cho trang chủ sảnh game Poker (`FE/app/poker-game/page.tsx`) theo định hướng tại `plan/PLAN-home-poker.md`.

---

## 🎯 1. Mục tiêu & Phạm vi

### A. Về Giao diện (Redesign & Premium UI)
1. **Header Sảnh Premium**:
   - Hiển thị đầy đủ Avatar, Nickname, số dư Chip, level VIP.
   - Thêm nút nhận phần thưởng hàng ngày (Daily Reward), nhiệm vụ (Missions), Hộp thư (Mailbox).
   - Tích hợp Menu cài đặt, Hỗ trợ (Support), Đăng xuất.
2. **Banner / Event Carousel**:
   - Banner động (Carousel) giới thiệu sự kiện: Freeroll hàng tuần, Mùa giải mới, Khuyến mãi nạp chip, Bảng xếp hạng.
3. **Khu vực chơi nhanh (Quick Play)**:
   - Một Widget cho phép chọn nhanh Game Type (Texas Hold'em/Omaha), Stake (Mức blind), Buy-in và nhấn nút "Quick Play" để tự động tìm và tham gia bàn phù hợp nhất.
4. **Hệ thống Tab Game**:
   - Phân chia rõ ràng giữa **Cash Game** và **Private Room** (Phòng riêng tư).
5. **Bộ lọc bàn chơi chuyên nghiệp (Filters)**:
   - Lọc theo Game (Texas Hold'em / Omaha).
   - Lọc theo Stake (Micro, Low, Medium, High).
   - Lọc theo số lượng người (6-max, 9-max).
   - Lọc trạng thái bàn (Đang chờ, Đang chơi).
   - Nút ẩn bàn đầy (Hide Full), ẩn bàn riêng tư (Hide Private).
6. **Bảng Danh sách Bàn Chơi (Table List & Card View)**:
   - Hỗ trợ cả 2 chế độ hiển thị: Dạng lưới (Card View) và dạng danh sách (List View).
   - Hiển thị chi tiết: Tên bàn, Blinds, Số người chơi/Max, Avg Pot, VPIP (%), Danh sách chờ (Waiting List), Nút vào bàn/Theo dõi.
7. **Tiện ích Xã hội & Thống kê (Social & Stats Widgets)**:
   - **Recently Played**: Danh sách các bàn vừa chơi gần đây (Lấy dữ liệu từ TableSession).
   - **Friends Online**: Danh sách cao thủ đang online/đang chơi tại các bàn kèm nút "Join" nhanh.
   - **Leaderboard**: Bảng xếp hạng Top phỉnh của người chơi trong hệ thống.
   - **Online Stats**: Số người trực tuyến, số bàn đang chạy, tổng Jackpot.
8. **Create Room Modal Nâng cấp**:
   - Thêm cấu hình nâng cao: Mật khẩu (Password), Time Bank, Turn Time, Private/Public, Max Spectators.
9. **Footer chuyên nghiệp**:
   - Hiển thị Phiên bản, FPS, Ping mạng thực tế, Server IP, hỗ trợ kỹ thuật.

### B. Về API Tích hợp (BE & FE)
1. **API Mới / Bổ sung trên NestJS (`BE`)**:
   - `GET /api/v1/rooms/recent`: Lấy các bàn chơi gần đây của user dựa trên lịch sử `TableSession`.
   - `GET /api/v1/lobby/leaderboard`: Lấy top 10 người chơi có số dư ví lớn nhất.
   - `GET /api/v1/lobby/active-players`: Lấy danh sách các người chơi khác đang chơi để mô phỏng "Friends playing" động.
2. **Kết nối WebSocket**:
   - Lắng nghe sự kiện realtime cập nhật số người online, số bàn chạy, và cập nhật trạng thái bàn chơi ngay khi có người ra vào bàn.

---

## 🛠️ 2. Kế hoạch Thực hiện Từng bước (Step-by-Step Task Checklist)

### 🔴 Phase 1: Nâng cấp Backend (API & Controllers)
- [ ] **Task BE-1**: Thêm API lấy bàn chơi gần đây trong `rooms.controller.ts` và `poker-lobby.service.ts`.
- [ ] **Task BE-2**: Thêm API bảng xếp hạng (Leaderboard) trong `lobby.controller.ts` và `poker-lobby.service.ts` (query ví chips của users).
- [ ] **Task BE-3**: Thêm API lấy danh sách người chơi online/active trong `lobby.controller.ts` để hiển thị phần cao thủ đang chơi.
- [ ] **Task BE-4**: Hỗ trợ mật khẩu và các tùy chọn phòng riêng tư trong logic tạo phòng.

### 🟡 Phase 2: Cải tiến UI Components (Frontend)
- [ ] **Task FE-1**: Refactor `SearchFiltersBar.tsx` để hỗ trợ lọc đầy đủ (Game Type, Stake, Table Status, 6-max/9-max, Hide Full/Private).
- [ ] **Task FE-2**: Thêm chế độ hiển thị List View cho bàn chơi (Table View dạng bảng phẳng).
- [ ] **Task FE-3**: Nâng cấp `CreateTableModal.tsx` để hỗ trợ cấu hình Password, Max Spectators, Turn Time, Time Bank.
- [ ] **Task FE-4**: Tạo Component `LobbyWidgets.tsx` chứa các Widget: Leaderboard, Recently Played, Friends Playing, Missions, Online Stats.
- [ ] **Task FE-5**: Tạo Component `EventBanner.tsx` hiển thị banner sự kiện/carousel hiện đại.

### 🟢 Phase 3: Lắp ráp & Ghép API vào Lobby chính (`FE/app/poker-game/page.tsx`)
- [ ] **Task FE-6**: Xây dựng Header sảnh cao cấp (Avatar, số dư ví đồng bộ, nút nhận Chips free, level VIP ảo, Missions, Mailbox).
- [ ] **Task FE-7**: Tích hợp logic tìm bàn nhanh (Quick Play Widget) tự động join bàn có mức blind và slot trống phù hợp.
- [ ] **Task FE-8**: Gọi API `GET /api/v1/rooms/recent`, `GET /api/v1/lobby/leaderboard`, và `GET /api/v1/lobby/active-players` hiển thị lên các widget bên dưới.
- [ ] **Task FE-9**: Tích hợp các bộ lọc mới vào danh sách bàn, ẩn/hiện bàn riêng tư, ẩn/hiện bàn đầy.
- [ ] **Task FE-10**: Thiết lập Footer hiển thị Ping động (sử dụng interval test ping đến api), FPS (dùng requestAnimationFrame), Version, Server.
- [ ] **Task FE-11**: Xây dựng Bottom Navigation dành cho giao diện Mobile.

### 🔵 Phase 4: Kiểm thử & Tối ưu hóa
- [ ] **Task QA-1**: Kiểm tra tính năng tạo phòng có mật khẩu/riêng tư.
- [ ] **Task QA-2**: Kiểm tra tính năng lọc bàn hoạt động chính xác.
- [ ] **Task QA-3**: Đo lường hiệu năng và đảm bảo UI phản hồi mượt mượt, responsive tốt trên Mobile.

---

## 🎯 3. Kế hoạch Xác minh (Verification Plan)

### A. Kiểm thử Thủ công (Manual Checks)
1. **Kiểm tra Quick Play**: Chọn mức blind -> Hệ thống tự đưa vào bàn phù hợp nhất. Nếu không có bàn nào, hiển thị thông báo đề xuất tạo bàn.
2. **Kiểm tra Tạo bàn bảo mật**: Tạo bàn PRIVATE có password -> Bàn không xuất hiện ngoài danh sách public nếu lọc ẩn private, và khi vào bàn yêu cầu nhập password.
3. **Kiểm tra Widget**: Đảm bảo bảng xếp hạng hiển thị đúng thứ hạng phỉnh, Recently Played hiển thị đúng các bàn đã ngồi trước đó.
