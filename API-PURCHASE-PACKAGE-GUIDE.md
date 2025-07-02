# Tài Liệu Triển Khai API Mua/Nâng Cấp Gói Thành Viên

## Tổng Quan

API `POST /api/packages/purchase` cho phép người dùng mua hoặc nâng cấp gói thành viên (membership package) trong hệ thống. API này yêu cầu xác thực người dùng và thực hiện các thao tác cần thiết trên database để đảm bảo thông tin gói thành viên và thanh toán được lưu trữ đúng.

## Cấu Trúc Dữ Liệu

### Các bảng trong database

1. **users** - Thông tin người dùng
2. **package** - Danh sách các gói thành viên
3. **user_memberships** - Lưu trữ gói thành viên đã mua của người dùng
4. **payment_transactions** - Lưu trữ các giao dịch thanh toán

## Triển Khai API

### Endpoint

```
POST /api/packages/purchase
```

### Headers

```
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

### Request Body

```json
{
  "packageId": 2,
  "paymentMethod": "momo"
}
```

### Phương thức thanh toán hợp lệ

- `"momo"` - Thanh toán qua MoMo
- `"vnpay"` - Thanh toán qua VNPay
- `"credit_card"` - Thanh toán bằng thẻ tín dụng
- `"bank_transfer"` - Thanh toán bằng chuyển khoản ngân hàng
- `"free"` - Chỉ áp dụng cho gói miễn phí

### Response

```json
{
  "success": true,
  "message": "Package purchased successfully",
  "data": {
    "membershipId": 123,
    "paymentId": 456,
    "packageId": 2,
    "packageName": "Premium",
    "startDate": "2025-07-02T10:00:00.000Z",
    "endDate": "2025-08-02T10:00:00.000Z",
    "status": "active",
    "price": 99000,
    "paymentMethod": "momo"
  }
}
```

## Quy Trình Xử Lý

1. **Xác thực người dùng** - Kiểm tra JWT token hợp lệ
2. **Xác thực dữ liệu đầu vào** - Kiểm tra packageId và paymentMethod
3. **Kiểm tra gói** - Xác nhận gói tồn tại
4. **Kiểm tra điều kiện thanh toán** - Xác nhận phương thức thanh toán phù hợp với gói
5. **Xử lý gói hiện tại** - Hủy gói hiện tại của người dùng (nếu có)
6. **Tạo gói mới** - Thêm gói mới cho người dùng với thời hạn tương ứng
7. **Tạo giao dịch thanh toán** - Lưu thông tin thanh toán
8. **Cập nhật thông tin người dùng** - Cập nhật membership_id trong bảng users (nếu có)

## Mã Nguồn Thực Hiện

### Routes (routes/packages.js)

```javascript
/**
 * @route POST /api/packages/purchase
 * @desc Mua hoặc nâng cấp gói thành viên
 * @access Private - Yêu cầu đăng nhập
 */
router.post('/purchase', requireAuth, membershipController.purchasePackage);
```

### Controller (controllers/membershipController.js)

```javascript
/**
 * Mua hoặc nâng cấp gói thành viên
 * @route POST /api/packages/purchase
 * @access Private
 */
export const purchasePackage = async (req, res) => {
  try {
    const { packageId, paymentMethod } = req.body;
    const userId = req.user.id;
    
    // Validate request
    if (!packageId) {
      return res.status(400).json({
        success: false,
        message: 'Package ID is required',
        data: null
      });
    }
    
    if (!paymentMethod) {
      return res.status(400).json({
        success: false,
        message: 'Payment method is required',
        data: null
      });
    }
    
    // Kiểm tra xem gói tồn tại không
    const packageData = await Package.getPackageById(packageId);
    if (!packageData) {
      return res.status(404).json({
        success: false,
        message: `Package with ID ${packageId} not found`,
        data: null
      });
    }
    
    // Kiểm tra nếu gói free thì không cần thanh toán
    if (packageData.price === 0 && paymentMethod !== 'free') {
      return res.status(400).json({
        success: false,
        message: 'Free package requires payment method "free"',
        data: null
      });
    }
    
    // Kiểm tra phương thức thanh toán hợp lệ
    const validPaymentMethods = ['momo', 'vnpay', 'credit_card', 'bank_transfer', 'free'];
    if (!validPaymentMethods.includes(paymentMethod)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid payment method',
        data: null
      });
    }
    
    // Thực hiện mua gói
    const result = await Membership.purchasePackage(userId, packageId, paymentMethod);
    
    // Trả về kết quả
    res.status(200).json({
      success: true,
      message: 'Package purchased successfully',
      data: result
    });
  } catch (error) {
    console.error('❌ Error purchasing package:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to purchase package',
      error: error.message,
      data: null
    });
  }
};
```

## Cách Kiểm Tra API

### Sử dụng Script Test

Chạy script test đã chuẩn bị:

```
npm run test-purchase
```

### Sử dụng Component React

Đã chuẩn bị component `MembershipPurchaseTest.jsx` để kiểm tra API từ frontend.

### Kiểm tra Database Sau Khi Mua Gói

```
npm run check-tables
```

## Các Bước Tiếp Theo

1. **Tích hợp thanh toán thật** - Hiện tại API chỉ ghi nhận thanh toán mà không thực sự xử lý giao dịch qua cổng thanh toán
2. **Thêm xử lý trường hợp nâng/hạ cấp** - Bổ sung logic đặc biệt khi người dùng nâng cấp hoặc hạ cấp giữa các gói
3. **Báo cáo và thống kê** - Thêm chức năng xem báo cáo thanh toán và thống kê gói thành viên
4. **Thông báo** - Gửi email xác nhận khi mua gói thành viên thành công

## Lưu ý

- Gói cũ (nếu có) sẽ tự động bị hủy khi mua gói mới
- Ngày kết thúc được tính dựa trên thời hạn của gói (tháng/năm)
- API này yêu cầu xác thực JWT token
