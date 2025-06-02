import React, { useState, useEffect } from 'react';
import { FaCalendarAlt, FaCheckCircle, FaClock } from 'react-icons/fa';

const QuitPlanDisplay = () => {
  const [planData, setPlanData] = useState(null);
  const [completionDate, setCompletionDate] = useState(null);

  useEffect(() => {
    // Load plan data from localStorage
    const loadQuitPlanData = () => {
      try {
        // Check for completed plan first
        const completionData = localStorage.getItem('quitPlanCompletion');
        if (completionData) {
          const parsedData = JSON.parse(completionData);
          setPlanData(parsedData.userPlan);
          setCompletionDate(parsedData.completionDate);
          return;
        }

        // If no completed plan, check for active plan
        const activePlan = localStorage.getItem('activePlan');
        if (activePlan) {
          const parsedPlan = JSON.parse(activePlan);
          setPlanData(parsedPlan);
          return;
        }
      } catch (error) {
        console.error('Lỗi khi đọc kế hoạch cai thuốc:', error);
      }
    };

    loadQuitPlanData();
  }, []);

  if (!planData) {
    return (
      <div className="no-plan-message">
        <p>Chưa có kế hoạch cai thuốc. Hãy tạo kế hoạch mới để bắt đầu!</p>
      </div>
    );
  }

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('vi-VN');
    } catch {
      return dateString || 'Không xác định';
    }
  };

  return (
    <div className="quit-plan-display">
      <div className="plan-header">
        <h3>{planData.name || 'Kế hoạch cai thuốc cá nhân'}</h3>
        {completionDate && (
          <div className="completion-badge">
            <FaCheckCircle className="completion-icon" />
            <span>Hoàn thành: {formatDate(completionDate)}</span>
          </div>
        )}
      </div>

      <div className="plan-details">
        <div className="plan-detail-item">
          <FaCalendarAlt className="detail-icon" />
          <div className="detail-content">
            <span className="detail-label">Ngày bắt đầu:</span>
            <span className="detail-value">{formatDate(planData.startDate)}</span>
          </div>
        </div>

        <div className="plan-detail-item">
          <FaClock className="detail-icon" />
          <div className="detail-content">
            <span className="detail-label">Thời gian:</span>
            <span className="detail-value">
              {planData.weeks ? `${planData.weeks.length} tuần` : 'Không xác định'}
            </span>
          </div>
        </div>
      </div>

      {planData.strategy && (
        <div className="plan-strategy">
          <h4>Phương pháp:</h4>
          <p>{planData.strategy}</p>
        </div>
      )}

      {planData.goal && (
        <div className="plan-goal">
          <h4>Mục tiêu:</h4>
          <p>{planData.goal}</p>
        </div>
      )}

      {planData.weeks && planData.weeks.length > 0 && (
        <div className="plan-progress">
          <h4>Tiến độ kế hoạch:</h4>
          <div className="weeks-progress">
            {planData.weeks.map((week, index) => (
              <div key={index} className="week-item">
                <span className="week-number">Tuần {week.week || index + 1}:</span>
                <span className="cigarette-count">{week.amount} điếu/ngày</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default QuitPlanDisplay;
