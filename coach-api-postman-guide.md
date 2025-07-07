# Hướng dẫn test API Coach với Postman

> **Lưu ý quan trọng:** Hệ thống này sử dụng bảng `users` với `role='coach'` thay vì sử dụng bảng `coaches` riêng. Ngoài ra chúng ta sử dụng bảng `coach_availability` để theo dõi lịch trình của coach và lưu đánh giá trong bảng `appointments`.

## Chuẩn bị

1. Khởi động server backend bằng cách chạy lệnh sau trong thư mục `server`:
   ```
   npm run dev
   ```

2. Import collection Postman (được đính kèm dưới đây)

## Các API endpoints Coach

### 1. Lấy danh sách tất cả coaches

- **URL:** GET http://localhost:5000/api/coaches
- **Description:** Trả về danh sách tất cả coaches kèm theo thông tin đánh giá trung bình

**Cách test:**
1. Mở Postman và tạo request GET mới
2. Nhập URL: `http://localhost:5000/api/coaches`
3. Click Send
4. Kiểm tra kết quả trả về với status code 200 và danh sách coaches

**Kết quả mẫu:**
```json
{
  "success": true,
  "message": "Coaches fetched successfully",
  "data": [
    {
      "id": 1,
      "username": "coach_a",
      "email": "coach_a@example.com",
      "full_name": "Nguyễn Văn A",
      "role": "coach",
      "bio": "Với 10 năm kinh nghiệm hỗ trợ người cai thuốc lá, tôi đã giúp hơn 500 người bỏ thuốc thành công.",
      "specialization": "Cai thuốc lá, tư vấn tâm lý",
      "experience": 10,
      "avatar": "https://randomuser.me/api/portraits/men/32.jpg",
      "avg_rating": 4.5,
      "review_count": 2
    },
    // Các coaches khác...
  ]
}
```

### 2. Lấy thông tin chi tiết về một coach

- **URL:** GET http://localhost:5000/api/coaches/:id
- **Description:** Trả về thông tin chi tiết của một coach theo ID

**Cách test:**
1. Mở Postman và tạo request GET mới
2. Nhập URL: `http://localhost:5000/api/coaches/1` (thay 1 bằng ID coach bạn muốn xem)
3. Click Send
4. Kiểm tra kết quả trả về với status code 200 và thông tin chi tiết của coach

**Kết quả mẫu:**
```json
{
  "success": true,
  "message": "Coach fetched successfully",
  "data": {
    "id": 1,
    "username": "coach_a",
    "email": "coach_a@example.com",
    "full_name": "Nguyễn Văn A",
    "role": "coach",
    "bio": "Với 10 năm kinh nghiệm hỗ trợ người cai thuốc lá, tôi đã giúp hơn 500 người bỏ thuốc thành công.",
    "specialization": "Cai thuốc lá, tư vấn tâm lý",
    "experience": 10,
    "avatar": "https://randomuser.me/api/portraits/men/32.jpg",
    "avg_rating": 4.5,
    "review_count": 2
  }
}
```

### 3. Lấy thông tin về lịch làm việc của coach

- **URL:** GET http://localhost:5000/api/coaches/:id/availability
- **Description:** Trả về thông tin về lịch làm việc và các khung giờ không khả dụng của coach

**Cách test:**
1. Mở Postman và tạo request GET mới
2. Nhập URL: `http://localhost:5000/api/coaches/1/availability` (thay 1 bằng ID coach bạn muốn xem)
3. Click Send
4. Kiểm tra kết quả trả về với status code 200 và thông tin lịch làm việc

**Kết quả mẫu:**
```json
{
  "success": true,
  "message": "Coach availability fetched successfully",
  "data": {
    "coach_id": 1,
    "working_hours": "08:00-22:00",
    "available_slots": [
      {
        "id": 1,
        "day_of_week": 1,
        "time_start": "08:00",
        "time_end": "10:00",
        "available": 1
      },
      {
        "id": 2,
        "day_of_week": 1,
        "time_start": "14:00",
        "time_end": "16:00",
        "available": 1
      },
      {
        "id": 3,
        "day_of_week": 2,
        "time_start": "08:00",
        "time_end": "12:00",
        "available": 1
      }
    ],
    "booked_appointments": [
      {
        "id": 1,
        "date": "2025-07-10",
        "time": "09:00",
        "status": "confirmed"
      }
    ]
  }
}
```

### 4. Lấy danh sách đánh giá của coach

- **URL:** GET http://localhost:5000/api/coaches/:id/reviews
- **Description:** Trả về danh sách đánh giá của coach từ người dùng

**Cách test:**
1. Mở Postman và tạo request GET mới
2. Nhập URL: `http://localhost:5000/api/coaches/1/reviews` (thay 1 bằng ID coach bạn muốn xem)
3. Click Send
4. Kiểm tra kết quả trả về với status code 200 và danh sách đánh giá

**Kết quả mẫu:**
```json
{
  "success": true,
  "message": "Coach reviews fetched successfully",
  "data": [
    {
      "id": 1,
      "coach_id": 1,
      "user_id": 1,
      "rating": 5,
      "review_text": "Coach A đã giúp tôi bỏ thuốc thành công sau 15 năm hút. Phương pháp của anh rất hiệu quả và dễ thực hiện.",
      "created_at": "2025-07-01T10:30:00.000Z",
      "updated_at": "2025-07-01T10:30:00.000Z",
      "user_name": "Nguyễn Văn X",
      "user_avatar": "path/to/avatar.jpg"
    },
    // Các đánh giá khác...
  ]
}
```

### 5. Thêm đánh giá cho coach

- **URL:** POST http://localhost:5000/api/coaches/:id/feedback
- **Description:** Thêm đánh giá mới hoặc cập nhật đánh giá hiện có cho coach
- **Yêu cầu xác thực:** Cần token JWT

**Cách test:**
1. Mở Postman và tạo request POST mới
2. Nhập URL: `http://localhost:5000/api/coaches/1/feedback` (thay 1 bằng ID coach bạn muốn đánh giá)
3. Trong tab Headers, thêm header:
   - Key: `Authorization`
   - Value: `Bearer your_jwt_token` (thay your_jwt_token bằng token xác thực)
4. Trong tab Body, chọn raw và JSON, nhập:
   ```json
   {
     "rating": 5,
     "review_text": "Coach rất tận tâm và chuyên nghiệp, đã giúp tôi rất nhiều trong hành trình cai thuốc lá."
   }
   ```
5. Click Send
6. Kiểm tra kết quả trả về với status code 201 và thông báo thành công

**Kết quả mẫu:**
```json
{
  "success": true,
  "message": "Review added",
  "data": {
    "id": 5
  }
}
```

## Sử dụng collection Postman

Để dễ dàng test các API, bạn có thể sử dụng collection Postman được tạo sẵn. Dưới đây là nội dung collection có thể lưu vào file JSON và import vào Postman:

```json
{
  "info": {
    "_postman_id": "a1b2c3d4-e5f6-g7h8-i9j0-k1l2m3n4o5p6",
    "name": "NoSmoke Coach APIs",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Get All Coaches",
      "request": {
        "method": "GET",
        "header": [],
        "url": {
          "raw": "http://localhost:5000/api/coaches",
          "protocol": "http",
          "host": ["localhost"],
          "port": "5000",
          "path": ["api", "coaches"]
        }
      },
      "response": []
    },
    {
      "name": "Get Coach By ID",
      "request": {
        "method": "GET",
        "header": [],
        "url": {
          "raw": "http://localhost:5000/api/coaches/1",
          "protocol": "http",
          "host": ["localhost"],
          "port": "5000",
          "path": ["api", "coaches", "1"]
        }
      },
      "response": []
    },
    {
      "name": "Get Coach Availability",
      "request": {
        "method": "GET",
        "header": [],
        "url": {
          "raw": "http://localhost:5000/api/coaches/1/availability",
          "protocol": "http",
          "host": ["localhost"],
          "port": "5000",
          "path": ["api", "coaches", "1", "availability"]
        }
      },
      "response": []
    },
    {
      "name": "Get Coach Reviews",
      "request": {
        "method": "GET",
        "header": [],
        "url": {
          "raw": "http://localhost:5000/api/coaches/1/reviews",
          "protocol": "http",
          "host": ["localhost"],
          "port": "5000",
          "path": ["api", "coaches", "1", "reviews"]
        }
      },
      "response": []
    },
    {
      "name": "Add Coach Feedback",
      "request": {
        "method": "POST",
        "header": [
          {
            "key": "Authorization",
            "value": "Bearer {{jwt_token}}",
            "type": "text"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"rating\": 5,\n  \"review_text\": \"Coach rất tận tâm và chuyên nghiệp, đã giúp tôi rất nhiều trong hành trình cai thuốc lá.\"\n}",
          "options": {
            "raw": {
              "language": "json"
            }
          }
        },
        "url": {
          "raw": "http://localhost:5000/api/coaches/1/feedback",
          "protocol": "http",
          "host": ["localhost"],
          "port": "5000",
          "path": ["api", "coaches", "1", "feedback"]
        }
      },
      "response": []
    }
  ],
  "variable": [
    {
      "key": "jwt_token",
      "value": "your_jwt_token_here"
    }
  ]
}
```

## Lưu ý về xác thực

Để test API thêm đánh giá (endpoint cuối cùng), bạn cần có JWT token hợp lệ. Bạn có thể lấy token bằng cách:

1. Đăng nhập vào hệ thống qua endpoint `/api/auth/login`
2. Lấy token từ response và thay thế `your_jwt_token` trong collection Postman hoặc trong header `Authorization`

## Kiểm tra database

Nếu bạn muốn kiểm tra dữ liệu trực tiếp trong database, bạn có thể sử dụng các câu lệnh SQL sau:

```sql
-- Kiểm tra dữ liệu coaches (từ bảng users với role='coach')
SELECT * FROM users WHERE role = 'coach';

-- Kiểm tra lịch làm việc
SELECT * FROM coach_availability WHERE user_id = 1;

-- Kiểm tra đánh giá (từ bảng appointments)
SELECT 
    a.id, a.coach_id, a.user_id, a.rating, a.review_text, a.date, a.created_at, a.updated_at,
    u.full_name as user_name,
    u.avatar as user_avatar
FROM appointments a
JOIN users u ON a.user_id = u.id
WHERE a.coach_id = 1 AND a.rating IS NOT NULL;

-- Kiểm tra các cuộc hẹn đã đặt
SELECT * FROM appointments WHERE coach_id = 1;
```
