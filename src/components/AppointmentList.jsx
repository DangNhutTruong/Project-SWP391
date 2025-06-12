/**
 * AppointmentList.jsx
 * Component quản lý và hiển thị danh sách lịch hẹn với coach cho người dùng.
 * Bao gồm các chức năng: xem, lọc, hủy, đặt lại, xóa, chat, đánh giá lịch hẹn.
 * Sử dụng localStorage để lưu trữ dữ liệu lịch hẹn phía client.
 *
 * Các khối chính:
 * - CancelledAppointmentCard: Hiển thị lịch hẹn đã bị hủy với nút xóa/đặt lại
 * - AppointmentList: Quản lý state, filter, modal, toast, và render danh sách lịch hẹn
 * - Modal xác nhận: Hủy, xóa, đặt lại lịch hẹn, đánh giá coach
 * - Chat với coach: Hiển thị chat modal khi người dùng chọn chat
 *
 * Tác giả: [Tên của bạn]
 * Ngày cập nhật: 2025-06-12
 */

// Import các thư viện và dependencies cần thiết
import React, { useState, useEffect } from 'react';
import { FaCalendarAlt, FaUserAlt, FaClock, FaMapMarkerAlt, FaCheck, FaTimes, FaInfoCircle, FaComments, FaExclamationTriangle, FaTrashAlt, FaStar as FaStarSolid, FaCrown, FaLock } from 'react-icons/fa';
import { FaRegStar as FaStarRegular } from "react-icons/fa";
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { hasAccessToFeature } from '../utils/membershipUtils';
import './AppointmentList.css';
import ProtectedCoachChat from './ProtectedCoachChat';

/**
 * Component hiển thị card cho lịch hẹn đã bị hủy
 * @param {Object} appointment - Thông tin lịch hẹn đã hủy
 * @param {Function} onRebook - Hàm callback để đặt lại lịch hẹn
 * @param {Function} onDelete - Hàm callback để xóa lịch hẹn
 */
const CancelledAppointmentCard = ({ appointment, onRebook, onDelete }) => {  // Hàm format ngày hiển thị theo định dạng Việt Nam
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', { day: 'numeric', month: 'numeric', year: 'numeric' });
  };
    /**
   * Hàm xử lý khi người dùng click nút "Đặt lại lịch hẹn"
   * Lưu thông tin appointment vào localStorage để tái sử dụng
   */
  const handleRebookClick = () => {
    onRebook(appointment);
  };
  
  /**
   * Hàm xử lý khi người dùng click nút "Xóa lịch hẹn"
   * Gọi callback từ component cha để xử lý việc xóa
   */
  const handleDeleteClick = () => {
    onDelete(appointment);
  };
  return (
    <div className="cancelled-appointment-card">
      {/* Header hiển thị trạng thái đã hủy và ID lịch hẹn */}
      <div className="cancelled-header">
        <FaTimes className="cancelled-icon" />
        <div className="cancelled-status">
          <span className="cancelled-label">Đã hủy</span>
          <span className="cancelled-id">#{appointment.id}</span>
        </div>
      </div>
      
      {/* Body hiển thị thông tin coach và lịch hẹn */}
      <div className="cancelled-body">
        <img src={appointment.coachAvatar} alt={appointment.coachName} className="coach-avatar" />
        <div className="cancelled-info">
          <h3 className="coach-name">{appointment.coachName}</h3>
          <p className="coach-role">{appointment.coachRole}</p>
          <div className="cancelled-date">
            <FaCalendarAlt /> 
            {formatDate(appointment.date)}, {appointment.time}
            <span className="online-badge">Tư vấn trực tuyến</span>
          </div>
        </div>      </div>      
      
      {/* Footer chứa các nút hành động */}
      <div className="cancelled-footer">
        <button className="delete-button" onClick={handleDeleteClick}>
          <FaTrashAlt /> Xóa lịch hẹn
        </button>
        <button className="rebook-button" onClick={handleRebookClick}>
          <FaCalendarAlt /> Đặt lại lịch hẹn
        </button>
      </div>
    </div>
  );
};

/**
 * Component chính hiển thị danh sách lịch hẹn với coach
 * Bao gồm các chức năng: xem, hủy, đặt lại, đánh giá, chat
 */
export default function AppointmentList() {
  // States quản lý danh sách lịch hẹn và các filter
  const [appointments, setAppointments] = useState([]);
  const [filter, setFilter] = useState('all'); // 'all', 'upcoming', 'past'
  const [loading, setLoading] = useState(true);
  const [newAppointmentId, setNewAppointmentId] = useState(null);
  
  // States quản lý chức năng chat với coach
  const [showChat, setShowChat] = useState(false);
  const [selectedCoach, setSelectedCoach] = useState(null);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  
  // States quản lý modal hủy lịch hẹn
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [appointmentToCancel, setAppointmentToCancel] = useState(null);
  
  // States quản lý modal đặt lại lịch hẹn
  const [showRebookModal, setShowRebookModal] = useState(false);
  const [appointmentToRebook, setAppointmentToRebook] = useState(null);
  
  // States quản lý modal xóa lịch hẹn
  const [showDeleteModal, setShowDeleteModal] = useState(false);  
  const [appointmentToDelete, setAppointmentToDelete] = useState(null);  
  
  // States quản lý thông báo toast
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  
  // States quản lý modal đánh giá coach
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [appointmentToRate, setAppointmentToRate] = useState(null);
  const [rating, setRating] = useState(0);
  const [ratingHover, setRatingHover] = useState(0);
  const [ratingComment, setRatingComment] = useState('');
  const [isSubmittingRating, setIsSubmittingRating] = useState(false);  
  
  // Lấy thông tin user từ AuthContext và khởi tạo navigate
  const { user } = useAuth();
  const navigate = useNavigate();    /**
   * Kiểm tra quyền truy cập tính năng dựa trên membership của user
   * - Free: Không có quyền truy cập lịch hẹn coach
   * - Premium/Pro: Có quyền truy cập đầy đủ
   */
  const userMembership = user?.membership || 'free';
  const hasAccess = hasAccessToFeature(userMembership, 'premium');

  // useEffect để tải danh sách lịch hẹn từ localStorage khi component mount
  useEffect(() => {
    /**
     * Hàm fetch dữ liệu lịch hẹn từ localStorage
     * Sắp xếp theo thời gian và highlight lịch hẹn mới nhất
     */
    const fetchAppointments = () => {
      setLoading(true);
      const storedAppointments = JSON.parse(localStorage.getItem('appointments')) || [];
      
      // Debug: Log ngày hiện tại
      console.log('Ngày hiện tại:', new Date().toLocaleDateString('vi-VN'));
      
      // Sắp xếp lịch hẹn theo thời gian (mới nhất trước)
      const sortedAppointments = storedAppointments.sort((a, b) => {
        const dateA = new Date(`${a.date.split('T')[0]}T${a.time}`);
        const dateB = new Date(`${b.date.split('T')[0]}T${b.time}`);
        return dateB - dateA;
      });
      
      // Highlight lịch hẹn mới nhất nếu có
      if (sortedAppointments.length > 0) {
        setNewAppointmentId(sortedAppointments[0].id);
        
        // Tự động chuyển sang tab "Sắp tới" để hiển thị lịch hẹn mới
        setFilter('upcoming');
        
        // Sau 5 giây thì tắt highlight
        setTimeout(() => {
          setNewAppointmentId(null);
        }, 5000);
      }
      
      setAppointments(sortedAppointments);
      setLoading(false);
    };

    fetchAppointments();
  }, []);  /**
   * Hàm lọc danh sách lịch hẹn dựa trên filter được chọn
   * - 'all': Hiển thị tất cả lịch hẹn
   * - 'upcoming': Hiển thị lịch hẹn sắp tới (ngày >= hôm nay, chưa hủy)
   * - 'past': Hiển thị lịch hẹn đã qua (ngày < hôm nay hoặc đã hủy)
   */
  const filteredAppointments = appointments.filter(appointment => {
    // Lấy ngày hiện tại và reset giờ về 00:00:00 để so sánh chính xác theo ngày
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Lấy ngày lịch hẹn và reset giờ về 00:00:00
    const appointmentDate = new Date(`${appointment.date.split('T')[0]}T${appointment.time}`);
    const appointmentDay = new Date(appointmentDate);
    appointmentDay.setHours(0, 0, 0, 0);
    
    // Xử lý đặc biệt cho lịch hẹn đã hủy
    if (appointment.status === 'cancelled') {
      if (filter === 'upcoming') {
        return false; // Lịch đã hủy không hiển thị trong "Sắp tới"
      } else {
        return true; // Hiển thị trong "Tất cả" và "Đã qua"
      }
    }

    // Logic lọc dựa trên ngày và trạng thái
    if (filter === 'upcoming') {
      // Filter "Sắp tới": Lịch hẹn có ngày >= hôm nay và chưa hoàn thành/hủy
      return appointmentDay >= today;
    } else if (filter === 'past') {
      // Filter "Đã qua": Lịch hẹn có ngày < hôm nay hoặc đã hủy
      return appointmentDay < today || appointment.status === 'cancelled';
    }
    
    return true; // 'all' filter: hiển thị tất cả
  });  /**
   * Hàm format ngày hiển thị theo định dạng tiếng Việt
   * @param {string} dateString - Chuỗi ngày cần format
   * @returns {string} - Ngày đã được format
   */
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', { 
      weekday: 'long', 
      day: 'numeric', 
      month: 'numeric', 
      year: 'numeric' 
    });
  };  /**
   * Hàm xác định class CSS cho trạng thái lịch hẹn
   * @param {Object} appointment - Thông tin lịch hẹn
   * @returns {string} - Class CSS tương ứng với trạng thái
   */
  const getStatusClass = (appointment) => {
    if (appointment.status === 'cancelled') {
      return 'cancelled';
    } else if (appointment.status === 'confirmed') {
      // So sánh ngày để xác định lịch hẹn đã hoàn thành hay chưa
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const appointmentDate = new Date(`${appointment.date.split('T')[0]}T${appointment.time}`);
      const appointmentDay = new Date(appointmentDate);
      appointmentDay.setHours(0, 0, 0, 0);
      
      // Lịch hẹn được đánh dấu hoàn thành nếu ngày hẹn < ngày hiện tại
      if (appointmentDay < today) {
        return 'completed';
      } else {
        return 'confirmed';
      }
    }
    
    return '';
  };  /**
   * Hàm lấy text hiển thị cho trạng thái lịch hẹn
   * @param {Object} appointment - Thông tin lịch hẹn
   * @returns {string} - Text trạng thái để hiển thị
   */
  const getStatusText = (appointment) => {
    if (appointment.status === 'cancelled') {
      return 'Đã hủy';
    } else if (appointment.status === 'confirmed') {
      // So sánh ngày để xác định text phù hợp
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const appointmentDate = new Date(`${appointment.date.split('T')[0]}T${appointment.time}`);
      const appointmentDay = new Date(appointmentDate);
      appointmentDay.setHours(0, 0, 0, 0);
      
      // Text thay đổi dựa trên việc lịch hẹn đã qua hay chưa
      if (appointmentDay < today) {
        return 'Đã hoàn thành';
      } else {
        return 'Đã xác nhận';
      }
    }
    
    return 'Chờ xác nhận';
  };
  // Open cancel confirmation modal
  const openCancelModal = (id) => {
    setAppointmentToCancel(id);
    setShowCancelModal(true);
  };

  // Close cancel confirmation modal
  const closeCancelModal = () => {
    setShowCancelModal(false);
    setAppointmentToCancel(null);
  };
  /**
   * Hàm xử lý hủy lịch hẹn
   * - Cập nhật trạng thái appointment thành 'cancelled'
   * - Lưu vào localStorage để persist data
   * - Đóng modal xác nhận
   */
  const handleCancelAppointment = () => {
    if (appointmentToCancel) {
      const updatedAppointments = appointments.map(appointment => {
        if (appointment.id === appointmentToCancel) {
          return { ...appointment, status: 'cancelled' };
        }
        return appointment;
      });
      
      setAppointments(updatedAppointments);
      localStorage.setItem('appointments', JSON.stringify(updatedAppointments));
      closeCancelModal();
    }
  };  /**
   * Hàm xử lý thay đổi lịch hẹn (reschedule)
   * - Lưu thông tin appointment cần reschedule vào localStorage
   * - Chuyển hướng đến trang booking với flag reschedule=true
   * - Trang booking sẽ đọc data từ localStorage để pre-fill form
   */
  const handleRescheduleAppointment = (appointment) => {
    // Store the appointment to reschedule in localStorage
    localStorage.setItem('appointmentToReschedule', JSON.stringify(appointment));
    
    // Navigate to the appointment booking page with query param
    navigate('/appointment?reschedule=true');
  };
  // Open rebook confirmation modal
  const openRebookModal = (appointment) => {
    setAppointmentToRebook(appointment);
    setShowRebookModal(true);
  };

  // Close rebook confirmation modal
  const closeRebookModal = () => {
    setShowRebookModal(false);
    setAppointmentToRebook(null);
  };  /**
   * Hàm xử lý đặt lại lịch hẹn mới sau khi hủy hoặc hoàn thành
   * - Tạo object chứa thông tin coach để pre-fill form
   * - Lưu vào localStorage với key 'rebookCoach'
   * - Chuyển hướng đến trang booking với flag rebook=true
   */
  const handleRebookAppointment = () => {
    if (appointmentToRebook) {
      // For cancelled or completed appointments, we'll create a new booking
      // but pre-fill the coach information
      const rebookData = {
        coachId: appointmentToRebook.coachId,
        coachName: appointmentToRebook.coachName,
        coachAvatar: appointmentToRebook.coachAvatar,
        coachRole: appointmentToRebook.coachRole
      };
      
      localStorage.setItem('rebookCoach', JSON.stringify(rebookData));
      
      // Đóng modal và chuyển trang
      closeRebookModal();
      navigate('/appointment?rebook=true');
    }
  };
  // Open delete confirmation modal
  const openDeleteModal = (appointment) => {
    setAppointmentToDelete(appointment);
    setShowDeleteModal(true);
  };

  // Close delete confirmation modal
  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setAppointmentToDelete(null);
  };  /**
   * Hàm xử lý xóa vĩnh viễn lịch hẹn đã hủy
   * - Hiển thị loading state trong quá trình xóa
   * - Filter appointment khỏi danh sách
   * - Cập nhật localStorage và state
   * - Hiển thị toast notification thành công
   */
  const handleDeleteAppointment = () => {
    if (appointmentToDelete) {
      // Set deleting state to true để hiển thị loading
      setIsDeleting(true);
      
      // Simulate a short delay for better UX
      setTimeout(() => {
        // Filter out the appointment to delete
        const updatedAppointments = appointments.filter(
          appointment => appointment.id !== appointmentToDelete.id
        );
        
        setAppointments(updatedAppointments);
        localStorage.setItem('appointments', JSON.stringify(updatedAppointments));
        closeDeleteModal();
        
        // Reset deleting state
        setIsDeleting(false);
        
        // Show success toast
        setToastMessage('Lịch hẹn đã được xóa thành công!');
        setShowToast(true);
        
        // Hide toast after 3 seconds
        setTimeout(() => {
          setShowToast(false);
        }, 3000);
      }, 500); // Small delay for better user experience
    }
  };
  /**
   * Hàm xử lý mở chat với coach
   * - Tạo object coach từ thông tin appointment
   * - Set states để hiển thị chat modal
   * - Clear unread messages khi mở chat
   */
  const handleOpenChat = (appointment) => {
    const coach = {
      name: appointment.coachName,
      avatar: appointment.coachAvatar,
      role: appointment.coachRole
    };
    
    setSelectedCoach(coach);
    setSelectedAppointment(appointment);
    setShowChat(true);
    
    // Clear any unread messages when opening the chat
    const unreadKey = `unread_messages_${appointment.id}`;
    localStorage.setItem(unreadKey, '0');
  };

  /**
   * Hàm xử lý đóng chat modal
   * Reset các states liên quan đến chat
   */
  const handleCloseChat = () => {
    setShowChat(false);
  };
  
  /**
   * Kiểm tra xem appointment có tin nhắn chưa đọc không
   * @param {string} appointmentId - ID của appointment
   * @returns {boolean} - true nếu có tin nhắn chưa đọc
   */
  const hasUnreadMessages = (appointmentId) => {
    const unreadKey = `unread_messages_${appointmentId}`;
    const unreadCount = localStorage.getItem(unreadKey);
    return unreadCount && parseInt(unreadCount) > 0;
  };

  // Open rating modal
  const openRatingModal = (appointment) => {
    setAppointmentToRate(appointment);
    setShowRatingModal(true);
    
    // Check if the appointment already has a rating
    const existingRating = appointment.rating;
    if (existingRating) {
      setRating(existingRating.stars);
      setRatingComment(existingRating.comment || '');
    } else {
      // Reset rating state if it's a new rating
      setRating(0);
      setRatingComment('');
    }
  };

  // Close rating modal
  const closeRatingModal = () => {
    setShowRatingModal(false);
    setAppointmentToRate(null);
    setRating(0);
    setRatingHover(0);
    setRatingComment('');
  };  /**
   * Hàm xử lý submit đánh giá coach
   * - Tạo object rating với stars, comment và timestamp
   * - Cập nhật appointment với rating mới
   * - Lưu vào localStorage và hiển thị toast thành công
   */
  const handleRatingSubmit = () => {
    if (appointmentToRate && rating > 0) {
      setIsSubmittingRating(true);
      
      // Create rating object
      const ratingObj = {
        stars: rating,
        comment: ratingComment,
        date: new Date().toISOString()
      };
      
      // Update the appointment with the rating
      const updatedAppointments = appointments.map(appointment => {
        if (appointment.id === appointmentToRate.id) {
          return { ...appointment, rating: ratingObj };
        }
        return appointment;
      });
      
      // Update localStorage and state
      setAppointments(updatedAppointments);
      localStorage.setItem('appointments', JSON.stringify(updatedAppointments));
      
      // Show success toast
      setToastMessage('Đánh giá của bạn đã được gửi thành công!');
      setShowToast(true);
      
      // Reset states
      setTimeout(() => {
        setIsSubmittingRating(false);
        setShowToast(false);
        closeRatingModal();
      }, 1000);
    }
  };

  return (
    <div className="appointments-container">
      <div className="appointments-header">
        <h2><FaCalendarAlt /> Lịch hẹn Coach</h2>
        {hasAccess && (
          <div className="filter-controls">
            <button 
              className={`filter-button ${filter === 'all' ? 'active' : ''}`}
              onClick={() => setFilter('all')}
            >
              Tất cả
            </button>
            <button 
              className={`filter-button ${filter === 'upcoming' ? 'active' : ''}`}
              onClick={() => setFilter('upcoming')}
            >
              Sắp tới
            </button>
            <button 
              className={`filter-button ${filter === 'past' ? 'active' : ''}`}
              onClick={() => setFilter('past')}
            >
              Đã qua
            </button>
          </div>
        )}
      </div>

      {/* Premium feature message for free users */}
      {!hasAccess ? (
        <div className="premium-feature-message">
          <div className="premium-icon">
            <FaLock />
          </div>
          <h3>Tính năng dành riêng cho gói Premium</h3>
          <p>
            Để truy cập tính năng lịch hẹn Coach, vui lòng nâng cấp lên gói Premium hoặc Pro.
          </p>
          <button 
            className="upgrade-now-button"
            onClick={() => navigate('/membership')}
          >
            <FaCrown /> Nâng cấp ngay
          </button>
        </div>
      ) : loading ? (
        <div className="loading-message">
          <p>Đang tải lịch hẹn...</p>
        </div>
      ) : filteredAppointments.length === 0 ? (
        <div className="empty-appointments">
          <FaInfoCircle />
          <p>Bạn chưa có lịch hẹn {filter === 'upcoming' ? 'sắp tới' : filter === 'past' ? 'đã qua' : 'nào'}.</p>
          {filter !== 'upcoming' && (
            <a href="/appointment" className="book-button">Đặt lịch hẹn ngay</a>
          )}
        </div>
      ) : (        <div className="appointments-list">          {filteredAppointments.map(appointment => (
            appointment.status === 'cancelled' ? (              <CancelledAppointmentCard 
                key={appointment.id}
                appointment={appointment}
                onRebook={openRebookModal}
                onDelete={openDeleteModal}
              />
            ) : (
            <div 
              key={appointment.id} 
              className={`appointment-card ${getStatusClass(appointment)} ${newAppointmentId === appointment.id ? 'new-appointment' : ''}`}
            ><div className="appointment-header">
                <div className={`appointment-status ${getStatusClass(appointment)}`}>
                  {getStatusClass(appointment) === 'confirmed' && <FaCheck />}
                  {getStatusClass(appointment) === 'cancelled' && <FaTimes />}
                  {getStatusClass(appointment) === 'completed' && <FaCheck />}
                  <span>{getStatusText(appointment)}</span>
                </div>
                <div className="appointment-id">
                  #{appointment.id} 
                  {newAppointmentId === appointment.id && <span className="new-badge">Mới</span>}
                </div>
              </div>
              
              <div className="appointment-body">
                <div className="coach-info">
                  <img src={appointment.coachAvatar} alt={appointment.coachName} className="coach-avatar" />
                  <div className="coach-details">
                    <h3>{appointment.coachName}</h3>
                    <p>{appointment.coachRole}</p>
                  </div>
                </div>
                
                <div className="appointment-details">
                  <div className="detail-item">
                    <FaCalendarAlt />
                    <span>{formatDate(appointment.date)}</span>
                  </div>
                  <div className="detail-item">
                    <FaClock />
                    <span>{appointment.time}</span>
                  </div>
                  <div className="detail-item">
                    <FaMapMarkerAlt />
                    <span>Tư vấn trực tuyến</span>
                  </div>
                  {appointment.rating && (
                    <div className="detail-item rating-display">
                      <div className="stars-display">
                        {[...Array(5)].map((_, i) => (
                          <span key={i}>
                            {i < appointment.rating.stars ? 
                              <FaStarSolid className="star-small filled" /> : 
                              <FaStarRegular className="star-small" />}
                          </span>
                        ))}
                      </div>
                      <span className="rating-date">Đã đánh giá</span>
                    </div>
                  )}
                </div>
              </div>                <div className="appointment-footer">                {getStatusClass(appointment) === 'confirmed' && (
                  <>
                    <button 
                      className="chat-button"
                      onClick={() => handleOpenChat(appointment)}
                    >
                      <FaComments className="chat-button-icon" /> 
                      Chat với Coach
                      {hasUnreadMessages(appointment.id) && <span className="chat-notification">!</span>}
                    </button>
                    <button 
                      className="reschedule-button"
                      onClick={() => handleRescheduleAppointment(appointment)}
                    >
                      Thay đổi lịch
                    </button><button 
                      className="cancel-button"
                      onClick={() => openCancelModal(appointment.id)}
                    >
                      Hủy lịch hẹn
                    </button>
                  </>
                )}{getStatusClass(appointment) === 'completed' && (
                  <>
                    <button 
                      className="chat-button"
                      onClick={() => handleOpenChat(appointment)}
                    >
                      <FaComments className="chat-button-icon" /> 
                      Chat với Coach
                      {hasUnreadMessages(appointment.id) && <span className="chat-notification">!</span>}
                    </button>                    <button 
                      className="feedback-button"
                      onClick={() => openRatingModal(appointment)}
                    >
                      {appointment.rating ? 'Cập nhật đánh giá' : 'Đánh giá Coach'}
                    </button>
                    <button 
                      className="rebook-button"
                      onClick={() => openRebookModal(appointment)}
                    >
                      Đặt lại lịch hẹn
                    </button>
                  </>
                )}{getStatusClass(appointment) === 'cancelled' && (
                  <button 
                    className="rebook-button"
                    onClick={() => openRebookModal(appointment)}
                  >
                    Đặt lại lịch hẹn
                  </button>
                )}</div>
            </div>
            )
          ))}
        </div>      )}        {/* Coach Chat Modal */}
      {showChat && selectedCoach && selectedAppointment && (
        <ProtectedCoachChat
          coach={selectedCoach}
          appointment={selectedAppointment}
          isOpen={showChat}
          onClose={handleCloseChat}
        />
      )}{/* Cancel Confirmation Modal */}
      {showCancelModal && (
        <div className="modal-overlay">
          <div className="confirmation-modal">
            <div className="warning-icon">
              <FaExclamationTriangle />
            </div>
            <h3>Xác nhận hủy lịch hẹn</h3>
            {appointmentToCancel && (
              <p>
                Bạn có chắc chắn muốn hủy lịch hẹn vào
                {' '}
                <strong>
                  {appointments.find(a => a.id === appointmentToCancel)?.time} - {formatDate(appointments.find(a => a.id === appointmentToCancel)?.date)}
                </strong>
                ?
                <br />
                <span>Hành động này không thể hoàn tác.</span>
              </p>
            )}
            <div className="confirmation-actions">
              <button className="cancel-action" onClick={closeCancelModal}>
                Giữ lại
              </button>
              <button className="confirm-action" onClick={handleCancelAppointment}>
                Hủy lịch
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Rebook Confirmation Modal */}
      {showRebookModal && (
        <div className="modal-overlay">
          <div className="confirmation-modal">
            <div className="success-icon">
              <FaCalendarAlt />
            </div>
            <h3>Đặt lại lịch hẹn</h3>
            {appointmentToRebook && (
              <p>
                Bạn muốn đặt lại lịch hẹn với coach
                {' '}
                <strong>
                  {appointmentToRebook.coachName}
                </strong>
                ?
                <br />
                <span>Bạn sẽ được chuyển đến trang đặt lịch.</span>
              </p>
            )}
            <div className="confirmation-actions">
              <button className="cancel-action" onClick={closeRebookModal}>
                Hủy bỏ
              </button>
              <button className="confirm-action rebook" onClick={handleRebookAppointment}>
                Đặt lịch
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="modal-overlay">
          <div className="confirmation-modal">
            <div className="warning-icon">
              <FaExclamationTriangle />
            </div>
            <h3>Xác nhận xóa lịch hẹn</h3>
            {appointmentToDelete && (
              <p>
                Bạn có chắc chắn muốn xóa lịch hẹn với coach 
                <strong> {appointmentToDelete.coachName} </strong>
                vào ngày
                {' '}
                <strong>
                  {appointmentToDelete.time} - {formatDate(appointmentToDelete.date)}
                </strong>
                ?
                <br />
                <span>Hành động này sẽ xóa vĩnh viễn lịch hẹn và không thể khôi phục.</span>
              </p>
            )}
            <div className="confirmation-actions">              <button className="cancel-action" onClick={closeDeleteModal} disabled={isDeleting}>
                Quay lại
              </button>
              <button className="confirm-action delete" onClick={handleDeleteAppointment} disabled={isDeleting}>
                {isDeleting ? (
                  <span className="deleting-text">Đang xóa...</span>
                ) : (
                  <>
                    <FaTrashAlt /> Xóa lịch hẹn
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
        {/* Success Toast Notification */}
      {showToast && (
        <div className="toast-notification success">
          <div className="toast-icon">
            <FaCheck />
          </div>
          <div className="toast-message">
            {toastMessage}
          </div>
        </div>
      )}

      {/* Rating Modal */}
      {showRatingModal && appointmentToRate && (
        <div className="modal-overlay">
          <div className="confirmation-modal rating-modal">
            <h3>Đánh giá Coach</h3>
            <div className="coach-rating-info">
              <img 
                src={appointmentToRate.coachAvatar} 
                alt={appointmentToRate.coachName} 
                className="coach-avatar-rating" 
              />
              <div>
                <h4>{appointmentToRate.coachName}</h4>
                <p>{formatDate(appointmentToRate.date)}, {appointmentToRate.time}</p>
              </div>
            </div>
            
            <div className="star-rating">
              {[...Array(5)].map((_, i) => {
                const ratingValue = i + 1;
                return (
                  <span 
                    key={i}
                    className="star-wrapper"
                    onClick={() => setRating(ratingValue)}
                    onMouseEnter={() => setRatingHover(ratingValue)}
                    onMouseLeave={() => setRatingHover(0)}
                  >
                    {ratingValue <= (ratingHover || rating) ? (
                      <FaStarSolid className="star filled" />
                    ) : (
                      <FaStarRegular className="star" />
                    )}
                  </span>
                );
              })}
              {rating > 0 && (
                <span className="rating-label">
                  {rating === 1 && 'Không hài lòng'}
                  {rating === 2 && 'Tạm được'}
                  {rating === 3 && 'Hài lòng'}
                  {rating === 4 && 'Rất hài lòng'}
                  {rating === 5 && 'Tuyệt vời'}
                </span>
              )}
            </div>
            
            <div className="rating-comment">
              <label htmlFor="comment">Ghi chú (tùy chọn):</label>
              <textarea 
                id="comment"
                rows="4" 
                placeholder="Chia sẻ trải nghiệm của bạn về buổi tư vấn này..."
                value={ratingComment}
                onChange={(e) => setRatingComment(e.target.value)}
              />
            </div>
            
            <div className="confirmation-actions">
              <button className="cancel-action" onClick={closeRatingModal} disabled={isSubmittingRating}>
                Hủy bỏ
              </button>
              <button 
                className="confirm-action rating-submit" 
                onClick={handleRatingSubmit} 
                disabled={rating === 0 || isSubmittingRating}
              >
                {isSubmittingRating ? 'Đang gửi...' : 'Gửi đánh giá'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}