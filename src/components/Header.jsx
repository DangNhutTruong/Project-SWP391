import { Link } from 'react-router-dom';

export default function Header() {
  return (
    <header className="nosmoke-header">
      <div className="container">
        <div className="logo">
          <Link to="/">
            <span className="logo-text">No<span className="smoke">Smoke</span></span>
          </Link>
        </div>
        <div className="nav-actions">
          <Link to="/support" className="phone-link">
            <i className="fas fa-headset"></i> Hỗ trợ cai thuốc: 1800-xxxx
          </Link>
          <button className="search-btn"><i className="fas fa-search"></i></button>
          <Link to="/login" className="login-btn">Đăng nhập</Link>
        </div>
      </div>
    </header>
  );
}
