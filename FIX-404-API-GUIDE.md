# Hướng dẫn sửa lỗi 404 Not Found cho API status update

## Vấn đề đã phát hiện

Endpoint `/api/appointment-update/:id/status` đang trả về lỗi 404 Not Found. Sau khi kiểm tra, chúng tôi nhận thấy:

1. Đường dẫn import trong file `appointmentStatusRoutes.js` không chính xác
2. Server cần khởi động lại để áp dụng thay đổi

## Bước 1: Sửa đường dẫn import

File `server/src/routes/appointmentStatusRoutes.js` cần sửa đường dẫn import như sau:

```javascript
// Thay đổi từ
import { requireAuth } from './src/middleware/authMiddleware.js';
import * as appointmentController from './src/controllers/appointmentController.js';

// Thành
import { requireAuth } from '../middleware/authMiddleware.js';
import * as appointmentController from '../controllers/appointmentController.js';
```

## Bước 2: Khởi động lại server

Dừng server hiện tại và khởi động lại:

```bash
# Dừng server (thay [PID] bằng Process ID thực tế)
taskkill /PID [PID] /F

# Di chuyển vào thư mục server
cd server

# Khởi động lại server
node server.js
```

Hoặc sử dụng script `start-server.ps1` đã tạo:

```powershell
powershell -ExecutionPolicy Bypass -File start-server.ps1
```

## Bước 3: Kiểm tra endpoint với Postman

1. Mở Postman
2. Tạo request mới với phương thức **POST**
3. URL: `http://localhost:5000/api/appointment-update/148/status` 
   (thay 148 bằng ID cuộc hẹn thực tế)
4. Headers:
   - Content-Type: application/json
   - Authorization: Bearer [YOUR_TOKEN]
5. Body (raw, JSON):
   ```json
   {
     "status": "confirmed"
   }
   ```
6. Gửi request và kiểm tra kết quả

## Bước 4: Kiểm tra từ frontend

1. Đăng nhập với tài khoản coach
2. Điều hướng đến trang quản lý lịch hẹn
3. Thử cập nhật trạng thái một cuộc hẹn
4. Mở Console (F12) để theo dõi quá trình thực hiện và xem log

## Lưu ý quan trọng

- Đảm bảo server đã khởi động lại sau khi sửa đổi
- Kiểm tra file log server để thấy chi tiết về request và lỗi
- Xác nhận token hợp lệ khi test với Postman (token phải của tài khoản coach)

## Thông báo lỗi thường gặp và cách xử lý

| Lỗi | Nguyên nhân | Giải pháp |
|-----|------------|-----------|
| 404 Not Found | Route không được định nghĩa hoặc server chưa khởi động lại | Khởi động lại server |
| 401 Unauthorized | Token không hợp lệ hoặc hết hạn | Đăng nhập lại để lấy token mới |
| 403 Forbidden | Tài khoản không phải coach | Sử dụng tài khoản coach |
