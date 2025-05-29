import React, { useState } from 'react';
import { FaCalendarAlt, FaArrowLeft, FaArrowRight } from 'react-icons/fa';
import './BookAppointment.css';

export default function BookAppointment() {
  const [step, setStep] = useState(1); // 1: Choose coach, 2: Select date, 3: Select time
  const [selectedCoach, setSelectedCoach] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // Mock data for coaches
  const coaches = [
    {
      id: 1,
      name: 'Nguyên Văn A',
      role: 'Coach cai thuốc chuyên nghiệp',
      rating: 4.8,
      avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
      available: true
    },
    {
      id: 2,
      name: 'Trần Thị B',
      role: 'Chuyên gia tâm lý',
      rating: 4.9,
      avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
      available: true
    },
    {
      id: 3,
      name: 'Phạm Minh C',
      role: 'Bác sĩ phục hồi chức năng',
      rating: 4.7,
      avatar: 'https://randomuser.me/api/portraits/men/64.jpg',
      available: true
    }
  ];

  // Available time slots
  const timeSlots = ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00'];

  // Helper functions for calendar
  const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

  const generateCalendarDays = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const firstDayOfMonth = getFirstDayOfMonth(year, month);
    
    const days = [];
    
    // Add empty cells for days before the first day of month
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(null);
    }
    
    // Add days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }
    
    return days;
  };

  const goToPrevMonth = () => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(newMonth.getMonth() - 1);
    setCurrentMonth(newMonth);
  };

  const goToNextMonth = () => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(newMonth.getMonth() + 1);
    setCurrentMonth(newMonth);
  };

  const formatMonth = (date) => {
    const options = { month: 'long', year: 'numeric' };
    return date.toLocaleDateString('vi-VN', options);
  };

  const handleSelectCoach = (coach) => {
    setSelectedCoach(coach);
    setStep(2);
  };

  const handleSelectDate = (day) => {
    if (!day) return;
    
    const selectedDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    setSelectedDate(selectedDate);
    setStep(3);
  };

  const handleSelectTime = (time) => {
    setSelectedTime(time);
    alert(`Đặt lịch thành công với ${selectedCoach.name} vào ngày ${selectedDate.toLocaleDateString('vi-VN')} lúc ${time}`);
    // Sau đó có thể thêm logic để lưu lịch hẹn vào cơ sở dữ liệu
  };

  const renderCoachSelection = () => {
    return (
      <div className="coach-selection-container">
        <h2>Chọn Coach</h2>
        <div className="coaches-list">
          {coaches.map(coach => (
            <div 
              key={coach.id} 
              className={`coach-card ${selectedCoach?.id === coach.id ? 'selected' : ''}`}
              onClick={() => handleSelectCoach(coach)}
            >
              <div className="coach-avatar">
                <img src={coach.avatar} alt={coach.name} />
                {coach.available && <div className="coach-status available"></div>}
              </div>
              <div className="coach-info">
                <h3>{coach.name}</h3>
                <p>{coach.role}</p>
                <div className="coach-rating">
                  <span className="stars">{'★'.repeat(Math.floor(coach.rating))}{coach.rating % 1 > 0 ? '☆' : ''}</span>
                  <span className="rating-value">{coach.rating}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderDateSelection = () => {
    const days = generateCalendarDays();
    const dayNames = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
    
    return (
      <div className="date-selection-container">
        <div className="selection-header">
          <button onClick={() => setStep(1)} className="back-button">
            <FaArrowLeft /> Quay lại
          </button>
          <h2>Chọn ngày & giờ</h2>
        </div>

        <div className="selected-coach">
          <img src={selectedCoach.avatar} alt={selectedCoach.name} className="small-avatar" />
          <span>{selectedCoach.name}</span>
        </div>

        <div className="calendar-container">
          <div className="calendar-header">
            <button onClick={goToPrevMonth} className="month-nav">
              <FaArrowLeft />
            </button>
            <h3>{formatMonth(currentMonth)}</h3>
            <button onClick={goToNextMonth} className="month-nav">
              <FaArrowRight />
            </button>
          </div>

          <div className="calendar">
            {dayNames.map(day => (
              <div key={day} className="day-header">{day}</div>
            ))}
            
            {days.map((day, index) => (
              <div 
                key={index} 
                className={`calendar-day ${!day ? 'empty' : ''} ${day === new Date().getDate() && currentMonth.getMonth() === new Date().getMonth() && currentMonth.getFullYear() === new Date().getFullYear() ? 'today' : ''}`}
                onClick={() => handleSelectDate(day)}
              >
                {day}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderTimeSelection = () => {
    return (
      <div className="time-selection-container">
        <div className="selection-header">
          <button onClick={() => setStep(2)} className="back-button">
            <FaArrowLeft /> Quay lại
          </button>
          <h2>Chọn thời gian</h2>
        </div>

        <div className="selection-details">
          <div className="selected-coach">
            <img src={selectedCoach.avatar} alt={selectedCoach.name} className="small-avatar" />
            <span>{selectedCoach.name}</span>
          </div>
          <div className="selected-date">
            <FaCalendarAlt />
            <span>{selectedDate.toLocaleDateString('vi-VN', { weekday: 'long', day: 'numeric', month: 'numeric', year: 'numeric' })}</span>
          </div>
        </div>

        <div className="time-slots-container">
          <p>Khung giờ còn trống:</p>
          <div className="time-slots">
            {timeSlots.map(time => (
              <button 
                key={time} 
                className={`time-slot ${selectedTime === time ? 'selected' : ''}`}
                onClick={() => handleSelectTime(time)}
              >
                {time}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <section className="appointment-section">
      <div className="container">
        <div className="appointment-header">
          <h1>
            <FaCalendarAlt className="appointment-icon" /> 
            Đặt lịch hẹn với Coach
          </h1>
          <p>Nhận hỗ trợ trực tiếp từ các chuyên gia cai thuốc chuyên nghiệp</p>
        </div>

        <div className="appointment-stepper">
          <div className={`stepper-step ${step >= 1 ? 'active' : ''}`}>
            <div className="step-number">1</div>
            <div className="step-label">Chọn Coach</div>
          </div>
          <div className="stepper-line"></div>
          <div className={`stepper-step ${step >= 2 ? 'active' : ''}`}>
            <div className="step-number">2</div>
            <div className="step-label">Chọn ngày</div>
          </div>
          <div className="stepper-line"></div>
          <div className={`stepper-step ${step >= 3 ? 'active' : ''}`}>
            <div className="step-number">3</div>
            <div className="step-label">Chọn giờ</div>
          </div>
        </div>

        <div className="appointment-content">
          {step === 1 && renderCoachSelection()}
          {step === 2 && renderDateSelection()}
          {step === 3 && renderTimeSelection()}
        </div>
      </div>
    </section>
  );
}
