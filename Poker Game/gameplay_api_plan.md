# 📝 Kế hoạch Thiết kế API & Luồng WebSocket Cho Bàn Chơi Poker (Gameplay API Plan)

Tài liệu này phác thảo chi tiết các REST API, sự kiện WebSocket real-time, cấu trúc dữ liệu lưu trữ (Redis/MySQL), luồng Spectator, quy tắc ghế ngồi, thuật toán xáo bài minh bạch (Provably Fair), thuật toán cược/phân chia hũ (Pots, Blinds, Ante, P&L), cách tính lượng cược hợp lệ (Raise Pot, All-in & Quick Bets), cơ chế ghi nhật ký cược (Hand History Logger), bộ đếm giờ lượt đi kết hợp gia hạn thời gian (Timer & Extra Time) và hệ thống quản trị bàn chơi tự động tăng blind (Room Custom Settings & Automatic Blinds Escalation) khi người dùng tham gia hoặc theo dõi tại bàn đấu.

---

## 🛠️ PHẦN 1: KIẾN TRÚC LƯU TRỮ TRẠNG THÁI (STATE ARCHITECTURE)

Để đảm bảo tốc độ phản hồi tính bằng mili-giây cho mỗi hành động (Bet, Fold, Check) và tính nhất quán khi ghi nhận tiền tệ (Chips), game sử dụng cơ chế kết hợp **Redis (Real-time Cache)** và **MySQL (Persistent Ledger)**.

### 1. Redis Cache State (Tốc độ cao)
Lưu trữ trạng thái hiện tại của ván bài đang diễn ra (`game_hands`):
*   `table:{tableId}:state` (Hash): Trạng thái tổng quan của bàn (vị trí Dealer, SB, BB, giai đoạn ván bài, tổng Pot, mức cược lớn nhất hiện tại).
*   `table:{tableId}:deck` (List): Bộ bài 52 lá đã xáo.
*   `table:{tableId}:turn` (String): ID của user đang đến lượt + timestamp bắt đầu để đếm ngược (Timer).
*   `table:{tableId}:player:{userId}:cards` (String): Lưu 2 lá bài tẩy của riêng người chơi đó (đảm bảo bảo mật, tuyệt đối không gửi bài tẩy của người khác về client).
*   `table:{tableId}:spectators` (Set): Lưu danh sách socket client đang xem bàn (Spectator).
*   `hand:{handId}:actions` (List): Danh sách nhật ký hành động thô (raw actions) của ván đấu hiện tại để tối ưu hóa hiệu năng ghi đĩa.

### 2. MySQL Persistence (Giao dịch & Lịch sử)
Chỉ ghi nhận vào MySQL ở các điểm mốc:
*   **Mua phỉnh (Buy-in) / Rời bàn (Cashout):** Trừ/cộng ví chính và ghi nhận vào `chip_transactions`.
*   **Kết thúc ván đấu (Settle Hand):** Tính toán Rake, cộng/trừ số dư stack của từng ghế, lưu lịch sử ván bài vào `game_hands`, `hand_actions` và cập nhật chỉ số `poker_player_stats`.

---

## 📑 PHẦN 2: CHI TIẾT REST API (HTTP REQUEST / RESPONSE)

Các API này phục vụ cho việc chuẩn bị vào bàn chơi, quản lý ngân sách và lịch sử.

### 1. API Đăng ký mua phỉnh vào bàn (Buy-in)
*   **Endpoint:** `POST /api/v1/rooms/buy-in`
*   **Mục đích:** Người chơi chuyển chips từ ví chính của mình thành Stack tại bàn để tham gia cược.
*   **Body:**
    ```json
    {
      "room_id": "19",
      "amount": 100000,
      "seat_number": 3
    }
    ```
*   **Logic Backend:**
    1. Kiểm tra bàn đấu có tồn tại không. Ghế số `seat_number` có đang trống không.
    2. Kiểm tra ví người dùng có đủ `amount` không. `amount` có nằm trong khoảng `min_buyin` và `max_buyin` của bàn không.
    3. Thực hiện khấu trừ số dư ví (`wallets.chips_balance`), tạo bản ghi `table_sessions` với trạng thái `active` và `current_stack = amount`.
    4. Ghi nhận giao dịch `'buyin'` vào `chip_transactions`.
*   **Response (200 OK):**
    ```json
    {
      "success": true,
      "session_id": "45",
      "current_stack": 100000,
      "seat_number": 3
    }
    ```

### 2. API Tạm rời ghế / Trở lại (Sit out / Sit back)
*   **Endpoint:** `POST /api/v1/rooms/sit-action`
*   **Body:**
    ```json
    {
      "room_id": "19",
      "action": "sit_out" // "sit_out" hoặc "sit_back"
    }
    ```
*   **Logic Backend:**
    *   `sit_out`: Chuyển trạng thái `table_sessions.status` thành `'sitting_out'`. Người chơi giữ nguyên ghế nhưng sẽ không được chia bài ở ván tiếp theo.
    *   `sit_back`: Chuyển trạng thái về `'active'`.

### 3. API Đứng dậy & Cashout rời bàn
*   **Endpoint:** `POST /api/v1/rooms/leave`
*   **Body:**
    ```json
    {
      "room_id": "19"
    }
    ```
*   **Logic Backend:**
    1. Kiểm tra trạng thái session của người chơi.
    2. Nếu người chơi đang trong ván đấu active, tự động xử lý `Fold` bài tẩy hiện tại.
    3. Lấy số Stack còn lại của người chơi (`table_sessions.current_stack`), cộng trả lại vào ví chính của user (`wallets.chips_balance`).
    4. Chuyển trạng thái session thành `'left'`.
    5. Ghi nhận giao dịch `'cashout'` vào `chip_transactions`.
*   **Response (200 OK):**
    ```json
    {
      "success": true,
      "refunded_amount": 85000,
      "new_wallet_balance": 50085000
    }
    ```

### 4. API Lấy lịch sử ván bài (Hand History)
*   **Endpoint:** `GET /api/v1/rooms/:id/history`
*   **Response:** Trả về danh sách ván bài trước đó tại bàn đấu kèm danh sách người chiến thắng và các lá bài showdown để người chơi tiện theo dõi.

---

## 🔌 PHẦN 3: THIẾT KẾ CÁC SỰ KIỆN WEBSOCKET REAL-TIME

Kênh WebSocket chịu trách nhiệm phát các hoạt cảnh và đồng bộ hóa hành động cược thời gian thực tại bàn.

### 1. Đăng ký nhận luồng bàn chơi (Subscribe Table)
*   **Client gửi:** `table:subscribe`
    ```json
    {
      "room_id": "19"
    }
    ```
*   **Server xử lý:** Tham gia socket client vào room `table_channel_{room_id}`.
*   **Server trả về ngay lập tức:** `table:state` (Cung cấp ảnh chụp trạng thái đầy đủ nhất để vẽ UI).
    ```json
    {
      "room_id": 19,
      "room_name": "DIAMOND HIGH ROLLER",
      "game_stage": "FLOP", // PREFLOP, FLOP, TURN, RIVER, SHOWDOWN, ENDED
      "community_cards": ["10D", "JS", "QH"], // Lá bài chung
      "total_pot": 245000,
      "current_turn_seat": 4, // Ghế đang đến lượt hành động
      "timer_seconds": 15,
      "dealer_seat": 1,
      "small_blind_seat": 2,
      "big_blind_seat": 3,
      "seats": [
        { "seat_number": 1, "user_id": "u1", "username": "GIANG...", "avatar": "avatar_1", "stack": 1245000, "current_bet": 30000, "status": "active", "has_cards": true },
        { "seat_number": 2, "user_id": "u2", "username": "ADMIN...", "avatar": "avatar_2", "stack": 6200000, "current_bet": 30000, "status": "active", "has_cards": true },
        { "seat_number": 3, "user_id": "u3", "username": "LUCKYNO...", "avatar": "avatar_3", "stack": 450000, "current_bet": 0, "status": "folded", "has_cards": false },
        { "seat_number": 4, "user_id": "u4", "username": "HERO", "avatar": "avatar_4", "stack": 2100000, "current_bet": 30000, "status": "active", "has_cards": true }
      ]
    }
    ```

*   **Đồng thời gửi Private (chỉ gửi riêng cho người ngồi tại ghế tương ứng):** `table:private-cards`
    ```json
    {
      "pocket_cards": ["AH", "KS"] // 2 lá bài tẩy của riêng mình
    }
    ```

### 2. Sự kiện Phát hành động cược (Hero Action)
*   **Client gửi:** `table:action`
    ```json
    {
      "room_id": "19",
      "action_type": "raise", // fold | check | call | raise | allin
      "amount": 30000 // số chip bet thêm (bắt buộc khi action là raise/bet)
    }
    ```
*   **Server xử lý & Kiểm tra tính hợp lệ:**
    1. Kiểm tra lượt đi của người dùng thông qua `table:{tableId}:turn` trong Redis.
    2. Kiểm tra lệnh cược hợp lệ (Ví dụ: `raise` phải lớn hơn hoặc bằng mức cược tối thiểu `min_raise`).
    3. Cập nhật `stack` của người chơi và giá trị `current_bet` tương ứng trong Redis.
    4. Phát sự kiện `table:action-recorded` tới toàn bộ bàn đấu để cập nhật âm thanh, hiệu ứng hành động của ghế.
    5. Tính toán lượt đi tiếp theo. Nếu vòng cược kết thúc, kích hoạt chia bài vòng mới (Flop/Turn/River) hoặc chuyển sang So bài (Showdown).

### 3. Các sự kiện Broadcast từ Server (Server-to-Client Events)

| Tên sự kiện (Event Name) | Dữ liệu phát đi (Payload) | Mô tả mục đích |
| :--- | :--- | :--- |
| `table:player-sat-down` | `{ "seat_number": 3, "user": {...}, "stack": 100000 }` | Khi có người chơi mới hoàn tất buy-in và ngồi vào ghế. |
| `table:player-stood-up` | `{ "seat_number": 3, "user_id": "u3" }` | Khi có người chơi rời ghế (Cashout/Thoát). |
| `table:hand-started` | `{ "hand_id": "1002", "dealer_seat": 1, "sb_seat": 2, "bb_seat": 3, "sb_amount": 5000, "bb_amount": 10000, "hash": "sha256_hash_here" }` | Khởi động ván cược mới, trừ cược SB/BB, công khai Server Seed Hash. |
| `table:action-recorded` | `{ "seat_number": 4, "action_type": "raise", "amount": 30000, "new_stack": 2070000 }` | Broadcast hành động cược của một ghế vừa thực hiện để hiển thị chip cược, trừ Stack. |
| `table:turn-change` | `{ "seat_number": 5, "min_bet": 30000, "min_raise": 60000, "can_check": false, "time_limit": 30 }` | Chuyển lượt sang ghế mới, khởi tạo thời gian mặc định là 30 giây. |
| `table:community-deal` | `{ "street": "flop", "cards": ["10D", "JS", "QH"], "total_pot": 245000 }` | Broadcast chia bài chung ở Flop, Turn, River kèm theo việc thu hết chip cược trên bàn gom vào Pot chính. |
| `table:showdown` | `{ "players_cards": [ { "seat_number": 1, "cards": ["9C", "9S"] }, { "seat_number": 4, "cards": ["AH", "KS"] } ], "winners": [ { "seat_number": 4, "pot_index": 0, "amount": 245000, "hand_rank": "One Pair (Aces)" } ] }` | Lật ngửa bài các nhà còn lại tại vòng cuối, xác định tay bài mạnh nhất và phân bổ chip thắng cược. |
| `table:hand-ended` | `{ "new_hand_timer": 5, "reveal_server_seed": "server_seed_plain_text" }` | Hoàn tất ván đấu, công bố Server Seed để người chơi kiểm tra tính công bằng, dọn bàn chuẩn bị xoay Dealer phát ván mới. |

---

## 💬 PHẦN 4: HỆ THỐNG TRÒ CHUYỆN VÀ TƯƠNG TÁC (CHATS & EMOTE)

*   **API Gửi tin nhắn:** `POST /api/v1/rooms/:id/chats` (Hoặc thông qua WebSocket event `table:chat:send`).
*   **WebSocket Event Nhận tin nhắn:** `table:chat:receive`
    *   Payload: `{ "user_id": "u4", "username": "HERO", "message": "Good luck everyone!", "type": "text" }`
*   **WebSocket Event Thả cảm xúc / Emoji động:** `table:emote`
    *   Payload: `{ "from_seat": 4, "to_seat": 1, "emote_id": "throw_tomato" }`
    *   Mục đích: Cho phép người chơi tương tác nhanh bằng cách thả bom, ném cà chua, nâng ly bia,... giữa các ghế chơi.

---

## 👁️ PHẦN 5: THIẾT KẾ CHẾ ĐỘ XEM TRẬN (SPECTATOR / VIEW MODE)

Chế độ Spectator cho phép người xem quan sát diễn biến bàn đấu thời gian thực mà không chiếm ghế chơi và đảm bảo tuyệt đối không rò rỉ thông tin bài tẩy của người chơi khác.

### 1. Phân quyền và Bảo mật (Anti-Cheat Security)
*   **API Spectate:** Khi user bấm nút con mắt ở sảnh, gọi `POST /api/v1/rooms/spectate` để ghi nhận quyền Spectator.
*   **WebSocket Sub:** Khi Client kết nối socket gửi `table:subscribe`, Server kiểm tra xem user này có phiên chơi active trong `table_sessions` tại bàn hay không. Nếu **không**, Server gán role là `spectator`.
*   **Lọc bài tẩy (Card Filtering):** 
    *   Server **tuyệt đối không** gửi sự kiện `table:private-cards` cho các Spectators.
    *   Trong luồng `table:state`, mảng `seats` gửi tới Spectator sẽ có thuộc tính `"has_cards": true` nhưng không chứa giá trị lá bài. Bài tẩy của tất cả người chơi sẽ hiển thị là bài úp (red back cards).
    *   Chỉ khi chuyển sang giai đoạn **Showdown**, server mới phát bài ngửa của các nhà đi tiếp qua `table:showdown`.
*   **Luật Chống Soi Bài (Ghosting Prevention):**
    *   Luồng phát cho Spectators có thể được cấu hình **delay 15-30 giây** so với thời gian thực của bàn chơi để triệt tiêu hoàn toàn khả năng người chơi dùng tài khoản phụ soi bài đồng đội qua thiết bị khác.

### 2. Quản lý số lượng người xem
*   Server lưu trữ danh sách Spectator socket IDs vào Redis Set: `table:{tableId}:spectators`.
*   Mỗi khi có Spectator tham gia hoặc thoát ra, server phát sự kiện cập nhật số lượng đến toàn bộ bàn chơi:
    *   Event: `table:spectators-count`
    *   Payload: `{ "count": 12 }` (Dùng để hiển thị ở chỉ số "4 người" trên Header như hình minh họa UI).

---

## 🚪 PHẦN 6: LUỒNG JOIN BÀN & QUY TẮC GHẾ NGỒI (JOIN & SEATING LOGIC)

Áp dụng các quy tắc tiêu chuẩn của các sàn Poker quốc tế lớn như PokerStars, WSOP:

### 1. Luồng ngồi vào ghế (Seating Flow)
1.  **Chọn ghế trống:** User chọn một ghế từ 1 đến `max_players` đang có trạng thái trống.
2.  **Yêu cầu Buy-in:** Gửi `POST /api/v1/rooms/buy-in` để mua phỉnh. Số chip mua phải nằm trong giới hạn bàn cược.
3.  **Trạng thái chờ (Waiting for Next Hand):**
    *   Sau khi ngồi xuống thành công, người chơi có trạng thái cược là `'waiting_for_next_hand'`.
    *   Họ **không** được chia bài ở ván đấu đang diễn ra giữa chừng để tránh gian lận hoặc ảnh hưởng tới tiến trình cược của bàn.
    *   Khi ván cược hiện tại kết thúc (`table:hand-ended`), trạng thái của họ sẽ tự động được chuyển sang `'active'` để tham gia chơi từ ván tiếp theo.

### 2. Luật Vắng mặt & Hết tiền (Away & Autokick)
*   **Tự động Sit-out (Away):** Nếu người chơi mất kết nối mạng hoặc không thực hiện bất kỳ hành động nào trong 2 lượt đi liên tiếp (Hệ thống tự động Fold), server sẽ tự động chuyển trạng thái của họ thành `'sitting_out'` (Sit Out) để bảo toàn stack của họ.
*   **Tự động Kick (Autokick):**
    *   Khi Stack của người chơi tại ghế giảm về `0` (sau khi thua All-in hoặc nộp blinds), Server sẽ hiển thị hộp thoại đếm ngược **15 giây để Re-buy** (Mua phỉnh thêm).
    *   Nếu hết 15 giây đếm ngược mà người chơi không Re-buy thêm phỉnh thành công, Server tự động thực hiện hành động **Mời rời ghế** (Kick out) để nhường ghế trống cho người chơi khác và đưa tài khoản đó về chế độ xem (Spectator).

---

## 🎲 PHẦN 7: THUẬT TOÁN CHIA BÀI & XÁO BÀI CÔNG BẰNG (PROVABLY FAIR SHUFFLE)

Để đảm bảo tính ngẫu nhiên tuyệt đối và chứng minh 100% hệ thống không can thiệp hay thay đổi kết quả chia bài có lợi cho bất kỳ ai, hệ thống áp dụng cơ chế xác minh **Provably Fair (Dual Seed)**:

### 1. Cơ chế Tạo hạt giống đôi (Dual Seed Generation)
1.  **Server Seed:** Khi bắt đầu ván bài mới, máy chủ sử dụng bộ sinh số ngẫu nhiên bảo mật cao (CSPRNG - `crypto.randomBytes(32)`) để sinh một chuỗi văn bản bí mật gọi là `server_seed`.
2.  **Mã hóa công khai:** Server ngay lập tức băm chuỗi này: `server_seed_hash = SHA256(server_seed)` và gửi mã băm này đến toàn bộ người chơi qua sự kiện `table:hand-started`.
3.  **Client Seeds:** Trình duyệt của mỗi người chơi đang ngồi active tại bàn tự sinh ra một chuỗi ngẫu nhiên khi ván bài bắt đầu và gửi về server. Server gộp tất cả client seeds này lại: `client_seeds = SHA256(seed_1 + seed_2 + ...)`.

### 2. Thuật toán Trộn bài Deterministic Fisher-Yates
1.  Server tạo hạt giống cuối cùng: `combined_seed = HMAC-SHA512(server_seed, client_seeds)`.
2.  Sử dụng `combined_seed` để làm hạt giống khởi tạo cho bộ sinh số giả ngẫu nhiên (PRNG - ví dụ: Seeded LCG).
3.  Trộn bộ bài 52 lá bằng thuật toán Fisher-Yates sử dụng các số ngẫu nhiên lấy từ PRNG trên để thu được một danh sách bài có thứ tự cố định và lưu vào Redis. Điều này đảm bảo:
    *   Server không thể sửa đổi thứ tự bài sau khi nhận client seeds.
    *   Người chơi không thể đoán trước bài tẩy vì không biết `server_seed` gốc.

### 3. Quy trình xác thực cuối ván đấu (Verification)
*   Khi ván bài kết thúc (`table:hand-ended`), Server công khai chuỗi `server_seed` dạng văn bản trần ban đầu.
*   Người chơi có thể đối chiếu:
    *   `SHA256(server_seed_plain_text) === server_seed_hash` (Xác thực server không đổi hạt giống giữa ván đấu).
    *   Tự chạy lại hàm trộn bài Fisher-Yates bằng `server_seed` và `client_seeds` để đối chiếu và kiểm tra tính công bằng tuyệt đối của từng lá bài tẩy và bài chung đã chia.

---

## 💰 PHẦN 8: THUẬT TOÁN TÍNH POT, BLINDS, ANTE & ĐỊNH LƯỢNG LỢI NHUẬN THUA LỖ (FINANCIAL & BETTING CALCULATION ENGINE)

Bộ máy tính toán tài chính chịu trách nhiệm quản lý dòng chảy phỉnh (Chips flow) trong ván bài, trừ/cộng stack, tính phí thu phế hệ thống (Rake) và kết chuyển lợi nhuận/thua lỗ cho từng người chơi.

### 1. Thu cược bắt buộc đầu ván (Ante & Blinds Collection)
*   **Ante (Tiền sàn - Nếu bàn có cấu hình):**
    *   Trước khi chia bài tẩy, mọi người chơi ở trạng thái `'active'` phải nộp Ante.
    *   Công thức trừ Stack: `player_stack = player_stack - ante`.
    *   Gom vào Pot ban đầu: `initial_pot = number_of_active_players * ante`.
*   **Blinds (Mức cược mù):**
    *   Ghế ở vị trí Small Blind (SB) tự động nộp `small_blind_amount` (ví dụ: 5,000).
    *   Ghế ở vị trí Big Blind (BB) tự động nộp `big_blind_amount = small_blind_amount * 2` (ví dụ: 10,000).
    *   Nếu stack của người chơi nộp mù nhỏ hơn mức quy định, họ sẽ tự động kích hoạt trạng thái **All-in** với toàn bộ phỉnh còn lại của mình.
    *   Giá trị mù thực tế được thêm vào Pot chính và được tính làm mốc cược hiện tại của vòng chơi.

### 2. Thuật toán Phân tách Hũ cược (Side Pot Splitting Algorithm)
Khi có một hoặc nhiều người chơi chọn lệnh **All-in** với mức Stack khác nhau, tổng Pot sẽ được chia thành một Hũ chính (Main Pot) và một hoặc nhiều Hũ phụ (Side Pots):

1.  **Thu thập dữ liệu:** Đặt $C_i$ là tổng lượng phỉnh người chơi $i$ đã cược trong ván đấu này (không bao gồm Ante).
2.  **Sắp xếp mức cược:** Sắp xếp danh sách người chơi chưa Fold và có đóng góp cược theo $C_i$ tăng dần.
3.  **Tạo tầng Pot:**
    *   Tại mỗi mức cược All-in của người chơi $k$ có lượng cược $L_k$ (với $L_0 = 0$):
    *   Số lượng phỉnh đóng góp vào Pot này từ mỗi người chơi $j$ (kể cả những người đã Fold sau đó) là: $\Delta P_j = \min(C_j, L_k - L_{k-1})$.
    *   Kích thước Pot ở tầng này là: $P_k = \sum_{j} \Delta P_j$.
    *   Danh sách người chơi hợp lệ nhận Pot này (Eligible Players) là những người chơi **chưa Fold** và có tổng đóng góp cược $C_j \ge L_k$.
4.  **Cập nhật cấu trúc Pot:** Lưu trữ các Pot được phân tách này vào Redis và ghi nhận vào bảng `side_pots` ở dạng JSON.

### 3. Thuật toán Tính Phí Hệ Thống (Rake Calculation)
Chỉ áp dụng với bàn hệ thống (System Tables), các bàn cá nhân (Private Tables) có Rake = 0.
*   **Công thức tính Rake trên mỗi Pot ($P_k$):**
    $$\text{Rake}_k = \min(P_k \times \text{rake\_rate}, \text{rake\_cap})$$
*   **Giá trị Pot thực nhận sau phế:**
    $$\text{Net Pot}_k = P_k - \text{Rake}_k$$

### 4. Định lượng Lợi nhuận và Thua lỗ (Profit & Loss Settlement)
Tại vòng So bài (Showdown) hoặc khi tất cả đối thủ Fold bài:
1.  **Xác định người thắng từng Pot:** So bài của những người chơi hợp lệ cho từng Pot ($P_k$) để tìm người thắng bài mạnh nhất.
2.  **Chia Pot (Split Pot):** Nếu có nhiều người chơi hòa bài ở một Pot, $\text{Net Pot}_k$ sẽ được chia đều. Phỉnh lẻ dư ra (nếu có) được trao cho người thắng ở vị trí ghế gần vị trí Small Blind nhất theo chiều kim đồng hồ.
3.  **Công thức tính Lợi nhuận/Thua lỗ (P&L) sau ván đấu của User $i$:**
    *   Gọi $C_i$ là tổng số phỉnh người chơi $i$ đã cược trong ván đấu (gồm Ante + Blinds + các vòng cược).
    *   Gọi $W_i$ là tổng số phỉnh người chơi $i$ thực nhận từ các Pot thắng được.
    *   **Hiệu số P&L ròng:**
        $$\text{Net P\&L}_i = W_i - C_i$$
4.  **Đồng bộ Stack và Sổ cái (Database Sync):**
    *   Cập nhật Stack tại ghế: `table_sessions.current_stack = table_sessions.current_stack + Net P&L` (sử dụng transaction để chống race conditions).
    *   Ghi nhận giao dịch tài chính vào `chip_transactions` with amount $= |\text{Net P\&L}_i|$ (Loại giao dịch `'win'` nếu thắng ròng, hoặc `'lose'` nếu thua ròng).
    *   Cộng dồn chỉ số thống kê của người chơi trong `poker_player_stats` (cộng vào `total_chips_won` hoặc `total_chips_lost`).

---

## 🎚️ PHẦN 9: THUẬT TOÁN TÍNH TOÁN LƯỢNG CƯỢC HỢP LỆ (RAISE POT, ALL-IN & QUICK BETS ENGINE)

Bộ máy tính toán này xử lý biên độ giá trị cho hành động cược tùy chỉnh (Custom Raise) và thiết lập giá trị chuẩn cho các phím tắt chọn nhanh cược (Quick Bets: 1/2 Pot, 3/4 Pot, Pot, All-in) dựa trên luật Poker quốc tế.

### 1. Giới hạn khoảng Raise hợp lệ (Valid Bet/Raise Boundaries)
*   **Mức Bet tối thiểu (Min Bet):** Bằng mức cược 1 Big Blind (BB) của bàn.
*   **Mức Raise tối thiểu (Min Raise Increment):**
    *   Lượng tăng cược (Raise Increment) của hành động raise tiếp theo phải tối thiểu bằng lượng tăng cược của hành động raise hợp lệ liền trước đó trong cùng vòng cược.
    *   Gọi $B_{\text{current}}$ là mức cược cao nhất hiện tại ở vòng chơi.
    *   Gọi $B_{\text{last\_raise}}$ là khoảng chênh lệch giữa mức cược cao nhất và mức cược liền trước đó: $B_{\text{last\_raise}} = B_{\text{current}} - B_{\text{previous\_highest}}$.
    *   **Tổng mức cược tối thiểu sau lệnh raise mới:**
        $$\text{Min Raise Size} = B_{\text{current}} + B_{\text{last\_raise}}$$
*   **Mức Raise tối đa (Max Raise):** Bằng toàn bộ Stack hiện có của người chơi đó (Hành động All-in).

### 2. Thuật toán cược nhanh theo quy mô Pot (Quick Bets Calculations)
Gọi $P_{\text{current\_total}}$ là tổng số tiền có trong Pot ở giữa bàn cộng thêm tổng lượng phỉnh cược của tất cả người chơi đã đặt ra ở vòng này nhưng chưa gom vào giữa bàn:
$$P_{\text{current\_total}} = P_{\text{current}} + Bets_{\text{round\_current}}$$

Khi người chơi bấm các phím tắt cược nhanh, tổng mức cược mới ($Total Bet Amount$) được thiết lập như sau:

*   **Cược nhanh 1/2 POT:**
    $$\text{Total Bet Amount}_{1/2} = B_{\text{current}} + \max\left(B_{\text{last\_raise}}, \lfloor 0.5 \times P_{\text{current\_total}} \rfloor\right)$$
*   **Cược nhanh 3/4 POT:**
    $$\text{Total Bet Amount}_{3/4} = B_{\text{current}} + \max\left(B_{\text{last\_raise}}, \lfloor 0.75 \times P_{\text{current\_total}} \rfloor\right)$$
*   **Cược nhanh POT (Pot-Limit Raise):**
    *   Theo luật Poker, cược "POT" nghĩa là người chơi thực hiện **Call** lượng cược hiện tại, sau đó **Raise** thêm một khoảng bằng tổng lượng Pot sau khi Call.
    *   Gọi $B_{\text{player}}$ là số tiền người chơi hiện tại đã đóng góp trong vòng cược này.
    *   Số tiền cần bỏ ra để Call là: $\text{Call Amount} = B_{\text{current}} - B_{\text{player}}$.
    *   Kích thước Pot sau khi Call giả định: $P_{\text{after\_call}} = P_{\text{current\_total}} + \text{Call Amount}$.
    *   **Tổng mức cược mới của người chơi sau khi cược POT:**
        $$\text{Total Bet Amount}_{\text{POT}} = B_{\text{current}} + P_{\text{after\_call}}$$
*   **Cược nhanh ALL-IN:**
    $$\text{Total Bet Amount}_{\text{Allin}} = B_{\text{player}} + \text{player\_stack}$$

### 3. Quy tắc bảo vệ biên (Edge Case Boundary Guard)
Khi tính toán giá trị cược từ phím nhanh hoặc thanh trượt Custom Raise:
1.  **Chặn trên:** Nếu $\text{Total Bet Amount} > B_{\text{player}} + \text{player\_stack}$ (vượt quá khả năng tài chính của người chơi), hệ thống tự động gán giá trị bằng All-in: $\text{Total Bet Amount} = B_{\text{player}} + \text{player\_stack}$.
2.  **Chặn dưới:** Nếu $\text{Total Bet Amount} < \text{Min Raise Size}$ và người chơi có đủ phỉnh để cược tối thiểu, hệ thống tự động gán giá trị bằng $\text{Min Raise Size}$. Nếu stack người chơi nhỏ hơn $\text{Min Raise Size}$ nhưng lớn hơn $\text{Call Amount}$, lệnh cược duy nhất lớn hơn Call mà họ có thể thực hiện là All-in.

---

## 📝 PHẦN 10: THUẬT TOÁN GHI NHẬT KÝ VÀ LỊCH SỬ CƯỢC VÁN BÀI (HAND HISTORY & ACTION LOGGER ENGINE)

Bộ ghi nhật ký chịu trách nhiệm theo dõi từng hành động nhỏ nhất của người chơi trong thời gian thực, lưu trữ đệm tối ưu hóa hiệu năng, và biên dịch thành lịch sử ván bài (Hand History) trực quan cho người dùng.

### 1. Luồng ghi đệm thời gian thực (Real-time buffering in Redis)
Trong suốt ván đấu, mỗi khi có action gửi lên từ Socket Client và được xác thực thành công qua `table:action`:
1.  Server sinh đối tượng log chi tiết (`ActionLog`):
    ```json
    {
      "action_order": 3,
      "seat_number": 4,
      "user_id": "u4",
      "username": "HERO",
      "street": "flop",
      "action_type": "raise",
      "amount": 30000,
      "total_pot_before": 100000,
      "player_stack_before": 2100000,
      "player_stack_after": 2070000,
      "timestamp": "2026-06-29T13:32:57Z"
    }
    ```
2.  Server đẩy trực tiếp đối tượng này vào cuối danh sách hàng đợi tạm thời trên Redis bằng lệnh `RPUSH`:
    *   Redis Key: `hand:{handId}:actions`

### 2. Luồng kết chuyển MySQL hàng loạt (MySQL Async Bulk-Insert at Hand End)
Khi ván bài hoàn tất (sang trạng thái `ENDED` sau So bài hoặc tất cả đã Fold):
1.  **Ghi nhận dữ liệu chung (`game_hands`):** Server khởi tạo transaction lưu trữ tổng quan ván bài (các lá bài chung, số phế Rake, các lá bài tẩy showdown).
2.  **Bulk-Insert lịch sử cược (`hand_actions`):**
    *   Đọc toàn bộ log thô từ Redis: `LRANGE hand:{handId}:actions 0 -1`.
    *   Chuyển đổi các đối tượng JSON thành một câu lệnh SQL Bulk-Insert ghi nhận vào bảng `hand_actions` nhằm tránh ghi đĩa quá nhiều lần trong lúc cược.
3.  **Xóa bộ đệm:** Gọi lệnh `DEL hand:{handId}:actions`.

### 3. Biên dịch Lịch sử định dạng văn bản (Hand History Parser)
Để hiển thị tại thẻ Lịch sử (Log ván bài) ở góc phải giao diện như hình UI của người dùng, server cung cấp cơ chế Parser biên dịch chuỗi hành động thành văn bản tiếng Việt tiêu chuẩn:
*   Định dạng lưu trữ: Lưu tại cột `hand_history_log` (MediumText) trong bảng `game_hands`.

---

## ⏳ PHẦN 11: THUẬT TOÁN ĐẾM NGƯỢC THỜI GIAN & GIA HẠN LƯỢT CHƠI (TURN TIMER & EXTRA TIME ENGINE)

Cơ chế quản lý thời gian đảm bảo tiến trình ván đấu diễn ra trôi chảy, tránh nghẽn bàn khi người chơi mất kết nối hoặc cố tình kéo dài thời gian (stalling).

### 1. Cơ chế đếm ngược lượt đi (Turn Timer)
*   **Thiết lập mặc định:** Mỗi khi bắt đầu lượt hành động của một ghế (`table:turn-change`), server cấp thời gian suy nghĩ mặc định là **30 giây**.
*   **Cập nhật Redis:**
    *   `table:{tableId}:active_turn_expires_at = current_timestamp + 30s`
    *   `table:{tableId}:active_player = userId`
*   **Worker quản lý Timer:**
    *   Hệ thống khởi chạy một Timer xử lý trong tiến trình (`NodeJS setTimeout` có liên kết trực tiếp với Table ID) hoặc sử dụng hạ tầng Scheduler (như BullMQ).

### 2. Cơ chế yêu cầu gia hạn thời gian (Extra Time)
Để người chơi có thêm thời gian tính toán các quyết định phức tạp (Decisions):
*   **Quy định:** Mỗi người chơi có tối đa **1 lượt sử dụng Extra Time (+30 giây)** trong suốt thời gian tham gia bàn chơi cho mỗi ván đấu.
*   **WebSocket Event (Client -> Server):** `table:extra-time:request`
*   **Logic xử lý phía Server:**
    1.  Xác nhận yêu cầu đúng là của user đang đến lượt chơi.
    2.  Kiểm tra bộ nhớ tạm Redis của bàn đấu xem người chơi đã sử dụng quyền gia hạn chưa:
        *   Redis Key: `table:{tableId}:player:{userId}:has_used_extra_time` (kiểm tra boolean).
    3.  **Nếu chưa sử dụng:**
        *   Set khóa trên thành `true`.
        *   Hủy bộ đếm giờ (Timeout) cũ trên Server.
        *   Cộng dồn thêm 30 giây vào hạn giờ hiện tại:
            `table:{tableId}:active_turn_expires_at = current_timestamp + 30s + remaining_seconds`
        *   Khởi tạo lại bộ đếm giờ Timeout mới với thời lượng đã gia hạn.
        *   Phát sự kiện Broadcast cho cả bàn: `table:extra-time-granted` kèm theo thời gian hết hạn mới.

### 3. Xử lý Hết giờ tự động hành động (Timer Expiration & Auto-Action)
Khi bộ đếm giờ của máy chủ chạm mốc hết hạn mà không nhận được tín hiệu hành động hợp lệ từ Client:
*   **Bước 1: Tính toán hành động mặc định (Default Action Decision):**
    *   Gọi $B_{\text{current}}$ là lượng cược lớn nhất ở vòng đấu hiện tại của bàn.
    *   Gọi $B_{\text{player}}$ là lượng cược mà người chơi này đã bỏ ra trong vòng hiện tại.
    *   **Trường hợp A (Không mất thêm phỉnh để ở lại):** Nếu $B_{\text{player}} == B_{\text{current}}$.
        *   **Hành động tự động:** **CHECK**.
    *   **Trường hợp B (Phải bỏ thêm phỉnh để ở lại):** Nếu $B_{\text{player}} < B_{\text{current}}$.
        *   **Hành động tự động:** **FOLD**.
*   **Bước 2: Xử lý dữ liệu:**
    1.  Thực thi hành động mặc định tương ứng (Check hoặc Fold).
    2.  Nếu Fold, chuyển trạng thái bài tẩy của ghế đó thành úp bài (`folded`) và thu hồi bài tẩy.
    3.  Ghi nhật ký hành động tự động kèm cờ đánh dấu hết giờ.
    4.  Phát sự kiện `table:action-recorded` tới cả bàn.
    5.  Chuyển quyền hành động sang ghế tiếp theo (`table:turn-change`).

---

## ⚙️ PHẦN 12: QUẢN TRỊ BÀN CHƠI CUSTOM & TỰ ĐỘNG TĂNG BLINDS (CUSTOM ROOM ADMIN & AUTOMATIC BLINDS ESCALATION ENGINE)

Cấu hình nâng cao dành cho các bàn đấu Custom/Private (nơi người dùng tạo phòng tự quản lý) và cơ chế tự động gia tăng độ khó thử thách (blind level structure) tương tự như thể thức thi đấu giải (Tournament).

### 1. Phân hệ API dành cho Chủ phòng (Room Host/Owner Controls)
Khi nhận được bất kỳ Request thay đổi cấu hình nào từ Client, máy chủ xác thực quyền bằng cách đối chiếu: `poker_tables.owner_id === request.authenticated_user_id`. Nếu hợp lệ, cho phép gọi các tác vụ sau:

*   **API Thay đổi mức mù (Change Small Blind):**
    *   *Endpoint:* `POST /api/v1/rooms/:id/config`
    *   *Body:* `{ "small_blind": 200 }`
    *   *Logic:* Cập nhật cấu hình `small_blind` và `big_blind = small_blind * 2` trong MySQL và bộ nhớ đệm Redis. Cấu hình mới sẽ **chỉ áp dụng từ ván bài kế tiếp** để không phá vỡ vòng cược hiện tại. Phát sự kiện `table:config-updated` tới cả phòng.
*   **API Kick người chơi khỏi bàn (Kick User):**
    *   *Endpoint:* `POST /api/v1/rooms/:id/kick`
    *   *Body:* `{ "target_user_id": "u3" }`
    *   *Logic:* 
        1. Tìm ghế của target. Nếu target đang trong ván cược active, tự động xử lý `Fold` bài tẩy của họ.
        2. Đứng dậy thu hồi Stack còn lại, cộng hoàn trả về ví chính của target.
        3. Đổi trạng thái session thành `'left'` và ghi nhận log vào `table_admin_logs`.
        4. Phát sự kiện `table:player-stood-up` và gửi socket signal trực tiếp tới target buộc chuyển hướng trang về Sảnh (Lobby) kèm thông báo: *"Bạn đã bị chủ phòng mời ra khỏi bàn."*
*   **API Cưỡng chế đi vắng (Force Sit-Out User):**
    *   *Endpoint:* `POST /api/v1/rooms/:id/force-sit-out`
    *   *Body:* `{ "target_user_id": "u3" }`
    *   *Logic:* Chuyển trạng thái session của target thành `'sitting_out'`. Target giữ nguyên vị trí ngồi nhưng sẽ không được chia bài tẩy ở ván tiếp theo cho đến khi tự chọn Sit-Back hoặc chủ phòng cho phép quay lại.
*   **API Nạp / Trừ chip trực tiếp tại bàn (Modify Stack - Chỉ bàn Custom):**
    *   *Endpoint:* `POST /api/v1/rooms/:id/modify-stack`
    *   *Body:* `{ "target_user_id": "u3", "action": "add/subtract", "amount": 50000 }`
    *   *Logic:* 
        *   `add`: Cộng trực tiếp `amount` vào `table_sessions.current_stack`. Đồng thời trừ ví chính của target hoặc ghi nợ vào hạn mức tín dụng phòng tùy cơ chế quản lý phỉnh của chủ phòng.
        *   `subtract`: Trừ trực tiếp `amount` từ Stack của target tại bàn. Nếu số trừ lớn hơn Stack hiện tại, Stack đưa về `0` (và kích hoạt Re-buy đếm ngược hoặc tự động mời rời ghế).
        *   Broadcast sự kiện `table:player-stack-modified` cập nhật stack tức thì trên giao diện.

### 2. Thuật toán tự động nhân đôi cược mù (Automatic Blinds Escalation Engine)
Để duy trì nhịp độ trận đấu kịch tính ở các bàn cược, hệ thống hỗ trợ cơ chế tự động nhân đôi mức cược mù (x2 Small/Big Blind) sau mỗi **1 tiếng chơi thực tế (1 hour of active playtime)**:

1.  **Theo dõi thời gian chơi thực tế (Active Playtime Accumulator):**
    *   Hệ thống lưu giữ khóa tích lũy thời gian chơi thực tế trên Redis: `table:{tableId}:active_playtime` (tính bằng giây).
    *   Chỉ đếm giây khi bàn đấu đang diễn ra ván bài (từ lúc bắt đầu chia bài tẩy đến lúc kết thúc ván bài). Không tính thời gian chờ đợi gom đủ người hoặc thời gian đếm ngược giữa các ván.
2.  **Kích hoạt tăng cược (Escalation Trigger):**
    *   Tại thời điểm kết thúc mỗi ván bài (`table:hand-ended`), Server tính toán hệ số cấp mù dựa trên số giây tích lũy:
        $$\text{Level}_{\text{expected}} = \lfloor \frac{\text{active\_playtime}}{3600} \rfloor$$
    *   Nếu $\text{Level}_{\text{expected}} > \text{Level}_{\text{current}}$ (đã qua mốc 1 tiếng mới, ví dụ 1 tiếng, 2 tiếng, 3 tiếng,...):
        *   Thiết lập mức mù nhân đôi:
            $$SB_{\text{new}} = SB_{\text{original}} \times 2^{\text{Level}_{\text{expected}}}$$
            $$BB_{\text{new}} = SB_{\text{new}} \times 2$$
        *   Cập nhật các giá trị mù mới vào Redis state và cơ sở dữ liệu `tables`.
        *   Broadcast sự kiện `table:blinds-escalated` tới toàn bộ bàn chơi kèm theo hiệu ứng hình ảnh banner trên giao diện: *"Mức cược mù đã tăng lên: [SB_new]/[BB_new]"*.
