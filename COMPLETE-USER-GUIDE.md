# 🎯 Hướng dẫn sử dụng hệ thống Appointment hoàn chỉnh

## 📋 Tổng quan hệ thống

Hệ thống appointment của bạn đã được **tích hợp hoàn chỉnh** giữa backend (Node.js/Express) và frontend (React/Vite) với các tính năng:

### ✅ Tính năng chính
- **Đặt lịch hẹn** với coach
- **Quản lý lịch hẹn** (xem, cập nhật, hủy)
- **Chat real-time** giữa user và coach
- **Đánh giá** sau buổi tư vấn
- **Dashboard coach** để quản lý booking
- **Hệ thống thông báo** tin nhắn chưa đọc

### 🏗️ Kiến trúc hệ thống
```
Frontend (React + Vite)     Backend (Node.js + Express)     Database (MySQL)
Port 5175                   Port 5000                       Railway Cloud
     |                           |                               |
     |-------- /api proxy ------>|                               |
     |                           |-------- SQL queries -------->|
     |<------- JSON response ----|                               |
```

## 🚀 Cách khởi động hệ thống

### Bước 1: Khởi động Backend
```bash
cd server
npm start
```
**Kết quả mong đợi:**
```
✅ Database connected successfully
🌐 Database host: trolley.proxy.rlwy.net
✅ Database tables verified and updated
🚀 Server running on port 5000
```

### Bước 2: Khởi động Frontend
```bash
npm run dev
```
**Kết quả mong đợi:**
```
VITE v6.3.5  ready in 456 ms
➜  Local:   http://localhost:5175/
```

### Bước 3: Verify tích hợp
```bash
node integration-test.js
```

## 📱 Hướng dẫn sử dụng cho User

### 1. Đăng ký/Đăng nhập
- Truy cập: `http://localhost:5175/login`
- Tạo tài khoản hoặc đăng nhập
- **Lưu ý**: Cần membership Premium/Pro để đặt lịch

### 2. Đặt lịch hẹn với Coach
- Vào trang: `http://localhost:5175/appointment`
- **Bước 1**: Chọn coach từ danh sách
- **Bước 2**: Chọn ngày trong calendar
- **Bước 3**: Chọn giờ (8:00-22:00)
- **Bước 4**: Xác nhận đặt lịch

### 3. Quản lý lịch hẹn
- Vào trang: `http://localhost:5175/profile`
- Xem danh sách lịch hẹn
- **Trạng thái**:
  - 🟡 **Pending**: Chờ coach xác nhận
  - 🟢 **Confirmed**: Đã xác nhận
  - 🔵 **Completed**: Đã hoàn thành
  - 🔴 **Cancelled**: Đã hủy

### 4. Chat với Coach
- Trong danh sách lịch hẹn, nhấn nút **"Nhắn tin"**
- Gửi/nhận tin nhắn real-time
- Thông báo tin nhắn chưa đọc (chấm đỏ)

### 5. Đánh giá Coach
- Sau khi hoàn thành buổi tư vấn
- Nhấn nút **"Đánh giá Coach"**
- Chọn số sao (1-5) và viết nhận xét

## 👨‍💼 Hướng dẫn sử dụng cho Coach

### 1. Đăng nhập Coach
- Đăng nhập với tài khoản có `role = 'coach'`

### 2. Quản lý Bookings
- Vào trang: `http://localhost:5175/coach/bookings`
- Xem tất cả booking được đặt

### 3. Xử lý yêu cầu đặt lịch
**Với booking Pending:**
- ✅ **Xác nhận**: Nhấn nút "Xác nhận"
- ❌ **Từ chối**: Nhấn nút "Từ chối"

**Với booking Confirmed:**
- ✅ **Hoàn thành**: Nhấn nút "Hoàn thành"
- ❌ **Hủy**: Nhấn nút "Hủy"

### 4. Chat với khách hàng
- Nhấn nút **"Nhắn tin"** trong booking
- Trả lời tin nhắn của khách hàng

### 5. Dashboard
- Vào trang: `http://localhost:5175/coach-dashboard`
- Xem thống kê:
  - Tổng số booking
  - Booking sắp tới
  - Booking đã hoàn thành
  - Số khách hàng

## 🔧 API Endpoints được sử dụng

### User APIs
```http
POST /api/appointments              # Tạo lịch hẹn
GET  /api/appointments/user         # Lấy lịch của user
PUT  /api/appointments/:id/cancel   # Hủy lịch hẹn
POST /api/appointments/:id/rate     # Đánh giá
```

### Coach APIs
```http
GET   /api/appointments/coach       # Lấy lịch của coach
PATCH /api/appointments/:id/status  # Cập nhật trạng thái
```

### Message APIs
```http
GET  /api/appointments/:id/messages      # Lấy tin nhắn
POST /api/appointments/:id/messages      # Gửi tin nhắn
POST /api/appointments/:id/messages/read # Đánh dấu đã đọc
```

## 📊 Flow hoạt động

### 1. Appointment Lifecycle
```
User đặt lịch → Pending → Coach xác nhận → Confirmed → Hoàn thành → Completed
                   ↓
                Từ chối → Cancelled
```

### 2. Message Flow
```
User gửi tin nhắn → Lưu DB → Coach nhận thông báo → Coach trả lời → User nhận tin nhắn
```

### 3. Rating Flow
```
Appointment = Completed → User có thể đánh giá → Rating lưu vào DB → Hiển thị trên profile Coach
```

## 🎨 Giao diện chính

### 1. BookAppointment Page
- **Calendar picker** để chọn ngày
- **Time slots** để chọn giờ
- **Coach cards** với avatar và thông tin
- **Step-by-step wizard**

### 2. AppointmentList Component
- **Card layout** cho mỗi appointment
- **Status badges** với màu sắc phân biệt
- **Action buttons**: Chat, Cancel, Rate, Reschedule
- **Filter tabs**: All, Upcoming, Past

### 3. CoachBookings Page
- **Booking cards** với thông tin chi tiết
- **Filter buttons**: All, Pending, Upcoming, Completed, Cancelled
- **Quick action buttons** cho mỗi booking

### 4. Chat Interface
- **Real-time messaging**
- **Message bubbles** phân biệt user/coach
- **Unread badges**
- **Auto-scroll** to latest message

## 🔍 Debugging & Troubleshooting

### 1. Kiểm tra kết nối
```bash
# Health check backend
curl http://localhost:5000/health

# Check frontend
curl http://localhost:5175
```

### 2. Kiểm tra database
```bash
# Run database fix
node fix-database-indexes.js
```

### 3. Check logs
- **Backend logs**: Console output của `npm start`
- **Frontend logs**: Browser Developer Tools
- **Network requests**: Browser Network tab

### 4. Common issues

**API calls failing:**
```javascript
// Check in browser console
fetch('/api/appointments/user', {
  headers: { 'Authorization': 'Bearer ' + localStorage.getItem('nosmoke_token') }
})
```

**Database errors:**
- Check Railway database connection
- Verify environment variables
- Run table creation scripts

**Authentication issues:**
- Check JWT token in localStorage
- Verify token expiration
- Check server JWT_SECRET

## 📱 Mobile Responsiveness

Giao diện đã được tối ưu cho:
- **Desktop**: Full layout với sidebar
- **Tablet**: Compressed layout
- **Mobile**: Stack layout với hamburger menu

## 🚀 Production Deployment

### 1. Build frontend
```bash
npm run build
```

### 2. Configure production environment
```env
NODE_ENV=production
DATABASE_URL=production_database_url
CORS_ORIGIN=https://your-domain.com
```

### 3. Deploy
- Frontend: Deploy `dist/` folder to static hosting
- Backend: Deploy to Node.js hosting service
- Database: Already on Railway

## 🎉 Kết luận

**Hệ thống appointment của bạn đã hoàn toàn sẵn sàng!**

### ✅ Những gì đã hoàn thành:
- Backend API đầy đủ với 13 endpoints
- Frontend với UI/UX hoàn chỉnh
- Database integration với Railway
- Real-time chat system
- Rating và review system
- Coach dashboard
- User appointment management
- Authentication & authorization
- Mobile responsive design

### 🎯 Có thể sử dụng ngay:
1. **Users** có thể đặt lịch, chat, đánh giá
2. **Coaches** có thể quản lý booking, trả lời chat
3. **System** tự động sync data giữa frontend-backend
4. **Database** lưu trữ persistent trên Railway

**Happy coding! 🚀**
