import React, { useState, useEffect } from "react";
import {
  FaUserAlt,
  FaChartLine,
  FaCalendarAlt,
  FaHeartbeat,
  FaTrophy,
  FaComment,
  FaHeart,
  FaCheckCircle,
  FaExclamationCircle,
  FaCog,
  FaBell,
  FaCrown,
  FaTimes,
} from "react-icons/fa";

import "./Profile.css";
import "./membership.css";
import { useAuth } from "../context/AuthContext";
import AppointmentList from "../components/AppointmentList";
import QuitPlanDisplay from "../components/QuitPlanDisplay";

// Component Modal chỉnh sửa kế hoạch
function PlanEditModal({ isOpen, onClose, currentPlan, onSave }) {
  const [planData, setPlanData] = useState({
    strategy:
      currentPlan.strategy || "Cai thuốc hoàn toàn và duy trì lâu dài",
    startDate: currentPlan.startDate
      ? new Date(
        currentPlan.startDate.split("/").reverse().join("-")
      )
        .toISOString()
        .split("T")[0]
      : new Date().toISOString().split("T")[0],
    goal: currentPlan.goal || "Cai thuốc hoàn toàn và duy trì lâu dài",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPlanData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(planData);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>Điều chỉnh kế hoạch cai thuốc</h2>
          <button className="close-button" onClick={onClose}>
            <FaTimes />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Phương pháp cai thuốc</label>
            <select
              name="strategy"
              value={planData.strategy}
              onChange={handleChange}
              className="form-control"
            >
              <option value="Cai thuốc hoàn toàn và duy trì lâu dài">
                Cai thuốc hoàn toàn
              </option>
              <option value="Giảm dần số điếu thuốc">Giảm dần số điếu thuốc</option>
              <option value="Sử dụng sản phẩm thay thế nicotine">
                Sử dụng sản phẩm thay thế nicotine
              </option>
            </select>
          </div>

          <div className="form-group">
            <label>Ngày bắt đầu</label>
            <input
              type="date"
              name="startDate"
              value={planData.startDate}
              onChange={handleChange}
              className="form-control"
            />
          </div>

          <div className="form-group">
            <label>Mục tiêu</label>
            <textarea
              name="goal"
              value={planData.goal}
              onChange={handleChange}
              rows="3"
              className="form-control"
            ></textarea>
          </div>

          <div className="form-actions">
            <button type="button" className="cancel-btn" onClick={onClose}>
              Hủy
            </button>
            <button type="submit" className="save-btn">
              Lưu thay đổi
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Component cập nhật hàng ngày
<<<<<<< Updated upstream
=======
function DailyUpdate({ onSubmit }) {
  const [mood, setMood] = useState("");
  const [hasSmoked, setHasSmoked] = useState(null);
  const [symptoms, setSymptoms] = useState([]);
  const [notes, setNotes] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    if (hasSmoked === null) {
      alert("Vui lòng cho biết bạn có hút thuốc hôm nay không");
      return;
    }

    if (!mood) {
      alert("Vui lòng chọn tâm trạng của bạn hôm nay");
      return;
    }

    onSubmit({
      hasSmoked,
      mood,
      symptoms,
      notes,
    });

    // Reset form
    setHasSmoked(null);
    setMood("");
    setSymptoms([]);
    setNotes("");
  };

  const toggleSymptom = (symptom) => {
    if (symptoms.includes(symptom)) {
      setSymptoms(symptoms.filter((s) => s !== symptom));
    } else {
      setSymptoms([...symptoms, symptom]);
    }
  };

  return (
    <div className="daily-update-form">
      <h2>Cập nhật hôm nay</h2>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <h3>Bạn có hút thuốc hôm nay không?</h3>
          <div className="radio-options">
            <label
              className={`radio-option ${hasSmoked === false ? "selected" : ""
                }`}
            >
              <input
                type="radio"
                name="hasSmoked"
                checked={hasSmoked === false}
                onChange={() => setHasSmoked(false)}
              />
              <span>Không</span>
            </label>

            <label
              className={`radio-option ${hasSmoked === true ? "selected" : ""}`}
            >
              <input
                type="radio"
                name="hasSmoked"
                checked={hasSmoked === true}
                onChange={() => setHasSmoked(true)}
              />
              <span>Có</span>
            </label>
          </div>
        </div>

        <div className="form-group">
          <h3>Tâm trạng của bạn hôm nay?</h3>
          <div className="mood-options">
            <button
              type="button"
              className={`mood-option ${mood === "Tốt" ? "selected" : ""}`}
              onClick={() => setMood("Tốt")}

            >
              <span className="mood-emoji">😃</span>
              <span>Tốt</span>
            </button>

            <button
              type="button"
              className={`mood-option ${mood === "Bình thường" ? "selected" : ""}`}
              onClick={() => setMood("Bình thường")}
            >
              <span className="mood-emoji">😐</span>
              <span>Bình thường</span>
            </button>

            <button
              type="button"
              className={`mood-option ${mood === "Không tốt" ? "selected" : ""}`}
              onClick={() => setMood("Không tốt")}
            >
              <span className="mood-emoji">😔</span>
              <span>Không tốt</span>
            </button>

            <button
              type="button"
              className={`mood-option ${mood === "Tệ" ? "selected" : ""}`}
              onClick={() => setMood("Tệ")}
            >
              <span className="mood-emoji">😩</span>
              <span>Tệ</span>
            </button>

            <button
              type="button"
              className={`mood-option ${mood === "Thèm thuốc" ? "selected" : ""}`}
              onClick={() => setMood("Thèm thuốc")}
            >
              <span className="mood-emoji">🚬</span>
              <span>Thèm thuốc</span>
            </button>
          </div>
        </div>

        <div className="form-group">
          <h3>Triệu chứng hôm nay</h3>
          <div className="symptoms-options">
            <label
              className={`symptom-option ${symptoms.includes("Ho") ? "selected" : ""}`}
            >
              <input
                type="checkbox"
                checked={symptoms.includes("Ho")}
                onChange={() => toggleSymptom("Ho")}
              />
              <span>Ho</span>
            </label>

            <label
              className={`symptom-option ${symptoms.includes("Khó thở") ? "selected" : ""}`}
            >
              <input
                type="checkbox"
                checked={symptoms.includes("Khó thở")}
                onChange={() => toggleSymptom("Khó thở")}
              />
              <span>Khó thở</span>
            </label>

            <label
              className={`symptom-option ${symptoms.includes("Mệt mỏi") ? "selected" : ""}`}
            >
              <input
                type="checkbox"
                checked={symptoms.includes("Mệt mỏi")}
                onChange={() => toggleSymptom("Mệt mỏi")}
              />
              <span>Mệt mỏi</span>
            </label>

            <label
              className={`symptom-option ${symptoms.includes("Căng thẳng") ? "selected" : ""}`}
            >
              <input
                type="checkbox"
                checked={symptoms.includes("Căng thẳng")}
                onChange={() => toggleSymptom("Căng thẳng")}
              />
              <span>Căng thẳng</span>
            </label>
          </div>
        </div>

        <div className="form-group">
          <h3>Ghi chú nhật ký</h3>
          <textarea
            placeholder="Chia sẻ cảm nghĩ của bạn hôm nay..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows="4"
          ></textarea>
        </div>

        <button type="submit" className="submit-button">
          Lưu cập nhật
        </button>
      </form>
    </div>
  );
}

>>>>>>> Stashed changes
export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState("profile");
  const [isPlanEditOpen, setIsPlanEditOpen] = useState(false);
  const { user, logout } = useAuth();
<<<<<<< Updated upstream
  const navigate = useNavigate();
  const notificationCount = 0; // nếu bạn có biến này thì replace theo đúng giá trị
    // Check if redirected from appointment booking
=======

  // Add notification count state
  const [notificationCount] = useState(3);

  // Check if redirected from appointment booking
>>>>>>> Stashed changes
  useEffect(() => {
    const savedTab = localStorage.getItem('activeProfileTab');
    if (savedTab) {
      setActiveTab(savedTab);
      // Clear the saved tab after using it
      localStorage.removeItem('activeProfileTab');
    }
  }, []);

  // Tính toán các giá trị
  const calculateSavings = () => {
    if (!user) return { days: 0, money: 0, cigarettes: 0 };

    const startDate = new Date(user.startDate);
    const now = new Date();
    const days = Math.floor((now - startDate) / (1000 * 60 * 60 * 24));

    const costPerDay =
      (user.costPerPack / user.cigarettesPerPack) * user.cigarettesPerDay;
    const moneySaved = days * costPerDay;
    const cigarettesSaved = days * user.cigarettesPerDay;

    return {
      days: days > 0 ? days : 0,
      money: moneySaved > 0 ? moneySaved : 0,
      cigarettes: cigarettesSaved > 0 ? cigarettesSaved : 0,
    };
  };

  const savings = calculateSavings();

  // Dữ liệu người dùng mẫu - chỉ sử dụng cho các giá trị không có trong user
  const userData = {
    ...user,
    avatar: user?.avatar || "/image/hero/quit-smoking-2.png",
    daysWithoutSmoking: savings.days,
    moneySaved: savings.money,
    pointsEarned: savings.cigarettes,
    startDate:
      new Date(user?.startDate).toLocaleDateString("vi-VN") || "01/05/2023",
    cigarettesPerDay: user?.cigarettesPerDay || 20,
    costPerDay:
      (user?.costPerPack / user?.cigarettesPerPack) * user?.cigarettesPerDay ||
      30000,
    yearsOfSmoking: 8,
    fagerstromScore: "8/10",
    healthImprovements: [
      {
        time: "20 phút",
        description: "Huyết áp và nhịp tim trở về bình thường",
        completed: savings.days > 0,
      },
      {
        time: "24 giờ",
        description: "CO trong máu giảm về mức bình thường",
        completed: savings.days >= 1,
      },
      {
        time: "48 giờ",
        description: "Nicotine đã rời khỏi cơ thể",
        completed: savings.days >= 2,
      },
      {
        time: "72 giờ",
        description: "Hô hấp dễ dàng hơn",
        completed: savings.days >= 3,
      },
      {
        time: "2-12 tuần",
        description: "Tuần hoàn máu cải thiện",
        completed: savings.days >= 14,
      },
    ],
    milestones: [
      {
        id: 1,
        name: "Chuẩn bị cai thuốc",
        date: new Date(
          new Date(user?.startDate).getTime() - 86400000
        ).toLocaleDateString("vi-VN"),
        completed: true,
      },
      {
        id: 2,
        name: "Ngày đầu tiên không hút thuốc",
        date: new Date(user?.startDate).toLocaleDateString("vi-VN"),
        completed: savings.days >= 1,
      },
      {
        id: 3,
        name: "Tuần đầu tiên không hút thuốc",
        date: new Date(
          new Date(user?.startDate).getTime() + 7 * 86400000
        ).toLocaleDateString("vi-VN"),
        completed: savings.days >= 7,
      },
      {
        id: 4,
        name: "Duy trì 3 tháng không hút thuốc",
        progress: `${Math.min(savings.days, 90)}/90 ngày`,
        completed: savings.days >= 90,
      },
    ],
    achievements: [
      {
        id: 1,
        name: "24 giờ đầu tiên",
        date:
          savings.days >= 1
            ? new Date(
              new Date(user?.startDate).getTime() + 86400000
            ).toLocaleDateString("vi-VN")
            : "",
        icon: "⭐",
      },
      {
        id: 2,
        name: "1 tuần không hút",
        date:
          savings.days >= 7
            ? new Date(
              new Date(user?.startDate).getTime() + 7 * 86400000
            ).toLocaleDateString("vi-VN")
            : "",
        icon: "🏅",
      },
      {
        id: 3,
        name: "2 tuần không hút",
        date:
          savings.days >= 14
            ? new Date(
              new Date(user?.startDate).getTime() + 14 * 86400000
            ).toLocaleDateString("vi-VN")
            : "",
        icon: "🏆",
      },
      {
        id: 4,
        name: "1 tháng không hút",
        date:
          savings.days >= 30
            ? new Date(
              new Date(user?.startDate).getTime() + 30 * 86400000
            ).toLocaleDateString("vi-VN")
            : "",
        icon: "👑",
      },
    ],
    journalEntries: [
      {
        id: 1,
        day: savings.days,
        date: "Hôm nay",
        mood: "Bình thường",
        symptoms: "Không có triệu chứng",
        notes: '"Hôm nay là một ngày bình thường, không có cảm giác thèm thuốc."',
      },
      {
        id: 2,
        day: savings.days - 1,
        date: "Hôm qua",
        mood: "Tốt",
        symptoms: "Không có triệu chứng",
        notes:
          '"Cảm thấy rất tự hào về bản thân, hôm nay tôi đã từ chối một điếu thuốc từ đồng nghiệp."',
      },
    ],
  };

  // Xử lý cập nhật hôm nay
  const handleUpdateToday = (updateData) => {
    console.log("Cập nhật mới:", updateData);
    alert("Đã lưu cập nhật của bạn!");
  };
  // Xử lý lưu kế hoạch
  const handleSavePlan = (planData) => {
    console.log("Dữ liệu kế hoạch mới:", planData);
    alert("Đã lưu kế hoạch của bạn!");
  };

  return (
    <div className="profile-container">
      {/* Sidebar */}
      <div className="profile-sidebar">
        <div className="user-info">
          <div className="user-avatar">
            <span className="user-initial">NT</span>
          </div>          <div className="user-details">
            <h3>
              {userData.name}
              {userData.membershipType && userData.membershipType !== 'free' && (
                <span className={`membership-label ${userData.membershipType}`}>
                  {userData.membershipType === 'premium' ? 'Premium' : 'Pro'}
                </span>
              )}
            </h3>
            <p>Đang cai thuốc: {userData.daysWithoutSmoking} ngày</p>
          </div>
<<<<<<< Updated upstream
        </div>        <nav className="profile-nav">
          <Link
            to="#"
            className={`nav-item ${activeTab === "profile" ? "active" : ""}`}
            onClick={() => setActiveTab("profile")}
          >
            <FaUserAlt /> Hồ sơ cá nhân
          </Link>
          
=======
        </div>

        <nav className="profile-nav">          <Link
          to="#"
          className={`nav-item ${activeTab === "profile" ? "active" : ""}`}
          onClick={() => setActiveTab("profile")}
        >
          <FaUserAlt /> Hồ sơ cá nhân
        </Link>

>>>>>>> Stashed changes
          <Link
            to="#"
            className={`nav-item ${activeTab === "appointments" ? "active" : ""}`}
            onClick={() => setActiveTab("appointments")}
          >
            <FaCalendarAlt /> Lịch hẹn Coach
          </Link>

          <Link
            to="#"
            className={`nav-item ${activeTab === "achievements" ? "active" : ""
              }`}
            onClick={() => setActiveTab("achievements")}
          >
            <FaTrophy /> Huy hiệu
          </Link>
<<<<<<< Updated upstream
          
          
          
=======
          <Link
            to="#"
            className={`nav-item ${activeTab === "journal" ? "active" : ""}`}
            onClick={() => setActiveTab("journal")}
          >
            <FaComment /> Tư vấn
          </Link>
          <Link
            to="#"
            className={`nav-item ${activeTab === "settings" ? "active" : ""}`}
            onClick={() => setActiveTab("settings")}
          >
            <FaCog /> Cài đặt
          </Link>
          <Link to="/notifications" className="nav-item notification-nav-item">
            <FaBell /> Thông báo
            {notificationCount > 0 && <span className="notification-badge">{notificationCount}</span>}
          </Link>




>>>>>>> Stashed changes
          <button onClick={logout} className="nav-item logout-btn">
            <i className="fas fa-sign-out-alt"></i> Đăng xuất
          </button>
        </nav>
      </div>

      {/* Main content */}
      <div className="profile-content">
        {activeTab === "profile" && (
          <div className="profile-overview">
            <div className="section-header">
              <h1>Hồ sơ cá nhân</h1>
              <button
                className="update-btn"
                onClick={() => setIsPlanEditOpen(true)}
              >
                Cập nhật
              </button>
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
                        {improvement.completed ? (
                          <FaCheckCircle className="completed-icon" />
                        ) : (
                          <span className="pending-icon">○</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>              <div className="plan-section">
                <h2>Kế hoạch cai thuốc</h2>                {/* Hiển thị kế hoạch cai thuốc từ localStorage */}
                <QuitPlanDisplay />

                <div className="current-plan">
                  <h3>Kế hoạch hiện tại</h3>
                  <p className="plan-strategy">
                    Phương pháp: Cai thuốc hoàn toàn và duy trì lâu dài
                  </p>

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
                    {userData.milestones.map((milestone) => (
                      <div key={milestone.id} className="milestone-item">
                        <div className="milestone-status">
                          {milestone.completed ? (
                            <div className="status-circle completed">
                              <FaCheckCircle />
                            </div>
                          ) : (
                            <div className="status-circle in-progress"></div>
                          )}
                        </div>
                        <div className="milestone-info">
                          <h4>{milestone.name}</h4>
                          <p>
                            {milestone.completed
                              ? `Hoàn thành: ${milestone.date}`
                              : `Đang tiến hành: ${milestone.progress}`}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <button
                    className="edit-plan-btn"
                    onClick={() => setIsPlanEditOpen(true)}
                  >
                    Điều chỉnh kế hoạch
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}        {activeTab === "membership" && (
          <div className="membership-section">
            <h1>Thông tin Thành viên</h1>

            <div className="membership-status">
              <div className="card membership-status-card">
                <h2>Trạng thái thành viên</h2>
                <div className="membership-status-info">
                  {userData.membershipType && userData.membershipType !== 'free' ? (
                    <div className="current-membership">
                      <div className="membership-badge-large">
                        <FaCrown className={userData.membershipType === "premium" ? "premium-icon" : "pro-icon"} />
                        <span className={`membership-type ${userData.membershipType}`}>
                          {userData.membershipType === "premium" ? "Premium" : "Pro"}
                        </span>
                      </div>
                      <p className="membership-description">
                        {userData.membershipType === "premium" 
                          ? "Bạn đang sử dụng gói Premium với đầy đủ tính năng hỗ trợ." 
                          : "Bạn đang sử dụng gói Pro với đầy đủ tính năng hàng năm."}
                      </p>
                    </div>
                  ) : (
                    <div className="free-membership">
                      <p>Bạn đang sử dụng gói Miễn phí</p>
                      <button className="upgrade-btn" onClick={() => navigate('/membership')}>
                        Nâng cấp ngay
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="membership-features">
              <h2>Tính năng của bạn</h2>
              <div className="feature-list">
                <div className="feature-item">
                  <FaCheck className="feature-check" />
                  <div className="feature-text">
                    <h3>Theo dõi cai thuốc</h3>
                    <p>Theo dõi tiến trình cai thuốc của bạn hàng ngày</p>
                  </div>
                </div>
                <div className="feature-item">
                  <FaCheck className="feature-check" />
                  <div className="feature-text">
                    <h3>Lập kế hoạch cá nhân</h3>
                    <p>Tạo kế hoạch cai thuốc phù hợp với bạn</p>
                  </div>
                </div>
                
                {userData.membershipType && userData.membershipType !== 'free' ? (
                  <>
                    <div className="feature-item">
                      <FaCheck className="feature-check" />
                      <div className="feature-text">
                        <h3>Huy hiệu & cộng đồng</h3>
                        <p>Tham gia cộng đồng và nhận huy hiệu</p>
                      </div>
                    </div>
                    <div className="feature-item">
                      <FaCheck className="feature-check" />
                      <div className="feature-text">
                        <h3>Chat huấn luyện viên</h3>
                        <p>Nhận tư vấn từ huấn luyện viên chuyên nghiệp</p>
                      </div>
                    </div>
                    <div className="feature-item">
                      <FaCheck className="feature-check" />
                      <div className="feature-text">
                        <h3>Video call tư vấn</h3>
                        <p>Tham gia các buổi tư vấn qua video</p>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="feature-item disabled">
                      <FaTimes className="feature-times" />
                      <div className="feature-text">
                        <h3>Huy hiệu & cộng đồng</h3>
                        <p>Nâng cấp để mở khóa tính năng này</p>
                      </div>
                    </div>
                    <div className="feature-item disabled">
                      <FaTimes className="feature-times" />
                      <div className="feature-text">
                        <h3>Chat huấn luyện viên</h3>
                        <p>Nâng cấp để mở khóa tính năng này</p>
                      </div>
                    </div>
                    <div className="feature-item disabled">
                      <FaTimes className="feature-times" />
                      <div className="feature-text">
                        <h3>Video call tư vấn</h3>
                        <p>Nâng cấp để mở khóa tính năng này</p>
                      </div>
                    </div>
                  </>
                )}
              </div>
              
              {!userData.membershipType || userData.membershipType === 'free' ? (
                <div className="membership-upgrade">
                  <h3>Nâng cấp để sử dụng đầy đủ tính năng</h3>
                  <button className="upgrade-btn-large" onClick={() => navigate('/membership')}>
                    Khám phá gói thành viên
                  </button>
                </div>
              ) : null}
            </div>
          </div>
        )}

        {activeTab === "achievements" && (
          <div className="achievements-section">
            <h1>Huy hiệu đã đạt</h1>

            <div className="achievements-grid">
              {userData.achievements.map((achievement) => (
                <div
                  key={achievement.id}
                  className={`achievement-card ${!achievement.date ? "locked" : ""
                    }`}
                >
                  <div className="achievement-icon">{achievement.icon}</div>
                  <h3>{achievement.name}</h3>
                  <p>{achievement.date || "Đạt khi đủ điều kiện"}</p>
                </div>
              ))}
            </div>

            <h2>Xem tất cả huy hiệu</h2>
          </div>
        )}

        {activeTab === "appointments" && (
          <div className="appointments-section">
            <h1>Lịch hẹn Coach</h1>
            <AppointmentList />
          </div>
        )}

        {activeTab === "journal" && (
          <div className="journal-section">
            <h1>Cập nhật hàng ngày</h1>

            <DailyUpdate
              onSubmit={(data) => {
                console.log("Dữ liệu cập nhật:", data);
                alert("Đã lưu cập nhật của bạn!");
              }}
            />

            <div className="journal-history">
              <h2>Lịch sử tiến trình</h2>
              <div className="view-toggle">
                <button className="toggle-btn active">Tất cả</button>
                <button className="toggle-btn">Ngày tốt</button>
                <button className="toggle-btn">Ngày khó khăn</button>
              </div>

              <div className="timeline-entries">
                {userData.journalEntries.map((entry) => (
                  <div key={entry.id} className="timeline-entry">
                    <div className="entry-header">
                      <div className="entry-day">
                        <span className="day-number">Ngày {entry.day}</span>
                        <span className="date">{entry.date}</span>
                      </div>
                      <div className="mood-indicator">
                        {entry.mood === "Tốt" && (
                          <span className="mood-emoji">😃</span>
                        )}
                        {entry.mood === "Bình thường" && (
                          <span className="mood-emoji">😐</span>
                        )}
                        {entry.mood === "Không tốt" && (
                          <span className="mood-emoji">😔</span>
                        )}
                      </div>
                    </div>
                    <div className="entry-details">
                      <div className="detail-row">
                        <span className="detail-label">Tâm trạng:</span>
                        <span className="detail-value">{entry.mood}</span>
                      </div>
                      <div className="detail-row">
                        <span className="detail-label">Triệu chứng:</span>
                        <span className="detail-value">{entry.symptoms}</span>
                      </div>
                      <div className="entry-note">{entry.notes}</div>
                    </div>
                  </div>
                ))}
              </div>

              <button className="view-all-button">Xem tất cả</button>
            </div>
          </div>
        )}

        {/* Modal chỉnh sửa kế hoạch */}
        <PlanEditModal
          isOpen={isPlanEditOpen}
          onClose={() => setIsPlanEditOpen(false)}
          currentPlan={{
            strategy: userData.planStrategy,
            startDate: userData.startDate,
            goal: userData.planGoal,
          }}
          onSave={handleSavePlan}
        />
      </div>
    </div>
  );
}
