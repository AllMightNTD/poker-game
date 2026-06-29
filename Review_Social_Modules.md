# Tổng hợp Triển khai Module Group & Fanpage (Phase 1 & 2)

Dưới đây là danh sách toàn bộ các Trang (Pages), Components, và API Routes đã được xây dựng trong các Phase vừa qua. Bạn có thể sử dụng file này như một tài liệu hướng dẫn (checklist) để test thực tế trên hệ thống.

---

## 🌟 1. Module Cộng Đồng (Groups) - Phase 1a & 1b

### 🖥️ Frontend (Giao diện)
*Tất cả URL bên dưới giả định bạn đang sử dụng ngôn ngữ Tiếng Anh (`/en/`), bạn có thể thay bằng `/vi/` để test.*

| Tên Trang / Tính năng | Đường dẫn URL để Test | Mô tả / Cách Test |
| :--- | :--- | :--- |
| **Khám phá Nhóm (Discovery)** | `http://localhost:3000/en/groups` | Trang tổng hợp các nhóm gợi ý. <br>👉 **Test:** Xem danh sách thẻ Nhóm, thử bấm nút "Create Group" để mở Popup. |
| **Tạo Nhóm Mới (Modal)** | *(Nằm trong trang Discovery)* | Popup tạo nhóm với Tên, Quyền riêng tư (Public/Private), Ảnh bìa. |
| **Chi Tiết Nhóm (Detail)** | `http://localhost:3000/en/groups/1` | Trang hiển thị timeline bài viết của nhóm. <br>👉 **Test:** Xem UI Header nhóm với Cover, Avatar. |
| **Quản lý Thành Viên** | `http://localhost:3000/en/groups/1` <br>*(Chuyển sang Tab "Members")* | Giao diện cho Admin: Duyệt yêu cầu xin vào nhóm (Approve/Decline), xem danh sách thành viên hiện tại. |
| **Kiểm duyệt Bài Đăng** | `http://localhost:3000/en/groups/1` <br>*(Chuyển sang Tab "Pending Posts")* | Giao diện cho Admin: Nhìn thấy các bài đăng đang chờ duyệt và có các nút Approve/Decline. |

### ⚙️ Backend (API Routes) - Tiền tố: `/api/v1/groups`
- `POST /` : Tạo Group mới.
- `GET /` : Lấy danh sách toàn bộ Group.
- `GET /:id` : Xem chi tiết một Group cụ thể.
- `POST /:id/join` : Gửi yêu cầu xin tham gia Group.
- `GET /:id/members` : Lấy danh sách thành viên (Active & Pending).
- `POST /:id/members/:userId/approve` : Admin duyệt thành viên.
- `DELETE /:id/members/:userId` : Admin kích / từ chối thành viên.
- `GET /:id/pending-posts` : Xem danh sách bài đang chờ duyệt.
- `POST /:id/posts/:postId/approve` : Duyệt bài viết.
- `POST /:id/posts/:postId/reject` : Từ khóa bài viết.

---

## 🚀 2. Module Fanpage (Pages) - Phase 2a & 2b

### 🖥️ Frontend (Giao diện)

| Tên Trang / Tính năng | Đường dẫn URL để Test | Mô tả / Cách Test |
| :--- | :--- | :--- |
| **Khám phá Fanpage (Discovery)** | `http://localhost:3000/en/pages` | Trang tổng hợp các Trang bạn đang quản lý và Trang gợi ý. <br>👉 **Test:** Xem UI, thử bấm nút "Create Page" mở Popup. |
| **Tạo Fanpage Mới (Modal)** | *(Nằm trong trang Discovery)* | Popup tạo Trang doanh nghiệp, cộng đồng,... với Tên, Category. |
| **Trang Chi Tiết Fanpage** | `http://localhost:3000/en/pages/1` | Trang hiển thị bài viết, giới thiệu (About) của Fanpage. <br>👉 **Test:** Kiểm tra nút Follow, Tích xanh (Verified). |
| **Trang Hộp Thư & Cài Đặt (Inbox)**| `http://localhost:3000/en/pages/1/inbox` | Giao diện Hộp thư nhắn tin dành cho Admin. <br>👉 **Test 1:** Xem UI Chat & Thông tin người dùng. <br>👉 **Test 2:** Chuyển sang Tab "Settings" để cấu hình bật/tắt Auto-Reply, Welcome Message, và thiết lập FAQ. |
| **Chuyển Tư Cách (Actor Switcher)** | Mọi nơi (Trên **NavBar**) | 👉 **Test:** Nhìn lên thanh điều hướng trên cùng, tìm **Icon Hình 2 mũi tên lặp (Repeat)** ngay cạnh nút Cài đặt. Bấm vào để xổ ra danh sách "Tương tác dưới tư cách" Cá nhân hay Fanpage. |

### ⚙️ Backend (API Routes) - Tiền tố: `/api/v1/pages`
- `POST /` : Tạo Fanpage mới.
- `GET /` : Lấy danh sách Fanpage.
- `GET /:id` : Lấy thông tin chi tiết Fanpage.
- `POST /:id/follow` : Theo dõi Fanpage.
- `DELETE /:id/follow` : Hủy theo dõi Fanpage.
- `PUT /:id/auto-reply` : Cập nhật thiết lập trả lời tự động (Lưu Welcome Message và FAQ Data).
- `POST /:id/message` : Khách hàng nhắn tin vào Fanpage (API sẽ tự động phản hồi theo kịch bản FAQ).

---

## 💡 Hướng dẫn Cách Test UI Tổng Quan

1. Mở trang `http://localhost:3000/en/groups`, kiểm tra xem giao diện có hiển thị thẻ Group nào không, click vào Group và kiểm tra các tab.
2. Mở trang `http://localhost:3000/en/pages`, kiểm tra tương tự với Fanpage.
3. Chú ý thanh điều hướng trên cùng (**NavBar**) để kiểm tra tính năng **Actor Switcher** mới.
4. Truy cập URL trực tiếp của Inbox Page: `http://localhost:3000/en/pages/1/inbox` để trải nghiệm Form cấu hình Auto-Reply cực kỳ mượt mà.
