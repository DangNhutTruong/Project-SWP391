import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useMembership } from '../context/MembershipContext';
import { FaLock, FaArrowLeft, FaCrown } from 'react-icons/fa';
import './AccessDenied.css';

/**
 * Trang hiển thị khi người dùng không có quyền truy cập vào một tính năng
 */
const AccessDenied = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { membershipTiers } = useMembership();
  
  // Lấy thông tin từ state (nếu có)
  const { 
    userMembership = user?.membership || 'free',
    requiredMembership = 'premium',
    from = '/'
  } = location.state || {};
  
  // Lấy tên hiển thị từ danh sách gói membership
  const membershipNames = {
    free: membershipTiers?.free?.name || 'Miễn phí',
    premium: membershipTiers?.premium?.name || 'Premium',
    pro: membershipTiers?.pro?.name || 'Professional'
  };

  // Chuyển đến trang nâng cấp thành viên
  const handleUpgrade = () => {
    navigate('/membership');
  };

  // Quay lại trang trước đó
  const handleGoBack = () => {
    navigate(-1);
  };

  return (
    <div className="access-denied-container">
      <div className="access-denied-card">
        <div className="access-denied-icon">
          <FaLock />
        </div>
        <h1 className="access-denied-title">Quyền truy cập bị từ chối</h1>
        
        <div className="membership-comparison">
          <div className="current-membership">
            <h3>Gói hiện tại của bạn</h3>
            <div className="membership-badge">
              {membershipNames[userMembership] || 'Miễn phí'}
            </div>
          </div>
          
          <div className="required-membership">
            <h3>Gói yêu cầu</h3>
            <div className="membership-badge required">
              <FaCrown className="crown-icon" />
              {membershipNames[requiredMembership] || 'Premium'}
            </div>
          </div>
        </div>
        
        <p className="access-denied-message">
          Rất tiếc, tính năng này chỉ có sẵn cho thành viên {membershipNames[requiredMembership] || 'Premium'} trở lên.
          Vui lòng nâng cấp gói thành viên của bạn để truy cập.
        </p>
        
        <div className="access-denied-actions">
          <button className="back-button" onClick={handleGoBack}>
            <FaArrowLeft /> Quay lại
          </button>
          <button className="upgrade-button" onClick={handleUpgrade}>
            <FaCrown /> Nâng cấp ngay
          </button>
        </div>
      </div>
    </div>
  );
};

export default AccessDenied;