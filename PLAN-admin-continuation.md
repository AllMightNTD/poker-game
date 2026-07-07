# PLAN-admin-continuation

## 🟢 PHASE 1: Tổng quan và Khám phá (Discovery)
Dựa trên những phân tích về các tác vụ đã thực hiện ngày hôm qua (06/07/2026), chúng ta đã hoàn thành xuất sắc các hạng mục nền tảng:
1. **Dọn dẹp & Tối ưu Hệ thống**: Gỡ bỏ hoàn toàn kiến trúc Đa ngôn ngữ (i18n) trên FE và BE, sửa các lỗi build Next.js (chuyển middleware thành `proxy.ts`, xóa layout thừa). Khắc phục toàn bộ lỗi TypeScript `any` trong UI Poker Game.
2. **Hạ tầng Admin (Giai đoạn 1 & 2)**: 
   - Lập kế hoạch `PLAN-admin-dashboard.md`.
   - Đã xây dựng Database Entities (`admins`, `admin_audit_logs`) với Index tối ưu.
   - Hoàn thành luồng xác thực độc lập (Admin Login) với JWT, RBAC Guard, Interceptor Audit Log.
3. **Hạ tầng Cursor Pagination**: Nâng cấp các API quản lý như Users và Wallets (backend) sử dụng cơ chế Cursor-based Pagination hiệu năng cao thay vì Offset cũ.

**Mục tiêu tiếp theo**: Chuyển trọng tâm sang việc hoàn thiện Giao diện Quản trị (Frontend Admin Portal) và tiếp tục xây dựng các API cốt lõi còn lại của Giai đoạn 2 và 3.

---

## 🟡 PHASE 2: Các bước thực thi chiến lược (Blueprint)

### Giai đoạn 2.1: Xây dựng Admin Layout & Frontend Infrastructure
1. **Admin Portal Setup**: Xây dựng layout chính cho Admin tại `FE/app/(admin)/backstage/layout.tsx`. Bao gồm:
   - Sidebar đa cấp dựa trên các Module của `PLAN-admin-dashboard.md`.
   - Header (Profile, Breadcrumb, Dark mode toggle).
2. **Cursor Pagination UI Integration**: Xây dựng các Reusable Component cho Data Table hỗ trợ Cursor Pagination (Nút "Load More" hoặc Infinite Scroll).
3. **State Management**: Cấu hình React Query / Zustand để đồng bộ dữ liệu mượt mà giữa các trang.

### Giai đoạn 2.2: Hoàn thiện UI Quản lý Khách hàng & Dòng tiền
4. **User Management UI**: Trang danh sách người dùng, tích hợp API tìm kiếm và Cursor Pagination. Xây dựng Modal View chi tiết người dùng và chức năng Ban/Mute.
5. **Wallet & Finance UI**: Giao diện hiển thị biến động số dư, chức năng Admin bơm/trừ tiền trực tiếp cho User.
6. **Deposit/Withdraw APIs**: Phát triển tiếp các Backend API phục vụ duyệt nạp/rút tiền (Pending, Approve, Reject).

### Giai đoạn 2.3: Dashboard Analytics (Core UI)
7. **Realtime Dashboard**: 
   - Xây dựng layout cho các thẻ thống kê tổng quan (Online Players, Total Pot, Server Status).
   - Chuẩn bị placeholder hoặc tích hợp thư viện Chart (như Recharts) cho biểu đồ Doanh thu và Traffic.

> [!IMPORTANT]
> **Cursor Pagination Strictness**: Bắt buộc tuân thủ chuẩn Cursor Payload (`next_cursor`, `has_next_page`) trên FE khi gọi API để tránh reload sai trang.

> [!WARNING]
> **Client-side Fetching**: Đối với Dashboard, tránh fetch toàn bộ data tĩnh ở SSR quá nặng, ưu tiên Client-side fetching kết hợp WebSocket để lấy Realtime stats.

---

## 🔵 PHASE 3: Phân công (Surgical Distribution)
- **`frontend-specialist`**: Triển khai Layout Backstage, Sidebar, Data Table Cursor Pagination, kết nối các API đã hoàn thiện hôm qua.
- **`backend-specialist`**: Tiếp tục triển khai Deposit/Withdraw và Ticket Support API.
- **`orchestrator`**: Giám sát cấu trúc Component để đảm bảo tính Reusable cho các module phía sau (Game Config, Anti-Cheat).

---

## 🔴 PHASE 4: Kiểm thử (Verification Plan)
1. Truy cập `/backstage` với tài khoản Admin hợp lệ -> Sidebar và Header render chuẩn Layout.
2. Trang danh sách User cuộn xuống hoặc click "Load More" -> Fetch data bằng `cursor` chứ không dùng `page`.
3. Bất kỳ tác vụ nào (như Ban User từ UI) đều phải được ghi nhận vào bảng `admin_audit_logs`.
