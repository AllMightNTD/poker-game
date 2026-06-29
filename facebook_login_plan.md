# Facebook Login - "Invalid Scopes: email" Fix Plan

## 1. Nguyên nhân cốt lõi (Root Cause)
Lỗi **`Invalid Scopes: email`** hoàn toàn không xuất phát từ mã nguồn của ứng dụng (Frontend hay Backend). Nguyên nhân thực sự nằm ở chính sách mới của **Facebook Graph API**.

Đối với các ứng dụng Facebook Login tạo mới, quyền (scope) `email` không còn được tự động cấp phép mặc định. Facebook yêu cầu lập trình viên phải thêm (Add) quyền `email` một cách thủ công vào nhóm **Use Cases (Trường hợp sử dụng)** của ứng dụng trên trang Developer Console. Nếu ứng dụng yêu cầu scope `email` mà chưa được cấp phép trong Dashboard, API sẽ block request và trả về lỗi trên.

---

## 2. Plan Khắc Phục Lỗi (Giải quyết trên Dashboard)
Bạn cần thực hiện các bước sau trên tài khoản quản trị App tại [developers.facebook.com](https://developers.facebook.com/):

1. **Truy cập App Dashboard:** Chọn App mà bạn đang gắn `FACEBOOK_APP_ID` vào dự án.
2. **Tìm Use Cases:** Nhìn thanh menu bên trái, click vào **Use cases (Trường hợp sử dụng)**.
3. **Chỉnh sửa Authentication:** Tìm ô có tên **"Authentication and account creation"** (Xác thực và tạo tài khoản) -> Nhấn nút **Edit (Chỉnh sửa)**.
4. **Thêm quyền Email:** Cuộn xuống dưới, bạn sẽ thấy danh sách các quyền (Permissions). Tìm dòng chữ **`email`** và nhấn nút **Add (Thêm)** ở bên phải.
5. **Kiểm tra:** Đợi quyền `email` chuyển sang trạng thái đã được thêm (Ready). Lúc này, bạn quay lại màn hình đăng nhập Sociala và thử lại, lỗi sẽ hoàn toàn biến mất.

*(Lưu ý: Nếu giao diện Facebook Developer của bạn là phiên bản cũ, hãy vào mục **App Review** -> **Permissions and Features** -> Tìm `email` và nhấn **Request Advanced Access**).*

---

## 3. Kiến trúc Backend hiện tại (Đã tối ưu)
Tôi đã kiểm tra và tối ưu luồng xử lý ở Backend. Logic hiện tại hoạt động cực kỳ mượt mà:
- **`facebook.strategy.ts`:** Đã được tinh chỉnh format chuẩn `scope: ['public_profile', 'email']` và `profileFields: ['id', 'emails', 'name', 'photos']` để tối đa hóa khả năng tương thích.
- **Xử lý tài khoản có Email:** Nếu Facebook cho phép truy xuất `email`, hệ thống (`ValidateFacebookUserUseCase`) sẽ đối chiếu và tự động liên kết tài khoản Facebook với tài khoản Sociala đã tồn tại sẵn email đó.
- **Xử lý tài khoản không có Email:** Nếu người dùng đăng ký mới, hệ thống sẽ tự động sinh mật khẩu ngẫu nhiên (`randomPassword`) và dùng Avatar/Name của Facebook để tạo Profile.

---

## 4. Giải pháp Bypass Tạm Thời (Chỉ dùng khi Test)
Nếu bạn chưa tiện cấu hình trên Facebook Developer ngay lúc này mà chỉ muốn **chạy thử luồng Login** xem có hoạt động không, bạn có thể tạm thời "bỏ qua" việc lấy email:

- Mở file: `BE/src/v1/strategy/facebook.strategy.ts`
- Sửa dòng số 13 từ:
  ```typescript
  scope: ['public_profile', 'email'],
  ```
  Thành:
  ```typescript
  scope: ['public_profile'],
  ```

Việc này sẽ ra lệnh cho hệ thống không đòi hỏi email của Facebook nữa. BE sẽ tự động kích hoạt kịch bản tạo tài khoản không cần email dựa trên `facebook_id`! 

**(Tuy nhiên, trước khi Public dự án, bạn VẪN PHẢI làm Bước 2 để lấy email nhằm quản lý tài khoản User tốt hơn).**
