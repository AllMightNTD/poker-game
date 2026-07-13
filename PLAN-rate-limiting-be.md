# Strategic Implementation Plan: Áp dụng Rate Limiting cho Backend

> **DNA_REF**: Tuân thủ Rule Security (SECURITY.MD) - Bảo vệ API, chống abuse & DDoS.

## 1. Clear Goals (Mục tiêu)
- Bảo vệ các API endpoint khỏi các cuộc tấn công Brute Force, DoS/DDoS.
- Giới hạn tần suất request của người dùng (Rate Limiting) trên toàn bộ hệ thống (Global) và cấu hình cụ thể cho các endpoint nhạy cảm (như Auth: Login, Register, Forgot Password).
- Sử dụng Redis làm Storage cho Rate Limiter nhằm đảm bảo tính nhất quán (Consistency) trong môi trường phân tán (Distributed / Multi-instance) do dự án đang dùng BullMQ/Redis.

## 2. Dependency Chains (Dependencies cần thiết)
Để triển khai Rate Limiting chuẩn NestJS, chúng ta cần bổ sung:
- `@nestjs/throttler`: Module chuẩn của NestJS cho Rate Limiting.
- `throttler-storage-redis`: Bộ lưu trữ (Storage Provider) kết nối Throttler với Redis để hỗ trợ phân tán.

> [!WARNING]
> Kiểm tra lại phiên bản của `@nestjs/throttler` (hiện tại NestJS v10) để tránh xung đột dependency. Cần cài đặt bản 5.x hoặc 6.x tương thích.

## 3. Phase-by-Phase Breakdown (Phân tách các bước)

### Phase 1: Cài đặt Dependencies
- Chạy lệnh cài đặt `npm install @nestjs/throttler throttler-storage-redis` trong thư mục `BE/`.

### Phase 2: Cấu hình `ThrottlerModule` Global (Core Setup)
- Tích hợp `ThrottlerModule.forRootAsync()` vào `AppModule` (hoặc module cấu hình lõi).
- Khởi tạo kết nối đến Redis thông qua `throttler-storage-redis` bằng cách sử dụng chung `RedisConfig` hiện có của hệ thống.
- Định nghĩa cấu hình mặc định (ví dụ: `ttl: 60000` (1 phút), `limit: 100` request cho Global).

> [!IMPORTANT]
> Cần đảm bảo cấu hình Redis URI (hoặc Host/Port) được load chính xác từ `ConfigService` để tránh hardcode (Tuân thủ SECURITY.MD).

### Phase 3: Triển khai Global Guard & Tùy biến Filter
- Bind `ThrottlerGuard` ở mức Global thông qua providers trong `AppModule` (`{ provide: APP_GUARD, useClass: ThrottlerGuard }`).
- Tuỳ chỉnh thông báo lỗi (Exception) trả về cho người dùng (HTTP 429 Too Many Requests) thông qua Custom Guard hoặc bổ sung logic xử lý vào `GlobalExceptionFilter` hiện tại (`http.exception.filter.ts`) để đồng bộ format response API.

### Phase 4: Thiết lập Rule cụ thể cho các Endpoint nhạy cảm (Custom Rate Limits)
- Ghi đè (Override) cấu hình mặc định cho các controller/route nhạy cảm bằng decorator `@Throttle()`:
  - `AuthController`: Limit gắt gao hơn cho `/login`, `/register`, `/forgot-password` (ví dụ: 5 requests / 1 phút).
  - WebSockets (nếu có): Throttling cho Socket.io events (ví dụ `PokerLobbyGateway`), yêu cầu custom `WsthrottlerGuard` để áp dụng Rate Limiting cho giao thức ws://.

## 4. Verification Plan (Kế hoạch nghiệm thu)

### Automated Testing:
- [ ] Bổ sung Unit/E2E test: Gửi vượt mức số lượng request cho phép trong thời gian ngắn tới một endpoint (VD: `/auth/login`).
- [ ] Assert status code trả về là `429 Too Many Requests`.
- [ ] Assert response message báo lỗi vượt quá giới hạn.

### Manual Testing:
- [ ] Khởi động BE Server.
- [ ] Dùng công cụ load testing nhẹ (Apache Benchmark `ab`, Postman Runner, hoặc `curl` trong vòng lặp) spam 1 endpoint public.
- [ ] Kiểm tra Redis keys xem hệ thống có tạo key lưu trữ biến đếm (counter) cho Rate Limiting hay không (`redis-cli keys "throttler:*"`).
- [ ] Đợi qua thời gian TTL và gửi request lại để đảm bảo đã được reset giới hạn thành công.
