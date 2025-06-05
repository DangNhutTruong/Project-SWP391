import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useMembership } from '../context/MembershipContext';
import '../styles/RequireMembership.css';
import { FaLock } from 'react-icons/fa';

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
    // Kiểm tra xem user có quyền truy cập không dựa trên phân cấp membership
  // Ghi log để debug
  console.log('User membership:', userMembership);
  console.log('Allowed memberships:', allowedMemberships);
  console.log('Min required membership:', minRequiredMembership);
  
  // Thiết lập mảng cấp độ thành viên để so sánh
  const membershipLevels = ['free', 'premium', 'pro'];
  const userLevel = membershipLevels.indexOf(userMembership);
  const requiredLevel = membershipLevels.indexOf(minRequiredMembership);
  
  // Người dùng có quyền nếu họ có membership cấp cao hơn hoặc bằng yêu cầu
  const hasAccess = userLevel >= requiredLevel;  // Component modal hiển thị khi không có quyền truy cập
  const AccessDeniedModal = () => {
    const { membershipTiers } = useMembership();
    
    // Đảm bảo dữ liệu membershipTiers đã được tải
    const membershipNames = {
      'free': 'Miễn phí',
      'premium': 'Premium', 
      'pro': 'Professional'
    };
    
    const requiredMembershipName = membershipTiers?.[minRequiredMembership]?.name || membershipNames[minRequiredMembership];
    const currentMembershipName = membershipTiers?.[userMembership]?.name || membershipNames[userMembership];
    
    return (
      <div className="membership-modal-overlay">
        <div className="membership-modal">
          <div className="membership-modal-header">
            <FaLock className="membership-lock-icon" />
            <h3>Tính năng bị giới hạn</h3>
          </div>
          <div className="membership-modal-body">
            <p>
              Chức năng chat với Coach yêu cầu gói thành viên <strong>{requiredMembershipName}</strong> trở lên.
              Gói hiện tại của bạn là <strong>{currentMembershipName}</strong>.
              {userMembership === 'free' && "Vui lòng nâng cấp để sử dụng."}
              {userMembership !== 'free' && "Nếu bạn đã nâng cấp, vui lòng đăng xuất và đăng nhập lại."}
            </p>
          </div>
          <div className="membership-modal-footer">
            <button className="membership-cancel-button" onClick={() => navigate(-1)}>
              Hủy
            </button>
            <button className="membership-upgrade-button" onClick={() => navigate('/membership')}>
              Nâng cấp ngay
            </button>
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