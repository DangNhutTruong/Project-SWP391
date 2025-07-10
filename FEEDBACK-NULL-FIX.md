# Sửa lỗi đánh giá cuộc hẹn - Feedback Content NULL

## Vấn đề

Khi người dùng hoàn thành một cuộc hẹn và gửi đánh giá (rating) nhưng không nhập nội dung đánh giá, hệ thống gặp lỗi SQL:

```
ER_BAD_NULL_ERROR: Column 'content' cannot be null
```

Lỗi xảy ra tại `appointmentController.js:270:24` khi thực hiện lệnh INSERT vào bảng feedback:

```sql
INSERT INTO feedback (coach_id, smoker_id, rating, content) VALUES (4, 3, 5, NULL)
```

## Nguyên nhân

1. **Sai tên trường trong frontend**: Frontend gửi dữ liệu với tên trường là `feedback` nhưng backend mong đợi trường `content`.
2. **Database không cho phép NULL**: Cột `content` trong bảng `feedback` được cấu hình không cho phép giá trị NULL.
3. **Không kiểm tra giá trị trống**: Không có xử lý cho trường hợp người dùng không nhập nội dung đánh giá.

## Giải pháp

1. **Sửa tên trường trong frontend**: Thay đổi tên trường từ `feedback` thành `content` để khớp với backend.
2. **Cung cấp giá trị mặc định**: Đảm bảo gửi ít nhất một ký tự khoảng trắng nếu người dùng không nhập nội dung.

### Chi tiết thay đổi

1. Cập nhật hàm `handleRatingSubmit` trong file `AppointmentList.jsx`:

```javascript
// Trước khi sửa
const ratingData = {
  rating: rating,
  feedback: ratingComment
};

// Sau khi sửa
const ratingData = {
  rating: rating,
  content: ratingComment || ' ' // Cung cấp một khoảng trắng nếu rỗng
};
```

2. Cập nhật cập nhật state local:

```javascript
// Trước khi sửa
return {
  ...appointment,
  rating: rating,
  feedback: ratingComment,
  rated_at: new Date().toISOString()
};

// Sau khi sửa
return {
  ...appointment,
  rating: rating,
  content: ratingComment || ' ', // Sử dụng content thay vì feedback
  rated_at: new Date().toISOString()
};
```

## Cách kiểm tra

1. Đăng nhập vào ứng dụng với tài khoản người dùng
2. Chọn một cuộc hẹn đã hoàn thành (status = "completed")
3. Mở modal đánh giá bằng cách nhấn nút "Đánh giá"
4. Chọn số sao (1-5)
5. Bỏ trống phần nội dung đánh giá và nhấn nút "Gửi đánh giá"
6. Kiểm tra xem đánh giá có được gửi thành công không

## Lưu ý về cải tiến trong tương lai

1. **Thay đổi cấu hình database**: Cân nhắc cho phép cột `content` nhận giá trị NULL trong bảng `feedback`.
2. **Validation ở backend**: Thêm xử lý validation ở backend để đảm bảo nếu nhận được giá trị NULL thì tự động chuyển thành chuỗi rỗng hoặc giá trị mặc định.
3. **Thống nhất convention**: Thống nhất việc đặt tên các trường dữ liệu trong toàn bộ ứng dụng để tránh sự nhầm lẫn giữa `feedback` và `content`.
