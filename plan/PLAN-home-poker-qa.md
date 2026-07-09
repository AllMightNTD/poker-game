# Kế hoạch QA & Hoàn thiện Sảnh Poker (Tiếp nối PLAN-home-poker.md)

> [!NOTE]
> Tài liệu này là bước tiếp theo của `PLAN-home-poker.md` và `PLAN-home-poker-redesign.md`. Dựa trên phân tích, các Phase 1 (Backend), Phase 2 (Cải tiến UI Components), và Phase 3 (Lắp ráp API vào Lobby) đã được triển khai gần như hoàn thiện.
> Chúng ta đang bước vào **Phase 4: Kiểm thử, Tối ưu hóa và Hoàn thiện (QA & Polish)**.

---

## 🎯 1. Trạng thái hiện tại (Current Status)

- **Backend (BE)**:
  - Đã có API lấy phòng chơi gần đây (`/api/v1/rooms/recent`).
  - Đã có API bảng xếp hạng (`/api/v1/lobby/leaderboard`).
  - Đã có API active players (`/api/v1/lobby/active-players`).
  - Đã có API thống kê tổng quan (`/api/v1/lobby/stats`).
  - Đã tích hợp Socket.io để realtime số lượng người chơi, số lượng phòng.
- **Frontend (FE)**:
  - `page.tsx` đã được thiết kế lại với giao diện Premium Casino, có background radial gradient tối và watermark chất bài.
  - Các Component `HeroBanner`, `SearchFiltersBar`, `TableCard`, `EventBanner`, `LobbyWidgets`, `CreateTableModal` đã được chia tách và thiết kế tinh gọn.
  - Đã kết nối API thông qua React Query (useQuery, useMutation).
  - Quick Play Widget đã được tích hợp logic tự tìm bàn thích hợp.

---

## 📅 2. Kế hoạch tiếp theo (Phase 4: QA & Tối ưu hóa)

### 🔴 Step 1: Kiểm tra tính năng (Functional Testing)
- [ ] **Test API & Socket Real-time**:
  - Mở 2 tab trình duyệt, 1 tab tạo phòng mới, kiểm tra tab còn lại có nhận được `lobby:room-status-changed` và update số lượng bàn không.
  - Test nhận thưởng Free Chips (Claim Free Chips) để đảm bảo số dư cập nhật tức thì.
- [ ] **Test Quick Play**:
  - Chọn các cấu hình (Texas Hold'em, Micro/Low/Medium/High) và nhấn Quick Play.
  - Đảm bảo hệ thống bắt đúng bàn không bị đầy, không phải private, và đúng mức cược.
- [ ] **Test Filter & Search**:
  - Tìm kiếm phòng theo tên.
  - Lọc phòng theo trạng thái (Đang chờ, Đang chơi), ẩn phòng đầy, ẩn phòng Private.
- [ ] **Test Tạo bàn chơi (Create Room)**:
  - Tạo bàn Private có mật khẩu và không có mật khẩu. Đảm bảo form xử lý đúng.

### 🟡 Step 2: Tối ưu hoá UI/UX & Hiệu năng
- [ ] Đảm bảo các Widget (Leaderboard, Friends Playing, Recent Rooms) hiển thị loading state mượt mà.
- [ ] Kiểm tra responsive trên thiết bị di động (Bottom Navigation nếu có, hoặc các lưới Grid chuyển thành 1 cột).
- [ ] Rà soát lại bộ màu sắc, typography (font chữ) có bị lỗi hiển thị hay không (ví dụ font Serif cho tiêu đề có load đúng không).

### 🟢 Step 3: Dọn dẹp Code (Lint & Refactor)
- [ ] Chạy ESLint trên thư mục `FE/app/poker-game/` để dọn dẹp biến không sử dụng (`unused-vars`), import dư thừa.
- [ ] Xóa các log debug `console.log` trên production.

---

## 🚀 3. Cách thức thực hiện

Nếu bạn muốn bắt đầu chạy các bài kiểm tra hoặc cần fix các bug tồn đọng ở phần nào, hãy gõ lệnh:
- `/orchestrate` (Gọi chuyên gia FE và QA để kiểm tra và fix).
- Hoặc `/test` để thiết lập các bài test E2E / Unit cho các hook/API này.
