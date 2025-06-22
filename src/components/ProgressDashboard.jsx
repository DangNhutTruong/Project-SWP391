import React, { useState, useEffect, useCallback } from 'react';
import { FaTrophy, FaCalendarCheck, FaChartLine, FaLeaf, FaCoins, FaHeart } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import QuitProgressChart from './QuitProgressChart';

const ProgressDashboard = ({ userPlan, completionDate, dashboardStats: externalStats, onDataReset }) => {
  const [dashboardStats, setDashboardStats] = useState(null);
  const [milestones, setMilestones] = useState([]);  // Tính toán thống kê
  
  // Early return if required props are missing
  if (!userPlan || !completionDate) {
    return (
      <div className="dashboard-error">
        <p>Không thể hiển thị dashboard - thiếu dữ liệu cần thiết</p>
      </div>
    );
  }
  
  const calculateDashboardStats = useCallback(() => {
    if (!userPlan || !completionDate) return;

    // Nếu có thống kê từ bên ngoài, sử dụng nó thay vì tính toán lại
    if (externalStats && Object.keys(externalStats).length > 0) {
      console.log("Sử dụng thống kê từ Progress.jsx:", externalStats);
      setDashboardStats({
        daysSincePlanCreation: externalStats.noSmokingDays || 0, 
        cigarettesSaved: externalStats.savedCigarettes || 0,
        moneySaved: externalStats.savedMoney || 0,
        planDuration: userPlan.weeks ? userPlan.weeks.length : 0,
        planName: userPlan.name || 'Kế hoạch cá nhân',
        healthProgress: externalStats.healthProgress || 0
      });
      return;
    }

    // Tính toán thông thường nếu không có thống kê từ bên ngoài
    const startDate = new Date(completionDate);
    const today = new Date();
    const daysSinceStart = Math.floor((today - startDate) / (1000 * 60 * 60 * 24));
    
    // Tính toán số điếu đã tiết kiệm được - đảm bảo userPlan.weeks tồn tại
    const initialCigarettesPerDay = userPlan.weeks && userPlan.weeks.length > 0 ? 
      userPlan.weeks[0]?.amount || 20 : 20;
    const estimatedSaved = initialCigarettesPerDay * daysSinceStart;
      // Tính tiền tiết kiệm (giả sử 1 gói = 25,000đ, 1 gói = 20 điếu)
    // Nếu có thống kê từ bên ngoài, sử dụng số tiền đã tính toán
    const pricePerCigarette = 25000 / 20;
    const moneySaved = externalStats && externalStats.savedMoney ? 
                     externalStats.savedMoney : 
                     estimatedSaved * pricePerCigarette;
    
    setDashboardStats({
      daysSincePlanCreation: daysSinceStart, 
      cigarettesSaved: estimatedSaved,
      moneySaved: moneySaved,
      planDuration: userPlan.weeks ? userPlan.weeks.length : 0,
      planName: userPlan.name || 'Kế hoạch cá nhân',
      healthProgress: 0 // Giá trị mặc định
    });
  }, [userPlan, completionDate, externalStats]);
  
  const loadMilestones = useCallback(() => {
    // Nếu không có dữ liệu đầy đủ, không thực hiện
    if (!userPlan || !completionDate || !dashboardStats) {
      return;
    }
    
    
    // Milestone theo thời gian WHO
    const healthMilestones = [
      { days: 1, title: '24 giờ đầu tiên', description: 'Carbon monoxide được loại bỏ khỏi cơ thể', achieved: false },
      { days: 2, title: '48 giờ', description: 'Nicotine được loại bỏ, vị giác cải thiện', achieved: false },
      { days: 3, title: '72 giờ', description: 'Đường hô hấp thư giãn, năng lượng tăng', achieved: false },
      { days: 14, title: '2 tuần', description: 'Tuần hoàn máu cải thiện', achieved: false },
      { days: 30, title: '1 tháng', description: 'Chức năng phổi tăng 30%', achieved: false },
      { days: 90, title: '3 tháng', description: 'Ho và khó thở giảm đáng kể', achieved: false },
      { days: 365, title: '1 năm', description: 'Nguy cơ bệnh tim giảm 50%', achieved: false }
    ];

    const updatedMilestones = healthMilestones.map(milestone => ({
      ...milestone,
      achieved: dashboardStats.daysSincePlanCreation >= milestone.days
    }));
    setMilestones(updatedMilestones);
  }, [userPlan, completionDate, dashboardStats]);

  // Add useEffect hooks after function declarations
  useEffect(() => {
    if (userPlan && completionDate) {
      calculateDashboardStats();
    }
  }, [userPlan, completionDate, calculateDashboardStats]);
  
  // Tải milestone sau khi đã có thống kê
  useEffect(() => {
    if (dashboardStats) {
      loadMilestones();
    }
  }, [dashboardStats, loadMilestones]);  const getAchievementProgress = () => {
    // Nếu có giá trị từ bên ngoài, sử dụng nó
    if (dashboardStats && dashboardStats.healthProgress !== undefined) {
      return dashboardStats.healthProgress;
    }
    
    // Nếu không, tính toán từ milestone
    if (!milestones || milestones.length === 0) return 0;
    const achieved = milestones.filter(m => m.achieved).length;
    return (achieved / milestones.length) * 100;
  };

  // Add some debugging information
  useEffect(() => {
    console.log("Current dashboard stats:", dashboardStats);
    console.log("Current milestones:", milestones);
  }, [dashboardStats, milestones]);
  
  // Show loading state while dashboardStats is not set
  if (!dashboardStats) {
    console.log("Dashboard stats not set yet, showing loading screen");
    return (
      <div className="dashboard-loading">
        <p>Đang tải dashboard...</p>
      </div>
    );  }

  const achievementProgress = getAchievementProgress();

  // Thêm reset toàn bộ dữ liệu
  const handleReset = () => {
    if (window.confirm('Bạn có chắc muốn reset dữ liệu check-in?')) {
      localStorage.removeItem('actualProgress');
      localStorage.removeItem('dashboardStats');
      if (onDataReset) {
        onDataReset();
      }
      alert('Dữ liệu đã được reset');
    }
  };

  return (
    <div className="progress-dashboard">      {/* Key Statistics */}
      <div className="dashboard-stats">
        <div className="stat-card primary">
          <div className="stat-icon">
            <FaCalendarCheck />
          </div>
          <div className="stat-content">
            <h3>{dashboardStats.daysSincePlanCreation}</h3>
            <p>Thời gian cai thuốc</p>
          </div>
        </div>        <div className="stat-card success">
          <div className="stat-icon">
            <FaLeaf />
          </div>          <div className="stat-content">
            <h3>{externalStats && externalStats.savedCigarettes ? externalStats.savedCigarettes.toLocaleString() : (dashboardStats.cigarettesSaved ? dashboardStats.cigarettesSaved.toLocaleString() : '0')}</h3>
            <p>Điếu thuốc đã tránh</p>       
          </div>
        </div>

        <div className="stat-card money">
          <div className="stat-icon">
            <FaCoins />
          </div>
          <div className="stat-content">
            <h3>{(dashboardStats.moneySaved / 1000).toFixed(0)}K</h3>
            <p>VNĐ đã tiết kiệm</p>
          </div>
        </div>

        <div className="stat-card health">
          <div className="stat-icon">
            <FaHeart />
          </div>
          <div className="stat-content">
            <h3>{achievementProgress.toFixed(0)}%</h3>
            <p>Milestone sức khỏe</p>
          </div>
        </div>
      </div>      {/* Progress Chart */}
      <div className="maintenance-section">
        <h2>
          <FaChartLine className="section-icon" />
          Kế hoạch của bạn
        </h2>
        <div className="maintenance-chart">
          <QuitProgressChart
            userPlan={userPlan || { weeks: [], name: 'Kế hoạch cá nhân' }}
            actualProgress={[]} // Không cần actual data nữa vì đã hoàn thành
            timeFilter="Tất cả"
            height={250}
          />
        </div>
      </div>

      {/* Health Milestones */}
      <div className="milestones-section">
        <h2>Milestone sức khỏe</h2>
        <div className="milestones-grid">
          {milestones.map((milestone, index) => (
            <div 
              key={index} 
              className={`milestone-card ${milestone.achieved ? 'achieved' : 'pending'}`}
            >
              <div className="milestone-indicator">
                {milestone.achieved ? '✅' : '⏳'}
              </div>
              <div className="milestone-content">
                <h4>{milestone.title}</h4>
                <p>{milestone.description}</p>
                {!milestone.achieved && (
                  <span className="days-remaining">
                    Còn {milestone.days - dashboardStats.daysSincePlanCreation} ngày
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>      {/* Tips section */}
      <div className="maintenance-tips-section">
        <h2>Lời khuyên duy trì</h2>
        
        <div className="maintenance-tips">
          <h3>💡 Mẹo hữu ích</h3>
          <ul>
            <li>Tiếp tục tránh xa môi trường có khói thuốc</li>
            <li>Duy trì các hoạt động thể chất thường xuyên</li>
            <li>Ăn uống lành mạnh để tránh tăng cân</li>
            <li>Tìm kiếm hỗ trợ từ gia đình và bạn bè</li>
            <li>Nhắc nhở bản thân về lợi ích đã đạt được</li>
          </ul>
        </div><div className="support-options">
          <h3>🤝 Hỗ trợ thêm</h3>
          <div className="support-buttons">
            <Link to="/blog" className="support-btn primary">
              Tham gia cộng đồng
            </Link>
            <Link to="/appointment" className="support-btn tertiary">
              Tư vấn chuyên gia
            </Link>
          </div>
        </div>
      </div>      {/* Success Story */}
      <div className="success-story">
        <h2>🎉 Câu chuyện thành công của bạn</h2>
        <div className="story-content">
          <p>
            Bạn đã lập thành công <strong>{userPlan?.name || 'Kế hoạch cá nhân'}</strong> và duy trì được{' '}
            <strong>{dashboardStats.daysSincePlanCreation} ngày</strong> không hút thuốc.
          </p>
          <p>
            Trong thời gian này, bạn đã tiết kiệm được{' '}
            <strong>{(dashboardStats.moneySaved / 1000).toFixed(0)}K VNĐ</strong> và tránh được{' '}
            <strong>{dashboardStats.cigarettesSaved}</strong> điếu thuốc.
          </p>
          <p>
            Đây là một thành tích đáng tự hào! Hãy tiếp tục duy trì và truyền cảm hứng cho những người khác.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ProgressDashboard;
