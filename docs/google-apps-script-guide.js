/**
 * HƯỚNG DẪN TÍCH HỢP GOOGLE SHEETS
 * 
 * Mã nguồn đã được cập nhật để tăng độ tin cậy và dễ gỡ lỗi hơn.
 * Vui lòng làm theo các bước sau, KỂ CẢ KHI BẠN ĐÃ LÀM TRƯỚC ĐÓ.
 * Việc triển khai lại là rất quan trọng.
 * 
 * 1. TẠO GOOGLE SHEET:
 *    - Mở Google Sheet: https://docs.google.com/spreadsheets/d/1ykIza10WFpDRGDiEifTuMI3PyZNHMtpDnK8XWd028UY/
 *    - Đảm bảo tên trang tính (sheet tab) ở dưới cùng là "Bảng_1".
 *    - Đảm bảo các cột sau có ở hàng đầu tiên (hàng 1):
 *      A: Số thứ tự đơn hàng
 *      B: Thời gian đặt hàng
 *      C: Họ và tên
 *      D: Số điện thoại
 *      E: Địa chỉ nhận hàng
 *      F: Ghi chú
 *      G: Sản phẩm
 *      H: Tổng tiền
 *
 * 2. CẬP NHẬT GOOGLE APPS SCRIPT:
 *    - Trong Google Sheet, đi tới "Tiện ích mở rộng" > "Apps Script".
 *    - Xóa TOÀN BỘ mã mặc định trong tệp `Code.gs`.
 *    - Dán TOÀN BỘ mã nguồn mới bên dưới vào.
 *    - Lưu dự án (biểu tượng đĩa mềm).
 *
 * 3. TRIỂN KHAI LẠI WEB APP (BẮT BUỘC):
 *    - Nhấp vào "Triển khai" > "Quản lý các bản triển khai".
 *    - Tìm bản triển khai đang hoạt động của bạn (thường là phiên bản mới nhất).
 *    - Nhấp vào biểu tượng cây bút chì ("Chỉnh sửa").
 *    - Trong mục "Phiên bản", chọn "Phiên bản mới".
 *    - Nhấp vào "Triển khai".
 *    - **QUAN TRỌNG:** URL ứng dụng web của bạn sẽ KHÔNG THAY ĐỔI nếu bạn chỉnh sửa bản triển khai hiện có. Điều này đảm bảo ứng dụng của bạn tiếp tục hoạt động.
 *
 * ---- MÃ NGUỒN GOOGLE APPS SCRIPT MỚI ----
 */

const SHEET_ID = '1ykIza10WFpDRGDiEifTuMI3PyZNHMtpDnK8XWd028UY';
const SHEET_NAME = 'Bảng_1';

// This function handles POST requests from your web app.
function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(30000); // Wait up to 30 seconds for other processes to finish.

  try {
    const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(SHEET_NAME);
    if (!sheet) {
      throw new Error(`Sheet with name "${SHEET_NAME}" not found. Please check the sheet name.`);
    }

    const data = e.parameter;

    // A simple check to see if we received any data.
    if (!data.orderId) {
      throw new Error("No data received. The request may have been empty.");
    }
    
    // The columns in your Google Sheet must be in this exact order.
    const newRow = [
      data.orderId,
      data.orderTime,
      data.customerName,
      data.phone,
      data.address,
      data.notes,
      data.products,
      data.totalPrice
    ];

    sheet.appendRow(newRow);

    lock.releaseLock();
    
    // Return a success response.
    return ContentService
      .createTextOutput(JSON.stringify({ result: 'success' }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    lock.releaseLock();
    
    // Log the actual error to the Apps Script console for debugging.
    console.error(error.toString());

    // Return a failure response.
    return ContentService
      .createTextOutput(JSON.stringify({ result: 'error', error: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
