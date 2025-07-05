import React, { useState, useEffect, useCallback } from 'react';
import QuitProgressChart from '../components/QuitProgressChart';
import DailyCheckin from '../components/DailyCheckin';
import ProgressDashboard from '../components/ProgressDashboard';
import ResetCheckinData from '../components/ResetCheckinData';
import '../styles/DailyCheckin.css';
import '../styles/ProgressDashboard.css';

export default function Progress() {
  const [activeTimeFilter, setActiveTimeFilter] = useState('30 ngày');
  const [showCompletionDashboard, setShowCompletionDashboard] = useState(false);
  const [completionData, setCompletionData] = useState(null);
  const [userPlan, setUserPlan] = useState(null);
  const [actualProgress, setActualProgress] = useState([]);
  const [dashboardStats, setDashboardStats] = useState(null);

  // Load user plan and progress from localStorage
  const loadUserPlanAndProgress = useCallback(() => {
    // Load completion data từ JourneyStepper
    const savedCompletion = localStorage.getItem('quitPlanCompletion');
    if (savedCompletion) {
      try {
        const completion = JSON.parse(savedCompletion);
        setShowCompletionDashboard(true);
        setCompletionData(completion);
        setUserPlan(completion.plan);
        return;
      } catch (error) {
        console.error('Error parsing completion data:', error);
      }
    } else {
      // Nếu chưa hoàn thành, tìm plan đang thực hiện
      const activePlan = getActivePlan();
      setUserPlan(activePlan);
    }
    // Load actual progress từ daily check-ins
    loadActualProgressFromCheckins();
  }, []);

  useEffect(() => {
    loadUserPlanAndProgress();
  }, [loadUserPlanAndProgress]);

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
      console.error('Error loading plan from localStorage:', error);
    }
    // Fallback plan nếu không có dữ liệu
    return {
      name: 'Kế hoạch mặc định',
      weeks: [
        { amount: 15 },
        { amount: 10 },
        { amount: 5 },
        { amount: 0 }
      ],
      startDate: new Date().toISOString()
    };
  };

  const loadActualProgressFromCheckins = () => {
    const progressData = [];
    const today = new Date();
    // Load dữ liệu check-in từ 30 ngày trước đến nay
    for (let i = 30; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      const dateString = date.toISOString().split('T')[0];
      const checkinData = localStorage.getItem(`checkin_${dateString}`);
      if (checkinData) {
        try {
          const data = JSON.parse(checkinData);
          progressData.push({
            date: dateString,
            actualCigarettes: data.cigarettesSmoked || 0,
            targetCigarettes: data.targetCigarettes || 0,
            notes: data.notes || ''
          });
        } catch (error) {
          console.error(`Error parsing checkin data for ${dateString}:`, error);
        }
      }
    }
    setActualProgress(progressData);
  };

  // Check for plan completion data on component mount
  useEffect(() => {
    const savedCompletion = localStorage.getItem('quitPlanCompletion');
    if (savedCompletion) {
      try {
        const completion = JSON.parse(savedCompletion);
        setShowCompletionDashboard(true);
        setCompletionData(completion);
      } catch (error) {
        console.error('Error parsing completion data:', error);
      }
    }
  }, []);

  // Track userPlan changes for debugging
  useEffect(() => {
    if (userPlan) {
      const hasValidPlan = userPlan && userPlan.weeks && Array.isArray(userPlan.weeks) && userPlan.weeks.length > 0;
      console.log(`Plan loaded: ${userPlan.name}, Valid: ${hasValidPlan ? "Có kế hoạch" : "Không có kế hoạch"}`);
    }
  }, [userPlan]);

  // Tính toán lại tất cả các thống kê và cập nhật state
  const recalculateStatistics = useCallback(() => {
    console.log("======= BẮT ĐẦU TÍNH TOÁN THỐNG KÊ MỚI =======");
    
    // Tính số ngày theo dõi - CHỈ tính các ngày có thực sự checkin
    let noSmokingDays = 0;
    
    // Tính số ngày đã checkin (thực tế theo dõi)
    noSmokingDays = actualProgress.length;
    console.log(`Số ngày đã checkin (theo dõi thực tế): ${noSmokingDays}`);
    
    // Lấy số điếu ban đầu từ week đầu tiên
    let initialCigarettesPerDay = 20; // Mặc định
    if (userPlan && userPlan.weeks && userPlan.weeks.length > 0 && userPlan.weeks[0].amount) {
      initialCigarettesPerDay = userPlan.weeks[0].amount;
    } else if (userPlan && userPlan.initialCigarettes) {
      initialCigarettesPerDay = userPlan.initialCigarettes;
    }
    
    console.log(`Số điếu ban đầu mỗi ngày: ${initialCigarettesPerDay}`);
    
    // Tính số điếu đã tránh được dựa trên dữ liệu checkin thực tế
    let savedCigarettes = 0;
    actualProgress.forEach((dayRecord) => {
      const daySaved = Math.max(0, initialCigarettesPerDay - (dayRecord.actualCigarettes || 0));
      savedCigarettes += daySaved;
      console.log(`Ngày ${dayRecord.date}: ${initialCigarettesPerDay} - ${dayRecord.actualCigarettes} = ${daySaved} điếu${daySaved > 0 ? ' ✅' : ' (không tránh được)'}`);
    });
    
    console.log(`Tổng số điếu đã tránh: ${savedCigarettes} điếu từ ${actualProgress.length} ngày checkin`);
    
    // Tính tiền tiết kiệm
    let packPrice = 25000; // Giá mặc định
    try {
      const activePlanData = localStorage.getItem("activePlan");
      if (activePlanData) {
        const activePlan = JSON.parse(activePlanData);
        if (activePlan.packPrice) {
          packPrice = parseFloat(activePlan.packPrice);
          console.log(`Giá gói thuốc từ activePlan: ${packPrice.toLocaleString()}đ`);
        }
      }
    } catch (error) {
      console.error("Lỗi khi lấy packPrice từ activePlan:", error);
    }
    
    const pricePerCigarette = packPrice / 20; // Giả sử 1 gói = 20 điếu
    const savedMoney = savedCigarettes * pricePerCigarette;
    
    // Chuẩn bị milestone sức khỏe
    const healthMilestones = [
      { days: 1, title: "24 giờ", description: "Carbon monoxide được loại bỏ" },
      { days: 2, title: "48 giờ", description: "Nicotine được loại bỏ, vị giác cải thiện" },
      { days: 3, title: "72 giờ", description: "Đường hô hấp thư giãn, năng lượng tăng" },
      { days: 14, title: "2 tuần", description: "Tuần hoàn máu cải thiện" },
      { days: 30, title: "1 tháng", description: "Chức năng phổi tăng 30%" },
      { days: 90, title: "3 tháng", description: "Ho và khó thở giảm đáng kể" },
      { days: 365, title: "1 năm", description: "Nguy cơ bệnh tim giảm 50%" }
    ];
    
    // Tìm milestone sức khỏe đã đạt được
    const achievedMilestones = healthMilestones.filter((m) => noSmokingDays >= m.days).length;
    const healthProgress = Math.round((achievedMilestones / healthMilestones.length) * 100);
    
    // Cập nhật state với thống kê mới
    const newStats = {
      noSmokingDays,
      savedCigarettes,
      savedMoney,
      healthProgress
    };
    
    console.log("======= KẾT THÚC TÍNH TOÁN THỐNG KÊ =======");
    
    // Cập nhật state với thống kê mới
    setDashboardStats(newStats);
    
    return newStats;
  }, [actualProgress, userPlan]);

  // Recalculate statistics when actualProgress changes
  useEffect(() => {
    recalculateStatistics();
  }, [actualProgress, recalculateStatistics]);

  if (!userPlan) {
    return (
      <div className="progress-container">
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <p>Đang tải kế hoạch của bạn...</p>
        </div>
      </div>
    );
  }

  if (showCompletionDashboard && completionData) {
    return (
      <div className="progress-container">
        <div className="completion-dashboard">
          <ProgressDashboard 
            userPlan={completionData.plan}
            completionDate={completionData.completionDate}
            dashboardStats={dashboardStats}
            actualProgress={actualProgress}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="progress-container">
      <div className="progress-content">
        {/* Header */}
        <div className="progress-header">
          <h1>Theo dõi tiến trình</h1>
          <p>Xem tiến trình cai thuốc và thống kê cá nhân của bạn</p>
        </div>

        {/* Main Progress Dashboard - Thay thế MoodTracking */}
        <div className="main-progress-section">
          <ProgressDashboard 
            userPlan={userPlan}
            completionDate={userPlan?.startDate}
            dashboardStats={dashboardStats}
            actualProgress={actualProgress}
          />
        </div>

        {/* Daily Check-in */}
        <div className="checkin-section">
          <DailyCheckin 
            currentPlan={userPlan}
            onProgressUpdate={(data) => {
              console.log('Progress updated from DailyCheckin:', data);
              // Reload progress after update
              loadActualProgressFromCheckins();
            }}
          />
        </div>

        {/* Chart Section */}
        <div className="chart-section">
          <div className="section-header">
            <h2>Biểu đồ tiến trình</h2>
            <div className="time-filter-buttons">
              <button 
                className={activeTimeFilter === '7 ngày' ? 'active' : ''}
                onClick={() => setActiveTimeFilter('7 ngày')}
              >
                7 ngày
              </button>
              <button 
                className={activeTimeFilter === '30 ngày' ? 'active' : ''}
                onClick={() => setActiveTimeFilter('30 ngày')}
              >
                30 ngày
              </button>
              <button 
                className={activeTimeFilter === 'Tất cả' ? 'active' : ''}
                onClick={() => setActiveTimeFilter('Tất cả')}
              >
                Tất cả
              </button>
            </div>
          </div>

          <QuitProgressChart
            userPlan={userPlan}
            actualProgress={actualProgress}
            timeFilter={activeTimeFilter}
          />
        </div>

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
              <span className="label">Ngày bắt đầu:</span>
              <span className="value">
                {userPlan.startDate ? new Date(userPlan.startDate).toLocaleDateString() : 'Chưa xác định'}
              </span>
            </div>
          </div>
        </div>

        {/* Development Tools */}
        <ResetCheckinData onReset={() => {
          setActualProgress([]);
          console.log('Check-in data reset');
        }} />
      </div>
    </div>
  );
}
