# Kế hoạch Nâng cấp Cursor Pagination (Toàn hệ thống Admin)

## 1. Mục tiêu
Thay thế giải pháp Offset Pagination truyền thống (`page`, `limit`) bằng **Cursor Pagination** cho toàn bộ các API lấy danh sách trên Admin Dashboard. Điều này giúp:
- **Hiệu năng cao**: Tăng tốc độ truy vấn trên các bảng dữ liệu lớn (users, transactions, audit logs).
- **Trải nghiệm mượt mà**: Không bị mất hoặc lặp dữ liệu khi danh sách thay đổi liên tục trong lúc đang lướt (infinite scroll / load more).

## 2. Kiến trúc Backend

### A. Chuẩn hóa Định dạng Cursor
- Do các bảng đang sử dụng `id` dạng UUID v4 (không có tính tuần tự thời gian), Cursor sẽ được cấu tạo bằng cách kết hợp **`created_at`** và **`id`** để đảm bảo sort chính xác và không bị sót dữ liệu khi trùng timestamp.
- **Encode**: Base64 của chuỗi `${created_at.getTime()}_${id}`.
- **Giải mã**: Backend nhận `cursor` base64, giải mã để lấy mốc thời gian và id cũ.

### B. Thay đổi logic Services
Các Service cần cập nhật: `AdminUsersService`, `AdminTablesService`, `AdminTransactionsService` và `AdminAuditLogsService` (chuẩn bị tạo).
- Thay vì dùng `.skip((page - 1) * limit)`, QueryBuilder sẽ sử dụng:
  ```typescript
  if (cursor) {
    const [time, id] = decodeCursor(cursor);
    query.andWhere(
      '(entity.created_at < :time OR (entity.created_at = :time AND entity.id < :id))',
      { time: new Date(Number(time)), id }
    );
  }
  query.orderBy('entity.created_at', 'DESC').addOrderBy('entity.id', 'DESC');
  query.take(limit);
  ```

### C. Chuẩn hóa Response API
API sẽ trả về format thống nhất:
```json
{
  "data": [...],
  "meta": {
    "next_cursor": "base64_encoded_string_or_null",
    "has_more": true
  }
}
```

## 3. Kiến trúc Frontend

### A. Giao diện bị ảnh hưởng
- `FE/app/(admin)/backstage/users/page.tsx`
- `FE/app/(admin)/backstage/tables/page.tsx`
- `FE/app/(admin)/backstage/finance/page.tsx`
- `FE/app/(admin)/backstage/audit/page.tsx` (Sẽ kết hợp thiết kế API + Cursor Pagination luôn)

### B. Logic UI
- Trạng thái: `const [items, setItems] = useState([])`, `const [cursor, setCursor] = useState(null)`, `const [hasMore, setHasMore] = useState(false)`.
- Khi `fetch(cursor)`:
  - Nếu `cursor` rỗng (lần đầu load): Replace toàn bộ data.
  - Nếu có `cursor`: Append data mới vào mảng cũ.
- Dưới cùng Table sẽ có một nút **"Tải thêm" (Load More)** nếu `has_more` là `true`. Khi ấn vào sẽ gọi hàm fetch với `next_cursor`.
- (Tùy chọn) Chuyển đổi logic Search: Search text sẽ xoá cursor về null để tìm kiếm từ đầu.

---
Vui lòng gõ **`/create`** hoặc trả lời "Đồng ý" để tôi bắt tay vào việc thực thi hàng loạt các thay đổi này trên Backend và Frontend!
