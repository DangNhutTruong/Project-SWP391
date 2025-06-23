import { Link } from 'react-router-dom';
import { getHeroImagePath } from '../utils/imageUtils';
import ScrollDown from './ScrollDown';
import './Hero.css';
import { useState, useEffect } from 'react';

export default function Hero() {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
    // Images to cycle through
  const heroImages = [
    'quit-smoking-2.png',
    'quit-smoking-3.jpg',
    'quit-smoking-4.jpg',
    'd.jpg',
    'th.jpg'
  ];
    // Debug: Log image paths being used
  useEffect(() => {
    console.log("Image slider initialized with images:", heroImages);
    
    // Remove debug logs in production
    if (process.env.NODE_ENV !== 'production') {
      heroImages.forEach(img => {
        const path = getHeroImagePath(img);
        console.log(`Image path for ${img}:`, path);
      });
    }
  }, []);
    // Effect for cycling through images every 3 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => {
        const nextIndex = (prevIndex + 1) % heroImages.length;
        console.log(`Changing image from index ${prevIndex} to ${nextIndex}`);
        return nextIndex;
      });
    }, 3000);
    
    // Clean up interval on unmount
    return () => clearInterval(interval);
  }, []);
  
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
              <span className="stat-number">61,7%</span>
              <span className="stat-label">Tỉ lệ thành công</span>
            </div>
          </div>
          <div className="hero-buttons">
            <Link to="/membership" className="btn btn-primary pulse">Trở thành Thành Viên</Link>
            <Link to="/blog" className="btn btn-outline">Khám phá hành trình cai thuốc</Link>
          </div>
        </div>        <div className="hero-image">
          <div className="image-wrapper">            <div className="image-slider">
              {/* Current image index: {currentImageIndex} */}              {heroImages.map((image, index) => (
                <img 
                  key={index}
                  src={getHeroImagePath(image)} 
                  alt={`Quit smoking image ${index + 1}`}
                  className={index === currentImageIndex ? 'active' : ''}
                  onError={(e) => {
                    console.error(`Error loading image: ${image}`);
                    e.target.src = '/image/hero/quit-smoking-2.png'; // Fallback image
                  }}
                />
              ))}
            </div>            <div className="image-decoration"></div>
          </div>
        </div>
      </div>
      <ScrollDown />
    </section>
  );
}
