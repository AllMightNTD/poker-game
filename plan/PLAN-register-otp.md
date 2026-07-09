# Kế hoạch triển khai Xác thực Đăng ký bằng mã OTP qua Email (Bản cập nhật Bảo mật & UX)

Tài liệu này chi tiết hóa kế hoạch xây dựng tính năng gửi OTP xác thực khi đăng ký tài khoản người chơi mới. Kế hoạch này đã tích hợp các cơ chế bảo mật nguyên tử (atomic), chống spam rate limit, bảo vệ liên kết token-OTP chặt chẽ và tối ưu hóa trải nghiệm 1-click kích hoạt.

---

## 🎯 1. Mục tiêu & Các Điểm Cải Tiến Bảo Mật (Goals & Security Enhancements)
1.  **Đăng ký không hoạt động**: Khi đăng ký qua `POST /register`, tài khoản lưu ở trạng thái `status: 'INACTIVE'`.
2.  **Thiết kế Email cao cấp (CG Poker Style)**: Thiết kế giao diện email tối sang trọng (Dark gradient, vàng gold, đỏ casino) với OTP hiển thị nổi bật và nút bấm kích hoạt nhanh.
3.  **Bảo vệ Chống Brute-force / Race Condition**:
    - Không sử dụng cơ chế đọc-ghi tuần tự để đếm số lần nhập sai.
    - Lưu số lần nhập sai vào một key Redis riêng: `otp:attempts:${email}`.
    - Sử dụng lệnh **nguyên tử** `INCR` của Redis để tăng số lần nhập sai. Nếu giá trị trả về `>= 5`, tiến hành khóa email trong 15 phút bằng key `otp:block:${email}` (TTL 900s) và xóa mã OTP cũ.
4.  **Chống Spam Rate Limiting (Resend Cooldown)**:
    - Khi gửi OTP thành công (đăng ký hoặc gửi lại), tạo key `otp:cooldown:${email}` có TTL = 60 giây.
    - Từ chối mọi yêu cầu `resend-otp` nếu cooldown key này còn tồn tại.
5.  **Ràng buộc Token & OTP chặt chẽ (1-1 Mapping)**:
    - Giải mã JWT trước -> Lấy `email` -> Lấy OTP hiện tại từ Redis -> So sánh.
    - Để tránh trường hợp link cũ (JWT cũ) vẫn được dùng với OTP mới, ta lưu token hiện hành vào Redis: `otp:token:${email}` -> `verificationToken`.
    - Khi xác thực, so sánh token gửi lên có trùng khớp với token trong Redis không. Nếu không trùng khớp, từ chối ngay lập tức (JWT cũ đã bị vô hiệu hóa bởi lượt gửi lại mới).
6.  **Tối ưu UX Kích hoạt (Front-end Link UX)**:
    - Hỗ trợ cả 2 cách:
      - Link trong email: `${WEB_URL}/verify-otp?token=${token}&otp=${otp}` (1-click kích hoạt tự động).
      - Hiển thị mã OTP 6 chữ số rõ ràng trong thư để người dùng có thể copy-paste nhập tay nếu muốn.

---

## ⛓️ 2. Chuỗi phụ thuộc (Dependency Chains)
1.  **Redis Service**: Sử dụng `PokerStateService` để lấy raw client `ioredis` và thực hiện các lệnh nguyên tử (`incr`, `del`, `set`, `get`).
2.  **Mail Templates**: Tạo tệp `register.hbs` trong `BE/src/mail/templates/` sử dụng cú pháp Handlebars.
3.  **Auth DTOs**: Thêm các DTO `VerifyOtpDto` và `ResendOtpDto` vào hệ thống.
4.  **Auth Controller & Service**: Bổ sung logic xử lý API và chặn đăng nhập với tài khoản chưa kích hoạt.

---

## 📅 3. Các bước thực hiện chi tiết (Phase-by-Phase Breakdown)

### 📍 Phase 1: Tạo DTOs & Khóa Đăng nhập
*   **Hành động**:
    1. Trong `BE/src/v1/auth/dto/auth.dto.ts`, thêm:
       ```typescript
       export class VerifyOtpDto {
         @ApiProperty({ description: 'Mã xác thực OTP (6 chữ số)' })
         @IsString()
         @Length(6, 6)
         otp: string;

         @ApiProperty({ description: 'JWT Token dùng để định danh email xác thực' })
         @IsString()
         token: string;
       }

       export class ResendOtpDto {
         @ApiProperty({ description: 'Email của tài khoản cần gửi lại mã' })
         @IsEmail()
         email: string;
       }
       ```
    2. Cập nhật `AuthService.login`:
       - Sau khi tìm thấy user, kiểm tra: `if (user.status !== 'ACTIVE') { throw new UnauthorizedException('Tài khoản chưa được kích hoạt. Vui lòng xác thực OTP.'); }`.

### 📍 Phase 2: Triển khai Email Template (`register.hbs`)
*   **Hành động**:
    1. Thiết kế tệp `BE/src/mail/templates/register.hbs` bằng HTML với CSS inline tương thích với các trình duyệt mail.
    2. Sử dụng tông màu sòng bài tối (dark gradient `#121214` sang `#1f1f23`), đường viền vàng gold (`#c5a880`), nút bấm kích hoạt màu đỏ casino (`#d93838`) có hiệu ứng glow.
    3. Nội dung bao gồm lời mời chào sôi nổi vào sảnh đấu Poker CG, mã OTP hiển thị lớn, rõ ràng cùng link kích hoạt nhanh 1-click.

### 📍 Phase 3: Tích hợp Tạo OTP & Gửi Mail trong `AuthService`
*   **Hành động**:
    1. Khi gọi `register`:
       - Đặt trạng thái ban đầu của user là `'INACTIVE'`.
       - Sinh mã OTP 6 chữ số: `const otp = Math.floor(100000 + Math.random() * 900000).toString();`.
       - Sinh JWT token chứa `{ email }` hết hạn sau 15 phút.
       - Lưu vào Redis:
         - `otp:code:${email}` -> `otp` (TTL: 900s)
         - `otp:token:${email}` -> `token` (TTL: 900s)
         - `otp:cooldown:${email}` -> `'1'` (TTL: 60s)
       - Đẩy job `register` vào BullMQ, đính kèm `otp`, `username` và `token`.
    2. Cập nhật `MailProcessor.sendRegisterMail`:
       - Nhận `otp`, `token`, và tạo liên kết: `const verificationUrl = `${webUrl}/verify-otp?token=${user.token}&otp=${user.otp}`;`.
       - Truyền `otp` và `verificationUrl` vào context template.

### 📍 Phase 4: Triển khai API Xác thực và Gửi lại OTP
*   **Hành động**:
    1. Thêm endpoint `verify-otp` và `resend-otp` vào `AuthController`.
    2. Triển khai logic chi tiết trong `AuthService`:
       - **verifyOtp**:
         - Giải mã JWT token. Nếu token hết hạn hoặc lỗi -> báo lỗi token không hợp lệ.
         - Lấy `email` từ token.
         - Kiểm tra xem email có đang bị block không: `const isBlocked = await redis.get(`otp:block:${email}`)`. Nếu có -> báo lỗi tài khoản bị khóa nhập sai 15 phút.
         - Lấy user trong database. Nếu user đã `ACTIVE` -> trả về `{ message: 'Tài khoản đã được xác thực trước đó. Vui lòng đăng nhập.', alreadyVerified: true }`.
         - Lấy token hiện hành trong Redis `otp:token:${email}`. Nếu không khớp với token gửi lên -> báo lỗi token đã hết hạn hoặc đã bị hủy do yêu cầu gửi lại mới.
         - Lấy OTP trong Redis `otp:code:${email}`. Nếu không tồn tại -> báo lỗi OTP hết hạn.
         - Kiểm tra OTP:
           - **Nếu khớp**: Cập nhật trạng thái user thành `ACTIVE`, xóa các key Redis (`otp:code:${email}`, `otp:token:${email}`, `otp:attempts:${email}`). Trả về thông báo thành công.
           - **Nếu không khớp**: Tăng số lần nhập sai nguyên tử bằng `await redis.incr(`otp:attempts:${email}`)`. Set TTL cho attempts key là 900s nếu chưa có.
             - Nếu số lần nhập sai `>= 5`: Thiết lập key `otp:block:${email}` với giá trị `'1'` và TTL 900s (15 phút). Xóa các key OTP khác. Ném ra lỗi khóa tài khoản.
             - Nếu `< 5`: Ném ra lỗi sai OTP, báo rõ số lần còn lại `5 - attempts`.
       - **resendOtp**:
         - Tìm kiếm user. Nếu không tồn tại hoặc đã `ACTIVE` -> ném lỗi tương ứng.
         - Kiểm tra xem email có bị block do nhập sai trước đó không.
         - Kiểm tra cooldown `otp:cooldown:${email}`. Nếu tồn tại -> ném lỗi yêu cầu đợi 60s.
         - Sinh OTP mới, token mới. Lưu đè lên Redis (tự động vô hiệu hóa token và OTP cũ) và thiết lập cooldown mới.
         - Đẩy job gửi mail mới vào BullMQ.

---

## 🛠️ 5. Kế hoạch Kiểm tra & Xác minh (Verification Plan)

### Kiểm tra Tự động (Compilation & Linting)
*   Chạy kiểm tra cú pháp và build:
    ```bash
    npm run lint
    npm run build
    ```

### Kiểm tra Thủ công (Manual Test cases)
1.  **Đăng ký tài khoản mới**: Kiểm tra trạng thái `INACTIVE` trong DB và xem log gửi mail có chứa đúng URL đính kèm OTP và Token.
2.  **Đăng nhập tài khoản chưa kích hoạt**: Đảm bảo bị chặn và trả về mã lỗi thích hợp.
3.  **Spam resend-otp**: Gửi yêu cầu resend liên tục trong vòng 60 giây và kiểm tra xem có bị chặn bởi cooldown hay không.
4.  **Click link cũ sau khi resend**: Thử dùng token của lần gửi trước để xác thực cho lần gửi sau, đảm bảo hệ thống chặn thành công nhờ so sánh với `otp:token:${email}`.
5.  **Brute force OTP (Concurrent Requests)**: Nhập sai liên tiếp nhanh chóng để kiểm tra tính nguyên tử của `INCR` và khả năng chặn tức thì khi chạm mốc 5 lần mà không bị lọt request.
6.  **Xác thực thành công**: Nhập đúng OTP, kiểm tra trạng thái chuyển sang `ACTIVE` và đăng nhập thành công.
