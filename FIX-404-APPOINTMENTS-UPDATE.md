# Hướng dẫn sửa lỗi 404 cho API cập nhật trạng thái appointment

## Vấn đề

Khi gọi endpoint `/api/appointments-update/147/status` bằng phương thức POST, server trả về lỗi 404 Not Found với thông báo "Route POST /api/appointments-update/147/status not found".

## Nguyên nhân

Sau khi phân tích code, chúng tôi đã tìm thấy các vấn đề sau:

1. **Không nhất quán về tên endpoints**: Có nhiều định dạng khác nhau cho cùng một chức năng:
   - `/api/appointments-update/:id/status` (số nhiều, với gạch ngang)
   - `/api/appointment-status/:id` (số ít, định dạng khác)
   - `/api/appointments/:id/status` (số nhiều, RESTful chuẩn)

2. **Đăng ký route không đồng bộ**: Nhiều file đăng ký route tương tự nhưng với đường dẫn khác nhau:
   - `app.js` đăng ký `/api/appointments-update`
   - `status-update-endpoint.js` đăng ký `/api/appointment-status`

3. **Frontend gọi sai endpoint**: Frontend đang gọi `/api/appointments-update/:id/status` nhưng server có thể chỉ nhận diện `/api/appointment-status/:id`

## Giải pháp

### 1. Đã chuẩn hóa tất cả endpoint về dạng số nhiều

- Sửa `status-update-endpoint.js` để sử dụng `/api/appointments-update/:id/status`
- Giữ nguyên cấu hình trong `app.js`: `app.use('/api/appointments-update', createAppointmentsStatusRoutes());`
- Giữ nguyên code frontend gọi endpoint số nhiều

### 2. Cập nhật tài liệu

- Tạo `URL-PATH-FIX-UPDATED.md` với thông tin mới về chuẩn hóa endpoint
- Giữ lại tài liệu cũ để tham khảo

### 3. Cải thiện quy trình khởi động server

- Tạo script `restart-server-fixed.ps1` với tính năng debug chi tiết hơn
- Thêm biến môi trường để hiển thị nhiều thông tin hơn khi khởi động

### 4. Tạo công cụ kiểm tra endpoint

- Tạo script `test-appointment-endpoints.js` để kiểm tra các endpoint khác nhau
- Cung cấp file `test-package.json` để dễ dàng chạy script test

## Hướng dẫn kiểm tra

### Bước 1: Khởi động lại server

```powershell
# Chạy script khởi động lại với debug chi tiết
.\restart-server-fixed.ps1
```

### Bước 2: Kiểm tra endpoints bằng script test

```powershell
cd server
npm --prefix . -p test-package.json test
```

### Bước 3: Kiểm tra trực tiếp với Postman

- **URL**: http://localhost:5000/api/appointments-update/147/status
- **Method**: POST
- **Headers**:
  - Content-Type: application/json
  - Authorization: Bearer [your_token]
- **Body**:
  ```json
  {
    "status": "confirmed"
  }
  ```

### Bước 4: Kiểm tra từ frontend

- Đăng nhập vào tài khoản coach
- Điều hướng đến trang CoachBookings
- Thử cập nhật trạng thái của một cuộc hẹn
- Mở DevTools (F12) để theo dõi network request

## Lưu ý

- Nếu vấn đề vẫn còn, hãy kiểm tra log server để xem chi tiết lỗi
- Đảm bảo đã kill hết các tiến trình node đang chạy trước khi khởi động lại
- Xác nhận rằng cổng 5000 không bị chiếm bởi ứng dụng khác
