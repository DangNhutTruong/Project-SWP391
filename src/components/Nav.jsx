import { Link, useLocation } from 'react-router-dom';

export default function Nav() {
  const location = useLocation();
  const { pathname } = location;
  
  return (
    <nav className="nosmoke-nav">
      <div className="container">
        <ul className="main-menu">
          <li className={pathname === '/' ? 'active' : ''}>
            <Link to="/">Trang chủ</Link>
          </li>
          <li className={pathname.includes('/journey') ? 'active' : ''}>
            <Link to="/journey">Công Cụ</Link>
          </li>          <li className={pathname.includes('/profile') ? 'active' : ''}>
            <Link to="/profile">Hồ sơ cá nhân</Link>
          </li>
          <li className={pathname.includes('/membership') ? 'active' : ''}>
            <Link to="/membership">Gói thành viên</Link>
          </li>
          <li className={pathname.includes('/blog') ? 'active' : ''}>
            <Link to="/blog">Blog kinh nghiệm</Link>
          </li>

        </ul>
      </div>
    </nav>
  );
}
