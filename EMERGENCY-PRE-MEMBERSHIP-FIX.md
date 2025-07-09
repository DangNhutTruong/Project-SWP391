# 🚨 KHẮC PHỤC KHẨN CẤP: Lỗi Membership "PRE"

## Vấn đề
User có gói membership "PRE" nhưng vẫn bị yêu cầu nâng cấp khi truy cập tính năng.

## Nguyên nhân
- Frontend đang lưu membership là "PRE" trong localStorage/sessionStorage
- Backend database chỉ nhận diện "premium", "free", "pro" 
- Logic mapping giữa "PRE" và "premium" chưa hoạt động đầy đủ

## Giải pháp khẩn cấp

### Cách 1: Sử dụng Emergency Fixer (Dành cho Developer)
1. Trong development mode, emergency fixer sẽ tự động hiển thị ở góc phải màn hình
2. Nếu phát hiện membership "PRE", click nút "🔧 Fix Ngay"
3. Trang sẽ reload và membership được chuyển thành "premium"

### Cách 2: Chạy script trong Console (Dành cho User)
1. Mở Developer Tools (F12)
2. Vào tab Console
3. Copy và paste script sau:

```javascript
// Script khẩn cấp fix membership PRE -> premium
function fixMembershipPRE() {
  console.log('🔧 Fixing membership PRE -> premium...');
  
  // Fix localStorage
  const userData = localStorage.getItem('nosmoke_user');
  if (userData) {
    try {
      const user = JSON.parse(userData);
      if (user.membership && user.membership.toLowerCase() === 'pre') {
        user.membership = 'premium';
        localStorage.setItem('nosmoke_user', JSON.stringify(user));
        console.log('✅ Fixed localStorage membership');
      }
    } catch (e) {
      console.error('Error fixing localStorage:', e);
    }
  }

  // Fix sessionStorage
  const sessionData = sessionStorage.getItem('nosmoke_user');
  if (sessionData) {
    try {
      const user = JSON.parse(sessionData);
      if (user.membership && user.membership.toLowerCase() === 'pre') {
        user.membership = 'premium';
        sessionStorage.setItem('nosmoke_user', JSON.stringify(user));
        console.log('✅ Fixed sessionStorage membership');
      }
    } catch (e) {
      console.error('Error fixing sessionStorage:', e);
    }
  }
  
  console.log('✅ Fix hoàn tất! Reload trang để áp dụng thay đổi.');
  window.location.reload();
}

// Chạy fix
fixMembershipPRE();
```

### Cách 3: Manual Fix qua localStorage
1. Mở Developer Tools (F12)
2. Vào tab Application/Storage > Local Storage
3. Tìm key `nosmoke_user`
4. Click vào value và tìm `"membership": "PRE"`
5. Đổi thành `"membership": "premium"`
6. Lưu và reload trang

### Cách 4: Sử dụng file script có sẵn
1. Mở file `emergency-membership-fix.js` trong thư mục gốc
2. Copy toàn bộ nội dung
3. Paste vào Console và nhấn Enter
4. Script sẽ tự động detect và fix membership

## Kiểm tra sau khi fix

### 1. Kiểm tra localStorage
```javascript
const user = JSON.parse(localStorage.getItem('nosmoke_user') || '{}');
console.log('Current membership:', user.membership);
```

### 2. Kiểm tra API response
```javascript
// Kiểm tra API trả về membership gì
fetch('/api/users/profile', {
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('nosmoke_token')}`
  }
})
.then(r => r.json())
.then(data => console.log('API membership:', data.user?.membership));
```

### 3. Test tính năng
- Thử truy cập tính năng booking coach
- Kiểm tra không còn modal yêu cầu nâng cấp
- Xác nhận có thể sử dụng tất cả tính năng premium

## Ngăn chặn vấn đề tương lai

### 1. Đảm bảo backend normalize membership
Backend cần có logic chuyển đổi:
- "PRE" → "premium"  
- "Premium" → "premium"
- "PREMIUM" → "premium"

### 2. Frontend chuẩn hóa từ đầu
Khi nhận response từ API, luôn normalize membership trước khi lưu:

```javascript
const normalizeMembership = (membership) => {
  if (!membership) return 'free';
  const normalized = membership.toString().toLowerCase().trim();
  if (normalized === 'pre' || normalized === 'premium') return 'premium';
  if (normalized === 'pro') return 'pro';
  return 'free';
};
```

### 3. Backup checks
Luôn có logic fallback cho trường hợp membership mapping thất bại:

```javascript
const hasAccess = normalCheck || (rawMembership.toLowerCase() === 'pre' && requiredMembership === 'premium');
```

## Logs quan trọng để debug

Khi gặp vấn đề, kiểm tra console logs:
- `🔍 RequireMembership debug:` - Thông tin chi tiết về membership check
- `🎯 RequireMembership final decision:` - Quyết định cuối cùng về quyền truy cập
- `🚨 CRITICAL: PRE membership user denied access!` - Log cảnh báo khi PRE bị từ chối

## Test cases

### Test 1: User có PRE membership
```javascript
// Set membership PRE và test
const user = JSON.parse(localStorage.getItem('nosmoke_user'));
user.membership = 'PRE';
localStorage.setItem('nosmoke_user', JSON.stringify(user));
// Reload và test truy cập tính năng premium
```

### Test 2: Normalize function
```javascript
const normalize = (m) => m?.toLowerCase() === 'pre' ? 'premium' : m;
console.log(normalize('PRE')); // Should be 'premium'
console.log(normalize('pre')); // Should be 'premium'
console.log(normalize('premium')); // Should be 'premium'
```

---

**Lưu ý:** Đây là giải pháp khẩn cấp. Cần fix fundamental issue trong backend để tránh vấn đề tương lai.
