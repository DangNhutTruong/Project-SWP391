import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import QuitProgressChart from '../components/QuitProgressChart';
import DailyCheckin from '../components/DailyCheckin';
import MoodTracking from '../components/MoodTracking';
import ProgressDashboard from '../components/ProgressDashboard';
import ResetCheckinData from '../components/ResetCheckinData';
import { FaCalendarCheck, FaLeaf, FaCoins, FaHeart } from 'react-icons/fa';
import './Progress.css';
import '../styles/DailyCheckin.css';
import '../styles/MoodTracking.css';
import '../styles/ProgressDashboard.css';

export default function Progress() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTimeFilter, setActiveTimeFilter] = useState('30 ngày');
  const [showCompletionDashboard, setShowCompletionDashboard] = useState(false);
  const [completionData, setCompletionData] = useState(null);
  const [userPlan, setUserPlan] = useState(null);
  const [userProgress, setUserProgress] = useState([]);
  const [actualProgress, setActualProgress] = useState([]);
  const [moodData, setMoodData] = useState([]);
  const [hasPlan, setHasPlan] = useState(false); 
  const [shouldRedirect, setShouldRedirect] = useState(false);
  // Thêm state để lưu trữ các thống kê dashboard
  const [dashboardStats, setDashboardStats] = useState({
    noSmokingDays: 0,
    savedCigarettes: 0,
    savedMoney: 0,
    healthProgress: 0  });
  
  // Load user plan and progress from localStorage
  useEffect(() => {
    loadUserPlanAndProgress();
    
    // KHÔNG load saved dashboard stats để đảm bảo luôn tính toán mới
    console.log("Bỏ qua việc load dashboard stats từ localStorage, sẽ tính toán lại");
    
    // Đặt timeout để đảm bảo dữ liệu đã được load đầy đủ trước khi tính toán
    const timer = setTimeout(() => {
      console.log("Đang tính toán thống kê mới sau khi load dữ liệu...");
      recalculateStatistics();
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);
  
  const loadUserPlanAndProgress = () => {
    console.log("LOADING USER PLAN...");
    
    // Xóa thông kê cũ khi load lại trang để đảm bảo có dữ liệu mới
    localStorage.removeItem('dashboardStats');
    console.log("Đã xóa thống kê cũ để tính toán lại khi load trang");
    
    const savedActivePlan = localStorage.getItem('activePlan');
    
    // Kiểm tra xem có kế hoạch active thực sự không
    let hasActivePlan = false;
    if (savedActivePlan) {
      try {
        const parsedPlan = JSON.parse(savedActivePlan);
        if (parsedPlan && Array.isArray(parsedPlan.weeks) && parsedPlan.weeks.length > 0) {
          console.log("Đã tìm thấy kế hoạch active:", parsedPlan.name);
          hasActivePlan = true;
        }
      } catch (e) {
        console.error("Lỗi khi kiểm tra kế hoạch active:", e);
      }
    }
    
    // Load completion data từ JourneyStepper
    const savedCompletion = localStorage.getItem('quitPlanCompletion');
    if (savedCompletion) {
      try {
        const completion = JSON.parse(savedCompletion);
        if (completion && completion.userPlan) {
          setCompletionData(completion);
          setUserPlan(completion.userPlan);
          setShowCompletionDashboard(true);
          setHasPlan(true);
          console.log("Đã tải kế hoạch từ completion data");
        } else {
          console.warn('Found saved completion data but it was incomplete');
          const activePlan = getActivePlan();
          setUserPlan(activePlan);
          setHasPlan(hasActivePlan);
        }
      } catch (error) {
        console.error('Error parsing completion data:', error);
        const activePlan = getActivePlan();
        setUserPlan(activePlan);
        setHasPlan(hasActivePlan);
      }
    } else {
      // Nếu chưa có completion data, tìm plan đang thực hiện
      const activePlan = getActivePlan();
      setUserPlan(activePlan);
      setHasPlan(hasActivePlan);
      console.log("Không tìm thấy completion data, sử dụng active plan:", hasActivePlan);
    }

    // Load actual progress từ daily check-ins
    loadActualProgressFromCheckins();
  };  const getActivePlan = () => {
    // Kiểm tra nếu có kế hoạch đang thực hiện trong localStorage
    try {
      const savedPlan = localStorage.getItem('activePlan');
      if (savedPlan) {
        const parsedPlan = JSON.parse(savedPlan);
        if (parsedPlan && Array.isArray(parsedPlan.weeks) && parsedPlan.weeks.length > 0) {
          console.log("Đã tìm thấy kế hoạch active hợp lệ");
          return parsedPlan;
        } else {
          console.warn("Tìm thấy kế hoạch active nhưng không hợp lệ");
        }
      } else {
        console.log("Không tìm thấy kế hoạch active trong localStorage");
      }
    } catch (error) {
      console.error('Error loading saved plan:', error);
    }
    
    // Trả về kế hoạch mặc định nếu không có hoặc có lỗi
    console.log("Trả về kế hoạch mặc định");    return {
      name: "Kế hoạch mặc định (chưa lập)",
      startDate: new Date().toISOString().split('T')[0],
      weeks: [
        { week: 1, amount: 22, phase: "Thích nghi" },
        { week: 2, amount: 17, phase: "Thích nghi" },
        { week: 3, amount: 12, phase: "Tăng tốc" },
        { week: 4, amount: 8, phase: "Tăng tốc" },        
        { week: 5, amount: 5, phase: "Hoàn thiện" },
        { week: 6, amount: 2, phase: "Hoàn thiện" },
        { week: 7, amount: 0, phase: "Mục tiêu đạt được" }
      ],
      initialCigarettes: 22
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
  };  // Xử lý cập nhật tiến trình từ Daily Checkin
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
        try {
          const data = JSON.parse(checkinData);
          if (data && typeof data === 'object') {
            actualData.push({
              date: dateStr,
              actualCigarettes: data.actualCigarettes,
              targetCigarettes: data.targetCigarettes,
              mood: data.mood,
              achievements: data.achievements || [],
              challenges: data.challenges || []
            });
            console.log(`Loaded data for ${dateStr}:`, data.actualCigarettes, data.targetCigarettes);
          }
        } catch (error) {
          console.error(`Error parsing data for ${dateStr}:`, error);
        }
      }
    }
    
    // Đảm bảo dữ liệu được sắp xếp theo ngày tăng dần
    actualData.sort((a, b) => new Date(a.date) - new Date(b.date));
    
    console.log('Updated actual progress data:', actualData);
    // Cập nhật state để trigger re-render của biểu đồ
    setActualProgress(actualData);
    
    // Sau khi cập nhật actual progress, tính toán lại các thống kê
    setTimeout(() => {
      // Dùng setTimeout để đảm bảo actualProgress đã được cập nhật
      const updatedStats = recalculateStatistics();
      console.log('Đã cập nhật thống kê dashboard:', updatedStats);
    }, 0);
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
  // Recalculate statistics whenever actualProgress changes
  useEffect(() => {
    console.log("actualProgress changed, recalculating statistics...");
    // Recalculate even if there's no data, to reset stats if needed
    recalculateStatistics();
  }, [actualProgress]);
  
  // Force refresh khi component mount
  useEffect(() => {
    // Clear dashboard stats khi mount component để đảm bảo tính toán mới
    const savedStats = localStorage.getItem('dashboardStats');
    if (savedStats) {
      console.log("Tìm thấy dashboard stats cũ:", savedStats);
      console.log("Sẽ tính toán lại từ đầu");
    }
    
    // Đợi 1 giây trước khi tính lại để các dữ liệu khác đã load xong
    const timer = setTimeout(() => {
      recalculateStatistics();
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);
    // Không chuyển hướng tự động, chỉ hiển thị nút cho người dùng
  useEffect(() => {
    if (userPlan) {
      // Chỉ kiểm tra xem có kế hoạch và cập nhật state
      console.log("Đã kiểm tra kế hoạch:", hasPlan ? "Có kế hoạch" : "Không có kế hoạch");
    }
  }, [userPlan, hasPlan]);  // Tính toán lại tất cả các thống kê và cập nhật state
  const recalculateStatistics = () => {
    console.log("======= BẮT ĐẦU TÍNH TOÁN THỐNG KÊ MỚI =======");
    
    // Tính số ngày không hút thuốc (dựa vào dữ liệu check-in)
    const currentDate = new Date();
    const noSmokingDays = actualProgress.filter(day => day.actualCigarettes === 0).length;
    
    // Hiển thị tất cả dữ liệu check-in hiện có
    console.log("Dữ liệu check-in hiện có:", actualProgress);
      // Lấy số điếu ban đầu chính xác từ kế hoạch và activePlan
    let initialCigarettesPerDay = 0;
    
    // Ưu tiên lấy từ activePlan vì đó là nơi lưu giá trị người dùng nhập
    try {
      const activePlanData = localStorage.getItem('activePlan');
      if (activePlanData) {
        const activePlan = JSON.parse(activePlanData);
        if (activePlan && activePlan.initialCigarettes) {
          initialCigarettesPerDay = activePlan.initialCigarettes;
          console.log(`Lấy số điếu ban đầu từ activePlan: ${initialCigarettesPerDay}`);
        }
      }
    } catch (error) {
      console.error('Lỗi khi đọc initialCigarettes từ activePlan:', error);
    }
    
    // Nếu không có trong activePlan, thử lấy từ userPlan
    if (!initialCigarettesPerDay) {
      initialCigarettesPerDay = userPlan?.initialCigarettes || 
                               (userPlan?.weeks && userPlan.weeks.length > 0 ? userPlan.weeks[0].amount : 22);
    }
    
    console.log(`Số điếu ban đầu được sử dụng: ${initialCigarettesPerDay} điếu/ngày`);
    
    // Chỉ tìm check-in của hôm nay
    const todayDateStr = new Date().toISOString().split('T')[0];
    const todayRecord = actualProgress.find(day => day.date === todayDateStr);
      // Tính số điếu đã tránh CHỈ cho ngày hôm nay
    let savedCigarettes = 0;
    let detailedLog = '';
    
    // Lấy số điếu ban đầu từ activePlan trong localStorage nếu có
    let userInitialCigarettes = initialCigarettesPerDay;
    try {
      const activePlanData = localStorage.getItem('activePlan');
      if (activePlanData) {
        const activePlan = JSON.parse(activePlanData);
        if (activePlan && activePlan.initialCigarettes) {
          userInitialCigarettes = activePlan.initialCigarettes;
          console.log(`Lấy số điếu ban đầu từ activePlan: ${userInitialCigarettes}`);
        }
      }
    } catch (error) {
      console.error('Lỗi khi đọc initialCigarettes từ activePlan:', error);
    }
    
    // Xóa thông tin về số điếu đã tránh từ localStorage để đảm bảo tính toán mới
    if (todayRecord) {
      // Tính số điếu đã tránh cho hôm nay = số điếu người dùng nhập ban đầu - số điếu đã hút thực tế
      savedCigarettes = Math.max(0, userInitialCigarettes - todayRecord.actualCigarettes);
      
      console.log(`[TÍNH TOÁN MỚI] Check-in hôm nay (${todayDateStr}):`);
      console.log(`- Số điếu người dùng nhập ban đầu: ${userInitialCigarettes} điếu`);
      console.log(`- Số điếu đã hút thực tế: ${todayRecord.actualCigarettes} điếu`);
      console.log(`- Số điếu đã tránh: ${userInitialCigarettes} - ${todayRecord.actualCigarettes} = ${savedCigarettes} điếu`);
      
      detailedLog = `\n- Hôm nay ${todayDateStr}: ${userInitialCigarettes} - ${todayRecord.actualCigarettes} = ${savedCigarettes} điếu`;
    } else {
      console.log(`[THÔNG BÁO] Không có check-in cho hôm nay (${todayDateStr}), không có điếu nào được tránh`);
      detailedLog = `\n- Chưa có check-in cho hôm nay (${todayDateStr})`;
    }
      console.log(`Chi tiết điếu thuốc đã tránh:${detailedLog}`);
    console.log(`Tổng số điếu đã tránh hôm nay: ${savedCigarettes}`);
    
    // Lưu thông tin chi tiết để debug
    const dailySavings = todayRecord ? [{
      date: todayDateStr,
      actual: todayRecord.actualCigarettes,
      targetFromPlan: initialCigarettesPerDay,
      userInitialCigarettes: userInitialCigarettes,
      saved: savedCigarettes
    }] : [];
      console.log(`Chi tiết điếu thuốc đã tránh theo ngày:${detailedLog}`);
    console.log(`Tổng số điếu đã tránh: ${savedCigarettes}`);
    console.log("Chi tiết các ngày:", dailySavings);
    
    if (todayRecord) {
      console.log(`Đã tính toán số điếu tránh cho hôm nay: ${savedCigarettes} điếu`);
    } else {
      console.log(`Không có check-in cho hôm nay (${todayDateStr})`);
      // Nếu không có check-in hôm nay, số điếu tránh sẽ là 0
      savedCigarettes = 0;
      console.log("Không có check-in hôm nay, đặt số điếu đã tránh = 0");
    }
    
    // Tính số tiền tiết kiệm (giả sử 1 gói = 20 điếu, giá 25,000đ)
    const pricePerCigarette = 25000 / 20;
    const savedMoney = savedCigarettes * pricePerCigarette;
    
    // Tính milestone sức khỏe đạt được
    // Milestone theo thời gian WHO
    const healthMilestones = [
      { days: 1, title: '24 giờ đầu tiên', description: 'Carbon monoxide được loại bỏ khỏi cơ thể' },
      { days: 2, title: '48 giờ', description: 'Nicotine được loại bỏ, vị giác cải thiện' },
      { days: 3, title: '72 giờ', description: 'Đường hô hấp thư giãn, năng lượng tăng' },
      { days: 14, title: '2 tuần', description: 'Tuần hoàn máu cải thiện' },
      { days: 30, title: '1 tháng', description: 'Chức năng phổi tăng 30%' },
      { days: 90, title: '3 tháng', description: 'Ho và khó thở giảm đáng kể' },
      { days: 365, title: '1 năm', description: 'Nguy cơ bệnh tim giảm 50%' }
    ];
      // Tìm ngày đầu tiên có check-in để tính số ngày đã bắt đầu
    let daysInPlan = 0;
    if (actualProgress.length > 0) {
      const oldestRecord = new Date(actualProgress[0].date);
      daysInPlan = Math.floor((currentDate - oldestRecord) / (1000 * 60 * 60 * 24)) + 1;
    }
    
    // Đếm số milestone đã đạt được
    const achievedMilestones = healthMilestones.filter(m => daysInPlan >= m.days).length;
    const healthProgress = Math.round((achievedMilestones / healthMilestones.length) * 100);
      console.log(`Thống kê mới: ${noSmokingDays} ngày không hút, ${savedCigarettes} điếu đã tránh, ${savedMoney.toFixed(0)}đ tiết kiệm, tiến độ sức khỏe ${healthProgress}%`);
      // Cập nhật state với thống kê mới
    const newStats = {
      noSmokingDays,
      savedCigarettes,
      savedMoney,
      healthProgress,
      // Thêm thông tin chi tiết để debugging
      calculationDetails: {
        initialCigarettesPerDay,
        dailySavings,
        lastCalculated: new Date().toISOString(),
        debug: {
          actualData: todayRecord ? {
            date: todayDateStr,
            actualCigarettes: todayRecord.actualCigarettes,
            targetCigarettes: todayRecord.targetCigarettes
          } : "Chưa có check-in hôm nay",
          savedCalcDesc: `${initialCigarettesPerDay} - ${todayRecord?.actualCigarettes || 0} = ${savedCigarettes} điếu`
        }
      }
    };
    
    console.log("Đang cập nhật state với thống kê mới:", newStats);
    console.log("QUAN TRỌNG - Số điếu đã tránh mới: " + savedCigarettes);
    
    // Cập nhật state
    setDashboardStats(newStats);
    
    // Lưu vào localStorage để sử dụng giữa các phiên - xóa trước để đảm bảo không giữ lại dữ liệu cũ
    localStorage.removeItem('dashboardStats');
    localStorage.setItem('dashboardStats', JSON.stringify(newStats));
    
    console.log("======= KẾT THÚC TÍNH TOÁN THỐNG KÊ =======");
    
    return newStats;
  }
  
  if (!userPlan) {
    return (
      <div className="progress-container">
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <p>Đang tải kế hoạch của bạn...</p>
        </div>
      </div>
    );
  }  // Kiểm tra xem có cần hiển thị thông báo cần lập kế hoạch
  if (userPlan && !hasPlan) {
    return (
      <div className="progress-container">
        <div style={{ 
          textAlign: 'center', 
          padding: '3rem',
          maxWidth: '600px',
          margin: '0 auto',
          backgroundColor: 'white',
          borderRadius: '10px',
          boxShadow: '0 5px 15px rgba(0,0,0,0.1)',
          marginTop: '2rem' 
        }}>
          <h2 style={{
            fontSize: '1.8rem',
            marginBottom: '1.5rem',
            color: '#2c3e50'
          }}>Bạn cần lập kế hoạch cai thuốc</h2>
          <p style={{
            fontSize: '1.1rem',
            marginBottom: '2rem',
            color: '#7f8c8d',
            lineHeight: '1.6'
          }}>
            Để theo dõi tiến trình cai thuốc, hãy lập một kế hoạch phù hợp với mục tiêu 
            và khả năng của bạn. Kế hoạch này sẽ giúp bạn duy trì động lực và đo lường 
            sự tiến bộ hàng ngày.
          </p>
            <a 
            href="/journey"
            style={{
              backgroundColor: '#3498db',
              color: 'white',
              border: 'none',
              borderRadius: '30px',
              padding: '12px 25px',
              fontSize: '1rem',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              textDecoration: 'none',
              display: 'inline-block'
            }}
            onMouseOver={(e) => e.target.style.backgroundColor = '#2980b9'}
            onMouseOut={(e) => e.target.style.backgroundColor = '#3498db'}
          >
            Lập kế hoạch cai thuốc ngay
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="progress-container">      <h1 className="page-title">
        {showCompletionDashboard ? 'Chúc mừng! Bạn đã lập kế hoạch cai thuốc' : 'Tiến trình cai thuốc hiện tại'}
      </h1>{/* Daily Checkin Section - Luôn hiển thị để người dùng có thể nhập số điếu đã hút */}
      <DailyCheckin 
        onProgressUpdate={handleProgressUpdate}        currentPlan={userPlan || {
          name: "Kế hoạch mặc định",
          startDate: new Date().toISOString().split('T')[0],
          weeks: [
            { week: 1, amount: 22, phase: "Thích nghi" },
            { week: 2, amount: 17, phase: "Thích nghi" },
            { week: 3, amount: 12, phase: "Tăng tốc" },
            { week: 4, amount: 8, phase: "Tăng tốc" },
            { week: 5, amount: 5, phase: "Hoàn thiện" },
            { week: 6, amount: 2, phase: "Hoàn thiện" },
            { week: 7, amount: 0, phase: "Mục tiêu đạt được" }
          ],
          initialCigarettes: 22
        }}
      />

      {/* Show completion dashboard if plan is completed */}      {showCompletionDashboard && completionData ? (
        <ProgressDashboard 
          userPlan={completionData.userPlan}
          completionDate={completionData.completionDate}
          dashboardStats={dashboardStats}
        />
      ) : (
        <>{/* Enhanced Progress Chart with Chart.js */}          <QuitProgressChart 
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
          </div>          {/* Dynamic Dashboard Stats */}
          {actualProgress.length > 0 && (
            <div className="dashboard-stats">
              <h2>Thống kê tiến trình</h2>
              <div className="dashboard-stats">
                <div className="stat-card primary">
                  <div className="stat-icon">
                    <FaCalendarCheck />
                  </div>
                  <div className="stat-content">
                    <h3>{dashboardStats.noSmokingDays}</h3>
                    <p>Ngày không hút thuốc</p>
                  </div>
                </div>                <div className="stat-card success">
                  <div className="stat-icon">
                    <FaLeaf />
                  </div>
                  <div className="stat-content">
                    <h3>{dashboardStats.savedCigarettes.toLocaleString()}</h3>
                    <p>Điếu thuốc đã tránh</p>
                    <small style={{fontSize: '10px', color: '#666'}}>
                      (Hôm nay: {userPlan?.initialCigarettes || 
                             (userPlan?.weeks && userPlan.weeks.length > 0 ? userPlan.weeks[0].amount : 25)} - số điếu đã hút)
                    </small>
                  </div>
                </div>

                <div className="stat-card money">
                  <div className="stat-icon">
                    <FaCoins />
                  </div>
                  <div className="stat-content">
                    <h3>{(dashboardStats.savedMoney / 1000).toFixed(0)}K</h3>
                    <p>VNĐ đã tiết kiệm</p>
                  </div>
                </div>

                <div className="stat-card health">
                  <div className="stat-icon">
                    <FaHeart />
                  </div>
                  <div className="stat-content">
                    <h3>{dashboardStats.healthProgress.toFixed(0)}%</h3>
                    <p>Milestone sức khỏe</p>
                  </div>
                </div>
              </div>
              
              {/* Thống kê chi tiết về check-in */}
              <div className="stats-grid" style={{marginTop: '20px'}}>
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
                    {actualProgress.length > 0 ? 
                      Math.round((actualProgress.filter(p => p.actualCigarettes <= p.targetCigarettes).length / actualProgress.length) * 100) : 0}%
                  </div>
                  <div className="stat-label">Tỷ lệ thành công</div>
                </div>
              </div>              {/* Công cụ Reset dữ liệu và Reset nhanh Dashboard */}
              <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginTop: '20px' }}>                <button 
                  onClick={() => {
                    localStorage.removeItem('dashboardStats');
                    // Đợi xóa xong rồi mới tính toán lại
                    setTimeout(() => {
                      console.log("Đã xóa dashboard stats, đang tính toán lại...");
                      recalculateStatistics();
                      alert('Đã reset và tính toán lại thống kê mới');
                    }, 100);
                  }}
                  style={{
                    backgroundColor: '#e67e22',
                    color: 'white',
                    border: 'none',
                    padding: '8px 15px',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '14px'
                  }}
                >
                  Reset thống kê
                </button>
                <ResetCheckinData onDataReset={() => loadUserPlanAndProgress()} />
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}