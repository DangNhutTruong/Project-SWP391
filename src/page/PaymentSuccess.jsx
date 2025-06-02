import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './PaymentSuccess.css';
import { FaCheckCircle, FaCheck, FaCrown } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import Header from '../components/Header';
import Nav from '../components/Nav';

const PaymentSuccess = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const packageInfo = location.state?.package;
  const paymentMethod = location.state?.paymentMethod;
  const { user, updateUser } = useAuth();
  
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
  }, [navigate, packageInfo, user, updateUser]);

  // Hàm xử lý khi người dùng muốn trở về trang chủ
  const handleGoHome = () => {
    // Điều hướng với replace để thay thế lịch sử hiện tại
    navigate('/', { replace: true });
    
    // Đảm bảo trang được tải lại nếu Single Page App không hoạt động đúng
    setTimeout(() => {
      if (window.location.pathname !== '/') {
        window.location.href = '/';
      }
    }, 100);
  };

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
          <p>Tài khoản của bạn đã được nâng cấp. Bạn có thể bắt đầu sử dụng ngay các tính năng mới!</p>          <button className="home-button" onClick={handleGoHome}>
            Trở về trang chủ
          </button>
        </div>
      </div>
    </div>
    </>
  );
};

export default PaymentSuccess;
