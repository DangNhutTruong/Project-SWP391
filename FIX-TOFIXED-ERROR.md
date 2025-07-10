# Sửa lỗi toFixed trong trang BookAppointment

## Vấn đề

Trong trang BookAppointment, chúng ta gặp lỗi TypeError:

```
TypeError: (coach.avg_rating || 5).toFixed is not a function
   at http://localhost:5175/src/page/BookAppointment.jsx:347:113
```

Lỗi này xảy ra khi trang hiển thị danh sách coach và cố gắng định dạng đánh giá trung bình (avg_rating) của coach.

## Nguyên nhân

Phương thức `toFixed()` chỉ tồn tại trên kiểu dữ liệu number trong JavaScript. Lỗi này xảy ra vì giá trị `coach.avg_rating` có thể không phải là số (number) mà là chuỗi (string) hoặc một kiểu dữ liệu khác không có phương thức `toFixed()`.

Đoạn code gây lỗi:
```jsx
<span className="rating-value">{(coach.avg_rating || 5).toFixed(1)}</span>
```

## Giải pháp

Sử dụng `parseFloat()` để chuyển đổi giá trị của `coach.avg_rating` thành kiểu số trước khi gọi phương thức `toFixed()`:

```jsx
<span className="rating-value">{parseFloat(coach.avg_rating || 5).toFixed(1)}</span>
```

Ngoài ra, chúng ta cũng cần áp dụng `parseFloat()` cho các trường hợp khác sử dụng `coach.avg_rating` trong đoạn mã tương tự:

```jsx
<span className="stars">{'★'.repeat(Math.floor(parseFloat(coach.avg_rating || 5)))}{parseFloat(coach.avg_rating || 5) % 1 > 0 ? '☆' : ''}</span>
```

## Các thay đổi đã thực hiện

1. Thêm `parseFloat()` vào tất cả các vị trí sử dụng `coach.avg_rating` trong render để đảm bảo nó được xử lý như một số.
2. Giữ nguyên logic fallback `|| 5` để đảm bảo luôn có một giá trị mặc định nếu `avg_rating` là null hoặc undefined.

## Cách kiểm tra

Để kiểm tra xem lỗi đã được khắc phục:

1. Khởi động lại frontend:
   ```
   cd d:\Ky5\SWP391\CodeGit\Project-SWP391
   npm run dev
   ```

2. Truy cập trang đặt lịch hẹn: http://localhost:5175/book-appointment

3. Kiểm tra xem danh sách coach có hiển thị đúng với đánh giá sao không

4. Mở DevTools (F12) và kiểm tra console để đảm bảo không còn lỗi TypeError

## Lưu ý bổ sung

Để tránh các lỗi tương tự trong tương lai, nên cân nhắc:

1. Xác định rõ kiểu dữ liệu được trả về từ API
2. Thêm kiểm tra kiểu dữ liệu và chuyển đổi ở phía backend trước khi gửi đến frontend
3. Sử dụng TypeScript để giúp phát hiện các vấn đề về kiểu dữ liệu trong quá trình phát triển
