import { Link } from 'react-router-dom';

export default function Nav() {
  return (
    <nav className="nosmoke-nav">
      <div className="container">
        <ul className="main-menu">
          <li className="active"><Link to="/">Trang chủ</Link></li>
          <li><Link to="/about">Về chúng tôi</Link></li>
          <li><Link to="/journey">Hành trình cai thuốc</Link></li>
          <li><Link to="/profile">Hồ sơ cá nhân</Link></li>
          <li><Link to="/blog">Blog kinh nghiệm</Link></li>
          <li><Link to="/testimonials">Câu chuyện thành công</Link></li>
          <li><Link to="/contact">Liên hệ</Link></li>
        </ul>
      </div>
    </nav>
  );
}
