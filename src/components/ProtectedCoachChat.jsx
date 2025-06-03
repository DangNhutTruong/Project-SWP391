import React from 'react';
import RequireMembership from './RequireMembership';
import CoachChat from './CoachChat';

/**
 * Component bọc CoachChat với RequireMembership để kiểm tra quyền truy cập dựa trên gói thành viên
 */
const ProtectedCoachChat = ({ coach, appointment, isOpen, onClose }) => {
  return (
    <RequireMembership allowedMemberships={['premium', 'pro']} showModal={true}>
      <CoachChat
        coach={coach}
        appointment={appointment}
        isOpen={isOpen}
        onClose={onClose}
      />
    </RequireMembership>
  );
};

export default ProtectedCoachChat;
