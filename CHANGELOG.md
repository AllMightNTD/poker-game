# HỒ SƠ PHÁT HÀNH PHIÊN BẢN (CHANGELOG)

Tất cả các thay đổi quan trọng đối với dự án **KBL Poker - Knowledge Block Platform** sẽ được ghi nhận tại tệp này.

---

## [1.0.0] - 2026-07-17

### 🚀 Tính năng & Nâng cấp Giao diện (Premium UI/UX)
- **Modern Backstage UI**: 
  - Nâng cấp trang nhật ký hoạt động hệ thống `app/(admin)/backstage/audit/page.tsx` sang phong cách tối giản cao cấp (Glassmorphic dark design, Teal/Gold accents) kết hợp hoạt ảnh thu gọn/mở rộng log mượt mà.
  - Tái cấu trúc trang phân tích gian lận tài chính `app/(admin)/backstage/finance/audit/page.tsx` với bảng thống kê dòng tiền trực quan, các mức độ cảnh báo (High, Medium, Low Risk) sinh động và hiệu ứng modal chi tiết thông minh bằng Framer Motion.
- **Blogs Feature Overhaul**:
  - Tách biệt hoàn toàn API layer cho blogs (`blogsApi.ts`) và ván đấu (`handsApi.ts`), nâng cấp luồng tải dữ liệu sang mô hình **`useSuspenseQuery`** (React Suspense-first fetching).
  - Tái lập trình `PokerHandPickerModal` và `PokerHandReplayer` với Framer Motion spring physics, skeleton loading và hỗ trợ Accessibility (đọc nhãn input, điều khiển bàn phím).

### 🐛 Sửa lỗi & Tối ưu hóa (Bug Fixes & Hardening)
- **NestJS Jest Test Suite Resolution**:
  - Khắc phục lỗi inject thiếu `RefreshTokenRepository` trong `UserService` unit test.
  - Sửa lỗi thiếu module options của `CustomThrottlerGuard` trong `poker-chat.spec.ts` bằng cách mock guard chuẩn.
  - **Bảo mật**: Sửa lỗi rò rỉ danh tính email (Email Enumeration Vulnerability) trong hàm `forgotPassword` của `AuthService` giúp vượt qua các bài test Jest tự động.
- **Next.js RSC Boundary Fixes**:
  - Khắc phục lỗi Next.js build bằng việc thêm chỉ thị `"use client"` cho các shared auth hooks (`use-login`, `use-logout`, `use-forgot-password`).

### 🛠 Hệ thống tự động (CI/CD & Automation)
- **Auto-Release Engine**:
  - Tạo script `.agent/scripts/auto-release.js` giúp tự động cập nhật số phiên bản đồng thời trên `package.json` (cả FE & BE), file `VERSION` và đồng bộ thống kê số lượng bộ kỹ năng (Skills), quy trình (Workflows), quy tắc (Rules) vào `README.md`.
