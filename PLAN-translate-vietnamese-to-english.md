# PLAN: Tự động hoá dịch thuật tiếng Việt sang tiếng Anh cho Frontend (FE)

## 🎯 Mục tiêu (Clear Goals)
Xây dựng một script Node.js độc lập để quét toàn bộ mã nguồn của dự án Frontend, phát hiện các chuỗi văn bản (text) tiếng Việt được hardcode (trong JSX, placeholders, chuỗi string), dịch chúng sang tiếng Anh, và tự động thay thế (áp dụng) trực tiếp vào mã nguồn mà không làm hỏng cú pháp (syntax).

## 🔗 Ràng buộc & Cấu trúc (Dependency Chains)
- **Vị trí script:** Đặt tại thư mục gốc FE, ví dụ `FE/scripts/translate-fe.ts`.
- **Công cụ phân tích cú pháp (AST):** Sử dụng `ts-morph` hoặc `babel` để trích xuất và thay thế văn bản an toàn. Nếu dùng Regex thông thường sẽ rất dễ làm hỏng code (lỗi dấu ngoặc, biến template literal).
- **Công cụ dịch thuật:** Tận dụng `GEMINI_API_KEY` (hiện đang dùng trong BE) với package `@google/generative-ai` để dịch hàng loạt các chuỗi với ngữ cảnh code.
- **Thư mục mục tiêu:** `/FE/app`, `/FE/components`, `/FE/features`, `/FE/core`.

## 🛠️ Chi tiết từng giai đoạn (Phase-by-Phase Breakdown)

### Phase 1: Khởi tạo và Phân tích Cú pháp (Detection)
1. **Cài đặt thư viện phụ thuộc:** `npm i -D ts-morph @google/generative-ai dotenv glob` trong thư mục FE.
2. **Khởi tạo AST:** Viết script khởi tạo `ts-morph` project, load toàn bộ các file `.ts`, `.tsx`.
3. **Quét Node:** Duyệt qua các node AST như:
   - `JsxText` (Text nằm giữa các thẻ HTML/React).
   - `StringLiteral` (Các chuỗi tĩnh như `placeholder="Nhập..."`).
   - `NoSubstitutionTemplateLiteral` (Chuỗi backtick không chứa biến).
4. **Lọc tiếng Việt:** Sử dụng Regex (ví dụ: `/[àáãạảăắằẳẵặâấầẩẫậèéẹẻẽêềếểễệđìíĩỉịòóõọỏôốồổỗộơớờởỡợùúũụủưứừửữựỳỵỷỹý]/i`) để xác định chuỗi có chứa tiếng Việt.

### Phase 2: Trích xuất và Dịch thuật (Translation)
1. **Gom nhóm (Batching):** Thu thập toàn bộ các chuỗi tiếng Việt tìm thấy thành một mảng (Set) duy nhất để tránh dịch lặp các từ giống nhau (như "Lưu", "Hủy").
2. **Gọi AI:** Đưa danh sách này cho Gemini thông qua prompt chuyên dụng:
   > "Translate the following UI text strings from Vietnamese to English. Keep the tone professional, concise for UI elements. Return ONLY a strict JSON object mapping the exact original text to the translated text."
3. **Lưu file map:** Ghi kết quả ra một file `translation-map.json` tạm thời để kiểm tra (có thể sửa thủ công nếu AI dịch sai ngữ cảnh) trước khi áp dụng.

### Phase 3: Thay thế và Áp dụng (Replacement & Write)
1. **Áp dụng AST:** Đọc lại file `translation-map.json`, dùng `ts-morph` tìm lại các node ban đầu và gọi `.replaceWithText()` hoặc `.setLiteralValue()`.
2. **Lưu file:** Gọi `.saveSync()` để ghi đè các thay đổi vào `.tsx`, `.ts`.
3. **Format Code:** Tự động chạy lệnh `npm run lint -- --fix` hoặc `prettier --write` để đảm bảo code đẹp lại sau khi thay thế.

## 🧪 Kế hoạch Kiểm thử & Xác minh (Verification Plan)
- **Manual Verification (Cổng kiểm tra):** Script sẽ chia làm 2 lệnh:
  - Lệnh 1: `npm run translate:extract` -> Chỉ tạo ra file `translation-map.json`. Người dùng (bạn) có thể mở file này ra review, sửa lại một số từ tiếng Anh nếu thích.
  - Lệnh 2: `npm run translate:apply` -> Đọc file JSON và ghi đè vào code.
- **Automated Verification:** 
  - Chạy `npx tsc --noEmit` trên FE để đảm bảo script AST không làm vỡ (break) bất kỳ type nào.
  - Chạy `npm run build` ở local FE để đảm bảo quá trình bundle không gặp lỗi syntax.

---

> [!WARNING]
> **Rủi ro rò rỉ biến (Variable Leak):** Các chuỗi Template Literal có chứa biến (vd: `Xóa người dùng ${name}`) sẽ phức tạp để dịch tự động bằng AST mà vẫn giữ nguyên syntax biến. Giải pháp: script sẽ cảnh báo những chuỗi này ra console để người dùng tự sửa tay, hoặc áp dụng logic regex nâng cao để giữ biến.
