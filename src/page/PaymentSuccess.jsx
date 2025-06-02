import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './PaymentSuccess.css';
import { FaCheckCircle, FaCheck, FaCrown, FaClock } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import Header from '../components/Header';
import Nav from '../components/Nav';

const PaymentSuccess = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const packageInfo = location.state?.package;
  const paymentMethod = location.state?.paymentMethod;
  const { user, updateUser } = useAuth();
  const [countdown, setCountdown] = useState(5);
    useEffect(() => {
    // Nếu không có thông tin gói, chuyển về trang chính
    if (!packageInfo) {
      navigate('/');
      return;
    }

    // Cập nhật thông tin thành viên của người dùng
    if (user && packageInfo) {
      // Lấy membershipType từ packageInfo (premium hoặc pro)
      const membershipType = packageInfo.name.toLowerCase();
      
      // Sử dụng hàm updateUser từ AuthContext để cập nhật người dùng
      updateUser({ membershipType: membershipType });
    }
    
    // Thiết lập bộ đếm thời gian để tự động quay về trang chủ
    const timer = setInterval(() => {
      setCountdown(prevTime => {
        if (prevTime <= 1) {
          clearInterval(timer);
          // Điều hướng về trang chủ khi hết thời gian
          navigate('/', { replace: true });
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);
    
    // Xóa interval khi component unmount
    return () => clearInterval(timer);
  }, [navigate, packageInfo, user, updateUser]);
  // Đã loại bỏ hàm handleGoHome vì đã thay thế bằng chuyển trang tự động

  // Render trang thành công
  return (
    <>
      <Header />
      <Nav />
      <div className="payment-success-container">
        <div className="success-card">
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
            </div>            <div className="summary-item">
              <span>Phương thức thanh toán:</span>
              <span className={`payment-method ${paymentMethod}`}>
                {paymentMethod === 'creditCard' && '💳 Thẻ tín dụng/ghi nợ'}
                {paymentMethod === 'momo' && '📱 Ví Momo'}
                {paymentMethod === 'zalopay' && '📲 ZaloPay'}
                {paymentMethod === 'paypal' && '🌐 PayPal'}
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
          <div className="membership-status-notification">
          <FaCrown style={{color: packageInfo?.name === 'Premium' ? '#34a853' : '#6f42c1', marginRight: '10px'}} />
          <span>Tài khoản của bạn đã được nâng cấp lên gói <strong>{packageInfo?.name}</strong></span>
        </div>
          <div className="next-steps">
          <p>Tài khoản của bạn đã được nâng cấp. Bạn có thể bắt đầu sử dụng ngay các tính năng mới!</p>
          <div className="auto-redirect">
            <FaClock style={{marginRight: '8px'}} /> Tự động chuyển về trang chủ sau <span className="countdown">{countdown}</span> giây
          </div>
        </div>
      </div>
    </div>
    </>
  );
};

export default PaymentSuccess;
