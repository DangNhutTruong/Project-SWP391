# 🎯 Hướng dẫn tích hợp Backend-Frontend cho Appointment System

## 📋 Tóm tắt hiện trạng

### ✅ Backend đã sẵn sàng (Port 5000)
- **Database**: Railway MySQL đã kết nối thành công
- **API Endpoints**: Đầy đủ 13 endpoints cho appointment system
- **Authentication**: JWT-based với middleware
- **Models**: Appointment model với đầy đủ CRUD operations
- **Controllers**: Appointment controller với error handling

### ✅ Frontend đã sẵn sàng (Port 5175)
- **Vite Config**: Proxy setup cho `/api` route
- **API Integration**: Utility functions đã hoàn thành
- **Components**: BookAppointment, AppointmentList, CoachBookings
- **Authentication**: AuthContext integration

## 🔧 Các API Endpoints có sẵn

### User Appointments
```
POST   /api/appointments              # Tạo lịch hẹn mới
GET    /api/appointments/user         # Lấy lịch hẹn của user
GET    /api/appointments/:id          # Chi tiết lịch hẹn
PUT    /api/appointments/:id          # Cập nhật lịch hẹn
DELETE /api/appointments/:id          # Xóa lịch hẹn
PUT    /api/appointments/:id/cancel   # Hủy lịch hẹn
POST   /api/appointments/:id/rate     # Đánh giá lịch hẹn
```

### Coach Appointments
```
GET    /api/appointments/coach        # Lấy lịch hẹn của coach
PATCH  /api/appointments/:id/status   # Cập nhật trạng thái
```

### Messages
```
GET    /api/appointments/:id/messages     # Lấy tin nhắn
POST   /api/appointments/:id/messages     # Gửi tin nhắn
POST   /api/appointments/:id/messages/read # Đánh dấu đã đọc
GET    /api/messages/unread-counts        # Số tin nhắn chưa đọc
```

### Auth & Users
```
POST   /api/auth/login                # Đăng nhập
POST   /api/auth/register             # Đăng ký
GET    /api/coaches                   # Danh sách coaches
```

## 🎯 Frontend Integration Points

### 1. BookAppointment Component
**Vị trí**: `src/page/BookAppointment.jsx`

**API Calls sử dụng**:
- `GET /api/coaches` - Load danh sách coaches
- `POST /api/appointments` - Tạo appointment mới
- `PUT /api/appointments/:id` - Update appointment (reschedule)

**Đã tích hợp**:
- ✅ Coach selection với API data
- ✅ Date & time selection
- ✅ Appointment creation
- ✅ Rescheduling functionality

### 2. AppointmentList Component
**Vị trí**: `src/components/AppointmentList.jsx`

**API Calls sử dụng**:
- `GET /api/appointments/user` - Load user appointments
- `PUT /api/appointments/:id/cancel` - Cancel appointment
- `DELETE /api/appointments/:id` - Delete appointment
- `POST /api/appointments/:id/rate` - Rate appointment
- `GET/POST /api/appointments/:id/messages` - Chat functionality

**Đã tích hợp**:
- ✅ Appointment listing với real-time data
- ✅ Cancel/Delete functionality
- ✅ Rating system
- ✅ Chat integration
- ✅ Status filtering

### 3. CoachBookings Component
**Vị trí**: `src/page/coach/CoachBookings.jsx`

**API Calls sử dụng**:
- `GET /api/appointments/coach` - Load coach appointments
- `PATCH /api/appointments/:id/status` - Update status (confirm/complete/cancel)

**Đã tích hợp**:
- ✅ Coach appointment management
- ✅ Status updates (pending → confirmed → completed)
- ✅ Booking filtering

### 4. CoachDashboard Component
**Vị trí**: `src/page/coach/CoachDashboard.jsx`

**API Calls sử dụng**:
- `GET /api/appointments/coach` - Dashboard statistics
- `GET /api/messages/unread-counts` - Message notifications

## 🔌 API Integration Files

### 1. User Appointment API
**File**: `src/utils/userAppointmentApi.js`
```javascript
// Đã hoàn thành tất cả functions:
- createAppointment()
- getUserAppointments()
- getAppointmentById()
- updateAppointment()
- cancelAppointment()
- deleteAppointment()
- rateAppointment()
- getAppointmentMessages()
- sendAppointmentMessage()
- markMessagesAsRead()
- getUnreadMessageCounts()
```

### 2. Coach API Integration
**File**: `src/utils/coachApiIntegration.js`
```javascript
// Đã hoàn thành tất cả functions:
- getCoachDashboardStats()
- getCoachAppointments()
- getAppointmentMessages()
- sendAppointmentMessage()
- markMessagesAsRead()
- getUnreadMessageCounts()
- updateAppointmentStatus()
```

### 3. Base API Utility
**File**: `src/utils/api.js`
```javascript
// Core API functions:
- fetchApi() với proxy support
- addAuthHeader() với JWT token
- Error handling và logging
```

## 🚀 Cách test tích hợp

### 1. Start Backend Server
```bash
cd server
npm start
# Server sẽ chạy tại http://localhost:5000
```

### 2. Start Frontend Server
```bash
npm run dev
# Frontend sẽ chạy tại http://localhost:5175
```

### 3. Test Flow

#### A. User Flow
1. **Đăng nhập** → `/login`
2. **Đặt lịch** → `/appointment`
   - Chọn coach từ API data
   - Chọn ngày & giờ
   - Tạo appointment qua API
3. **Xem lịch hẹn** → `/profile` (AppointmentList)
   - Load từ API `/api/appointments/user`
   - Test cancel, delete, rate functions
4. **Chat với coach** → Trong AppointmentList
   - Load messages từ API
   - Send/receive messages

#### B. Coach Flow
1. **Coach đăng nhập**
2. **Xem bookings** → `/coach/bookings`
   - Load từ API `/api/appointments/coach`
   - Test confirm/complete/cancel
3. **Dashboard** → `/coach-dashboard`
   - Xem statistics
   - Manage notifications

## 🛠️ Fixes đã thực hiện

### 1. Proxy Configuration
**File**: `vite.config.js`
```javascript
server: {
  port: 5175,
  proxy: {
    '/api': {
      target: 'http://localhost:5000',
      changeOrigin: true,
      secure: false
    }
  }
}
```

### 2. API Base URL
**File**: `src/utils/api.js`
- ✅ Sử dụng Vite proxy cho development
- ✅ Fallback to window.location.origin
- ✅ JWT token handling

### 3. Database Integration
**Backend**: Railway MySQL
- ✅ Connection string configured
- ✅ All tables created
- ✅ Foreign key relationships

## 📊 Database Schema

### appointments table
```sql
CREATE TABLE appointments (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  coach_id INT NOT NULL,
  appointment_time DATETIME NOT NULL,
  duration_minutes INT DEFAULT 60,
  status ENUM('pending', 'confirmed', 'completed', 'cancelled') DEFAULT 'pending',
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (coach_id) REFERENCES users(id)
);
```

### messages table
```sql
CREATE TABLE messages (
  id INT PRIMARY KEY AUTO_INCREMENT,
  appointment_id INT NOT NULL,
  sender_type ENUM('user', 'coach') NOT NULL,
  text TEXT NOT NULL,
  read_by_coach BOOLEAN DEFAULT FALSE,
  read_by_user BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (appointment_id) REFERENCES appointments(id) ON DELETE CASCADE
);
```

## 🔒 Authentication Flow

### 1. Login Process
```javascript
// User logs in
POST /api/auth/login
{
  "username": "user@example.com",
  "password": "password"
}

// Response
{
  "success": true,
  "data": {
    "token": "jwt_token_here",
    "user": { "id": 1, "role": "user" }
  }
}
```

### 2. Token Storage
```javascript
// Frontend stores token
localStorage.setItem('nosmoke_token', token);

// API calls include token
Authorization: Bearer {token}
```

## 🎨 UI/UX Features

### ✅ Đã hoàn thành
- **Responsive design** cho mobile/desktop
- **Real-time updates** cho appointment status
- **Toast notifications** cho user feedback
- **Loading states** cho API calls
- **Error handling** với user-friendly messages
- **Chat interface** với unread message badges
- **Calendar picker** cho date selection
- **Coach cards** với rating displays
- **Status badges** với color coding

### 🎯 Core Features Working
1. **Complete Appointment Lifecycle**
   - Create → Pending → Confirmed → Completed
   - Cancel/Delete functionality
   - Reschedule capability

2. **Real-time Chat**
   - Send/receive messages
   - Read status tracking
   - Unread count badges

3. **Coach Management**
   - Approve/reject appointments
   - Update appointment status
   - View client communications

4. **User Experience**
   - Membership-based access control
   - Intuitive booking flow
   - Comprehensive appointment history

## 🚀 Deployment Ready

### Production Settings
```javascript
// Environment variables needed:
DB_URL=railway_connection_string
JWT_SECRET=your_jwt_secret
NODE_ENV=production
PORT=5000

// Frontend build
npm run build
```

## 📝 Testing URLs

### Development
- **Frontend**: http://localhost:5175
- **Backend**: http://localhost:5000
- **API Health**: http://localhost:5000/health

### API Testing
- **Postman Collections** đã có sẵn
- **Test scripts** trong server directory
- **API documentation** trong appointment-api-guide.md

---

## 🎉 Kết luận

**Backend và Frontend đã được tích hợp hoàn chỉnh!**

Tất cả appointment features đã working:
- ✅ User appointment booking
- ✅ Coach appointment management  
- ✅ Real-time messaging
- ✅ Status updates
- ✅ Rating system
- ✅ Database persistence

**System đã sẵn sàng để sử dụng trong production!**
