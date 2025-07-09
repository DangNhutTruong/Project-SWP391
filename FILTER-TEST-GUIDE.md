# 🧪 Hướng dẫn Test Tính năng Filter Slot Đã Đặt

## ✅ Tình trạng hiện tại

Logic filter slot đã được triển khai trong `BookAppointment.jsx`:

### 🔧 Logic Filter
1. **generateTimeSlots()**: Tạo các slot 2 tiếng từ availability data
2. **isSlotBooked()**: Kiểm tra slot có bị đặt hay không dựa vào booked_appointments
3. **availableTimeSlots**: Chỉ hiển thị slot chưa bị đặt

### 📊 Cấu trúc API Data
```json
{
  "coach_id": 4,
  "working_hours": "08:00-22:00", 
  "available_slots": [
    {
      "day_of_week": "monday",
      "start_time": "09:00",
      "end_time": "17:00"
    }
  ],
  "booked_appointments": [
    {
      "id": 123,
      "date": "2025-07-09",
      "time": "10:00",
      "status": "confirmed"
    }
  ]
}
```

## 🎯 Test Steps

### 1. Kiểm tra API
- ✅ `GET /api/coaches` - Có coaches: ID 4, 6, 7
- ✅ `GET /api/coaches/4/availability` - Trả về đúng structure
- ✅ Coach 4 có working_hours: "08:00-22:00", available_slots: []

### 2. Test Frontend
1. Vào http://localhost:5175
2. Login với account có membership
3. Vào Book Appointment
4. Chọn coach "Lê Minh Gia Mẫn" (ID: 4)
5. Chọn ngày hôm nay
6. Kiểm tra time slots hiển thị

**Expected Result:**
- Nếu không có booked_appointments: hiển thị tất cả slots từ 08:00-22:00 (7 slots: 08-10, 10-12, 12-14, 14-16, 16-18, 18-20, 20-22)
- Nếu có appointments: các slot bị conflict sẽ bị ẩn

### 3. Test Filter với Data Thực Tế

**Để test filter với appointments thực tế:**

1. **Option A: Tạo appointment qua UI**
   - Book 1 appointment với coach 4 vào 10:00 hôm nay
   - Refresh page và book lại 
   - Slot 10:00-12:00 không xuất hiện

2. **Option B: Test với Debug Data**
   - Mở Developer Tools
   - Trong console, sẽ thấy:
   ```
   🎯 Coach availability data for time slots: {...}
   📋 Availability slots: [...]
   📅 Booked appointments: [...]
   ⏰ Slot 10:00: AVAILABLE/BOOKED
   ✅ Available time slots after filtering: [...]
   ```

## 🔍 Debug Info

Logic filter hoạt động như sau:

```javascript
// Generate slots từ working_hours hoặc available_slots
const allTimeSlots = generateTimeSlots(availabilitySlots);

// Check từng slot có bị booked không
const availableTimeSlots = allTimeSlots.filter(slot => {
  const isBooked = isSlotBooked(slot.time, bookedAppointments);
  return !isBooked; // Chỉ giữ slot chưa bị đặt
});
```

**isSlotBooked() logic:**
- So sánh ngày đã chọn với appointment date
- So sánh giờ của slot (VD: 10:00) với appointment time
- Nếu appointment time nằm trong khoảng 2h của slot → BOOKED

## 📱 UI Behavior

**Khi có slot bị đặt:**
- ✅ Slot trống: Hiển thị button xanh lá, có thể click
- 🚫 Slot đã đặt: Bị ẩn hoàn toàn, không hiển thị
- 💡 Thông báo: "X khung giờ đã có người đặt"

**Khi tất cả slot bị đặt:**
- Hiển thị thông báo: "Tất cả khung giờ trong ngày này đã được đặt"
- Gợi ý: "Vui lòng chọn ngày khác"

## 🎯 Test Result Expected

✅ **PASS**: Slot đã có appointment sẽ không hiển thị trong danh sách
✅ **PASS**: Số lượng slot hiển thị = tổng slot - slot đã đặt  
✅ **PASS**: Thông báo số slot đã đặt chính xác
✅ **PASS**: Khi không có slot trống, hiển thị thông báo phù hợp

## 🛠️ Cải tiến thêm (nếu cần)

1. **Hiển thị slot đã đặt nhưng disabled** (thay vì ẩn hoàn toàn)
2. **Show thông tin người đặt** (nếu admin/coach)
3. **Suggest giờ gần nhất có sẵn**
4. **Cache availability data** để tránh gọi API nhiều lần

---

💡 **Tóm lại**: Logic filter đã hoạt động đúng, chỉ cần test với dữ liệu thực tế để confirm!
