# HƯỚNG DẪN MỞ RỘNG MEMBERSHIP ENUM

Tài liệu này hướng dẫn cách mở rộng và sửa lỗi liên quan đến việc mua gói Pro không được cập nhật đúng vào cột `membership` trong bảng `users`.

## VẤN ĐỀ

Khi mua gói Premium, cột `membership` trong bảng `users` được cập nhật thành "premium", nhưng khi mua gói Pro, cột này vẫn giữ nguyên giá trị cũ (không cập nhật thành "pro").

Nguyên nhân:
1. Cột `membership` trong bảng `users` có thể là kiểu ENUM chỉ bao gồm 'free' và 'premium'
2. Code hiện tại chỉ phân biệt gói 'free' (id=1) và 'premium' (id khác 1), chưa xử lý riêng cho gói 'pro'

## CÁCH KHẮC PHỤC

### Bước 1: Kiểm tra cấu trúc các gói hiện có

```bash
# Chạy script kiểm tra các gói trong database
npm run check-packages
```

Script này sẽ hiển thị thông tin về các gói hiện có trong bảng `package` và kiểm tra xem cột `membership` có hỗ trợ giá trị 'pro' hay không.

### Bước 2: Mở rộng cột membership để hỗ trợ giá trị 'pro'

```bash
# Chạy script mở rộng cột membership
npm run extend-membership
```

Script này sẽ:
- Kiểm tra cột `membership` trong bảng `users`
- Sửa định nghĩa ENUM để bao gồm giá trị 'pro'
- Cập nhật các người dùng đã mua gói Pro nhưng chưa được đánh dấu đúng

### Bước 3: Khởi động lại server

```bash
# Khởi động lại server với code mới
npm run dev
```

### Bước 4: Test mua gói Pro

Sử dụng Postman để test API mua gói Pro:

```
POST http://localhost:3001/api/packages/purchase
Headers: 
  Authorization: Bearer <token>
Body:
{
  "packageId": <id_của_gói_pro>,
  "paymentMethod": "momo"
}
```

## CÁC THAY ĐỔI TRONG CODE

1. **Cập nhật file `Membership.js`**:
   - Kiểm tra tên gói để xác định loại membership (free, premium, pro)
   - Kiểm tra xem giá trị có hợp lệ với định nghĩa ENUM không
   - Cập nhật giá trị thích hợp dựa trên tên gói

2. **Mở rộng cột `membership` trong database**:
   - Thay đổi định nghĩa ENUM từ ENUM('free', 'premium') thành ENUM('free', 'premium', 'pro')

## KIỂM TRA SAU KHI KHẮC PHỤC

1. Sau khi mua gói Pro thành công, kiểm tra giá trị trong bảng `users`:
   ```sql
   SELECT id, email, full_name, membership, membership_id FROM users WHERE id = <your_user_id>;
   ```

2. Giá trị `membership` phải là "pro" và `membership_id` phải là ID của gói Pro.

3. Kiểm tra thông qua API:
   ```
   GET http://localhost:3001/api/packages/user/current
   Headers: 
     Authorization: Bearer <token>
   ```

## LƯU Ý

- Nếu cột `membership` trong bảng `users` không phải kiểu ENUM, script vẫn sẽ hoạt động bình thường
- Nếu đang sử dụng gói Pro với tên không chứa từ "pro", hãy cập nhật tên gói trong bảng `package`
