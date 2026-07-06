# PLAN: Khắc phục lỗi Build Next.js

Dựa trên các lỗi được báo cáo từ Next.js 16.2.5 (Turbopack) trong quá trình `next build`, đây là kế hoạch phân tích và xử lý:

## 🔴 1. Lỗi Prerender `/_global-error` & "Each child in a list should have a unique 'key' prop"
**Nguyên nhân:** 
Sự tồn tại song song của `FE/app/layout.tsx` (không có `<html>`, `<body>`) và `FE/app/[locale]/layout.tsx` (có `<html>`, `<body>`). Next.js cố gắng inject thẻ `<head>` và `<meta>` vào `app/layout.tsx` nhưng vì thiếu cấu trúc DOM chuẩn, dẫn đến sinh ra các thẻ bị trùng lặp hoặc lồng nhau không hợp lệ, đồng thời làm crash quá trình prerender của `global-error.tsx` (do Next.js nội bộ gọi `useContext` khi wrap layout bị lỗi).

**Cách giải quyết:**
- **Xóa file `FE/app/layout.tsx`**: Đối với dự án dùng `next-intl` có cấu trúc thư mục `[locale]`, root layout nên được đặt duy nhất tại `FE/app/[locale]/layout.tsx`. 

## 🟡 2. Cảnh báo: Non-standard "NODE_ENV" value
**Nguyên nhân:**
File `docker-compose.yml` đang set cứng biến môi trường `NODE_ENV: development` cho container frontend. Khi bạn chạy lệnh `npm run build` bên trong container này, Next.js nhận được `NODE_ENV=development` thay vì `production`, tạo ra xung đột vì hàm build của Next.js mặc định phải dùng `production`.

**Cách giải quyết:**
- Sửa script trong `FE/package.json`:
  Đổi `"build": "next build"` thành `"build": "NODE_ENV=production next build"`
- Hoặc gỡ bỏ `NODE_ENV: development` khỏi `docker-compose.yml` (vì Next.js tự động set `development` khi chạy `next dev`).

## 🔵 3. Cảnh báo: Deprecated "middleware" file convention
**Nguyên nhân:**
Next.js 16 (và Turbopack) đã deprecate file convention `middleware.ts` và khuyến nghị dùng `proxy.ts` (mới).

**Cách giải quyết:**
- Đổi tên file `FE/middleware.ts` thành `FE/proxy.ts`.

---

## ✅ Các bước thực thi:
1. Xóa file `FE/app/layout.tsx` (vì `[locale]/layout.tsx` đã đảm nhận vai trò root layout).
2. Sửa file `FE/package.json` -> Cập nhật script `build`.
3. Đổi tên `middleware.ts` thành `proxy.ts`.
