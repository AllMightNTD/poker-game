# PLAN-remove-multi-language (COMPLETED)

## 🟢 PHASE 1: Tổng quan và Phạm vi (Scope)
Mục tiêu là gỡ bỏ hoàn toàn kiến trúc Đa ngôn ngữ (Multi-language/i18n) trên cả Frontend (FE) và Backend (BE). Việc này giúp tinh gọn codebase, giảm độ phức tạp khi bảo trì và tăng tốc độ xử lý do không cần middleware phân tích locale nữa.

### Phân tích hiện trạng:
- **Frontend (FE)**: Đang sử dụng thư viện `next-intl`. Cấu trúc route hiện tại là `app/[locale]`. Có khoảng 4-5 component đang sử dụng hook `useTranslations`.
- **Backend (BE)**: Đang sử dụng `nestjs-i18n`. Được inject trong `app.module.ts` và sử dụng rải rác (chủ yếu trong `user.controller.ts`). Thư mục chứa file dịch thuật nằm ở `src/i18n/`.

---

## 🟡 PHASE 2: Các bước thực thi chiến lược (Blueprint)

### Phần 1: Xử lý Backend (NestJS)
1. **Gỡ cài đặt Package**: Chạy lệnh gỡ bỏ `nestjs-i18n` khỏi `package.json`.
2. **Cập nhật `app.module.ts`**: Xóa module `I18nModule.forRoot(...)` ra khỏi danh sách imports.
3. **Loại bỏ Inject & Decorator**: 
   - Xóa bỏ việc sử dụng `@I18nLang()`, `I18nContext`, `I18nService` trong các Controller và Service (cụ thể là `user.controller.ts`).
   - Cập nhật logic để trả về thẳng Text cố định (Ví dụ: Tiếng Anh / English) thay vì gọi hàm `i18n.t()`.
4. **Xóa Resource**: Xóa thư mục `BE/src/i18n` vì không còn cần thiết.

> [!WARNING]
> **Rủi ro ở BE**: Nếu có các file DTO đang dùng custom messages từ i18n, cần rà soát để chuyển thành message dạng text thô.

### Phần 2: Xử lý Frontend (Next.js)
1. **Thay đổi Cấu trúc Route**:
   - Di chuyển toàn bộ các thư mục con bên trong `FE/app/[locale]/` ra trực tiếp thư mục `FE/app/`.
   - Xóa bỏ thư mục `[locale]`.
2. **Loại bỏ Middleware (Proxy)**:
   - Trong `FE/proxy.ts` (hoặc `middleware.ts`), gỡ bỏ logic của `next-intl` (`createMiddleware`).
   - Sửa đổi các Redirect URL (ví dụ: chuyển `/vi/login` thành `/login`).
3. **Refactor Code (Xóa `useTranslations`)**:
   - Tìm kiếm và loại bỏ hook `useTranslations` trong các file như: `MessagesPopup.tsx`, `login-form.tsx`, `forgot-password-form.tsx`, `register/page.tsx`, v.v.
   - Hardcode trực tiếp text Tiếng Anh (English) vào UI.
4. **Xóa bỏ Provider & Cấu hình**:
   - Loại bỏ `NextIntlClientProvider` và `getMessages()` khỏi `FE/app/layout.tsx`.
   - Xóa plugin `next-intl` ra khỏi `next.config.js`.
   - Xóa file `i18n/routing.ts` (nếu có).
5. **Gỡ cài đặt Package**: Xóa `next-intl` ra khỏi `package.json`.

> [!IMPORTANT]
> **Điểm ngắt hệ thống**: Việc di chuyển từ thư mục `[locale]` ra ngoài sẽ làm thay đổi đường dẫn của toàn bộ ứng dụng. Cần kiểm tra kỹ các file sử dụng `<Link>` component từ `next-intl` (phải chuyển về `next/link` chuẩn).

---

## 🔵 PHASE 3: Phân công (Surgical Distribution)
1. Kích hoạt `backend-specialist` cho Phần 1.
2. Kích hoạt `frontend-specialist` cho Phần 2.
3. Kích hoạt `quality-inspector` để chạy test thử toàn bộ flow đăng nhập, trang chủ, trò chơi sau khi đã refactor.

## 🔴 PHASE 4: Kiểm thử (Verification Plan)
- [x] **BE**: Lệnh `npm run build` phải thành công. Các API trả về message trực tiếp.
- [x] **FE**: `npm run build` không lỗi, không báo miss file. Truy cập localhost:3000 không còn tự động redirect thêm `/vi` hoặc `/en` vào URL. Mọi chữ nghĩa trên UI đều render bình thường.
