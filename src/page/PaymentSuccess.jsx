import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './PaymentSuccess.css';
import { FaCheckCircle, FaCheck } from 'react-icons/fa';

const PaymentSuccess = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const packageInfo = location.state?.package;
  const paymentMethod = location.state?.paymentMethod;

  useEffect(() => {
    // Nếu không có thông tin gói, chuyển về trang chính
    if (!packageInfo) {
      navigate('/');
    }
  }, [navigate, packageInfo]);

  // Hàm xử lý khi người dùng muốn trở về trang chủ
  const handleGoHome = () => {
    navigate('/');
  };

  // Render trang thành công
  return (
    <div className="payment-success-container">      <div className="success-card">
        <div className="success-icon">
          <FaCheckCircle />
        </div>
        
        <h1>Thanh toán thành công!</h1>
        <p>Cảm ơn bạn đã đăng ký sử dụng dịch vụ của chúng tôi.</p>
        
        {packageInfo && (
          <div className="package-summary">
            <h2>Thông tin gói</h2>
            <div className="summary-item">
              <span>Tên gói:</span>
              <span>{packageInfo.name}</span>
            </div>
            <div className="summary-item">
              <span>Giá:</span>
              <span>{packageInfo.price.toLocaleString()}đ/{packageInfo.period}</span>
            </div>
            <div className="summary-item">
              <span>Phương thức thanh toán:</span>
              <span>
                {paymentMethod === 'creditCard' && 'Thẻ tín dụng/ghi nợ'}
                {paymentMethod === 'momo' && 'Ví Momo'}
                {paymentMethod === 'zalopay' && 'ZaloPay'}
                {paymentMethod === 'paypal' && 'PayPal'}
              </span>
            </div>
          </div>
        )}
        
        <div className="features-list">
          <h3>Tính năng bạn có thể sử dụng</h3>
          <ul>          {packageInfo && packageInfo.features.map((feature, index) => (
              <li key={index}><FaCheck style={{color: '#34c759', marginRight: '8px'}} /> {feature}</li>
            ))}
          </ul>
        </div>
        
        <div className="next-steps">
          <p>Tài khoản của bạn đã được nâng cấp. Bạn có thể bắt đầu sử dụng ngay các tính năng mới!</p>
          <button className="home-button" onClick={handleGoHome}>
            Trở về trang chủ
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;
