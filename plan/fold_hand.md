1. Phân tích Logic và Luật xử lý FoldHành động Fold là việc người chơi từ bỏ quyền tham gia tranh chấp Pot hiện tại, úp bài tẩy của mình xuống và không cần phải bỏ thêm bất kỳ chip nào vào bàn ở các vòng cược tiếp theo.Các nguyên tắc cốt lõi cần quản lý:Không hoàn trả: Người chơi Fold sẽ mất toàn bộ số chip đã cược vào Pot tính đến thời điểm đó.Không được xem bài tiếp: Người chơi đã Fold sẽ không nhận được thông tin về các lá bài chung tiếp theo (nếu có hệ thống gửi bài riêng) và không tham gia vòng Showdown.Trường hợp đặc biệt (Mút chặn cuối): Nếu sau khi một Player chọn Fold, trên bàn chỉ còn duy nhất 1 người chơi hoạt động (Active Player), ván bài phải lập tức dừng lại và trao Pot cho người cuối cùng đó mà không cần chia tiếp hay ngửa bài.2. Thiết kế Cơ sở Dữ liệu & Quản lý State (Redis/Database)Khi Player thực hiện hành động Fold, trạng thái của họ trên Redis Seat Hash (table:${tableId}:seat:${seatNumber}) và Table State phải được cập nhật ngay lập tức.Thay đổi cấu trúc dữ liệu Seat:status: Chuyển từ 'active' sang 'folded'.has_acted: Đặt thành '1' (Để hệ thống nhận diện đã xử lý xong lượt này, tránh nghẽn vòng cược).3. Quy trình Triển khai Code (Workflow)Bước 1: Validate hành động (Kiểm tra tính hợp lệ ở API/Gateway)Trước khi xử lý Fold, Server cần kiểm tra:Có đúng lượt của người chơi đó không (current_turn_seat === player_seat).Trạng thái hiện tại của người chơi phải là 'active'.Kiểm tra quyền Check miễn phí: Nếu mức cược hiện tại của người chơi đó đã bằng với highest_bet (Ví dụ: Mọi người chơi trước đều Check, hoặc người đó ở vị trí BB vòng Preflop và chưa ai Raise).Cảnh báo UI/Hệ thống: Nếu họ bấm Fold trong khi có thể Check, hệ thống nên hiển thị một Pop-up cảnh báo: "Bạn có thể Check miễn phí, bạn có chắc chắn muốn Fold không?" để tối ưu trải nghiệm người dùng.Bước 2: Xử lý State tại processPlayerAction (Backend)Khi lệnh Fold hợp lệ, thực hiện chuỗi logic sau:TypeScript// 1. Cập nhật trạng thái ghế trên Redis thành 'folded'
await this.stateService.setSeat(roomId, seatNumber, {
  status: 'folded',
  has_acted: '1'
});

// 2. Phát log/event báo cho toàn bàn biết người này đã fold để update UI
this.server.to(`table_${roomId}`).emit('table:player-action', {
  seat_number: seatNumber,
  action: 'fold'
});

// 3. Kiểm tra điều kiện kết thúc ván bài sớm (Duy nhất 1 người sót lại)
const allSeats = await this.stateService.getAllSeats(roomId);
const activePlayers = allSeats.filter(s => s.status === 'active');

if (activePlayers.length === 1) {
  // Kết thúc ván bài ngay lập tức, trao thưởng cho người duy nhất còn lại
  await this.endHandEarly(roomId, activePlayers[0].seat_number);
} else {
  // Nếu vẫn còn từ 2 người trở lên, chuyển lượt sang người tiếp theo
  await this.advanceTurn(roomId);
}
Bước 3: Hàm xử lý thắng sớm endHandEarlyNếu tất cả mọi người đều Fold và chỉ còn 1 người thắng cuộc:Gom toàn bộ tiền trong Pot hiện tại trao cho Player sống sót duy nhất.Không thực hiện chia thêm bất kỳ lá bài chung nào ở các vòng sau (nếu đang ở Flop/Turn).Không kích hoạt vòng Showdown (Người thắng có quyền ẩn bài tẩy của mình đi - Muck Hand).Lưu lịch sử ván đấu và gọi startNewHand().4. Kế hoạch đồng bộ hiển thị phía Client (UI/UX)Để đảm bảo hiệu ứng mượt mà giống như các game bài lớn (PokerStars, Poker Face):Hiệu ứng úp bài (Animation): Khi nhận event fold, 2 lá bài tẩy của Player trên màn hình sẽ mờ đi (Opacity 50%), xoay ngang và bay về phía trung tâm bàn chơi (vị trí Dealer) rồi biến mất.Xám hóa Avatar (Greyscale Avatar): Avatar của người chơi chuyển sang màu xám và hiển thị chữ "FOLD" nhỏ để những người chơi khác dễ dàng nhận biết ai đã bỏ cuộc.Ẩn các nút hành động: Ngay khi bấm Fold, Client của người chơi đó phải ẩn toàn bộ các nút chức năng (Fold, Check, Call, Raise) cho đến khi Hand mới bắt đầu. Họ chuyển sang chế độ Khán giả (Spectator) của ván đó.5. Các Edge Cases (Trường hợp biên) cần lưu ý khi TestKịch bản Test (Test Case)Kỳ vọng hệ thống (Expected Behavior)Player mất kết nối (Disconnect/Timeout)Hết thời gian 30s suy nghĩ, hệ thống tự động kích hoạt lệnh Auto-Fold (nếu trước đó có người bet) hoặc Auto-Check (nếu chưa có ai bet).Fold tại vòng River khi chơi 2 người (Heads-up)Người còn lại thắng ngay lập tức, tiền pot được cộng thẳng vào stack, kết thúc hand không chạy Showdown.Người ở vị trí Small Blind bấm Fold ngay lượt đầu tiên PreflopTrạng thái chuyển sang folded, số tiền Small Blind nộp trước đó vẫn giữ nguyên trong Pot, lượt chuyển sang Big Blind (nếu đánh Heads-up) hoặc các vị trí tiếp theo.