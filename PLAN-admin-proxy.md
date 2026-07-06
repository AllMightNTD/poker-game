# Kế hoạch thiết kế Middleware Proxy cho hệ thống Admin (/backstage)

## 1. Mục tiêu
Xây dựng một hệ thống phân luồng (Proxy/Middleware) tại Frontend bằng Next.js Middleware để bảo vệ toàn bộ các route thuộc `/backstage/*`.

## 2. Yêu cầu nghiệp vụ
- **Bảo mật truy cập**: Nếu người dùng chưa đăng nhập Admin (chưa có token hợp lệ) mà cố tình truy cập vào `/backstage/dashboard`, `/backstage/users`,... thì lập tức đá văng về `/backstage/login`.
- **Chống lặp đăng nhập**: Nếu Admin đã đăng nhập thành công (đã có token) mà vô tình truy cập lại trang `/backstage/login`, hệ thống sẽ chặn và chuyển hướng (redirect) thẳng vào `/backstage/dashboard`.

## 3. Thách thức kiến trúc & Giải pháp
Hiện tại, khi login thành công ở `AdminLoginForm`, token đang được lưu vào `localStorage`. Tuy nhiên, Next.js Middleware chạy trên môi trường **Edge/Server-side** nên **KHÔNG THỂ** đọc được `localStorage` của trình duyệt. 

Do đó, để Proxy có thể hoạt động, ta cần thay đổi luồng lưu trữ một chút:

### Giai đoạn 1: Đồng bộ Token xuống Cookie
- Trong file `FE/features/admin/components/AdminLoginForm.tsx`:
- Khi nhận được `access_token` từ Backend, ta sẽ lưu nó vào **Cookie** (ví dụ: `admin_token`) với cấu hình `path=/`. 
- Cập nhật hàm logout để xóa cookie này.

### Giai đoạn 2: Tích hợp logic vào Middleware (Proxy)
- Next.js quy định file middleware chuẩn phải tên là `middleware.ts` ở thư mục gốc (nếu FE đang có file `proxy.ts`, ta cần tích hợp hoặc đổi tên nó thành `middleware.ts`).
- **Luồng xử lý trong Middleware**:
  1. Lấy thông tin `pathname` từ `request.nextUrl`.
  2. Lấy giá trị cookie `admin_token`.
  3. Kiểm tra xem route có bắt đầu bằng `/backstage` hay không.
  4. Nếu là route `/backstage/login` và ĐÃ có `admin_token` => `NextResponse.redirect` đến `/backstage/dashboard`.
  5. Nếu là các route `/backstage/*` khác và CHƯA có `admin_token` => `NextResponse.redirect` đến `/backstage/login`.
  6. Các request khác cho qua (`NextResponse.next()`).

## 4. Các tệp cần chỉnh sửa
1. `FE/features/admin/components/AdminLoginForm.tsx`: Thêm logic set Cookie (có thể dùng thư viện `js-cookie` hoặc ghi trực tiếp `document.cookie`).
2. `FE/features/admin/components/AdminSidebar.tsx`: Thêm logic clear Cookie khi nhấn nút Đăng xuất.
3. `FE/middleware.ts` (hoặc sửa đổi `FE/proxy.ts` hiện tại tùy thuộc vào việc file nào đang được Next.js hook): Viết hàm proxy check.

---
Vui lòng báo `Đồng ý` hoặc gọi lệnh `/create` nếu bạn muốn tôi tiến hành thực thi Kế hoạch này.
