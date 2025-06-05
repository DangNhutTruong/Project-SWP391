import React from 'react';
import CoachChat from './CoachChat';

/**
 * Component bọc CoachChat - không còn kiểm tra quyền truy cập vì quyền hạn đã được
 * kiểm tra ở BookAppointment.jsx (đặt lịch chỉ dành cho Premium/Pro)
 */
const ProtectedCoachChat = ({ coach, appointment, isOpen, onClose }) => {
  return (
    <CoachChat
      coach={coach}
      appointment={appointment}
      isOpen={isOpen}
      onClose={onClose}
    />
  );
};

export default ProtectedCoachChat;
