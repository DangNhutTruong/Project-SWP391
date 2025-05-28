import { Link, useLocation } from 'react-router-dom';
import { FaHome, FaToolbox, FaChartLine, FaBlog } from 'react-icons/fa';

export default function Nav() {
  const location = useLocation();
  const { pathname } = location;

  return (    <nav className="nosmoke-nav">
      <div className="container">
        <ul className="main-menu">
          <li className={pathname === '/' ? 'active' : ''}>
            <Link to="/">
              <FaHome className="nav-icon" /> Trang chủ
            </Link>
          </li>
          <li className={pathname.includes('/journey') ? 'active' : ''}>
            <Link to="/journey">Công Cụ</Link>
          </li>
          <li className={pathname.includes('/profile') ? 'active' : ''}>
            <Link to="/profile">Hồ sơ cá nhân</Link>
          </li>
          <li className={pathname.includes('/membership') ? 'active' : ''}>
            <Link to="/membership">Gói thành viên</Link>
          </li>
          <li className={pathname.includes('/blog') ? 'active' : ''}>
            <Link to="/blog">
              <FaBlog className="nav-icon" /> Cộng Đồng
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  );
}
