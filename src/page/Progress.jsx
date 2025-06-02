import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import QuitProgressChart from '../components/QuitProgressChart';
import DailyCheckin from '../components/DailyCheckin';
import MoodTracking from '../components/MoodTracking';
import ProgressDashboard from '../components/ProgressDashboard';
import './Progress.css';
import '../styles/DailyCheckin.css';
import '../styles/MoodTracking.css';
import '../styles/ProgressDashboard.css';

export default function Progress() {
  const { user } = useAuth();
  const [activeTimeFilter, setActiveTimeFilter] = useState('30 ngày');
  const [showCompletionDashboard, setShowCompletionDashboard] = useState(false);
  const [completionData, setCompletionData] = useState(null);
  const [userPlan, setUserPlan] = useState(null);
  const [userProgress, setUserProgress] = useState([]);
  const [actualProgress, setActualProgress] = useState([]);
  const [moodData, setMoodData] = useState([]);
  // Load user plan and progress from localStorage
  useEffect(() => {
    loadUserPlanAndProgress();
  }, []);

  const loadUserPlanAndProgress = () => {
    // Load completion data từ JourneyStepper
    const savedCompletion = localStorage.getItem('quitPlanCompletion');
    if (savedCompletion) {
      try {
        const completion = JSON.parse(savedCompletion);
        if (completion && completion.userPlan) {
          setCompletionData(completion);
          setUserPlan(completion.userPlan);
          setShowCompletionDashboard(true);
        } else {
          console.warn('Found saved completion data but it was incomplete');
          const activePlan = getActivePlan();
          setUserPlan(activePlan);
        }
      } catch (error) {
        console.error('Error parsing completion data:', error);
        // Fallback to active plan if there's an error
        const activePlan = getActivePlan();
        setUserPlan(activePlan);
      }
    } else {
      // Nếu chưa hoàn thành, tìm plan đang thực hiện
      const activePlan = getActivePlan();
      setUserPlan(activePlan);
    }

    // Load actual progress từ daily check-ins
    loadActualProgressFromCheckins();
  };
  const getActivePlan = () => {
    // Kiểm tra nếu có kế hoạch đang thực hiện trong localStorage
    try {
      const savedPlan = localStorage.getItem('activePlan');
      if (savedPlan) {
        const parsedPlan = JSON.parse(savedPlan);
        if (parsedPlan && Array.isArray(parsedPlan.weeks) && parsedPlan.weeks.length > 0) {
          return parsedPlan;
        }
      }
    } catch (error) {
      console.error('Error loading saved plan:', error);
    }
      // Trả về kế hoạch mặc định nếu không có hoặc có lỗi
    return {
      name: "Kế hoạch 6 tuần",
      startDate: new Date().toISOString().split('T')[0],
      weeks: [
        { week: 1, amount: 20, phase: "Thích nghi" },
        { week: 2, amount: 16, phase: "Thích nghi" },
        { week: 3, amount: 12, phase: "Tăng tốc" },
        { week: 4, amount: 8, phase: "Tăng tốc" },
        { week: 5, amount: 5, phase: "Hoàn thiện" },
        { week: 6, amount: 2, phase: "Hoàn thiện" },
        { week: 7, amount: 0, phase: "Hoàn thành" }
      ],
      initialCigarettes: 20
    };
  };  const loadActualProgressFromCheckins = () => {
    const actualData = [];
    const today = new Date();
    
    // Duyệt qua 30 ngày gần nhất để tìm dữ liệu check-in
    for (let i = 29; i >= 0; i--) {
      try {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        
        const checkinData = localStorage.getItem(`checkin_${dateStr}`);
        if (checkinData) {
          const data = JSON.parse(checkinData);
          actualData.push({
            date: dateStr,
            actualCigarettes: data.actualCigarettes,
            targetCigarettes: data.targetCigarettes,
            mood: data.mood,
            achievements: data.achievements || [],
            challenges: data.challenges || []
          });
        }
      } catch (error) {
        console.error(`Error loading check-in data for day -${i}:`, error);
      }
    }
    
    setActualProgress(actualData);
  };

  // Xử lý cập nhật tiến trình từ Daily Checkin
  const handleProgressUpdate = async (newProgress) => {
    console.log('Progress updated:', newProgress);
    
    // Load lại actual progress từ localStorage để lấy dữ liệu mới nhất
    const actualData = [];
    const today = new Date();
    
    // Duyệt qua 30 ngày gần nhất để tìm dữ liệu check-in
    for (let i = 29; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      const checkinData = localStorage.getItem(`checkin_${dateStr}`);
      if (checkinData) {
        const data = JSON.parse(checkinData);
        actualData.push({
          date: dateStr,
          actualCigarettes: data.actualCigarettes,
          targetCigarettes: data.targetCigarettes,
          mood: data.mood,
          achievements: data.achievements || [],
          challenges: data.challenges || []
        });
      }
    }
    
    // Cập nhật state để trigger re-render của biểu đồ
    setActualProgress(actualData);
  };
  
  // Xử lý cập nhật tâm trạng từ Mood Tracking
  const handleMoodUpdate = (newMoodData) => {
    console.log('Mood updated:', newMoodData);
    // Có thể thêm logic cập nhật mood data ở đây nếu cần
    setMoodData(prev => [...prev, newMoodData]);
  };
  
  // Check for plan completion data on component mount
  useEffect(() => {
    const savedCompletion = localStorage.getItem('quitPlanCompletion');
    if (savedCompletion) {
      const completion = JSON.parse(savedCompletion);
      setCompletionData(completion);
      setShowCompletionDashboard(true);
    }
  }, []);
  
  if (!userPlan) {
    return (
      <div className="progress-container">
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <p>Đang tải kế hoạch của bạn...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="progress-container">
      <h1 className="page-title">
        {showCompletionDashboard ? 'Chúc mừng! Bạn đã hoàn thành kế hoạch' : 'Tiến trình cai thuốc hiện tại'}
      </h1>
      
      {/* Show completion dashboard if plan is completed */}
      {showCompletionDashboard && completionData ? (
        <ProgressDashboard 
          userPlan={completionData.userPlan}
          completionDate={completionData.completionDate}
        />
      ) : (
        <>
          {/* Daily Checkin Section - Moved to top */}
          <DailyCheckin 
            onProgressUpdate={handleProgressUpdate}
            currentPlan={userPlan}
          />

          {/* Enhanced Progress Chart with Chart.js */}
          <QuitProgressChart 
            userPlan={userPlan}
            actualProgress={actualProgress}
            timeFilter={activeTimeFilter}
            height={350}
          />
          
          {/* Time Filter Controls */}
          <div className="time-filters">
            <button 
              className={`time-filter ${activeTimeFilter === '7 ngày' ? 'active' : ''}`}
              onClick={() => setActiveTimeFilter('7 ngày')}
            >
              7 ngày
            </button>
            <button 
              className={`time-filter ${activeTimeFilter === '14 ngày' ? 'active' : ''}`}
              onClick={() => setActiveTimeFilter('14 ngày')}
            >
              14 ngày
            </button>
            <button 
              className={`time-filter ${activeTimeFilter === '30 ngày' ? 'active' : ''}`}
              onClick={() => setActiveTimeFilter('30 ngày')}
            >
              30 ngày
            </button>
            <button 
              className={`time-filter ${activeTimeFilter === 'Tất cả' ? 'active' : ''}`}
              onClick={() => setActiveTimeFilter('Tất cả')}
            >
              Tất cả
            </button>
          </div>

          {/* Mood Tracking Section - Phần tâm trạng */}
          <MoodTracking 
            onMoodUpdate={handleMoodUpdate}
          />

          {/* Plan Information */}
          <div className="plan-info-section">
            <h2>Kế hoạch hiện tại: {userPlan.name}</h2>
            <div className="plan-summary">
              <div className="summary-item">
                <span className="label">Thời gian:</span>
                <span className="value">{userPlan.weeks.length} tuần</span>
              </div>
              <div className="summary-item">
                <span className="label">Mục tiêu cuối:</span>
                <span className="value">0 điếu/ngày</span>
              </div>
              <div className="summary-item">
                <span className="label">Bắt đầu từ:</span>
                <span className="value">{userPlan.initialCigarettes || userPlan.weeks[0]?.amount || 20} điếu/ngày</span>
              </div>
            </div>
          </div>

          {/* Progress Statistics */}
          {actualProgress.length > 0 && (
            <div className="progress-stats">
              <h2>Thống kê tiến trình</h2>
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-value">{actualProgress.length}</div>
                  <div className="stat-label">Ngày đã check-in</div>
                </div>
                <div className="stat-card">
                  <div className="stat-value">
                    {actualProgress.filter(p => p.actualCigarettes <= p.targetCigarettes).length}
                  </div>
                  <div className="stat-label">Ngày đạt mục tiêu</div>
                </div>
                <div className="stat-card">
                  <div className="stat-value">
                    {actualProgress.length > 0 ? 
                      Math.round(actualProgress.reduce((sum, p) => sum + p.actualCigarettes, 0) / actualProgress.length) 
                      : (userPlan.initialCigarettes || (userPlan.weeks && userPlan.weeks[0]?.amount) || 20)}
                  </div>
                  <div className="stat-label">Trung bình điếu/ngày</div>
                </div>
                <div className="stat-card">
                  <div className="stat-value">
                    {Math.round((actualProgress.filter(p => p.actualCigarettes <= p.targetCigarettes).length / actualProgress.length) * 100)}%
                  </div>
                  <div className="stat-label">Tỷ lệ thành công</div>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}