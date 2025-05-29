import React, { useState, useEffect } from 'react';
import { FaTrophy, FaCalendarCheck, FaChartLine, FaLeaf, FaCoins, FaHeart } from 'react-icons/fa';
import QuitProgressChart from './QuitProgressChart';

const ProgressDashboard = ({ userPlan, completionDate }) => {
  const [dashboardStats, setDashboardStats] = useState(null);
  const [milestones, setMilestones] = useState([]);

  useEffect(() => {
    calculateDashboardStats();
    loadMilestones();
  }, [userPlan, completionDate]);

  const calculateDashboardStats = () => {
    if (!userPlan || !completionDate) return;

    const startDate = new Date(completionDate);
    const today = new Date();
    const daysSinceStart = Math.floor((today - startDate) / (1000 * 60 * 60 * 24));
    
    // Tính toán số điếu đã tiết kiệm được
    const initialCigarettesPerDay = userPlan.weeks[0]?.amount || 20;
    const estimatedSaved = initialCigarettesPerDay * daysSinceStart;
    
    // Tính tiền tiết kiệm (giả sử 1 gói = 25,000đ, 1 gói = 20 điếu)
    const pricePerCigarette = 25000 / 20;
    const moneySaved = estimatedSaved * pricePerCigarette;

    setDashboardStats({
      daysSinceCompletion: daysSinceStart,
      cigarettesSaved: estimatedSaved,
      moneySaved: moneySaved,
      planDuration: userPlan.weeks.length,
      planName: userPlan.name || 'Kế hoạch cá nhân'
    });
  };

  const loadMilestones = () => {
    // Milestone theo thời gian WHO
    const healthMilestones = [
      { days: 1, title: '24 giờ đầu tiên', description: 'Carbon monoxide được loại bỏ khỏi cơ thể', achieved: true },
      { days: 2, title: '48 giờ', description: 'Nicotine được loại bỏ, vị giác cải thiện', achieved: true },
      { days: 3, title: '72 giờ', description: 'Đường hô hấp thư giãn, năng lượng tăng', achieved: true },
      { days: 14, title: '2 tuần', description: 'Tuần hoàn máu cải thiện', achieved: true },
      { days: 30, title: '1 tháng', description: 'Chức năng phổi tăng 30%', achieved: false },
      { days: 90, title: '3 tháng', description: 'Ho và khó thở giảm đáng kể', achieved: false },
      { days: 365, title: '1 năm', description: 'Nguy cơ bệnh tim giảm 50%', achieved: false }
    ];

    if (dashboardStats) {
      const updatedMilestones = healthMilestones.map(milestone => ({
        ...milestone,
        achieved: dashboardStats.daysSinceCompletion >= milestone.days
      }));
      setMilestones(updatedMilestones);
    }
  };

  const getNextMilestone = () => {
    return milestones.find(m => !m.achieved);
  };

  const getAchievementProgress = () => {
    const achieved = milestones.filter(m => m.achieved).length;
    return (achieved / milestones.length) * 100;
  };

  if (!dashboardStats) {
    return (
      <div className="dashboard-loading">
        <p>Đang tải dashboard...</p>
      </div>
    );
  }

  const nextMilestone = getNextMilestone();
  const achievementProgress = getAchievementProgress();

  return (
    <div className="progress-dashboard">
      {/* Header Celebration */}
      <div className="dashboard-header">
        <div className="celebration-badge">
          <FaTrophy className="trophy-icon" />
          <div className="celebration-text">
            <h1>Chúc mừng! Bạn đã hoàn thành kế hoạch!</h1>
            <p>Hãy tiếp tục duy trì thành quả này</p>
          </div>
        </div>
        <div className="completion-date">
          <FaCalendarCheck className="date-icon" />
          <span>Hoàn thành: {new Date(completionDate).toLocaleDateString('vi-VN')}</span>
        </div>
      </div>

      {/* Key Statistics */}
      <div className="dashboard-stats">
        <div className="stat-card primary">
          <div className="stat-icon">
            <FaCalendarCheck />
          </div>
          <div className="stat-content">
            <h3>{dashboardStats.daysSinceCompletion}</h3>
            <p>Ngày không hút thuốc</p>
          </div>
        </div>

        <div className="stat-card success">
          <div className="stat-icon">
            <FaLeaf />
          </div>
          <div className="stat-content">
            <h3>{dashboardStats.cigarettesSaved.toLocaleString()}</h3>
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
      </div>

      {/* Progress Maintenance Chart */}
      <div className="maintenance-section">
        <h2>
          <FaChartLine className="section-icon" />
          Duy trì thành quả
        </h2>
        <div className="maintenance-chart">
          <QuitProgressChart
            userPlan={userPlan}
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
                    Còn {milestone.days - dashboardStats.daysSinceCompletion} ngày
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Next Steps */}
      <div className="next-steps-section">
        <h2>Bước tiếp theo</h2>
        
        {nextMilestone && (
          <div className="next-milestone">
            <h3>🎯 Milestone tiếp theo: {nextMilestone.title}</h3>
            <p>{nextMilestone.description}</p>
            <div className="milestone-progress">
              <div className="progress-bar">
                <div 
                  className="progress-fill" 
                  style={{ 
                    width: `${(dashboardStats.daysSinceCompletion / nextMilestone.days) * 100}%` 
                  }}
                ></div>
              </div>
              <span className="progress-text">
                {dashboardStats.daysSinceCompletion}/{nextMilestone.days} ngày
              </span>
            </div>
          </div>
        )}

        <div className="maintenance-tips">
          <h3>💡 Lời khuyên duy trì</h3>
          <ul>
            <li>Tiếp tục tránh xa môi trường có khói thuốc</li>
            <li>Duy trì các hoạt động thể chất thường xuyên</li>
            <li>Ăn uống lành mạnh để tránh tăng cân</li>
            <li>Tìm kiếm hỗ trợ từ gia đình và bạn bè</li>
            <li>Nhắc nhở bản thân về lợi ích đã đạt được</li>
          </ul>
        </div>

        <div className="support-options">
          <h3>🤝 Hỗ trợ thêm</h3>
          <div className="support-buttons">
            <button className="support-btn primary">
              Tham gia cộng đồng
            </button>
            <button className="support-btn secondary">
              Chia sẻ thành tích
            </button>
            <button className="support-btn tertiary">
              Tư vấn chuyên gia
            </button>
          </div>
        </div>
      </div>

      {/* Success Story */}
      <div className="success-story">
        <h2>🎉 Câu chuyện thành công của bạn</h2>
        <div className="story-content">
          <p>
            Bạn đã hoàn thành <strong>{userPlan.name}</strong> và duy trì được{' '}
            <strong>{dashboardStats.daysSinceCompletion} ngày</strong> không hút thuốc.
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
