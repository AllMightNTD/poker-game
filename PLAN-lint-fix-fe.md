# PLAN - Khắc phục các cảnh báo lint (ESLint Warnings) trong thư mục FE

> [!IMPORTANT]
> **Hiện trạng**:
> Khi chạy `npm run lint` trong thư mục `FE`, hệ thống ghi nhận **39 cảnh báo (warnings)** và 0 lỗi (errors).
>
> **Mục tiêu**:
> Khắc phục triệt để toàn bộ 39 cảnh báo này để đạt trạng thái 0 lỗi/cảnh báo, giúp mã nguồn sạch sẽ, tối ưu hiệu năng và dễ bảo trì hơn.

---

## 🎯 1. Phân loại các cảnh báo (Warnings Classification)

Hệ thống ghi nhận 3 nhóm cảnh báo chính:
1. **Unused Variables (`@typescript-eslint/no-unused-vars`)**: Biến hoặc import được khai báo nhưng không bao giờ sử dụng.
2. **Missing/Unnecessary Hook Dependencies (`react-hooks/exhaustive-deps`)**: Thiếu phụ thuộc trong mảng `useEffect`/`useCallback` hoặc phụ thuộc không cần thiết.
3. **Optimized Image Check (`@next/next/no-img-element`)**: Khuyến cáo dùng `<Image />` của Next.js thay cho thẻ `<img>` truyền thống để tối ưu hóa hình ảnh.

---

## 📅 2. Kế hoạch khắc phục chi tiết (Phase-by-Phase Breakdown)

### Phase 1: Xử lý các biến và Import không sử dụng (Unused variables)
- **Giải pháp**: Xóa bỏ các khai báo import rác hoặc biến hoàn toàn không dùng tới. Đối với các tham số hàm bắt buộc phải giữ lại theo chữ ký hàm, thêm tiền tố dấu gạch dưới `_` để bỏ qua kiểm tra của TypeScript.
- **Các tệp cần chỉnh sửa**:
  - `FE/app/poker-game/table/[id]/components/hero/HeroPanel.tsx` (Xóa `showHandName`).
  - `FE/app/poker-game/table/[id]/components/hooks/usePokerGame.tsx` (Xóa `setIsConnecting` và `data` không dùng).
  - `FE/app/poker-game/table/[id]/components/layout/MobileDrawer.tsx` (Xóa unused import `React`).
  - `FE/app/poker-game/table/[id]/components/layout/TableHeader.tsx` (Xóa unused import `Link` và biến `hostSettingsOpen`).
  - `FE/app/poker-game/table/[id]/components/settings/HostSettingsModal.tsx` (Xóa/dọn dẹp các biến unused như `bigBlind`, `sitRequests`, `setNewSb`, v.v.).
  - `FE/app/poker-game/table/[id]/components/settings/SettingsModal.tsx` (Xóa các state set/get không dùng như `tableBackground`, `dealerVoiceVol`, v.v.).
  - `FE/app/poker-game/table/[id]/components/table/HeroSeat.tsx` (Xóa `seatNumber`).
  - `FE/app/poker-game/table/[id]/components/table/PokerTable.tsx` (Xóa unused import `DealerDeck` và các biến `tableScale`, `felt`).
  - `FE/app/poker-game/table/[id]/components/table/Seat.tsx` (Xóa unused import `motion` và biến `cardVector`).
  - `FE/app/poker-game/table/[id]/components/table/SeatCards.tsx` (Xóa `gameStage`).
  - `FE/app/poker-game/table/[id]/components/table/SeatPanel.tsx` (Xóa `isHero`).
  - `FE/core/providers/user-provider.tsx` (Xóa `error`).

### Phase 2: Khắc phục cảnh báo Hook Dependency (`react-hooks/exhaustive-deps`)
- **Giải pháp**: Phân tích kỹ mảng dependency. Nếu việc thêm dependency không gây ra vòng lặp vô hạn (infinite rendering loop), chúng ta sẽ thêm vào mảng. Nếu việc thêm gây rủi ro lặp vô hạn và logic hiện tại đã đúng đắn, sử dụng comment suppression `// eslint-disable-next-line react-hooks/exhaustive-deps`.
- **Các tệp cần chỉnh sửa**:
  - `FE/app/poker-game/table/[id]/components/hooks/usePokerGame.tsx` (Line 948)
  - `FE/app/poker-game/table/[id]/components/table/CommunityCards.tsx` (Line 17)
  - `FE/features/auth/hooks/use-logout.ts` (Line 26)

### Phase 3: Khắc phục/Bỏ qua cảnh báo sử dụng thẻ `<img>` (`@next/next/no-img-element`)
- **Giải pháp**: Do các hình ảnh avatar hoặc hình ảnh động trong game có thể lấy từ URL bên ngoài không cố định (ngăn cản việc khai báo domain tĩnh trong `next.config.js`), việc sử dụng thẻ `<img>` truyền thống là hợp lý. Chúng ta sẽ thêm chú thích tắt cảnh báo cục bộ `// eslint-disable-next-line @next/next/no-img-element` ngay trên thẻ `<img>` hoặc tắt rule này trong cấu hình ESLint nếu nó xuất hiện quá nhiều tại các component game.
- **Các tệp cần chỉnh sửa**:
  - `FE/app/poker-game/table/[id]/components/hero/HeroPanel.tsx` (Line 130)
  - `FE/app/poker-game/table/[id]/components/settings/SitRequestModal.tsx` (Line 44)
  - `FE/app/poker-game/table/[id]/components/table/Seat.tsx` (Line 214)
  - `FE/app/poker-game/table/[id]/components/table/SeatAvatar.tsx` (Line 22)
  - `FE/app/poker-game/table/[id]/components/ui/Avatar.tsx` (Line 58)
  - `FE/features/blogs/components/BlogDetail.tsx` (Line 103)
  - `FE/features/blogs/components/BlogList.tsx` (Line 122)

---

## 🧪 3. Kế hoạch xác minh (Verification Plan)
- Chạy lệnh `npm run lint` sau mỗi phase chỉnh sửa để kiểm tra số lượng warning giảm xuống.
- Khi hoàn thành tất cả các phase, chạy `npm run lint` phải trả về kết quả sạch (0 warnings).
- Chạy `npm run build` để đảm bảo không làm gãy quá trình đóng gói production.

---
