# Kế Hoạch Triển Khai - Bảo Mật & Chống Gian Lận Game Poker (Tiêu Chuẩn CG Poker)

Tài liệu này trình bày chi tiết về kiến trúc hệ thống và các biện pháp kiểm soát bảo mật cần thiết nhằm ngăn chặn các hành vi hack, gian lận và thông đồng (collusion) trong hệ thống game Poker của chúng ta, đáp ứng các tiêu chuẩn vận hành thực tế của CG Poker/GGPoker.

---

## 1. Mô Hình Hiểm Họa & Các Vector Tấn Công

| Vector Tấn Công | Mô Tả | Mức Độ Hiểm Họa | Chiến Lược Giảm Thiểu |
| :--- | :--- | :--- | :--- |
| **Xem Trộm Bài (MITM / Mod Client)** | Đánh chặn dữ liệu mạng hoặc phân tích bộ nhớ RAM của client để xem bài tẩy của đối thủ. | Nghiêm trọng | Truyền tải bảo mật Unicast & Nguyên tắc Zero-Knowledge. |
| **Giả Mạo Lượng Cược (Felt Hack)** | Thay đổi dữ liệu WebSocket gửi lên để cược nhiều hơn số phỉnh hiện có, bỏ lượt ngoài lượt chơi hoặc tự ý fold. | Cao | Engine kiểm soát và xác thực toàn diện ở phía Server & Cơ chế khóa trạng thái. |
| **Thông Đồng (Collusion / Đánh Vây)** | Nhiều người chơi ngồi chung bàn chia sẻ bài tẩy với nhau qua các kênh liên lạc ngoài (Discord, Zalo...). | Cao | Kiểm tra IP/Thiết bị, cấu hình giới hạn vị trí (Geofencing) & cơ chế xác thực. |
| **Gian Lận Phía Server** | Quản trị viên/Chủ server can thiệp tráo bài giữa ván đấu để tạo lợi thế cho nhà cái hoặc các bot cụ thể. | Trung bình | Cơ chế Chứng minh Minh bạch (Provably Fair) dùng mã hóa SHA-256. |
| **Tấn Công Race Condition** | Gửi liên tục nhiều gói tin đặt cược cùng lúc để khai thác lỗi bất đồng bộ hoặc làm sập luồng xử lý của bàn. | Cao | Sử dụng cơ chế khóa phân tán Redis Lock cho từng bàn. |

---

## 2. Kiến Trúc Bảo Mật Chi Tiết

### A. Phân Phối Bài Nguyên Tắc Zero-Knowledge (Chống Lộ Bài Tẩy)
* **Quy tắc**: Bài tẩy của đối thủ tuyệt đối *không bao giờ* được phép tồn tại trong các gói tin truyền tải trên mạng, state hay bộ nhớ của client đối thủ trước khi bước vào giai đoạn Ngửa Bài (Showdown).
* **Cách thực hiện**:
  * Khi ván bài bắt đầu, server xáo bài hoàn toàn trên bộ nhớ của server.
  * Server dùng socket gửi riêng (`socket.to(user_id).emit(...)`) để truyền bài tẩy *chỉ* tới người sở hữu tương ứng.
  * Sự kiện trạng thái bàn chơi chung (`table:state`) phát cho tất cả mọi người sẽ chỉ chứa placeholder ẩn (ví dụ: `['back', 'back']`) đại diện cho bài tẩy của những người chơi khác.
  * Bài tẩy chỉ được tiết lộ trong dữ liệu sự kiện kết thúc ván (`table:hand-ended`) đối với các người chơi vẫn còn active cho tới Showdown. Bài tẩy của những người đã Fold tuyệt đối *không bao giờ* được gửi xuống client.

### B. Xác Thực Tuyệt Đối Phía Server (Zero Client Trust)
* Mọi gói tin hành động từ phía client gửi lên (`table:action`) đều bắt buộc phải đi qua bộ lọc xác thực nghiêm ngặt tại Server trước khi thay đổi cơ sở dữ liệu hoặc cache:
  ```typescript
  // Danh sách kiểm tra phía Server:
  1. Có đúng lượt hành động của người chơi này không? (userId === currentTurnUserId)
  2. Trạng thái ván bài có đang hoạt động không? (stage !== 'ended' && stage !== 'waiting')
  3. Hành động này có hợp lệ ở vòng chơi hiện tại không? (Ví dụ: chỉ được Check khi current_highest_bet === current_bet)
  4. Lượng chip raise có hợp lệ không? (amount >= minRaise && amount <= maxRaise)
  5. Số lượng phỉnh đặt cược có vượt quá số phỉnh đang có tại bàn (stack) của người chơi không?
  ```
* Nếu bất kỳ điều kiện nào không thỏa mãn, gói tin sẽ bị hủy bỏ ngay lập tức, server trả lỗi về client tương ứng và đồng bộ lại trạng thái chuẩn từ server xuống client để tránh lệch UI.

### C. Cơ Chế Xáo Bài Chứng Minh Minh Bạch - Provably Fair (Chống Can Thiệp Deck)
Để chứng minh server không can thiệp tráo bài có lợi cho bot/nhà cái trong suốt ván đấu, chúng ta sử dụng cơ chế Commit-Reveal:
1. **Giai đoạn Cam Kết (Pre-flop)**:
   * Server tạo ngẫu nhiên một chuỗi bí mật `server_seed` (bằng thư viện mã hóa an toàn).
   * Server băm chuỗi này: `server_seed_hash = SHA256(server_seed)`.
   * Server gửi công khai `server_seed_hash` cho mọi người chơi thông qua sự kiện bắt đầu ván `table:hand-started`.
   * Người chơi có vai trò Dealer có thể tùy chọn gửi lên một chuỗi `client_seed`.
2. **Xáo Bài Deterministic**:
   * Ghép hai chuỗi hạt giống: `combined_seed = server_seed + ":" + client_seed`.
   * Sử dụng thuật toán sinh số giả ngẫu nhiên có kiểm soát (như Mersenne Twister hoặc HMAC-SHA256) dựa trên `combined_seed` để xáo trộn bộ bài 52 lá một cách cố định.
3. **Giai đoạn Tiết Lộ & Xác Minh (Cuối Ván)**:
   * Khi ván kết thúc, chuỗi hạt giống gốc `server_seed` (chuỗi chưa băm) sẽ được công bố công khai trong sự kiện `table:hand-ended`.
   * Client có thể tự chạy kiểm tra:
     1. Xem `SHA256(server_seed)` công bố cuối ván có trùng khớp với `server_seed_hash` nhận được đầu ván hay không.
     2. Tự chạy lại thuật toán xáo bài bằng `server_seed` và `client_seed` xem kết quả chia các lá bài tẩy/chung có trùng khớp với ván đấu đã diễn ra hay không.

### D. Kiểm Soát Thông Đồng & Tài Khoản Gian Lận (Anti-Collusion)
* **Giới Hạn IP**: Không cho phép các tài khoản có chung địa chỉ IP (hoặc chung dải mạng con lớp C `/24`) cùng tham gia vào một bàn chơi cash game.
* **Định Danh Thiết Bị (Device Fingerprinting)**: Sinh mã định danh phần cứng duy nhất khi đăng nhập (kết hợp các thông số canvas hash, OS, card đồ họa, trình duyệt) và chặn không cho các thiết bị trùng mã ngồi chung một bàn.
* **Phát Hiện Chip Dumping (Bơm Tiền)**: Ghi log toàn bộ lịch sử cược và gắn cờ cảnh báo các ván đấu mà một người chơi liên tục Fold các bộ bài cực mạnh trước lượng cược nhỏ của đối thủ cụ thể, hoặc liên tục chuyển tiền qua lại trong các ván chơi đôi (heads-up).

### E. Chống Race Condition & Tranh Chấp Trạng Thái
* **Redis Lock**: Sử dụng khóa phân tán Redis (`table:lock:<roomId>`) khi xử lý mọi gói tin cược để đảm bảo rằng nếu người chơi bấm nút liên tục hoặc gửi nhiều yêu cầu bất đồng bộ, hệ thống sẽ xử lý tuần tự và không xảy ra tình trạng trừ tiền trùng lặp hoặc nhảy lượt sai lệch.
* **Thứ Tự Hành Động Tuyến Tính**: Duy trì một bộ đếm số thứ tự hành động (`action_order`) cho mỗi ván đấu. Gói tin từ client gửi lên phải khớp với số thứ tự mong muốn hiện tại của Server để tránh xử lý các gói tin cũ bị trễ mạng.
