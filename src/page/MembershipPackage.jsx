import React from 'react';
import './MembershipPackage.css';
import { FaCheck } from 'react-icons/fa';
import { Link } from 'react-router-dom';

export default function MembershipPackage() {
  return (
      <section className="pricing-section">
        <div className="container">          <div className="hero-image-container">
            <img src="/image/hero/winners-two-color.png" alt="Cai thuốc thành công" className="membership-hero-image" />
            <h1 className="hero-title">Cam kết bỏ thuốc - Bước tới cuộc sống khỏe mạnh</h1>
          </div>
          <h2>So sánh gói dịch vụ</h2>
          <p className="pricing-subtitle">Chọn gói phù hợp với nhu cầu của bạn</p>
  
          <div className="pricing-grid">
            <div className="pricing-card free">
              <div className="pricing-header">
                <h3>Free</h3>
                <p className="pricing-desc">Bắt đầu miễn phí</p>
                <div className="pricing-price">
                  <span className="price">0đ</span>
                  <span className="period">/tháng</span>
                </div>
              </div>
              <div className="pricing-features">
                <div className="feature-item">
                  <i className="fas fa-check feature-check"></i>
                  <span>Theo dõi cai thuốc</span>
                </div>
                <div className="feature-item">
                  <i className="fas fa-check feature-check"></i>
                  <span>Lập kế hoạch cá nhân</span>
                </div>
                <div className="feature-item">
                  <i className="fas fa-check feature-check"></i>
                  <span>Huy hiệu & cộng đồng</span>
                </div>
                <div className="feature-item disabled">
                  <i className="fas fa-times feature-times"></i>
                  <span>Chat huấn luyện viên</span>
                </div>
                <div className="feature-item disabled">
                  <i className="fas fa-times feature-times"></i>
                  <span>Video call tư vấn</span>
                </div>
              </div>
              <Link to="/signup" className="pricing-btn">Bắt đầu miễn phí</Link>
            </div>
  
            <div className="pricing-card premium highlight">
              <div className="best-value">Phổ biến nhất</div>
              <div className="pricing-header">
                <h3>Premium</h3>
                <p className="pricing-desc">Hỗ trợ cá nhân</p>
                <div className="pricing-price">
                  <span className="price">99.000đ</span>
                  <span className="period">/tháng</span>
                </div>
              </div>
              <div className="pricing-features">
                <div className="feature-item">
                  <i className="fas fa-check feature-check"></i>
                  <span>Theo dõi cai thuốc</span>
                </div>
                <div className="feature-item">
                  <i className="fas fa-check feature-check"></i>
                  <span>Lập kế hoạch cá nhân</span>
                </div>
                <div className="feature-item">
                  <i className="fas fa-check feature-check"></i>
                  <span>Huy hiệu & cộng đồng</span>
                </div>
                <div className="feature-item">
                  <i className="fas fa-check feature-check"></i>
                  <span>Chat huấn luyện viên</span>
                </div>
                <div className="feature-item disabled">
                  <i className="fas fa-times feature-times"></i>
                  <span>Video call tư vấn</span>
                </div>
              </div>
              <Link to="/signup/premium" className="pricing-btn">Đăng ký ngay</Link>
            </div>
  
            <div className="pricing-card pro">
              <div className="pricing-header">
                <h3>Pro</h3>
                <p className="pricing-desc">Hỗ trợ toàn diện</p>
                <div className="pricing-price">
                  <span className="price">199.000đ</span>
                  <span className="period">/tháng</span>
                </div>
              </div>
              <div className="pricing-features">
                <div className="feature-item">
                  <i className="fas fa-check feature-check"></i>
                  <span>Theo dõi cai thuốc</span>
                </div>
                <div className="feature-item">
                  <i className="fas fa-check feature-check"></i>
                  <span>Lập kế hoạch cá nhân</span>
                </div>
                <div className="feature-item">
                  <i className="fas fa-check feature-check"></i>
                  <span>Huy hiệu & cộng đồng</span>
                </div>
                <div className="feature-item">
                  <i className="fas fa-check feature-check"></i>
                  <span>Chat huấn luyện viên</span>
                </div>
                <div className="feature-item">
                  <i className="fas fa-check feature-check"></i>
                  <span>Video call tư vấn</span>
                </div>
              </div>
              <Link to="/signup/pro" className="pricing-btn">Đăng ký Pro</Link>
            </div>
          </div>
        </div>
      </section>
    );
}