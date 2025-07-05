<<<<<<< Updated upstream
import React, { useState, useEffect, useCallback } from 'react';
=======
import Reaexport default function Progress() {
  const [activeTimeFilter, setActiveTimeFilter] = useState('30 ngày');
  const [showCompletionDashboard, setShowCompletionDashboard] = useState(false);
  const [completionData, setCompletionData] = useState(null);
  const [userPlan, setUserPlan] = useState(null);
  const [actualProgress, setActualProgress] = useState([]);
  const [dashboardStats, setDashboardStats] = useState(null);State, useEffect, useCallback } from 'react';
>>>>>>> Stashed changes
import { useAuth } from "../context/AuthContext";
import QuitProgressChart from "../components/QuitProgressChart";
import DailyCheckin from "../components/DailyCheckin";
import ProgressDashboard from "../components/ProgressDashboard";
import ResetCheckinData from "../components/ResetCheckinData";
import "./Progress.css";
import "../styles/DailyCheckin.css";
import "../styles/ProgressDashboard.css";

export default function Progress() {
  const { user } = useAuth();
  const [activeTimeFilter, setActiveTimeFilter] = useState("30 ngày");
  const [showCompletionDashboard, setShowCompletionDashboard] = useState(false);
  const [completionData, setCompletionData] = useState(null);
  const [userPlan, setUserPlan] = useState(null);
  const [actualProgress, setActualProgress] = useState([]);
  const [dashboardStats, setDashboardStats] = useState(null);
<<<<<<< Updated upstream

  // Load user plan and progress from localStorage
=======
  // Load user plan and progress from localStorage
  useEffect(() => {
    loadUserPlanAndProgress();
  }, [loadUserPlanAndProgress]);

>>>>>>> Stashed changes
  const loadUserPlanAndProgress = useCallback(() => {
    // Load completion data từ JourneyStepper
    const savedCompletion = localStorage.getItem("quitPlanCompletion");
    if (savedCompletion) {
      try {
        const completion = JSON.parse(savedCompletion);
<<<<<<< Updated upstream
        setShowCompletionDashboard(true);
        setCompletionData(completion);
        setUserPlan(completion.plan);
        return;
      } catch (error) {
        console.error("Error parsing completion data:", error);
=======
        if (completion && completion.userPlan) {
          setCompletionData(completion);
          setUserPlan(completion.userPlan);
          setShowCompletionDashboard(true);
        } else {
          console.warn("Found saved completion data but it was incomplete");
          const activePlan = getActivePlan();
          setUserPlan(activePlan);
        }
      } catch (error) {
        console.error("Error parsing completion data:", error);
        // Fallback to active plan if there's an error
        const activePlan = getActivePlan();
        setUserPlan(activePlan);
>>>>>>> Stashed changes
      }
    } else {
      // Nếu chưa hoàn thành, tìm plan đang thực hiện
      const activePlan = getActivePlan();
      setUserPlan(activePlan);
    }
    // Load actual progress từ daily check-ins
    loadActualProgressFromCheckins();
  }, []);
<<<<<<< Updated upstream

  useEffect(() => {
    loadUserPlanAndProgress();
  }, [loadUserPlanAndProgress]);

=======
>>>>>>> Stashed changes
  const getActivePlan = () => {
    // Kiểm tra nếu có kế hoạch đang thực hiện trong localStorage
    try {
      const savedPlan = localStorage.getItem("activePlan");
      if (savedPlan) {
        const parsedPlan = JSON.parse(savedPlan);
        if (
          parsedPlan &&
          Array.isArray(parsedPlan.weeks) &&
          parsedPlan.weeks.length > 0
        ) {
          return parsedPlan;
        }
      }
    } catch (error) {
<<<<<<< Updated upstream
      console.error("Error loading plan from localStorage:", error);
    }
    // Fallback plan nếu không có dữ liệu
    return {
      name: "Kế hoạch mặc định",
      weeks: [{ amount: 15 }, { amount: 10 }, { amount: 5 }, { amount: 0 }],
      startDate: new Date().toISOString(),
    };
  };

  const loadActualProgressFromCheckins = () => {
    const progressData = [];
    const today = new Date();
    // Load dữ liệu check-in từ 30 ngày trước đến nay
    for (let i = 30; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      const dateString = date.toISOString().split("T")[0];
      const checkinData = localStorage.getItem(`checkin_${dateString}`);
      if (checkinData) {
        try {
          const data = JSON.parse(checkinData);
          progressData.push({
            date: dateString,
            actualCigarettes: data.cigarettesSmoked || 0,
            targetCigarettes: data.targetCigarettes || 0,
            notes: data.notes || "",
          });
        } catch (error) {
          console.error(`Error parsing checkin data for ${dateString}:`, error);
        }
      }
    }
    setActualProgress(progressData);
=======
      console.error("Error loading saved plan:", error);
    }
    // Trả về kế hoạch mặc định nếu không có hoặc có lỗi
    return {
      name: "Kế hoạch 6 tuần",
      startDate: new Date().toISOString().split("T")[0],
      weeks: [
        { week: 1, amount: 20, phase: "Thích nghi" },
        { week: 2, amount: 16, phase: "Thích nghi" },
        { week: 3, amount: 12, phase: "Tăng tốc" },
        { week: 4, amount: 8, phase: "Tăng tốc" },
        { week: 5, amount: 5, phase: "Hoàn thiện" },
        { week: 6, amount: 2, phase: "Hoàn thiện" },
        { week: 7, amount: 0, phase: "Mục tiêu đạt được" },
      ],
      initialCigarettes: 20,
    };
  };
  const loadActualProgressFromCheckins = () => {
    const actualData = [];
    const today = new Date();

    // Duyệt qua 30 ngày gần nhất để tìm dữ liệu check-in
    for (let i = 29; i >= 0; i--) {
      try {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split("T")[0];

        const checkinData = localStorage.getItem(`checkin_${dateStr}`);
        if (checkinData) {
          const data = JSON.parse(checkinData);
          actualData.push({
            date: dateStr,
            actualCigarettes: data.actualCigarettes,
            targetCigarettes: data.targetCigarettes,
            mood: data.mood,
            achievements: data.achievements || [],
            challenges: data.challenges || [],
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
    console.log("Progress updated:", newProgress);

    // Load lại actual progress từ localStorage để lấy dữ liệu mới nhất
    const actualData = [];
    const today = new Date();

    // Duyệt qua 30 ngày gần nhất để tìm dữ liệu check-in
    for (let i = 29; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split("T")[0];

      const checkinData = localStorage.getItem(`checkin_${dateStr}`);
      if (checkinData) {
        const data = JSON.parse(checkinData);
        actualData.push({
          date: dateStr,
          actualCigarettes: data.actualCigarettes,
          targetCigarettes: data.targetCigarettes,
          mood: data.mood,
          achievements: data.achievements || [],
          challenges: data.challenges || [],
        });
      }
    }

    // Cập nhật state để trigger re-render của biểu đồ
    setActualProgress(actualData);
>>>>>>> Stashed changes
  };

  // Check for plan completion data on component mount
  useEffect(() => {
    const savedCompletion = localStorage.getItem("quitPlanCompletion");
    if (savedCompletion) {
      try {
        const completion = JSON.parse(savedCompletion);
        setShowCompletionDashboard(true);
        setCompletionData(completion);
      } catch (error) {
        console.error("Error parsing completion data:", error);
      }
    }
  }, []);

<<<<<<< Updated upstream
  // Track userPlan changes for debugging
  useEffect(() => {
    if (userPlan) {
      const hasValidPlan =
        userPlan &&
        userPlan.weeks &&
        Array.isArray(userPlan.weeks) &&
        userPlan.weeks.length > 0;
      console.log(
        `Plan loaded: ${userPlan.name}, Valid: ${
          hasValidPlan ? "Có kế hoạch" : "Không có kế hoạch"
        }`
      );
    }
  }, [userPlan]);

=======
  // Recalculate statistics whenever actualProgress changes
  useEffect(() => {
    console.log("actualProgress changed, recalculating statistics...");
    // Recalculate even if there's no data, to reset stats if needed
    recalculateStatistics();
  }, [actualProgress]);

  // Không chuyển hướng tự động, chỉ hiển thị nút cho người dùng
  useEffect(() => {
    if (userPlan) {
      // Chỉ kiểm tra xem có kế hoạch và cập nhật state
      const hasValidPlan =
        userPlan && Array.isArray(userPlan.weeks) && userPlan.weeks.length > 0;
      console.log(
        "Đã kiểm tra kế hoạch:",
        hasValidPlan ? "Có kế hoạch" : "Không có kế hoạch"
      );
    }
  }, [userPlan]);
>>>>>>> Stashed changes
  // Tính toán lại tất cả các thống kê và cập nhật state
  const recalculateStatistics = useCallback(() => {
    console.log("======= BẮT ĐẦU TÍNH TOÁN THỐNG KÊ MỚI =======");

    // Tính số ngày theo dõi - CHỈ tính các ngày có thực sự checkin
    let noSmokingDays = 0;
<<<<<<< Updated upstream

    // Tính số ngày đã checkin (thực tế theo dõi)
    noSmokingDays = actualProgress.length;
    console.log(`Số ngày đã checkin (theo dõi thực tế): ${noSmokingDays}`);

    // Lấy số điếu ban đầu từ week đầu tiên
    let initialCigarettesPerDay = 20; // Mặc định
    if (
      userPlan &&
      userPlan.weeks &&
      userPlan.weeks.length > 0 &&
      userPlan.weeks[0].amount
    ) {
      initialCigarettesPerDay = userPlan.weeks[0].amount;
    } else if (userPlan && userPlan.initialCigarettes) {
      initialCigarettesPerDay = userPlan.initialCigarettes;
    }

    console.log(`Số điếu ban đầu mỗi ngày: ${initialCigarettesPerDay}`);

    // Tính số điếu đã tránh được dựa trên dữ liệu checkin thực tế
    let savedCigarettes = 0;
    actualProgress.forEach((dayRecord) => {
      const daySaved = Math.max(
        0,
        initialCigarettesPerDay - (dayRecord.actualCigarettes || 0)
      );
      savedCigarettes += daySaved;
      console.log(
        `Ngày ${dayRecord.date}: ${initialCigarettesPerDay} - ${
          dayRecord.actualCigarettes
        } = ${daySaved} điếu${daySaved > 0 ? " ✅" : " (không tránh được)"}`
      );
    });

    console.log(
      `Tổng số điếu đã tránh: ${savedCigarettes} điếu từ ${actualProgress.length} ngày checkin`
    );

    // Tính tiền tiết kiệm
    let packPrice = 25000; // Giá mặc định
=======
    let planStartDate = null;

    // Lấy ngày bắt đầu từ activePlan
    try {
      const activePlanData = localStorage.getItem("activePlan");
      if (activePlanData) {
        const activePlan = JSON.parse(activePlanData);
        if (activePlan && activePlan.startDate) {
          planStartDate = new Date(activePlan.startDate);
          console.log(`Ngày bắt đầu kế hoạch: ${activePlan.startDate}`);
        }
      }
    } catch (error) {
      console.error("Lỗi khi đọc ngày bắt đầu kế hoạch:", error);
    }

    // Tính số ngày theo dõi dựa trên dữ liệu checkin thực tế
    if (actualProgress.length > 0) {
      // Số ngày theo dõi = số ngày có checkin thực tế
      noSmokingDays = actualProgress.length;
      console.log(
        `Ngày theo dõi: ${noSmokingDays} ngày (dựa trên số ngày có checkin thực tế)`
      );
    } else if (planStartDate) {
      // Nếu chưa có checkin nhưng có kế hoạch, tính từ ngày bắt đầu
      const today = new Date();
      const daysDiff = Math.floor(
        (today - planStartDate) / (1000 * 60 * 60 * 24)
      );
      noSmokingDays = Math.max(0, daysDiff); // Không +1 vì chưa có checkin
      console.log(
        `Ngày theo dõi: ${noSmokingDays} ngày (dựa trên ngày bắt đầu kế hoạch, chưa có checkin)`
      );
    } else {
      noSmokingDays = 0;
      console.log(
        `Ngày theo dõi: 0 ngày (chưa có kế hoạch và chưa có checkin)`
      );
    }

    // Hiển thị tất cả dữ liệu check-in hiện có
    console.log("Dữ liệu check-in hiện có:", actualProgress);

    // Lấy số điếu ban đầu chính xác từ kế hoạch và activePlan
    let initialCigarettesPerDay = 0;

    // Ưu tiên lấy từ activePlan vì đó là nơi lưu giá trị người dùng nhập
    try {
      const activePlanData = localStorage.getItem("activePlan");
      if (activePlanData) {
        const activePlan = JSON.parse(activePlanData);
        if (activePlan && activePlan.initialCigarettes) {
          initialCigarettesPerDay = activePlan.initialCigarettes;
          console.log(
            `Lấy số điếu ban đầu từ activePlan: ${initialCigarettesPerDay}`
          );
        }
      }
    } catch (error) {
      console.error("Lỗi khi đọc initialCigarettes từ activePlan:", error);
    }

    // Nếu không có trong activePlan, thử lấy từ userPlan
    if (!initialCigarettesPerDay) {
      initialCigarettesPerDay =
        userPlan?.initialCigarettes ||
        (userPlan?.weeks && userPlan.weeks.length > 0
          ? userPlan.weeks[0].amount
          : 22);
    }

    console.log(
      `Số điếu ban đầu được sử dụng: ${initialCigarettesPerDay} điếu/ngày`
    );

    // Tính số điếu đã tránh - CHỈ tính tích lũy cho các ngày thực sự giảm được
    let savedCigarettes = 0;
    let dailySavings = [];
    let detailedLog = "";

    // Tính số điếu đã tránh cho TẤT CẢ các ngày có trong actualProgress
    actualProgress.forEach((dayRecord) => {
      // Số điếu đã tránh trong ngày = số điếu ban đầu - số điếu thực tế
      // CHỈ tính nếu thực sự giảm được (actual < initial)
      const daySaved = Math.max(
        0,
        initialCigarettesPerDay - dayRecord.actualCigarettes
      );

      // Chỉ cộng vào tổng nếu thực sự tránh được điếu thuốc
      if (daySaved > 0) {
        savedCigarettes += daySaved;
      }

      // Ghi chi tiết để debug
      detailedLog += `\n- Ngày ${
        dayRecord.date
      }: ${initialCigarettesPerDay} - ${
        dayRecord.actualCigarettes
      } = ${daySaved} điếu${daySaved > 0 ? " ✅" : " (không tránh được)"}`;

      // Lưu thông tin chi tiết
      dailySavings.push({
        date: dayRecord.date,
        actual: dayRecord.actualCigarettes,
        targetFromPlan: dayRecord.targetCigarettes,
        userInitialCigarettes: initialCigarettesPerDay,
        saved: daySaved,
      });
    });

    console.log(`Tổng số điếu đã tránh tích lũy: ${savedCigarettes} điếu`);
    console.log("Chi tiết các ngày:", dailySavings);

    // Tính tiền tiết kiệm dựa trên giá gói thuốc từ kế hoạch của người dùng
    let packPrice = 25000; // Giá mặc định nếu không tìm thấy

    // Lấy giá gói thuốc từ activePlan
>>>>>>> Stashed changes
    try {
      const activePlanData = localStorage.getItem("activePlan");
      if (activePlanData) {
        const activePlan = JSON.parse(activePlanData);
<<<<<<< Updated upstream
        if (activePlan.packPrice) {
          packPrice = parseFloat(activePlan.packPrice);
          console.log(
            `Giá gói thuốc từ activePlan: ${packPrice.toLocaleString()}đ`
=======
        if (activePlan && activePlan.packPrice) {
          packPrice = activePlan.packPrice;
          console.log(
            `Lấy giá gói thuốc từ activePlan: ${packPrice.toLocaleString()}đ`
>>>>>>> Stashed changes
          );
        }
      }
    } catch (error) {
<<<<<<< Updated upstream
      console.error("Lỗi khi lấy packPrice từ activePlan:", error);
=======
      console.error("Lỗi khi đọc packPrice từ activePlan:", error);
>>>>>>> Stashed changes
    }

    const pricePerCigarette = packPrice / 20; // Giả sử 1 gói = 20 điếu
    const savedMoney = savedCigarettes * pricePerCigarette;

<<<<<<< Updated upstream
    // Chuẩn bị milestone sức khỏe
    const healthMilestones = [
      { days: 1, title: "24 giờ", description: "Carbon monoxide được loại bỏ" },
=======
    // Tính milestone sức khỏe đạt được dựa trên số ngày có checkin thực tế
    // Milestone theo thời gian WHO - chỉ tính các ngày thực sự tham gia checkin
    const healthMilestones = [
      {
        days: 1,
        title: "24 giờ đầu tiên",
        description: "Carbon monoxide được loại bỏ khỏi cơ thể",
      },
>>>>>>> Stashed changes
      {
        days: 2,
        title: "48 giờ",
        description: "Nicotine được loại bỏ, vị giác cải thiện",
      },
      {
        days: 3,
        title: "72 giờ",
        description: "Đường hô hấp thư giãn, năng lượng tăng",
      },
<<<<<<< Updated upstream
=======
      {
        days: 7,
        title: "1 tuần",
        description: "Vị giác và khứu giác cải thiện rõ rệt",
      },
>>>>>>> Stashed changes
      { days: 14, title: "2 tuần", description: "Tuần hoàn máu cải thiện" },
      { days: 30, title: "1 tháng", description: "Chức năng phổi tăng 30%" },
      { days: 90, title: "3 tháng", description: "Ho và khó thở giảm đáng kể" },
      { days: 365, title: "1 năm", description: "Nguy cơ bệnh tim giảm 50%" },
    ];

<<<<<<< Updated upstream
    // Tìm milestone sức khỏe đã đạt được
=======
    // Tìm milestone sức khỏe đã đạt được dựa trên số ngày theo dõi thực tế
>>>>>>> Stashed changes
    const achievedMilestones = healthMilestones.filter(
      (m) => noSmokingDays >= m.days
    ).length;
    const healthProgress = Math.round(
      (achievedMilestones / healthMilestones.length) * 100
    );

<<<<<<< Updated upstream
=======
    console.log(
      `Milestone sức khỏe: ${achievedMilestones}/${healthMilestones.length} (${healthProgress}%) dựa trên ${noSmokingDays} ngày theo dõi thực tế`
    );

    console.log(
      `Thống kê mới: ${noSmokingDays} ngày không hút, ${savedCigarettes} điếu đã tránh, ${savedMoney.toFixed(
        0
      )}đ tiết kiệm, tiến độ sức khỏe ${healthProgress}%`
    );

    // Tìm dữ liệu hôm nay để debug
    const todayDateStr = new Date().toISOString().split("T")[0];
    const todayRecord = actualProgress.find((day) => day.date === todayDateStr);

>>>>>>> Stashed changes
    // Cập nhật state với thống kê mới
    const newStats = {
      noSmokingDays,
      savedCigarettes,
      savedMoney,
      healthProgress,
<<<<<<< Updated upstream
    };

=======
      // Thêm thông tin chi tiết để debugging
      calculationDetails: {
        initialCigarettesPerDay,
        dailySavings,
        lastCalculated: new Date().toISOString(),
        debug: {
          actualData: todayRecord
            ? {
                date: todayDateStr,
                actualCigarettes: todayRecord.actualCigarettes,
                targetCigarettes: todayRecord.targetCigarettes,
              }
            : "Chưa có check-in hôm nay",
          totalCheckinDays: actualProgress.length,
          savedCalcDesc: `Tổng ${savedCigarettes} điếu đã tránh từ ${actualProgress.length} ngày checkin`,
        },
      },
    };

    console.log("Đang cập nhật state với thống kê mới:", newStats);
    console.log("QUAN TRỌNG - Số điếu đã tránh mới: " + savedCigarettes);

    // Lưu vào localStorage để sử dụng giữa các phiên - xóa trước để đảm bảo không giữ lại dữ liệu cũ
    localStorage.removeItem("dashboardStats");
    localStorage.setItem("dashboardStats", JSON.stringify(newStats));

>>>>>>> Stashed changes
    console.log("======= KẾT THÚC TÍNH TOÁN THỐNG KÊ =======");

    // Cập nhật state với thống kê mới
    setDashboardStats(newStats);

    return newStats;
<<<<<<< Updated upstream
  }, [actualProgress, userPlan]);

  // Recalculate statistics when actualProgress changes
  useEffect(() => {
    recalculateStatistics();
  }, [actualProgress, recalculateStatistics]);
=======
  }, [actualProgress]);
>>>>>>> Stashed changes

  if (!userPlan) {
    return (
      <div className="progress-container">
        <div style={{ textAlign: "center", padding: "2rem" }}>
          <p>Đang tải kế hoạch của bạn...</p>
        </div>
      </div>
    );
  }

<<<<<<< Updated upstream
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
=======
  // Kiểm tra xem có cần hiển thị thông báo cần lập kế hoạch
  const hasValidPlan =
    userPlan && Array.isArray(userPlan.weeks) && userPlan.weeks.length > 0;
  if (userPlan && !hasValidPlan) {
    return (
      <div className="progress-container">
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
            padding: "3rem",
            maxWidth: "600px",
            margin: "0 auto",
            backgroundColor: "white",
            borderRadius: "10px",
            boxShadow: "0 5px 15px rgba(0,0,0,0.1)",
            marginTop: "2rem",
          }}
        >
          <h2
            style={{
              fontSize: "1.8rem",
              marginBottom: "1.5rem",
              color: "#2c3e50",
              textAlign: "center",
              width: "100%",
              position: "relative",
              fontWeight: "600",
              display: "inline-block",
            }}
          >
            <span style={{ position: "relative", zIndex: "1" }}>
              Bạn cần lập kế hoạch cai thuốc
              <span
                style={{
                  position: "absolute",
                  height: "3px",
                  width: "100px",
                  background: "#3498db",
                  bottom: "-10px",
                  left: "50%",
                  transform: "translateX(-50%)",
                  borderRadius: "2px",
                }}
              ></span>
            </span>
          </h2>
          <p
            style={{
              fontSize: "1.1rem",
              marginBottom: "2rem",
              color: "#7f8c8d",
              lineHeight: "1.6",
              textAlign: "center",
              maxWidth: "90%",
            }}
          >
            Để theo dõi tiến trình cai thuốc, hãy lập một kế hoạch phù hợp với
            mục tiêu và khả năng của bạn. Kế hoạch này sẽ giúp bạn duy trì động
            lực và đo lường sự tiến bộ hàng ngày.
          </p>
          <a
            href="/journey"
            style={{
              backgroundColor: "#3498db",
              color: "white",
              border: "none",
              borderRadius: "30px",
              padding: "12px 25px",
              fontSize: "1rem",
              fontWeight: "600",
              cursor: "pointer",
              transition: "all 0.3s ease",
              textDecoration: "none",
              display: "block",
              margin: "0 auto",
              width: "fit-content",
              textAlign: "center",
            }}
            onMouseOver={(e) => (e.target.style.backgroundColor = "#2980b9")}
            onMouseOut={(e) => (e.target.style.backgroundColor = "#3498db")}
          >
            Lập kế hoạch cai thuốc ngay
          </a>
>>>>>>> Stashed changes
        </div>
      </div>
    );
  }

  return (
    <div className="progress-container">
<<<<<<< Updated upstream
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
              console.log("Progress updated from DailyCheckin:", data);
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
                className={activeTimeFilter === "7 ngày" ? "active" : ""}
                onClick={() => setActiveTimeFilter("7 ngày")}
              >
                7 ngày
              </button>
              <button
                className={activeTimeFilter === "30 ngày" ? "active" : ""}
                onClick={() => setActiveTimeFilter("30 ngày")}
              >
                30 ngày
              </button>
              <button
                className={activeTimeFilter === "Tất cả" ? "active" : ""}
                onClick={() => setActiveTimeFilter("Tất cả")}
              >
                Tất cả
              </button>
            </div>
          </div>

=======
      {" "}
      <h1 className="page-title">
        {showCompletionDashboard
          ? "Chúc mừng! Bạn đã lập kế hoạch cai thuốc"
          : "Tiến trình cai thuốc hiện tại"}
      </h1>{" "}
      {/* Daily Checkin Section - Luôn hiển thị để người dùng có thể nhập số điếu đã hút */}
      <DailyCheckin
        onProgressUpdate={handleProgressUpdate}
        currentPlan={
          userPlan || {
            name: "Kế hoạch mặc định",
            startDate: new Date().toISOString().split("T")[0],
            weeks: [
              { week: 1, amount: 20, phase: "Thích nghi" },
              { week: 2, amount: 16, phase: "Thích nghi" },
              { week: 3, amount: 12, phase: "Tăng tốc" },
              { week: 4, amount: 8, phase: "Tăng tốc" },
              { week: 5, amount: 5, phase: "Hoàn thiện" },
              { week: 6, amount: 2, phase: "Hoàn thiện" },
              { week: 7, amount: 0, phase: "Mục tiêu đạt được" },
            ],
            initialCigarettes: 20,
          }
        }
      />
      {/* Show completion dashboard if plan is completed */}
      {showCompletionDashboard && completionData ? (
        <ProgressDashboard
          userPlan={completionData.userPlan}
          completionDate={completionData.completionDate}
        />
      ) : (
        <>
          {/* Enhanced Progress Chart with Chart.js */}
>>>>>>> Stashed changes
          <QuitProgressChart
            userPlan={userPlan}
            actualProgress={actualProgress}
            timeFilter={activeTimeFilter}
          />
<<<<<<< Updated upstream
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
                {userPlan.startDate
                  ? new Date(userPlan.startDate).toLocaleDateString()
                  : "Chưa xác định"}
              </span>
            </div>
=======

          {/* Time Filter Controls */}
          <div className="time-filters">
            <button
              className={`time-filter ${
                activeTimeFilter === "7 ngày" ? "active" : ""
              }`}
              onClick={() => setActiveTimeFilter("7 ngày")}
            >
              7 ngày
            </button>
            <button
              className={`time-filter ${
                activeTimeFilter === "14 ngày" ? "active" : ""
              }`}
              onClick={() => setActiveTimeFilter("14 ngày")}
            >
              14 ngày
            </button>
            <button
              className={`time-filter ${
                activeTimeFilter === "30 ngày" ? "active" : ""
              }`}
              onClick={() => setActiveTimeFilter("30 ngày")}
            >
              30 ngày
            </button>
            <button
              className={`time-filter ${
                activeTimeFilter === "Tất cả" ? "active" : ""
              }`}
              onClick={() => setActiveTimeFilter("Tất cả")}
            >
              Tất cả
            </button>
>>>>>>> Stashed changes
          </div>
        </div>

<<<<<<< Updated upstream
        {/* Development Tools */}
        <ResetCheckinData
          onReset={() => {
            setActualProgress([]);
            console.log("Check-in data reset");
          }}
        />
      </div>
=======
          {/* Additional Progress Dashboard - Thay thế Mood Tracking */}
          <div className="additional-progress-section">
            <ProgressDashboard
              userPlan={userPlan}
              completionDate={userPlan?.startDate}
              dashboardStats={dashboardStats}
              actualProgress={actualProgress}
            />
          </div>
        </>
      )}
>>>>>>> Stashed changes
    </div>
  );
}
