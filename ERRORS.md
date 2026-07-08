# ERRORS.md - Nhật ký Lỗi và Học tập tự động

## [2026-07-08 16:07] - Lỗi Type Check trong component Seat.tsx sau khi refactor SeatPanel/SeatCards

- **Type**: Process
- **Severity**: Medium
- **File**: `FE/app/poker-game/table/[id]/components/table/Seat.tsx:262,295`
- **Agent**: Antigravity Orchestrator
- **Root Cause**: Khi xóa các prop không dùng `isHero` trong `SeatPanel.tsx` và `gameStage` trong `SeatCards.tsx` ở Phase 1, các component cha gọi chúng (ở đây là `Seat.tsx`) vẫn truyền các prop này vào dẫn tới lỗi build TypeScript do không khớp kiểu dữ liệu.
- **Error Message**: 
  ```
  Type error: Type '{ children: Element[]; isActive: boolean; isHero: boolean; isFolded: boolean; isSittingOut: boolean; }' is not assignable to type 'IntrinsicAttributes & SeatPanelProps'.
    Property 'isHero' does not exist on type 'IntrinsicAttributes & SeatPanelProps'.
  ```
- **Fix Applied**: Loại bỏ các prop truyền thừa (`isHero` và `gameStage`) tại nơi gọi các component này trong `Seat.tsx`.
- **Prevention**: Khi thực hiện xóa/dọn dẹp các prop không sử dụng ở một component con, luôn thực hiện tìm kiếm toàn cục trong codebase để kiểm tra xem component đó có đang được sử dụng ở nơi khác hay không và cập nhật đồng bộ.
- **Status**: Fixed

---
