# 🃏 KBL Poker - Knowledge Block Platform


| **318** Bộ Kỹ năng (Skills) | **29** Quy trình (Workflows) | **12** Quy tắc (Rules) | (Workflows) | **12** Quy tắc (Rules) | (Workflows) | **12** Quy tắc (Rules) |

Nền tảng ứng dụng chơi Poker trực tuyến thời gian thực với hệ thống quản trị, xác thực, ví người chơi, tích hợp AI Coach và trình phát lại ván bài (Hand Replayer).

---

## 🏗 Công nghệ sử dụng

- **Frontend:** Next.js 16 (App Router), React 19, TailwindCSS, Zustand (State Management), React Query, React Hook Form, Zod (Schema Validation), Socket.IO Client.
- **Backend:** NestJS, TypeORM (MySQL 8), Socket.IO, BullMQ, Redis.
- **AI Integration:** Gemini API (AI Coach nhận xét chiến thuật ván bài).
- **Infrastructure:** Docker, Nginx Reverse Proxy, Vercel (FE Deploy), Render (BE Deploy).

---

## ✨ Các Tính Năng Đang Phát Triển & Hoàn Thiện

### 1. Phân Hệ Quản Trị (Admin Backstage)
*   **Form Design System**: Xây dựng bộ component form dùng chung chuẩn hóa bao gồm: `FormInput`, `FormTextArea`, `FormSelect`, `FormCheckbox`, `FormSwitch`.
*   **Refactor & Validation**: Đồng bộ hóa toàn bộ biểu mẫu quản trị sang **React Hook Form** kết hợp **Zod Validation** nhằm nâng cao UX và xử lý dữ liệu đầu vào an toàn:
    *   Đăng nhập quản trị viên.
    *   Trình soạn thảo Blog & Tạo bài viết.
    *   Tạo bàn chơi Poker & Cấu hình mức cược.
    *   Phát thông điệp hệ thống toàn server.
    *   Tạo sự kiện & Cấu hình thời gian thông minh (`DateTimePicker`).
    *   Quản lý thành viên (Trục xuất, Phân quyền).

### 2. Trình Xem Lại Ván Bài (Poker Hand Replayer & Picker)
*   **Poker Hand Replayer**: Cho phép người xem tái hiện lại ván bài một cách trực quan trên giao diện Web:
    *   Vẽ bàn đấu Mini bằng SVG responsive 100%. Phân bổ tự động 9 vị trí người chơi, avatar và lượng cược.
    *   Timeline liệt kê chi tiết từng hành động (Fold, Check, Call, Raise, All-in) và cho phép nhảy nhanh tới lượt chơi bất kỳ.
    *   Tự động chia bài chung và bài tẩy theo các vòng Preflop, Flop, Turn, River.
*   **Tích hợp Gemini AI Coach**: Cho phép gửi dữ liệu ván bài qua AI để phân tích chiến thuật, đưa ra nhận xét chuyên môn và đề xuất nước đi tối ưu.
*   **Hand Picker Modal (Admin)**: Tích hợp bộ chọn ván bài trực quan ngay trong Blog Editor. Admin có thể tìm kiếm, duyệt danh sách ván bài hệ thống từ API và bấm nút nhúng tự động chèn shortcode `[hand-replayer id="xxx"]`.
*   **Live Preview**: Trình soạn thảo bài viết hỗ trợ xem trước (Preview) ván bài hoạt động thực tế ngay khi đang viết bài.

### 3. Tối Ưu Hóa Tìm Kiếm (SEO Engine)
*   **Sitemap xml động (`sitemap.ts`)**: Tự động quét và liệt kê danh sách bài viết blog từ API backend giúp công cụ tìm kiếm index nhanh chóng.
*   **Robots txt động (`robots.ts`)**: Cấu hình chuẩn SEO chặn các Bot tìm kiếm thu thập thông tin các trang nhạy cảm phía backstage quản trị `/backstage/*`.
*   **Dynamic Metadata**: Tích hợp hàm sinh thẻ meta tự động cho từng bài viết blog (`generateMetadata`) giúp hiển thị tốt trên Google Search, Facebook OpenGraph.
*   **Đa ngôn ngữ & Ngữ cảnh**: Cấu hình HTML `lang="vi"` và thẻ tiêu đề động (Title Template).

### 4. Bảo Mật & Hệ Thống (Backend Hardening)
*   **Rate Limiting**: Cấu hình **Redis Throttler** chống brute-force và spam request.
*   **Custom Throttler Guard**: Cấu hình bộ lọc đặc biệt bảo vệ Websocket handshake, chặn lỗi crash server khi thực hiện handshake rate-limit.
*   **Keep-alive Ping Service**: Hệ thống tự động ping định kỳ từ Frontend giúp giữ cho server backend luôn hoạt động (tránh rơi vào trạng thái ngủ đông khi deploy trên Render gói Free).

---

## 🚀 Hướng Hẫn Cài Đặt Và Chạy Dự Án (Môi trường Development)

### 1. Yêu cầu hệ thống
- **Node.js**: Phiên bản 18+ hoặc 20+
- **Docker** và **Docker Compose**
- **Git**

### 2. Thiết lập Môi trường (Environment Variables)

Hệ thống yêu cầu các file biến môi trường cho cả Frontend và Backend.

**Backend (`BE/.env`):**
Tạo file `BE/.env` dựa trên `BE/.env.example` hoặc sử dụng cấu hình mẫu:
```env
# Database Connection
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=root
DB_DATABASE=know_ledge_block

# Redis Cache & Message Queue
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# JWT Secrets
JWT_SECRET=super_secret_jwt_key
JWT_EXPIRES_IN=1h

# Gemini AI (AI Coach API Key)
GEMINI_API_KEY=your_gemini_api_key_here

# Application Configuration
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

### 4. Khởi chạy Backend (NestJS)
Mở một terminal mới:
```bash
cd BE
npm install
npm run start:dev
```
- Backend sẽ chạy tại: `http://localhost:3002`
- API Swagger tài liệu: `http://localhost:3002/api/v1/docs` (nếu đã cấu hình swagger)

### 5. Khởi chạy Frontend (Next.js)
Mở một terminal mới khác:
```bash
cd FE
npm install
npm run dev
```
- Frontend sẽ chạy tại: `http://localhost:3000`

---

## 🌍 Triển Khai Môi Trường Production

Hệ thống hỗ trợ chạy production qua Docker Compose hoặc triển khai độc lập lên các đám mây:
- **Frontend**: Deploy lên Vercel để tối ưu hóa truyền tải CDN.
- **Backend**: Deploy lên Render / Railway kết hợp với Redis Cloud.

### Triển khai thông qua Docker Compose Production:
Chạy lệnh sau tại thư mục gốc của dự án:
```bash
docker compose -f docker-compose.prod.yml build
docker compose -f docker-compose.prod.yml up -d
```
Hệ thống sẽ tự động khởi tạo và phân luồng Nginx Reverse Proxy (SSL port 80/443) tới dịch vụ FE Next.js và BE NestJS.

---

## 📂 Cấu trúc Thư mục

```text
├── BE/                      # Mã nguồn Backend (NestJS)
│   ├── src/
│   │   ├── common/          # Bộ lọc, Guards, Interceptors dùng chung
│   │   ├── v1/              # API Version 1
│   │   │   ├── auth/        # Module Xác thực người dùng (JWT)
│   │   │   ├── admin/       # Module Quản trị viên & Lịch sử ván bài (hands)
│   │   │   ├── blogs/       # Module Tin tức, Blog & Phân tích AI Coach
│   │   │   └── ...
├── FE/                      # Mã nguồn Frontend (Next.js 16)
│   ├── app/                 # App Router (Pages, Layouts, Sitemap, Robots)
│   ├── core/                # API HttpClient, Interceptors, Context Providers
│   ├── components/
│   │   └── ui/              # Bộ Component Form Design System dùng chung
│   ├── features/            # Module nghiệp vụ:
│   │   ├── admin/           # Sidebar, Dashboard Backstage
│   │   ├── auth/            # Form Đăng nhập, Đăng ký, OTP, Quên mật khẩu
│   │   ├── blogs/           # BlogList, BlogDetail, Replayer, HandPicker
│   │   └── poker-game/      # Giao diện bàn chơi game Poker thực tế
├── nginx/                   # Cấu hình Nginx Proxy cho Production
├── docker-compose.yml       # Docker Compose cho Development
└── README.md                # Tài liệu hướng dẫn chính (File này)
```
