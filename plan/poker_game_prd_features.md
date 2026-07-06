# TÀI LIỆU TỔNG HỢP CHỨC NĂNG GAME POKER (DIAMOND HIGH ROLLER)
*Cập nhật mới nhất: 2026*

Tài liệu này tổng hợp toàn bộ các chức năng đã được xây dựng và tối ưu hóa dựa trên các phân hệ giao diện hiện tại của trò chơi, bao gồm cả các cấu hình chuyên sâu dành cho **Bàn chơi Tùy chỉnh (Custom/Private Room)**.

---

## 1. PHÂN HỆ SẢNH CHỜ (LOBBY)

### Quản lý tài sản cá nhân (User Wallet)
- [ ] **Hiển thị số dư Chip:** Xem tổng lượng chip hiện có trong tài khoản của người chơi.
- [ ] **Nạp chip nhanh (Nút `+`):** Mở cổng liên kết thanh toán để nạp thêm chip/token vào game.
- [ ] **Nhận Chips Miễn Phí:** Tính năng quà tặng hàng ngày hoặc cứu trợ khi người chơi hết chip.

### Thống kê hệ thống toàn sàn (Platform Statistics)
- [ ] **Trực tuyến (Online Players):** Đếm và hiển thị số lượng người chơi đang online trong thời gian thực.
- [ ] **Số bàn Active:** Thống kê số lượng bàn chơi đang hoạt động trên toàn hệ thống.
- [ ] **Hũ Pot hôm nay (Daily Total Pot):** Tổng giá trị giải thưởng tích lũy hoặc lượng chip đang lưu thông trong ngày.

### Tìm kiếm & Bộ lọc bàn chơi (Search & Filter)
- [ ] **Thanh tìm kiếm (Search Bar):** Cho phép gõ tìm kiếm chính xác tên hoặc ID của bàn chơi.
- [ ] **Bộ lọc theo mức cược (Blinds Filter):** Phân loại bàn chơi nhanh theo ngân sách (Tất cả, Micro $\le$ 2K, Thấp 2K - 10K, Trung bình 10K - 50K, Cao...).
- [ ] **Thanh cuộn ngang (Scrollbar):** Hỗ trợ vuốt lướt mượt mà các danh mục bộ lọc trên thiết bị di động.

### Thẻ thông tin bàn chơi (Room Card)
- [ ] **Trạng thái số ghế:** Hiển thị số lượng người đang ngồi trên tổng số ghế quy định (Ví dụ: `5/9`).
- [ ] **Thông số Blinds:** Mức cược bắt buộc đầu ván của bàn đó.
- [ ] **Giới hạn Buy-in (Buy-in Limit):** Lượng chip tối thiểu và tối đa được phép mang vào khi tham gia bàn.
- [ ] **Nút Vào Bàn Chơi:** Chức năng nhấp kích hoạt để trực tiếp tham gia ngồi vào bàn đấu.
- [ ] **Icon Con Mắt (Spectate):** Chức năng xem danh (Đứng xem) ván bài đang diễn ra mà không tham gia đặt cược.

---

## 2. PHÂN HỆ BÀN CHƠI CHÍNH (INGAME BATTLE)

### Thông tin phòng & Điều hướng (Top Bar)
- [ ] **Rời bàn:** Nút thoát nhanh ra sảnh chờ (Lobby).
- [ ] **Tên phòng & Trạng thái:** Hiển thị tên phòng (Ví dụ: `DIAMOND HIGH ROLLER`), trạng thái `Live` và mức Blinds cố định.
- [ ] **Thống kê nhanh số người:** Đếm số lượng người thực tế đang có mặt trong phòng.
- [ ] **Trạng thái vòng bài:** Hiển thị vòng chia bài hiện tại (Ví dụ: `CHIA: FLOP`, `TURN`, `RIVER`).
- [ ] **Cụm tính năng hệ thống:** Các icon shortcut để Bật/tắt âm thanh, Mở nhanh Khung Chat, Nhật ký bàn, và Cài đặt.

### Hiển thị thông tin người chơi tại ghế (Player Seat)
- [ ] **Thông tin cá nhân:** Hiển thị Avatar, Tên rút gọn, và Số chip hiện có (Stack size) của từng vị trí ghế rõ ràng.
- [ ] **Bài tẩy đối thủ:** Hiển thị 2 lá bài úp của đối thủ khi ván bài đang diễn ra.
- [ ] **Tag hành động (Action Tag):** Hiển thị hành động hiện tại của từng nhà (`Call`, `Fold`, `Check`, `Raise` + Số tiền cụ thể) ngay cạnh vị trí ghế.
- [ ] **Biểu tượng vị trí bắt buộc:** Chip tròn đánh dấu Dealer (`D`), Small Blind (`SB`), Big Blind (`BB`).
- [ ] **Vòng bo thời gian (Timebank):** Hiệu ứng viền sáng đếm ngược chạy xung quanh ghế người chơi đang đến lượt để thúc giục hành động.
- [ ] **[Custom Room] Nhãn nhận diện Chủ bàn (Owner Tag):** Biểu tượng vương miện hoặc chữ `OWNER` cạnh avatar của người tạo phòng riêng.
- [ ] **[Custom Room] Trạng thái Vắng mặt (Away/Sit Out):** Làm mờ avatar của người chơi đang tạm dừng nhận bài, giúp bàn đấu tiếp tục mà không bị gián đoạn.

### Khu vực trung tâm bàn chơi
- [ ] **Hũ Pot trung tâm:** Hiển thị tổng số chip gom vào Pot hiện tại (`TOTAL POT [Số chip]`).
- [ ] **Khu vực bài chung (Community Cards):** Gồm 5 ô hiển thị các lá bài chung được lật theo từng vòng (Flop, Turn, River).
- [ ] **Thông báo trạng thái hệ thống (Toast Notification):** Dòng chữ tự động xuất hiện giữa màn hình thông báo các sự kiện quan trọng (Ví dụ: *"Hết thời gian! Tự động Check"*).

### Khu vực bài của bản thân (Hero Hand)
- [ ] **Vùng soi bài tẩy:** Hiển thị phóng to trực quan 2 lá bài tẩy của bản thân ở góc trái dưới cùng.
- [ ] **Độ mạnh của bài (Hand Strength Indicator):** Tự động nhận diện, tính toán kết hợp và hiển thị độ mạnh của tay bài hiện tại (Ví dụ: `STRAIGHT (A-high)`).

---

## 3. PHÂN HỆ ĐIỀU KHIỂN CƯỢC (BETTING PANEL)

### Hành động cơ bản (1 chạm)
- [ ] **Nút FOLD (Bỏ bài):** Phân màu đỏ mờ, tự động khóa khi không thể chọn.
- [ ] **Nút CHECK (Xem bài):** Phân màu xanh đen trầm, dùng khi chưa có ai tăng cược trước đó.
- [ ] **Nút CALL (Theo bài):** Phân màu xanh lá nổi bật, hiển thị chính xác số chip cần bỏ ra để theo (Ví dụ: `CALL 10K`).

### Tăng cược nhanh theo tỷ lệ Pot (Shortcut Bets)
- [ ] **Nút cược tối thiểu (`MIN`).**
- [ ] **Nút cược theo tỷ lệ hũ:** Nút tăng cược nhanh bằng một chạm dựa trên quy mô hũ tiền hiện tại (`½ POT`, `¾ POT`, `POT`).
- [ ] **Nút tố tất cả số tiền đang có (`ALL-IN`).**

### Tùy chỉnh số tiền cược (Custom Raise)
- [ ] **Ô nhập số tiền Custom:** Ô văn bản (Input Field) cho phép người chơi click vào để tự nhập chính xác số chip muốn cược bằng bàn phím.
- [ ] **Nút tinh chỉnh nhanh (`+` / `—`):** Hai nút đặt cạnh ô số để tăng/giảm nhanh một lượng chip nhỏ cố định mà không cần gõ lại.
- [ ] **Thanh trượt kéo cược (Slider):** Kéo từ mức MIN đến ALL-IN, tự động đồng bộ vị trí con chạy theo con số hiển thị trong ô nhập và ngược lại.

### Nút quyết định (Xác nhận cược)
- [ ] **Nút Action lớn màu vàng cam:** Đặt ở góc dưới cùng bên phải, tự động cập nhật nội dung văn bản theo số tiền người chơi đã chọn từ thanh trượt hoặc ô nhập (Ví dụ: `RAISE 20K`, `RAISE 50K`, `ALL-IN`).

---

## 4. PHÂN HỆ CÀI ĐẶT BÀN CHƠI (TABLE CONFIGURATION)

### TAB 1: TRẢI NGHIỆM CÁ NHÂN (Hiển thị cho tất cả Người chơi)
- [ ] **Cấu hình Âm thanh & Hiệu ứng:**
  - [ ] Nút gạt bật/tắt nhanh toàn bộ âm thanh (Mute switch).
  - [ ] Thanh trượt (Slider) tinh chỉnh âm lượng riêng cho Giọng nói Dealer (Dealer Voice).
  - [ ] Thanh trượt (Slider) tinh chỉnh âm lượng riêng cho Hiệu ứng âm thanh game (Sound SFX).
- [ ] **Cá nhân hóa giao diện:**
  - [ ] Thay đổi màu nỉ bàn chơi (4 màu: Lục cổ điển, Lam hoàng gia, Đỏ Ruby, Đen bóng đêm).
  - [ ] Thay đổi họa tiết mặt sau lá bài (3 loại: Cổ điển-Đỏ, Hiện đại-Xanh, Tương lai-Vàng).

### TAB 2: QUẢN LÝ PHÒNG TÙY CHỈNH (Chỉ hiển thị cho CHỦ BÀN - OWNER)
- [ ] **Cấu hình Thể thức cược (Blind & Ante):**
  - [ ] Ô cấu hình mức Blind của bàn chơi (Ràng buộc điều kiện hệ thống: **Mức tối thiểu là `50 / 100`**).
  - [ ] Nút bật/tắt (Toggle Switch) tính năng cược tiền sàn (`Ante`).
  - [ ] Ô nhập số tiền Ante mong muốn nếu tính năng này được kích hoạt.
- [ ] **Quản lý quỹ chip trong bàn (Stack Management):**
  - [ ] Bảng danh sách các User thực tế đang ngồi trong bàn.
  - [ ] Chức năng chỉnh sửa số Chip (Stack) trực tiếp của từng User bằng ô nhập số hoặc sử dụng hai nút chỉnh nhanh `+` / `-`.
  - [ ] Cấu hình thiết lập lại giới hạn số tiền mang vào bàn tối thiểu/tối đa (Min/Max Buy-in) cho phòng custom.
- [ ] **Quản lý nhân sự & Điều hướng:**
  - [ ] Quyền ép một User sang trạng thái vắng mặt (`Set Away / Sit out`) nếu họ treo máy quá lâu.
  - [ ] Quyền trục xuất (`Kick / Leave room`) một User bất kỳ ra khỏi phòng chơi ngay lập tức.
- [ ] **Hệ thống nút điều hướng lưu:** Nút Khôi phục mặc định (Reset), Hủy bỏ (Cancel), và Lưu cài đặt phòng (Save).

---

## 5. PHÂN HỆ KHUNG CHAT BÀN (IN-GAME CHAT)

- [ ] **Tương tác Emoji nhanh:** Hàng biểu tượng cảm xúc hình ảnh sinh động (Thịt gà, Lửa, Cười, Like...) giúp biểu cảm nhanh chỉ với 1 chạm.
- [ ] **Cơ chế chat văn bản nâng cấp:**
  - [ ] **Ô nhập ký tự văn bản (Input Field):** Tích hợp ở đáy khung chat kèm nút **Gửi (Send)** để người chơi tự gõ nội dung.
  - [ ] **Tính năng Chat nhanh (Quick Chat/Macro):** Danh sách các câu thoại mẫu ngắn gọn có sẵn (*"Gặp bài lớn rồi!", "All-in đi bạn ơi", "Suýt nữa thì ăn"...*).
- [ ] **Hiển thị hộp thoại trực quan:** Bong bóng tin nhắn phân tách rõ ràng nội dung kèm Tên và Tag danh hiệu danh tính (Ví dụ: `[OWNER] VIP_DIAMOND_KING`, `[AWAY] SHARKY`).
- [ ] **[Quyền Chủ bàn] Quản trị Chat (Chat Moderate):**
  - [ ] Chức năng cấm chat (Mute) đối với một người chơi cụ thể trong phòng nếu spam hoặc toxic.
  - [ ] Chức năng khóa hoặc mở kênh chat của toàn bộ phòng đấu (Room Chat Toggle).

---

## 6. PHÂN HỆ NHẬT KÝ BÀN CHƠI (ROOM LOGS)

- [ ] **TAB 1: VÁN HIỆN TẠI (Current Hand)**
  - [ ] Liệt kê chi tiết, chính xác thứ tự hành động diễn biến của từng người chơi theo dòng thời gian thực.
  - [ ] Làm nổi bật các dòng chữ hành động của bản thân (`Hero (Bạn) Call 10,000.`) bằng màu xanh lá đặc trưng để dễ phân biệt.
  - [ ] Trực quan hóa các lá bài chung bằng cách đính kèm ký hiệu chất bài có màu sắc thực tế (`10♦`, `J♠`, `Q♥`).
- [ ] **TAB 2: LỊCH SỬ PHÒNG (Room History - Dành cho bàn Custom)**
  - [ ] **Nhật ký biến động Stack:** Lưu vết chính xác thời gian và số chip mỗi khi chủ bàn thực hiện lệnh `+ / -` hoặc khi user nạp thêm tiền (Buy-in). *Ví dụ: "[10:15:23] Chủ bàn đã cộng (+) 500,000 chip cho SHARKY."*
  - [ ] **Nhật ký cấu hình phòng:** Ghi lại lịch sử mỗi khi chủ bàn thay đổi các thông số như mức Blinds hoặc Ante giữa các ván. *Ví dụ: "[10:14:00] Chủ bàn thay đổi Blinds từ 50/100 lên 1,000/2,000."*
  - [ ] **Nhật ký hành động quản trị:** Ghi lại chi tiết lịch sử chủ bàn sử dụng các lệnh Kick hoặc ép vắng mặt (Set Away). *Ví dụ: "[10:30:45] Chủ bàn đã trục xuất (KICK) BLUFFMASTER khỏi phòng chơi."*
- [ ] **Tính năng Xuất nhật ký (Export Log):** Tích hợp nút cho phép chủ bàn sao chép hoặc xuất toàn bộ văn bản lịch sử phòng ra bộ nhớ tạm để phục vụ việc chốt sổ, tính toán bên ngoài sau khi buổi chơi kết thúc.
