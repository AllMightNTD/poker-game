# Kế hoạch xây dựng API Audit Logs (Nhật ký hoạt động)

## 1. Mục tiêu
Xây dựng API Backend tương ứng với giao diện `AdminAuditLogsPage` tại `FE/app/(admin)/backstage/audit/page.tsx` nhằm truy xuất toàn bộ lịch sử thao tác của các Admin trên hệ thống. 

## 2. Chi tiết kỹ thuật

### A. Tầng Service (`BE/src/v1/admin/services/admin-audit-logs.service.ts`)
Tạo mới Service `AdminAuditLogsService`:
- **Inject**: Repository `AdminAuditLog` (từ `BE/src/v1/entities/admin_audit_log.entity.ts`).
- **Function `getAuditLogs(limit: number = 1000)`**:
  - Truy vấn lấy danh sách các bản ghi từ bảng `admin_audit_logs`.
  - Sắp xếp theo `created_at` DESC (mới nhất lên đầu).
  - Trả về cấu trúc `{ data: AdminAuditLog[] }`.
  - *(Lưu ý: UI hiện tại đang áp dụng Client-side search & filtering, do đó backend tạm thời sẽ trả về tối đa 1000 bản ghi gần nhất để tránh overload, sau này nếu cần có thể nâng cấp thêm query param cho Server-side pagination).*

### B. Tầng Controller (`BE/src/v1/admin/controllers/admin-audit-logs.controller.ts`)
Tạo mới Controller `AdminAuditLogsController`:
- **Endpoint**: `@Controller('admin/audit-logs')`
- **Bảo mật**: 
  - `@UseGuards(AdminGuard)`
  - `@ApiBearerAuth()`
  - `@AdminRoles('SUPER_ADMIN', 'ADMIN')` (Chỉ những vai trò cấp cao mới được phép xem nhật ký hoạt động).
- **Method**: `@Get()`
  - Gọi xuống `AdminAuditLogsService.getAuditLogs()`.

### C. Đăng ký Module (`BE/src/v1/admin/admin.module.ts`)
- Thêm `AdminAuditLog` vào mảng `TypeOrmModule.forFeature([...])` (nếu chưa có).
- Khai báo `AdminAuditLogsController` vào mảng `controllers`.
- Khai báo `AdminAuditLogsService` vào mảng `providers`.

## 3. Các bước thực thi (Quy trình /create)
1. Tạo tệp `admin-audit-logs.service.ts`.
2. Tạo tệp `admin-audit-logs.controller.ts`.
3. Cập nhật tệp `admin.module.ts`.

---
Nếu bạn đồng ý với kế hoạch này, vui lòng gõ **`/create`** hoặc trả lời "Đồng ý" để tôi tiến hành viết code ngay lập tức!
