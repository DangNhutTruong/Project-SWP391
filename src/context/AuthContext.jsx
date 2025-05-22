import React, { createContext, useState, useContext, useEffect } from 'react';

// Tạo context cho xác thực
const AuthContext = createContext(null);

// Hook tùy chỉnh để sử dụng AuthContext
export const useAuth = () => useContext(AuthContext);

// Provider component
export const AuthProvider = ({ children }) => {
  // Khởi tạo trạng thái từ localStorage (nếu có)
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem('nosmoke_user');
    return storedUser ? JSON.parse(storedUser) : null;
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Lưu user vào localStorage khi thay đổi
  useEffect(() => {
    if (user) {
      localStorage.setItem('nosmoke_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('nosmoke_user');
    }
  }, [user]);

  // Hàm kiểm tra tài khoản đã tồn tại
  const checkUserExists = (email) => {
    const users = JSON.parse(localStorage.getItem('nosmoke_users') || '[]');
    return users.some(user => user.email === email);
  };

  // Hàm đăng ký tài khoản mới
  const register = async (userData) => {
    setLoading(true);
    setError(null);
    
    try {
      // Mô phỏng độ trễ của API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Kiểm tra email đã tồn tại chưa
      if (checkUserExists(userData.email)) {
        throw new Error('Email này đã được đăng ký');
      }
      
      // Lấy danh sách người dùng từ localStorage
      const users = JSON.parse(localStorage.getItem('nosmoke_users') || '[]');
      
      // Tạo user mới với ID ngẫu nhiên
      const newUser = {
        ...userData,
        id: Date.now().toString(),
        createdAt: new Date().toISOString()
      };
      
      // Thêm user mới vào danh sách
      users.push(newUser);
      
      // Lưu danh sách user cập nhật vào localStorage
      localStorage.setItem('nosmoke_users', JSON.stringify(users));
      
      // Không lưu mật khẩu vào user session
      const { password, ...userWithoutPassword } = newUser;
      
      // Đặt user hiện tại
      setUser(userWithoutPassword);
      setLoading(false);
      
      return { success: true, user: userWithoutPassword };
    } catch (err) {
      setError(err.message);
      setLoading(false);
      return { success: false, error: err.message };
    }
  };

  // Hàm đăng nhập
  const login = async (email, password, rememberMe) => {
    setLoading(true);
    setError(null);
    
    try {
      // Mô phỏng API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Lấy danh sách user từ localStorage
      const users = JSON.parse(localStorage.getItem('nosmoke_users') || '[]');
      
      // Tìm user với email và password tương ứng
      const foundUser = users.find(user => user.email === email && user.password === password);
      
      if (foundUser) {
        // Không lưu mật khẩu vào user session
        const { password, ...userWithoutPassword } = foundUser;
        
        setUser(userWithoutPassword);
        setLoading(false);
        return { success: true, user: userWithoutPassword };
      } else {
        throw new Error('Email hoặc mật khẩu không đúng');
      }
    } catch (err) {
      setError(err.message);
      setLoading(false);
      return { success: false, error: err.message };
    }
  };

  // Hàm đăng xuất
  const logout = () => {
    setUser(null);
    return { success: true };
  };

  // Giá trị context
  const value = {
    user,
    loading,
    error,
    login,
    logout,
    register,
    isAuthenticated: !!user
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
