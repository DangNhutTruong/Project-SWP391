import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useMembership } from '../context/MembershipContext';
import '../styles/RequireMembership.css';
import { FaLock, FaCrown } from 'react-icons/fa';
import { formatMembershipName } from '../utils/membershipUtils';

/**
 * Higher-Order Component (HOC) để giới hạn truy cập các tính năng dựa trên gói thành viên
 * @param {Object} props
 * @param {Array} props.allowedMemberships - Mảng các loại membership được phép truy cập (ví dụ: ['free', 'premium', 'pro'])
 * @param {boolean} props.showModal - Nếu true, hiển thị modal thay vì chuyển hướng
 * @param {ReactNode} props.children - Component con được bảo vệ
 */
const RequireMembership = ({ allowedMemberships = [], showModal = false, children }) => {
  const { user } = useAuth();
  const { checkFeatureAccess } = useMembership();
  const navigate = useNavigate();
  
  // Lấy membership của user hiện tại (mặc định là 'free' nếu không có)
  const userMembership = user?.membership || 'free';
  
  // Xác định membership level tối thiểu cần thiết
  const minRequiredMembership = allowedMemberships.sort((a, b) => {
    const levels = { 'free': 0, 'premium': 1, 'pro': 2 };
    return levels[a] - levels[b];
  })[0];
  
  // Thiết lập mảng cấp độ thành viên để so sánh
  const membershipLevels = ['free', 'premium', 'pro'];
  const userLevel = membershipLevels.indexOf(userMembership);
  const requiredLevel = membershipLevels.indexOf(minRequiredMembership);
  
  // Người dùng có quyền nếu họ có membership cấp cao hơn hoặc bằng yêu cầu
  const hasAccess = userLevel >= requiredLevel;

  // Modal khi người dùng không có quyền truy cập
  const AccessDeniedModal = () => {
    const requiredMembershipName = formatMembershipName(minRequiredMembership);
    const currentMembershipName = formatMembershipName(userMembership);
    
    return (
      <div className="membership-modal-overlay">
        <div className="membership-modal">
          <div className="membership-modal-header">
            <FaLock className="membership-lock-icon" />
            <h3>Đặt lịch hẹn - Tính năng Premium</h3>
          </div>
          <div className="membership-modal-body">
            <p>
              {userMembership === 'free' ? (
                <>
                  Đặt lịch hẹn với Coach là tính năng độc quyền dành cho gói thành viên <strong>{requiredMembershipName}</strong> trở lên.
                  Việc đặt lịch sẽ giúp bạn nhận được tư vấn 1:1 chuyên sâu từ các chuyên gia cai thuốc có kinh nghiệm.
                  Vui lòng nâng cấp để mở khóa tính năng này.
                </>
              ) : (
                <>
                  Đã có lỗi xảy ra khi kiểm tra quyền truy cập của bạn.
                  Gói <strong>{currentMembershipName}</strong> của bạn đáng lẽ phải có quyền truy cập tính năng này.
                  Vui lòng đăng xuất và đăng nhập lại, hoặc liên hệ hỗ trợ nếu vấn đề vẫn tiếp tục.
                </>
              )}
            </p>
            
            <div className="membership-info">
              <div className="membership-item">
                <h4>Gói hiện tại</h4>
                <span className={`membership-badge current-badge ${userMembership}`}>
                  {userMembership === 'free' ? '○' : userMembership === 'premium' ? '✓' : '★'} {currentMembershipName}
                </span>
              </div>
              <div className="membership-item">
                <h4>Yêu cầu tối thiểu</h4>
                <span className="membership-badge required-badge">
                  {minRequiredMembership === 'premium' ? '✓' : '★'} {requiredMembershipName}
                </span>
              </div>
            </div>
          </div>
          <div className="membership-modal-footer">
            <button className="membership-cancel-button" onClick={() => navigate(-1)}>
              Quay lại
            </button>
            {userMembership === 'free' && (
              <button className="membership-upgrade-button" onClick={() => navigate('/membership')}>
                <FaCrown /> Nâng cấp ngay
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Nếu có quyền truy cập, hiển thị component con
  if (hasAccess) {
    return children;
  }
  
  // Nếu không có quyền truy cập và chọn hiển thị modal
  if (showModal) {
    return <AccessDeniedModal />;
  }
  
  // Nếu không có quyền truy cập và không hiển thị modal, chuyển hướng đến trang access-denied
  navigate('/access-denied', { 
    state: { 
      userMembership,
      requiredMembership: allowedMemberships[0] || 'premium',
      from: window.location.pathname
    } 
  });
  
  return null;
};

export default RequireMembership;
