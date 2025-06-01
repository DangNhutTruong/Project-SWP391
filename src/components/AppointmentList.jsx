import React, { useState, useEffect } from 'react';
import { FaCalendarAlt, FaUserAlt, FaClock, FaMapMarkerAlt, FaCheck, FaTimes, FaInfoCircle, FaComments, FaExclamationTriangle, FaTrashAlt } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import './AppointmentList.css';
import CoachChat from './CoachChat';

// Component hiển thị cho thẻ lịch hẹn đã hủy
const CancelledAppointmentCard = ({ appointment, onRebook, onDelete }) => {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', { day: 'numeric', month: 'numeric', year: 'numeric' });
  };
  
  // Gọi hàm mở modal đặt lại lịch hẹn
  const handleRebookClick = () => {
    onRebook(appointment);
  };
  
  // Gọi hàm mở modal xóa lịch hẹn
  const handleDeleteClick = () => {
    onDelete(appointment);
  };

  return (
    <div className="cancelled-appointment-card">
      <div className="cancelled-header">
        <FaTimes className="cancelled-icon" />
        <div className="cancelled-status">
          <span className="cancelled-label">Đã hủy</span>
          <span className="cancelled-id">#{appointment.id}</span>
        </div>
      </div>
      
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
        </div>      </div>      <div className="cancelled-footer">
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

export default function AppointmentList() {
  const [appointments, setAppointments] = useState([]);
  const [filter, setFilter] = useState('all'); // 'all', 'upcoming', 'past'
  const [loading, setLoading] = useState(true);
  const [newAppointmentId, setNewAppointmentId] = useState(null);
  const [showChat, setShowChat] = useState(false);
  const [selectedCoach, setSelectedCoach] = useState(null);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [appointmentToCancel, setAppointmentToCancel] = useState(null);
  const [showRebookModal, setShowRebookModal] = useState(false);
  const [appointmentToRebook, setAppointmentToRebook] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);  const [appointmentToDelete, setAppointmentToDelete] = useState(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const navigate = useNavigate();
  useEffect(() => {
    // Fetch appointments from localStorage
    const fetchAppointments = () => {
      setLoading(true);
      const storedAppointments = JSON.parse(localStorage.getItem('appointments')) || [];
      
      // Sort appointments by date (newest first)
      const sortedAppointments = storedAppointments.sort((a, b) => {
        const dateA = new Date(`${a.date.split('T')[0]}T${a.time}`);
        const dateB = new Date(`${b.date.split('T')[0]}T${b.time}`);
        return dateB - dateA;
      });
      
      // Check if there's a new appointment (most recently added)
      if (sortedAppointments.length > 0) {
        setNewAppointmentId(sortedAppointments[0].id);
        
        // Set filter to "upcoming" to show the new appointment
        setFilter('upcoming');
        
        // After 5 seconds, remove the highlight
        setTimeout(() => {
          setNewAppointmentId(null);
        }, 5000);
      }
      
      setAppointments(sortedAppointments);
      setLoading(false);
    };

    fetchAppointments();
  }, []);

  // Filter appointments based on the selected filter
  const filteredAppointments = appointments.filter(appointment => {
    const appointmentDate = new Date(`${appointment.date.split('T')[0]}T${appointment.time}`);
    const now = new Date();
    
    if (filter === 'upcoming') {
      return appointmentDate > now;
    } else if (filter === 'past') {
      return appointmentDate < now;
    }
    
    return true; // 'all' filter
  });

  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', { 
      weekday: 'long', 
      day: 'numeric', 
      month: 'numeric', 
      year: 'numeric' 
    });
  };

  // Get status class based on appointment status
  const getStatusClass = (appointment) => {
    const appointmentDate = new Date(`${appointment.date.split('T')[0]}T${appointment.time}`);
    const now = new Date();
    
    if (appointmentDate < now) {
      return 'completed';
    } else if (appointment.status === 'confirmed') {
      return 'confirmed';
    } else if (appointment.status === 'cancelled') {
      return 'cancelled';
    }
    
    return '';
  };

  // Get status text based on appointment status
  const getStatusText = (appointment) => {
    const appointmentDate = new Date(`${appointment.date.split('T')[0]}T${appointment.time}`);
    const now = new Date();
    
    if (appointmentDate < now) {
      return 'Đã hoàn thành';
    } else if (appointment.status === 'confirmed') {
      return 'Đã xác nhận';
    } else if (appointment.status === 'cancelled') {
      return 'Đã hủy';
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

  // Handle cancel appointment
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
  };  // Handle reschedule or rebook appointment
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
  };
  // Handle booking new appointment after completion or cancellation
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
  };  // Handle delete cancelled appointment
  const handleDeleteAppointment = () => {
    if (appointmentToDelete) {
      // Set deleting state to true
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

  // Handle opening chat with coach
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

  // Handle closing chat
  const handleCloseChat = () => {
    setShowChat(false);
  };
  
  // Check if there are unread messages for an appointment
  const hasUnreadMessages = (appointmentId) => {
    const unreadKey = `unread_messages_${appointmentId}`;
    const unreadCount = localStorage.getItem(unreadKey);
    return unreadCount && parseInt(unreadCount) > 0;
  };

  return (
    <div className="appointments-container">
      <div className="appointments-header">
        <h2><FaCalendarAlt /> Lịch hẹn Coach</h2>
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
      </div>

      {loading ? (
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
                </div>
              </div>
                <div className="appointment-footer">
                {getStatusClass(appointment) === 'confirmed' && (
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
                    </button>                    <button 
                      className="cancel-button"
                      onClick={() => openCancelModal(appointment.id)}
                    >
                      Hủy lịch hẹn
                    </button>
                  </>
                )}                {getStatusClass(appointment) === 'completed' && (
                  <>
                    <button 
                      className="chat-button"
                      onClick={() => handleOpenChat(appointment)}
                    >
                      <FaComments className="chat-button-icon" /> 
                      Chat với Coach
                      {hasUnreadMessages(appointment.id) && <span className="chat-notification">!</span>}
                    </button>
                    <button className="feedback-button">Đánh giá Coach</button>
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
        </div>      )}
        {/* Coach Chat Modal */}
      {showChat && selectedCoach && selectedAppointment && (
        <CoachChat
          coach={selectedCoach}
          appointment={selectedAppointment}
          isOpen={showChat}
          onClose={handleCloseChat}
        />
      )}      {/* Cancel Confirmation Modal */}
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
    </div>
  );
}