import React, { useState, useEffect } from 'react';
import { Chart as ChartJS } from 'chart.js/auto';
import { Line } from 'react-chartjs-2';
import '../styles/QuitProgressChart.css';

const QuitProgressChart = ({
    userPlan = null,
    actualProgress = [],
    timeFilter = '30 ngày',
    height = 300
}) => {
    // Xóa console.log không cần thiết trong production
    // console.log("🚀 QuitProgressChart KHỞI TẠO với props:", { userPlan, actualProgress, timeFilter, height });
    
    const [chartData, setChartData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    // Tạo dữ liệu mẫu nếu không có kế hoạch thực tế
    const generateSampleData = () => {
        const samplePlan = {
            weeks: [
                { week: 1, amount: 20, phase: "Thích nghi" },
                { week: 2, amount: 16, phase: "Thích nghi" },
                { week: 3, amount: 12, phase: "Tăng tốc" },
                { week: 4, amount: 8, phase: "Tăng tốc" },
                { week: 5, amount: 5, phase: "Hoàn thiện" },
                { week: 6, amount: 2, phase: "Hoàn thiện" },
                { week: 7, amount: 0, phase: "Hoàn thành" }
            ],
            name: "Kế hoạch 6 tuần",
            startDate: "2024-01-01"
        };

        // Dữ liệu thực tế mô phỏng (theo ngày)
        const sampleActual = [
            { date: '2024-01-01', actualCigarettes: 18, targetCigarettes: 20, mood: "good" },
            { date: '2024-01-02', actualCigarettes: 19, targetCigarettes: 20, mood: "challenging" },
            { date: '2024-01-03', actualCigarettes: 17, targetCigarettes: 20, mood: "good" },        ];

        return { plan: samplePlan, actual: sampleActual };
    };
    
    // Tạo dữ liệu kế hoạch theo ngày dựa trên tuần
    const generateDailyPlanData = (plan) => {
        const dailyPlan = [];
        
        // Check if plan exists with proper structure
        if (!plan || !plan.weeks || !Array.isArray(plan.weeks) || plan.weeks.length === 0) {
            console.warn("Invalid or missing plan data, using empty array");
            return dailyPlan;
        }
        
        // Ensure we have a valid start date
        let startDate;
        try {
            startDate = new Date(plan.startDate);
            // Check if startDate is a valid date
            if (isNaN(startDate.getTime())) {
                console.warn("Invalid plan startDate, using current date");
                startDate = new Date(); // Fallback to current date
            }
        } catch (e) {
            console.warn("Error parsing startDate, using current date", e);
            startDate = new Date(); // Fallback to current date
        }
        
        // Process each week
        plan.weeks.forEach((week, weekIndex) => {
            // Ensure week has required properties
            const weekAmount = typeof week.amount === 'number' ? week.amount : 
                               typeof week.amount === 'string' ? parseFloat(week.amount) : 0;
            
            const weekNumber = week.week || (weekIndex + 1);
            const weekPhase = week.phase || 'Mặc định';
            
            // Mỗi tuần có 7 ngày
            for (let day = 0; day < 7; day++) {
                const date = new Date(startDate);
                date.setDate(date.getDate() + (weekIndex * 7) + day);
                
                dailyPlan.push({
                    date: date.toISOString().split('T')[0],
                    targetCigarettes: isNaN(weekAmount) ? 0 : weekAmount,
                    week: weekNumber,
                    phase: weekPhase
                });
            }
        });
          
        return dailyPlan;
    };
      // Filter data based on timeFilter
    const filterDataByTime = (data, filter) => {
        const today = new Date();
        const todayStr = today.toISOString().split('T')[0];
        let daysToShow = 30;
        
        console.log(`FILTER DEBUG: Ngày hôm nay là ${todayStr}`);
        switch (filter) {
            case '7 ngày':
                daysToShow = 7;
                break;
            case '14 ngày':
                daysToShow = 14;
                break;
            case '30 ngày':
                daysToShow = 30;
                break;
            case 'Tất cả':
                return data;
            default:
                daysToShow = 30;
        }
        
        const cutoffDate = new Date(today);
        cutoffDate.setDate(cutoffDate.getDate() - daysToShow);
        
        console.log(`Lọc dữ liệu: Hiển thị ${daysToShow} ngày gần nhất, từ ${cutoffDate.toLocaleDateString()}`);
        
        // Log input data before filtering
        console.log("FILTER DEBUG: Input data length:", data?.length);
        if (data?.length > 0) {
            console.log("FILTER DEBUG: Input data first item:", data[0]);
            console.log("FILTER DEBUG: Input data last item:", data[data.length-1]);
        }
          // Make sure data is an array before filtering
        const filteredData = Array.isArray(data) ? data.filter(item => {
            if (!item || !item.date) return false;
            
            const itemDate = new Date(item.date);
            
            // Đối với dữ liệu thực tế (actualProgress), luôn giữ lại tất cả dữ liệu
            // vì chúng ta đã được lọc từ ngày bắt đầu kế hoạch rồi
            if (data.length <= 7) { // Nếu ít dữ liệu (người dùng mới bắt đầu)
                console.log(`FILTER DEBUG: ✅ Giữ lại dữ liệu ${item.date} (người dùng mới bắt đầu)`);
                return true;
            }
            
            // Luôn giữ lại dữ liệu của ngày hôm nay bất kể filter nào
            if (item.date === todayStr) {
                console.log(`FILTER DEBUG: ✅ Giữ lại dữ liệu ngày hôm nay (${todayStr})`);
                return true;
            }
            
            const result = !isNaN(itemDate) && itemDate >= cutoffDate;
            
            // Log filter decision for recent data (debugging)
            const daysDiff = Math.floor((today - itemDate) / (1000 * 60 * 60 * 24));
            if (daysDiff <= 3) { // Log only recent data (now showing 3 days for more context)
                console.log(`FILTER DEBUG: Date ${item.date} - Keep: ${result}, Days diff: ${daysDiff}`);
            }
            
            return result;
        }) : [];
        
        console.log(`Kết quả lọc: ${filteredData.length} mục dữ liệu`);
        if (filteredData.length > 0) {
            console.log("FILTER DEBUG: Filtered data first item:", filteredData[0]);
            console.log("FILTER DEBUG: Filtered data last item:", filteredData[filteredData.length-1]);
        }
          return filteredData;
    };
      useEffect(() => {
        console.log("QuitProgressChart - Updating chart with:", { userPlan, actualProgress, timeFilter });
        console.log("CHART DEBUG: actualProgress length:", actualProgress?.length);
        console.log("CHART DEBUG: actualProgress data:", actualProgress);
        
        // Make sure we have valid data or generate sample data
        let data;
        
        if (userPlan && Object.keys(userPlan).length > 0) {
            data = { 
                plan: userPlan, 
                actual: Array.isArray(actualProgress) ? actualProgress : [] 
            };
            console.log("CHART DEBUG: ✅ Sử dụng dữ liệu thực tế từ props");
        } else {
            data = generateSampleData();
            console.log("CHART DEBUG: ⚠️ Không có userPlan, sử dụng dữ liệu mẫu");
        }

        // Kiểm tra dữ liệu thực tế
        if (Array.isArray(data.actual) && data.actual.length > 0) {
            console.log(`CHART DEBUG: ✅ Có ${data.actual.length} bản ghi dữ liệu thực tế:`, 
                data.actual.map(a => `${a.date}: ${a.actualCigarettes}/${a.targetCigarettes}`));
        } else {
            console.log("CHART DEBUG: ❌ Không có dữ liệu thực tế - đường xanh lá sẽ không hiển thị");
        }

        // Tạo dữ liệu kế hoạch theo ngày
        const dailyPlanData = generateDailyPlanData(data.plan);
        console.log(`CHART DEBUG: Tạo được ${dailyPlanData.length} mục dữ liệu kế hoạch theo ngày`);        // Filter dữ liệu theo timeFilter
        const filteredPlanData = filterDataByTime(dailyPlanData || [], timeFilter);
        const filteredActualData = filterDataByTime(data.actual || [], timeFilter);
        
        console.log("CHART DEBUG: Filtered actual data:", filteredActualData);
        console.log("CHART DEBUG: Filtered data length:", filteredActualData?.length);
        
        // Kiểm tra xem có dữ liệu thực tế không - nếu không có thì không hiển thị đường xanh lá
        const hasRealActualData = Array.isArray(actualProgress) && actualProgress.length > 0;
        if (!hasRealActualData) {
            console.log("CHART DEBUG: ⚠️ Không có dữ liệu actualProgress thực tế từ props - sẽ ẩn đường xanh lá");
        }

        // Tạo labels cho trục X (theo ngày)
        const labels = [];
        const planData = [];
        const actualData = [];
        
        // Tạo map cho việc lookup nhanh - chỉ nếu có dữ liệu thực tế
        const actualMap = new Map();
        if (hasRealActualData && Array.isArray(filteredActualData)) {
            filteredActualData.forEach(item => {
                if (item && item.date) {
                    actualMap.set(item.date, item.actualCigarettes);
                    console.log(`CHART DEBUG: Adding to map - Date ${item.date}, Value ${item.actualCigarettes}`);
                }
            });
        }
        
        console.log("CHART DEBUG: actualMap size:", actualMap.size);        // Tạo dữ liệu cho chart
        if (Array.isArray(filteredPlanData)) {
            filteredPlanData.forEach((planItem, index) => {
                // Format ngày cho label (chỉ hiển thị ngày/tháng)
                const date = new Date(planItem.date);
                const label = `${date.getDate()}/${date.getMonth() + 1}`;
                labels.push(label);
                
                // Dữ liệu kế hoạch
                planData.push(planItem.targetCigarettes);
                
                // Dữ liệu thực tế (chỉ nếu có dữ liệu thực tế từ props)
                if (hasRealActualData) {
                    const actualValue = actualMap.get(planItem.date);
                    actualData.push(actualValue !== undefined ? actualValue : null);
                    
                    // Log dữ liệu dòng xanh lá (debug)
                    if (actualValue !== undefined) {
                        console.log(`DEBUG CHART: Ngày ${planItem.date} có dữ liệu thực tế: ${actualValue} điếu`);
                    }
                } else {
                    // Không có dữ liệu thực tế, push null để không hiển thị điểm nào
                    actualData.push(null);
                }
            });
              // Log tổng quan dữ liệu dòng xanh lá
            if (hasRealActualData) {
                console.log(`DEBUG CHART: ✅ Tổng số điểm dữ liệu thực tế: ${actualMap.size} điểm`);
                console.log('DEBUG CHART: Dữ liệu dòng xanh lá:', actualData.filter(d => d !== null));
            } else {
                console.log('DEBUG CHART: ❌ Không hiển thị dòng xanh lá vì không có dữ liệu thực tế');
            }
        }
        
        const chartConfig = {
            labels,
            datasets: [
                {
                    label: 'Kế hoạch dự kiến',
                    data: planData,
                    borderColor: '#4285f4', // Xanh dương
                    backgroundColor: 'rgba(66, 133, 244, 0.1)',
                    borderWidth: 2,
                    fill: false,
                    tension: 0.1,
                    pointRadius: 3,
                    pointHoverRadius: 5,
                    pointBackgroundColor: '#4285f4',
                    pointBorderColor: '#ffffff',
                    pointBorderWidth: 2,
                    pointStyle: 'circle'
                },                {
                    label: 'Thực tế',
                    data: actualData,
                    borderColor: '#34a853', // Xanh lá
                    backgroundColor: 'rgba(52, 168, 83, 0.1)',
                    borderWidth: 3,
                    fill: false,
                    tension: 0.1,
                    pointRadius: 6, // Tăng kích thước điểm
                    pointHoverRadius: 8, // Tăng kích thước khi hover
                    pointBackgroundColor: '#34a853',
                    pointBorderColor: '#ffffff',
                    pointBorderWidth: 2,
                    spanGaps: true, // Kết nối các điểm có dữ liệu ngay cả khi có gaps
                    pointStyle: 'circle'
                },
                {
                    label: 'Mục tiêu (0 điếu)',
                    data: new Array(labels.length).fill(0),
                    borderColor: '#ea4335', // Đỏ
                    backgroundColor: 'rgba(234, 67, 53, 0.1)',
                    borderWidth: 2,
                    borderDash: [5, 5],
                    fill: false,
                    pointRadius: 0,
                    pointHoverRadius: 0                }
            ]
        };
        
        console.log("CHART DEBUG: Final chart data", {
            labels, 
            planDataPoints: planData.length, 
            actualDataPoints: actualData.filter(d => d !== null).length,
            nonNullActualData: actualData.filter(d => d !== null)
        });
          setChartData(chartConfig);
        setIsLoading(false);
    }, [userPlan, actualProgress, timeFilter]);
    
    // Format date để hiển thị trên chart
    const formatDateForDisplay = (dateString) => {
        try {
            const options = { day: '2-digit', month: '2-digit' };
            return new Date(dateString).toLocaleDateString('vi-VN', options);
        } catch (error) {
            console.error("Error formatting date:", dateString, error);
            return dateString;
        }
    };
    
    // Chuẩn bị dữ liệu cho biểu đồ
    const prepareChartData = () => {
        try {
            let planToUse = userPlan;
            let actualToUse = Array.isArray(actualProgress) ? actualProgress : [];

            // Sử dụng dữ liệu mẫu nếu không có dữ liệu thực
            if (!planToUse) {
                console.warn("Không có kế hoạch, sử dụng dữ liệu mẫu");
                const sampleData = generateSampleData();
                planToUse = sampleData.plan;
                
                // Chỉ sử dụng actual mẫu nếu không có dữ liệu actual thực tế
                if (actualToUse.length === 0) {
                    actualToUse = sampleData.actual;
                }
            }

            // Tạo dữ liệu kế hoạch theo ngày
            const dailyPlan = generateDailyPlanData(planToUse);

            // Lọc dữ liệu theo bộ lọc thời gian
            const filteredPlanData = filterDataByTime(dailyPlan, timeFilter);
            
            // Chuẩn bị labels (ngày) và dữ liệu đích (targetData)
            const labels = [];
            const targetData = [];
            
            // Thêm các ngày và dữ liệu đích vào arrays
            filteredPlanData.forEach((planItem) => {
                const formattedDate = formatDateForDisplay(planItem.date);
                labels.push(formattedDate);
                targetData.push(planItem.targetCigarettes);
            });

            // Chuẩn bị dữ liệu thực tế
            const actualData = [];
            
            // Map dữ liệu thực tế vào các ngày trong kế hoạch
            filteredPlanData.forEach(planItem => {
                const dateStr = planItem.date;
                
                // Tìm giá trị thực tế cho ngày này
                const actualItem = actualToUse.find(item => {
                    // Đảm bảo ngày được format đúng chuẩn YYYY-MM-DD
                    const itemDateStr = typeof item.date === 'string' ? item.date : 
                                        item.date instanceof Date ? item.date.toISOString().split('T')[0] : null;
                    
                    return itemDateStr === dateStr;
                });
                
                // Thêm giá trị thực tế nếu có, null nếu không
                if (actualItem) {
                    const actualValue = actualItem.actualCigarettes;
                    actualData.push(actualValue !== undefined ? actualValue : null);
                } else {
                    // Không có dữ liệu thực tế, push null để không hiển thị điểm nào
                    actualData.push(null);
                }
            });

            // Dữ liệu đã chuẩn bị sẵn sàng cho chart.js
            return {
                labels,
                datasets: [
                    {
                        label: 'Kế hoạch',
                        data: targetData,
                        borderColor: '#4285f4',
                        backgroundColor: 'rgba(66, 133, 244, 0.1)',
                        borderWidth: 2,
                        fill: true,
                        tension: 0.4
                    },
                    {
                        label: 'Thực tế',
                        data: actualData,
                        borderColor: '#34a853',
                        backgroundColor: 'transparent',
                        borderWidth: 2,
                        pointBackgroundColor: '#34a853',
                        pointRadius: 4,
                        tension: 0.2
                    }
                ],
                // Thêm metadata để debug nếu cần
                meta: {
                    planDataPoints: targetData.length,
                    actualDataPoints: actualData.filter(d => d !== null).length,
                    nonNullActualData: actualData.filter(d => d !== null)
                }
            };
        } catch (error) {
            console.error("Error preparing chart data:", error);
            setError("Lỗi khi chuẩn bị dữ liệu biểu đồ");
            
            // Return a minimal valid chart data object in case of error
            return {
                labels: ['Lỗi'],
                datasets: [
                    {
                        label: 'Kế hoạch',
                        data: [0],
                        borderColor: '#4285f4'
                    }
                ]
            };
        }
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            title: {
                display: false, // Tắt tiêu đề mặc định vì chúng ta đã có tiêu đề riêng
                padding: 20
            },
            legend: {
                position: 'top',
                align: 'center',
                labels: {
                    usePointStyle: true,
                    padding: 20,
                    boxWidth: 10,
                    boxHeight: 10,
                    font: {
                        size: 12
                    }
                }
            },
            tooltip: {
                mode: 'index',
                intersect: false,
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                titleColor: 'white',
                bodyColor: 'white',
                borderColor: '#4285f4',
                borderWidth: 1,
                cornerRadius: 8,
                displayColors: true,
                callbacks: {
                    title: function (context) {
                        return context[0].label;
                    },                    label: function (context) {
                        const value = context.parsed.y;
                        if (value === null) return null;

                        let label = context.dataset.label + ': ';
                        if (context.dataset.label.includes('thực tế')) {
                            label += value + ' điếu/ngày';

                            // Thêm thông tin mood nếu có - sử dụng date thay vì week
                            const dataIndex = context.dataIndex;
                            const dateLabel = context.chart.data.labels[dataIndex];
                            
                            // Tìm dữ liệu thực tế dựa trên date
                            const actualData = actualProgress.find(a => {
                                if (a.date) {
                                    const date = new Date(a.date);
                                    const formattedDate = `${date.getDate()}/${date.getMonth() + 1}`;
                                    return formattedDate === dateLabel;
                                }
                                return false;
                            });
                            
                            if (actualData && actualData.mood) {
                                const moodText = {
                                    'easy': '😊 Dễ dàng',
                                    'good': '🙂 Tốt',
                                    'challenging': '😐 Hơi khó',
                                    'difficult': '😰 Khó khăn'
                                };
                                label += ` (${moodText[actualData.mood] || actualData.mood})`;
                            }
                        } else {
                            label += value + ' điếu/ngày';
                        }
                        return label;
                    }
                }
            }
        },            scales: {
                x: {
                    display: true,
                    title: {
                        display: true,
                        text: 'Thời gian',
                        font: {
                            size: 14,
                            weight: 'bold'
                        },
                        color: '#5f6368'
                    },
                grid: {
                    display: false
                },
              ticks: {
                    color: '#5f6368',
                    font: {
                        size: 12
                    },
                    maxRotation: 45,
                    minRotation: 0
                }
            },
            y: {
                display: true,
                title: {
                    display: true,
                    text: 'Số điếu thuốc/ngày',
                    font: {
                        size: 14,
                        weight: 'bold'
                    },
                    color: '#5f6368'
                },                
                beginAtZero: true,
                suggestedMax: 25, // Giá trị mặc định cho max, đảm bảo không bị chạm nóc
                grid: {
                    color: 'rgba(0, 0, 0, 0.1)',
                    borderDash: [2, 2]
                },
                ticks: {
                    color: '#5f6368',
                    font: {
                        size: 12
                    },                  
                    callback: function (value) {
                        return value + ' điếu';
                    },
                    stepSize: 5 // Đặt các bước nhỏ hơn cho trục Y
                }
            }
        },
        interaction: {
            mode: 'nearest',
            axis: 'x',
            intersect: false
        },
        elements: {
            point: {
                hoverBackgroundColor: '#ffffff',
                hoverBorderWidth: 3
            }
        }
    };

    if (isLoading) {
        return (
            <div className="chart-loading" style={{
                height: height,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#f8f9fa',
                borderRadius: '8px'
            }}>
                <div style={{ textAlign: 'center', color: '#5f6368' }}>
                    <div className="loading-spinner" style={{
                        width: '40px',
                        height: '40px',
                        border: '4px solid #e0e0e0',
                        borderTop: '4px solid #4285f4',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite',
                        margin: '0 auto 10px'
                    }}></div>
                    <p>Đang tải biểu đồ tiến trình...</p>
                </div>
            </div>
        );
    }

    // Handling case when chartData is not properly initialized
    if (!chartData) {
        return (
            <div className="chart-loading" style={{ height: height, display: 'flex', 
                 justifyContent: 'center', alignItems: 'center', 
                 backgroundColor: 'rgba(240, 240, 240, 0.5)' }}>
                <p>Đang tải biểu đồ...</p>
            </div>
        );
    }    return (
        <div className="quit-progress-chart" style={{ height: height }}>
            <div className="chart-wrapper"><Line 
                    data={chartData}
                    options={options}
                    height={height - 100} // Giảm chiều cao để đảm bảo không bị trồng chéo
                />            </div>{/* Legend hiển thị dưới biểu đồ */}
        </div>
    );
};

export default QuitProgressChart;
