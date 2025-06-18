import React, { createContext, useState, useContext, useEffect } from 'react';

// Base API URL - change this to your backend URL
const API_BASE_URL = 'http://localhost:3000/api';

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
  const [token, setToken] = useState(() => {
    return localStorage.getItem('nosmoke_token');
  });
  // Lưu user và token vào localStorage khi thay đổi
  useEffect(() => {
    if (user) {
      localStorage.setItem('nosmoke_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('nosmoke_user');
    }
  }, [user]);

  useEffect(() => {
    if (token) {
      localStorage.setItem('nosmoke_token', token);
    } else {
      localStorage.removeItem('nosmoke_token');
    }
  }, [token]);
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
      console.log('🌐 Fetching:', url, 'with config:', config);

      const response = await fetch(url, config);

      console.log('📡 Response status:', response.status);
      console.log('📡 Response ok:', response.ok);
      const data = await response.json();

      console.log('📋 Response data:', data); // Log full response

      if (!response.ok) {
        console.error('❌ API Error:', data);
        console.error('❌ Validation errors:', data.data?.errors); // Log validation details
        throw new Error(data.message || 'Request failed');
      }

      return data;
    } catch (error) {
      console.error('🚨 apiCall error:', error);
      throw error;
    }
  };
  // Hàm đăng ký tài khoản mới
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
        setUser(data.data.user);
        setToken(data.data.token);
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

  // Hàm đăng nhập
  const login = async (email, password, rememberMe) => {
    setLoading(true);
    setError(null);

    try {
      const data = await apiCall('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password })
      });

      if (data.success) {
        setUser(data.data.user);
        setToken(data.data.token);
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
      setUser(null);
      setToken(null);
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

  // Legacy functions for backward compatibility
  const refreshMembership = refreshUser;  // Giá trị context
  const value = {
    user,
    loading,
    error,
    token,
    login,
    logout,
    register,
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
