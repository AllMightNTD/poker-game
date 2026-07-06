import { DocumentBuilder } from '@nestjs/swagger';

export const config = new DocumentBuilder()
  .setTitle('🎰 Poker Platform API')
  .setDescription(
    `## Tài liệu API cho Poker Platform

Hệ thống backend cung cấp các API cho:
- **Authentication**: Đăng ký, đăng nhập, refresh token, quên mật khẩu
- **Lobby**: Thống kê sảnh chờ (online players, active tables, jackpot)
- **Rooms**: Quản lý phòng chơi — tạo phòng, mua vào, rời bàn, quản trị
- **Blogs**: Bài viết chiến thuật với Cursor Pagination hiệu suất cao
- **Wallet**: Ví chips — nhận chips miễn phí
- **User**: Thông tin người dùng và số dư chips

### Xác thực (Authentication)
Sử dụng **Bearer JWT Token**. Lấy token từ \`POST /auth/login\`, sau đó click **Authorize** và nhập token.

### Cursor Pagination (Blogs)
Thay vì page số, API blogs dùng cursor opaque để tránh nhảy data khi thêm bài mới.`,
  )
  .setVersion('1.0')
  .addTag('🔐 Authentication', 'Đăng ký, đăng nhập, refresh token, quên mật khẩu')
  .addTag('👤 User', 'Thông tin người dùng và số dư chips')
  .addTag('🏠 Lobby', 'Thống kê tổng quan sảnh chờ')
  .addTag('🃏 Rooms', 'Quản lý phòng chơi — CRUD, buy-in, sit actions')
  .addTag('💰 Wallet', 'Ví chips của người chơi')
  .addTag('📰 Blogs', 'Bài viết chiến thuật với Cursor Pagination')
  .addBearerAuth(
    {
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT',
      name: 'Authorization',
      description: 'Nhập JWT access token. Lấy từ POST /auth/login → access_token',
      in: 'header',
    },
    'access-token',
  )
  .build();
