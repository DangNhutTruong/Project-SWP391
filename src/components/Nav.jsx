import { Link, useLocation } from 'react-router-dom';
import { FaHome, FaToolbox, FaChartLine, FaBlog, FaCalendarAlt } from 'react-icons/fa';

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
            <Link to="/journey">
              <FaToolbox className="nav-icon" /> Kế hoạch cai thuốc
            </Link>
          </li>
        <li className={pathname.includes('/progress') ? 'active' : ''}>
            <Link to="/progress">
              <FaChartLine className="nav-icon" /> Tiến trình
            </Link>
          </li>
          <li className={pathname.includes('/appointment') ? 'active' : ''}>
            <Link to="/appointment">
              <FaCalendarAlt className="nav-icon" /> Đặt lịch Coach
            </Link>
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
