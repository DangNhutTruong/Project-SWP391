import React, { useState, useEffect } from 'react';
import { FaInbox, FaSearch, FaComments, FaChevronLeft } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import { getCoachAppointments, getUnreadMessageCounts } from '../../utils/coachApiIntegration';
import CoachMessagePanel from '../../components/CoachMessagePanel';
import '../../styles/CoachMessaging.css';

const CoachMessaging = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [unreadCounts, setUnreadCounts] = useState({});
  const [loading, setLoading] = useState(true);
  const [showMessagePanel, setShowMessagePanel] = useState(false);

  // Tải danh sách cuộc hẹn
  useEffect(() => {
    if (user && user.role === 'coach') {
      loadAppointments();
      loadUnreadCounts();
      
      // Thiết lập polling cho số lượng tin nhắn chưa đọc
      const unreadInterval = setInterval(() => {
        loadUnreadCounts();
      }, 5000);
      
      return () => {
        clearInterval(unreadInterval);
      };
    }
  }, [user]);

  // Tải danh sách cuộc hẹn từ API
  const loadAppointments = async () => {
    try {
      setLoading(true);
      const response = await getCoachAppointments();
      
      if (response?.success && response?.data) {
        setAppointments(response.data);
      } else {
        setAppointments([]);
      }
    } catch (error) {
      console.error('Lỗi khi tải danh sách cuộc hẹn:', error);
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  };

  // Tải số lượng tin nhắn chưa đọc
  const loadUnreadCounts = async () => {
    try {
      const response = await getUnreadMessageCounts();
      
      if (response?.success && response?.data) {
        setUnreadCounts(response.data);
      }
    } catch (error) {
      console.error('Lỗi khi tải số lượng tin nhắn chưa đọc:', error);
    }
  };

  // Xử lý khi chọn một cuộc hẹn để chat
  const handleSelectAppointment = (appointment) => {
    setSelectedAppointment(appointment);
    setShowMessagePanel(true);
  };

  // Lọc danh sách cuộc hẹn theo từ khóa tìm kiếm
  const filteredAppointments = appointments.filter(appointment => {
    const userName = appointment.userName || '';
    const id = appointment.id?.toString() || '';
    const searchLower = searchTerm.toLowerCase();
    return userName.toLowerCase().includes(searchLower) || id.includes(searchLower);
  });

  // Đóng panel tin nhắn
  const handleCloseMessagePanel = () => {
    setShowMessagePanel(false);
    setSelectedAppointment(null);
    // Cập nhật số lượng tin nhắn chưa đọc sau khi đóng chat
    loadUnreadCounts();
  };

  // Định dạng ngày giờ
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN');
  };

  // Định dạng thời gian
  const formatTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
  };

  // Lấy avatar người dùng
  const getUserAvatar = (appointment) => {
    if (appointment.userAvatar) {
      return appointment.userAvatar;
    }
    // Sử dụng avatar mặc định khác nhau dựa trên ID cuộc hẹn
    const avatars = [
      '/image/default-user-avatar.svg',
      '/image/default-user-avatar-green.svg'
    ];
    return avatars[appointment.id % avatars.length];
  };

  return (
    <div className="coach-messaging">
      <div className="messaging-header">
        <h2><FaInbox /> Tin nhắn của bạn</h2>
        <p>Quản lý tin nhắn với người dùng</p>
      </div>
      
      {showMessagePanel && selectedAppointment ? (
        <div className="messaging-content with-panel">
          <div className="back-to-list">
            <button onClick={handleCloseMessagePanel}>
              <FaChevronLeft /> Quay lại danh sách
            </button>
          </div>
          
          <CoachMessagePanel 
            appointment={selectedAppointment} 
            onClose={handleCloseMessagePanel} 
          />
        </div>
      ) : (
        <div className="messaging-content">
          <div className="messaging-search">
            <div className="search-container">
              <FaSearch className="search-icon" />
              <input 
                type="text" 
                placeholder="Tìm kiếm theo tên hoặc ID cuộc hẹn..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          
          <div className="appointment-list">
            {loading ? (
              <div className="loading-container">
                <p>Đang tải danh sách cuộc hẹn...</p>
              </div>
            ) : filteredAppointments.length > 0 ? (
              filteredAppointments.map(appointment => (
                <div 
                  key={appointment.id} 
                  className={`appointment-item ${selectedAppointment?.id === appointment.id ? 'active' : ''}`}
                  onClick={() => handleSelectAppointment(appointment)}
                >
                  <img 
                    src={getUserAvatar(appointment)} 
                    alt={appointment.userName || 'Người dùng'} 
                    className="user-avatar" 
                  />
                  
                  <div className="appointment-info">
                    <h3>{appointment.userName || 'Người dùng'}</h3>
                    <p className="appointment-date">
                      Cuộc hẹn #{appointment.id} - {formatDate(appointment.date)}
                    </p>
                  </div>
                  
                  {unreadCounts[appointment.id] && unreadCounts[appointment.id] > 0 && (
                    <div className="unread-badge">
                      {unreadCounts[appointment.id]}
                    </div>
                  )}
                  
                  <button className="message-button">
                    <FaComments />
                  </button>
                </div>
              ))
            ) : (
              <div className="empty-list">
                <p>Không có cuộc hẹn nào. Hãy tạo cuộc hẹn mới để bắt đầu trò chuyện!</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CoachMessaging;
