import React, { createContext, useState, useContext, useEffect } from "react";
import apiService from "../utils/apiService";

// Tạo context cho xác thực
const AuthContext = createContext(null);

// Hook tùy chỉnh để sử dụng AuthContext
export const useAuth = () => useContext(AuthContext);

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
      localStorage.setItem("user", JSON.stringify(user));
    } else {
      localStorage.removeItem("user");
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
      // Gọi API đăng nhập
      const response = await apiService.auth.login({ email, password });

      // Lưu token vào localStorage
      localStorage.setItem("token", response.token);
      setToken(response.token);

      // Lưu thông tin người dùng
      setUser(response.user);
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
    setToken(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
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
