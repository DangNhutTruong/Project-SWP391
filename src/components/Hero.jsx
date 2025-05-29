import { Link } from 'react-router-dom';

export default function Hero() {
  return (
    <section className="hero nosmoke-hero">
      <div className="container">
        <div className="hero-content">
          <h1>Hành trình cai thuốc – Bắt đầu từ hôm nay, vì một cơ thể khỏe mạnh!</h1>
          <p>Cùng hàng ngàn người đã thành công bỏ thuốc lá, cải thiện sức khỏe và tiết kiệm chi phí.</p>
          <div className="hero-buttons">
            <Link to="/join" className="btn btn-primary">Tham gia miễn phí</Link>
            <Link to="/start" className="btn btn-outline">Khám phá hành trình cai thuốc</Link>
          </div>
        </div>
        <div className="hero-image">
          <img src="/image/hero/quit-smoking-2.png" alt="Quit smoking success" />
        </div>
      </div>
    </section>
  );
}
