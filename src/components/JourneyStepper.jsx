import React, { useState } from 'react';
import '../styles/JourneyStepper.css';

export default function JourneyStepper() {
  const [currentStep, setCurrentStep] = useState(1);
  const [isCompleted, setIsCompleted] = useState(false);
  const [formData, setFormData] = useState({
    cigarettesPerDay: 10,
    packPrice: 25000,
    smokingYears: 5,
    targetDailyReduction: 2,
    targetTimeframe: 3,
    reasonToQuit: 'sức khỏe',
  });
  
  const steps = [
    { id: 1, name: "Thói quen" },
    { id: 2, name: "Mục tiêu" },
    { id: 3, name: "Quá trình" },
    { id: 4, name: "Lợi ích" },
    { id: 5, name: "Xác nhận" },
  ];  const handleContinue = () => {
    if (currentStep < 5) {
      setCurrentStep(currentStep + 1);
      // Add animation effect for the progress bar
      animateProgressBar(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      // Add animation effect for the progress bar when going back
      animateProgressBar(currentStep - 1);
    }
  };
  
  // Function to animate the progress bar when changing steps
  const animateProgressBar = (newStep) => {
    document.querySelectorAll('.step-line').forEach((line, index) => {
      if (index < newStep - 1) {
        line.classList.add('active');
      } else {
        line.classList.remove('active');
      }
    });
  };    const handleSubmit = () => {
    // Add animation to the submit button
    const submitButton = document.querySelector('.btn-submit');
    submitButton.classList.add('loading');
    submitButton.innerHTML = '<div class="loader"></div>';
    
    // Simulate loading/processing
    setTimeout(() => {
      submitButton.classList.remove('loading');
      submitButton.classList.add('success');
      submitButton.innerHTML = '<div class="checkmark">✓</div>';
      
      // Cập nhật progress bar để step 5 cũng được đánh dấu là hoàn thành
      document.querySelectorAll('.step-line').forEach((line) => {
        line.classList.add('active');
      });
      document.querySelectorAll('.step-item').forEach((item) => {
        item.classList.add('completed');
      });
      
      // Set completion state after a short delay
      setTimeout(() => {
        setIsCompleted(true);
      }, 1000);
    }, 2000);
  };
  
  const handleInputChange = (field, value) => {
    setFormData({
      ...formData,
      [field]: value
    });
  };
  
  // Xử lý input số
  const handleNumberInput = (field, e) => {
    const value = parseInt(e.target.value) || 0;
    handleInputChange(field, value);
  };
  
  // Tính toán các thông số dựa trên dữ liệu người dùng nhập vào
  const dailySpending = (formData.cigarettesPerDay / 20) * formData.packPrice;
  const monthlySpending = dailySpending * 30;
  const yearlySpending = monthlySpending * 12;
  const lifetimeSpending = yearlySpending * formData.smokingYears;
  
  // Tính toán lợi ích sức khỏe
  const healthBenefits = [
    { time: "20 phút", benefit: "Huyết áp và nhịp tim giảm về mức bình thường" },
    { time: "8 giờ", benefit: "Mức nicotine và carbon monoxide trong máu giảm một nửa" },
    { time: "24 giờ", benefit: "Carbon monoxide được loại bỏ khỏi cơ thể" },
    { time: "48 giờ", benefit: "Nicotine được loại bỏ khỏi cơ thể, vị giác và khứu giác bắt đầu cải thiện" },
    { time: "72 giờ", benefit: "Đường hô hấp thư giãn, năng lượng tăng lên" },
    { time: "2 tuần - 3 tháng", benefit: "Tuần hoàn máu cải thiện, chức năng phổi tăng lên 30%" },
    { time: "1 - 9 tháng", benefit: "Ho, nghẹt mũi, mệt mỏi và khó thở giảm" },
    { time: "1 năm", benefit: "Nguy cơ mắc bệnh tim giảm 50% so với người hút thuốc" }
  ];

  // Tạo kế hoạch giảm dần
  const generateReductionPlan = () => {
    const weeks = [];
    const reductionPerWeek = Math.ceil(formData.cigarettesPerDay / (formData.targetTimeframe * 4));
    let currentAmount = formData.cigarettesPerDay;

    for (let i = 1; i <= formData.targetTimeframe * 4 && currentAmount > 0; i++) {
      currentAmount = Math.max(0, currentAmount - reductionPerWeek);
      weeks.push({
        week: i,
        amount: currentAmount
      });
    }
    
    return weeks;
  };

  const reductionPlan = generateReductionPlan();


  return (
    <div className="journey-container">
      <div className="stepper-wrapper">
        <h1 className="stepper-title">Kế Hoạch Cai Thuốc</h1>
          {/* Stepper header */}
        <div className="steps-container">
          {steps.map((step, index) => (
            <React.Fragment key={step.id}>              <div 
                className={`step-item ${currentStep >= step.id ? 'active' : ''} ${currentStep > step.id ? 'completed' : ''}`}
                onClick={() => {
                  if (step.id <= currentStep) {
                    // Add animation for progress bar and step changes
                    setCurrentStep(step.id);
                    animateProgressBar(step.id);
                    
                    // Add visual feedback on click
                    const circle = document.querySelector(`.step-item:nth-child(${step.id * 2 - 1}) .step-circle`);
                    if (circle) {
                      circle.classList.add('pulse');
                      setTimeout(() => circle.classList.remove('pulse'), 500);
                    }
                  }
                }}
              >
                <div className="step-circle">
                  {currentStep > step.id ? '✓' : step.id}
                </div>
                <div className="step-name">{step.name}</div>
              </div>
              {index < steps.length - 1 && (
                <div className={`step-line ${currentStep > index + 1 ? 'active' : ''}`}></div>
              )}
            </React.Fragment>
          ))}
        </div>
        
        {/* Form content */}
        <div className="stepper-content">
          {isCompleted ? (
            <div className="completion-screen">
              <div className="completion-checkmark-container">
                <div className="completion-checkmark">✓</div>
              </div>
              
              <h2 className="completion-title">Chúc mừng bạn đã hoàn thành kế hoạch cai thuốc!</h2>
              <p className="completion-subtitle">Hành trình mới của bạn bắt đầu từ hôm nay</p>
              
              <div className="completion-stats">
                <div className="completion-stat-card">
                  <div className="stat-icon">💰</div>
                  <div className="stat-value">{Math.round(yearlySpending).toLocaleString()} VNĐ</div>
                  <div className="stat-label">Tiết kiệm mỗi năm</div>
                </div>
                
                <div className="completion-stat-card">
                  <div className="stat-icon">🚬</div>
                  <div className="stat-value">{formData.cigarettesPerDay * 365}</div>
                  <div className="stat-label">Điếu thuốc không hút mỗi năm</div>
                </div>
                
                <div className="completion-stat-card">
                  <div className="stat-icon">⏱️</div>
                  <div className="stat-value">{formData.targetTimeframe}</div>
                  <div className="stat-label">Tháng để hoàn thành</div>
                </div>
              </div>
              
              <div className="completion-timeline">
                <h3 className="timeline-title">Những lợi ích sức khỏe bạn sẽ nhận được</h3>
                <div className="timeline-container">
                  {healthBenefits.slice(0, 4).map((benefit, index) => (
                    <div className="timeline-milestone" key={index}>
                      <div className="milestone-time">{benefit.time}</div>
                      <div className="milestone-connector"></div>
                      <div className="milestone-benefit">{benefit.benefit}</div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="completion-actions">
                <h3 className="actions-title">Tiếp theo bạn nên làm gì?</h3>
                <div className="action-buttons">
                  <a href="/dashboard" className="action-button primary">
                    <span className="action-icon">📊</span>
                    <span className="action-text">Theo dõi tiến độ</span>
                  </a>
                  <a href="/community" className="action-button secondary">
                    <span className="action-icon">👥</span>
                    <span className="action-text">Tham gia cộng đồng</span>
                  </a>
                  <a href="/resources" className="action-button secondary">
                    <span className="action-icon">📚</span>
                    <span className="action-text">Tài liệu hỗ trợ</span>
                  </a>
                </div>
              </div>
              
              <div className="completion-motivation">
                <blockquote>
                  "Hành trình ngàn dặm bắt đầu từ một bước chân. Hôm nay bạn đã bước những bước đầu tiên để hướng tới cuộc sống khỏe mạnh hơn."
                </blockquote>
              </div>
            </div>
          ) : (
            <>
              {currentStep === 1 && (
                <div className="step-form">
                  <div className="form-header">
                    <div className="form-icon">📋</div>
                    <h2 className="form-title">Thông tin thói quen hút thuốc</h2>
                  </div>
                  <p className="form-description">Vui lòng nhập thông tin thực tế để kế hoạch chính xác hơn.</p>
                  
                  <div className="form-group">
                    <label className="form-label">Bạn hút bao nhiêu điếu mỗi ngày?</label>
                    <div className="input-group">
                      <div className="input-icon">🚬</div>
                      <input 
                        type="number" 
                        className="form-input" 
                        placeholder="10 điếu/ngày" 
                        value={formData.cigarettesPerDay}
                        onChange={(e) => handleNumberInput('cigarettesPerDay', e)}
                      />
                    </div>
                    <small className="input-tip">Số lượng điếu thuốc trung bình bạn hút mỗi ngày</small>
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label">Một bao thuốc giá trung bình?</label>
                    <div className="input-group">
                      <div className="input-icon">💰</div>
                      <input 
                        type="number" 
                        className="form-input" 
                        placeholder="25000 VNĐ" 
                        value={formData.packPrice}
                        onChange={(e) => handleNumberInput('packPrice', e)}
                      />
                    </div>
                    <small className="input-tip">Giá trung bình một bao thuốc bạn thường mua (VNĐ)</small>
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label">Bạn đã hút thuốc bao lâu?</label>
                    <div className="input-group">
                      <div className="input-icon">🗓️</div>
                      <input 
                        type="number" 
                        className="form-input" 
                        placeholder="5 năm" 
                        value={formData.smokingYears}
                        onChange={(e) => handleNumberInput('smokingYears', e)}
                      />
                    </div>
                    <small className="input-tip">Số năm bạn đã hút thuốc</small>
                  </div>
                  
                  <div className="stats-summary">
                    <div className="stats-card">
                      <div className="stats-value">{Math.round(dailySpending).toLocaleString()} VNĐ</div>
                      <div className="stats-label">Chi phí mỗi ngày</div>
                    </div>
                    <div className="stats-card">
                      <div className="stats-value">{Math.round(monthlySpending).toLocaleString()} VNĐ</div>
                      <div className="stats-label">Chi phí mỗi tháng</div>
                    </div>
                    <div className="stats-card highlight">
                      <div className="stats-value">{Math.round(yearlySpending).toLocaleString()} VNĐ</div>
                      <div className="stats-label">Chi phí mỗi năm</div>
                    </div>
                  </div>
                  
                  <div className="form-actions">
                    <button className="btn-next" onClick={handleContinue}>
                      Tiếp tục <span className="btn-arrow">→</span>
                    </button>
                  </div>
                </div>
              )}
              
              {currentStep === 2 && (
                <div className="step-form">
                  <div className="form-header">
                    <div className="form-icon">🎯</div>
                    <h2 className="form-title">Mục tiêu cai thuốc</h2>
                  </div>
                  <p className="form-description">Thiết lập mục tiêu cai thuốc và lý do để giúp bạn kiên trì trong hành trình này</p>
                  
                  <div className="form-group">
                    <label className="form-label">Số điếu thuốc bạn muốn giảm mỗi ngày</label>
                    <div className="input-group">
                      <div className="input-icon">📉</div>
                      <input 
                        type="number" 
                        className="form-input" 
                        placeholder="2 điếu/ngày" 
                        value={formData.targetDailyReduction}
                        onChange={(e) => handleNumberInput('targetDailyReduction', e)}
                      />
                    </div>
                    <small className="input-tip">Số điếu thuốc bạn muốn giảm mỗi ngày (nên bắt đầu với số lượng nhỏ)</small>
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label">Thời gian dự kiến cai hoàn toàn</label>
                    <div className="input-group">
                      <div className="input-icon">⏱️</div>
                      <input 
                        type="number" 
                        className="form-input" 
                        placeholder="3 tháng" 
                        value={formData.targetTimeframe}
                        onChange={(e) => handleNumberInput('targetTimeframe', e)}
                      />
                    </div>
                    <small className="input-tip">Số tháng bạn muốn hoàn thành quá trình cai thuốc lá (khuyến nghị: 3-6 tháng)</small>
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label">Lý do bạn muốn cai thuốc</label>
                    <div className="reasons-container">
                      <div className="reason-option" onClick={() => handleInputChange('reasonToQuit', 'sức khỏe')}>
                        <input 
                          type="radio" 
                          name="reasonToQuit" 
                          checked={formData.reasonToQuit === 'sức khỏe'} 
                          onChange={() => {}}
                        />
                        <div className="reason-content">
                          <div className="reason-icon">❤️</div>
                          <div className="reason-text">Vì sức khỏe</div>
                        </div>
                      </div>
                      
                      <div className="reason-option" onClick={() => handleInputChange('reasonToQuit', 'gia đình')}>
                        <input 
                          type="radio" 
                          name="reasonToQuit" 
                          checked={formData.reasonToQuit === 'gia đình'} 
                          onChange={() => {}}
                        />
                        <div className="reason-content">
                          <div className="reason-icon">👨‍👩‍👧‍👦</div>
                          <div className="reason-text">Vì gia đình</div>
                        </div>
                      </div>
                      
                      <div className="reason-option" onClick={() => handleInputChange('reasonToQuit', 'tiết kiệm')}>
                        <input 
                          type="radio" 
                          name="reasonToQuit" 
                          checked={formData.reasonToQuit === 'tiết kiệm'} 
                          onChange={() => {}}
                        />
                        <div className="reason-content">
                          <div className="reason-icon">💵</div>
                          <div className="reason-text">Tiết kiệm chi phí</div>
                        </div>
                      </div>
                      
                      <div className="reason-option" onClick={() => handleInputChange('reasonToQuit', 'thử thách')}>
                        <input 
                          type="radio" 
                          name="reasonToQuit" 
                          checked={formData.reasonToQuit === 'thử thách'} 
                          onChange={() => {}}
                        />
                        <div className="reason-content">
                          <div className="reason-icon">🏆</div>
                          <div className="reason-text">Thử thách bản thân</div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="motivational-quote">
                    <blockquote>
                      "Mỗi ngày không hút thuốc là một thành công. Bạn đang trên đường hướng tới một cuộc sống khỏe mạnh hơn."
                    </blockquote>
                  </div>
                  
                  <div className="form-actions">
                    <button className="btn-back" onClick={handleBack}>
                      <span className="btn-arrow">←</span> Quay lại
                    </button>
                    <button className="btn-next" onClick={handleContinue}>
                      Tiếp tục <span className="btn-arrow">→</span>
                    </button>
                  </div>
                </div>
              )}
                {currentStep === 3 && (
                <div className="step-form">
                  <div className="form-header">
                    <div className="form-icon">📈</div>
                    <h2 className="form-title">Kế hoạch giảm dần</h2>
                  </div>
                  <p className="form-description">Dưới đây là lịch trình giảm dần số điếu thuốc bạn hút mỗi ngày</p>
                  
                  <div className="plan-description">
                    <p>Dựa trên thông tin bạn cung cấp, chúng tôi đã tạo kế hoạch cai thuốc trong <strong>{formData.targetTimeframe} tháng</strong> cho bạn. 
                    Hiện tại bạn hút khoảng <strong>{formData.cigarettesPerDay} điếu mỗi ngày</strong>.</p>
                  </div>
                  
                  <div className="timeline-container">
                    <div className="timeline-header">
                      <div>Tuần</div>
                      <div>Số điếu/ngày</div>
                      <div>Tiến độ</div>
                    </div>
                    
                    {reductionPlan.map((week, index) => (
                      <div className="timeline-item" key={index}>
                        <div className="timeline-week">Tuần {week.week}</div>
                        <div className="timeline-amount">{week.amount} điếu</div>
                        <div className="timeline-progress">
                          <div 
                            className="progress-bar" 
                            style={{
                              width: `${100 - (week.amount / formData.cigarettesPerDay * 100)}%`
                            }}
                          ></div>
                        </div>
                      </div>
                    ))}
                    
                    <div className="timeline-item complete">
                      <div className="timeline-week">Mục tiêu</div>
                      <div className="timeline-amount">0 điếu</div>
                      <div className="timeline-progress">
                        <div className="progress-bar" style={{width: '100%'}}></div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="tips-container">
                    <h3 className="tips-title">Mẹo vượt qua thời kỳ khó khăn:</h3>
                    <ul className="tips-list">
                      <li>Tìm thú vui thay thế như đọc sách, nghe nhạc hoặc tập thể dục</li>
                      <li>Tránh xa những nơi bạn thường hút thuốc</li>
                      <li>Giữ tay bạn bận rộn với một thứ gì đó như bút, tăm hoặc kẹo cao su không đường</li>
                      <li>Uống nhiều nước để giúp cơ thể đào thải độc tố nhanh hơn</li>
                      <li>Tìm sự hỗ trợ từ bạn bè và gia đình</li>
                    </ul>
                  </div>
                  
                  <div className="form-actions">
                    <button className="btn-back" onClick={handleBack}>
                      <span className="btn-arrow">←</span> Quay lại
                    </button>
                    <button className="btn-next" onClick={handleContinue}>
                      Tiếp tục <span className="btn-arrow">→</span>
                    </button>
                  </div>
                </div>
              )}
                {currentStep === 4 && (
                <div className="step-form">
                  <div className="form-header">
                    <div className="form-icon">🌟</div>
                    <h2 className="form-title">Lợi ích khi cai thuốc</h2>
                  </div>
                  <p className="form-description">Những lợi ích tuyệt vời bạn sẽ nhận được khi cai thuốc thành công</p>
                  
                  <div className="benefits-categories">
                    <div className="benefit-category">
                      <div className="category-header">
                        <div className="category-icon">💰</div>
                        <h3 className="category-title">Lợi ích tài chính</h3>
                      </div>
                      
                      <div className="savings-calculator">
                        <div className="savings-item">
                          <span className="savings-label">Tiết kiệm mỗi tháng:</span>
                          <span className="savings-value">{Math.round(monthlySpending).toLocaleString()} VNĐ</span>
                        </div>
                        <div className="savings-item">
                          <span className="savings-label">Tiết kiệm mỗi năm:</span>
                          <span className="savings-value">{Math.round(yearlySpending).toLocaleString()} VNĐ</span>
                        </div>
                        <div className="savings-item total">
                          <span className="savings-label">Tiết kiệm trong 10 năm:</span>
                          <span className="savings-value">{Math.round(yearlySpending * 10).toLocaleString()} VNĐ</span>
                        </div>
                      </div>
                      
                      <div className="savings-suggestion">
                        <p>Với số tiền này bạn có thể:</p>
                        <ul>
                          <li>Đi du lịch nước ngoài mỗi năm</li>
                          <li>Mua sắm những món đồ yêu thích</li>
                          <li>Đầu tư cho tương lai và hưu trí</li>
                        </ul>
                      </div>
                    </div>
                    
                    <div className="benefit-category">
                      <div className="category-header">
                        <div className="category-icon">❤️</div>
                        <h3 className="category-title">Lợi ích sức khỏe</h3>
                      </div>
                      
                      <div className="health-timeline">
                        {healthBenefits.map((benefit, index) => (
                          <div className="health-item" key={index}>
                            <div className="health-time">{benefit.time}</div>
                            <div className="health-connector"></div>
                            <div className="health-benefit">{benefit.benefit}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div className="benefit-category">
                      <div className="category-header">
                        <div className="category-icon">😊</div>
                        <h3 className="category-title">Lợi ích khác</h3>
                      </div>
                      
                      <div className="other-benefits">
                        <div className="benefit-item">
                          <div className="benefit-icon">👃</div>
                          <div className="benefit-text">
                            <h4>Cải thiện khứu giác và vị giác</h4>
                            <p>Thưởng thức thức ăn và mùi hương tốt hơn</p>
                          </div>
                        </div>
                        
                        <div className="benefit-item">
                          <div className="benefit-icon">🦷</div>
                          <div className="benefit-text">
                            <h4>Răng và nướu khỏe mạnh hơn</h4>
                            <p>Giảm nguy cơ bệnh nha chu và răng ố vàng</p>
                          </div>
                        </div>
                        
                        <div className="benefit-item">
                          <div className="benefit-icon">👕</div>
                          <div className="benefit-text">
                            <h4>Không còn mùi thuốc lá</h4>
                            <p>Quần áo, tóc và hơi thở không còn mùi khó chịu</p>
                          </div>
                        </div>
                        
                        <div className="benefit-item">
                          <div className="benefit-icon">🏃</div>
                          <div className="benefit-text">
                            <h4>Tăng sức bền và năng lượng</h4>
                            <p>Hoạt động thể chất dễ dàng và bền bỉ hơn</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="form-actions">
                    <button className="btn-back" onClick={handleBack}>
                      <span className="btn-arrow">←</span> Quay lại
                    </button>
                    <button className="btn-next" onClick={handleContinue}>
                      Tiếp tục <span className="btn-arrow">→</span>
                    </button>
                  </div>
                </div>
              )}
                {currentStep === 5 && (
                <div className="step-form">
                  <div className="form-header">
                    <div className="form-icon">✅</div>
                    <h2 className="form-title">Xác nhận kế hoạch</h2>
                  </div>
                  <p className="form-description">Xem lại và xác nhận kế hoạch cai thuốc của bạn</p>
                  
                  <div className="summary-container">
                    <h3 className="summary-title">Tóm tắt kế hoạch cai thuốc của bạn</h3>
                    
                    <div className="summary-section">
                      <h4 className="section-title">Thông tin hiện tại</h4>
                      <div className="summary-grid">
                        <div className="summary-item">
                          <div className="summary-label">Số điếu hút mỗi ngày</div>
                          <div className="summary-value">{formData.cigarettesPerDay} điếu</div>
                        </div>
                        <div className="summary-item">
                          <div className="summary-label">Chi phí mỗi ngày</div>
                          <div className="summary-value">{Math.round(dailySpending).toLocaleString()} VNĐ</div>
                        </div>
                        <div className="summary-item">
                          <div className="summary-label">Chi phí mỗi năm</div>
                          <div className="summary-value">{Math.round(yearlySpending).toLocaleString()} VNĐ</div>
                        </div>
                        <div className="summary-item">
                          <div className="summary-label">Thời gian đã hút thuốc</div>
                          <div className="summary-value">{formData.smokingYears} năm</div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="summary-section">
                      <h4 className="section-title">Mục tiêu của bạn</h4>
                      <div className="summary-grid">
                        <div className="summary-item">
                          <div className="summary-label">Thời gian cai thuốc</div>
                          <div className="summary-value">{formData.targetTimeframe} tháng</div>
                        </div>
                        <div className="summary-item">
                          <div className="summary-label">Lý do cai thuốc</div>
                          <div className="summary-value reason">Vì {formData.reasonToQuit}</div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="commitment-section">
                      <h4>Cam kết của bạn</h4>
                      <div className="commitment-text">
                        <p>Tôi cam kết sẽ tuân theo kế hoạch cai thuốc này và nỗ lực để đạt được mục tiêu sống khỏe mạnh hơn. 
                        Mỗi ngày tôi sẽ theo dõi tiến độ và không bỏ cuộc dù có khó khăn.</p>
                      </div>
                      
                      <div className="reminder-section">
                        <h4>Nhắc nhở mỗi ngày</h4>
                        <div className="reminder-options">
                          <label className="reminder-option">
                            <input type="checkbox" defaultChecked />
                            <span className="checkmark"></span>
                            <span>Gửi nhắc nhở qua email</span>
                          </label>
                          
                          <label className="reminder-option">
                            <input type="checkbox" defaultChecked />
                            <span className="checkmark"></span>
                            <span>Nhắc nhở trên ứng dụng</span>
                          </label>
                          
                          <label className="reminder-option">
                            <input type="checkbox" />
                            <span className="checkmark"></span>
                            <span>Thông báo thành tích</span>
                          </label>
                        </div>
                      </div>
                    </div>
                    
                    <div className="congratulations-message">
                      <div className="congrats-icon">🎉</div>
                      <div className="congrats-text">
                        <h3>Chúc mừng bạn đã hoàn thành kế hoạch cai thuốc!</h3>
                        <p>Hãy kiên trì thực hiện, chúng tôi sẽ luôn bên cạnh hỗ trợ bạn trong suốt hành trình này.</p>
                      </div>
                    </div>
                    
                    <div className="support-options">
                      <h4>Các hình thức hỗ trợ</h4>
                      <div className="support-grid">
                        <div className="support-item">
                          <div className="support-icon">👥</div>
                          <div className="support-title">Nhóm hỗ trợ</div>
                          <div className="support-desc">Tham gia cộng đồng cùng mục tiêu</div>
                        </div>
                        
                        <div className="support-item">
                          <div className="support-icon">📱</div>
                          <div className="support-title">Ứng dụng di động</div>
                          <div className="support-desc">Theo dõi tiến độ mọi lúc mọi nơi</div>
                        </div>
                        
                        <div className="support-item">
                          <div className="support-icon">📞</div>
                          <div className="support-title">Hotline tư vấn</div>
                          <div className="support-desc">Gọi ngay khi cần giúp đỡ</div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="form-actions">
                    <button className="btn-back" onClick={handleBack}>
                      <span className="btn-arrow">←</span> Quay lại
                    </button>
                    <button className="btn-submit" onClick={handleSubmit}>
                      Hoàn thành kế hoạch
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
        
        <div className="stepper-footer">
          © 2024 Kế Hoạch Cai Thuốc • Nền tảng hỗ trợ sức khỏe cộng đồng
        </div>
      </div>
    </div>
  );
}
