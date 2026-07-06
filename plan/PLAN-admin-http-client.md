# Kế hoạch cấu hình HTTP Client & Refactor API Calls cho Admin

## 1. Mục tiêu
Đồng bộ hóa việc gọi API của hệ thống Admin thông qua `FE/core/api/http-client.ts`. Hủy bỏ việc thiết lập header `Authorization` thủ công trong các component để mã nguồn trở nên gọn gàng, bảo mật và dễ bảo trì hơn theo nguyên tắc "DRY" (Don't Repeat Yourself).

## 2. Cấu hình `FE/core/api/http-client.ts`
Do Admin và User thường có 2 hệ thống token và trang login khác nhau (`admin_token` vs `accessToken`), `http-client` cần nhận diện context dựa trên URL của request.

- **Request Interceptor**:
  - Nhận diện request gọi lên nhánh Admin: `config.url?.includes('/api/v1/admin')`.
  - Nếu là Admin API, trích xuất `admin_token` từ Cookies hoặc LocalStorage và gán vào header `Authorization`.
  - Giữ nguyên luồng xử lý `accessToken` của hệ thống User đối với các API không thuộc Admin.

- **Response Interceptor (Bắt lỗi 401 Unauthorized)**:
  - Bổ sung `/api/v1/admin/login` vào mảng `NO_AUTH_ENDPOINTS`.
  - Nếu request của nhánh Admin gặp lỗi 401: Xóa thông tin `admin_token`, `admin_info` khỏi LocalStorage/Cookies và redirect thẳng ra trang `/backstage/login`. Không thực hiện logic `refresh-token` của User thường.

## 3. Refactor các trang Admin
Thay đổi import từ thư viện axios cũ/cục bộ (`@/lib/axios`) sang `httpClient` từ `@/core/api/http-client`. Loại bỏ truyền token thủ công.

1. **`FE/features/admin/components/AdminLoginForm.tsx`**:
   - Sử dụng `httpClient.post('/api/v1/admin/login', data)`

2. **`FE/app/(admin)/backstage/tables/page.tsx`**:
   - Thay vì: `api.get('/api/v1/admin/tables', { headers: ... })`
   - Chuyển thành: `httpClient.get('/api/v1/admin/tables')`
   - Tương tự cho hàm `handleClose`.

3. **`FE/app/(admin)/backstage/finance/page.tsx`**:
   - Thay đổi hàm `fetchTxns` -> `httpClient.get('/api/v1/admin/transactions')`.
   - Thay đổi hàm `handleProcess` -> `httpClient.post('/api/v1/admin/transactions/.../process')`.

4. **`FE/app/(admin)/backstage/users/page.tsx`**:
   - Thay đổi `fetchUsers` -> `httpClient.get('/api/v1/users')`. *(Chú ý endpoint này nếu dùng chung user, ta nên có tham số phân biệt hoặc chuẩn hóa lại path).*
   - Thay đổi `handleBan` -> `httpClient.post('/api/v1/users/.../ban')`.

5. **`FE/app/(admin)/backstage/dashboard/page.tsx`**:
   - Sẽ dùng `httpClient` tương tự nếu trang này có kết nối API thật. Hiện tại nếu đang dùng Fake Data thì sẽ bỏ qua.

---
Vui lòng phản hồi `Đồng ý` hoặc gọi lệnh `/create` nếu bạn muốn tôi bắt tay vào thực hiện các thay đổi mã nguồn này.
