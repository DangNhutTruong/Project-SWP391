import React, { createContext, useState, useContext, useEffect } from "react";
import apiService from "../utils/apiService";

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
  // Khởi tạo trạng thái từ localStorage (nếu có)
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser) : null;
  });

  const [token, setToken] = useState(
    () => localStorage.getItem("token") || null
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Tự động lấy thông tin người dùng khi token thay đổi
  useEffect(() => {
    const fetchUserData = async () => {
      if (token) {
        try {
          // Gọi API lấy thông tin người dùng hiện tại
          const response = await apiService.auth.getCurrentUser();
          // Kiểm tra và đảm bảo có data trong response
          const userData = response.data || response;
          setUser(userData);
        } catch (err) {
          console.error("Lỗi khi lấy thông tin người dùng:", err);
          // Nếu không thể lấy thông tin người dùng, đăng xuất
          setToken(null);
          setUser(null);
          localStorage.removeItem("token");
          localStorage.removeItem("user");
        }
      }
    };

    fetchUserData();
  }, [token]);

  // Lưu user vào localStorage khi thay đổi
  useEffect(() => {
    if (user) {
      localStorage.setItem('nosmoke_user', JSON.stringify(user));
    }
  }, [user]);

  // Hàm đăng ký tài khoản mới
  const register = async (userData) => {
    setLoading(true);
    setError(null);

    try {
      // Gọi API đăng ký
      const response = await apiService.auth.register(userData);

      // Lưu token vào localStorage
      localStorage.setItem("token", response.token);
      setToken(response.token);

      // Lưu thông tin người dùng
      setUser(response.user);
      setLoading(false);

      return { success: true, user: response.user };
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || err.message || "Đăng ký thất bại";
      setError(errorMessage);
      setLoading(false);
      return { success: false, error: errorMessage };
    }
  };

  // Hàm đăng nhập
  const login = async (email, password) => {
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
          // Đảm bảo user có trường membership và đó là một giá trị hợp lệ
        if (!userWithoutPassword.membership || !['free', 'premium', 'pro'].includes(userWithoutPassword.membership)) {
          userWithoutPassword.membership = 'free';
          
          // Cập nhật lại danh sách users
          const updatedUsers = users.map(user => 
            user.email === email ? { ...user, membership: 'free' } : user
          );
          localStorage.setItem('nosmoke_users', JSON.stringify(updatedUsers));
        }
        
        // Lưu vào localStorage để đảm bảo tính nhất quán
        localStorage.setItem('nosmoke_user', JSON.stringify(userWithoutPassword));
        
        setUser(userWithoutPassword);
        setLoading(false);
        return { success: true, user: userWithoutPassword };
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
      setLoading(false);

      return { success: true, user: response.user };
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || err.message || "Đăng nhập thất bại";
      setError(errorMessage);
      setLoading(false);
      return { success: false, error: errorMessage };
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
    if (user && !user.membership) {
      // Mặc định membership là 'free' nếu không có
      setUser({ ...user, membership: "free" });
    }
  }, [user]);

  // Hàm refresh thông tin người dùng từ server
  const refreshUser = async () => {
    if (!token) return { success: false, error: "Chưa đăng nhập" };

    try {
      const response = await apiService.auth.getCurrentUser();
      const userData = response.data || response;
      setUser(userData);
      return { success: true, user: userData };
    } catch (err) {
      console.error("Lỗi khi refresh thông tin người dùng:", err);
      return { success: false, error: err.message };
    }
  };

  // Hàm cập nhật thông tin người dùng
  const updateUser = async (updatedData) => {
    if (!user)
      return { success: false, error: "Không có người dùng để cập nhật" };
    setLoading(true);

    try {
      // Đảm bảo membership hợp lệ nếu đang cập nhật membership
      if (
        "membership" in updatedData &&
        !["free", "premium", "pro"].includes(updatedData.membership)
      ) {
        updatedData.membership = "free";
      }

      // Gọi API để cập nhật thông tin người dùng
      const userId = user.UserID || user.id;
      const updatedUser = await apiService.users.update(userId, updatedData);

      // Cập nhật user trong state
      setUser({ ...user, ...updatedUser });
      setLoading(false);

      return { success: true, user: updatedUser };
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || err.message || "Cập nhật thất bại";
      setError(errorMessage);
      setLoading(false);
      return { success: false, error: errorMessage };
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
    updateUser,
    refreshUser,
    setUser,
    isAuthenticated: !!user && !!token,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
