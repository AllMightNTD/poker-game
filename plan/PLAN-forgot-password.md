# Kế hoạch triển khai: Chức năng Quên mật khẩu (Forgot Password)

Tài liệu này phác thảo chi tiết kế hoạch thiết kế, phát triển và tích hợp chức năng Quên mật khẩu (Forgot Password) cho cả Backend (NestJS) và Frontend (Next.js), đảm bảo các tiêu chuẩn bảo mật cao (OWASP) và trải nghiệm người dùng cao cấp (VIP Poker Theme).

---

## 🎯 1. Mục tiêu & Luồng nghiệp vụ
1. **Gửi yêu cầu khôi phục**: Người dùng nhập email tại trang `/forgot-password` của Frontend.
2. **Kiểm tra Rate Limit (Cooldown)**: Giới hạn tần suất yêu cầu tối đa 1 lần mỗi 60 giây để tránh spam mail.
3. **Bảo mật thông tin (OWASP - Email Enumeration Prevention)**: Dù email có tồn tại hay không, hệ thống vẫn trả về thông báo thành công chung để ngăn chặn việc dò quét tài khoản.
4. **Tạo Token & Lưu Redis**: Tạo một token ngẫu nhiên, lưu vào Redis với TTL là 15 phút. Không lưu token vào DB để tránh rác dữ liệu và tăng tốc độ xử lý.
5. **Gửi Email VIP Poker**: Gửi email chứa link đặt lại mật khẩu với giao diện VIP đỏ - vàng - đen đồng bộ với sảnh game.
6. **Đặt lại mật khẩu**: Người dùng nhấp vào link dạng `${webUrl}/reset-password/${token}` trên Frontend, nhập mật khẩu mới và xác nhận.
7. **Đơn sử dụng & Thu hồi phiên cũ (Single-use & Invalidation)**:
   - Token chỉ được sử dụng đúng 1 lần (xóa ngay sau khi đổi thành công).
   - Khi đổi mật khẩu thành công, toàn bộ Refresh Token cũ của user sẽ bị hủy để buộc đăng xuất khỏi tất cả các thiết bị đang hoạt động.

---

## 🔗 2. Các tệp tin ảnh hưởng (Affected Files)

### Backend (NestJS)
- `BE/src/v1/auth/services/auth/auth.service.ts`: Triển khai logic nghiệp vụ gửi link và đặt lại mật khẩu.
- `BE/src/mail/templates/reset-password.hbs`: Cập nhật giao diện email theo phong cách sảnh đấu Poker thượng lưu.

### Frontend (Next.js)
- `FE/features/auth/services/auth.service.ts`: Bổ sung API client `resetPassword`.
- `FE/app/(auth)/reset-password/[token]/page.tsx`: Cập nhật API endpoint chính xác và tích hợp thông qua `AuthService`.

---

## 📋 3. Lộ trình triển khai (Phase-by-Phase Breakdown)

### 🟢 Phase 1: Backend - Logic Forgot Password & Redis Storage
1. **Kiểm tra Cooldown (Rate Limiting)**:
   - Sử dụng Redis key: `reset:cooldown:${email}` có TTL = 60s.
   - Nếu tồn tại key này, ném lỗi `BadRequestException('Vui lòng đợi 60 giây trước khi yêu cầu liên kết mới.')`.
2. **Tìm kiếm người dùng**:
   - Truy vấn người dùng bằng `email`.
   - Nếu không tồn tại: Ghi log cảnh báo nhưng **vẫn trả về kết quả thành công** (không gửi email) để tránh lộ email đã đăng ký.
3. **Tạo và Lưu Token**:
   - Sử dụng `crypto.randomBytes(32).toString('hex')` để tạo token ngẫu nhiên cực kỳ an toàn.
   - Lưu trữ thông tin trên Redis:
     - Key: `reset:token:${token}`
     - Value: `{ email: user.email, userId: user.id }`
     - TTL: 900 giây (15 phút).
   - Đặt cooldown: Set key `reset:cooldown:${email}` với giá trị `"1"` và EX = 60s.
4. **Queue Email**:
   - Gọi `this.mailService.enqueueResetPasswordMail(...)` với các tham số: `email`, `resetToken`, `resetExpire` (15 phút kể từ hiện tại), `name` (tên người dùng).

### 🔴 Phase 2: Backend - Cập nhật Giao diện Email `reset-password.hbs`
- Thiết kế lại tệp `BE/src/mail/templates/reset-password.hbs` sang giao diện sảnh đấu thượng lưu giống `register.hbs`:
  - Tone màu chủ đạo: Đỏ gradient (`#d93838` - `#8b0000`), Vàng Gold (`#ffd700`) và Đen Navy (`#0b0c16`).
  - Thêm badge `♠️ CG POKER CLASSIC ♦️`.
  - Thay đổi nút bấm sang dạng VIP button được đổ bóng 3D bóng bẩy.

### 🟡 Phase 3: Backend - Logic Reset Password & Thu hồi phiên đăng nhập
1. **Xác thực dữ liệu**:
   - DTO `ResetPasswordDto` đã có sẵn cơ chế bắt buộc nhập `token` và mật khẩu dài tối thiểu 6 ký tự.
2. **Kiểm tra Token trên Redis**:
   - Lấy dữ liệu từ Redis key `reset:token:${token}`.
   - Nếu không tồn tại (hết hạn hoặc token giả mạo), ném lỗi `BadRequestException('Liên kết đặt lại mật khẩu đã hết hạn hoặc không hợp lệ.')`.
3. **Cập nhật Mật khẩu & Thu hồi Session**:
   - Tìm kiếm người dùng bằng `userId` từ dữ liệu Redis.
   - Hash mật khẩu mới bằng `bcrypt.hash(password, 10)`.
   - Cập nhật cột `password` của người dùng trong DB.
   - Thu hồi toàn bộ Refresh Token của user trong database:
     `await this.refreshTokenRepository.update({ user_id: user.id, revoked_at: null }, { revoked_at: new Date() })`
4. **Dọn dẹp Redis**:
   - Xóa ngay key `reset:token:${token}` để ngăn chặn việc sử dụng lại token cũ.

### 🔵 Phase 4: Frontend - Tích hợp và Đồng bộ API
1. **Cập nhật `AuthService` Frontend**:
   - Bổ sung hàm `resetPassword(data: { token: string; password: string })` gửi request `POST /api/v1/auth/reset-password`.
2. **Cập nhật trang `reset-password/[token]/page.tsx`**:
   - Sửa URL gọi API trực tiếp từ `/api/v1/user/auth/reset-password` sang dùng `AuthService.resetPassword`.
   - Cập nhật thông báo thành công và quản lý trạng thái tải trang mượt mà.

---

## 🧪 4. Kế hoạch Kiểm thử & Nghiệm thu (Verification Plan)

### Kiểm thử tự động (Unit Tests)
- Viết/cập nhật test cases trong `auth.service.spec.ts` cho các trường hợp:
  - Gửi yêu cầu thành công (gửi mail).
  - Gửi yêu cầu bị chặn do Cooldown < 60s.
  - Reset mật khẩu thành công bằng token hợp lệ.
  - Reset mật khẩu thất bại bằng token đã hết hạn hoặc sai.

### Kiểm thử thủ công (Manual Verification)
1. Truy cập `/forgot-password`, gửi yêu cầu -> Kiểm tra xem email nhận được có đúng link dạng VIP hay không.
2. Bấm gửi liên tiếp -> Kiểm tra xem hệ thống có chặn cooldown 60s và hiển thị thông báo lỗi thân thiện không.
3. Nhấp vào liên kết đổi mật khẩu từ hòm thư -> Đổi mật khẩu mới.
4. Thử đăng nhập bằng mật khẩu cũ -> Kiểm tra xem có bị từ chối không.
5. Đăng nhập bằng mật khẩu mới -> Đăng nhập thành công và được điều hướng vào sảnh game.
6. Thử nhấp lại liên kết đổi mật khẩu lần 2 -> Hệ thống phải báo link đã hết hạn hoặc không hợp lệ.
