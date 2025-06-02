import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Pay.css';
import { FaCreditCard, FaWallet, FaMoneyBillWave, FaPaypal } from 'react-icons/fa';

const Pay = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { updateUser } = useAuth();
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('zalopay'); // Default payment method
  const [cardInfo, setCardInfo] = useState({
    cardName: '',
    cardNumber: '',
    expiryDate: '',
    cvv: ''
  });
  const [termsAccepted, setTermsAccepted] = useState(false);

  useEffect(() => {
    // Kiểm tra nếu có dữ liệu từ trang chọn gói
    if (location.state && location.state.package) {
      setSelectedPackage(location.state.package);
    } else {
      // Nếu không có dữ liệu, chuyển về trang chọn gói
      navigate('/membership');
    }
  }, [location, navigate]);

  // Xử lý thay đổi phương thức thanh toán
  const handlePaymentMethodChange = (method) => {
    setPaymentMethod(method);
  };

  // Xử lý thay đổi thông tin thẻ
  const handleCardInfoChange = (e) => {
    const { name, value } = e.target;
    setCardInfo({
      ...cardInfo,
      [name]: value
    });
  };  // Xử lý khi nhấn nút thanh toán
  const handlePayment = (e) => {
    e.preventDefault();
    
    if (!termsAccepted) {
      alert('Vui lòng đồng ý với điều khoản sử dụng dịch vụ');
      return;
    }

    // Mô phỏng quá trình thanh toán - Không hiển thị alert để không làm gián đoạn trải nghiệm    console.log(`Đã thanh toán thành công gói ${selectedPackage.name} với giá ${selectedPackage.price.toLocaleString()}đ`);
    
    // Cập nhật gói thành viên của người dùng
    updateUser({ membershipType: selectedPackage.name.toLowerCase() });
    
    // Chuyển hướng người dùng sau khi thanh toán - sử dụng replace để không thể quay lại
    navigate('/payment/success', { 
      replace: true,
      state: { 
        package: selectedPackage,
        paymentMethod: paymentMethod
      } 
    });
  };

  // Xử lý nút quay lại
  const handleGoBack = () => {
    navigate('/membership');
  };
  
  // Hiển thị loading khi chưa có dữ liệu gói
  if (!selectedPackage) {
    return (
      <div className="payment-container">
        <div className="payment-loading">
          <div className="loading-spinner"></div>
          <p>Đang tải thông tin...</p>
        </div>
      </div>
    );
  }

  // Tính VAT và tổng tiền
  const vat = selectedPackage.price * 0.1;
  const totalAmount = selectedPackage.price + vat;

  return (
    <div className="payment-container">
      <div className="payment-content">
        <div className="payment-methods-section">
          <h2>Phương thức thanh toán</h2>
          
          <div className="payment-method-options">
            <div className="payment-option">
              <input 
                type="radio" 
                id="creditCard" 
                name="paymentMethod" 
                checked={paymentMethod === 'creditCard'} 
                onChange={() => handlePaymentMethodChange('creditCard')} 
              />              <label htmlFor="creditCard">
                <FaCreditCard style={{marginRight: '10px'}} /> Thẻ tín dụng/ghi nợ
              </label>
            </div>
            
            <div className="payment-option">
              <input 
                type="radio" 
                id="momo" 
                name="paymentMethod" 
                checked={paymentMethod === 'momo'} 
                onChange={() => handlePaymentMethodChange('momo')} 
              />
              <label htmlFor="momo">
                <FaWallet style={{marginRight: '10px'}} /> Ví Momo
              </label>
            </div>
            
            <div className="payment-option">
              <input 
                type="radio" 
                id="zalopay" 
                name="paymentMethod" 
                checked={paymentMethod === 'zalopay'} 
                onChange={() => handlePaymentMethodChange('zalopay')} 
              />
              <label htmlFor="zalopay">
                <FaMoneyBillWave style={{marginRight: '10px'}} /> ZaloPay
              </label>
            </div>
            
            <div className="payment-option">
              <input 
                type="radio" 
                id="paypal" 
                name="paymentMethod" 
                checked={paymentMethod === 'paypal'} 
                onChange={() => handlePaymentMethodChange('paypal')} 
              />
              <label htmlFor="paypal">
                <FaPaypal style={{marginRight: '10px'}} /> PayPal
              </label>
            </div>
          </div>
          
          {paymentMethod === 'creditCard' && (
            <div className="card-info-form">
              <h3>Thông tin thẻ</h3>
              <div className="form-group">
                <label htmlFor="cardName">Tên chủ thẻ</label>
                <input 
                  type="text" 
                  id="cardName" 
                  name="cardName" 
                  placeholder="NGUYEN VAN A" 
                  value={cardInfo.cardName}
                  onChange={handleCardInfoChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="cardNumber">Số thẻ</label>
                <input 
                  type="text" 
                  id="cardNumber" 
                  name="cardNumber" 
                  placeholder="1234 5678 9012 3456" 
                  value={cardInfo.cardNumber}
                  onChange={handleCardInfoChange}
                  required
                />
              </div>
              <div className="form-row">
                <div className="form-group half-width">
                  <label htmlFor="expiryDate">Ngày hết hạn</label>
                  <input 
                    type="text" 
                    id="expiryDate" 
                    name="expiryDate" 
                    placeholder="MM/YY" 
                    value={cardInfo.expiryDate}
                    onChange={handleCardInfoChange}
                    required
                  />
                </div>
                <div className="form-group half-width">
                  <label htmlFor="cvv">Mã CVV</label>
                  <input 
                    type="text" 
                    id="cvv" 
                    name="cvv" 
                    placeholder="123" 
                    value={cardInfo.cvv}
                    onChange={handleCardInfoChange}
                    required
                  />
                </div>
              </div>
            </div>
          )}
        </div>
        
        <div className="payment-summary-section">
          <h2>Tóm tắt đơn hàng</h2>
          <div className="package-details">
            <div className="package-info">
              <span>Gói {selectedPackage.name}</span>
              <span>{selectedPackage.price.toLocaleString()}đ</span>
            </div>
            <div className="tax-info">
              <span>Thuế VAT (10%)</span>
              <span>{vat.toLocaleString()}đ</span>
            </div>
            <div className="total-amount">
              <span>Tổng cộng</span>
              <span>{totalAmount.toLocaleString()}đ</span>
            </div>
          </div>
          
          <div className="payment-agreement">
            <input 
              type="checkbox" 
              id="terms" 
              checked={termsAccepted}
              onChange={() => setTermsAccepted(!termsAccepted)}
            />
            <label htmlFor="terms">Tôi đồng ý với <a href="#">điều khoản</a> và <a href="#">điều kiện sử dụng dịch vụ</a></label>
          </div>
          
          <div className="payment-actions">
            <button className="payment-button" onClick={handlePayment} disabled={!termsAccepted}>
              Thanh toán ngay
            </button>
            <button className="back-button" onClick={handleGoBack}>
              Quay lại
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Pay;