# KẾ HOẠCH TỐI ƯU HÓA & NÂNG CẤP HỆ THỐNG ANIMATION BÀN CHƠI POKER

> **Mã số kế hoạch**: PLAN-poker-animation-optimization  
> **Trạng thái**: 🟡 **DRAFT / READY FOR REVIEW**  
> **Đối tượng tác động**: Bàn chơi Poker (`FE/app/poker-game/table/[id]/`)  

---

## 🎯 1. Mục tiêu (Goals)
1. **Tối ưu hóa hiệu năng (High FPS)**: Đạt mức 60 FPS ổn định trên cả các thiết bị di động tầm trung bằng cách giảm thiểu re-render React trong lúc diễn ra hiệu ứng chuyển động (chip bay, bài bay).
2. **Bổ sung hiệu ứng cốt lõi**:
   - **Dealing Cards**: Chia bài từ dealer button/center bay đến các ghế khi bắt đầu ván/street mới.
   - **Betting Chips**: Chip bay từ avatar ghế ra khu vực cá cược (Bet Area) khi người chơi Bet/Call.
   - **Muck/Fold**: Bài úp lại và bay về Center (Muck Pile) rồi biến mất khi Fold.
   - **Showdown (Refactor)**: Thay thế Framer Motion ở các bước gom chip (`COLLECT_POT_TO_CENTER`) và phát chip (`FLY_CHIPS_TO_WINNERS`) bằng engine tối ưu.
3. **Tính đồng bộ thời gian thực (Timeline Sync)**: Animation phải khớp nối hoàn hảo với các sự kiện Socket thời gian thực gửi từ Backend mà không gây giật lag hoặc chồng chéo trạng thái.

---

## 🏗️ 2. Kiến trúc Đề xuất (Proposed Architecture - Hybrid WAAPI)

Chúng ta sẽ xây dựng một **Animation Layer** (sử dụng Web Animations API - WAAPI kết hợp DOM nhẹ) hoạt động song song với React:

```
[React Table Component] --(Đăng ký refs/toạ độ)--> [Animation Registry Context]
                                                            |
[Socket.io Events] ---------(Trigger Event)---------------> [Animation Engine Hook]
                                                            |
                                                   [Vẽ/Bay Element trên DOM]
                                                   (GPU Accelerated Layers)
```

- **Animation Registry Context**: Lưu trữ tọa độ ($x, y$) thực tế của các Seat, Center, và Bet Areas thông qua các Ref đã đăng ký.
- **Animation Layer Container**: Một div rỗng phủ tuyệt đối (`absolute inset-0 pointer-events-none z-40`) dùng để làm parent node chứa các element bay tạm thời.
- **Web Animations API (WAAPI)**: Sử dụng lệnh `.animate([...keyframes], { duration, easing })` thay thế cho Framer Motion để đảm bảo hiệu ứng chạy trực tiếp trên GPU Composite Layer, không kích hoạt vòng lặp render của React.

---

## 📅 3. Phân Kỳ Triển Khai (Phase-by-Phase Breakdown)

### 🟢 Phase 1: Xây dựng Animation Registry & Setup Container
- **Mục tiêu**: Lấy được chính xác tọa độ của các Seat và Center trong mọi độ phân giải màn hình (Responsive).
- **Các bước thực hiện**:
  1. Tạo `AnimationRegistryContext` và hook `useAnimationRegistry`.
  2. Tích hợp đăng ký ref vào component `SeatPanel` và `HeroSeat`.
  3. Tạo component `AnimationLayerContainer` đè lên bàn chơi.

### 🟡 Phase 2: Triển khai các Hiệu ứng Cơ bản (Betting, Dealing, Fold)
- **Mục tiêu**: Xây dựng core engine bay bài và bay chip bằng Web Animations API.
- **Các bước thực hiện**:
  1. **Dealing Animation**: 
     - Bay các lá bài ảo từ Center đến vị trí Seat tương ứng.
     - Lật bài (Flip card) nếu đó là HeroSeat (bài tẩy của người chơi hiện tại).
  2. **Betting Animation**:
     - Bay cụm chip ảo từ Avatar của Seat ra Bet Area tương ứng của Seat đó.
  3. **Fold Animation**:
     - Bay bài tẩy của Seat úp lại và bay về Center, mờ dần rồi biến mất.

### 🔵 Phase 3: Refactor Showdown Animations
- **Mục tiêu**: Loại bỏ Framer Motion cho các hiệu ứng Gom chip / Phát chip trong `AnimationManager.tsx`.
- **Các bước thực hiện**:
  1. Refactor `PotCollector`: Chip bay từ các Bet Area về Center (gom pot) khi kết thúc street.
  2. Refactor `FlyingChips`: Phát các cụm chip từ Center bay về phía các Seat của Winners.
  3. Tích hợp âm thanh (Sound FX) tương ứng với từng giai đoạn bay chip/bài (tùy chọn).

### 🔴 Phase 4: Đồng bộ hóa Timeline & Socket Events
- **Mục tiêu**: Đảm bảo game stage không bị update đột ngột trước khi animation kết thúc.
- **Các bước thực hiện**:
  1. Sử dụng hệ thống Queue của `useAnimationTimeline` để trì hoãn việc update state của React cho đến khi các animation tương ứng hoàn thành.
  2. Lắng nghe các event socket nhỏ như `table:player-acted` (chạy bet animation), `table:street-advanced` (chạy dealing community cards animation).

---

## 🧪 4. Kế hoạch Kiểm thử & Xác minh (Verification Plan)

### 1. Kiểm thử Tự động (Automated Tests)
- Viết unit test cho `useAnimationTimeline` để kiểm tra hàng đợi (queue) các bước animation hoạt động đúng thứ tự và thời lượng.
- Viết unit test kiểm tra hàm tính toán tọa độ tương đối từ ref registry hoạt động chính xác trong các tỷ lệ khung hình khác nhau.

### 2. Kiểm thử Thủ công (Manual Test Gates)
- **Gate 1 (Hiệu năng FPS)**: Mở DevTools -> Performance monitor. Đảm bảo FPS duy trì ở mức **55-60 FPS** khi chạy animation gom pot / phát chip cho nhiều người thắng cùng lúc.
- **Gate 2 (Responsive)**: Co giãn kích thước trình duyệt hoặc chuyển đổi giả lập thiết bị di động trong Chrome DevTools. Đảm bảo bài và chip bay trúng đích (trọng tâm của các Seat) và không bị lệch toạ độ.
- **Gate 3 (Đồng bộ)**: Giả lập mạng chậm (Network throttling). Đảm bảo giao diện không bị giật hoặc đè hoạt ảnh lên nhau.

---

> [!WARNING]
> **Rủi ro lớn nhất**: Sự thay đổi tọa độ của các Seat khi kích thước màn hình resize (ví dụ xoay ngang màn hình điện thoại).
> **Giải pháp**: Lớp Registry cần lắng nghe sự kiện `resize` của window để cập nhật lại tọa độ tham chiếu động trong context.
