# Hướng dẫn sửa lỗi 400 Bad Request khi cập nhật trạng thái cuộc hẹn

## Vấn đề

Khi gửi request POST đến endpoint `/api/appointment-update/147/status`, bạn nhận được lỗi 400 Bad Request với thông báo:

```json
{
  "success": false,
  "message": "Invalid status. Must be one of: pending, confirmed, completed, cancelled",
  "data": null,
  "timestamp": "2025-07-09T14:41:32.339Z"
}
```

mặc dù bạn đã gửi body với status là "confirmed":

```json
{
  "status": "confirmed"
}
```

## Nguyên nhân có thể

1. **Khoảng trắng thừa**: Có thể có khoảng trắng ở đầu/cuối giá trị status
2. **Vấn đề chữ hoa/thường**: Giá trị status phải chính xác là "confirmed" (không phải "Confirmed" hoặc "CONFIRMED")
3. **Sai định dạng JSON**: Body không được parse đúng thành JSON
4. **Content-Type không đúng**: Header Content-Type phải là "application/json"
5. **Thiếu header**: Thiếu các header cần thiết cho request
6. **Mã hóa ký tự**: Có thể có vấn đề với mã hóa ký tự trong request

## Cách kiểm tra và sửa

### 1. Kiểm tra JSON body

- Đảm bảo chuỗi JSON hợp lệ và không có ký tự đặc biệt
- Kiểm tra lại có đúng là `"status": "confirmed"` không (bao gồm dấu ngoặc kép)

```json
{
  "status": "confirmed"
}
```

### 2. Kiểm tra headers

Đảm bảo có đủ các headers:
- `Content-Type: application/json` 
- `Authorization: Bearer YOUR_TOKEN`

### 3. Sử dụng các giá trị status khác

Thử với các giá trị status khác để xem có vấn đề tương tự không:
- `pending`
- `completed`
- `cancelled`

### 4. Thử sử dụng body có định dạng text thay vì JSON

Thay đổi định dạng trong Postman từ JSON sang "x-www-form-urlencoded" và gửi:
- Key: status
- Value: confirmed

### 5. Kiểm tra log server

Khi gửi request, kiểm tra log của server để xem:
- Request body đã được nhận đúng chưa
- Có lỗi xảy ra trong quá trình xử lý không
- Status được nhận từ request có giá trị gì

## Giải pháp

1. **Làm mới token**: Đăng nhập lại để lấy token mới
2. **Sử dụng API test**: Mở file `test-appointment-status.html` để test dễ dàng hơn
3. **Kiểm tra ID appointment**: Xác nhận rằng ID 147 tồn tại trong database
4. **Debug từ server**: Chạy script `debug-status-update.js` để xem chi tiết request/response

## Lưu ý

- Nếu bạn thử nhiều cách mà vẫn gặp lỗi, có thể vấn đề nằm ở phía server
- Có thể cần kiểm tra lại mã nguồn để xem controller xử lý request như thế nào
- Nếu có thể, thử tạo appointment mới và cập nhật trạng thái của appointment đó
