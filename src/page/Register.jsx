import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Register.css';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [cigarettesPerDay, setCigarettesPerDay] = useState(10);
  const [costPerPack, setCostPerPack] = useState(25000);
  const [cigarettesPerPack, setCigarettesPerPack] = useState(20);
  
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { register, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  // Chuyển hướng đến profile nếu đã đăng nhập
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/profile');
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // Kiểm tra mật khẩu xác nhận
    if (password !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp');
      return;
    }
    
    // Kiểm tra mật khẩu đủ mạnh (ít nhất 6 ký tự)
    if (password.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự');
      return;
    }
    
    setIsLoading(true);
    
    try {
      const userData = {
        name,
        email,
        password,
        cigarettesPerDay: parseInt(cigarettesPerDay),
        costPerPack: parseInt(costPerPack),
        cigarettesPerPack: parseInt(cigarettesPerPack),
        startDate: new Date().toISOString(),
        daysWithoutSmoking: 0
      };
      
      const result = await register(userData);
      
      if (result.success) {
        navigate('/profile');
      } else {
        setError(result.error || 'Đăng ký không thành công');
      }
    } catch (err) {
      setError('Có lỗi xảy ra, vui lòng thử lại');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="register-page">
      <div className="register-container">
        <div className="register-card">
          <div className="register-header">
            <h1>Đăng ký tài khoản</h1>
            <p>Bắt đầu hành trình cai thuốc lá của bạn</p>
          </div>

          <form onSubmit={handleSubmit} className="register-form">
            {error && <div className="error-message">{error}</div>}
            
            <div className="form-group">
              <label htmlFor="name">Họ và tên</label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nhập tên của bạn"
                disabled={isLoading}
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Nhập email của bạn"
                disabled={isLoading}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Mật khẩu</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Nhập mật khẩu (ít nhất 6 ký tự)"
                disabled={isLoading}
                required
                minLength={6}
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="confirmPassword">Xác nhận mật khẩu</label>
              <input
                type="password"
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Nhập lại mật khẩu"
                disabled={isLoading}
                required
              />
            </div>
            
            <div className="form-divider">
              <span>Thông tin về thói quen hút thuốc</span>
            </div>
            
            <div className="form-group">
              <label htmlFor="cigarettesPerDay">Số điếu thuốc mỗi ngày</label>
              <input
                type="number"
                id="cigarettesPerDay"
                value={cigarettesPerDay}
                onChange={(e) => setCigarettesPerDay(e.target.value)}
                min="1"
                max="100"
                disabled={isLoading}
                required
              />
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="costPerPack">Giá một gói thuốc (VNĐ)</label>
                <input
                  type="number"
                  id="costPerPack"
                  value={costPerPack}
                  onChange={(e) => setCostPerPack(e.target.value)}
                  min="1000"
                  step="1000"
                  disabled={isLoading}
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="cigarettesPerPack">Số điếu trong một gói</label>
                <input
                  type="number"
                  id="cigarettesPerPack"
                  value={cigarettesPerPack}
                  onChange={(e) => setCigarettesPerPack(e.target.value)}
                  min="1"
                  max="50"
                  disabled={isLoading}
                  required
                />
              </div>
            </div>

            <div className="terms-privacy">
              <input type="checkbox" id="terms" required />
              <label htmlFor="terms">
                Tôi đồng ý với <Link to="/terms">Điều khoản sử dụng</Link> và <Link to="/privacy">Chính sách bảo mật</Link>
              </label>
            </div>

            <button 
              type="submit" 
              className="register-button"
              disabled={isLoading}
            >
              {isLoading ? 'Đang đăng ký...' : 'Đăng ký'}
            </button>
          </form>

          <div className="register-footer">
            <p>Đã có tài khoản? <Link to="/login" className="login-link">Đăng nhập ngay</Link></p>
          </div>
        </div>
        
        <div className="register-info">
          <h2>Lợi ích khi đăng ký tài khoản NoSmoke</h2>
          <ul className="benefits-list">
            <li>Theo dõi tiến trình cai thuốc lá của bạn</li>
            <li>Tính toán số tiền tiết kiệm được</li>
            <li>Nhận thông báo động viên hàng ngày</li>
            <li>Tham gia cộng đồng những người cùng cai thuốc</li>
            <li>Xem lộ trình cải thiện sức khỏe theo thời gian thực</li>
            <li>Nhận hỗ trợ từ chuyên gia</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
