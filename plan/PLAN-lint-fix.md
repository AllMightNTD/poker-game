# Strategic Implementation Plan: Fix Lint Errors

## 🎯 1. Goals
- Thực hiện chạy `npm run lint` trên toàn bộ dự án (cả Backend và Frontend) để xác định danh sách các lỗi.
- Xử lý triệt để tất cả các cảnh báo và lỗi lint (đặc biệt là `@typescript-eslint/no-unused-vars` và `@typescript-eslint/no-require-imports` ở Backend).
- Khôi phục lại cấu hình `.eslintrc.js` nghiêm ngặt nếu trước đó đã bị hạ chuẩn (hạ xuống `warn` hoặc `off`) để đảm bảo chất lượng code lâu dài.
- Đạt được chỉ tiêu **Zero Lint Errors** như chuẩn mực của Pre-Flight Check trước khi Release/Deploy.

> [!IMPORTANT]
> Quá trình sửa lỗi không được làm thay đổi logic hoạt động hiện hành của hệ thống. Nếu một biến không được sử dụng nhưng đóng vai trò như là placeholder (ví dụ trong destructuring hoặc arguments của interface), cần xử lý bằng cách đổi tên thành biến bắt đầu bằng dấu gạch dưới (VD: `_unusedVar`).

## 🔗 2. Dependency Chains
- **Backend (BE)**: Chạy `npm run lint` trên NestJS.
- **Frontend (FE)**: Chạy `npm run lint` trên NextJS.
- **Files**: Danh sách 15+ file ở BE hiện đang chứa 36+ vấn đề về khai báo biến không sử dụng (`seed.module.ts`, `tasks.service.ts`, `auth.service.ts`, `poker-action.processor.ts`, `poker-concurrency.spec.ts`...).

## 🛤️ 3. Phase-by-Phase Breakdown

### Phase 1: Khôi phục cấu hình và Quét (Reconnaissance)
- **Action 1.1**: (Nếu cần) Khôi phục file `BE/.eslintrc.js` về trạng thái ban đầu để bật lại Error cho `no-unused-vars`.
- **Action 1.2**: Chạy `npm run lint` trên cả thư mục `BE` và `FE` để trích xuất báo cáo lỗi chi tiết mới nhất.

### Phase 2: Surgical Fixes - Backend (Core & Services)
- **Action 2.1**: Dọn dẹp các biến không sử dụng (`@typescript-eslint/no-unused-vars`) ở các file Core/Services:
  - `tasks.service.ts`
  - `auth.service.ts`
  - `poker-action.processor.ts`
  - `poker-lobby.service.ts` (Sửa lỗi `require()` style import thành ES6 `import`).
  - Lược bỏ hoặc đánh dấu bằng gạch dưới (`_`).

### Phase 3: Surgical Fixes - Backend (Controllers, DTOs & Specs)
- **Action 3.1**: Dọn dẹp các module còn lại:
  - Các Controller (`admin-hands.controller.spec.ts`, `admin-tables.controller.ts`, `auth.controller.ts`).
  - Các file DTO (`refresh-token.dto.ts`, `update-profile.dto.ts`).
  - Các file Unit Test Spec (`poker-concurrency.spec.ts`, `poker-features-integration.spec.ts`, v.v.).

### Phase 4: Frontend Linting (Giao diện)
- **Action 4.1**: Sửa các lỗi Lint trên Frontend (nếu có sau khi chạy). Mặc dù FE có vẻ khá sạch, vẫn cần audit lại.

## 🛡️ 4. Verification Plan (Automated + Manual)

### Checklist:
- [ ] Chạy lệnh `npm run lint` trong `BE` trả về exit code 0 (không còn Error/Warning).
- [ ] Chạy lệnh `npm run lint` trong `FE` trả về exit code 0 (không còn Error/Warning).
- [ ] Xác minh nhanh (Smoke Test) bằng lệnh `npm test` bên BE để đảm bảo không xóa nhầm logic khiến fail test.
- [ ] Xác minh lệnh `npm run build` ở BE thành công mà không bị crash.

---

**Ready for Execution**.
Sử dụng `/orchestrate` để giao phó cho `@backend-specialist` và `@quality-inspector` tiến hành dọn dẹp hàng loạt và sửa lỗi.
