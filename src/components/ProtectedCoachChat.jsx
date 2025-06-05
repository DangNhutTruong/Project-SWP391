import React, { useEffect } from 'react';
import RequireMembership from './RequireMembership';
import CoachChat from './CoachChat';
import { useAuth } from '../context/AuthContext';

/**
 * Component bọc CoachChat với RequireMembership để kiểm tra quyền truy cập dựa trên gói thành viên
 */
const ProtectedCoachChat = ({ coach, appointment, isOpen, onClose }) => {
  const { user } = useAuth();
  
  // Ghi log thông tin membership khi component được mount
  useEffect(() => {
    if (isOpen) {
      console.group('ProtectedCoachChat Debug');
      console.log('User info:', user);
      console.log('Membership:', user?.membership || 'free (mặc định)');
      console.log('Có quyền truy cập:', ['premium', 'pro'].includes(user?.membership));
      
      // Kiểm tra membership của user trong localStorage
      try {
        const storedUser = JSON.parse(localStorage.getItem('nosmoke_user'));
        console.log('User từ localStorage:', storedUser);
        console.log('Membership từ localStorage:', storedUser?.membership);
      } catch (error) {
        console.error('Lỗi khi đọc user từ localStorage:', error);
      }
      
      console.groupEnd();
    }
  }, [isOpen, user]);
  
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
