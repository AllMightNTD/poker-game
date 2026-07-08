# PLAN - Thiết kế lại giao diện Trang chủ Poker Lobby (FE) dựa theo hình ảnh thiết kế

> [!IMPORTANT]
> **Mục tiêu chính**:
> Tái cấu trúc và thiết kế lại giao diện trang sảnh Poker Lobby (`FE/app/poker-game/page.tsx` và các component con liên quan) để khớp 100% với phong cách thiết kế sòng bài cao cấp (Casino Premium) trong hình ảnh mẫu: tông màu tối kết hợp ánh sáng vàng gold, phông chữ Serif sang trọng, các biểu tượng chất bài mờ ở nền, các widget số dư ví và bộ lọc dạng viên thuốc (pill shape) sắc nét.

---

## 🎯 1. Mục tiêu giao diện (Design Goals)
- **Độ chân thực**: Đưa toàn bộ cấu trúc và màu sắc từ thiết kế vào thực tế. Bỏ các viền bao lớn không cần thiết của Banner cũ để các chi tiết text nổi trực tiếp lên nền.
- **Phong cách Casino Pro**: Sử dụng bảng màu tối (Charcoal/Black với ánh sáng Forest Green & Gold radial gradient), font chữ serif cho các tiêu đề chính, các nút bấm bo tròn có hiệu ứng ánh kim vàng gold.
- **Trải nghiệm mượt mà**: Thêm các micro-interactions (hover, active scale, transition) trên các chip lọc và các nút hành động chính để tăng độ tương tác.

---

## 🔗 2. Phân tích chuỗi phụ thuộc (Dependency Chains)
Thay đổi này tập trung hoàn toàn ở Frontend (FE) và không làm thay đổi các API/Logic nghiệp vụ ở Backend (BE).
Các file sẽ được sửa đổi bao gồm:
1. `FE/app/poker-game/page.tsx` (Layout chính, hình nền, watermark chất bài, nút thương hiệu N).
2. `FE/app/poker-game/components/HeroBanner.tsx` (Chuyển thành hiển thị phẳng không viền hộp, thiết kế lại logo CG POKER PRO, cấu trúc lại Balance Widget bên phải và hàng stats bên dưới đường phân cách).
3. `FE/app/poker-game/components/SearchFiltersBar.tsx` (Thiết kế lại khung tìm kiếm, dropdown trạng thái và các chip lọc chất bài).

---

## 📅 3. Chi tiết các bước thực hiện (Phase-by-Phase Breakdown)

### Phase 1: Cập nhật cấu trúc nền và bố cục chính tại `page.tsx`
- Thay đổi `style.background` của container chính sang màu đen tối kết hợp nguồn sáng xanh lá sẫm vàng ở trên cùng:
  ```css
  radial-gradient(circle at 50% 0%, #12221b 0%, #060e0a 50%, #020504 100%)
  ```
- Tối ưu hóa các ký tự chất bài mờ `♠ ♥ ♦ ♣` trôi nổi ở nền, giảm opacity xuống mức cực mờ (~0.03 - 0.05) và căn chỉnh vị trí ngẫu nhiên lớn hơn.
- Thêm biểu tượng chữ "N" tròn viền mỏng ở góc dưới bên trái màn hình làm điểm nhấn thương hiệu.

### Phase 2: Thiết kế lại Header & Widget số dư trong `HeroBanner.tsx`
- **Bên trái (Header)**:
  - Thêm cụm logo "CG" hình tròn nền vàng gold gradient.
  - Chữ "POKER PRO" màu trắng/vàng đậm và nhãn nhỏ "SẢNH GAME POKER" phía trên.
  - Tiêu đề "Texas Hold'em Club" dùng font Serif (Fraunces hoặc Playfair Display).
  - Đoạn mô tả với font nhỏ hơn, màu cream mờ.
- **Bên phải (Balance Widget)**:
  - Khung chứa bo góc tròn lớn với màu nền xanh đen sâu thẳm (`bg-[#0B151F]/40` hoặc tương đương).
  - Biểu tượng đồng xu vàng lồng nhau lớn.
  - Text "SỐ DƯ CỦA BẠN" chữ nhỏ màu xám. Số dư lớn màu vàng rực rỡ, định dạng dấu phẩy.
  - Nút "🔥 Nhận Chips Free" màu vàng gold rực rỡ, chữ đen. Kế bên là nút "+" bo tròn tối màu.
- **Đường phân cách & Stats**:
  - Dải phân cách mỏng chạy ngang dưới cụm banner chính.
  - 3 cột stats hiển thị thẳng lên nền:
    - Trực tuyến: `1,428 cao thủ` (Icon user trong vòng tròn vàng mờ).
    - Bàn đang mở: `38 bàn` (Icon pulse trong vòng tròn vàng mờ).
    - Hũ Pot hôm nay: `1.2B Chips` (Icon trophy trong vòng tròn vàng mờ).

### Phase 3: Thiết kế lại Thanh bộ lọc `SearchFiltersBar.tsx`
- Đổi thanh bộ lọc thành dạng viên thuốc (pill capsule) tối màu bo góc cực lớn (`rounded-full` hoặc `rounded-2xl`).
- Tích hợp ô tìm kiếm (icon kính lúp trong vòng tròn tối) cùng với dropdown "Mọi trạng thái ▼".
- Các chip lọc mức cược có Suit tương ứng đứng trước:
  - 📱 Tất cả (Active có nền vàng chữ đen, inactive có nền tối chữ xám).
  - ♠ Micro (≤2K)
  - ♣ Thấp (2K-10K)
  - ♦ Vừa (10K-50K)
  - ♥ Cao (>50K)

### Phase 4: Điều chỉnh Trạng thái Trống (Empty State)
- Hiển thị 4 chất bài nổi bật ở trung tâm: `♠ ♥ ♦ ♣`.
- Tiêu đề serif và nút "+ Tạo Bàn Chơi Mới" màu vàng gold bo tròn lớn để kích thích hành động của người dùng.

---

## 🧪 4. Kế hoạch xác minh & kiểm thử (Verification Plan)

### Kiểm thử thủ công (Manual Testing & Visual Verification)
1. **Kiểm tra Layout**: Xác nhận bố cục cân đối trên màn hình Desktop và Mobile (Responsive).
2. **Kiểm tra Trạng thái**:
   - Khi có dữ liệu bàn chơi: Hiển thị danh sách bàn chơi trong lưới.
   - Khi không có dữ liệu khớp bộ lọc: Hiển thị đúng giao diện Empty State với 4 chất bài và nút tạo bàn chơi màu vàng.
3. **Kiểm tra Tương tác**:
   - Rê chuột vào các chip lọc (Micro, Thấp, Vừa, Cao) có hiệu ứng hover mượt mà.
   - Click nhận free chips hoạt động bình thường, hiển thị toast success/error đúng vị trí.
   - Click nút "+" hoặc nút tạo bàn chơi mở ra đúng modal tạo bàn.

---
