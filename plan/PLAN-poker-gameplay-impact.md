# PLAN-poker-gameplay-impact

## 🟢 PHASE 1: Tổng quan và Phạm vi (Scope)
Kế hoạch này phân tích sự ảnh hưởng của việc "Cô lập Poker Game" (xóa bỏ toàn bộ các tính năng Mạng xã hội như Friend, Feed, Post, Group...) đối với trải nghiệm và luồng chơi (gameplay flow) của người chơi bên trong phòng Poker. Đồng thời, đề xuất các thiết kế thay thế để duy trì sự tương tác mà vẫn giữ được sự chuyên nghiệp chuẩn Casino (CG Poker Standard).

### Sự thay đổi cốt lõi:
Người chơi không còn bị phân tâm bởi các thông báo mạng xã hội. Phòng Poker giờ đây là một **"ốc đảo độc lập"**. Sự tương tác giữa các người chơi phải được thiết kế lại để gói gọn hoàn toàn bên trong không gian của bàn chơi.

---

## 🟡 PHASE 2: Tác động & Thiết kế đối ứng (Blueprint)

### 1. Tương tác xã hội trong bàn (In-Room Social Dynamics)
*Trạng thái cũ*: Người chơi có thể nhắn tin riêng (DM), kết bạn, xem trang cá nhân của nhau.
*Thiết kế mới*:
- **Table Chat (Kênh chat bàn)**: Sẽ là nơi giao tiếp duy nhất. Hỗ trợ Text, Quick Chat (các câu nói chuẩn bị sẵn như "Nice hand", "Nhường em đi đại ca"), và Animated Emojis.
- **Throwable Items (Vật phẩm tương tác)**: Vì không thể "chọc" hay "thả tim" như mạng xã hội, ta bổ sung tính năng Ném vật phẩm (Cà chua, Bia, Hoa hồng, Bom nước) vào Avatar của người chơi khác. Đây là tính năng rất phổ biến ở các app Poker (như GGPoker, Zynga) giúp tăng tính giải trí và xả stress.

### 2. Định danh & Bảng thông kê người chơi (Player Identity & Poker HUD)
*Trạng thái cũ*: Click vào Avatar sẽ chuyển hướng sang trang Profile mạng xã hội.
*Thiết kế mới*:
- **Không chuyển trang (No Redirect)**: Click vào Avatar sẽ mở ra một **Poker HUD (Heads-up Display) Popup** ngay tại bàn chơi.
- **Thông tin hiển thị trong HUD**:
  - Tên, Avatar, VIP Level.
  - Các chỉ số Poker chuyên sâu: **VPIP** (Tỉ lệ tự nguyện bỏ tiền vào Pot), **PFR** (Tỉ lệ Raise trước Flop), **Total Hands** (Tổng số ván đã chơi), **Biggest Win** (Ván thắng lớn nhất).
  - Tính năng: Mute Chat (Chặn chat người này), Note (Ghi chú về lối chơi của đối thủ, lưu cục bộ).

### 3. Tìm phòng và Mời người chơi (Matchmaking & Invitation)
*Trạng thái cũ*: Mời chơi thông qua danh sách bạn bè mạng xã hội, Share bài viết.
*Thiết kế mới*:
- **Room ID & Password**: Hệ thống sảnh (Lobby) sẽ là trung tâm. Người chơi tìm nhau qua Room ID.
- **Share Link (Deep Linking)**: Có nút "Copy Invite Link" trong phòng. Người chơi gửi link này qua các app chat bên ngoài (Zalo, Telegram). Người nhận click vào link sẽ tự động mở app/web và join thẳng vào bàn (nếu nhập đúng Pass).
- **Spectator Mode (Khán giả)**: Xem người khác chơi (Spectate) thay thế cho việc "Follow" mạng xã hội. Khán giả không được chat để tránh lộ bài (hoặc chỉ có kênh chat riêng cho khán giả).

### 4. Hệ thống Thông báo (Notification System)
*Trạng thái cũ*: Nhận thông báo Like, Comment, Tag.
*Thiết kế mới*:
- **In-game Alerts**: Chuyển hoàn toàn sang các thông báo phục vụ luồng chơi: "Đến lượt của bạn (Your Turn)", "Blind sắp tăng", "Yêu cầu ngồi (Sit Request) đã được duyệt".
- **Cảnh báo AFK/Timeout**: Cảnh báo rung màn hình hoặc âm thanh dồn dập khi sắp hết thời gian Time Bank.

---

## 🔵 PHASE 3: Phân công (Surgical Distribution)
- **`frontend-specialist`**: 
  - Gỡ bỏ các link liên kết `<Link href="/profile/...">` trên Avatar người chơi trong component `Seat.tsx`.
  - Thiết kế và code UI cho `PlayerHudPopup`, `ChatDrawer` mới, và hệ thống Animation cho Throwable Items (ném đồ).
- **`backend-specialist`**: 
  - Cập nhật API lấy thông tin User để trả về các chỉ số Poker thay vì thông tin Social.
  - Bổ sung logic xử lý Mute User trong scope của Room.
  - Hỗ trợ broadcast sự kiện Throwable Items qua WebSocket.

---

## 🔴 PHASE 4: Kiểm thử (Verification Plan)
1. **Flow Click Avatar**: User A click vào User B tại bàn, popup HUD hiện lên ngay lập tức, hiển thị thông số VPIP/PFR mà không load lại trang.
2. **Flow Tương tác**: User A chọn "Ném Cà chua" vào User B. Trừ tiền (nếu có cấu hình) -> Broadcast sự kiện qua Socket -> UI tất cả người chơi render animation quả cà chua bay từ A sang B.
3. **Flow Khép kín**: Không có bất kỳ link nào trong phòng chơi có thể dẫn người chơi thoát ra ngoài trang Mạng xã hội cũ. Tối đa hóa sự tập trung.
