import React, { useState, useEffect } from 'react';
import { FaCalendarCheck, FaSave } from 'react-icons/fa';

const DailyCheckin = ({ onProgressUpdate, currentPlan }) => {
    const [todayData, setTodayData] = useState({
        date: new Date().toISOString().split('T')[0],
        targetCigarettes: 12, // Sẽ được tính từ kế hoạch
        actualCigarettes: 0,
        notes: ''
    });

    const [isSubmitted, setIsSubmitted] = useState(false);
    const [currentWeek, setCurrentWeek] = useState(1); // Tuần hiện tại
    const [streakDays, setStreakDays] = useState(0); // Số ngày liên tiếp đạt mục tiêu

    // Tính target cigarettes dựa trên kế hoạch và ngày hiện tại
    const calculateTodayTarget = () => {
        if (!currentPlan) return 12;
        
        const today = new Date();
        const startDate = new Date(currentPlan.startDate);
        const daysDiff = Math.floor((today - startDate) / (1000 * 60 * 60 * 24));
        const currentWeekNumber = Math.floor(daysDiff / 7) + 1;
        
        // Tìm tuần hiện tại trong plan
        const currentWeekPlan = currentPlan.weeks.find(w => w.week === currentWeekNumber);
        if (currentWeekPlan) {
            setCurrentWeek(currentWeekNumber);
            return currentWeekPlan.amount;
        }
        
        // Nếu đã qua hết kế hoạch, target = 0
        if (currentWeekNumber > currentPlan.weeks.length) {
            return 0;
        }
        
        // Fallback
        return currentPlan.weeks[0]?.amount || 12;
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
    };

    // Cập nhật target khi component mount hoặc plan thay đổi
    useEffect(() => {
        const target = calculateTodayTarget();
        setTodayData(prev => ({
            ...prev,
            targetCigarettes: target
        }));
        calculateStreakDays();
    }, [currentPlan]);    // Kiểm tra xem hôm nay đã checkin chưa
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
        // Lưu dữ liệu vào localStorage
        const today = new Date().toISOString().split('T')[0];
        localStorage.setItem(`checkin_${today}`, JSON.stringify(todayData));

        // Cập nhật streak
        const achieved = todayData.actualCigarettes <= todayData.targetCigarettes;
        if (achieved) {
            setStreakDays(prev => prev + 1);
        } else {
            setStreakDays(0);
        }

        setIsSubmitted(true);

        // Callback để cập nhật component cha
        if (onProgressUpdate) {
            onProgressUpdate({
                week: currentWeek,
                amount: todayData.actualCigarettes,
                achieved: achieved
            });
        }

        // Hiển thị thông báo thành công
        alert('✅ Đã lưu thông tin checkin hôm nay!');
    };

    const handleEdit = () => {
        setIsSubmitted(false);
    };    const isTargetAchieved = todayData.actualCigarettes <= todayData.targetCigarettes;

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

            <div className="checkin-content">
                {/* Target vs Actual */}
                <div className="progress-section">
                    <div className="target-card">
                        <h3>Mục tiêu hôm nay</h3>
                        <div className="target-amount">{todayData.targetCigarettes} điếu</div>
                        <p>Tuần {currentWeek} - Kế hoạch của bạn</p>
                    </div>

                    <div className="vs-divider">VS</div>

                    <div className="actual-card">
                        <h3>Thực tế đã hút</h3>
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
                        <p className={`result ${isTargetAchieved ? 'success' : 'warning'}`}>
                            {isTargetAchieved ? '✅ Đạt mục tiêu!' : '⚠️ Vượt mục tiêu'}
                        </p>
                    </div>                </div>                {/* Action Buttons */}
                <div className="checkin-actions">
                    {!isSubmitted && (
                        <button
                            onClick={handleSubmit}
                            className="submit-btn"
                        >
                            <FaSave className="btn-icon" />
                            Lưu checkin hôm nay
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
