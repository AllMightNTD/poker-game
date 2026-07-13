# Strategic Implementation Plan: Nâng cấp Bảo mật Toàn diện cho Backend (Advanced Security)

> **DNA_REF**: Tuân thủ Rule Security (`SECURITY.MD`) - Áp dụng mô hình Defense-in-Depth (Phòng thủ theo chiều sâu) dựa trên chuẩn OWASP Top 10.

## 1. Clear Goals (Mục tiêu)
- Xây dựng một hệ thống BE kiên cố, chịu tải tốt trước các cuộc tấn công tinh vi.
- Bổ sung các tầng bảo mật mà hệ thống hiện tại chưa có (hiện tại đã có Helmet, CORS, JWT, Rate Limiting cơ bản).
- Đảm bảo an toàn cho giao thức WebSockets (đặc biệt quan trọng đối với Poker Game).
- Xử lý triệt để các rủi ro về XSS, Brute-force nâng cao và quản lý phiên đăng nhập.

## 2. Dependency Chains (Dependencies cần thiết)
- `xss` hoặc `sanitize-html`: Để làm sạch (sanitize) đầu vào, chống XSS.
- `@nestjs/throttler` (Đã có, mở rộng cho WebSockets).
- `redis`: Hỗ trợ lưu trữ trạng thái khóa tài khoản (Account Lockout) và Audit Logs.

## 3. Phase-by-Phase Breakdown (Phân tách các bước)

### Phase 1: Authentication & Identity Hardening (Củng cố Xác thực)
- **Cơ chế Account Lockout**: Theo dõi số lần đăng nhập sai của user trong Redis. Ví dụ: Nếu user đăng nhập sai 5 lần liên tiếp -> Khóa tài khoản trong 15 phút.
- **Device & IP Tracking**: Ghi nhận thông tin thiết bị và IP đăng nhập. Phát hiện và cảnh báo nếu có "Đăng nhập từ thiết bị lạ".
- **Kích hoạt 2FA (Tùy chọn)**: Hỗ trợ TOTP (Google Authenticator) cho các tài khoản có số dư lớn hoặc admin.

### Phase 2: WebSocket Security (Bảo vệ luồng Game Realtime)
- **Xác thực trước khi kết nối (Handshake Auth)**: Bắt buộc client gửi token hợp lệ ngay khi khởi tạo Socket. Nếu không hợp lệ -> ngắt kết nối ngay lập tức để tiết kiệm tài nguyên.
- **WebSocket Rate Limiting**: Triển khai `WsThrottlerGuard` để giới hạn số lượng message/s của mỗi user (ví dụ: cấm spam button `Call`, `Raise` liên tục).

### Phase 3: Anti-XSS & Input Sanitization (Lọc dữ liệu rác/độc hại)
- **Tạo Global Sanitization Pipe / Interceptor**: Tự động duyệt qua body của request, quét các trường kiểu `string` và loại bỏ các thẻ script/html độc hại trước khi đưa vào Controller.
- **Data Validation Guardrails**: Đảm bảo toàn bộ DTO đều có `@IsString()`, `@MaxLength()`, `@IsNumber()` chặt chẽ, không để trường `any`.

### Phase 4: Data Protection & Audit Logging (Bảo vệ Dữ liệu & Theo dõi)
- **Audit Logs**: Ghi log mọi hành động nhạy cảm (Đổi mật khẩu, Chuyển tiền, Nạp/Rút chip) vào một bảng `AuditLogs` riêng hoặc đưa xuống Elasticsearch/Kibana.
- **Mã hóa dữ liệu nhạy cảm**: Số điện thoại, CCCD (nếu có) phải được mã hóa (AES-256) trước khi lưu xuống Database. Cấm lưu Plaintext.

## 4. Verification Plan (Kế hoạch nghiệm thu)

### Automated Testing (E2E & Unit)
- [ ] Giả lập 6 lần đăng nhập sai -> Assert nhận được thông báo "Tài khoản bị tạm khóa 15 phút".
- [ ] Gửi request có chứa payload mã độc `<script>alert(1)</script>` -> Assert chuỗi đã bị sanitize (làm sạch) thành dạng an toàn.
- [ ] Kết nối WebSocket mà không có token -> Assert kết nối bị force close.
- [ ] Gửi message WebSocket liên tục (spam) -> Assert nhận cảnh báo Rate Limit qua socket event.

### Manual Testing
- [ ] Login từ 2 IP/Thiết bị khác nhau để kiểm tra hệ thống tracking.
- [ ] Review lại các Query TypeORM để đảm bảo không có truy vấn nào dạng raw concat chuỗi dễ bị SQL Injection.

---
> [!IMPORTANT]
> **Risk Assessment**: Các tầng bảo mật bổ sung (nhất là Pipe Sanitization và Logging) sẽ cộng thêm độ trễ (latency) vào hệ thống (thường khoảng 2-5ms). Cần theo dõi sát sao hiệu năng sau khi triển khai.
