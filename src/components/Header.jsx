import { Link } from 'react-router-dom';
import { FaBell } from 'react-icons/fa';
import { useState } from 'react';
import LoginModal from './LoginModal';
import { useAuth } from '../context/AuthContext';
import './Header.css';

export default function Header() {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0); // Add this state for notification count
  const { user, logout } = useAuth();

  const handleLoginClick = (e) => {
    e.preventDefault();
    setIsLoginModalOpen(true);
  };

  const handleLogout = () => {
    logout();
    setIsUserMenuOpen(false);
  };

  const toggleUserMenu = () => {
    setIsUserMenuOpen(!isUserMenuOpen);
  };
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
            <i className="fas fa-headset"></i>
            <span className="phone-text">Tư Vấn: 1800-1098</span>
          </Link>
          {user ? (
            <>
              <Link to="/notifications" className="nav-item notification-nav-item">
                <FaBell /> Thông báo
                {notificationCount > 0 && <span className="notification-badge">{notificationCount}</span>}
              </Link>
              <div className="user-menu-container">
                <button className="user-menu-button" onClick={toggleUserMenu}>
                  <span className="user-initial">{user.name.charAt(0)}</span>
                  <span className="user-name">{user.name}</span>
                </button>

                {isUserMenuOpen && (
                  <div className="user-dropdown-menu">
                    <Link to="/profile" className="dropdown-item">
                      <i className="fas fa-user"></i> Hồ sơ cá nhân
                    </Link>
                    <Link to="/settings" className="dropdown-item">
                      <i className="fas fa-cog"></i> Cài đặt
                    </Link>
                    <button onClick={handleLogout} className="dropdown-item logout-btn">
                      <i className="fas fa-sign-out-alt"></i> Đăng xuất
                    </button>
                  </div>
                )}x
              </div>
            </>
          ) : (
            <>
              <a href="#" className="login-btn" onClick={handleLoginClick}>Đăng nhập</a>
              <Link to="/signup" className="signup-btn">Đăng ký</Link>
            </>
          )}

          <LoginModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} />
        </div>
      </div>
    </header>
  );
}
