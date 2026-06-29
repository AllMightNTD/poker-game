const fs = require('fs');
const file = '/home/dev_ntd/Know_Block/Know_Ledge_Block/FE/features/stories/components/StoryCreatorModal.tsx';
let content = fs.readFileSync(file, 'utf8');

// Replace standard strings
const replacements = [
  ['"Khung xem trước"', '{t("preview")}'],
  ['"Tạo tin mới"', '{t("addStory")}'],
  ['"Tin Chữ"', '{t("textStory")}'],
  ['"Ảnh/Video"', '{t("mediaStory")}'],
  ['"Hủy bỏ"', '{t("cancel")}'],
  ['"Đăng tin"', '{t("postStory")}'],
  ['"Đang tải lên tin..."', '{t("uploadingStory")}'],
  ['"Đang tải lên tin "', '{t("uploadingStory")}'],
  ['"Bắt đầu nhập chữ..."', '{t("startTyping")}'],
  ['"Nội dung tin chữ"', '{t("textContent")}'],
  ['"Chọn Màu Nền"', '{t("chooseBackground")}'],
  ['"Tải Ảnh/Video Lên"', '{t("uploadMedia")}'],
  ['"Kéo thả tệp vào đây hoặc nhấn để chọn"', '{t("dragAndDropOrClick")}'],
  ['"Hỗ trợ JPG, PNG, GIF, MP4. Tối đa 50MB"', '{t("supportedFormats")}'],
  ['"Chữ"', '{t("text")}'],
  ['"Nhãn dán"', '{t("stickers")}'],
  ['"Bộ lọc"', '{t("filters")}'],
  ['"Vẽ tay"', '{t("draw")}'],
  ['"Thêm chữ mới"', '{t("addNewText")}'],
  ['"Danh sách chữ đè"', '{t("textOverlayList")}'],
  ['"(Trống)"', '{t("empty")}'],
  ['"Nội dung chữ"', '{t("textContent")}'],
  ['"Nhập chữ..."', '{t("enterText")}'],
  ['"Font chữ"', '{t("font")}'],
  ['"Kích cỡ"', '{t("size")}'],
  ['"Màu chữ"', '{t("textColor")}'],
  ['"Màu nền"', '{t("backgroundColor")}'],
  ['"Trong suốt"', '{t("transparent")}'],
  ['"Trắng"', '{t("white")}'],
  ['"Đen"', '{t("black")}'],
  ['"Xanh lam"', '{t("blue")}'],
  ['"Vàng"', '{t("yellow")}'],
  ['"Đỏ"', '{t("red")}'],
  ['"Xanh lá"', '{t("green")}'],
  ['"Hãy nhấn \\"Thêm chữ mới\\" để viết chữ kéo thả tùy ý trên tin!"', '{t("addTextInstruction")}'],
  ['"Nhấn vào bất kỳ biểu tượng nào dưới đây để thêm vào tin"', '{t("clickStickerInstruction")}'],
  ['"Bật cọ vẽ tay"', '{t("enableBrush")}'],
  ['"Màu cọ"', '{t("brushColor")}'],
  ['"Hoàn tác"', '{t("undo")}'],
  ['"Xóa toàn bộ"', '{t("clearCanvas")}'],
  ['"Hãy bật nút \\"Bật cọ vẽ tay\\" để vẽ tự do lên tin!"', '{t("drawInstruction")}'],
  ['"Thiết bị của bạn không hỗ trợ phát thử âm nhạc ZingMp3 trong trình duyệt này."', '{t("musicPreviewNotSupport")}'],
  ['"Tìm bài hát trên ZingMp3..."', '{t("searchZingMp3")}'],
  ['"Không tìm thấy bài hát nào."', '{t("noMusicFound")}'],
  ['"Lời bài hát"', '{t("lyrics")}'],
  ['"Điểm bắt đầu phát nhạc"', '{t("musicStartOffset")}'],
  ['"Kiểu hiển thị"', '{t("musicOverlayType")}'],
  ['"Không hiển thị"', '{t("none")}'],
];

for (const [search, replace] of replacements) {
  // Regex replacement considering both tags and attributes if needed
  content = content.replace(new RegExp('>[\\s]*' + search.replace(/"/g, '') + '[\\s]*<', 'g'), '>' + replace + '<');
  content = content.replace(new RegExp('"' + search.replace(/"/g, '') + '"', 'g'), replace);
}

// Special cases
content = content.replace(/>Tạo tin mới</g, '>{t("addStory")}<');
content = content.replace(/>Tin Chữ</g, '>{t("textStory")}<');
content = content.replace(/>Ảnh\/Video</g, '>{t("mediaStory")}<');
content = content.replace(/placeholder="Bắt đầu nhập chữ..."/g, 'placeholder={t("startTyping")}');
content = content.replace(/placeholder="Nhập chữ..."/g, 'placeholder={t("enterText")}');
content = content.replace(/placeholder="Tìm bài hát trên ZingMp3..."/g, 'placeholder={t("searchZingMp3")}');
content = content.replace(/>Khung xem trước</g, '>{t("preview")}<');
content = content.replace(/>Nội dung tin chữ</g, '>{t("textContent")}<');
content = content.replace(/>Chọn Màu Nền</g, '>{t("chooseBackground")}<');
content = content.replace(/>Tải Ảnh\/Video Lên</g, '>{t("uploadMedia")}<');
content = content.replace(/>Kéo thả tệp vào đây hoặc nhấn để chọn</g, '>{t("dragAndDropOrClick")}<');
content = content.replace(/>Hỗ trợ JPG, PNG, GIF, MP4. Tối đa 50MB</g, '>{t("supportedFormats")}<');
content = content.replace(/>Thêm chữ mới</g, '>{t("addNewText")}<');
content = content.replace(/>Danh sách chữ đè</g, '>{t("textOverlayList")}<');
content = content.replace(/>Nội dung chữ</g, '>{t("textContent")}<');
content = content.replace(/>Font chữ</g, '>{t("font")}<');
content = content.replace(/>Kích cỡ \(/g, '>{t("size")} (');
content = content.replace(/>Màu chữ</g, '>{t("textColor")}<');
content = content.replace(/>Màu nền</g, '>{t("backgroundColor")}<');
content = content.replace(/>Trong suốt</g, '>{t("transparent")}<');
content = content.replace(/>Trắng</g, '>{t("white")}<');
content = content.replace(/>Đen</g, '>{t("black")}<');
content = content.replace(/>Xanh lam</g, '>{t("blue")}<');
content = content.replace(/>Vàng</g, '>{t("yellow")}<');
content = content.replace(/>Đỏ</g, '>{t("red")}<');
content = content.replace(/>Xanh lá</g, '>{t("green")}<');
content = content.replace(/>Hãy nhấn "Thêm chữ mới" để viết chữ kéo thả tùy ý trên tin!</g, '>{t("addTextInstruction")}<');
content = content.replace(/>Nhấn vào bất kỳ biểu tượng nào dưới đây để thêm vào tin</g, '>{t("clickStickerInstruction")}<');
content = content.replace(/>Bật cọ vẽ tay</g, '>{t("enableBrush")}<');
content = content.replace(/>Màu cọ</g, '>{t("brushColor")}<');
content = content.replace(/>Hoàn tác</g, '>{t("undo")}<');
content = content.replace(/>Xóa toàn bộ</g, '>{t("clearCanvas")}<');
content = content.replace(/>Hãy bật nút "Bật cọ vẽ tay" để vẽ tự do lên tin!</g, '>{t("drawInstruction")}<');
content = content.replace(/>Không tìm thấy bài hát nào.</g, '>{t("noMusicFound")}<');
content = content.replace(/>Lời bài hát</g, '>{t("lyrics")}<');
content = content.replace(/>Điểm bắt đầu phát nhạc</g, '>{t("musicStartOffset")}<');
content = content.replace(/>Kiểu hiển thị</g, '>{t("musicOverlayType")}<');
content = content.replace(/>Không hiển thị</g, '>{t("none")}<');
content = content.replace(/>Hủy bỏ</g, '>{t("cancel")}<');
content = content.replace(/>Đăng tin</g, '>{t("postStory")}<');
content = content.replace(/>Đang tải lên tin\.\.\.</g, '>{t("uploadingStory")}<');
content = content.replace(/`Đang tải lên tin \(\${uploadProgress}%\)\.\.\.`/g, '`${t("uploadingStory")} (${uploadProgress}%)`');
content = content.replace(/"Chữ"/g, 't("text")');
content = content.replace(/"Nhãn dán"/g, 't("stickers")');
content = content.replace(/"Bộ lọc"/g, 't("filters")');
content = content.replace(/"Vẽ tay"/g, 't("draw")');
content = content.replace(/"Âm nhạc"/g, 't("music")');
content = content.replace(/>Âm nhạc</g, '>{t("music")}<');

// Alerts
content = content.replace(/"Dung lượng tệp vượt quá giới hạn 50MB!"/g, 't("fileTooLarge")');
content = content.replace(/"Thời lượng video vượt quá giới hạn 30 giây! Vui lòng chọn video ngắn hơn."/g, 't("videoTooLong")');
content = content.replace(/"Bạn có chắc chắn muốn đóng\? Bản nháp hiện tại của bạn sẽ bị xóa bỏ."/g, 't("confirmClose")');
content = content.replace(/"Đăng tin thất bại. Vui lòng thử lại!"/g, 't("postFailed")');
content = content.replace(/"Lỗi tải thông tin bài hát từ ZingMp3. Vui lòng thử lại!"/g, 't("musicLoadError")');
content = content.replace(/"Không thể tải stream bài hát này từ ZingMp3 \(có thể là bài hát bản quyền hoặc VIP\). Vui lòng chọn bài khác!"/g, 't("musicNotSupport")');
content = content.replace(/"Phát hiện bản nháp chưa hoàn thành. Bạn có muốn khôi phục lại không\?"/g, 't("confirmRestore")');

fs.writeFileSync(file, content, 'utf8');
console.log("Updated StoryCreatorModal.tsx!");
