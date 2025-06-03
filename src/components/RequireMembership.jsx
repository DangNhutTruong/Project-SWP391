import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaLock } from 'react-icons/fa';
import '../styles/RequireMembership.css';

const RequireMembership = ({ allowedMemberships = [], showModal = false, children }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [modalOpen, setModalOpen] = useState(false);

  // If user is not logged in or doesn't have membership info
  const userMembership = user?.membership || 'free';
  const isAllowed = allowedMemberships.includes(userMembership);

  if (isAllowed) {
    return children;
  }

  if (showModal) {
    // Show modal popup if not allowed
    return (
      <>
        {modalOpen || (
          <div className="membership-modal-overlay">
            <div className="membership-modal">
              <div className="membership-modal-icon">
                <FaLock />
              </div>
              <h3>Tính năng bị giới hạn</h3>
              <p>Chức năng chat với Coach chỉ khả dụng cho gói Premium và Pro. Vui lòng nâng cấp để sử dụng.</p>
              <div className="membership-modal-actions">
                <button className="membership-modal-cancel" onClick={() => setModalOpen(true)}>Hủy</button>
                <button className="membership-modal-upgrade" onClick={() => navigate('/membership')}>Nâng cấp ngay</button>
              </div>
            </div>
          </div>
        )}
      </>
    );
  } else {
    // Redirect to access denied page
    navigate('/access-denied', { replace: true, state: { required: allowedMemberships, current: userMembership } });
    return null;
  }
};

export default RequireMembership;
