# Fix cho lỗi 400 Bad Request khi cập nhật trạng thái appointment

## Vấn đề đã phát hiện

Khi gửi request POST đến endpoint `/api/appointment-update/147/status`, nhận được lỗi 400 Bad Request với thông báo:

```json
{
  "success": false,
  "message": "Invalid status. Must be one of: pending, confirmed, completed, cancelled",
  "data": null
}
```

mặc dù đã gửi body với giá trị `"status": "confirmed"` (là một trong những giá trị được chấp nhận).

## Nguyên nhân

Sau khi kiểm tra code và database, chúng tôi đã xác định được một số nguyên nhân tiềm ẩn:

1. **Validation trong controller**: Có thể có vấn đề với hàm kiểm tra status
2. **Định dạng request body**: Có thể body request không được parse đúng cách
3. **Khoảng trắng không mong muốn**: Giá trị status có thể chứa khoảng trắng
4. **Định dạng case-sensitive**: Có thể hệ thống phân biệt chữ hoa/thường

## Giải pháp

### 1. Sửa lỗi trong mã nguồn controller

```javascript
// Thêm bước kiểm tra và log chi tiết
console.log('Status từ request:', status);
console.log('Type of status:', typeof status);
console.log('Giá trị status sau khi trim:', status ? status.trim() : 'undefined');

// Sửa đoạn kiểm tra validStatuses
const validStatuses = ['pending', 'confirmed', 'completed', 'cancelled'];
const normalizedStatus = status ? status.trim().toLowerCase() : null;
if (!normalizedStatus || !validStatuses.includes(normalizedStatus)) {
    return sendResponse(res, 400, false, 'Invalid status. Must be one of: pending, confirmed, completed, cancelled', null);
}
```

### 2. Điều chỉnh frontend để đảm bảo định dạng đúng

```javascript
// Đảm bảo status được chuẩn hóa trước khi gửi
const normalizedStatus = status.trim().toLowerCase();
body: JSON.stringify({ status: normalizedStatus })
```

### 3. Kiểm tra trực tiếp database

Để đảm bảo rằng appointment với ID 147 tồn tại trong database và có thể được cập nhật, chạy script `check-appointments-table.js`:

```javascript
// Kết quả sẽ cho biết record có tồn tại không và status hiện tại là gì
```

### 4. Thử với giá trị status khác

Nếu "confirmed" không hoạt động, thử với các giá trị khác:
- pending
- completed
- cancelled

## Cách triển khai

1. Khởi động lại server sau khi thay đổi
2. Sử dụng script `debug-status-api.js` để test API
3. Kiểm tra logs server để xem chi tiết lỗi

## Câu hỏi bổ sung

- API yêu cầu quyền truy cập nào? (coach/user)
- Appointment ID 147 có tồn tại trong hệ thống không?
- Token đang sử dụng có hợp lệ và có quyền không?
