import React, { useState } from 'react';
import { FaUserAlt, FaChartLine, FaCalendarAlt, FaHeartbeat, FaTrophy, FaComment, FaHeart, FaCheckCircle, FaExclamationCircle, FaUsers, FaCog, FaBell } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import './Tools.css';

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState('profile');
  const [todayMood, setTodayMood] = useState('');
  const [smokedToday, setSmokedToday] = useState(null);
  const [todaySymptoms, setTodaySymptoms] = useState([]);

  // Dữ liệu người dùng mẫu
  const userData = {
    name: 'Nguyễn Thành',
    avatar: '/image/hero/quit-smoking-2.png',
    daysWithoutSmoking: 28,
    moneySaved: 840000,
    pointsEarned: 560,
    startDate: '01/05/2023',
    cigarettesPerDay: 20,
    costPerDay: 30000,
    yearsOfSmoking: 8,
    fagerstromScore: '8/10',
    healthImprovements: [
      { time: '20 phút', description: 'Huyết áp và nhịp tim trở về bình thường', completed: true },
      { time: '24 giờ', description: 'CO trong máu giảm về mức bình thường', completed: true },
      { time: '48 giờ', description: 'Nicotine đã rời khỏi cơ thể', completed: true },
      { time: '72 giờ', description: 'Hô hấp dễ dàng hơn', completed: true },
      { time: '2-12 tuần', description: 'Tuần hoàn máu cải thiện', completed: false }
    ],
    milestones: [
      { id: 1, name: 'Chuẩn bị cai thuốc', date: '30/04/2023', completed: true },
      { id: 2, name: 'Ngày đầu tiên không hút thuốc', date: '01/05/2023', completed: true },
      { id: 3, name: 'Tuần đầu tiên không hút thuốc', date: '08/05/2023', completed: true },
      { id: 4, name: 'Duy trì 3 tháng không hút thuốc', progress: '28/90 ngày', completed: false }
    ],
    achievements: [
      { id: 1, name: '24 giờ đầu tiên', date: '02/05/2023', icon: '⭐' },
      { id: 2, name: '1 tuần không hút', date: '08/05/2023', icon: '🏅' },
      { id: 3, name: '2 tuần không hút', date: '15/05/2023', icon: '🏆' },
      { id: 4, name: '1 tháng không hút', date: '', icon: '👑' }
    ],
    journalEntries: [
      { 
        id: 1, 
        day: 28, 
        date: 'Hôm nay', 
        mood: 'Bình thường', 
        symptoms: 'Không có triệu chứng', 
        notes: '"Hôm nay là một ngày bình thường, không có cảm giác thèm thuốc."' 
      },
      { 
        id: 2, 
        day: 27, 
        date: 'Hôm qua', 
        mood: 'Tốt', 
        symptoms: 'Không có triệu chứng', 
        notes: '"Cảm thấy rất tự hào về bản thân, hôm nay tôi đã từ chối một điếu thuốc từ đồng nghiệp."' 
      }
    ]
  };

  // Xử lý cập nhật hôm nay
  const handleUpdateToday = () => {
    const newEntry = {
      id: Date.now(),
      day: userData.daysWithoutSmoking,
      date: 'Hôm nay',
      mood: todayMood,
      symptoms: todaySymptoms.join(', '),
      notes: document.getElementById('journalNote').value
    };
    
    // Ở đây bạn sẽ lưu newEntry vào cơ sở dữ liệu thực tế
    console.log('Cập nhật mới:', newEntry);
    alert('Đã lưu cập nhật của bạn!');
  };

  return (
    <div className="profile-container">
      {/* Sidebar */}
      <div className="profile-sidebar">
        <div className="user-info">
          <div className="user-avatar">
            <span className="user-initial">NT</span>
          </div>
          <div className="user-details">
            <h3>{userData.name}</h3>
            <p>Đang cai thuốc: {userData.daysWithoutSmoking} ngày</p>
          </div>
        </div>
        
        <nav className="profile-nav">
          <Link to="#" className={`nav-item ${activeTab === 'profile' ? 'active' : ''}`} onClick={() => setActiveTab('profile')}>
            <FaUserAlt /> Hồ sơ cá nhân
          </Link>
          <Link to="#" className={`nav-item ${activeTab === 'progress' ? 'active' : ''}`} onClick={() => setActiveTab('progress')}>
            <FaChartLine /> Tiến trình
          </Link>
          <Link to="#" className={`nav-item ${activeTab === 'achievements' ? 'active' : ''}`} onClick={() => setActiveTab('achievements')}>
            <FaTrophy /> Huy hiệu
          </Link>
          <Link to="#" className={`nav-item ${activeTab === 'journal' ? 'active' : ''}`} onClick={() => setActiveTab('journal')}>
            <FaComment /> Tư vấn
          </Link>
          <Link to="#" className={`nav-item ${activeTab === 'community' ? 'active' : ''}`} onClick={() => setActiveTab('community')}>
            <FaUsers /> Cộng đồng
          </Link>
          <Link to="#" className={`nav-item ${activeTab === 'settings' ? 'active' : ''}`} onClick={() => setActiveTab('settings')}>
            <FaCog /> Cài đặt
          </Link>
          <Link to="#" className={`nav-item ${activeTab === 'notifications' ? 'active' : ''}`} onClick={() => setActiveTab('notifications')}>
            <FaBell /> Nhận thông báo
          </Link>
        </nav>
      </div>
      
      {/* Main content */}
      <div className="profile-content">
        {activeTab === 'profile' && (
          <div className="profile-overview">
            <div className="section-header">
              <h1>Hồ sơ cá nhân</h1>
              <button className="update-btn">Cập nhật</button>
            </div>
            
            <div className="overview-stats">
              <div className="stat-card">
                <h3>Không hút thuốc</h3>
                <div className="stat-value">{userData.daysWithoutSmoking} ngày</div>
                <p className="stat-detail">672 giờ không hút thuốc</p>
              </div>
              
              <div className="stat-card">
                <h3>Tiền tiết kiệm</h3>
                <div className="stat-value">{userData.moneySaved.toLocaleString()} đ</div>
                <p className="stat-detail">30.000 đ mỗi ngày</p>
              </div>
              
              <div className="stat-card">
                <h3>Điểm thuốc tránh được</h3>
                <div className="stat-value">{userData.pointsEarned} điếu</div>
                <p className="stat-detail">20 điếu mỗi ngày</p>
              </div>
            </div>
            
            <div className="profile-sections">
              <div className="health-section">
                <h2>Hồ sơ sức khỏe</h2>
                
                <div className="health-stats">
                  <div className="health-stat-row">
                    <div className="health-stat">
                      <h4>Tình trạng hút thuốc ban đầu</h4>
                      <p>Cập nhật lần cuối: {userData.daysWithoutSmoking} ngày trước</p>
                    </div>
                  </div>
                  
                  <div className="health-stat-row two-col">
                    <div className="health-stat-item">
                      <label>Số điếu mỗi ngày</label>
                      <p>{userData.cigarettesPerDay} điếu/ngày</p>
                    </div>
                    
                    <div className="health-stat-item">
                      <label>Chi phí mỗi ngày</label>
                      <p>{userData.costPerDay.toLocaleString()} đ/ngày</p>
                    </div>
                  </div>
                  
                  <div className="health-stat-row two-col">
                    <div className="health-stat-item">
                      <label>Thời gian hút thuốc</label>
                      <p>{userData.yearsOfSmoking} năm</p>
                    </div>
                    
                    <div className="health-stat-item">
                      <label>Mức độ nghiện</label>
                      <p>Cao (Fagerstrom: {userData.fagerstromScore})</p>
                    </div>
                  </div>
                </div>
                
                <div className="health-improvements">
                  <h3>Cải thiện sức khỏe</h3>
                  <div className="improvements-list">
                    {userData.healthImprovements.map((improvement, index) => (
                      <div key={index} className="improvement-item">
                        <span className="improvement-time">{improvement.time}</span>
                        <span className="improvement-description">{improvement.description}</span>
                        {improvement.completed ? 
                          <FaCheckCircle className="completed-icon" /> : 
                          <span className="pending-icon">○</span>
                        }
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="plan-section">
                <h2>Kế hoạch cai thuốc</h2>
                
                <div className="current-plan">
                  <h3>Kế hoạch hiện tại</h3>
                  <p className="plan-strategy">Phương pháp: Cai thuốc hoàn toàn và duy trì lâu dài</p>
                  
                  <div className="plan-start-date">
                    <div className="date-label">
                      <FaCalendarAlt className="icon" />
                      <span>Ngày bắt đầu cai thuốc: {userData.startDate}</span>
                    </div>
                    <div className="plan-goal">
                      <strong>Mục tiêu:</strong> Cai thuốc hoàn toàn và duy trì lâu dài
                    </div>
                  </div>
                  
                  <div className="milestones">
                    {userData.milestones.map(milestone => (
                      <div key={milestone.id} className="milestone-item">
                        <div className="milestone-status">
                          {milestone.completed ? 
                            <div className="status-circle completed"><FaCheckCircle /></div> : 
                            <div className="status-circle in-progress"></div>
                          }
                        </div>
                        <div className="milestone-info">
                          <h4>{milestone.name}</h4>
                          <p>{milestone.completed ? `Hoàn thành: ${milestone.date}` : `Đang tiến hành: ${milestone.progress}`}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <button className="edit-plan-btn">Điều chỉnh kế hoạch</button>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {activeTab === 'achievements' && (
          <div className="achievements-section">
            <h1>Huy hiệu đã đạt</h1>
            
            <div className="achievements-grid">
              {userData.achievements.map(achievement => (
                <div key={achievement.id} className={`achievement-card ${!achievement.date ? 'locked' : ''}`}>
                  <div className="achievement-icon">
                    {achievement.icon}
                  </div>
                  <h3>{achievement.name}</h3>
                  <p>{achievement.date || 'Đạt khi đủ điều kiện'}</p>
                </div>
              ))}
            </div>
            
            <h2>Xem tất cả huy hiệu</h2>
          </div>
        )}
        
        {activeTab === 'journal' && (
          <div className="journal-section">
            <h1>Cập nhật hôm nay</h1>
            
            <div className="journal-form">
              <div className="form-group">
                <h3>Bạn có hút thuốc hôm nay không?</h3>
                <div className="radio-group">
                  <label className="radio-label">
                    <input 
                      type="radio" 
                      name="smoked" 
                      value="no" 
                      checked={smokedToday === false}
                      onChange={() => setSmokedToday(false)} 
                    /> Không
                  </label>
                  <label className="radio-label">
                    <input 
                      type="radio" 
                      name="smoked" 
                      value="yes" 
                      checked={smokedToday === true}
                      onChange={() => setSmokedToday(true)} 
                    /> Có
                  </label>
                </div>
              </div>
              
              <div className="form-group">
                <h3>Tâm trạng của bạn hôm nay?</h3>
                <div className="mood-selector">
                  <button 
                    className={`mood-btn ${todayMood === 'Tốt' ? 'active' : ''}`}
                    onClick={() => setTodayMood('Tốt')}
                  >
                    <span role="img" aria-label="happy">😃</span>
                    <span>Tốt</span>
                  </button>
                  <button 
                    className={`mood-btn ${todayMood === 'Bình thường' ? 'active' : ''}`}
                    onClick={() => setTodayMood('Bình thường')}
                  >
                    <span role="img" aria-label="neutral">😐</span>
                    <span>Bình thường</span>
                  </button>
                  <button 
                    className={`mood-btn ${todayMood === 'Không tốt' ? 'active' : ''}`}
                    onClick={() => setTodayMood('Không tốt')}
                  >
                    <span role="img" aria-label="sad">😔</span>
                    <span>Không tốt</span>
                  </button>
                  <button 
                    className={`mood-btn ${todayMood === 'Tệ' ? 'active' : ''}`}
                    onClick={() => setTodayMood('Tệ')}
                  >
                    <span role="img" aria-label="bad">😩</span>
                    <span>Tệ</span>
                  </button>
                  <button 
                    className={`mood-btn ${todayMood === 'Thèm thuốc' ? 'active' : ''}`}
                    onClick={() => setTodayMood('Thèm thuốc')}
                  >
                    <span role="img" aria-label="craving">🚬</span>
                    <span>Thèm thuốc</span>
                  </button>
                </div>
              </div>
              
              <div className="form-group">
                <h3>Triệu chứng hôm nay</h3>
                <div className="symptoms-checkboxes">
                  <label className="symptom-label">
                    <input 
                      type="checkbox" 
                      value="Ho" 
                      checked={todaySymptoms.includes('Ho')}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setTodaySymptoms([...todaySymptoms, 'Ho']);
                        } else {
                          setTodaySymptoms(todaySymptoms.filter(s => s !== 'Ho'));
                        }
                      }} 
                    /> Ho
                  </label>
                  <label className="symptom-label">
                    <input 
                      type="checkbox" 
                      value="Khó thở" 
                      checked={todaySymptoms.includes('Khó thở')}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setTodaySymptoms([...todaySymptoms, 'Khó thở']);
                        } else {
                          setTodaySymptoms(todaySymptoms.filter(s => s !== 'Khó thở'));
                        }
                      }} 
                    /> Khó thở
                  </label>
                  <label className="symptom-label">
                    <input 
                      type="checkbox" 
                      value="Mệt mỏi" 
                      checked={todaySymptoms.includes('Mệt mỏi')}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setTodaySymptoms([...todaySymptoms, 'Mệt mỏi']);
                        } else {
                          setTodaySymptoms(todaySymptoms.filter(s => s !== 'Mệt mỏi'));
                        }
                      }} 
                    /> Mệt mỏi
                  </label>
                  <label className="symptom-label">
                    <input 
                      type="checkbox" 
                      value="Cáng thẳng" 
                      checked={todaySymptoms.includes('Cáng thẳng')}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setTodaySymptoms([...todaySymptoms, 'Cáng thẳng']);
                        } else {
                          setTodaySymptoms(todaySymptoms.filter(s => s !== 'Cáng thẳng'));
                        }
                      }} 
                    /> Cáng thẳng
                  </label>
                </div>
              </div>
              
              <div className="form-group">
                <h3>Ghi chú nhật ký</h3>
                <textarea 
                  id="journalNote" 
                  placeholder="Chia sẻ cảm nghĩ của bạn hôm nay..."
                  rows="4"
                ></textarea>
              </div>
              
              <button className="submit-btn" onClick={handleUpdateToday}>Lưu cập nhật</button>
            </div>
            
            <div className="journal-history">
              <h2>Lịch sử tiến trình</h2>
              
              {userData.journalEntries.map(entry => (
                <div key={entry.id} className="journal-entry">
                  <div className="entry-day">
                    <span>Ngày không hút thuốc thứ {entry.day}</span>
                    <span className="entry-date">{entry.date}</span>
                  </div>
                  <div className="entry-content">
                    <div className="entry-stats">
                      <div className="entry-stat">
                        <strong>Tâm trạng:</strong> {entry.mood}
                      </div>
                      <div className="entry-stat">
                        <strong>Triệu chứng:</strong> {entry.symptoms}
                      </div>
                    </div>
                    <div className="entry-note">
                      {entry.notes}
                    </div>
                  </div>
                </div>
              ))}
              
              <button className="view-all-btn">Xem tất cả</button>
            </div>
          </div>
        )}
        
        {activeTab === 'progress' && (
          <div className="progress-section">
            <h1>Theo dõi tiến trình</h1>
            <p>Biểu đồ tiến trình của bạn sẽ hiển thị ở đây</p>
          </div>
        )}
      </div>
    </div>
  );
}

// Các components hỗ trợ (có thể được định nghĩa ở một file khác)
// Không cần các hàm này nữa vì đã import từ react-icons/fa