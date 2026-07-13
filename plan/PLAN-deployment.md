# Kế hoạch Triển khai (Deployment Plan) - Free Tier Stack

Kế hoạch này cung cấp hướng dẫn từng bước để đưa hệ thống Poker Game lên môi trường Production sử dụng toàn bộ các dịch vụ Cloud miễn phí chất lượng cao (Free Tiers).

---

## 🏗️ Kiến Trúc Deployment Đề Xuất

```mermaid
graph TD
    Client[Trình duyệt/Client] -->|HTTPS Requests| FE[Frontend: Vercel]
    Client -->|WebSocket & HTTP APIs| BE[Backend: Koyeb / Render]
    BE -->|MySQL Protocols| DB[Database: TiDB Cloud Serverless]
    BE -->|Caching / Rate Limiting| Redis[Redis: Upstash Serverless]
```

### 1. Thành phần Công nghệ & Dịch vụ

| Thành phần | Dịch vụ đề xuất | Loại tài khoản | Đặc điểm nổi bật |
| :--- | :--- | :--- | :--- |
| **Frontend (FE)** | **Vercel** | Hobby Plan (Free) | Tối ưu hóa cho Next.js, tự động CDN, CI/CD tích hợp Git. |
| **Backend (BE)** | **Koyeb** hoặc **Render** | Free Tier | Koyeb hỗ trợ WebSocket tốt hơn, không bị ngắt quãng giữa chừng. Render dễ dùng nhưng tự động ngủ sau 15p idle. |
| **Database (MySQL)** | **TiDB Cloud (Serverless)** | Free Tier (5GB) | Tương thích 100% với giao thức MySQL, hiệu năng cao, miễn phí vĩnh viễn. |
| **Redis** | **Upstash** | Serverless Free (10k req/day) | Miễn phí, phản hồi nhanh, phù hợp cho rate-limiting và session lưu vết. |

---

## 📋 Các Bước Thực Hiện Chi Tiết

### Bước 1: Khởi tạo cơ sở dữ liệu MySQL trên TiDB Cloud
1. Truy cập [TiDB Cloud](https://pingcap.com/products/tidb-cloud).
2. Tạo một Cluster dạng **Serverless** (Free).
3. Lấy thông tin Connection String (Host, Port, Database Name, User, Password).
4. Thay thế thông tin kết nối trong file `.env` của backend để chạy migration.

### Bước 2: Khởi tạo Serverless Redis trên Upstash
1. Truy cập [Upstash Console](https://console.upstash.com).
2. Tạo một database Redis mới.
3. Lấy endpoint kết nối có định dạng: `rediss://default:password@host:port`.

### Bước 3: Cấu hình và Deploy Backend (BE)
Bạn có thể chọn **Koyeb** (khuyên dùng cho WebSockets) hoặc **Render**.

#### Lựa chọn A: Koyeb (Khuyên dùng)
1. Đăng ký tài khoản [Koyeb](https://www.koyeb.com).
2. Kết nối tới tài khoản GitHub chứa repository dự án.
3. Cấu hình dịch vụ:
   * **Build command**: `npm run build` (hoặc `npx nest build` tùy cấu hình package.json).
   * **Start command**: `npm run start:prod`.
   * **Ports**: Mở cổng `3002` cho HTTP API và `3000` cho WebSockets.
4. Thêm các biến môi trường (Environment Variables) lấy từ bước 1 và 2:
   ```env
   DB_CONNECTION=mysql
   DB_HOST=<TiDB_Host>
   DB_PORT=4000
   DB_DATABASE=<TiDB_DB_Name>
   DB_USERNAME=<TiDB_User>
   DB_PASSWORD=<TiDB_Password>
   REDIS_HOST=<Upstash_Redis_Host>
   REDIS_PORT=<Upstash_Redis_Port>
   REDIS_PASSWORD=<Upstash_Redis_Password>
   RNG_ENCRYPTION_KEY=e8f498c4cf36ab3d0d6fe22905541e2a87895f32a76dbcfc5b8b98b98b1a20d2
   JWT_SECRET=<Complex_Secret>
   ```

#### Lựa chọn B: Render
1. Truy cập [Render Dashboard](https://dashboard.render.com).
2. Tạo một **Web Service** mới và liên kết với Github.
3. Thiết lập tương tự với Koyeb. Cần bật biến môi trường `PORT=3002`.

### Bước 4: Cấu hình và Deploy Frontend (FE) trên Vercel
1. Đăng nhập [Vercel](https://vercel.com) bằng tài khoản GitHub.
2. Click **Add New** -> **Project** và Import thư mục `FE` của dự án.
3. Trong phần **Build & Development Settings**:
   * **Root Directory**: Chọn `FE`.
   * **Framework Preset**: Next.js.
4. Trong phần **Environment Variables**, điền URL API của backend vừa tạo ở Bước 3:
   ```env
   NEXT_PUBLIC_API_URL=https://<your-backend-app>.koyeb.app
   NEXT_PUBLIC_WS_URL=wss://<your-backend-app>.koyeb.app
   ```
5. Nhấn **Deploy**. Vercel sẽ tự động build và cung cấp domain `.vercel.app` miễn phí.

---

## ⚠️ Lưu ý Quan Trọng khi chạy Free Tier
> [!WARNING]
> **Giới hạn Cold Start**: Trên Render Free Tier, server sẽ chuyển sang trạng thái "ngủ" nếu không có request trong 15 phút. Request đầu tiên sau khi ngủ sẽ mất từ 30s - 50s để khởi động lại.
> Bạn có thể cấu hình dịch vụ cronjob miễn phí như [UptimeRobot](https://uptimerobot.com) để ping backend mỗi 10 phút để giữ server luôn "thức".

> [!IMPORTANT]
> **Giao thức Bảo mật**: Luôn thay thế `RNG_ENCRYPTION_KEY` và `JWT_SECRET` bằng các chuỗi ngẫu nhiên có độ bảo mật cao trước khi deploy chính thức. Không sử dụng các giá trị mặc định của môi trường local.
