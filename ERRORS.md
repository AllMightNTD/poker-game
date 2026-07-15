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

## [2026-07-15 13:45] - Lỗi TypeError: res.header is not a function trên WebSocket Gateway do ThrottlerGuard

- **Type**: Runtime/Integration
- **Severity**: High
- **File**: `BE/src/app.module.ts`, `BE/src/v1/gateways/poker-lobby.gateway.ts`
- **Agent**: AgentGame
- **Root Cause**: `@nestjs/throttler` (ThrottlerGuard) mặc định cố gắng lấy `res.header()` từ đối tượng response của context HTTP. Khi áp dụng ThrottlerGuard global (APP_GUARD) hoặc UseGuards trực tiếp tại WebSocket Gateway, đối tượng response của context WebSocket không có hàm `header()`, gây ra crash kết nối.
- **Error Message**: 
  ```
  TypeError: res.header is not a function
      at ThrottlerGuard.handleRequest (node_modules/@nestjs/throttler/src/throttler.guard.ts:197:11)
  ```
- **Fix Applied**: Tạo `CustomThrottlerGuard` kế thừa `ThrottlerGuard` để trả về một mock response (có hàm `header: () => {}`) khi context là `'ws'`. Cập nhật `AppModule` và `PokerLobbyGateway` để dùng guard tùy chỉnh này.
- **Prevention**: Luôn sử dụng Custom Throttler Guard hỗ trợ xử lý WebSocket khi áp dụng rate limit global trong các ứng dụng NestJS có cả Rest API và WebSocket.
- **Status**: Fixed

---

## [2026-07-15 14:20] - Lỗi vòng lặp chuyển hướng (ERR_TOO_MANY_REDIRECTS) khi đăng xuất ở Frontend do trùng lặp cookie các path khác nhau

- **Type**: Logic
- **Severity**: Critical
- **File**: `FE/core/api/http-client.ts`, `FE/features/auth/hooks/use-login.ts`, `FE/features/auth/hooks/use-logout.ts`, `FE/core/providers/user-provider.tsx`
- **Agent**: AgentGame
- **Root Cause**: Khi gọi `Cookies.set` và `Cookies.remove` cho `accessToken` và `refreshToken` mà không chỉ định `{ path: "/" }`, cookie sẽ mặc định lưu cho path hiện tại (ví dụ: `/poker-game/table/123`). Khi người dùng đăng xuất, trình duyệt không thể xóa sạch cookie được lưu ở các subpath khác, khiến `proxy.ts` tiếp tục đọc được token cũ và redirect ngược lại game, trong khi API trả về 401 do token đã hủy, tạo ra vòng lặp vô hạn.
- **Error Message**: 
  ```
  ERR_TOO_MANY_REDIRECTS - Localhost redirected you too many times.
  ```
- **Fix Applied**: Bổ sung cấu hình `{ path: "/" }` cho toàn bộ các thao tác `Cookies.set` và `Cookies.remove` của `accessToken`, `refreshToken` và `admin_token`.
- **Prevention**: Luôn luôn chỉ định rõ ràng tùy chọn `{ path: "/" }` cho các cookies mang tính chất toàn cục (như Token Xác thực, Token Admin) ở cả hai hoạt động thiết lập và xóa bỏ để tránh phân mảnh cookie theo các path con của ứng dụng.
- **Status**: Fixed

## [2026-07-15 15:23] - Lỗi vòng lặp kết nối Socket vô hạn (Socket Reconnection Loop) khi JWT hết hạn gây quá tải CPU và treo Web

- **Type**: Runtime/Logic
- **Severity**: Critical
- **File**: `BE/src/v1/gateways/poker-lobby.gateway.ts`, `FE/core/providers/SocketProvider.tsx`
- **Agent**: AgentGame
- **Root Cause**: Khi JWT token hết hạn, Socket Server ngắt kết nối socket. Phía Frontend Socket client nhận được lý do ngắt kết nối `"io server disconnect"`, lập tức chạy hàm `socketInstance.connect()` để reconnect. Vì instance socket này bind cứng token cũ đã expired lúc khởi tạo component, nó tiếp tục reconnect bằng token cũ hết hạn, tạo thành vòng lặp vô hạn kết nối lại liên tục mỗi giây gây spam log và treo CPU.
- **Error Message**: 
  ```
  [Nest] ERROR [PokerLobbyGateway] SOCKET CONNECTION AUTH ERROR: jwt expired
  ```
- **Fix Applied**: 
  1. Ở Backend: Tách lỗi `TokenExpiredError`, gửi sự kiện cụ thể `'auth:error'` với code `'JWT_EXPIRED'` thay vì event `'error'` chung chung, chuyển mức log thành `warn` ngắn gọn để tránh ngập log và ngắt kết nối dứt khoát bằng `client.disconnect(true)`.
  2. Ở Frontend: Chuyển cấu hình `auth` thành hàm callback để luôn đọc `accessToken` mới nhất từ cookie trước mỗi lần reconnect. Giới hạn số lần tự động reconnect (`reconnectionAttempts: 10`) và delay 5s giữa các lần thử. Khi nhận event `'auth:error'`, ngắt kết nối dứt khoát không reconnect nữa.
- **Prevention**: Luôn sử dụng auth callback thay vì object tĩnh khi định nghĩa các tham số auth cho WebSocket client để đảm bảo lấy được token mới nhất sau khi refresh. Đặt giới hạn reconnection attempts và delay thích hợp cho socket client.
- **Status**: Fixed

---
