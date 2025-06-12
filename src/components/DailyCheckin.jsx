import React, { useState, useEffect } from 'react';
import { FaCalendarCheck, FaSave, FaCalendarAlt, FaArrowLeft } from 'react-icons/fa';
import CalendarPicker from './CalendarPicker';

const DailyCheckin = ({ onProgressUpdate, currentPlan }) => {
    const [showCalendar, setShowCalendar] = useState(false);
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [todayData, setTodayData] = useState({
        date: new Date().toISOString().split('T')[0],
        targetCigarettes: 12, // Sẽ được tính từ kế hoạch
        actualCigarettes: 0,
        notes: ''
    });

    const [isSubmitted, setIsSubmitted] = useState(false);
    const [currentWeek, setCurrentWeek] = useState(1); // Tuần hiện tại
    const [streakDays, setStreakDays] = useState(0); // Số ngày liên tiếp đạt mục tiêu    // Tính target cigarettes dựa trên kế hoạch và ngày được chọn
    const calculateTargetForDate = (dateStr) => {
        if (!currentPlan) return 12;

        const targetDate = new Date(dateStr);
        const startDate = new Date(currentPlan.startDate);
        const daysDiff = Math.floor((targetDate - startDate) / (1000 * 60 * 60 * 24));
        const currentWeekNumber = Math.floor(daysDiff / 7) + 1;

        // Tìm tuần tương ứng trong plan
        const currentWeekPlan = currentPlan.weeks.find(w => w.week === currentWeekNumber);
        if (currentWeekPlan) {
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
    };    // Load dữ liệu cho ngày được chọn
    const loadDataForDate = (dateStr) => {
        const target = calculateTargetForDate(dateStr);
        const savedData = localStorage.getItem(`checkin_${dateStr}`);

        if (savedData) {
            const data = JSON.parse(savedData);
            setTodayData({
                ...data,
                targetCigarettes: target
            });
            setIsSubmitted(true);
        } else {
            setTodayData({
                date: dateStr,
                targetCigarettes: target,
                actualCigarettes: 0,
                notes: ''
            });
            setIsSubmitted(false);
        }

        // Cập nhật current week
        const targetDate = new Date(dateStr);
        const startDate = new Date(currentPlan?.startDate || new Date());
        const daysDiff = Math.floor((targetDate - startDate) / (1000 * 60 * 60 * 24));
        const weekNumber = Math.floor(daysDiff / 7) + 1;
        setCurrentWeek(weekNumber);
    };

    // Xử lý chọn ngày từ calendar
    const handleDateSelect = (dateStr) => {
        setSelectedDate(dateStr);
        loadDataForDate(dateStr);
        setShowCalendar(false);
    };

    // Cập nhật target khi component mount hoặc plan thay đổi
    useEffect(() => {
        if (currentPlan) {
            loadDataForDate(selectedDate);
            calculateStreakDays();
        }
    }, [currentPlan, selectedDate]);// Kiểm tra xem hôm nay đã checkin chưa
    useEffect(() => {
        const today = new Date().toISOString().split('T')[0];
        const savedData = localStorage.getItem(`checkin_${today}`);
        if (savedData) {
            const data = JSON.parse(savedData);
            setTodayData(data);
            setIsSubmitted(true);
        }
    }, []); const handleInputChange = (field, value) => {
        setTodayData(prev => ({
            ...prev,
            [field]: value
        }));
    }; const handleSubmit = () => {
        // Lưu dữ liệu vào localStorage
        localStorage.setItem(`checkin_${selectedDate}`, JSON.stringify(todayData));

        // Cập nhật streak nếu là ngày hôm nay
        if (selectedDate === new Date().toISOString().split('T')[0]) {
            const achieved = todayData.actualCigarettes <= todayData.targetCigarettes;
            if (achieved) {
                setStreakDays(prev => prev + 1);
            } else {
                setStreakDays(0);
            }
        }

        setIsSubmitted(true);

        // Callback để cập nhật component cha
        if (onProgressUpdate) {
            onProgressUpdate({
                week: currentWeek,
                amount: todayData.actualCigarettes,
                achieved: todayData.actualCigarettes <= todayData.targetCigarettes,
                date: selectedDate
            });
        }

        // Hiển thị thông báo thành công
        const isToday = selectedDate === new Date().toISOString().split('T')[0];
        alert(`✅ Đã lưu thông tin checkin ${isToday ? 'hôm nay' : `ngày ${new Date(selectedDate).toLocaleDateString('vi-VN')}`}!`);
    };

    const handleEdit = () => {
        setIsSubmitted(false);
    }; const isTargetAchieved = todayData.actualCigarettes <= todayData.targetCigarettes;
    const isToday = selectedDate === new Date().toISOString().split('T')[0]; if (showCalendar) {
        return (
            <div className="daily-checkin">
                <div className="calendar-header">
                    <button
                        className="back-button"
                        onClick={() => setShowCalendar(false)}
                    >
                        <FaArrowLeft /> Quay lại
                    </button>
                    <h2>Chọn ngày để check-in</h2>
                </div>
                <CalendarPicker
                    onDateSelect={handleDateSelect}
                    selectedDate={selectedDate}
                    currentPlan={currentPlan}
                />
            </div>
        );
    }

    return (
        <div className="daily-checkin">
            <div className="checkin-header">
                <div className="header-content">
                    <FaCalendarCheck className="header-icon" />                    <div className="header-text">
                        <h2>{isToday ? 'Checkin hôm nay' : 'Checkin ngày đã chọn'}</h2>
                        <p>Ghi nhận tiến trình cai thuốc ngày {new Date(selectedDate).toLocaleDateString('vi-VN')}</p>
                        {currentPlan && (
                            <p className="plan-week-info">
                                Tuần {currentWeek} - Mục tiêu: {todayData.targetCigarettes} điếu/ngày
                            </p>
                        )}
                    </div>
                </div>

                <div className="header-actions">
                    {/* Calendar button */}
                    <button
                        className="calendar-button"
                        onClick={() => setShowCalendar(true)}
                        title="Chọn ngày khác"
                    >
                        <FaCalendarAlt />
                    </button>

                    {/* Streak counter */}
                    <div className="streak-badge">
                        <span className="streak-number">{streakDays}</span>
                        <span className="streak-text">ngày liên tiếp</span>
                    </div>
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
                            {isToday ? 'Lưu checkin hôm nay' : `Lưu checkin ngày ${new Date(selectedDate).toLocaleDateString('vi-VN')}`}
                        </button>
                    )}

                    {isSubmitted && (
                        <button
                            onClick={handleEdit}
                            className="edit-btn"
                        >
                            Chỉnh sửa
                        </button>
                    )}
                </div>                {/* Summary Card */}
                {isSubmitted && (
                    <div className="checkin-summary">
                        <h3>Tóm tắt ngày {new Date(selectedDate).toLocaleDateString('vi-VN')}</h3>
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
                            <div className="summary-item">
                                <span className="label">Tuần:</span>
                                <span className="value">Tuần {currentWeek}</span>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DailyCheckin;
