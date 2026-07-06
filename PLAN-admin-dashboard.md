# PLAN-admin-dashboard

## 🟢 PHASE 1: Tổng quan và Phạm vi (Scope)
Mục tiêu: Xây dựng hệ thống Admin Dashboard cho Poker Game theo kiến trúc Next.js (Frontend) và NestJS (Backend), tích hợp đầy đủ 31 module quản trị theo yêu cầu thiết kế gốc.

Phạm vi:
- Xây dựng hệ thống Đăng nhập Quản trị (Admin Login) và luồng xác thực (Authentication) tách biệt hoàn toàn khỏi hệ thống User thông thường.
- Thiết lập hệ thống phân quyền (RBAC) chi tiết tới từng hành động.
- Xây dựng tất cả các luồng quản lý người chơi, tài chính, vận hành game, bảo mật và phân tích dữ liệu.
- Đảm bảo tính minh bạch thông qua Audit Log và giám sát hệ thống nghiêm ngặt.

---

## 🟡 PHASE 2: Các bước thực thi chiến lược (Blueprint)

### Giai đoạn 1: Foundation, Security & Monitoring (Hạ tầng, Bảo mật & Giám sát)
*Tập trung xây dựng bộ khung vững chắc, luồng đăng nhập quản trị độc lập, phân quyền bảo mật và các công cụ giám sát hệ thống.*
1. **Admin Authentication & Portal Setup (FE/BE)**: 
   - **Hệ thống Login riêng biệt**: Xây dựng luồng Auth tách biệt (Backend tạo bảng `Admins` riêng hoặc định danh Role cứng `ADMIN` với JWT cấu hình bảo mật cao hơn).
   - **Trang Login Admin (FE)**: Giao diện đăng nhập dành riêng cho Admin (VD: `/backstage/login`), ẩn hoàn toàn khỏi người chơi. Yêu cầu bắt buộc 2FA khi đăng nhập.
   - **Portal Architecture**: Setup Layout Next.js, Sidebar theo kiến trúc Menu gợi ý. Xây dựng module Admin Profile (Avatar, Đổi pass, Lịch sử đăng nhập, Session).
2. **Role & Permission (RBAC) (Module 19)**: Phân quyền nội bộ Admin (Super Admin, Admin, GM, Moderator, Finance, Support, Developer) với chi tiết từng permission (View, Edit, Delete, Ban...).
3. **Audit Log & Security (Module 18, 25)**: Hệ thống ghi log không thể xóa mọi hành động C/U/D của Admin (Old/New Value, IP, Time, Device). Quản lý Whitelist/Blacklist IP, API Key, Session.
4. **System & API Monitoring (Module 20, 21, 26, 27)**: Giám sát CPU/RAM, Redis, Database, Socket, API (Response Time, Status Code). Theo dõi BullMQ Queue và tổng hợp Error Log (Exception, Stack trace).

### Giai đoạn 2: User & Finance Management (Quản lý Khách hàng & Dòng tiền)
*Quản lý vòng đời tài khoản người chơi và luồng tiền tệ.*
5. **User & Session Management (Module 2, 8)**: Quản lý danh sách người dùng (VIP, Số dư, Lịch sử, Game Stats). Theo dõi Player Session realtime (Ping, Bàn đang ngồi) & tính năng Ban, Mute, Kick, Disconnect.
6. **Wallet Management (Module 3)**: Quản lý tổng tài sản, tính năng Add/Remove/Freeze Coin & Diamond. Truy xuất lịch sử giao dịch.
7. **Deposit & Withdraw (Module 4, 5)**: Flow duyệt giao dịch nạp/rút (Pending, Approve, Reject, Manual Verify, Upload chứng từ, OTP).
8. **VIP System (Module 12)**: Quản lý Level, Requirement, Benefit, Cashback, Reward cho VIP.

### Giai đoạn 3: Game Operations & Integrity (Vận hành Game & Chống gian lận)
*Can thiệp sâu vào luồng Poker, giám sát bàn chơi và cấu hình.*
9. **Poker Table & Hand History (Module 6, 7)**: Danh sách bàn realtime, Open/Close/Pause bàn. Replay ván bài (Hand History) với Action Timeline & Export JSON.
10. **Game Config & Rake (Module 22, 10)**: Cấu hình Game (Blind, Buy In, Timeout, Auto Fold) và Rake (Cash Game, Tournament, VIP Discount, Cap).
11. **Anti Cheat (Module 17)**: Detect gian lận cực kỳ quan trọng (Collusion, Chip Dumping, Bot, Multi-Account, VPN/Proxy). Chấm điểm Risk Score và Flag User.
12. **Tournament & Bots (Module 9, 23)**: CRUD Giải đấu (Prize, Registration, Blind Structure). Quản lý Bot (Strategy, Buy In, Difficulty).

### Giai đoạn 4: Community, Marketing & Analytics (Cộng đồng, Marketing & Phân tích)
*Công cụ phát triển cộng đồng, chiến dịch khuyến mãi và phân tích dữ liệu tổng quan.*
13. **Chat & Notification (Module 13, 14)**: Quản lý Public/Private Chat. Push Notification, Ingame Mail, Maintenance Notice, Popup.
14. **Promotion & CMS (Module 11, 15)**: Quản lý Giftcode, Vòng quay, Nhiệm vụ ngày. CMS quản lý Banner, News, FAQ, Terms.
15. **Support & Analytics (Module 24, 28, 16)**: Hệ thống Support Ticket (Reply, Assign staff, Upload file). Analytics & Report (Doanh thu, DAU/MAU, Retention, LTV, Churn, Top Winner/Loser).
16. **Dashboard (Module 1)**: Xây dựng màn hình Dashboard tổng hợp Realtime số liệu và biểu đồ (Chart, Heatmap) từ các phân hệ trên. (Thực hiện cuối cùng khi đã có đủ luồng data).
17. **Scheduler & Backup (Module 29, 30)**: Cấu hình Cron Job (Reset Daily/Weekly) và quản lý Backup/Restore Database/Redis.

> [!IMPORTANT]
> **Điểm ngắt hệ thống**: Giai đoạn 1 (Foundation) và Giai đoạn 3 (Anti Cheat & Hand History) là xương sống. Module Anti Cheat cần phân tích log game rất nặng, phải tối ưu Worker (VD: GlueCleanUpWorker hiện tại) để không ảnh hưởng luồng chơi chính.

> [!WARNING]
> **Rủi ro Hiệu năng Báo cáo**: Module 1 (Dashboard), Module 16 (Report), Module 28 (Analytics) yêu cầu query aggregation liên tục. Khuyến nghị setup Database phụ (Replicas) chuyên dụng cho Log/Analytics, tránh query trực tiếp trên Database đang chạy game (RDS chính).

---

## 🔵 PHASE 3: Phân công (Surgical Distribution)
- **`orchestrator`**: Điều phối chiến trúc, quyết định Database topology cho hệ thống Log & Report.
- **`backend-specialist`**: Xây dựng Core Framework, RBAC, Data Pipeline cho Anti-Cheat, và toàn bộ API Admin.
- **`frontend-specialist`**: Xây dựng UI Dashboard, Data Grid, Replay Viewer cho Hand History, và cấu trúc State Management phức tạp.
- **`quality-inspector`**: Test thâm nhập quyền hạn (Pentest), Audit log integrity (Thử xóa log/bypass), Performance Test (Load test các chart Dashboard).

---

## 🔴 PHASE 4: Kiểm thử (Verification Plan)
- **RBAC & Security**: Đăng nhập sai quyền bị chặn (HTTP 403). Mọi Endpoint đều được check IP Whitelist và Ghi Log bắt buộc.
- **Realtime Dashboard**: Mở 2 trình duyệt, thay đổi data ở game server, Dashboard phải tự động update qua WebSocket.
- **Hand History Replayer**: UI Replayer tái hiện lại chính xác luồng diễn ra của ván bài, khớp với từng step time.
- **Anti-Cheat**: Giả lập các giao dịch Chip Dumping trên server test -> Hệ thống phải auto detect và đẩy alert về Admin Portal trong < 5 phút.
