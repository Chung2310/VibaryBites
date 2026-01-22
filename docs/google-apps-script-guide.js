/**
 * HƯỚNG DẪN TÍCH HỢP GOOGLE SHEETS
 * 
 * Để gửi thông tin đơn hàng vào Google Sheets, bạn cần làm theo các bước sau:
 * 
 * 1. TẠO GOOGLE SHEET:
 *    - Mở Google Sheet mà bạn đã cung cấp trong hình ảnh.
 *    - Đảm bảo tên trang tính là "Bảng_1".
 *    - Các cột sau cần có ở hàng đầu tiên:
 *      A: Số thứ tự đơn hàng
 *      B: Thời gian đặt hàng
 *      C: Họ và tên
 *      D: Số điện thoại
 *      E: Địa chỉ nhận hàng
 *      F: Ghi chú
 *      G: Sản phẩm
 *      H: Tổng tiền (Cột này nên được thêm vào để lưu giá trị đơn hàng)
 *
 * 2. TẠO GOOGLE APPS SCRIPT:
 *    - Trong Google Sheet, đi tới "Tiện ích mở rộng" > "Apps Script".
 *    - Xóa mã mặc định trong tệp `Code.gs` và dán toàn bộ mã nguồn bên dưới vào.
 *    - Thay thế 'YOUR_SHEET_ID_HERE' bằng ID của Google Sheet của bạn.
 *      (Bạn có thể tìm thấy ID trong URL của sheet, ví dụ: https://docs.google.com/spreadsheets/d/SHEET_ID_IS_HERE/edit)
 *    - Lưu dự án.
 *
 * 3. TRIỂN KHAI WEB APP:
 *    - Nhấp vào "Triển khai" > "Triển khai mới".
 *    - Trong mục "Chọn loại", chọn "Ứng dụng web".
 *    - Trong mục "Ai có quyền truy cập", chọn "Bất kỳ ai".
 *    - Nhấp vào "Triển khai".
 *    - Cấp quyền cho script khi được yêu cầu.
 *    - Sao chép "URL ứng dụng web" được cung cấp. Đây chính là URL bạn sẽ dán vào mã nguồn.
 *
 * 4. CẬP NHẬT MÃ NGUỒN ỨNG DỤNG:
 *    - Mở tệp `src/app/checkout/page.tsx` trong dự án của bạn.
 *    - Tìm dòng `const SCRIPT_URL = 'YOUR_GOOGLE_APPS_SCRIPT_URL_HERE';`
 *    - Dán URL ứng dụng web bạn vừa sao chép để thay thế `YOUR_GOOGLE_APPS_SCRIPT_URL_HERE`.
 *
 * ---- MÃ NGUỒN GOOGLE APPS SCRIPT ----
 */

// Thay thế ID của Google Sheet của bạn vào đây.
const SHEET_ID = 'YOUR_SHEET_ID_HERE';
const SHEET_NAME = 'Bảng_1'; // Tên trang tính trong Google Sheet của bạn.

function doPost(e) {
  try {
    const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(SHEET_NAME);

    const newRow = [
      e.parameter.orderId,        // Cột A: Số thứ tự đơn hàng
      e.parameter.orderTime,      // Cột B: Thời gian đặt hàng
      e.parameter.customerName,   // Cột C: Họ và tên
      e.parameter.phone,          // Cột D: Số điện thoại
      e.parameter.address,        // Cột E: Địa chỉ nhận hàng
      e.parameter.notes,          // Cột F: Ghi chú
      e.parameter.products,       // Cột G: Sản phẩm
      e.parameter.totalPrice      // Cột H: Tổng tiền
    ];

    sheet.appendRow(newRow);

    // Bắt buộc phải có dòng trả về này để tránh lỗi CORS trên trình duyệt
    return ContentService.createTextOutput(JSON.stringify({ result: 'success' }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ result: 'error', error: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
