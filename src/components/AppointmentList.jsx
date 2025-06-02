import React, { useState, useEffect } from 'react';
import { FaCalendarAlt, FaUserAlt, FaClock, FaMapMarkerAlt, FaCheck, FaTimes, FaInfoCircle } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import './AppointmentList.css';

export default function AppointmentList() {
  const [appointments, setAppointments] = useState([]);
  const [filter, setFilter] = useState('all'); // 'all', 'upcoming', 'past'
  const [loading, setLoading] = useState(true);
  const [newAppointmentId, setNewAppointmentId] = useState(null);
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

  // Handle cancel appointment
  const handleCancelAppointment = (id) => {
    if (window.confirm('Bạn có chắc chắn muốn hủy cuộc hẹn này không?')) {
      const updatedAppointments = appointments.map(appointment => {
        if (appointment.id === id) {
          return { ...appointment, status: 'cancelled' };
        }
        return appointment;
      });
      
      setAppointments(updatedAppointments);
      localStorage.setItem('appointments', JSON.stringify(updatedAppointments));
    }
  };

  // Handle reschedule appointment
  const handleRescheduleAppointment = (appointment) => {
    // Store the appointment to reschedule in localStorage
    localStorage.setItem('appointmentToReschedule', JSON.stringify(appointment));
    
    // Navigate to the appointment booking page with query param
    navigate('/appointment?reschedule=true');
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
      ) : (
        <div className="appointments-list">          {filteredAppointments.map(appointment => (
            <div 
              key={appointment.id} 
              className={`appointment-card ${getStatusClass(appointment)} ${newAppointmentId === appointment.id ? 'new-appointment' : ''}`}
            >
              <div className="appointment-header">
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
                      className="reschedule-button"
                      onClick={() => handleRescheduleAppointment(appointment)}
                    >
                      Thay đổi lịch
                    </button>
                    <button 
                      className="cancel-button"
                      onClick={() => handleCancelAppointment(appointment.id)}
                    >
                      Hủy lịch hẹn
                    </button>
                  </>
                )}
                {getStatusClass(appointment) === 'completed' && (
                  <button className="feedback-button">Đánh giá Coach</button>
                )}
                {getStatusClass(appointment) === 'cancelled' && (
                  <button className="rebook-button">Đặt lại lịch hẹn</button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}