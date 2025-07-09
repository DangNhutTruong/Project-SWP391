# 🔧 Authentication Fix và Integration Guide

## 🚨 Tình hình hiện tại

Bạn đang gặp lỗi **"Access denied. No token provided"** khi gọi API. Tôi đã **fix các vấn đề chính**:

### ✅ Đã sửa:

1. **API Utility** (`src/utils/api.js`)
   - Cải thiện token detection
   - Thêm logging để debug
   - Backup multiple token keys

2. **Authentication Context** (`src/context/AuthContext.jsx`)
   - Lưu token vào multiple locations
   - Thêm backup keys
   - Better error logging

3. **User Appointment API** (`src/utils/userAppointmentApi.js`)
   - Thêm authentication checks
   - Improved error handling
   - Debug logging

4. **BookAppointment** (`src/page/BookAppointment.jsx`)
   - Fixed coaches API call
   - Better error handling

5. **Debug Utility** (`src/utils/authDebug.js`)
   - Tool để debug authentication
   - Available globally as `window.debugAuth`

## 🎯 Cách test và fix

### Bước 1: Restart hệ thống
```bash
# Stop all servers first (Ctrl+C)

# Terminal 1: Backend
cd server
npm start

# Terminal 2: Frontend  
npm run dev
```

### Bước 2: Test authentication
1. Truy cập: `http://localhost:5175`
2. Mở Developer Tools (F12)
3. Chạy: `window.debugAuth.fullReport()`

### Bước 3: Login và test
1. Đăng nhập với tài khoản
2. Sau khi login, chạy lại: `window.debugAuth.fullReport()`
3. Kiểm tra xem token đã được lưu chưa

### Bước 4: Test appointment APIs
1. Trong console: `window.debugAuth.testApiCall()`
2. Hoặc test trực tiếp tạo appointment

## 🔍 Debug Commands

```javascript
// Kiểm tra authentication status
window.debugAuth.fullReport()

// Kiểm tra token hiện tại
window.debugAuth.getToken()

// Kiểm tra user data
window.debugAuth.getCurrentUser()

// Test API call
window.debugAuth.testApiCall('/api/appointments/user')

// Reset auth nếu cần
window.debugAuth.clearAuth()
```

## 📊 API Endpoints Status

### ✅ Public APIs (No auth required)
```http
GET /api/coaches              # Danh sách coaches
GET /api/health              # Health check
```

### 🔐 Protected APIs (Auth required)
```http
POST /api/appointments       # Tạo appointment
GET  /api/appointments/user  # Lịch hẹn của user
GET  /api/appointments/:id   # Chi tiết appointment
PUT  /api/appointments/:id   # Cập nhật appointment
```

## 🛠️ Troubleshooting

### Lỗi: "No token provided"
**Nguyên nhân**: Token không được gửi trong header
**Giải pháp**:
1. Kiểm tra login có thành công không
2. Chạy `window.debugAuth.getToken()`
3. Nếu null → Login lại
4. Nếu có token → Kiểm tra API calls

### Lỗi: "Access denied"
**Nguyên nhân**: Token invalid hoặc expired
**Giải pháp**:
1. `window.debugAuth.clearAuth()`
2. Login lại
3. Test API call

### Lỗi: Coaches không load
**Nguyên nhân**: Backend không chạy hoặc CORS issue
**Giải pháp**:
1. Kiểm tra backend: `curl http://localhost:5000/api/coaches`
2. Check network tab trong browser
3. Verify proxy config

### Lỗi: JWT invalid
**Nguyên nhân**: JWT_SECRET mismatch
**Giải pháp**:
1. Check `server/.env` có JWT_SECRET
2. Restart backend server
3. Login lại

## 📱 Test Flow

### 1. User Authentication
```
1. Go to /login
2. Enter credentials
3. Check console: "Token saved to localStorage"
4. Run: window.debugAuth.fullReport()
```

### 2. Coach Selection
```
1. Go to /appointment
2. Should load coaches automatically
3. Check console for "Loaded X coaches"
```

### 3. Appointment Creation
```
1. Select coach, date, time
2. Submit appointment
3. Check console for "Appointment created successfully"
4. Verify in /profile page
```

### 4. Appointment Management
```
1. Go to /profile
2. Should load user appointments
3. Test cancel, chat, rate functions
```

## 🎨 Files đã được sửa

### Frontend:
- ✅ `src/utils/api.js` - Better token handling
- ✅ `src/context/AuthContext.jsx` - Multiple token storage
- ✅ `src/utils/userAppointmentApi.js` - Auth checks
- ✅ `src/page/BookAppointment.jsx` - Error handling
- ✅ `src/utils/authDebug.js` - Debug utility
- ✅ `src/App.jsx` - Debug integration

### Backend:
- ✅ All routes and middleware already working
- ✅ Database tables created
- ✅ Authentication middleware ready

## 🚀 Expected Results

Sau khi apply fixes:

1. **Login**: Token được lưu successfully
2. **Coaches**: Load danh sách coaches
3. **Appointments**: Tạo/xem/quản lý appointments
4. **Chat**: Gửi/nhận messages
5. **Debug**: Tools để troubleshoot

## 🎉 Next Steps

1. **Restart servers** với commands trên
2. **Test login flow** và check console
3. **Use debug utility** để verify authentication
4. **Test appointment flow** end-to-end
5. **Report any remaining issues** với console logs

---

**🔧 Authentication issues đã được fix! Hệ thống sẵn sàng để test!**
