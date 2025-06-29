import React, { useState, useEffect } from "react";
import {
  FaCalendarAlt,
  FaUserAlt,
  FaClock,
  FaMapMarkerAlt,
  FaCheck,
  FaTimes,
  FaInfoCircle,
  FaComments,
  FaExclamationTriangle,
  FaTrashAlt,
  FaStar as FaStarSolid,
  FaStar as FaStarRegular,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./AppointmentList.css";
import ProtectedCoachChat from "./ProtectedCoachChat";
import RequireMembership from "./RequireMembership";
import apiService from "../utils/apiService";

// Component hiển thị cho thẻ lịch hẹn đã hủy
const CancelledAppointmentCard = ({ appointment, onRebook, onDelete }) => {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      day: "numeric",
      month: "numeric",
      year: "numeric",
    });
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
        <img
          src={appointment.coachAvatar}
          alt={appointment.coachName}
          className="coach-avatar"
        />
        <div className="cancelled-info">
          <h3 className="coach-name">{appointment.coachName}</h3>
          <p className="coach-role">{appointment.coachRole}</p>
          <div className="cancelled-date">
            <FaCalendarAlt />
            {formatDate(appointment.date)}, {appointment.time}
            <span className="online-badge">Tư vấn trực tuyến</span>
          </div>
        </div>{" "}
      </div>{" "}
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

function AppointmentList() {
  const [appointments, setAppointments] = useState([]);
  const [filter, setFilter] = useState("all"); // 'all', 'upcoming', 'past'
  const [loading, setLoading] = useState(true);
  const [newAppointmentId, setNewAppointmentId] = useState(null);
  const [showChat, setShowChat] = useState(false);
  const [selectedCoach, setSelectedCoach] = useState(null);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [appointmentToCancel, setAppointmentToCancel] = useState(null);
  const [showRebookModal, setShowRebookModal] = useState(false);
  const [appointmentToRebook, setAppointmentToRebook] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [appointmentToDelete, setAppointmentToDelete] = useState(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [appointmentToRate, setAppointmentToRate] = useState(null);
  const [rating, setRating] = useState(0);
  const [ratingHover, setRatingHover] = useState(0);
  const [ratingComment, setRatingComment] = useState("");
  const [isSubmittingRating, setIsSubmittingRating] = useState(false);
  const { user } = useAuth(); // Lấy thông tin user từ AuthContext
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch appointments from API
    const fetchAppointments = async () => {
      if (!user || !user.UserID) {
        setAppointments([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        // Gọi API lấy danh sách lịch hẹn
        const appointmentsData = await apiService.appointments.getAll();

        if (appointmentsData && appointmentsData.data) {
          // Sắp xếp lịch hẹn theo ngày (mới nhất lên đầu)
          const sortedAppointments = appointmentsData.data.sort((a, b) => {
            const dateA = new Date(a.AppointmentDate);
            const dateB = new Date(b.AppointmentDate);
            return dateB - dateA;
          });

          // Kiểm tra nếu có lịch hẹn mới thêm
          if (sortedAppointments.length > 0) {
            setNewAppointmentId(sortedAppointments[0].AppointmentID);

            // Đặt filter về "upcoming" để hiển thị lịch hẹn mới
            setFilter("upcoming");

            // Sau 5 giây, xóa hiệu ứng highlight
            setTimeout(() => {
              setNewAppointmentId(null);
            }, 5000);
          }

          setAppointments(sortedAppointments);
        }

        setLoading(false);
      } catch (error) {
        console.error("Lỗi khi lấy danh sách lịch hẹn:", error);
        setLoading(false);
      }
    };

    fetchAppointments();
  }, [user]); // Filter appointments based on the selected filter
  const filteredAppointments = appointments.filter((appointment) => {
    // Lấy ngày giờ hiện tại
    const now = new Date();
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset giờ về 00:00:00 cho việc so sánh ngày

    // Lấy ngày giờ lịch hẹn
    const [hours, minutes] = appointment.time.split(":").map(Number);
    const appointmentDate = new Date(appointment.date);
    appointmentDate.setHours(hours, minutes, 0, 0);

    // Cũng tạo một bản sao ngày lịch hẹn với giờ reset để so sánh ngày
    const appointmentDay = new Date(appointmentDate);
    appointmentDay.setHours(0, 0, 0, 0);
    
    // Kiểm tra xem lịch hẹn đã hoàn thành chưa
    const isCompleted = appointment.status === 'completed' || appointment.completed === true;
    
    // Đã hủy hoặc đã hoàn thành chỉ hiển thị trong "Tất cả" và "Đã qua", không hiển thị trong "Sắp tới"
    if (appointment.status === 'cancelled' || isCompleted) {
      if (filter === 'upcoming') {
        return false; // Lịch đã hủy hoặc đã hoàn thành không hiển thị trong "Sắp tới"
      } else if (filter === 'past') {
        return true; // Hiển thị trong "Đã qua"
      } else {
        return true; // Hiển thị trong "Tất cả"
      }
    }

    // Logic lọc dựa trên ngày, giờ và trạng thái cho các lịch hẹn chưa hoàn thành
    if (filter === 'upcoming') {
      // Filter "Sắp tới": Hiển thị tất cả lịch hẹn chưa hoàn thành có thời gian >= thời gian hiện tại
      return appointmentDate >= now;
    } else if (filter === 'past') {
      // Filter "Đã qua": Hiển thị lịch hẹn có thời gian < thời gian hiện tại hoặc đã hủy hoặc đã hoàn thành
      return appointmentDate < now || appointment.status === 'cancelled' || isCompleted;
    }

    return true; // 'all' filter: hiển thị tất cả
  });
  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      weekday: "long",
      day: "numeric",
      month: "numeric",
      year: "numeric",
    });
  };
  // Hàm so sánh ngày và giờ
  const isSameOrBeforeDateTime = (dateTime1, dateTime2) => {
    const d1 = new Date(dateTime1);
    const d2 = new Date(dateTime2);

    // So sánh trực tiếp hai đối tượng Date (bao gồm cả giờ)
    return d1 <= d2;
  };

  // Hàm so sánh ngày (chỉ so sánh ngày, tháng, năm, không tính giờ phút giây)
  const isSameOrBeforeDate = (date1, date2) => {
    const d1 = new Date(date1);
    const d2 = new Date(date2);

    // Reset time to 00:00:00
    d1.setHours(0, 0, 0, 0);
    d2.setHours(0, 0, 0, 0);

    // So sánh ngày tháng năm
    return (
      d1.getFullYear() < d2.getFullYear() ||
      (d1.getFullYear() === d2.getFullYear() &&
        d1.getMonth() < d2.getMonth()) ||
      (d1.getFullYear() === d2.getFullYear() &&
        d1.getMonth() === d2.getMonth() &&
        d1.getDate() <= d2.getDate())
    );
  }; // Get status class based on appointment status
  const getStatusClass = (appointment) => {
    if (appointment.status === 'cancelled') {
      return 'cancelled';
    } else if (appointment.status === 'completed' || appointment.completed) {
      return 'completed';
    } else if (appointment.status === 'confirmed') {
      // Always return confirmed regardless of time
      return 'confirmed';
    }

    return "";
  }; // Get status text based on appointment status
  const getStatusText = (appointment) => {
    if (appointment.status === 'cancelled') {
      return 'Đã hủy';
    } else if (appointment.status === 'completed' || appointment.completed) {
      return 'Đã hoàn thành';
    } else if (appointment.status === 'confirmed') {
      // Lấy ngày hiện tại
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Lấy ngày lịch hẹn
      const appointmentDate = new Date(
        `${appointment.date.split("T")[0]}T${appointment.time}`
      );
      const appointmentDay = new Date(appointmentDate);
      appointmentDay.setHours(0, 0, 0, 0);
      
      return 'Đã xác nhận';
    }

    return "Chờ xác nhận";
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
      const updatedAppointments = appointments.map((appointment) => {
        if (appointment.id === appointmentToCancel) {
          return { ...appointment, status: "cancelled" };
        }
        return appointment;
      });

      setAppointments(updatedAppointments);
      localStorage.setItem("appointments", JSON.stringify(updatedAppointments));
      closeCancelModal();
    }
  }; // Handle reschedule or rebook appointment
  const handleRescheduleAppointment = (appointment) => {
    // Lưu thông tin lịch hẹn cần thay đổi vào localStorage
    localStorage.setItem(
      "appointmentToReschedule",
      JSON.stringify(appointment)
    );

    // Chuyển hướng đến trang đặt lịch với tham số reschedule=true
    navigate("/appointment?reschedule=true");

    // Khi đặt lịch mới thành công, xóa lịch hẹn cũ
    const existingAppointments =
      JSON.parse(localStorage.getItem("appointments")) || [];
    const updatedAppointments = existingAppointments.filter(
      (app) => app.id !== appointment.id
    );
    localStorage.setItem("appointments", JSON.stringify(updatedAppointments));
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
        coachRole: appointmentToRebook.coachRole,
      };

      localStorage.setItem("rebookCoach", JSON.stringify(rebookData));

      // Đóng modal và chuyển trang
      closeRebookModal();
      navigate("/appointment?rebook=true");
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
  }; // Handle delete cancelled appointment
  const handleDeleteAppointment = () => {
    if (appointmentToDelete) {
      // Set deleting state to true
      setIsDeleting(true);

      // Simulate a short delay for better UX
      setTimeout(() => {
        // Filter out the appointment to delete
        const updatedAppointments = appointments.filter(
          (appointment) => appointment.id !== appointmentToDelete.id
        );

        setAppointments(updatedAppointments);
        localStorage.setItem(
          "appointments",
          JSON.stringify(updatedAppointments)
        );
        closeDeleteModal();

        // Reset deleting state
        setIsDeleting(false);

        // Show success toast
        setToastMessage("Lịch hẹn đã được xóa thành công!");
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
      role: appointment.coachRole,
    };

    setSelectedCoach(coach);
    setSelectedAppointment(appointment);
    setShowChat(true);

    // Clear any unread messages when opening the chat
    const unreadKey = `unread_messages_${appointment.id}`;
    localStorage.setItem(unreadKey, "0");
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

  // Open rating modal
  const openRatingModal = (appointment) => {
    setAppointmentToRate(appointment);
    setShowRatingModal(true);

    // Check if the appointment already has a rating
    const existingRating = appointment.rating;
    if (existingRating) {
      setRating(existingRating.stars);
      setRatingComment(existingRating.comment || "");
    } else {
      // Reset rating state if it's a new rating
      setRating(0);
      setRatingComment("");
    }
  };

  // Close rating modal
  const closeRatingModal = () => {
    setShowRatingModal(false);
    setAppointmentToRate(null);
    setRating(0);
    setRatingHover(0);
    setRatingComment("");
  };

  // Handle rating submission
  const handleRatingSubmit = () => {
    if (appointmentToRate && rating > 0) {
      setIsSubmittingRating(true);

      // Create rating object
      const ratingObj = {
        stars: rating,
        comment: ratingComment,
        date: new Date().toISOString(),
      };

      // Update the appointment with the rating
      const updatedAppointments = appointments.map((appointment) => {
        if (appointment.id === appointmentToRate.id) {
          return { ...appointment, rating: ratingObj };
        }
        return appointment;
      });

      // Update localStorage and state
      setAppointments(updatedAppointments);
      localStorage.setItem("appointments", JSON.stringify(updatedAppointments));

      // Show success toast
      setToastMessage("Đánh giá của bạn đã được gửi thành công!");
      setShowToast(true);

      // Reset states
      setTimeout(() => {
        setIsSubmittingRating(false);
        setShowToast(false);
        closeRatingModal();
      }, 1000);
    }
  };

  // Handle complete appointment
  const handleCompleteAppointment = (appointmentId) => {
    const updatedAppointments = appointments.map(appointment => {
      if (appointment.id === appointmentId) {
        return { 
          ...appointment, 
          status: 'completed',
          completed: true,
          completedAt: new Date().toISOString()
        };
      }
      return appointment;
    });
    
    setAppointments(updatedAppointments);
    localStorage.setItem('appointments', JSON.stringify(updatedAppointments));
    
    // Show toast notification
    setToastMessage('Buổi tư vấn đã được xác nhận hoàn thành!');
    setShowToast(true);
    
    // Hide toast after 3 seconds
    setTimeout(() => {
      setShowToast(false);
    }, 3000);
  };

  // Handle navigate to chat in navigation
  const handleNavigateToChat = (appointment) => {
    // Store chat info for navigation
    const chatInfo = {
      appointmentId: appointment.id,
      coachName: appointment.coachName,
      coachAvatar: appointment.coachAvatar,
      coachRole: appointment.coachRole
    };
    
    localStorage.setItem('navChatInfo', JSON.stringify(chatInfo));
    
    // Navigate to chat section (assuming there's a chat page/section)
    navigate('/chat');
  };

  return (
    <div className="appointments-container">
      <div className="appointments-header">
        <h2>
          <FaCalendarAlt /> Lịch hẹn Coach
        </h2>
        <div className="filter-controls">
          <button
            className={`filter-button ${filter === "all" ? "active" : ""}`}
            onClick={() => setFilter("all")}
          >
            Tất cả
          </button>
          <button
            className={`filter-button ${filter === "upcoming" ? "active" : ""}`}
            onClick={() => setFilter("upcoming")}
          >
            Sắp tới
          </button>
          <button
            className={`filter-button ${filter === "past" ? "active" : ""}`}
            onClick={() => setFilter("past")}
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
          <p>
            Bạn chưa có lịch hẹn{" "}
            {filter === "upcoming"
              ? "sắp tới"
              : filter === "past"
              ? "đã qua"
              : "nào"}
            .
          </p>
          {filter !== "upcoming" && (
            <a href="/appointment" className="book-button">
              Đặt lịch hẹn ngay
            </a>
          )}
        </div>
      ) : (
        <div className="appointments-list">
          {" "}
          {filteredAppointments.map((appointment) =>
            appointment.status === "cancelled" ? (
              <CancelledAppointmentCard
                key={appointment.id}
                appointment={appointment}
                onRebook={openRebookModal}
                onDelete={openDeleteModal}
              />
            ) : (
              <div
                key={appointment.id}
                className={`appointment-card ${getStatusClass(appointment)} ${
                  newAppointmentId === appointment.id ? "new-appointment" : ""
                }`}
              >
                <div className="appointment-header">
                  <div
                    className={`appointment-status ${getStatusClass(
                      appointment
                    )}`}
                  >
                    {getStatusClass(appointment) === "confirmed" && <FaCheck />}
                    {getStatusClass(appointment) === "cancelled" && <FaTimes />}
                    {getStatusClass(appointment) === "completed" && <FaCheck />}
                    <span>{getStatusText(appointment)}</span>
                  </div>
                  <div className="appointment-id">
                    #{appointment.id}
                    {newAppointmentId === appointment.id && (
                      <span className="new-badge">Mới</span>
                    )}
                  </div>
                </div>

                <div className="appointment-body">
                  <div className="coach-info">
                    <img
                      src={appointment.coachAvatar}
                      alt={appointment.coachName}
                      className="coach-avatar"
                    />
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
                              {i < appointment.rating.stars ? (
                                <FaStarSolid className="star-small filled" />
                              ) : (
                                <FaStarRegular className="star-small" />
                              )}
                            </span>
                          ))}
                        </div>
                        <span className="rating-date">Đã đánh giá</span>
                      </div>
                    )}
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
                        onClick={() => openCancelModal(appointment.id)}
                      >
                        Hủy lịch hẹn
                      </button>
                      
                      <button 
                        className={`chat-button ${(!user?.membership || user?.membership === 'free') ? 'premium-feature' : ''}`}
                        onClick={() => handleOpenChat(appointment)}
                      >
                        <FaComments className="chat-button-icon" /> 
                        Nhắn tin
                        {(!user?.membership || user?.membership === 'free') && (
                          <span className="premium-badge">Premium</span>
                        )}
                        {hasUnreadMessages(appointment.id) && <span className="chat-notification">!</span>}
                      </button>
                      
                      {/* Nút xác nhận hoàn thành */}
                      <button 
                        className="complete-button"
                        onClick={() => handleCompleteAppointment(appointment.id)}
                      >
                        <FaCheck className="complete-icon" /> Xác nhận hoàn thành
                      </button>
                    </>
                  )}
                  
                  {getStatusClass(appointment) === 'completed' && (
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
                  )}
                </div>
              </div>
            )
          )}
        </div>
      )}{" "}
      {/* Coach Chat Modal */}
      {showChat && selectedCoach && selectedAppointment && (
        <ProtectedCoachChat
          coach={selectedCoach}
          appointment={selectedAppointment}
          isOpen={showChat}
          onClose={handleCloseChat}
        />
      )}
      {/* Cancel Confirmation Modal */}
      {showCancelModal && (
        <div className="modal-overlay">
          <div className="confirmation-modal">
            <div className="warning-icon">
              <FaExclamationTriangle />
            </div>
            <h3>Xác nhận hủy lịch hẹn</h3>
            {appointmentToCancel && (
              <p>
                Bạn có chắc chắn muốn hủy lịch hẹn vào{" "}
                <strong>
                  {appointments.find((a) => a.id === appointmentToCancel)?.time}{" "}
                  -{" "}
                  {formatDate(
                    appointments.find((a) => a.id === appointmentToCancel)?.date
                  )}
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
              <button
                className="confirm-action"
                onClick={handleCancelAppointment}
              >
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
                Bạn muốn đặt lại lịch hẹn với coach{" "}
                <strong>{appointmentToRebook.coachName}</strong>
                ?
                <br />
                <span>Bạn sẽ được chuyển đến trang đặt lịch.</span>
              </p>
            )}
            <div className="confirmation-actions">
              <button className="cancel-action" onClick={closeRebookModal}>
                Hủy bỏ
              </button>
              <button
                className="confirm-action rebook"
                onClick={handleRebookAppointment}
              >
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
                vào ngày{" "}
                <strong>
                  {appointmentToDelete.time} -{" "}
                  {formatDate(appointmentToDelete.date)}
                </strong>
                ?
                <br />
                <span>
                  Hành động này sẽ xóa vĩnh viễn lịch hẹn và không thể khôi
                  phục.
                </span>
              </p>
            )}
            <div className="confirmation-actions">
              {" "}
              <button
                className="cancel-action"
                onClick={closeDeleteModal}
                disabled={isDeleting}
              >
                Quay lại
              </button>
              <button
                className="confirm-action delete"
                onClick={handleDeleteAppointment}
                disabled={isDeleting}
              >
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
          <div className="toast-message">{toastMessage}</div>
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
                <p>
                  {formatDate(appointmentToRate.date)}, {appointmentToRate.time}
                </p>
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
                  {rating === 1 && "Không hài lòng"}
                  {rating === 2 && "Tạm được"}
                  {rating === 3 && "Hài lòng"}
                  {rating === 4 && "Rất hài lòng"}
                  {rating === 5 && "Tuyệt vời"}
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
              <button
                className="cancel-action"
                onClick={closeRatingModal}
                disabled={isSubmittingRating}
              >
                Hủy bỏ
              </button>
              <button
                className="confirm-action rating-submit"
                onClick={handleRatingSubmit}
                disabled={rating === 0 || isSubmittingRating}
              >
                {isSubmittingRating ? "Đang gửi..." : "Gửi đánh giá"}
              </button>
            </div>
          </div>        </div>      )}
      
      {/* Toast notification for completion confirmation */}
      {showToast && (
        <div className="toast-notification">
          <FaCheck />
          {toastMessage}
        </div>
      )}
    </div>
  );
}

export default function ProtectedAppointmentList() {
  return (
    <RequireMembership allowedMemberships={["premium", "pro"]} showModal={true}>
      <AppointmentList />
    </RequireMembership>
  );
}
