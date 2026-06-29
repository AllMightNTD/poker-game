# Kế Hoạch Triển Khai MVP (Mạng Xã Hội)

Tài liệu này vạch ra các bước thực hiện chi tiết cho các tính năng "Bắt trend" của mạng xã hội, tuân thủ nghiêm ngặt **SOLID Clean Architecture (BE)** và cấu trúc **i18n Multi-Language (FE)**.

---

## Tính năng 1: Profile Music (Nhạc nền trang cá nhân)
Tận dụng `zingmp3-api` để lấy nhạc và cho phép người dùng gắn 1 bài hát làm nhạc nền cho trang cá nhân.

### 1.1. Backend (NestJS - SOLID)
Thực hiện tại Domain: `src/domains/users/` (hoặc `profiles/`).

*   **Domain Layer:**
    *   Cập nhật `user.domain-entity.ts` (hoặc `profile.domain-entity.ts`) thêm thuộc tính `profileMusicId: string` (Lưu ID bài hát từ ZingMP3).
    *   Cập nhật Repository Interface `user.repository.interface.ts` thêm method `updateProfileMusic(userId: string, musicId: string)`.
*   **Application Layer:**
    *   Tạo `UpdateProfileMusicUseCase` nhận vào `userId` và `musicId`.
    *   Sử dụng service gọi ZingMP3 API để validate bài hát có tồn tại không trước khi lưu.
*   **Infrastructure Layer:**
    *   Cập nhật bảng `profiles` trong DB (thêm cột `profile_music_id`). Cần viết 1 file Migration.
    *   Cập nhật `typeorm-user.repository.ts` để map field này xuống DB.
*   **Presenter Layer:**
    *   Trong `user.controller.ts` (hoặc `profile.controller.ts`), tạo API `PUT /api/v1/profiles/me/music`.

### 1.2. Frontend (Next.js - i18n)
*   **Dịch thuật (`messages/en.json`, `ja.json`, `vi.json`):** Thêm block:
    ```json
    "profile": {
      "music": {
        "title": "Profile Music",
        "select": "Choose a song",
        "playing": "Now playing"
      }
    }
    ```
*   **UI Components (`features/profile/components/`):**
    *   Tạo `ProfileMusicPlayer.tsx`: Component nhỏ hình đĩa than xoay góc phải màn hình, tự động phát nhạc khi vào Profile người khác (nếu trình duyệt cho phép, hoặc cần 1 click nhỏ).
    *   Tạo `ProfileMusicModal.tsx`: Popup cho phép search bài hát (gọi ZingMP3 API từ BE) để cài làm nhạc nền.
*   **API & Hooks (`features/profile/hooks/`):**
    *   Tạo `useUpdateProfileMusic` sử dụng SWR/React Query gọi API Update.

---

## Tính năng 2: Custom Reactions & Voice Comments
Người dùng có thể comment bằng giọng nói (Voice Note) và thả reaction bằng Emoji bất kỳ.

### 2.1. Backend (NestJS - SOLID)
Thực hiện tại Domain: `src/domains/comments/` và `src/domains/reactions/`.

*   **Domain Layer:**
    *   Trong `comment.domain-entity.ts`: Đảm bảo `type` có hỗ trợ `VOICE` và trường `mediaUrl` lưu URL file ghi âm.
    *   Trong `reaction.domain-entity.ts`: Trường `type` hiện đang là Enum (`like, love, ...`), cần chuyển thành `emoji: string` để lưu bất kỳ mã Unicode Emoji nào.
*   **Application Layer:**
    *   Tạo `CreateVoiceCommentUseCase`: Nhận file âm thanh, upload qua AWS S3 (dùng `aws-sdk/client-s3`), sau đó lưu URL vào DB.
    *   Tạo `ReactToTargetUseCase`: Thay vì check Enum, validate Emoji hợp lệ (regex) trước khi lưu.
*   **Infrastructure Layer:**
    *   Migration: Cập nhật table `reactions`, xóa enum `type`, đổi thành `emoji VARCHAR(50)`.
    *   Migration: Cập nhật table `comments` nếu chưa hỗ trợ `type = 'voice'`.
*   **Presenter Layer:**
    *   Tạo `POST /api/v1/comments/voice` (dùng Interceptor upload file - Multer).
    *   Cập nhật `POST /api/v1/reactions` nhận `emoji` thay vì `type`.

### 2.2. Frontend (Next.js - i18n)
*   **Dịch thuật:**
    ```json
    "comments": {
      "holdToRecord": "Hold to record",
      "releaseToSend": "Release to send",
      "recording": "Recording..."
    }
    ```
*   **UI Components (`features/comments/components/`):**
    *   Tạo `VoiceRecorderInput.tsx`: Giao diện ấn giữ để ghi âm dùng Web Audio API (`MediaRecorder`).
    *   Tạo `VoiceCommentPlayer.tsx`: Component hiển thị sóng âm (Waveform), dùng thư viện như `wavesurfer.js`.
*   **UI Components (`features/reactions/components/`):**
    *   Tạo `EmojiPickerPopup.tsx`: Tích hợp thư viện `emoji-mart` để cho phép chọn hàng nghìn Emoji khác nhau thay vì 6 Emoji mặc định.
*   **API & Hooks:**
    *   `useUploadVoiceComment`: Gửi FormData (chứa file Blob) lên BE.

---

## Tính năng 3: Trải nghiệm Đăng bài Đa phương tiện (Rich Media Posts)
Tối ưu đăng bài mượt mà, hỗ trợ hình ảnh, video với tốc độ cao.

### 3.1. Backend (NestJS - SOLID)
Thực hiện tại Domain: `src/domains/posts/`.

*   **Domain & Application Layer:**
    *   `CreatePostUseCase`: Cần hỗ trợ tạo `Post` và `PostMedia` trong **cùng 1 Database Transaction** (nếu thất bại thì rollback toàn bộ).
    *   Xử lý Upload đa luồng: Các file lớn nên được upload trực tiếp từ Frontend lên S3 thông qua `Presigned URL` để giảm tải cho Backend.
    *   Tạo `GeneratePresignedUrlUseCase` trả về URL S3 bảo mật cho FE upload trực tiếp.
*   **Presenter Layer:**
    *   `GET /api/v1/posts/upload-url`: Sinh S3 Presigned URL.
    *   `POST /api/v1/posts`: Nhận thông tin bài viết và mảng Media (đã upload lên S3).

### 3.2. Frontend (Next.js - i18n)
*   **Dịch thuật:**
    ```json
    "post": {
      "createTitle": "Create a new post",
      "uploading": "Uploading media ({progress}%)",
      "dragDrop": "Drag and drop images/video here"
    }
    ```
*   **UI Components (`features/feed/components/`):**
    *   Tạo `PostComposer.tsx`: Input viết bài mở rộng mượt mà, có hỗ trợ kéo thả ảnh/video (Drag & Drop).
    *   Tạo `MediaPreviewGrid.tsx`: Hiển thị ảnh đang chọn theo dạng lưới (1 ảnh to, 2 ảnh ngang, lưới 4 ảnh...) giống Facebook.
*   **Xử lý Logic (`features/feed/hooks/`):**
    *   Áp dụng thuật toán **Optimistic UI Update**: Ngay khi user ấn "Đăng", bài viết hiển thị ngay lập tức trên Feed dạng "Đang tải", background ngầm upload file lên S3, lấy URL về rồi mới gọi API tạo Post. Nếu lỗi thì hiển thị nút "Thử lại".

---

## Quy trình làm việc chung (Workflow)
1. **BE (NestJS):** Xây dựng các Use Cases, Interfaces, viết file Migration cập nhật DB trước tiên. Test độc lập qua Postman/Swagger.
2. **FE (Next.js):** Cập nhật file i18n JSON của cả 3 ngôn ngữ. Dựng UI tĩnh bằng TailwindCSS.
3. **Integration:** Gắn nối API (thông qua React Query hoặc SWR), xử lý Loading State, Error Handling, và Toast Notifications.
4. **Testing:** Đảm bảo test toàn diện về Multi-Language (Hreflang, Router) và nguyên tắc Dependencies Injection của SOLID.
