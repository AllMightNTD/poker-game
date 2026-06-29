# Implementation Plan: Phase 1 (Group) & Phase 2 (Fanpage)

Tài liệu này phác thảo kế hoạch triển khai chi tiết cho Phase 1 và Phase 2 của hệ thống. Kiến trúc dự kiến:
- **Backend (BE):** NestJS, TypeORM (MySQL)
- **Frontend (FE):** Next.js, React, TailwindCSS, React Query

---

## 🛠️ PHASE 1: GROUP MODULE

### 1. Backend Implementation (NestJS)

#### a. Entities & Database
- Xây dựng/Cập nhật các entities trong `BE/src/v1/entities/`:
  - `Group` (`group.entity.ts`): id, name, privacy, cover_url, avatar_url, description...
  - `GroupMember` (`group-member.entity.ts`): group_id, user_id, role (owner, admin, moderator, member), status (pending, approved, banned).
  - `GroupRule` (`group-rule.entity.ts`): title, description.
  - Cập nhật `Post` entity (`post.entity.ts`) để support trường `group_id`.

#### b. API Endpoints (`/api/v1/groups`)
- **Group Management:**
  - `POST /` - Tạo group mới.
  - `GET /` - Lấy danh sách group (có phân trang, search, filter).
  - `GET /:id` - Lấy chi tiết group.
  - `PUT /:id` - Cập nhật thông tin group.
  - `DELETE /:id` - Xóa/Archive group.
- **Member Management:**
  - `POST /:id/join` - Xin vào nhóm.
  - `POST /:id/members/:userId/approve` - Duyệt thành viên.
  - `DELETE /:id/members/:userId` - Xóa/Ban thành viên.
  - `PUT /:id/members/:userId/role` - Phân quyền thành viên.
- **Group Content & Moderation:**
  - `GET /:id/posts` - Lấy feed bài đăng của group.
  - `GET /:id/pending-posts` - Lấy danh sách bài đăng chờ duyệt (dành cho Admin).
  - `POST /:id/posts/:postId/approve` - Duyệt bài đăng.
  - `POST /:id/posts/:postId/reject` - Từ chối bài đăng.

#### c. Services & Use Cases
- Triển khai `GroupService` xử lý logic:
  - Kiểm tra quyền (Permissions) khi user edit group hoặc duyệt member.
  - Emit real-time events qua Websocket (thông báo có bài viết mới, thông báo được duyệt vào nhóm).

### 2. Frontend Implementation (Next.js)

#### a. Cấu trúc thư mục Routing (App Router / Pages Router)
- `/groups` - Trang khám phá các nhóm (Group Discovery).
- `/groups/:id` - Trang chủ của nhóm (Group Feed).
- `/groups/:id/about` - Giới thiệu và luật nhóm.
- `/groups/:id/members` - Danh sách thành viên.
- `/groups/:id/settings` - Trang quản lý nhóm (dành cho Admin).

#### b. UI Components (`FE/components/group/`)
- `GroupCard.tsx`: Hiển thị tóm tắt thông tin group ngoài trang Discovery.
- `GroupHeader.tsx`: Cover ảnh, Avatar, Tên nhóm, nút Join/Leave.
- `GroupNav.tsx`: Tab chuyển đổi giữa Feed, About, Members, Pending Posts.
- `GroupMembersList.tsx`: Hiển thị và quản lý thành viên (có dropdown phân quyền).
- `GroupPendingPosts.tsx`: Hiển thị danh sách bài viết chờ duyệt cho Admin.
- `CreateGroupModal.tsx`: Popup tạo nhóm mới.

**Mockup Giao diện Group Feed (Dự kiến):**
![Group Feed Mockup](/home/dev_ntd/.gemini/antigravity/brain/1ef6e5f4-ac76-444b-8dfa-59adc4a5e8b5/group_feed_mockup_1782100134155.png)

#### c. Tích hợp (Integration)
- Sử dụng React Query (`useQuery`, `useMutation`) để fetch data từ BE.
- Cập nhật component tạo Post (`CreatePost.tsx`) để hỗ trợ đăng bài vào Group.

---

## 🛠️ PHASE 2: FANPAGE MODULE

### 1. Backend Implementation (NestJS)

#### a. Entities & Database
- Xây dựng các entities:
  - `Page` (`page.entity.ts`): name, username, category, about, avatar_url, cover_url, follower_count...
  - `PageAdmin` (`page-admin.entity.ts`): page_id, user_id, role.
  - Cập nhật `Follow` entity để hỗ trợ follow Page (target_type = 'page').
  - Cập nhật `Post` entity hỗ trợ trường `page_id`.

#### b. API Endpoints (`/api/v1/pages`)
- **Page Management:**
  - `POST /` - Tạo Fanpage.
  - `GET /` - Danh sách Fanpage đang quản lý / theo dõi.
  - `GET /:username` - Lấy thông tin page.
  - `PUT /:id` - Cập nhật thông tin.
- **Roles & Followers:**
  - `POST /:id/follow` - Theo dõi / Bỏ theo dõi.
  - `POST /:id/admins` - Thêm/Sửa quyền admin.
- **Page Content:**
  - `GET /:id/posts` - Lấy bài viết của Fanpage.
- **Page Inbox & Auto-reply:**
  - `GET /:id/conversations` - Quản lý hộp thư của Fanpage.
  - `POST /:id/auto-reply-settings` - Cấu hình nội dung trả lời tự động và FAQ.

#### c. Services & Use Cases
- Xử lý logic đăng bài dưới tư cách Fanpage (Actor Context): Khi user là admin đăng bài vào page, `user_id` có thể null và `page_id` được gán, hoặc dùng concept `actor_id`.
- Tích hợp hệ thống Analytics đơn giản (tăng/giảm followers).

### 2. Frontend Implementation (Next.js)

#### a. Cấu trúc thư mục Routing
- `/pages` - Khám phá Fanpage (Pages you may like).
- `/pages/:username` - Timeline của Fanpage.
- `/pages/:username/about` - Thông tin chi tiết (Business info).
- `/pages/:username/settings` - Quản lý trang (cập nhật thông tin, cấp quyền).

#### b. UI Components (`FE/components/page/`)
- `PageHeader.tsx`: Giao diện bìa trang, thông tin liên hệ nhanh, nút Follow/Message.
- `PageAdminDashboard.tsx`: Tổng quan về thông số trang dành cho Admin.
- `PageRoleManager.tsx`: Giao diện mời và cấp quyền quản trị.
- `PageInbox.tsx`: Giao diện quản lý tin nhắn và thiết lập Auto-reply/FAQ.
- Tích hợp switch account: Nút chuyển đổi giữa tư cách User và tư cách Fanpage ở `NavBar.tsx` hoặc Menu.

**Mockup Giao diện Fanpage Timeline (Dự kiến):**
![Fanpage Timeline Mockup](/home/dev_ntd/.gemini/antigravity/brain/1ef6e5f4-ac76-444b-8dfa-59adc4a5e8b5/page_timeline_mockup_1782100145585.png)

**Mockup Giao diện Page Inbox & Auto-reply (Dự kiến):**
![Page Inbox Mockup](/home/dev_ntd/.gemini/antigravity/brain/1ef6e5f4-ac76-444b-8dfa-59adc4a5e8b5/page_inbox_mockup_1782100155736.png)

---

## 🚀 ROADMAP TRIỂN KHAI ĐỀ XUẤT

**Tuần 1-2: Core Groups (Phase 1a)**
- BE: CRUD Group, Group Rules, Cập nhật hệ thống Post cho Group.
- FE: Giao diện tạo Group, trang chi tiết Group (Header, Feed).

**Tuần 3: Group Members & Moderation (Phase 1b)**
- BE: Logic join group (Public/Private), phân quyền member. Logic kiểm duyệt bài đăng (Pending, Approve, Reject).
- FE: Giao diện quản lý member, pending request. Giao diện kiểm duyệt bài viết cho Admin.

**Tuần 4-5: Core Fanpage (Phase 2a)**
- BE: CRUD Fanpage, hệ thống Follow. Actor switching (đăng bài tư cách page).
- FE: Giao diện tạo Page, trang Page Timeline. Switch tư cách ở NavBar.

**Tuần 6: Page Settings, Inbox & Analytics (Phase 2b)**
- BE: Phân quyền admin cho Page, API thống kê cơ bản. Logic Auto-reply cho Inbox.
- FE: Dashboard quản trị Page, cấu hình Inbox/Auto-reply.

---
*Vui lòng xem qua và cho biết bạn muốn điều chỉnh phần nào trước khi chúng ta bắt tay vào code chi tiết.*
