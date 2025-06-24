# Hướng dẫn Test Coach Login & Interface

## ⚠️ QUAN TRỌNG: Chỉ sử dụng 1 PORT
- **Tắt port 5175** (nếu đang chạy)
- **Chỉ dùng**: http://localhost:5176
- **Lý do**: localStorage khác nhau giữa các port

## 🎯 HƯỚNG DẪN TEST END-TO-END (Cùng Port)

### BƯỚC 1: Setup Environment
1. **Tắt tất cả terminal/port khác**
2. **Chỉ chạy**: `npm run dev` ở port 5176
3. **Truy cập**: http://localhost:5176
4. **Xóa cache cũ** (F12 → Console):
   ```javascript
   localStorage.clear()
   sessionStorage.clear()
   location.reload()
   ```

### BƯỚC 2: User Flow - Đặt lịch Coach
1. **Đăng ký User mới** (hoặc login user có sẵn):
   - Truy cập: http://localhost:5176
   - Click "Đăng ký" → Tạo tài khoản "Hồ Minh Nghĩa"
   - Email: `nghia@test.com`, Password: `123456`

2. **Nâng cấp Membership** (Booking cần Premium/Pro):
   - Vào: `/membership`
   - Chọn gói Premium hoặc Pro
   - Click "Chọn gói" → "Thanh toán"

3. **Book Coach**:
   - Vào: `/appointment`
   - **Chọn Coach 1**: Nguyên Văn A
   - **Chọn ngày**: Ngày mai (26/06/2025)
   - **Chọn giờ**: 10:00
   - **Xác nhận booking**

4. **Kiểm tra booking**:
   - Vào: `/profile` → Tab "Lịch hẹn"
   - Xem booking vừa tạo

5. **Đăng xuất User**:
   - Click dropdown user menu → "Đăng xuất"

### BƯỚC 3: Coach Flow - Xem & Quản lý Booking  
1. **Đăng nhập Coach**:
   - Email: `coach1@nosmoke.com`
   - Password: `coach123`
   - **Tự động redirect** đến `/coach`

2. **Xem Dashboard**:
   - Kiểm tra thống kê: 1 booking mới
   - Xem "Booking gần đây": Có booking của "Hồ Minh Nghĩa"

3. **Quản lý Bookings**:
   - Click "Quản lý Booking" (sidebar) → `/coach/bookings`
   - Xem booking của user
   - **Test cập nhật status**: Click "Hoàn thành"

### BƯỚC 4: Verify Cross-Check
1. **Đăng xuất Coach** → **Đăng nhập User lại**
2. **Kiểm tra**: `/profile` → Booking status đã đổi thành "Hoàn thành"

## Cập nhật mới
- ✅ Coach sau khi login sẽ được redirect tự động đến `/coach` (Coach Dashboard)
- ✅ Coach không thấy navigation bar của user (Nav component ẩn với coach)
- ✅ Header dropdown menu khác cho coach (Dashboard, Quản lý Booking thay vì Profile, Settings)
- ✅ Coach có giao diện riêng với sidebar navigation

## Tài khoản Coach để test

### Coach 1 - Nguyên Văn A
- **Email**: `coach1@nosmoke.com`
- **Password**: `coach123`
- **Chuyên môn**: Coach cai thuốc chuyên nghiệp
- **Rating**: 4.8

### Coach 2 - Trần Thị B  
- **Email**: `coach2@nosmoke.com`
- **Password**: `coach123`
- **Chuyên môn**: Chuyên gia tâm lý
- **Rating**: 4.9

### Coach 3 - Phạm Minh C
- **Email**: `coach3@nosmoke.com`
- **Password**: `coach123`
- **Chuyên môn**: Bác sĩ phục hồi chức năng  
- **Rating**: 4.7

## 🚀 QUICK START (Nếu đã có User)
Nếu bạn đã có tài khoản user "Hồ Minh Nghĩa" với Premium membership:

1. **Login User** → `/appointment` → **Book Coach 1** → **Logout**
2. **Login Coach 1** → **Xem Dashboard/Bookings** → **Update Status**
3. **Logout Coach** → **Login User** → **Verify Status Change**

## 📱 What to Expect

### User Interface:
- ✅ Navigation bar đầy đủ
- ✅ Header menu: Profile, Settings  
- ✅ Có thể book appointment
- ✅ Xem lịch hẹn trong Profile

### Coach Interface:  
- ❌ Không có navigation bar
- ✅ Header menu: Dashboard, Bookings
- ✅ Sidebar với thông tin coach
- ✅ Dashboard với statistics
- ✅ Booking management với filters

## 🔧 Troubleshooting

### "Không thấy booking của user trong coach dashboard":
```javascript
// Check data trong Console (F12):
console.log('All appointments:', JSON.parse(localStorage.getItem('appointments') || '[]'))
console.log('Current user:', JSON.parse(localStorage.getItem('nosmoke_user') || '{}'))
```

### "User không book được (membership issue)":
```javascript
// Force upgrade membership:
let users = JSON.parse(localStorage.getItem('nosmoke_users') || '[]')
let user = JSON.parse(localStorage.getItem('nosmoke_user') || '{}')
user.membership = 'premium'
users = users.map(u => u.id === user.id ? {...u, membership: 'premium'} : u)
localStorage.setItem('nosmoke_users', JSON.stringify(users))
localStorage.setItem('nosmoke_user', JSON.stringify(user))
location.reload()
```

### "Coach login không redirect đến /coach":
- Check Console có lỗi routing không
- Thử navigate thủ công: `window.location.href = '/coach'`
