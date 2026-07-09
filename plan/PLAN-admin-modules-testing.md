# Strategic Implementation Plan: Admin Modules Testing

## 🎯 1. Goals
- Thực hiện kiểm thử toàn diện (Manual & API Testing) cho 3 module mới trên Admin Dashboard: **Hand History**, **Revenue Reports**, và **System Broadcast**.
- Đảm bảo tính chính xác của dữ liệu được truy xuất, đặc biệt là các thông tin nhạy cảm như doanh thu (Rake) và chi tiết ván bài (Bài tẩy, timeline cược).
- Xác minh sự ổn định của kết nối WebSocket khi thực hiện tính năng System Broadcast tới toàn bộ client online.
- Đảm bảo giao diện người dùng (UI) trên các trang tương ứng (`hands/page.tsx`, `revenue/page.tsx`, `system/page.tsx`) hoạt động mượt mà, hiển thị đúng dữ liệu và hỗ trợ tốt cho UX.

> [!IMPORTANT]
> Dữ liệu doanh thu (Revenue) và lịch sử ván bài (Hand History) yêu cầu độ chính xác tuyệt đối. Việc test cần cover cả trường hợp không có dữ liệu và dữ liệu lớn để kiểm tra Pagination.

> [!WARNING]
> Tính năng System Broadcast sẽ gửi socket message `system:broadcast` trực tiếp qua `PokerLobbyGateway`. Cần phải cẩn thận không để spam quá nhiều hoặc test nhầm trên production data (nếu có).

## 🔗 2. Dependency Chains
- **Backend APIs**:
  - `GET /admin/hands` & `GET /admin/hands/:id` (Phụ thuộc vào DB: GameRoom, PokerGame, User)
  - `GET /admin/revenue/stats` (Phụ thuộc vào DB: Transactions, GameRoom (rake))
  - `POST /admin/system/broadcast` (Phụ thuộc vào `PokerLobbyGateway` WebSocket)
- **Frontend Pages**:
  - `/backstage/hands` (Cần kết nối API lấy danh sách và chi tiết)
  - `/backstage/revenue` (Cần kết nối API lấy stats và render biểu đồ/bảng)
  - `/backstage/system` (Cần kết nối API gửi broadcast)

## 🛤️ 3. Phase-by-Phase Breakdown

### Phase 1: API Level Testing (Backend)
- **Action 1.1**: Gọi API `GET /admin/hands` với các tham số `cursor`, `limit`, `tableId` hợp lệ và không hợp lệ.
- **Action 1.2**: Gọi API `GET /admin/hands/:id` để kiểm tra chi tiết cấu trúc JSON trả về (có đầy đủ mảng action, board cards, pocket cards).
- **Action 1.3**: Gọi API `GET /admin/revenue/stats`. Kiểm tra các field trả về có phản ánh đúng tổng doanh thu Rake và tổng Nạp/Rút.
- **Action 1.4**: Gọi API `POST /admin/system/broadcast` với body có message, body rỗng (`{}`), string trống (`"  "`). Đảm bảo validate thành công và trả về response đúng.

### Phase 2: System Broadcast Integration (WebSocket)
- **Action 2.1**: Mở một client kết nối tới `PokerLobbyGateway`.
- **Action 2.2**: Bắn API `/admin/system/broadcast` và quan sát xem client có nhận được event `system:broadcast` hay không.

### Phase 3: UI/UX & End-to-End Testing (Frontend)
- **Action 3.1**: Truy cập `/backstage/hands`. Cuộn/Chuyển trang để test Cursor Pagination. Click vào một ván bài để xem UI hiển thị chi tiết bài tẩy/timeline.
- **Action 3.2**: Truy cập `/backstage/revenue`. Kiểm tra độ hiển thị của bảng/biểu đồ, đảm bảo format tiền tệ chính xác.
- **Action 3.3**: Truy cập `/backstage/system`. Sử dụng form để gửi thông báo. Kiểm tra Toast/Alert phản hồi thành công và giả lập 1 client nhận thông báo popup (Marquee) hiển thị.

## 🛡️ 4. Verification Plan (Manual)

### Checklist cho Tester/QA:
- [ ] API `/admin/hands` phản hồi dưới 500ms khi DB lớn.
- [ ] API `/admin/hands/:id` không rò rỉ dữ liệu ngoài luồng (như password, email người chơi...).
- [ ] API `/admin/revenue/stats` phải trả về doanh thu đúng với dữ liệu mock (hoặc dữ liệu staging).
- [ ] WebSocket `system:broadcast` được emit chính xác, có tính năng debounce/rate-limit nếu gọi POST quá nhanh.
- [ ] Giao diện Front-end không có lỗi console khi truy cập 3 trang mới.
- [ ] Lỗi `403 Forbidden` trả về đúng nếu Admin không có quyền (`AdminRoles`).

---

**Ready for Execution**.
Sử dụng `/orchestrate` hoặc điều phối tester (ví dụ: `QA-Specialist`, `Frontend-Specialist`, `Backend-Specialist`) để tiến hành thực thi.
