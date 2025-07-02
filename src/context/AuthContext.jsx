import React, { createContext, useState, useContext, useEffect } from 'react';

// Base API URL - change this to your backend URL
const API_BASE_URL = 'http://localhost:5000/api';

// Tạo context cho xác thực
const AuthContext = createContext(null);

// Hook tùy chỉnh để sử dụng AuthContext
export const useAuth = () => useContext(AuthContext);

// Hardcoded coach accounts
const COACH_ACCOUNTS = [
  {
    id: 1,
    name: 'Nguyên Văn A',
    email: 'coach1@nosmoke.com',
    password: 'coach123',
    role: 'coach',
    specialization: 'Coach cai thuốc chuyên nghiệp',
    rating: 4.8,
    avatar: 'https://randomuser.me/api/portraits/men/32.jpg'
  },
  {
    id: 2,
    name: 'Trần Thị B',
    email: 'coach2@nosmoke.com',
    password: 'coach123',
    role: 'coach',
    specialization: 'Chuyên gia tâm lý',
    rating: 4.9,
    avatar: 'https://randomuser.me/api/portraits/women/44.jpg'
  },
  {
    id: 3,
    name: 'Phạm Minh C',
    email: 'coach3@nosmoke.com',
    password: 'coach123',
    role: 'coach',
    specialization: 'Bác sĩ phục hồi chức năng',
    rating: 4.7,
    avatar: 'https://randomuser.me/api/portraits/men/64.jpg'
  }
];

// Provider component
export const AuthProvider = ({ children }) => {
  // Khởi tạo trạng thái từ localStorage hoặc sessionStorage
  const [user, setUser] = useState(() => {
    // Kiểm tra localStorage trước (remember me), sau đó sessionStorage
    const storedUser = localStorage.getItem('nosmoke_user') || sessionStorage.getItem('nosmoke_user');
    return storedUser ? JSON.parse(storedUser) : null;
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [token, setToken] = useState(() => {
    // Kiểm tra localStorage trước (remember me), sau đó sessionStorage
    return localStorage.getItem('nosmoke_token') || sessionStorage.getItem('nosmoke_token');
  });
  const [rememberMe, setRememberMe] = useState(() => {
    return localStorage.getItem('nosmoke_remember') === 'true';
  });
  // Xóa localStorage cũ và sync với sessionStorage
  useEffect(() => {
    // Không xóa localStorage nữa vì cần cho remember me
    console.log('🔧 AuthContext initialized with remember me support');
  }, []);

  // Lưu user và token vào storage khi thay đổi
  useEffect(() => {
    if (user) {
      localStorage.setItem('nosmoke_user', JSON.stringify(user));
    }
  }, [user, rememberMe]);

  useEffect(() => {
    if (token) {
      if (rememberMe) {
        localStorage.setItem('nosmoke_token', token);
      } else {
        sessionStorage.setItem('nosmoke_token', token);
        localStorage.removeItem('nosmoke_token');
      }
    } else {
      sessionStorage.removeItem('nosmoke_token');
      localStorage.removeItem('nosmoke_token');
    }
  }, [token, rememberMe]);
  // API helper function
  const apiCall = async (endpoint, options = {}) => {
    try {
      const config = {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers
        },
        ...options
      };

      // Add authorization header if token exists
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      const url = `${API_BASE_URL}${endpoint}`;
      console.log('🌐 Fetching:', url, 'with config:', config); const response = await fetch(url, config);

      console.log('📡 Response status:', response.status);
      console.log('📡 Response ok:', response.ok);

      // Xử lý trường hợp server error (500)
      if (response.status === 500) {
        console.error('❌ Server error (500)');
        throw new Error('Lỗi máy chủ nội bộ. Vui lòng thử lại sau.');
      }

      const data = await response.json();
      console.log('📡 Response data:', data);

      if (!response.ok) {
        console.error('❌ API Error:', data);
        throw new Error(data.message || 'Yêu cầu thất bại');
      }

      return data;
    } catch (error) {
      // Log chi tiết lỗi bao gồm stack trace
      console.error('🚨 API call error details:', error);
      console.error('🚨 apiCall error:', error);
      throw error;
    }
  };  // Hàm đăng ký tài khoản mới - Bước 1: Gửi mã xác nhận
  const register = async (userData) => {
    setLoading(true);
    setError(null);

    try {
      console.log('🚀 AuthContext register called with:', userData);
      console.log('📡 Making API call to:', `${API_BASE_URL}/auth/register`);

      const data = await apiCall('/auth/register', {
        method: 'POST',
        body: JSON.stringify(userData)
      });

      console.log('✅ API response:', data);

      if (data.success) {
        // Registration successful, verification code sent
        return {
          success: true,
          message: data.message,
          email: data.data.email,
          needsVerification: true
        };
      } else {
        throw new Error(data.message);
      }
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };  // Hàm xác nhận email
  const verifyEmail = async (email, verificationCode) => {
    setLoading(true);
    setError(null);

    try {
      console.log(`🔍 Xác thực email: ${email} với mã: ${verificationCode}`);
      console.log(`🌐 API URL: ${API_BASE_URL}/auth/verify-email`);

      // Đảm bảo mã xác thực luôn là string và loại bỏ khoảng trắng
      const formattedCode = String(verificationCode).trim();

      console.log(`📤 Gửi request với dữ liệu:`, { email, verificationCode: formattedCode });

      const data = await apiCall('/auth/verify-email', {
        method: 'POST',
        body: JSON.stringify({
          email,
          verificationCode: formattedCode
        })
      });

      console.log(`📥 Nhận response:`, data); if (data.success) {
        setUser(data.data.user);
        setToken(data.data.token);
        console.log('✅ Email verified and user registered');
        return { success: true, user: data.data.user };
      } else {
        // Kiểm tra trong danh sách coach hardcoded
        const foundCoach = COACH_ACCOUNTS.find(coach => coach.email === email && coach.password === password);
        if (foundCoach) {
          // Không lưu mật khẩu vào coach session
          const { password, ...coachWithoutPassword } = foundCoach;
          
          // Đặt user là coach và lưu vào localStorage
          const coachUser = { ...coachWithoutPassword, role: 'coach' };
          setUser(coachUser);
          localStorage.setItem('nosmoke_user', JSON.stringify(coachUser));
          setLoading(false);
          
          // Redirect coach đến dashboard ngay lập tức
          window.location.href = '/coach';
          
          return { success: true, user: coachUser };
        }
        
        throw new Error('Email hoặc mật khẩu không đúng');
      }
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };
  // Hàm đăng nhập
  const login = async (email, password, rememberMeOption = false) => {
    setLoading(true);
    setError(null);

    try {
      const data = await apiCall('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password })
      });

      if (data.success) {
        // Cập nhật rememberMe trước khi set user và token
        setRememberMe(rememberMeOption);
        setUser(data.data.user);
        setToken(data.data.token);

        console.log(`✅ User logged in - ${rememberMeOption ? 'persistent across browser sessions' : 'session only'}`);
        return { success: true, user: data.data.user };
      } else {
        throw new Error(data.message);
      }
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };
  // Hàm đăng xuất
  const logout = async () => {
    try {
      if (token) {
        await apiCall('/auth/logout', {
          method: 'POST'
        });
      }
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      // Xóa hoàn toàn state và cả localStorage và sessionStorage
      setUser(null);
      setToken(null);
      setRememberMe(false);
      sessionStorage.removeItem('nosmoke_user');
      sessionStorage.removeItem('nosmoke_token');
      localStorage.removeItem('nosmoke_user');
      localStorage.removeItem('nosmoke_token');
      localStorage.removeItem('nosmoke_remember');
      console.log('🔐 User logged out - all session data cleared');
      return { success: true };
    }
  };

  // Hàm cập nhật thông tin người dùng
  const updateUser = async (updatedData) => {
    if (!user || !token) return { success: false, error: 'Không có người dùng để cập nhật' };

    try {
      setLoading(true);
      const data = await apiCall('/auth/profile', {
        method: 'PUT',
        body: JSON.stringify(updatedData)
      });

      if (data.success) {
        setUser(data.data.user);
        return { success: true, user: data.data.user };
      } else {
        throw new Error(data.message);
      }
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  // Hàm đổi mật khẩu
  const changePassword = async (currentPassword, newPassword, confirmPassword) => {
    if (!user || !token) return { success: false, error: 'Không có người dùng để cập nhật' };

    try {
      setLoading(true);
      const data = await apiCall('/auth/change-password', {
        method: 'POST',
        body: JSON.stringify({ currentPassword, newPassword, confirmPassword })
      });

      if (data.success) {
        return { success: true };
      } else {
        throw new Error(data.message);
      }
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  // Hàm refresh thông tin user từ server
  const refreshUser = async () => {
    if (!token) return { success: false, error: 'Không có token' };

    try {
      const data = await apiCall('/auth/profile');

      if (data.success) {
        setUser(data.data.user);
        return { success: true, user: data.data.user };
      } else {
        throw new Error(data.message);
      }
    } catch (err) {
      // If token is invalid, logout
      if (err.message.includes('token') || err.message.includes('401')) {
        logout();
      }
      return { success: false, error: err.message };
    }
  };

  // Hàm đăng xuất
  const logout = () => {
    setUser(null);
    // Xóa thông tin user khỏi localStorage
    localStorage.removeItem('nosmoke_user');
    return { success: true };
  };
    // Đảm bảo rằng membership luôn là một giá trị hợp lệ
  useEffect(() => {
    if (user) {
      let needUpdate = false;
      let updates = {};
      
      // Kiểm tra và đảm bảo membership hợp lệ
      if (!user.membership || !['free', 'premium', 'pro'].includes(user.membership)) {
        // Nếu membership không hợp lệ, kiểm tra membershipType
        if (user.membershipType && ['free', 'premium', 'pro'].includes(user.membershipType)) {
          updates.membership = user.membershipType;
        } else {
          updates.membership = 'free';
        }
        needUpdate = true;
      }
      
      // Kiểm tra và đảm bảo membershipType hợp lệ và đồng bộ với membership
      if (!user.membershipType || user.membershipType !== user.membership) {
        updates.membershipType = user.membership || 'free';
        needUpdate = true;
      }
      
      // Cập nhật nếu cần
      if (needUpdate) {
        console.log('Đồng bộ dữ liệu membership:', updates);
        setUser({...user, ...updates});
      }
    }
    
    // Kiểm tra nếu cần refresh membership
    if (user && window.sessionStorage && window.sessionStorage.getItem('membership_refresh_needed') === 'true') {
      refreshMembership();
      window.sessionStorage.removeItem('membership_refresh_needed');
    }
  }, [user]);
  
  // Hàm refresh thông tin membership từ localStorage
  const refreshMembership = () => {
    if (!user) return { success: false, error: 'Không có người dùng để cập nhật' };
    
    try {
      // Lấy thông tin user từ localStorage
      const users = JSON.parse(localStorage.getItem('nosmoke_users') || '[]');
      const storedUser = users.find(u => u.id === user.id);
      
      if (storedUser && storedUser.membership !== user.membership) {
        // Cập nhật thông tin membership nếu có sự khác biệt
        setUser({ ...user, membership: storedUser.membership });
        return { success: true, user: { ...user, membership: storedUser.membership } };
      }
      
      return { success: true, user };
    } catch (err) {
      console.error('Lỗi khi refresh membership:', err);
      return { success: false, error: err.message };
    }
  };
    // Hàm cập nhật thông tin người dùng
  const updateUser = (updatedData) => {
    if (!user) return { success: false, error: 'Không có người dùng để cập nhật' };
    
    try {
      // Lấy danh sách người dùng từ localStorage
      const users = JSON.parse(localStorage.getItem('nosmoke_users') || '[]');
        // Đảm bảo membership hợp lệ nếu đang cập nhật membership
      if (updatedData.hasOwnProperty('membership') && 
          !['free', 'premium', 'pro'].includes(updatedData.membership)) {
        updatedData.membership = 'free';
      }
      
      // Đảm bảo đồng bộ giữa membership và membershipType
      if (updatedData.hasOwnProperty('membership') && !updatedData.hasOwnProperty('membershipType')) {
        updatedData.membershipType = updatedData.membership;
        console.log('Tự động đồng bộ membershipType:', updatedData.membershipType);
      }
      
      if (updatedData.hasOwnProperty('membershipType') && !updatedData.hasOwnProperty('membership')) {
        updatedData.membership = updatedData.membershipType;
        console.log('Tự động đồng bộ membership:', updatedData.membership);
      }
      
      // Tìm và cập nhật người dùng
      const updatedUsers = users.map(u => {
        if (u.id === user.id) {
          return { ...u, ...updatedData };
        }
        return u;
      });
      
      // Lưu danh sách cập nhật vào localStorage
      localStorage.setItem('nosmoke_users', JSON.stringify(updatedUsers));
      
      // Cập nhật user hiện tại trong state
      const updatedUser = { ...user, ...updatedData };
      setUser(updatedUser);
      
      // Cập nhật user trong localStorage cho phiên hiện tại
      localStorage.setItem('nosmoke_user', JSON.stringify(updatedUser));
      
      return { success: true, user: updatedUser };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    }
  };
  // Giá trị context
  const value = {
    user,
    loading,
    error,
    token,
    login,
    logout,
    register,
    verifyEmail,
    resendVerificationCode,
    updateUser,
    changePassword,
    refreshUser,
    refreshMembership,
    setUser,
    isAuthenticated: !!user && !!token
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
