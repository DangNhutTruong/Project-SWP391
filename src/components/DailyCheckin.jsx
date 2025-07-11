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
    const [toast, setToast] = useState({ show: false, message: '', type: 'success' }); // Thông báo dạng toast    
    const [isLoading, setIsLoading] = useState(true); // Trạng thái loading data
    
    // Hàm tạo key cho localStorage dựa trên userId - chỉ dùng cho fallback
    const getStorageKey = (date) => {
        // Lấy userId từ localStorage nếu có
        const userId = localStorage.getItem('userId') || localStorage.getItem('nosmoke_user_id') || '1';
        return `checkin_${userId}_${date}`;
    };
    
    // Get API base URL with fallback to ports 5000 or 5001
    const getApiBaseUrl = async () => {
        const baseUrls = ['http://localhost:5000', 'http://localhost:5001'];
        
        for (const url of baseUrls) {
            try {
                const healthCheck = await fetch(`${url}/api/health`, { 
                    method: 'GET',
                    headers: { 'Content-Type': 'application/json' },
                    timeout: 1000
                });
                if (healthCheck.ok) {
                    console.log(`Backend available at: ${url}`);
                    return url;
                }
            } catch (error) {
                console.log(`Backend not available at ${url}`);
            }
        }
        return baseUrls[0]; // Default fallback
    };
    
    // Tính target cigarettes dựa trên kế hoạch và ngày hiện tại
    const calculateTodayTarget = () => {
        // Kiểm tra kỹ các trường hợp null/undefined
        if (!currentPlan) return 12;
        if (!currentPlan.weeks || !Array.isArray(currentPlan.weeks) || currentPlan.weeks.length === 0) return 12;
        if (!currentPlan.startDate) return currentPlan.weeks[0]?.amount || 12;
        
        try {
            const today = new Date();
            const startDate = new Date(currentPlan.startDate);
            
            // Kiểm tra ngày bắt đầu hợp lệ
            if (isNaN(startDate.getTime())) return currentPlan.weeks[0]?.amount || 12;
            
            const daysDiff = Math.floor((today - startDate) / (1000 * 60 * 60 * 24));
            const currentWeekNumber = Math.floor(daysDiff / 7) + 1;
            
            setCurrentWeek(currentWeekNumber);
            
            // Tìm tuần hiện tại trong plan
            const currentWeekPlan = currentPlan.weeks.find(w => w.week === currentWeekNumber);
            if (currentWeekPlan) {
                // Lấy target của tuần trước nếu có
                const prevWeekPlan = currentPlan.weeks.find(w => w.week === currentWeekNumber - 1);
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
                
                return currentWeekPlan.amount;
            }
            
            // Nếu đã qua hết kế hoạch, target = 0
            if (currentWeekNumber > currentPlan.weeks.length) {
                return 0;
            }
            
            // Fallback
            return currentPlan.weeks[0]?.amount || 12;
        } catch (error) {
            console.error("Lỗi khi tính toán mục tiêu hôm nay:", error);
            return 12; // Fallback an toàn nếu có lỗi
        }
    };

    // Tính streak days - ưu tiên lấy từ API
    const calculateStreakDays = async () => {
        try {
            // Thử lấy streak từ API trước
            const apiUrl = await getApiBaseUrl();
            const userId = localStorage.getItem('userId') || '1';
            const response = await fetch(`${apiUrl}/api/progress/${userId}/stats`);
            
            if (response.ok) {
                const stats = await response.json();
                if (stats.current_streak !== undefined) {
                    console.log(`Lấy streak từ API: ${stats.current_streak} ngày`);
                    setStreakDays(stats.current_streak);
                    return;
                }
            }
            
            // Fallback: Tính streak từ localStorage nếu không lấy được từ API
            console.log('Không lấy được streak từ API, tính từ localStorage');
            let streak = 0;
            const today = new Date();
            
            for (let i = 0; i < 30; i++) {
                const checkDate = new Date(today);
                checkDate.setDate(checkDate.getDate() - i);
                const dateStr = checkDate.toISOString().split('T')[0];
                
                const savedData = localStorage.getItem(getStorageKey(dateStr));
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
        } catch (error) {
            console.error('Lỗi khi tính streak days:', error);
            setStreakDays(0);
        }
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
        const fetchData = async () => {
            setIsLoading(true);
            const today = new Date().toISOString().split('T')[0];
            const storageKey = getStorageKey(today);
            
            // Kiểm tra dữ liệu từ API trước
            try {
                const apiUrl = await getApiBaseUrl();
                const response = await fetch(`${apiUrl}/api/progress/${localStorage.getItem('userId') || '1'}/${today}`);
                
                if (response.ok) {
                    const data = await response.json();
                    setTodayData(data);
                    setIsSubmitted(true);
                    setIsLoading(false);
                    return;
                } else {
                    console.error('Error fetching from API:', response.status, await response.text());
                }
            } catch (error) {
                console.error('Error fetching from API:', error);
            }
            
            // Nếu không có dữ liệu từ API, kiểm tra localStorage
            const savedData = localStorage.getItem(storageKey);
            if (savedData) {
                const data = JSON.parse(savedData);
                setTodayData(data);
                setIsSubmitted(true);
            }
            setIsLoading(false);
        };
        
        fetchData();
    }, []);    const handleInputChange = (field, value) => {
        setTodayData(prev => ({
            ...prev,
            [field]: value
        }));
    };    const handleSubmit = async () => {
        // Lấy thông tin hiện tại
        const today = new Date().toISOString().split('T')[0];
        const storageKey = getStorageKey(today);
        const isUpdate = localStorage.getItem(storageKey) !== null || todayData.isUpdating === true;
        
        // Ưu tiên lưu vào database, nhưng vẫn lưu vào localStorage làm backup
        // trong trường hợp offline hoặc API không khả dụng
        localStorage.setItem(storageKey, JSON.stringify({
            ...todayData,
            isUpdating: undefined, // Loại bỏ flag isUpdating khi lưu
            userId: localStorage.getItem('userId') || localStorage.getItem('nosmoke_user_id') || '1', // Lưu userId để dễ truy xuất
            savedToAPI: false // Đánh dấu chưa lưu thành công lên API
        }));

        // Cập nhật streak bằng cách tính toán lại từ dữ liệu đã lưu
        // thay vì tăng giá trị hiện tại
        calculateStreakDays();

        // Lưu dữ liệu xuống database
        try {
            // Đảm bảo userId là số (integer)
            let userId = localStorage.getItem('userId') || '1';
            // Chuyển userId thành số nguyên
            userId = parseInt(userId, 10);
            if (isNaN(userId)) userId = 1; // Fallback nếu không phải là số
            
            // Tính toán tiền tiết kiệm được và cigarettes avoided
            const cigarettesAvoided = Math.max(0, todayData.targetCigarettes - todayData.actualCigarettes);
            
            // Đảm bảo các giá trị từ localStorage được chuyển đổi sang số và có giá trị mặc định
            let packPrice = localStorage.getItem('packPrice');
            const validPackPrice = parseFloat(packPrice) || 50000; // Chuyển đổi sang số và fallback nếu không hợp lệ
            
            let cigarettesPerPack = localStorage.getItem('cigarettesPerPack');
            const validCigarettesPerPack = parseInt(cigarettesPerPack) || 20; // Chuyển đổi sang số và fallback nếu không hợp lệ
            
            // Tính tiền tiết kiệm
            const moneySaved = cigarettesAvoided * (validPackPrice / validCigarettesPerPack);
            
            console.log(`Tính tiết kiệm: ${cigarettesAvoided} điếu × (${validPackPrice}đ ÷ ${validCigarettesPerPack} điếu/gói) = ${moneySaved}đ`);
            
            // Gọi API lưu dữ liệu xuống database
            const apiUrl = await getApiBaseUrl();
            console.log(`Gửi dữ liệu tới API: ${apiUrl}/api/progress/${userId}`);
            console.log(`Hành động: ${isUpdate ? 'Cập nhật' : 'Tạo mới'} dữ liệu checkin`);
            
            const dataToSend = {
                // Đảm bảo tool_type có giá trị là một trong những giá trị được phép trong database
                tool_type: 'quit_smoking_plan', // Giá trị được phép: 'quit_smoking_plan','cost_calculator','smoking_effects','quit_vaping_plan','vaping_benefits','vaping_effects'
                days_clean: todayData.actualCigarettes === 0 ? 1 : 0, // Đếm là clean day nếu không hút điếu nào
                money_saved: moneySaved,
                cigarettes_avoided: cigarettesAvoided,
                // Đảm bảo progress_percentage có giá trị
                progress_percentage: Math.min(100, Math.max(0, Math.round((1 - (todayData.actualCigarettes / todayData.targetCigarettes)) * 100))),
                // Thêm health_score để thỏa mãn ràng buộc (phải từ 1-100)
                health_score: Math.max(1, Math.min(100, 
                    todayData.actualCigarettes === 0 ? 100 : 
                    Math.floor(100 - (todayData.actualCigarettes / todayData.targetCigarettes) * 100)
                )),
                progress_data: {
                    ...todayData,
                    isUpdating: undefined, // Loại bỏ flag isUpdating khi gửi dữ liệu
                    packPrice: validPackPrice,
                    cigarettesPerPack: validCigarettesPerPack,
                    moneySaved: moneySaved,
                    cigarettesAvoided: cigarettesAvoided,
                    date: today // Đảm bảo ngày luôn đúng
                },
                notes: todayData.notes || (isUpdate ? 'Cập nhật dữ liệu checkin' : 'Daily check-in')
            };
            
            console.log('Dữ liệu gửi đi:', JSON.stringify(dataToSend, null, 2));
            
            const response = await fetch(`${apiUrl}/api/progress/${userId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(dataToSend)
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error('Server response error:', response.status, errorText);
                throw new Error(`Failed to save data: ${response.status} ${errorText}`);
            }

            const result = await response.json();
            if (isUpdate) {
                console.log('✅ Đã cập nhật dữ liệu trong database:', result);
            } else {
                console.log('✅ Đã lưu dữ liệu mới vào database:', result);
            }
            
            // Cập nhật trạng thái trong localStorage để đánh dấu đã lưu thành công vào API
            const localData = JSON.parse(localStorage.getItem(storageKey) || '{}');
            localStorage.setItem(storageKey, JSON.stringify({
                ...localData,
                savedToAPI: true,
                lastSavedToAPI: new Date().toISOString()
            }));
            
            // Kiểm tra dữ liệu đã lưu
            try {
                const verifyResponse = await fetch(`${apiUrl}/api/progress/${userId}`);
                if (verifyResponse.ok) {
                    const progressData = await verifyResponse.json();
                    console.log(`✅ Kiểm tra: Có ${progressData.length} bản ghi trong database`);
                }
            } catch (verifyError) {
                console.log('Không thể kiểm tra dữ liệu:', verifyError);
            }
        } catch (error) {
            console.error('Error saving to database:', error);
            // Vẫn tiếp tục xử lý UI ngay cả khi lưu vào database thất bại
        }

        setIsSubmitted(true);

        // Callback để cập nhật component cha
        if (onProgressUpdate) {
            const updateData = {
                date: today,
                week: currentWeek,
                amount: todayData.actualCigarettes,
                targetAmount: todayData.targetCigarettes,
                achieved: todayData.actualCigarettes <= todayData.targetCigarettes,
                moneySaved: moneySaved,
                cigarettesAvoided: cigarettesAvoided,
                isUpdate: isUpdate,
                health_score: Math.max(1, Math.min(100, 
                    todayData.actualCigarettes === 0 ? 100 : 
                    Math.floor(100 - (todayData.actualCigarettes / todayData.targetCigarettes) * 100)
                )),
                progress_percentage: Math.min(100, Math.max(0, Math.round((1 - (todayData.actualCigarettes / todayData.targetCigarettes)) * 100)))
            };
            
            console.log('Gửi dữ liệu cập nhật cho component cha:', updateData);
            console.log(`THỐNG KÊ CHECKIN: Tiết kiệm ${moneySaved.toLocaleString()}đ, tránh được ${cigarettesAvoided} điếu thuốc`);
            onProgressUpdate(updateData);
        }

        // Hiển thị thông báo toast thay vì alert
        if (isUpdate) {
            setToast({ 
                show: true, 
                message: '✅ Đã cập nhật dữ liệu checkin trong database!', 
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
        // Đánh dấu đây là cập nhật, không phải tạo mới
        setTodayData(prev => ({
            ...prev,
            isUpdating: true // Thêm flag để biết đây là cập nhật
        }));
        
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
    };
    
    if (isLoading) {
        return (
            <div className="daily-checkin loading">
                <p>Đang tải dữ liệu...</p>
            </div>
        );
    }
    
    return (
        <div className="daily-checkin">
            <div className="checkin-header">                <div className="header-content">
                    <div className="header-icon">
                        <FaCalendarCheck />
                    </div>
                    <div className="header-text">
                        <h2>Ghi nhận hôm nay</h2>
                        <p>Ghi nhận tiến trình cai thuốc ngày {new Date().toLocaleDateString('vi-VN')}</p>
                    </div>
                </div>

                {/* Streak counter */}                <div className="streak-badge">
                    <span className="streak-number">{streakDays}</span>
                    <span className="streak-text">ngày liên tiếp</span>
                </div>
            </div>
            
            <div className="checkin-separator"></div>
            
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
                        <div className="target-amount">{todayData.targetCigarettes} điếu</div>
                        <p>Tuần {currentWeek} - Kế hoạch của bạn</p>
                        
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
                            {todayData.isUpdating ? "Cập nhật checkin hôm nay" : "Lưu checkin hôm nay"}
                        </button>
                    ) : (
                        <button
                            onClick={handleEdit}
                            className="edit-btn"
                        >
                            <FaSave className="btn-icon" />
                            Cập nhật số điếu hôm nay
                        </button>
                    )}                </div>
                {/* Summary Card đã được xóa vì dư thừa */}
            </div>
        </div>
    );
};

export default DailyCheckin;
