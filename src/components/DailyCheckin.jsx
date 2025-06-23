import React, { useState, useEffect } from 'react';
import { FaCalendarCheck, FaSave } from 'react-icons/fa';

const DailyCheckin = ({ onProgressUpdate, currentPlan }) => {
    // State ban đầu với giá trị tạm thời, sẽ được cập nhật ngay khi component mount
    const [todayData, setTodayData] = useState({
        date: new Date().toISOString().split('T')[0],
        targetCigarettes: null, // Sẽ được tính từ kế hoạch ngay sau khi component mount
        actualCigarettes: 0,
        notes: ''
    });

    const [isSubmitted, setIsSubmitted] = useState(false);
    const [currentWeek, setCurrentWeek] = useState(1); // Tuần hiện tại
    const [streakDays, setStreakDays] = useState(0); // Số ngày liên tiếp đạt mục tiêu
    const [toast, setToast] = useState({ show: false, message: '', type: 'success' }); // Thông báo dạng toast    // Tính target cigarettes dựa hoàn toàn trên kế hoạch và ngày hiện tại
    const calculateTodayTarget = () => {
        console.log("Đang tính mục tiêu từ kế hoạch:", currentPlan?.name);
        
        // Lấy giá trị mục tiêu từ kế hoạch đã lập
        // Nếu không có kế hoạch hoặc kế hoạch không hợp lệ, sử dụng giá trị mặc định
        const DEFAULT_TARGET = currentPlan?.initialCigarettes || 22;
        
        // Kiểm tra kỹ các trường hợp kế hoạch không hợp lệ
        if (!currentPlan) {
            console.log("Không có kế hoạch, sử dụng mục tiêu mặc định:", DEFAULT_TARGET);
            return DEFAULT_TARGET;
        }
        
        if (!currentPlan.weeks || !Array.isArray(currentPlan.weeks) || currentPlan.weeks.length === 0) {
            console.log("Kế hoạch không có dữ liệu tuần, sử dụng mục tiêu mặc định:", DEFAULT_TARGET);
            return DEFAULT_TARGET;
        }
        
        // Nếu có kế hoạch nhưng không có ngày bắt đầu, lấy giá trị của tuần đầu tiên
        if (!currentPlan.startDate) {
            const firstWeekTarget = currentPlan.weeks[0]?.amount || DEFAULT_TARGET;
            console.log("Kế hoạch không có ngày bắt đầu, sử dụng mục tiêu tuần đầu:", firstWeekTarget);
            return firstWeekTarget;
        }
        
        try {
            const today = new Date();
            const startDate = new Date(currentPlan.startDate);
              // Kiểm tra ngày bắt đầu hợp lệ
            if (isNaN(startDate.getTime())) return currentPlan.weeks[0]?.amount || 22;
            
            // Tính số ngày kể từ ngày bắt đầu kế hoạch
            const daysDiff = Math.floor((today - startDate) / (1000 * 60 * 60 * 24));
            console.log(`Ngày bắt đầu: ${startDate}, Ngày hiện tại: ${today}, Số ngày: ${daysDiff}`);
            
            // Nếu chưa đến ngày bắt đầu, lấy mục tiêu của tuần đầu tiên
            if (daysDiff < 0) return currentPlan.weeks[0]?.amount || 22;
            
            // Tính tuần hiện tại (bắt đầu từ 1)
            const currentWeekNumber = Math.floor(daysDiff / 7) + 1;
              setCurrentWeek(currentWeekNumber);
            
            // Trường hợp đã qua hết kế hoạch, target = 0
            if (currentWeekNumber > currentPlan.weeks.length) {
                console.log("Đã qua hết kế hoạch, target = 0");
                return 0;
            }
            
            // Tìm tuần hiện tại trong plan
            // Đảm bảo chúng ta lấy tuần phù hợp bằng cách so sánh trực tiếp với số tuần
            let currentWeekPlan;
            
            // Nếu kế hoạch được thiết kế với tuần bắt đầu từ 1
            if (currentPlan.weeks[0].week === 1) {
                currentWeekPlan = currentPlan.weeks.find(w => w.week === currentWeekNumber);
                // Nếu không tìm thấy, lấy tuần cuối cùng của kế hoạch
                if (!currentWeekPlan && currentWeekNumber >= currentPlan.weeks.length) {
                    currentWeekPlan = currentPlan.weeks[currentPlan.weeks.length - 1];
                }
            } else {
                // Nếu kế hoạch có chỉ số khác, lấy theo thứ tự tuần
                const weekIndex = Math.min(currentWeekNumber - 1, currentPlan.weeks.length - 1);
                currentWeekPlan = currentPlan.weeks[weekIndex];
            }
            
            if (currentWeekPlan) {
                // Lấy target của tuần trước nếu có
                let prevWeekPlan;
                if (currentWeekNumber > 1) {
                    if (currentPlan.weeks[0].week === 1) {
                        prevWeekPlan = currentPlan.weeks.find(w => w.week === currentWeekNumber - 1);
                    } else {
                        const prevWeekIndex = Math.max(0, currentWeekNumber - 2);
                        prevWeekPlan = currentPlan.weeks[prevWeekIndex];
                    }
                }
                
                if (prevWeekPlan && prevWeekPlan.amount > currentWeekPlan.amount) {
                    const reduction = prevWeekPlan.amount - currentWeekPlan.amount;
                    const percentReduction = Math.round((reduction / prevWeekPlan.amount) * 100);
                    
                    // Lưu thông tin tiến độ so với tuần trước
                    setTodayData(prev => ({
                        ...prev,
                        weeklyProgress: {
                            reduction,
                            percentReduction,
                            prevAmount: prevWeekPlan.amount
                        }
                    }));
                }
                
                console.log(`Target cho tuần ${currentWeekNumber}: ${currentWeekPlan.amount} điếu/ngày`);
                return currentWeekPlan.amount;
            }
            
            // Fallback
            return currentPlan.weeks[0]?.amount || 12;
        } catch (error) {
            console.error("Lỗi khi tính toán mục tiêu hôm nay:", error);
            return 12; // Fallback an toàn nếu có lỗi
        }
    };

    // Tính streak days
    const calculateStreakDays = () => {
        let streak = 0;
        const today = new Date();
        
        for (let i = 0; i < 30; i++) {
            const checkDate = new Date(today);
            checkDate.setDate(checkDate.getDate() - i);
            const dateStr = checkDate.toISOString().split('T')[0];
            
            const savedData = localStorage.getItem(`checkin_${dateStr}`);
            if (savedData) {
                const data = JSON.parse(savedData);
                if (data.actualCigarettes <= data.targetCigarettes) {
                    streak++;
                } else {
                    break; // Streak bị phá
                }
            } else {
                break; // Không có dữ liệu
            }
        }
        
        setStreakDays(streak);
    };    // Cập nhật target khi component mount hoặc plan thay đổi
    useEffect(() => {
        // Tính toán mục tiêu dựa trên kế hoạch
        const target = calculateTodayTarget();
        console.log(`Mục tiêu theo kế hoạch: ${target} điếu`);
        
        // Cập nhật state với mục tiêu từ kế hoạch
        setTodayData(prev => ({
            ...prev,
            targetCigarettes: target
        }));
        
    // Hiển thị thông tin về kế hoạch đang dùng
        if (currentPlan) {
            console.log(`Đang sử dụng kế hoạch: ${currentPlan.name || 'Kế hoạch cai thuốc cá nhân'}`);
        }
        
        calculateStreakDays();
        
        // Kiểm tra và cập nhật nếu mục tiêu đã lưu không khớp
        resetIncorrectTarget();
    }, [currentPlan]);// Hiển thị thông tin kế hoạch khi component mount
    useEffect(() => {
        console.log("DailyCheckin nhận được kế hoạch:", currentPlan);
        if (currentPlan?.weeks && currentPlan.weeks.length > 0) {
            console.log("Tuần 1:", currentPlan.weeks[0]);
        }
    }, []);    // Kiểm tra xem hôm nay đã checkin chưa
    useEffect(() => {
        const today = new Date().toISOString().split('T')[0];
        const savedData = localStorage.getItem(`checkin_${today}`);
        if (savedData) {
            const data = JSON.parse(savedData);
            setTodayData(data);
            setIsSubmitted(true);
        }
    }, []);    const handleInputChange = (field, value) => {
        setTodayData(prev => ({
            ...prev,
            [field]: value
        }));
    };    const handleSubmit = () => {
        // Đảm bảo dữ liệu được lưu đúng định dạng
        const todayDate = new Date().toISOString().split('T')[0];
        console.log("CHECKIN DEBUG: Today's date for storage:", todayDate);
        
        const dataToSave = {
            ...todayData,
            date: todayDate,  // Đảm bảo ngày là hôm nay
            targetCigarettes: todayData.targetCigarettes,  // Đảm bảo mục tiêu được lưu đúng
            actualCigarettes: parseInt(todayData.actualCigarettes, 10),  // Đảm bảo số điếu là số nguyên
            savedAt: new Date().toISOString() // Lưu thời gian lưu chính xác
        };
          // Lưu dữ liệu vào localStorage
        const isUpdate = localStorage.getItem(`checkin_${todayDate}`) !== null;
        localStorage.setItem(`checkin_${todayDate}`, JSON.stringify(dataToSave));
        
        console.log(`Đã lưu dữ liệu checkin cho ngày ${todayDate}:`, dataToSave);

        // Cập nhật streak bằng cách tính toán lại từ dữ liệu đã lưu
        calculateStreakDays();

        setIsSubmitted(true);

        // Callback để cập nhật component cha
        if (onProgressUpdate) {            const updateData = {
                week: currentWeek,
                date: todayDate,
                actualCigarettes: parseInt(todayData.actualCigarettes, 10),
                targetCigarettes: todayData.targetCigarettes,
                achieved: parseInt(todayData.actualCigarettes, 10) <= todayData.targetCigarettes
            };
              console.log('Cập nhật tiến trình:', updateData);
            console.log('DEBUG DAILY: Dữ liệu checkin đã được lưu, dòng xanh lá sẽ cập nhật với giá trị:', updateData.actualCigarettes);
            onProgressUpdate(updateData);
        }

        // Hiển thị thông báo toast thay vì alert
        if (isUpdate) {
            setToast({ 
                show: true, 
                message: '✅ Đã cập nhật thông tin checkin hôm nay!', 
                type: 'success' 
            });
        } else {
            setToast({ 
                show: true, 
                message: '✅ Đã lưu thông tin checkin hôm nay!', 
                type: 'success' 
            });
        }
        
        // Auto hide toast sau 5 giây
        setTimeout(() => {
            setToast(prev => ({ ...prev, show: false }));
        }, 5000);
    };const handleEdit = () => {
        setIsSubmitted(false);
        // Đảm bảo input field được kích hoạt
        setTimeout(() => {
            const inputField = document.querySelector('.actual-input');
            if (inputField) {
                inputField.disabled = false;
                inputField.focus();
            }
        }, 100);
        
        // Hiển thị toast thông báo thay vì alert
        setToast({ 
            show: true, 
            message: '📝 Bạn có thể cập nhật số điếu thuốc đã hút hôm nay', 
            type: 'info' 
        });
        
        // Auto hide toast sau 4 giây
        setTimeout(() => {
            setToast(prev => ({ ...prev, show: false }));
        }, 4000);
    };const isTargetAchieved = todayData.actualCigarettes <= todayData.targetCigarettes;    // Hàm đóng toast notification
    const closeToast = () => {
        // Thêm class để animation chạy trước khi ẩn
        const toastElement = document.querySelector('.toast-notification');
        if (toastElement) {
            toastElement.classList.add('toast-exit');
            setTimeout(() => {
                setToast({ ...toast, show: false });
            }, 300); // Đợi animation kết thúc
        } else {
            setToast({ ...toast, show: false });
        }
    };    // Đồng bộ mục tiêu trong dữ liệu đã lưu với mục tiêu từ kế hoạch hiện tại
    const resetIncorrectTarget = () => {
        const today = new Date().toISOString().split('T')[0];
        const savedData = localStorage.getItem(`checkin_${today}`);
        
        if (savedData) {
            try {
                const data = JSON.parse(savedData);
                // Lấy mục tiêu từ kế hoạch hiện tại
                const targetFromPlan = calculateTodayTarget();
                
                // Nếu mục tiêu đã lưu không khớp với mục tiêu từ kế hoạch
                if (data.targetCigarettes !== targetFromPlan) {
                    console.log(`Phát hiện mục tiêu không khớp với kế hoạch: 
                    - Mục tiêu đã lưu: ${data.targetCigarettes} điếu
                    - Mục tiêu theo kế hoạch: ${targetFromPlan} điếu`);
                    console.log("Đồng bộ lại mục tiêu theo kế hoạch hiện tại");
                    
                    // Cập nhật dữ liệu với mục tiêu từ kế hoạch
                    const updatedData = {
                        ...data,
                        targetCigarettes: targetFromPlan
                    };
                    localStorage.setItem(`checkin_${today}`, JSON.stringify(updatedData));
                    
                    // Cập nhật state
                    setTodayData(updatedData);
                    setIsSubmitted(true);
                }
            } catch (error) {
                console.error("Lỗi khi kiểm tra mục tiêu:", error);
            }
        }
    };
    
    return (
        <div className="daily-checkin">
            <div className="checkin-header">
                <div className="header-content">
                    <FaCalendarCheck className="header-icon" />
                    <div className="header-text">
                        <h2>Checkin hôm nay</h2>
                        <p>Ghi nhận tiến trình cai thuốc ngày {new Date().toLocaleDateString('vi-VN')}</p>
                    </div>
                </div>

                {/* Streak counter */}
                <div className="streak-badge">
                    <span className="streak-number">{streakDays}</span>
                    <span className="streak-text">ngày liên tiếp</span>
                </div>
            </div>
            
            {/* Toast Notification */}
            {toast.show && (
                <div className={`toast-notification ${toast.type}`}>
                    <span className="toast-message">{toast.message}</span>
                    <button className="toast-close" onClick={closeToast}>&times;</button>
                </div>
            )}

            <div className="checkin-content">
                {/* Target vs Actual */}
                <div className="progress-section">                    <div className="target-card">
                        <h3>Mục tiêu hôm nay</h3>
                        <div className="target-amount">
                            {todayData.targetCigarettes !== null ? `${todayData.targetCigarettes} điếu` : 'Đang tải...'}
                        </div>
                        <p>Tuần {currentWeek} - Theo kế hoạch đã lập</p>
                        
                        {todayData.weeklyProgress && (
                            <div className="progress-badge">
                                <span>-{todayData.weeklyProgress.reduction} điếu ({todayData.weeklyProgress.percentReduction}%)</span>
                                <p>so với tuần trước</p>
                            </div>
                        )}
                    </div>

                    <div className="vs-divider">VS</div>                    <div className="actual-card">
                        <h3>Thực tế đã hút</h3>
                        <div className="number-input-container">
                            <button 
                                type="button" 
                                className="number-decrement" 
                                onClick={() => !isSubmitted && handleInputChange('actualCigarettes', Math.max(0, todayData.actualCigarettes - 1))}
                                disabled={isSubmitted || todayData.actualCigarettes <= 0}
                            >
                                -
                            </button>
                            <input
                                type="number"
                                min="0"
                                max="50"
                                value={todayData.actualCigarettes}
                                onChange={(e) => handleInputChange('actualCigarettes', parseInt(e.target.value) || 0)}
                                className="actual-input"
                                disabled={isSubmitted}
                                placeholder="0"
                            />
                            <button 
                                type="button" 
                                className="number-increment" 
                                onClick={() => !isSubmitted && handleInputChange('actualCigarettes', Math.min(50, todayData.actualCigarettes + 1))}
                                disabled={isSubmitted || todayData.actualCigarettes >= 50}
                            >
                                +
                            </button>
                        </div>
                        <p className={`result ${isTargetAchieved ? 'success' : 'warning'}`}>
                            {isTargetAchieved ? '✅ Đạt mục tiêu!' : '⚠️ Vượt mục tiêu'}
                        </p>
                    </div></div>                {/* Action Buttons */}
                <div className="checkin-actions">
                    {!isSubmitted ? (
                        <button
                            onClick={handleSubmit}
                            className="submit-btn"
                        >
                            <FaSave className="btn-icon" />
                            Lưu checkin hôm nay
                        </button>
                    ) : (
                        <button
                            onClick={handleEdit}
                            className="edit-btn"
                        >
                            <FaSave className="btn-icon" />
                            Cập nhật số điếu hôm nay
                        </button>
                    )}
                </div>{/* Summary Card */}
                {isSubmitted && (
                    <div className="checkin-summary">
                        <h3>Tóm tắt ngày hôm nay</h3>
                        <div className="summary-grid">
                            <div className="summary-item">
                                <span className="label">Mục tiêu:</span>
                                <span className="value">{todayData.targetCigarettes} điếu</span>
                            </div>
                            <div className="summary-item">
                                <span className="label">Thực tế:</span>
                                <span className="value">{todayData.actualCigarettes} điếu</span>
                            </div>
                            <div className="summary-item">
                                <span className="label">Kết quả:</span>
                                <span className={`value ${isTargetAchieved ? 'success' : 'warning'}`}>
                                    {isTargetAchieved ? 'Đạt mục tiêu' : 'Chưa đạt'}
                                </span>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DailyCheckin;
