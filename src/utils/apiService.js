import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000';

// Tạo instance axios với cấu hình mặc định
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Thêm interceptor để tự động thêm token vào header khi có request
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Xử lý response và lỗi chung
axiosInstance.interceptors.response.use(
  (response) => response.data,
  (error) => {
    // Xử lý lỗi 401 (Unauthorized)
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Redirect to login page if not already there
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// API Service object
const apiService = {
  // Auth APIs
  auth: {
    login: (credentials) => axiosInstance.post('/api/auth/login', credentials),
    register: (userData) => axiosInstance.post('/api/auth/register', userData),
    getCurrentUser: () => axiosInstance.get('/api/auth/me'),
  },
  
  // User APIs
  users: {
    getAll: () => axiosInstance.get('/api/users'),
    getById: (id) => axiosInstance.get(`/api/users/${id}`),
    update: (id, userData) => axiosInstance.put(`/api/users/${id}`, userData),
  },
  
  // Plan APIs
  plans: {
    getAll: () => axiosInstance.get('/api/plans'),
    getById: (id) => axiosInstance.get(`/api/plans/${id}`),
    create: (planData) => axiosInstance.post('/api/plans', planData),
    update: (id, planData) => axiosInstance.put(`/api/plans/${id}`, planData),
  },
  
  // Progress APIs
  progress: {
    getAll: () => axiosInstance.get('/api/progress'),
    getByUserId: (userId) => axiosInstance.get(`/api/progress/${userId}`),
    create: (progressData) => axiosInstance.post('/api/progress', progressData),
  },
  
  // Appointment APIs
  appointments: {
    getAll: () => axiosInstance.get('/api/appointments'),
    create: (appointmentData) => axiosInstance.post('/api/appointments', appointmentData),
  },
};

export default apiService;
