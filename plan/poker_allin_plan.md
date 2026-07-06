# ĐẶC TẢ LUỒNG XỬ LÝ HÀNH ĐỘNG ALL-IN TRONG POKER (TEXAS HOLD'EM)

Tài liệu này tổng hợp toàn bộ logic, thuật toán tách Pot (Main Pot / Side Pot), luồng xử lý dữ liệu và các trường hợp đặc biệt (Edge Cases) khi người chơi thực hiện hành động **All-in** trong một ván bài Poker.

---

## 1. Nguyên tắc cốt lõi của All-in (Table Stakes Rule)

Trong Poker hiện đại, quy tắc **Table Stakes** được áp dụng nghiêm ngặt nhằm đảm bảo tính công bằng:
* **Không bị ép rời ván bài:** Người chơi không thể bị ép buộc phải bỏ bài (Fold) hoặc rời khỏi ván bài chỉ vì họ không có đủ số chip để theo kịp (Call) mức cược của người khác.
* **Giới hạn quyền lợi:** Khi một người chơi All-in, họ chỉ có quyền thắng tối đa từ mỗi người chơi khác một số lượng chip **bằng đúng số chip mà họ đã bỏ vào pot** (tính từ thời điểm bắt đầu ván bài cho đến vòng cược hiện tại).

---

## 2. Kịch bản 1: Chỉ có 2 người chơi (Heads-up)

Đây là trường hợp đơn giản nhất khi trận đấu chỉ còn lại 2 người (Người A và Người B).

### Luồng xử lý dữ liệu:
1. **Xác định Lượng Chip Hiệu Dụng (Effective Stack):**
   * *Trường hợp Stack bằng hoặc lớn hơn:* Nếu Người A All-in \$100 và Người B Call (B có \$100 hoặc nhiều hơn). Hệ thống gom \$100 của A và \$100 của B vào Main Pot. Nếu B có nhiều hơn \$100, số tiền thừa của B không bị trừ khỏi tài khoản hoặc được trả lại ngay.
   * *Trường hợp Stack nhỏ hơn:* Nếu Người A All-in \$150 nhưng Người B chỉ còn \$100 và chọn Call. Hệ thống tự động xác định Người B cũng ở trạng thái All-in với \$100. Số tiền \$50 thừa của Người A sẽ được hệ thống trả lại ngay lập tức vào Balance của A. Tổng Main Pot lúc này là \$200.
2. **Đóng băng hành động (Freeze Action):**
   * Do một hoặc cả hai người chơi đã hết chip, không ai có thể thực hiện hành động đặt cược (Bet) hoặc tố thêm (Raise) được nữa. Vòng cược hiện tại lập tức kết thúc.
3. **Lật bài bắt buộc (Showdown):**
   * Hệ thống tự động lật ngửa bài (Show bài) của cả 2 người chơi để mọi người trên bàn đều nhìn thấy.
4. **Chia các lá bài còn thiếu (Run the Board):**
   * Dealer (Hệ thống) sẽ chia liên tiếp tất cả các lá bài cộng đồng còn thiếu của các vòng tiếp theo (Flop, Turn, hoặc River) ra bàn mà không dừng lại để đợi hành động.
5. **So bài và Trao thưởng:**
   * Sau khi đủ 5 lá bài chung, hệ thống so sánh tổ hợp bài mạnh nhất (Hand Rank) của 2 người:
     * Người thắng lấy toàn bộ Pot.
     * Nếu hòa (Split Pot), Pot được chia đôi đều cho hai người.

---

## 3. Kịch bản 2: Có $n$ người chơi ($n \ge 3$) và xuất hiện Side Pot

Khi có từ 3 người chơi trở lên tham gia ván bài, và có người chơi All-in với số chip ít hơn số chip của những người còn lại, hệ thống bắt buộc phải thực hiện **Thuật toán phân tách Pot** thành **Main Pot (Pot chính)** và các **Side Pots (Pot phụ)**.

### Thuật toán phân tách Pot (Giai đoạn Betting):
Mỗi khi xuất hiện hành động All-in từ người chơi có lượng chip thấp nhất, hệ thống thực hiện tính toán theo các bước:

1. **Xác định mức đóng góp tối đa ($X$):** Tìm số chip mà người chơi All-in thấp nhất đã đóng góp vào Pot tính đến vòng cược hiện tại.
2. **Tạo/Cắt Main Pot:** Lấy từ mỗi người chơi tham gia ván bài tối đa một lượng chip bằng $X$. Tổng số tiền này được gom vào **Main Pot**. Người chơi All-in thấp nhất chỉ có quyền tranh chấp phần tiền trong Main Pot này.
3. **Tạo Side Pot:** Số chip thừa còn lại của những người chơi đóng góp nhiều hơn $X$ sẽ được gom riêng vào một Pot phụ (**Side Pot 1**).
4. **Lặp lại (Đệ quy):** Nếu trong số những người còn lại, tiếp tục có người All-in với số chip thấp tiếp theo, hệ thống lại lấy số chip chênh lệch để tạo tiếp **Side Pot 2**, **Side Pot 3**, v.v.

### Ví dụ minh họa thực tế:
Giả sử tại vòng Flop, có 3 người chơi tham gia với số chip còn lại như sau:
* **Người A:** All-in \$10
* **Người B:** All-in \$50
* **Người C:** Call \$50

**Hệ thống sẽ tính toán và phân bổ Pot như sau:**
* **Main Pot (Dành cho A, B, C):** Lấy từ A (\$10) + từ B (\$10) + từ C (\$10) = **\$30**.
  * *Quyền lợi:* Cả A, B, và C đều có quyền ăn Pot này nếu có bài mạnh nhất.
* **Side Pot 1 (Chỉ dành cho B và C):** Số tiền còn lại của B (\$40) + số tiền còn lại của C (\$40) = **\$80**.
  * *Quyền lợi:* Người A hoàn toàn không có quyền can thiệp hay nhận tiền từ Side Pot 1 này, ngay cả khi bài của A là mạnh nhất bàn. Chỉ có B và C so bài với nhau để ăn \$80 này.

### Quy tắc mở lại vòng cược (Action Re-opening):
Một trường hợp phức tạp khi có $n$ người chơi là xác định xem hành động All-in có được phép Tố thêm (Raise) hay không:
* Nếu Người A All-in với số chip **nhỏ hơn một lượt Raise hợp lệ tối thiểu** (Minimum Raise) của vòng đó, thì hành động All-in này được coi là một hành động "Blind/Incomplete Call".
* Đối với các người chơi phía sau (đã hành động trước đó), họ chỉ có quyền **Call** hoặc **Fold**, **KHÔNG ĐƯỢC QUYỀN RAISE** chồng lên.
* *Ngoại trừ:* Nếu người chơi phía sau chưa được hành động ở vòng cược này, họ vẫn giữ nguyên đầy đủ các quyền Option (Bet/Raise/Call/Fold) theo luật thông thường.

---

## 4. Luồng xử lý Showdown và Phân phối Pot tổng thể

Khi ván bài kết thúc (sau vòng River hoặc khi tất cả người chơi còn lại đã đóng băng hành động do All-in), hệ thống sẽ kích hoạt luồng xử lý Showdown. 

**Quy tắc tối thượng:** Hệ thống phải duyệt và phân phối tiền **NGƯỢC từ Side Pot muộn nhất (ít người tham gia nhất) trở về Main Pot**.

```
               [ BẮT ĐẦU SHOWDOWN ]
                        │
                        ▼
    [ Sắp xếp danh sách Pot theo thứ tự ngược: ]
       [ Side Pot n -> ... -> Side Pot 1 -> Main Pot ]
                        │
   ┌────────────────────┴────────────────────┐
   ▼                                         ▼
[ Vẫn còn Pot cần xét ]            [ Hết danh sách Pot ]
   │                                         │
   ▼                                         ▼
[ Lọc danh sách User có quyền ]    [ KẾT THÚC VÁN BÀI ]
[ tham gia Pot hiện tại (Eligible) ]
   │
   ▼
[ So sánh Hand Rank của các User này ]
   │
   ▼
[ Xác định Người thắng / Người hòa ]
   │
   ▼
[ Cộng tiền từ Pot vào Balance người thắng ]
   │
   ▼
[ Chuyển sang Pot tiếp theo ] ──> (Quay lại kiểm tra)
```

### Các bước chi tiết của Logic Code:
1. **Bước 1: Khởi tạo mảng Pot**
   * Thu thập tất cả các Pot hiện có thành một mảng, ví dụ: `pots_list = [Side_Pot_2, Side_Pot_1, Main_Pot]`.
2. **Bước 2: Vòng lặp duyệt Pot**
   * Chạy vòng lặp qua từng Pot trong `pots_list`.
   * Đối với mỗi Pot, lọc ra danh sách các người chơi chưa Fold và có đóng góp chip vào Pot đó (`eligible_players`).
3. **Bước 3: Tìm Hand bài mạnh nhất trong Pot đang xét**
   * Gọi hàm evaluate bài cho các `eligible_players`.
   * Tìm ra người có điểm bài cao nhất.
4. **Bước 4: Trao thưởng và cập nhật Balance**
   * Cộng số tiền của Pot đó vào tài khoản người thắng.
   * Nếu có nhiều người chơi hòa nhau (cùng một Hand Rank cao nhất), thực hiện chia đều phần tiền trong Pot đó cho những người hòa (Split Pot).

---

## 5. Các Edge Cases (Trường hợp đặc biệt) cần cấu hình kỹ trong mã nguồn

Để hệ thống game vận hành không lỗi (Bug-free), lập trình viên cần xử lý nghiêm ngặt các trường hợp sau:

1. **All-in không đủ tiền đóng Blind (Ante/Small Blind/Big Blind):**
   * Nếu người chơi ở vị trí Big Blind nhưng chỉ còn số chip ít hơn mức Big Blind quy định (Ví dụ: BB = \$2 nhưng họ chỉ còn \$1) và chọn All-in.
   * Người chơi này vẫn được quyền tham gia ván bài, nhưng mức cược (Current Bet) của họ tại vòng pre-flop chỉ được tính là \$1. Các người chơi tiếp theo muốn Call vẫn phải Call đủ mức BB quy định (\$2).
2. **Mọi người cùng All-in trước khi kết thúc các vòng cược:**
   * Khi chỉ còn 1 người chơi duy nhất còn chip tự do, hoặc tất cả người chơi còn lại trên bàn đều đã ở trạng thái All-in trước vòng River.
   * Hệ thống phải ngay lập tức hủy bỏ bộ đếm thời gian (Turn Timer), khóa toàn bộ lệnh hành động, tự động lật bài của tất cả người chơi và thực hiện chia liên tiếp các lá bài chung còn thiếu (Run the board) với tốc độ nhanh.
3. **Xử lý chip lẻ khi chia Pot hòa (Odd Chip Distribution):**
   * Khi Pot có số tiền lẻ không thể chia đều hoàn toàn (Ví dụ: Pot có \$101 chia đôi cho 2 người chơi hòa bài, mỗi người được \$50.5 nhưng đơn vị nhỏ nhất là \$1, dư ra \$1).
   * **Quy tắc giải quyết:** Đồng chip lẻ (\$1) dư ra sẽ không bị hệ thống giữ lại mà phải trao cho người chơi ở **vị trí bất lợi nhất** trên bàn ăn theo thứ tự vòng tròn, cụ thể là người ngồi gần nhất bên tay trái của vị trí **Dealer Button** (vị trí SB, sau đó đến BB...).
4. **Người chơi All-in sau đó rời mạng (Disconnect/Timeout):**
   * Nếu một người chơi đã All-in, họ không còn quyền hành động ở các vòng sau. Vì vậy, việc họ bị mất kết nối mạng (Disconnect) hoặc không tương tác **không được ảnh hưởng** đến tiến trình chia bài và so bài của ván đấu. Hệ thống phải giữ họ lại ván bài cho đến khi Showdown xong.