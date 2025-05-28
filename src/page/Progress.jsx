// import React, { useState } from 'react';
// import { useAuth } from '../context/AuthContext';
// import { 
//   FaCheckCircle, 
//   FaExclamationTriangle, 
//   FaCalendarAlt, 
//   FaTrophy, 
//   FaSmile, 
//   FaLeaf, 
//   FaChartLine 
// } from 'react-icons/fa';
// import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
// import './Progress.css';

// export default function Progress() {
//   const { user } = useAuth();
//   const [activeTimeFilter, setActiveTimeFilter] = useState('Hôm nay');
  
//   // Calculate progress values
//   const calculateProgress = () => {
//     if (!user) return {
//       days: 21,
//       hours: 504, // 21 days * 24 hours
//       moneySaved: 600000,
//       cigarettes: 350
//     };
    
//     // These would normally come from the user data
//     return {
//       days: 21,
//       hours: 504, // 21 days * 24 hours
//       moneySaved: 600000,
//       cigarettes: 350
//     };
//   };
  
//   const progress = calculateProgress();
//   // Sample chart data that matches the image
//   const chartData = [
//     { name: '1.0', actual: 0.3, target: 0.3 },
//     { name: '3.5', actual: 0.5, target: 0.5 },
//     { name: '7.0', actual: 0.8, target: 0.7 },
//     { name: '10.5', actual: 1.0, target: 0.9 },
//     { name: '14.0', actual: 0.6, target: 1.1 },
//     { name: '17.5', actual: 1.2, target: 1.3 },
//     { name: '21.0', actual: 1.4, target: 1.5 },
//     { name: '24.5', actual: 1.6, target: 1.7 },
//     { name: '28.0', actual: 1.8, target: 1.9 },
//     { name: '31.5', actual: 2.0, target: 2.1 }
//   ];
  
//   return (
//     <div className="progress-container">
//       <h1 className="page-title">Tiến trình cai thuốc hiện tại</h1>
      
//       {/* Top stats cards */}
//       <div className="stats-cards">
//         <div className="stat-card achievement">
//           <div className="badge-icon">
//             <FaTrophy size={32} />
//           </div>
//           <div className="stat-info">
//             <h3>Thành tích lớn nhất</h3>
//             <div className="stat-value">{progress.days} ngày</div>
//             <p className="stat-detail">Bạn đã bắt đầu từ 12/02/2023</p>
//           </div>
//         </div>
        
//         <div className="stat-card streak">
//           <div className="badge-icon">
//             <FaSmile size={32} />
//           </div>
//           <div className="stat-info">
//             <h3>Số lần từ chối thuốc lá</h3>
//             <div className="stat-value">3</div>
//             <p className="stat-detail">Lần gần nhất vào 02/03/2023</p>
//           </div>
//         </div>
        
//         <div className="stat-card health">
//           <div className="badge-icon">
//             <FaLeaf size={32} />
//           </div>
//           <div className="stat-info">
//             <h3>Thời gian cai thành công</h3>
//             <div className="stat-value">16 ngày</div>
//             <p className="stat-detail">Còn cách 2 ngày (72h)</p>
//           </div>
//         </div>
//       </div>
      
//       {/* Progress chart section */}
//       <div className="progress-chart-section">        <div className="chart-header">
//           <h2>
//             <FaChartLine className="section-icon" /> 
//             Tiến trình cai thuốc hiện tại
//           </h2>
//           <div className="chart-controls">
//             <button className="time-filter">Tuần này</button>
//             <button className="time-filter active">Tháng 5</button>
//           </div>
//         </div>
//           <div className="chart-container">
//           <ResponsiveContainer width="100%" height={280}>
//             <LineChart
//               data={chartData}
//               margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
//             >
//               <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
//               <XAxis 
//                 dataKey="name" 
//                 axisLine={false}
//                 tickLine={false}
//                 tick={{ fontSize: 12, fill: '#999' }}
//               />
//               <YAxis 
//                 axisLine={false}
//                 tickLine={false}
//                 tick={{ fontSize: 12, fill: '#999' }}
//                 width={30}
//               />
//               <Tooltip />
//               <Line 
//                 type="monotone" 
//                 dataKey="actual" 
//                 stroke="#4285F4" 
//                 strokeWidth={2}
//                 dot={{ r: 4, fill: '#4285F4', strokeWidth: 0 }}
//                 activeDot={{ r: 6, fill: '#4285F4', strokeWidth: 0 }}
//               />
//               <Line 
//                 type="monotone" 
//                 dataKey="target" 
//                 stroke="#34A853" 
//                 strokeWidth={1}
//                 strokeDasharray="3 3"
//                 dot={false}
//               />
//             </LineChart>
//           </ResponsiveContainer>
//             <div className="chart-legend">
//             <div className="legend-item">
//               <span className="legend-color actual"></span>
//               <span>Thực tế</span>
//             </div>
//             <div className="legend-item">
//               <span className="legend-color target"></span>
//               <span>Tháng 5</span>
//             </div>
//           </div>
          
//           <div className="time-filters">
//             <button 
//               className={`time-filter ${activeTimeFilter === 'Hôm nay' ? 'active' : ''}`}
//               onClick={() => setActiveTimeFilter('Hôm nay')}
//             >
//               Hôm nay
//             </button>
//             <button 
//               className={`time-filter ${activeTimeFilter === '7 ngày' ? 'active' : ''}`}
//               onClick={() => setActiveTimeFilter('7 ngày')}
//             >
//               7 ngày
//             </button>
//             <button 
//               className={`time-filter ${activeTimeFilter === '14 ngày' ? 'active' : ''}`}
//               onClick={() => setActiveTimeFilter('14 ngày')}
//             >
//               14 ngày
//             </button>
//             <button 
//               className={`time-filter ${activeTimeFilter === '30 ngày' ? 'active' : ''}`}
//               onClick={() => setActiveTimeFilter('30 ngày')}
//             >
//               30 ngày
//             </button>
//             <button 
//               className={`time-filter ${activeTimeFilter === 'Tất cả' ? 'active' : ''}`}
//               onClick={() => setActiveTimeFilter('Tất cả')}
//             >
//               Tất cả
//             </button>
//           </div>
//         </div>
//       </div>
      
//       {/* Progress metrics section */}
//       <div className="progress-metrics">
//         <h2>Tiến trình mục tiêu</h2>
        
//         <div className="metrics-list">
//           <div className="metric-item">
//             <div className="metric-name">Các ngày: 30 ngày</div>
//             <div className="progress-bar-container">
//               <div className="progress-bar" style={{ width: '53%' }}></div>
//             </div>
//             <div className="progress-percentage">53%</div>
//           </div>
          
//           <div className="metric-item">
//             <div className="metric-name">Tiền tiết kiệm: 10 phút/ngày</div>
//             <div className="progress-bar-container">
//               <div className="progress-bar" style={{ width: '80%' }}></div>
//             </div>
//             <div className="progress-percentage">80%</div>
//           </div>
          
//           <div className="metric-item">
//             <div className="metric-name">Uống đủ nước/ngày</div>
//             <div className="progress-bar-container">
//               <div className="progress-bar" style={{ width: '65%' }}></div>
//             </div>
//             <div className="progress-percentage">65%</div>
//           </div>
//         </div>
//       </div>
      
//       {/* Important events section */}
//       <div className="important-events">
//         <h2>Các mốc sự kiện quan trọng</h2>
        
//         <div className="events-list">
//           <div className="event-item warning">
//             <div className="event-icon"><FaExclamationTriangle /></div>
//             <div className="event-content">
//               <h3>Ngày 3/5 - Tái nghiện</h3>
//               <p>Cảm thấy có xu hướng muốn quay lại với thuốc lá</p>
//             </div>
//           </div>
          
//           <div className="event-item milestone">
//             <div className="event-icon"><FaCalendarAlt /></div>
//             <div className="event-content">
//               <h3>Ngày 14/5 - Tròn một tháng không hút thuốc</h3>
//               <p>Đây là một cột mốc quan trọng, đừng quay lại với thuốc lá</p>
//             </div>
//           </div>
          
//           <div className="event-item success">
//             <div className="event-icon"><FaCheckCircle /></div>
//             <div className="event-content">
//               <h3>Ngày 9/5 - Đạt Chuẩn</h3>
//               <p>Đạt mốc hô hấp tốt, ngày đầu tiên không có cảm giác thèm thuốc</p>
//             </div>
//           </div>
          
//           <div className="event-item info">
//             <div className="event-icon"><FaCalendarAlt /></div>
//             <div className="event-content">
//               <h3>Ngày 9/5 - Bắt đầu hành trình 30 phút/ngày</h3>
//               <p>Chạy bộ mỗi sáng, tập thở đúng cách</p>
//             </div>
//           </div>
//         </div>
//       </div>
      
//       {/* Action suggestions */}
//       <div className="action-suggestions">
//         <h2>Để xuất hành động</h2>
        
//         <div className="suggestions-grid">
//           <div className="suggestion-card completed">
//             <div className="suggestion-icon">✅</div>
//             <h3>Bạn đang làm tốt, hãy lập thêm mục tiêu mới để đạt thêm nhiều thành tích!</h3>
//             <p>Đã cai được 30 ngày, hệu quả cao vượt số liệu thống kê chung</p>
//             <button className="action-btn view">Xem tất cả</button>
//           </div>
          
//           <div className="suggestion-card">
//             <div className="suggestion-icon">🎯</div>
//             <h3>Bạn nên duy trì tập thể dục thể thao để khỏe hơn!</h3>
//             <p>Cai cai được 30 ngày, nhưng vẫn chưa tập thể dục đều đặn 3 ngày/tuần</p>
//             <button className="action-btn">Bắt đầu ngay</button>
//           </div>
          
//           <div className="suggestion-card warning">
//             <div className="suggestion-icon">⚠️</div>
//             <h3>Sắp tới giai đoạn khó khăn (ngày 17-23)</h3>
//             <p>Hãy đọc lại các bước giang mình để vượt qua giai đoạn khó khăn</p>
//             <button className="action-btn read">Đọc bài</button>
//           </div>
//         </div>
//       </div>
      
//       {/* Health indicators */}
//       <div className="health-indicators">
//         <h2>Chỉ số sức khỏe</h2>
//         <button className="view-all-btn">Xem tất cả</button>
        
//         <div className="indicators-grid">
//           <div className="indicator-item">
//             <h3>Mạch đo huyết áp</h3>
//             <div className="indicator-meter good"></div>
//           </div>
          
//           <div className="indicator-item">
//             <h3>Chất lượng giấc ngủ</h3>
//             <div className="indicator-meter excellent"></div>
//           </div>
          
//           <div className="indicator-item">
//             <h3>Cảm giác thèm thuốc</h3>
//             <div className="indicator-meter fair"></div>
//           </div>
          
//           <div className="indicator-item">
//             <h3>Trạng thái tim</h3>
//             <div className="indicator-meter good"></div>
//           </div>
          
//           <div className="indicator-item">
//             <h3>Năng lượng</h3>
//             <div className="indicator-meter excellent"></div>
//           </div>
          
//           <div className="indicator-item">
//             <h3>Cân nặng</h3>
//             <div className="indicator-meter exceptional"></div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  FaCheckCircle, 
  FaExclamationTriangle, 
  FaCalendarAlt, 
  FaTrophy, 
  FaSmile, 
  FaLeaf, 
  FaChartLine 
} from 'react-icons/fa';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import './Progress.css';

export default function Progress() {
  const { user } = useAuth();
  const [activeTimeFilter, setActiveTimeFilter] = useState('Hôm nay');
  
  // Calculate progress values
  const calculateProgress = () => {
    if (!user) return {
      days: 21,
      hours: 504, // 21 days * 24 hours
      moneySaved: 600000,
      cigarettes: 350
    };
    
    // These would normally come from the user data
    return {
      days: 21,
      hours: 504, // 21 days * 24 hours
      moneySaved: 600000,
      cigarettes: 350
    };
  };
  
  const progress = calculateProgress();
  // Sample chart data that matches the image
  const chartData = [
    { name: '1.0', actual: 0.3, target: 0.3 },
    { name: '3.5', actual: 0.5, target: 0.5 },
    { name: '7.0', actual: 0.8, target: 0.7 },
    { name: '10.5', actual: 1.0, target: 0.9 },
    { name: '14.0', actual: 0.6, target: 1.1 },
    { name: '17.5', actual: 1.2, target: 1.3 },
    { name: '21.0', actual: 1.4, target: 1.5 },
    { name: '24.5', actual: 1.6, target: 1.7 },
    { name: '28.0', actual: 1.8, target: 1.9 },
    { name: '31.5', actual: 2.0, target: 2.1 }
  ];
  
  return (
    <div className="progress-container">
      <h1 className="page-title">Tiến trình cai thuốc hiện tại</h1>
      
      {/* Top stats cards */}
      <div className="stats-cards">
        <div className="stat-card achievement">
          <div className="badge-icon">
            <FaTrophy size={32} />
          </div>
          <div className="stat-info">
            <h3>Thành tích lớn nhất</h3>
            <div className="stat-value">{progress.days} ngày</div>
            <p className="stat-detail">Bạn đã bắt đầu từ 12/02/2023</p>
          </div>
        </div>
        
        <div className="stat-card streak">
          <div className="badge-icon">
            <FaSmile size={32} />
          </div>
          <div className="stat-info">
            <h3>Số lần từ chối thuốc lá</h3>
            <div className="stat-value">3</div>
            <p className="stat-detail">Lần gần nhất vào 02/03/2023</p>
          </div>
        </div>
        
        <div className="stat-card health">
          <div className="badge-icon">
            <FaLeaf size={32} />
          </div>
          <div className="stat-info">
            <h3>Thời gian cai thành công</h3>
            <div className="stat-value">16 ngày</div>
            <p className="stat-detail">Còn cách 2 ngày (72h)</p>
          </div>
        </div>
      </div>
      
      {/* Progress chart section */}
      <div className="progress-chart-section">
        <div className="chart-header">
          <h2>
            <FaChartLine className="section-icon" /> 
            Tiến trình cai thuốc hiện tại
          </h2>
          <div className="chart-controls">
            <button className="time-filter">Tuần này</button>
            <button className="time-filter active">Tháng 5</button>
          </div>
        </div>
        <div className="chart-container">
          <ResponsiveContainer width="100%" height={280}>
            <LineChart
              data={chartData}
              margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
              <XAxis 
                dataKey="name" 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: '#999' }}
              />
              <YAxis 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: '#999' }}
                width={30}
              />
              <Tooltip />
              <Line 
                type="monotone" 
                dataKey="actual" 
                stroke="#4285F4" 
                strokeWidth={2}
                dot={{ r: 4, fill: '#4285F4', strokeWidth: 0 }}
                activeDot={{ r: 6, fill: '#4285F4', strokeWidth: 0 }}
              />
              <Line 
                type="monotone" 
                dataKey="target" 
                stroke="#34A853" 
                strokeWidth={1}
                strokeDasharray="3 3"
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
          <div className="chart-legend">
            <div className="legend-item">
              <span className="legend-color actual"></span>
              <span>Thực tế</span>
            </div>
            <div className="legend-item">
              <span className="legend-color target"></span>
              <span>Tháng 5</span>
            </div>
          </div>
          
          <div className="time-filters">
            <button 
              className={`time-filter ${activeTimeFilter === 'Hôm nay' ? 'active' : ''}`}
              onClick={() => setActiveTimeFilter('Hôm nay')}
            >
              Hôm nay
            </button>
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
        </div>
      </div>
      
      {/* Progress metrics section */}
      <div className="progress-metrics">
        <h2>Tiến trình mục tiêu</h2>
        
        <div className="metrics-list">
          <div className="metric-item">
            <div className="metric-name">Các ngày: 30 ngày</div>
            <div className="progress-bar-container">
              <div className="progress-bar" style={{ width: '53%' }}></div>
            </div>
            <div className="progress-percentage">53%</div>
          </div>
          
          <div className="metric-item">
            <div className="metric-name">Tiền tiết kiệm: 10 phút/ngày</div>
            <div className="progress-bar-container">
              <div className="progress-bar" style={{ width: '80%' }}></div>
            </div>
            <div className="progress-percentage">80%</div>
          </div>
          
          <div className="metric-item">
            <div className="metric-name">Uống đủ nước/ngày</div>
            <div className="progress-bar-container">
              <div className="progress-bar" style={{ width: '65%' }}></div>
            </div>
            <div className="progress-percentage">65%</div>
          </div>
        </div>
      </div>
      
      {/* Important events section */}
      <div className="important-events">
        <h2>Các mốc sự kiện quan trọng</h2>
        
        <div className="events-list">
          <div className="event-item warning">
            <div className="event-icon"><FaExclamationTriangle /></div>
            <div className="event-content">
              <h3>Ngày 3/5 - Tái nghiện</h3>
              <p>Cảm thấy có xu hướng muốn quay lại với thuốc lá</p>
            </div>
          </div>
          
          <div className="event-item milestone">
            <div className="event-icon"><FaCalendarAlt /></div>
            <div className="event-content">
              <h3>Ngày 14/5 - Tròn một tháng không hút thuốc</h3>
              <p>Đây là một cột mốc quan trọng, đừng quay lại với thuốc lá</p>
            </div>
          </div>
          
          <div className="event-item success">
            <div className="event-icon"><FaCheckCircle /></div>
            <div className="event-content">
              <h3>Ngày 9/5 - Đạt Chuẩn</h3>
              <p>Đạt mốc hô hấp tốt, ngày đầu tiên không có cảm giác thèm thuốc</p>
            </div>
          </div>
          
          <div className="event-item info">
            <div className="event-icon"><FaCalendarAlt /></div>
            <div className="event-content">
              <h3>Ngày 9/5 - Bắt đầu hành trình 30 phút/ngày</h3>
              <p>Chạy bộ mỗi sáng, tập thở đúng cách</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Action suggestions */}
      <div className="action-suggestions">
        <h2>Để xuất hành động</h2>
        
        <div className="suggestions-grid">
          <div className="suggestion-card completed">
            <div className="suggestion-icon">✅</div>
            <h3>Bạn đang làm tốt, hãy lập thêm mục tiêu mới để đạt thêm nhiều thành tích!</h3>
            <p>Đã cai được 30 ngày, hệu quả cao vượt số liệu thống kê chung</p>
            <button className="action-btn view">Xem tất cả</button>
          </div>
          
          <div className="suggestion-card">
            <div className="suggestion-icon">🎯</div>
            <h3>Bạn nên duy trì tập thể dục thể thao để khỏe hơn!</h3>
            <p>Cai cai được 30 ngày, nhưng vẫn chưa tập thể dục đều đặn 3 ngày/tuần</p>
            <button className="action-btn">Bắt đầu ngay</button>
          </div>
          
          <div className="suggestion-card warning">
            <div className="suggestion-icon">⚠️</div>
            <h3>Sắp tới giai đoạn khó khăn (ngày 17-23)</h3>
            <p>Hãy đọc lại các bước giang mình để vượt qua giai đoạn khó khăn</p>
            <button className="action-btn read">Đọc bài</button>
          </div>
        </div>
      </div>
      
      {/* Health indicators */}
      <div className="health-indicators">
        <h2>Chỉ số sức khỏe</h2>
        <button className="view-all-btn">Xem tất cả</button>
        
        <div className="indicators-grid">
          <div className="indicator-item">
            <h3>Mạch đo huyết áp</h3>
            <div className="indicator-meter good"></div>
          </div>
          
          <div className="indicator-item">
            <h3>Chất lượng giấc ngủ</h3>
            <div className="indicator-meter excellent"></div>
          </div>
          
          <div className="indicator-item">
            <h3>Cảm giác thèm thuốc</h3>
            <div className="indicator-meter fair"></div>
          </div>
          
          <div className="indicator-item">
            <h3>Trạng thái tim</h3>
            <div className="indicator-meter good"></div>
          </div>
          
          <div className="indicator-item">
            <h3>Năng lượng</h3>
            <div className="indicator-meter excellent"></div>
          </div>
          
          <div className="indicator-item">
            <h3>Cân nặng</h3>
            <div className="indicator-meter exceptional"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
