## 🛠️ CHI TIẾT DANH SÁCH TEST CASES

### 1. Cấu trúc Small Blind (SB) & Big Blind (BB)
| ID | Chức năng | Mô tả kịch bản test | Kết quả mong đợi (Expected) | Mức độ |
| :--- | :--- | :--- | :--- | :--- |
| **BL-001** | Trừ tiền SB/BB | Ván đấu bắt đầu, hệ thống xác định Dealer (D), Small Blind (SB), Big Blind (BB). | - Người vị trí SB tự động bị trừ số chip bằng 0.5 BB.<br>- Người vị trí BB tự động bị trừ số chip bằng 1 BB.<br>- Tiền được gom vào Main Pot công khai. | Critical |
| **BL-002** | Không đủ tiền SB/BB | Người chơi ở vị trí SB hoặc BB có số chip còn lại ít hơn số chip bắt buộc của Blind đó. | - Hệ thống ép người chơi đó vào trạng thái **All-in** ngay lập tức với số chip còn lại.<br>- Tạo lập quy trình chia tách Pot phù hợp ngay từ đầu ván. | High |
| **BL-003** | Dịch chuyển Button | Kết thúc ván cũ, bắt đầu ván mới với danh sách người chơi giữ nguyên. | - Vị trí Dealer dịch chuyển theo chiều kim đồng hồ sang người kế tiếp.<br>- Vị trí SB và BB dịch chuyển tương ứng. | Medium |

### 2. Thứ tự và Hành động của từng Player (Player Action & Turn Management)
| ID | Chức năng | Mô tả kịch bản test | Kết quả mong đợi (Expected) | Mức độ |
| :--- | :--- | :--- | :--- | :--- |
| **ACT-001** | Thứ tự Pre-flop | Vòng Pre-flop bắt đầu sau khi chia bài tẩy. | - Người ngồi bên trái BB (vị trí Under the Gun - UTG) phải là người thực hiện hành động đầu tiên.<br>- Thứ tự đi theo chiều kim đồng hồ. | Critical |
| **ACT-002** | Thứ tự Post-flop | Bước vào vòng Flop, Turn, hoặc River. | - Người đầu tiên còn bài nằm bên trái Dealer (thường là SB) phải hành động đầu tiên. | Critical |
| **ACT-003** | Timeout xử lý | Đến lượt hành động (Turn) của một Player nhưng Player đó không thao tác trong thời gian quy định (ví dụ 15 giây). | - Hệ thống tự động kích hoạt lệnh **Check** (nếu trước đó chưa có ai bet) hoặc **Fold** (nếu trước đó đã có người bet).<br>- Chuyển lượt sang người kế tiếp ngay lập tức. | High |
| **ACT-004** | Sai lượt hành động | Player cố tình gửi request hành động (Bet/Fold/Raise) khi chưa tới lượt của mình qua Socket. | - Hệ thống từ chối request, trả về mã lỗi Socket cấu hình sai lượt.<br>- Trạng thái ván đấu và số tiền không thay đổi. | High |

### 3. Các hành động cơ bản: Bet, Fold, Raise
| ID | Chức năng | Mô tả kịch bản test | Kết quả mong đợi (Expected) | Mức độ |
| :--- | :--- | :--- | :--- | :--- |
| **CORE-001** | Thao tác Bet hợp lệ | Người chơi đầu tiên trong vòng đưa ra quyết định đặt cược (Bet). | - Số lượng chip Bet tối thiểu phải bằng số chip của Big Blind.<br>- Số chip của người chơi bị trừ và Pot được cộng tương ứng. | Critical |
| **CORE-002** | Thao tác Fold bài | Người chơi chọn Fold khi đối mặt với một cú Bet/Raise. | - Bài tẩy của người chơi bị ẩn/hủy.<br>- Người chơi mất quyền tham gia vào các vòng cược tiếp theo và không được chia Pot khi kết thúc.<br>- Lượt chơi chuyển ngay sang người kế tiếp. | Critical |
| **CORE-003** | Thao tác Raise hợp lệ | Player B muốn Raise (Tăng cược) sau khi Player A đã Bet 100 chip. | - Số lượng Raise tối thiểu phải bằng: `Mức cược hiện tại + (Mức cược hiện tại - Mức cược trước đó)`. Ví dụ: Đã bet 100, tối thiểu phải raise lên thành 200.<br>- Hệ thống cập nhật tổng mức cược vòng đó của Player B. | Critical |
| **CORE-004** | Thao tác Raise không đủ | Player cố tình Raise với số chip nhỏ hơn quy định cược tối thiểu. | - Hệ thống báo lỗi qua Socket chặn hành động.<br>- Yêu cầu người chơi chọn lại số chip hợp lệ hoặc chuyển sang Call/Fold. | Medium |

### 4. Hành động All-in (Tất tay)
| ID | Chức năng | Mô tả kịch bản test | Kết quả mong đợi (Expected) | Mức độ |
| :--- | :--- | :--- | :--- | :--- |
| **ALL-001** | All-in giá trị lớn | Người chơi chọn All-in với số chip lớn hơn mức cược hiện tại của bàn. | - Toàn bộ số chip của người chơi được đẩy vào giữa.<br>- Trở thành mức cược cao nhất hiện tại của vòng để các người chơi khác đưa ra quyết định (Call/Raise/Fold). | Critical |
| **ALL-002** | All-in giá trị nhỏ (Short Stack) | Player A bet 500, Player B chỉ còn 200 chip và chọn All-in. | - Thao tác hợp lệ, Player B được tính là All-in.<br>- Trạng thái của Player B chuyển thành "All-in Wait Showdown".<br>- Hệ thống đánh dấu để chuẩn bị kích hoạt logic tính toán Side Pot. | Critical |
| **ALL-003** | Khóa/Mở quyền Re-raise | Player A bet 100, Player B All-in với 120 chip (ít hơn min-raise là 200), Player C chọn Call 120 chip. Đến lượt Player A. | - Player A không được quyền Raise tiếp (vì lệnh All-in của B chưa đủ cấu thành một cú Full Raise hợp lệ để mở lại cổng cược).<br>- Player A chỉ có quyền Call hoặc Fold. | High |

### 5. Chia tách Pot nâng cao (Main Pot & Side Pots)
| ID | Chức năng | Mô tả kịch bản test | Kết quả mong đợi (Expected) | Mức độ |
| :--- | :--- | :--- | :--- | :--- |
| **POT-001** | Tạo Side Pot đơn giản | Player A (còn 1000 chip), Player B (còn 500 chip), Player C (còn 500 chip) cùng All-in từ Pre-flop. | - **Main Pot**: Gồm 500 của A + 500 của B + 500 của C = 1500 chip (Cả 3 đều có quyền ăn).<br>- **Side Pot 1**: Gồm (1000 - 500) = 500 chip dư ra của Player A trả lại cho A (vì không có ai đối ứng).<br>- Trả lại 500 chip cho Player A ngay lập tức. | Critical |
| **POT-002** | Tạo nhiều Side Pot phức tạp | Player A All-in 100, Player B All-in 300, Player C All-in 500. Tất cả đều Call. | Hệ thống phải chia chính xác thành 3 Pot:<br>1. **Main Pot**: 100 (A) + 100 (B) + 100 (C) = 300 chip (A, B, C đều có quyền ăn).<br>2. **Side Pot 1**: 200 (B) + 200 (C) = 400 chip (Chỉ B và C có quyền ăn).<br>3. **Side Pot 2**: 200 chip thừa của C (Trả lại cho C do không có ai đối ứng). | Critical |
| **POT-003** | Mọi người Fold chỉ còn 1 người All-in | Player A All-in ở Flop, Player B và C đều Fold bài. | - Toàn bộ số chip trong Pot thuộc về Player A ngay lập tức mà không cần phải thực hiện chia các lá bài tiếp theo hay So bài (Showdown). | High |

### 6. Tính toán kết quả Thua Lỗ (P&L - Profit and Loss)
| ID | Chức năng | Mô tả kịch bản test | Kết quả mong đợi (Expected) | Mức độ |
| :--- | :--- | :--- | :--- | :--- |
| **PL-001** | So bài phân định thắng thua | Đến vòng Showdown, Player A có Sảnh (Straight), Player B có Hai Đôi (Two Pairs). | - Hệ thống nhận diện chính xác độ mạnh tay bài: Sảnh > Hai Đôi.<br>- Gắn trạng thái Thắng cho Player A, Thua cho Player B.<br>- Cộng số chip trong Pot vào tài khoản Player A. | Critical |
| **PL-002** | Trả thưởng Side Pot chính xác | Ở Showdown, kết quả bài: Player A (All-in Main Pot 100) có Mậu Thầu, Player B (All-in Side Pot 300) có Một Đôi, Player C (All-in Side Pot 300) có Hai Đôi. | - **Main Pot (300)**: Thuộc về Player C (vì Hai Đôi mạnh nhất trong 3 người).<br>- **Side Pot 1 (400)**: Thuộc về Player C (vì Hai Đôi của C mạnh hơn Một Đôi của B).<br>- Đảm bảo Player A không nhận được chip nào dù bài của B yếu hơn C. | Critical |
| **PL-003** | Hòa bài (Split Pot) | Vòng Showdown, Player A và Player B có cùng một bộ bài mạnh như nhau (ví dụ cùng Thùng tới Tây - Flush Ace-high) và cùng giữ nguyên Chip Stack. | - Số chip trong Pot được chia đều làm đôi (50/50).<br>- Xử lý chip lẻ (Odd Chip): Chip lẻ nhỏ nhất không thể chia đôi sẽ được trao cho người chơi ở vị trí tệ nhất (vị trí hành động sớm nhất tính từ SB). | High |

---

## 📈 CHIẾN LƯỢC TRIỂN KHAI VÀ GIÁM SÁT TEST
1. **Kiểm thử tự động (Automation Test):** Chuyển đổi các kịch bản phân chia Pot phức tạp (`POT-001`, `POT-002`) thành các bộ Unit Test trên Server để chạy tự động mỗi khi cập nhật logic core game.
2. **Kiểm thử đồng thời (Concurrency Test):** Giả lập 6-9 thiết bị Client kết nối đồng thời qua Socket để kiểm tra độ trễ và tính đúng đắn của luồng xoay lượt (`ACT-001`).
3. **Giám sát trạng thái biến động (State Monitoring):** Ghi log chi tiết sự thay đổi của biến `TotalPot`, `CurrentBet`, trạng thái cá cược của từng User sau mỗi Event phát ra từ Client để dễ dàng truy vết khi xảy ra sự cố lệch chip.
"""