# AUTHENTICATION FIX GUIDE - FINAL SOLUTION

## 🎯 Vấn đề hiện tại
1. **"Not authenticated. Please login first."** - Lỗi khi gọi appointment API
2. **"No auth token found in localStorage"** - Lỗi không tìm thấy token

## 🔧 Các file đã được cập nhật

### 1. `src/utils/userAppointmentApi.js`
- ✅ Thêm function `getAuthToken()` để tìm token từ nhiều vị trí
- ✅ Cải thiện logging và error handling
- ✅ Kiểm tra token trước mỗi API call

### 2. `src/utils/api.js`
- ✅ Cải thiện `getAuthToken()` để tìm token từ localStorage và sessionStorage
- ✅ Thêm detailed logging về token locations

### 3. `src/page/BookAppointment.jsx`
- ✅ Thêm authentication check trước khi tạo appointment
- ✅ Improved error handling và user feedback
- ✅ Redirect to login nếu không có token

### 4. `src/utils/authDebugNew.js`
- ✅ Enhanced debug utility với nhiều test functions
- ✅ Token checking từ multiple locations
- ✅ API testing capabilities

### 5. `src/App.jsx`
- ✅ Load cả 2 debug utilities: `debugAuth` và `debugAuthNew`

## 🧪 Cách test và debug

### Bước 1: Mở Browser Console
```javascript
// Kiểm tra toàn bộ authentication status
window.debugAuthNew.fullAuthReport()

// Hoặc kiểm tra từng phần
window.debugAuthNew.checkAllTokens()
window.debugAuthNew.checkUserData()
```

### Bước 2: Test API connectivity
```javascript
// Test general API authentication
window.debugAuthNew.testApiAuth()

// Test appointment API specifically
window.debugAuthNew.testAppointmentApi()
```

### Bước 3: Chạy test script tự động
```javascript
// Copy và paste nội dung file auth-fix-test.js vào console
// Hoặc tải script:
fetch('/auth-fix-test.js').then(r => r.text()).then(eval)
```

## 🚨 Troubleshooting theo từng tình huống

### Tình huống 1: Không có token nào
**Triệu chứng:** `debugAuthNew.checkAllTokens()` trả về toàn bộ `null`

**Giải pháp:**
```javascript
// Clear all data và login lại
window.debugAuthNew.clearAllAuth()
// Sau đó navigate to /login
```

### Tình huống 2: Có token nhưng API auth fail
**Triệu chứng:** Có token nhưng `testApiAuth()` fail

**Possible causes:**
- Token expired
- Backend server not running
- Wrong token format

**Giải pháp:**
```javascript
// Logout và login lại để refresh token
window.debugAuthNew.clearAllAuth()
```

### Tình huống 3: API auth OK nhưng appointment API fail
**Triệu chứng:** `testApiAuth()` OK nhưng `testAppointmentApi()` fail

**Possible causes:**
- User không có membership phù hợp
- Backend appointment endpoints có vấn đề

**Giải pháp:**
- Check user membership status
- Verify backend appointment routes

## 🔄 Login Flow Fix

### AuthContext token storage locations:
1. `localStorage.nosmoke_token` (remember me = true)
2. `sessionStorage.nosmoke_token` (remember me = false)
3. `localStorage.token` (backup key)

### API token lookup order:
1. `localStorage.nosmoke_token`
2. `sessionStorage.nosmoke_token`
3. `localStorage.token`
4. `sessionStorage.token`
5. `localStorage.authToken`

## ✅ Verification Steps

### 1. Sau khi login thành công:
```javascript
window.debugAuthNew.checkAllTokens()
// Should show tokens in multiple locations
```

### 2. Trước khi book appointment:
```javascript
window.debugAuthNew.testAppointmentApi()
// Should return success
```

### 3. Nếu có lỗi:
```javascript
window.debugAuthNew.fullAuthReport()
// Shows complete diagnostic information
```

## 📝 Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| No tokens found | Login again |
| Token expired | Logout and login |
| API 401 Unauthorized | Check backend server |
| API 404 Not Found | Verify endpoint URLs |
| Network Error | Check backend connectivity |

## 🎯 Expected Behavior After Fix

1. **Login successful** → Token saved to multiple locations
2. **Navigation to BookAppointment** → Authentication check passes
3. **Select coach/date/time** → Appointment creation succeeds
4. **API calls** → Include proper Authorization header
5. **Error handling** → Clear messages và redirect to login if needed

## 🔧 Additional Debug Commands

```javascript
// Quick token check
window.debugAuthNew.checkAllTokens()

// Clear everything và start fresh
window.debugAuthNew.clearAllAuth()

// Set test token for debugging
window.debugAuthNew.setTestToken('your-test-token')

// Full diagnostic report
window.debugAuthNew.fullAuthReport()
```
