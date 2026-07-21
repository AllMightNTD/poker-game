# PLAN: Refactor Clubs API to React Query

## 🎯 1. Mục tiêu (Clear Goals)
- Chuyển đổi toàn bộ logic gọi API trong chức năng `/clubs` sang sử dụng thư viện **Tanstack React Query**.
- Xóa bỏ việc sử dụng `useEffect` và `useState` để quản lý trạng thái tải (loading), dữ liệu (data), và lỗi (error) thủ công.
- Áp dụng `useMutation` cho các hành động thay đổi dữ liệu (tạo, tham gia, sửa, xóa) và sử dụng cơ chế `invalidateQueries` để tự động làm mới giao diện thay vì phải truyền callback `fetchData` xuống các Component con.

## 🔗 2. Phân tích Phụ thuộc (Dependency Chains)
Các file cần thực hiện thay đổi bao gồm:

**Tầng API Hooks (Tạo mới):**
- Tạo file mới `FE/features/clubs/hooks/useClubs.ts` để gom nhóm tất cả các logic gọi React Query.

**Tầng Pages (Sử dụng useQuery):**
- `FE/app/clubs/page.tsx`: Lấy danh sách Clubs của tôi.
- `FE/app/clubs/[id]/page.tsx`: Lấy chi tiết Club, danh sách Bàn chơi (Tables) và Thống kê (Stats).
- `FE/app/clubs/[id]/members/page.tsx`: Lấy danh sách thành viên Club.

**Tầng Modals (Sử dụng useMutation):**
- `FE/features/clubs/components/ClubCreateModal.tsx`: Mutation tạo club.
- `FE/features/clubs/components/ClubJoinModal.tsx`: Mutation tham gia club.
- `FE/features/clubs/components/TransferCreditModal.tsx`: Mutation chuyển Credit.
- `FE/features/clubs/components/ClubCreateTableModal.tsx`: Mutation tạo bàn chơi mới.

## 🛠️ 3. Các bước triển khai (Phase-by-Phase Breakdown)

### Phase 1: Xây dựng Custom Hooks (`useClubs.ts`)
- Tạo file `FE/features/clubs/hooks/useClubs.ts`.
- Định nghĩa các Query Keys (`clubs`, `club-detail`, `club-tables`, v.v.).
- Viết các hooks `useQuery`: `useMyClubs`, `useClubDetail`, `useClubTables`, `useClubStats`.
- Viết các hooks `useMutation`: `useCreateClub`, `useJoinClub`, `useLeaveClub`, `useUpdateRole`, `useRemoveMember`, `useTransferCredit`, `useCreateTable`.
- Cấu hình tự động `invalidateQueries` tương ứng bên trong các hàm `onSuccess` của mutation.

### Phase 2: Refactor các trang (Pages)
- **`/clubs/page.tsx`**: Xóa `fetchClubs`, `isLoading`, `clubs`, thay thế bằng `const { data: clubs, isLoading } = useMyClubs()`.
- **`/clubs/[id]/page.tsx`**: Dùng `useQueries` hoặc gọi nhiều hook `useQuery` song song cho Detail, Tables và Stats. Tổ hợp lại state `clubData`. Xử lý hàm `handleLeaveClub` với mutation `useLeaveClub`.
- **`/clubs/[id]/members/page.tsx`**: Sử dụng `useClubDetail` (cache query sẽ tự chia sẻ từ page tổng). Dùng mutation cho các action `handleRoleChange`, `handleKickMember`.

### Phase 3: Refactor các Modals
- Trong mỗi Modal (như `ClubCreateModal`), loại bỏ prop `onSuccess` và thao tác update local state thủ công.
- Thay thế API call bằng `useMutation` đã định nghĩa.
- Đóng Modal khi `mutation.isSuccess` là `true`.

## 🧪 4. Kế hoạch Kiểm tra (Verification Plan)
- **Kiểm tra Caching**: Đảm bảo điều hướng từ danh sách vào chi tiết Club và quay lại không có độ trễ do API gọi lại.
- **Kiểm tra Mutation**: Tạo Club mới, chuyển Credit hoặc kick Member -> dữ liệu phải tự động update mà không cần F5 trình duyệt nhờ `invalidateQueries`.
- **Kiểm tra Loading State**: UI phải giữ được các biểu tượng loading chính xác như hiện tại (không bị hỏng bố cục).

> [!NOTE]
> Yêu cầu hệ thống đã có sẵn `QueryClientProvider` bọc ở layout gốc. Nếu chưa có, cần bổ sung bước config React Query.
