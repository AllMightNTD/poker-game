# 🃏 KBL Poker - Knowledge Block Platform

Nền tảng ứng dụng chơi Poker trực tuyến thời gian thực với hệ thống quản trị, xác thực và ví người chơi.

## 🏗 Công nghệ sử dụng

- **Frontend:** Next.js 14, React 19, TailwindCSS, Zustand (State Management), Socket.IO Client.
- **Backend:** NestJS, TypeORM, Socket.IO, JWT.
- **Database:** MySQL 8.
- **Cache / Message Broker:** Redis.
- **Infrastructure:** Docker, Nginx Proxy.

---

## 🚀 Hướng dẫn cài đặt và chạy dự án (Môi trường Development)

### 1. Yêu cầu hệ thống
- **Node.js**: Phiên bản 18+ hoặc 20+
- **Docker** và **Docker Compose**
- **Git**

### 2. Thiết lập Môi trường (Environment Variables)

Hệ thống yêu cầu các file biến môi trường cho cả Frontend và Backend.

**Backend (`BE/.env`):**
Tạo file `BE/.env` dựa trên `BE/.env.example` (nếu có) hoặc sử dụng cấu hình mẫu:
```env
# Database
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=root
DB_DATABASE=know_ledge_block

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# JWT
JWT_SECRET=super_secret_jwt_key
JWT_EXPIRES_IN=1h

# Application
APP_PORT=3002
NODE_ENV=development
```

**Frontend (`FE/.env` hoặc `FE/.env.local`):**
Tạo file `FE/.env.local` với cấu hình sau:
```env
NEXT_PUBLIC_API_URL=http://localhost:3002
```

### 3. Khởi chạy Services (MySQL & Redis) qua Docker
Đứng tại thư mục gốc của dự án, chạy lệnh:
```bash
docker compose up -d db redis
```
*(Lưu ý: Nếu bạn muốn chạy toàn bộ Frontend, Backend qua Docker Dev thì dùng lệnh `docker compose up -d`, lúc này cả hệ thống sẽ được build và chạy qua container).*

### 4. Khởi chạy Backend (NestJS)
Mở một terminal mới:
```bash
cd BE
npm install
npm run start:dev
```
- Backend sẽ chạy tại: `http://localhost:3002`
- API sẽ khả dụng tại: `http://localhost:3002/api/v1`

### 5. Khởi chạy Frontend (Next.js)
Mở một terminal mới khác:
```bash
cd FE
npm install
npm run dev
```
- Frontend sẽ chạy tại: `http://localhost:3000`

---

## 🌍 Triển khai Môi trường Production

Đối với môi trường Production, hệ thống sử dụng `docker-compose.prod.yml` kết hợp Nginx Reverse Proxy và SSL.

### 1. Chuẩn bị biến môi trường
Tạo các file `.env.production` tại thư mục `FE` và `BE`.
- `FE/.env.production`: Phải chứa `NEXT_PUBLIC_API_URL=https://your-domain.com`
- `BE/.env.production`: Cấu hình kết nối Database/Redis trỏ tới network nội bộ Docker (VD: `DB_HOST=db`, `REDIS_HOST=redis`).

Tạo thêm file `.env` ở thư mục gốc chứa thông tin DB/Redis để truyền vào `docker-compose.prod.yml`:
```env
DB_DATABASE=know_ledge_block
DB_USERNAME=admin
DB_PASSWORD=secret
DB_ROOT_PASSWORD=super_secret
REDIS_PASSWORD=redis_secret
```

### 2. Cấu hình Nginx và SSL
- SSL Certificates (`fullchain.pem`, `privkey.pem`) cần được cấp phát trước (thông qua Let's Encrypt hoặc nhà cung cấp SSL) và đặt tại thư mục `nginx/certs/`.
- Sửa tên miền (domain) thành domain thực tế của bạn trong file `nginx/default.conf`.

### 3. Build và Start hệ thống
Chạy lệnh sau tại thư mục gốc của dự án:
```bash
docker compose -f docker-compose.prod.yml build
docker compose -f docker-compose.prod.yml up -d
```
Hệ thống sẽ tự động khởi tạo:
- **`knowledge-block-fe`**: Frontend Next.js Prod (Bị cô lập trong network, chỉ Nginx mới trỏ vào được).
- **`nestjs-prod`**: Backend NestJS Prod (Bị cô lập trong network, xử lý API và WebSocket).
- **`mysql-db`** và **`redis`**: Database và Cache.
- **`nginx-proxy`**: Reverse proxy phân luồng request port 80/443. Lắng nghe HTTP, HTTPS và tự động redirect.

---

## 📂 Cấu trúc Thư mục

```text
├── BE/                   # Mã nguồn Backend (NestJS)
│   ├── src/
│   │   ├── v1/           # API Version 1
│   │   ├── auth/         # Module Xác thực (JWT)
│   │   ├── admin/        # Module Quản trị viên
│   │   ├── blogs/        # Module Tin tức / Blog
│   │   └── ...
├── FE/                   # Mã nguồn Frontend (Next.js)
│   ├── app/              # App Router (Pages, Layouts)
│   ├── core/             # Core Config (API Client, Hooks chung)
│   ├── features/         # Tính năng (Blogs, Poker, Admin, Auth)
│   ├── lib/              # Utils, Cấu hình thư viện ngoài
│   └── ...
├── nginx/                # Cấu hình Nginx Proxy
├── docker-compose.yml    # Docker Compose cho Development
├── docker-compose.prod.yml # Docker Compose cho Production
└── README.md             # Tài liệu dự án
```
