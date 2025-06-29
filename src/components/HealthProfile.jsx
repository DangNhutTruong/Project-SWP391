import React, { useState, useEffect } from "react";
import {
  FaHeartbeat,
  FaClipboardList,
  FaCheck,
  FaClock,
  FaEdit,
  FaSave,
  FaTimes,
} from "react-icons/fa";
import "../styles/HealthProfile.css";
import apiService from "../utils/apiService";
import { useAuth } from "../context/AuthContext";

/**
 * Component hiển thị thông tin hồ sơ sức khỏe
 * @param {Object} props
 * @param {Object} props.healthData - Dữ liệu sức khỏe người dùng
 * @param {Object} props.activePlan - Kế hoạch đang hoạt động để lấy milestone sức khỏe
 */
const HealthProfile = ({ healthData = {}, activePlan = null }) => {
  const { user } = useAuth();
  const [isEditingStats, setIsEditingStats] = useState(false);
  const [editableStats, setEditableStats] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  // Dữ liệu mẫu nếu không có dữ liệu thực
  const [data, setData] = useState(
    healthData.stats || {
      smokingHistory: "15 năm",
      dailyConsumption: "20 điếu/ngày",
      quitAttempts: "2 lần",
      healthIssues: "Ho mãn tính, khó thở khi vận động",
      bloodPressure: "Ổn định",
      heartRate: "Ổn định",
      oxygenLevel: "Ổn định",
      respiratoryRate: "Ổn định",
    }
  ); // Tạo milestone sức khỏe từ activePlan để hiển thị trong phần cải thiện sức khỏe
  const generateHealthImprovementsFromPlan = (activePlan) => {
    if (!activePlan || !activePlan.weeks || !Array.isArray(activePlan.weeks)) {
      return [];
    }

    const currentDate = new Date();
    const startDate = activePlan.startDate
      ? new Date(activePlan.startDate)
      : currentDate;

    // Tạo cải thiện sức khỏe dựa trên tiến trình của kế hoạch
    const healthImprovements = [];
    const improvementGroups = new Map(); // Để gộp các tuần có nội dung giống nhau

    // Milestone sức khỏe theo tuần từ kế hoạch
    activePlan.weeks.forEach((week, index) => {
      const weekStartDate = new Date(startDate);
      weekStartDate.setDate(startDate.getDate() + index * 7);
      const weekEndDate = new Date(weekStartDate);
      weekEndDate.setDate(weekStartDate.getDate() + 6);

      const isCompleted = currentDate > weekEndDate;

      let improvementData = null;

      // Định nghĩa nội dung cải thiện cho từng tuần
      if (week.week === 1) {
        improvementData = {
          description: "Nhịp tim và huyết áp bắt đầu cải thiện, giảm stress",
          category: "tim_mach_stress",
        };
      } else if (week.week === 2) {
        improvementData = {
          description: "Phổi bắt đầu tự làm sạch, giảm ho và khạc đờm",
          category: "phoi_ho_khi",
        };
      } else if (week.week === 3) {
        improvementData = {
          description: "Tuần hoàn máu cải thiện, tăng khả năng vận động",
          category: "tuan_hoan_van_dong",
        };
      } else if (week.week >= 4) {
        improvementData = {
          description: "Tăng cường sức khỏe tim mạch, cải thiện hệ hô hấp",
          category: "tim_mach_ho_hap_tong_quat",
        };
      }

      if (improvementData) {
        const key = improvementData.category;

        if (!improvementGroups.has(key)) {
          improvementGroups.set(key, {
            weeks: [],
            description: improvementData.description,
            anyCompleted: false,
            allCompleted: true,
          });
        }

        const group = improvementGroups.get(key);
        group.weeks.push(week.week);
        if (isCompleted) {
          group.anyCompleted = true;
        } else {
          group.allCompleted = false;
        }
      }
    });

    // Chuyển đổi groups thành array và format
    improvementGroups.forEach((group, key) => {
      const sortedWeeks = group.weeks.sort((a, b) => a - b);
      let timeDisplay = "";

      if (sortedWeeks.length === 1) {
        timeDisplay = `Tuần ${sortedWeeks[0]}`;
      } else if (sortedWeeks.length === 2) {
        timeDisplay = `Tuần ${sortedWeeks[0]}, ${sortedWeeks[1]}`;
      } else {
        // Nếu có nhiều tuần liên tiếp, hiển thị dạng range
        const ranges = [];
        let start = sortedWeeks[0];
        let end = start;

        for (let i = 1; i < sortedWeeks.length; i++) {
          if (sortedWeeks[i] === end + 1) {
            end = sortedWeeks[i];
          } else {
            if (start === end) {
              ranges.push(`Tuần ${start}`);
            } else {
              ranges.push(`Tuần ${start}-${end}`);
            }
            start = sortedWeeks[i];
            end = start;
          }
        }

        if (start === end) {
          ranges.push(`Tuần ${start}`);
        } else {
          ranges.push(`Tuần ${start}-${end}`);
        }

        timeDisplay = ranges.join(", ");
      }

      healthImprovements.push({
        time: timeDisplay,
        description: group.description,
        completed: group.allCompleted, // Chỉ completed khi tất cả tuần trong nhóm đã hoàn thành
        fromPlan: true,
        weekNumbers: sortedWeeks,
        category: key,
      });
    });

    return healthImprovements;
  };

  // Lấy milestone sức khỏe từ kế hoạch
  const improvements = generateHealthImprovementsFromPlan(activePlan);

  // Xử lý chỉnh sửa thông tin sức khỏe (chỉ phần stats)
  const handleEditStats = () => {
    setEditableStats({ ...data });
    setIsEditingStats(true);
  };
  const handleSaveStats = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Cập nhật dữ liệu thực tế
      setData({ ...editableStats });
      console.log("Lưu thông tin sức khỏe:", editableStats);
      
      // Save to API if user is logged in
      if (user && user.id) {
        try {
          await apiService.health.updateProfile(user.id, editableStats);
          console.log("Health profile updated via API successfully");
        } catch (apiError) {
          console.error("Failed to update health profile via API:", apiError);
          // Continue with localStorage only, no need to show error to user
        }
      }
      
      // Always save to localStorage as backup
      localStorage.setItem('healthProfile', JSON.stringify(editableStats));
      
      setIsEditingStats(false);

      // Callback lên component cha để cập nhật dữ liệu (nếu có)
      if (typeof healthData.onUpdateStats === "function") {
        healthData.onUpdateStats(editableStats);
      }
    } catch (error) {
      console.error("Error saving health stats:", error);
      setError("Không thể lưu thông tin sức khỏe. Vui lòng thử lại sau.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelEditStats = () => {
    setEditableStats({});
    setIsEditingStats(false);
  };

  const handleStatsChange = (field, value) => {
    setEditableStats((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Load health data from API if not provided as prop
  useEffect(() => {
    if (Object.keys(healthData).length === 0 && user && user.UserID) {
      setIsLoading(true);
      setError(null);

      apiService.health
        .getUserHealth(user.UserID)
        .then((response) => {
          if (response.success && response.data) {
            setData(response.data.stats || data);
          }
          setIsLoading(false);
        })
        .catch((err) => {
          console.error("Error loading health data:", err);
          setError("Không thể tải dữ liệu sức khỏe");
          setIsLoading(false);

          // Try to load from localStorage as fallback
          try {
            const savedHealthData = localStorage.getItem("user_health_data");
            if (savedHealthData) {
              const parsedData = JSON.parse(savedHealthData);
              if (parsedData && parsedData.stats) {
                setData(parsedData.stats);
              }
            }
          } catch (storageError) {
            console.error(
              "Error reading health data from localStorage:",
              storageError
            );
          }
        });
    }
  }, [user, healthData, data]);

  return (
    <div className="health-profile">
      {/* Show loading state */}
      {isLoading && (
        <div className="health-loading">
          <div className="loading-spinner"></div>
          <p>Đang tải dữ liệu sức khỏe...</p>
        </div>
      )}
      
      {/* Show error message if any */}
      {error && (
        <div className="health-error">
          <div className="error-icon">⚠️</div>
          <p>{error}</p>
          <button onClick={() => setError(null)}>Đóng</button>
        </div>
      )}
      
      <div className="health-stats">
        <div className="stats-header">
          <h3>Thông tin sức khỏe</h3>
          {!isEditingStats ? (
            <button
              className="edit-stats-btn"
              onClick={handleEditStats}
              title="Chỉnh sửa thông tin sức khỏe"
            >
              <FaEdit />
            </button>
          ) : (
            <div className="edit-actions">
              <button
                className="save-btn"
                onClick={handleSaveStats}
                title="Lưu thay đổi"
              >
                <FaSave />
              </button>
              <button
                className="cancel-btn"
                onClick={handleCancelEditStats}
                title="Hủy chỉnh sửa"
              >
                <FaTimes />
              </button>
            </div>
          )}
        </div>
        <div className="health-stat-row">
          <div className="health-stat">
            <h4>Tiền sử hút thuốc</h4>
            {!isEditingStats ? (
              <p>{data.smokingHistory}</p>
            ) : (
              <input
                type="text"
                value={editableStats.smokingHistory || ""}
                onChange={(e) =>
                  handleStatsChange("smokingHistory", e.target.value)
                }
                placeholder="Ví dụ: 15 năm"
              />
            )}
          </div>
        </div>
        <div className="health-stat-row two-col">
          <div className="health-stat-item">
            <label>Mức tiêu thụ hàng ngày</label>
            {!isEditingStats ? (
              <p>{data.dailyConsumption}</p>
            ) : (
              <input
                type="text"
                value={editableStats.dailyConsumption || ""}
                onChange={(e) =>
                  handleStatsChange("dailyConsumption", e.target.value)
                }
                placeholder="Ví dụ: 20 điếu/ngày"
              />
            )}
          </div>
          <div className="health-stat-item">
            <label>Số lần cố gắng cai thuốc</label>
            {!isEditingStats ? (
              <p>{data.quitAttempts}</p>
            ) : (
              <input
                type="text"
                value={editableStats.quitAttempts || ""}
                onChange={(e) =>
                  handleStatsChange("quitAttempts", e.target.value)
                }
                placeholder="Ví dụ: 2 lần"
              />
            )}
          </div>
        </div>
        <div className="health-stat-row">
          <div className="health-stat">
            <h4>Vấn đề sức khỏe liên quan</h4>
            {!isEditingStats ? (
              <p>{data.healthIssues}</p>
            ) : (
              <textarea
                value={editableStats.healthIssues || ""}
                onChange={(e) =>
                  handleStatsChange("healthIssues", e.target.value)
                }
                placeholder="Mô tả các vấn đề sức khỏe..."
                rows="3"
              />
            )}
          </div>
        </div>{" "}
        <div className="health-stat-row two-col">
          <div className="health-stat-item">
            <label>Huyết áp</label>
            {!isEditingStats ? (
              <p>{data.bloodPressure}</p>
            ) : (
              <select
                value={editableStats.bloodPressure || ""}
                onChange={(e) =>
                  handleStatsChange("bloodPressure", e.target.value)
                }
              >
                <option value="">Chọn mức độ</option>
                <option value="Thấp">Thấp</option>
                <option value="Ổn định">Ổn định</option>
                <option value="Cao">Cao</option>
              </select>
            )}
          </div>
          <div className="health-stat-item">
            <label>Nhịp tim</label>
            {!isEditingStats ? (
              <p>{data.heartRate}</p>
            ) : (
              <select
                value={editableStats.heartRate || ""}
                onChange={(e) => handleStatsChange("heartRate", e.target.value)}
              >
                <option value="">Chọn mức độ</option>
                <option value="Thấp">Thấp</option>
                <option value="Ổn định">Ổn định</option>
                <option value="Cao">Cao</option>
              </select>
            )}
          </div>
        </div>
        <div className="health-stat-row two-col">
          <div className="health-stat-item">
            <label>Mức oxy trong máu</label>
            {!isEditingStats ? (
              <p>{data.oxygenLevel}</p>
            ) : (
              <select
                value={editableStats.oxygenLevel || ""}
                onChange={(e) =>
                  handleStatsChange("oxygenLevel", e.target.value)
                }
              >
                <option value="">Chọn mức độ</option>
                <option value="Thấp">Thấp</option>
                <option value="Ổn định">Ổn định</option>
                <option value="Cao">Cao</option>
              </select>
            )}
          </div>
          <div className="health-stat-item">
            <label>Tần số hô hấp</label>
            {!isEditingStats ? (
              <p>{data.respiratoryRate}</p>
            ) : (
              <select
                value={editableStats.respiratoryRate || ""}
                onChange={(e) =>
                  handleStatsChange("respiratoryRate", e.target.value)
                }
              >
                <option value="">Chọn mức độ</option>
                <option value="Thấp">Thấp</option>
                <option value="Ổn định">Ổn định</option>
                <option value="Cao">Cao</option>
              </select>
            )}
          </div>
        </div>
      </div>{" "}
      <div className="health-improvements">
        <div className="improvements-header">
          <h3>Cải thiện sức khỏe theo tiến trình</h3>
          <div className="improvements-info">
            <span className="info-text">
              📊 Dựa trên milestone kế hoạch cai thuốc
            </span>
          </div>
        </div>

        <div className="improvements-list">
          {" "}
          {improvements.map((item, index) => (
            <div
              className={`improvement-item ${item.fromPlan ? "from-plan" : ""}`}
              key={index}
            >
              <span className="improvement-time">{item.time}</span>
              <span className="improvement-description">
                {item.description}
              </span>
              <div className="improvement-status">
                {item.completed ? (
                  <FaCheck className="completed-icon" />
                ) : (
                  <FaClock className="pending-icon" />
                )}
                {item.fromPlan && (
                  <span className="plan-badge">
                    {item.weekNumbers
                      ? `${item.weekNumbers.length} tuần`
                      : "Kế hoạch"}
                  </span>
                )}
              </div>
            </div>
          ))}
          {improvements.length === 0 && (
            <div className="no-improvements">
              <p>
                Chưa có kế hoạch cai thuốc để hiển thị tiến trình cải thiện sức
                khỏe.
              </p>
              <p>Vui lòng tạo kế hoạch cai thuốc để xem milestone sức khỏe.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HealthProfile;
