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

## [2026-07-09 16:31] - Lỗi mock evaluate7CardHand trong unit test poker-showdown.manager.spec.ts

- **Type**: Process
- **Severity**: Low
- **File**: `BE/src/v1/engines/poker-showdown.manager.spec.ts:100`
- **Agent**: Antigravity Orchestrator
- **Root Cause**: Trong unit test `[PL-001] So bài phân định thắng thua: Sảnh > Hai Đôi`, mock `evaluate7CardHand` trả về cùng điểm số (5000) cho cả 2 người chơi dẫn đến kết quả hòa (Split Pot) và có 2 người chiến thắng thay vì chỉ 1 người chiến thắng như assertion mong đợi.
- **Error Message**: 
  ```
  Expected: 1
  Received: 2
  ```
- **Fix Applied**: Sử dụng `.mockReturnValueOnce` để trả về điểm số phân cấp cho từng ghế (5000 cho Straight, 3000 cho Two Pairs), đảm bảo kết quả so bài phân định rõ thắng thua.
- **Prevention**: Tránh sử dụng mock tĩnh cố định một giá trị trả về cho nhiều lần gọi liên tiếp nếu bài kiểm tra yêu cầu kết quả phân loại khác biệt giữa các lần gọi.
- **Status**: Fixed

---

## [2026-07-09 17:45] - Lỗi vi phạm quy tắc React Hooks (Rule of Hooks) trong component Seat.tsx

- **Type**: Syntax/Runtime (React Hook Violation)
- **Severity**: High
- **File**: `FE/app/poker-game/table/[id]/components/table/Seat.tsx`
- **Agent**: Antigravity Specialist
- **Root Cause**: Khai báo các hook như `useAnimationRegistry`, `useRef`, và `useEffect` ở phía dưới một khối lệnh trả về sớm (`if (!player) return ...`). Điều này vi phạm quy tắc cơ bản của React Hooks: Hooks không được gọi tùy biến hoặc gọi sau một câu lệnh return có điều kiện.
- **Error Message**: 
  ```
  React Hook "useAnimationRegistry" is called conditionally. React Hooks must be called in the exact same order in every component render.
  ```
- **Fix Applied**: Di chuyển toàn bộ các khai báo React Hook lên phía trên cùng của component `Seat`, trước khối lệnh trả về sớm đầu tiên.
- **Prevention**: Luôn khai báo tất cả các React Hook ở phần đầu của functional component, không rẽ nhánh hay đặt sau lệnh `return`.
- **Status**: Fixed

---

## [2026-07-09 18:05] - Lỗi rò rỉ sự kiện Socket listener (Memory Leak) trong AnimationManager.tsx

- **Type**: Memory Leak / Runtime
- **Severity**: Medium
- **File**: `FE/app/poker-game/table/[id]/components/effects/AnimationManager.tsx`
- **Agent**: Antigravity Specialist
- **Root Cause**: Đăng ký lắng nghe sự kiện `table:hand-ended` qua socket (`socket.on`) trong `useEffect` nhưng không gỡ bỏ (`socket.off`) sự kiện này trong hàm dọn dẹp cleanup của `useEffect`.
- **Fix Applied**: Thêm `socket.off("table:hand-ended", handleHandEnded)` vào trong hàm cleanup return của `useEffect`.
- **Prevention**: Đảm bảo mọi sự kiện được đăng ký (`on`, `addEventListener`) đều được gỡ bỏ tương ứng (`off`, `removeEventListener`) khi unmount hoặc cleanup.
- **Status**: Fixed

---

## [2026-07-09 18:09] - Lỗi cú pháp thiếu dấu đóng ngoặc '}' expected trong component Seat.tsx

- **Type**: Syntax
- **Severity**: Low
- **File**: `FE/app/poker-game/table/[id]/components/table/Seat.tsx`
- **Agent**: Antigravity Specialist
- **Root Cause**: Khi thay thế code để triển khai hàm so sánh `areSeatsEqual` cho `React.memo`, dấu đóng ngoặc `};` kết thúc component `Seat` gốc đã bị thay thế mất, khiến trình biên dịch bị lỗi phân tích cú pháp.
- **Error Message**: 
  ```
  Parsing error: '}' expected
  ```
- **Fix Applied**: Thêm lại dấu đóng ngoặc `};` cho component `Seat` trước khi định nghĩa hàm so sánh `areSeatsEqual`.
- **Prevention**: Cẩn thận rà soát các ký tự biên (ngoặc nhọn, ngoặc tròn) khi thực hiện các lệnh thay thế tự động.
- **Status**: Fixed

---

## [2026-07-15 10:30] - Lỗi ép kiểu UUID thành Number trong API joinSeat

- **Type**: Logic
- **Severity**: High
- **File**: `BE/src/v1/controllers/rooms.controller.ts:234`
- **Agent**: AgentGame
- **Root Cause**: Chuyển đổi UUID string thành kiểu Number (`Number(userId)`) khiến `user_id` bị nhận giá trị `NaN` khi truyền qua sự kiện socket `user_joined_seat`.
- **Fix Applied**: Thay đổi `Number(userId)` thành `userId` để giữ nguyên dạng UUID string.
- **Prevention**: Không ép kiểu sang Number đối với các trường ID dạng UUID string.
- **Status**: Fixed

---


