import React, { createContext, useState, useContext, useEffect } from "react";
import apiService from "../utils/apiService";

// Create context for authentication
const AuthContext = createContext(null);

// Custom hook to use AuthContext
export const useAuth = () => useContext(AuthContext);

// Hardcoded coach accounts for fallback
const COACH_ACCOUNTS = [
  {
    id: "coach1",
    name: "Nguyên Văn A",
    email: "coach1@nosmoke.com",
    password: "coach123",
    role: "coach",
    specialization: "Coach cai thuốc chuyên nghiệp",
    rating: 4.8,
    avatar: "https://randomuser.me/api/portraits/men/32.jpg",
  },
  {
    id: "coach2",
    name: "Trần Thị B",
    email: "coach2@nosmoke.com",
    password: "coach123",
    role: "coach",
    specialization: "Chuyên gia tâm lý",
    rating: 4.9,
    avatar: "https://randomuser.me/api/portraits/women/44.jpg",
  },
  {
    id: "coach3",
    name: "Phạm Minh C",
    email: "coach3@nosmoke.com",
    password: "coach123",
    role: "coach",
    specialization: "Bác sĩ phục hồi chức năng",
    rating: 4.7,
    avatar: "https://randomuser.me/api/portraits/men/64.jpg",
  },
];

// Provider component
export const AuthProvider = ({ children }) => {
  // Initialize state from localStorage (if available)
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser) : null;
  });

  const [token, setToken] = useState(
    () => localStorage.getItem("token") || null
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Automatically fetch user data when token changes
  useEffect(() => {
    const fetchUserData = async () => {
      if (token && !user) {
        try {
          setLoading(true);
          const response = await apiService.auth.getCurrentUser();
          const userData = response.data || response;
          setUser(userData);
          localStorage.setItem("user", JSON.stringify(userData));
        } catch (err) {
          console.error("Error fetching user data:", err);
          // If unable to fetch user data, logout
          setToken(null);
          setUser(null);
          localStorage.removeItem("token");
          localStorage.removeItem("user");
        } finally {
          setLoading(false);
        }
      }
    };

    fetchUserData();
  }, [token, user]);

  // Save user to localStorage when changed
  useEffect(() => {
    if (user) {
      localStorage.setItem("user", JSON.stringify(user));
    }
  }, [user]);

  // Register function
  const register = async (userData) => {
    setLoading(true);
    setError(null);

    try {
      const response = await apiService.auth.register(userData);
      const { data } = response;

      if (data && data.token) {
        // Save token to localStorage
        localStorage.setItem("token", data.token);
        setToken(data.token);

        // Save user information
        setUser(data.user);
        localStorage.setItem("user", JSON.stringify(data.user));
      }

      setLoading(false);
      return { success: true, user: data.user };
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || err.message || "Registration failed";
      setError(errorMessage);
      setLoading(false);
      return { success: false, error: errorMessage };
    }
  };

  // Login function
  const login = async (email, password) => {
    setLoading(true);
    setError(null);

    try {
      // Try API login first
      const response = await apiService.auth.login({ email, password });
      const { data } = response;

      if (data && data.token) {
        // Save token to localStorage
        localStorage.setItem("token", data.token);
        setToken(data.token);

        // Save user information
        setUser(data.user);
        localStorage.setItem("user", JSON.stringify(data.user));

        setLoading(false);
        return { success: true, user: data.user };
      }

      throw new Error("Invalid response from server");
    } catch (err) {
      // If API login fails, try hardcoded coach accounts
      const foundCoach = COACH_ACCOUNTS.find(
        (coach) => coach.email === email && coach.password === password
      );

      if (foundCoach) {
        // Don't save password to coach session
        const { password: _, ...coachWithoutPassword } = foundCoach;

        // Set user as coach and save to localStorage
        const coachUser = { ...coachWithoutPassword, role: "coach" };
        setUser(coachUser);
        localStorage.setItem("user", JSON.stringify(coachUser));

        // Create a mock token for coach
        const mockToken = `coach_token_${foundCoach.id}`;
        localStorage.setItem("token", mockToken);
        setToken(mockToken);

        setLoading(false);
        return { success: true, user: coachUser };
      }

      const errorMessage =
        err.response?.data?.message || err.message || "Login failed";
      setError(errorMessage);
      setLoading(false);
      return { success: false, error: errorMessage };
    }
  };

  // Logout function
  const logout = async () => {
    try {
      // Clear local state
      setUser(null);
      setToken(null);

      // Remove from localStorage
      localStorage.removeItem("user");
      localStorage.removeItem("token");

      return { success: true };
    } catch (err) {
      console.error("Logout error:", err);
      return { success: false, error: err.message };
    }
  };

  // Refresh user information from server
  const refreshUser = async () => {
    if (!token) return { success: false, error: "Not authenticated" };

    try {
      setLoading(true);
      const response = await apiService.auth.getCurrentUser();
      const userData = response.data || response;
      setUser(userData);
      localStorage.setItem("user", JSON.stringify(userData));
      setLoading(false);
      return { success: true, user: userData };
    } catch (err) {
      console.error("Error refreshing user data:", err);
      setLoading(false);
      return { success: false, error: err.message };
    }
  };

  // Update user information
  const updateUser = async (updatedData) => {
    if (!user) return { success: false, error: "No user to update" };

    setLoading(true);
    setError(null);

    try {
      // Ensure valid membership if updating membership
      if (
        "membership" in updatedData &&
        !["free", "premium", "pro"].includes(updatedData.membership)
      ) {
        updatedData.membership = "free";
      }

      // Call API to update user information
      const userId = user.UserID || user.id;
      const response = await apiService.users.update(userId, updatedData);
      const updatedUser = response.data || response;

      // Update user in state
      const newUser = { ...user, ...updatedUser };
      setUser(newUser);
      localStorage.setItem("user", JSON.stringify(newUser));

      setLoading(false);
      return { success: true, user: newUser };
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || err.message || "Update failed";
      setError(errorMessage);
      setLoading(false);
      return { success: false, error: errorMessage };
    }
  };

  // Ensure membership is always a valid value
  useEffect(() => {
    if (user && !user.membership) {
      // Default membership is 'free' if not present
      setUser({ ...user, membership: "free" });
    }
  }, [user]);

  // Context value
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
