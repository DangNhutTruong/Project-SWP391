import { Link } from 'react-router-dom';
import { getHeroImagePath } from '../utils/imageUtils';
import ScrollDown from './ScrollDown';
import './Hero.css';

export default function Hero() {
  return (
    <section className="hero nosmoke-hero">
      <div className="hero-bg-pattern"></div>
      <div className="floating-circle circle1"></div>
      <div className="floating-circle circle2"></div>
      <div className="floating-circle circle3"></div>
      <div className="container">
        <div className="hero-content">
          <div className="hero-badge">Nói không với thuốc lá</div>
          <h1>Hành trình cai thuốc – Bắt đầu từ hôm nay, vì một cơ thể khỏe mạnh!</h1>
          <p>Cùng hàng ngàn người đã thành công bỏ thuốc lá, cải thiện sức khỏe và tiết kiệm chi phí.</p>
          <div className="hero-stats">
            <div className="stat-item">
              <span className="stat-number">10.000+</span>
              <span className="stat-label">Người thành công</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">90%</span>
              <span className="stat-label">Tỉ lệ thành công</span>
            </div>
          </div>
          <div className="hero-buttons">
            <Link to="/membership" className="btn btn-primary pulse">Trở thành Thành Viên</Link>
            <Link to="/blog" className="btn btn-outline">Khám phá hành trình cai thuốc</Link>
          </div>
        </div>
        <div className="hero-image">
          <div className="image-wrapper">
            <img src={getHeroImagePath('quit-smoking-2.png')} alt="Quit smoking success" />
            <div className="image-decoration"></div>
          </div>
        </div>
      </div>
      <ScrollDown />
    </section>
  );
}
