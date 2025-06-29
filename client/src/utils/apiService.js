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
    refreshToken: () => axiosInstance.post('/api/auth/refresh-token'),
    resetPassword: (email) => axiosInstance.post('/api/auth/reset-password', { email }),
    changePassword: (oldPassword, newPassword) => 
      axiosInstance.post('/api/auth/change-password', { oldPassword, newPassword }),
  },
  
  // User APIs
  users: {
    getAll: () => axiosInstance.get('/api/users'),
    getById: (id) => axiosInstance.get(`/api/users/${id}`),
    update: (id, userData) => axiosInstance.put(`/api/users/${id}`, userData),
    updateAvatar: (id, formData) => axiosInstance.put(`/api/users/${id}/avatar`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),
    deactivate: (id) => axiosInstance.put(`/api/users/${id}/deactivate`),
    getStats: (id) => axiosInstance.get(`/api/users/${id}/stats`),
  },
  
  // Plan APIs
  plans: {
    getAll: () => axiosInstance.get('/api/plans'),
    getById: (id) => axiosInstance.get(`/api/plans/${id}`),
    create: (planData) => axiosInstance.post('/api/plans', planData),
    update: (id, planData) => axiosInstance.put(`/api/plans/${id}`, planData),
    delete: (id) => axiosInstance.delete(`/api/plans/${id}`),
    getStages: (planId) => axiosInstance.get(`/api/plans/${planId}/stages`),
    createStage: (planId, stageData) => axiosInstance.post(`/api/plans/${planId}/stages`, stageData),
    updateStage: (planId, stageId, stageData) => 
      axiosInstance.put(`/api/plans/${planId}/stages/${stageId}`, stageData),
  },
  
  // Progress APIs
  progress: {
    getAll: () => axiosInstance.get('/api/progress'),
    getByUserId: (userId) => axiosInstance.get(`/api/progress/${userId}`),
    create: (progressData) => axiosInstance.post('/api/progress', progressData),
    getByDateRange: (userId, startDate, endDate) => 
      axiosInstance.get(`/api/progress/${userId}/range?start=${startDate}&end=${endDate}`),
    getSummary: (userId) => axiosInstance.get(`/api/progress/${userId}/summary`),
  },
  
  // Appointment APIs
  appointments: {
    getAll: () => axiosInstance.get('/api/appointments'),
    create: (appointmentData) => axiosInstance.post('/api/appointments', appointmentData),
    update: (id, status) => axiosInstance.put(`/api/appointments/${id}/status`, { status }),
    cancel: (id, reason) => axiosInstance.put(`/api/appointments/${id}/cancel`, { reason }),
    getAvailableSlots: (coachId, date) => 
      axiosInstance.get(`/api/appointments/available-slots?coachId=${coachId}&date=${date}`),
    getUpcoming: () => axiosInstance.get('/api/appointments/upcoming'),
    reschedule: (id, newDate) => axiosInstance.put(`/api/appointments/${id}/reschedule`, { newDate }),
  },
  
  // Chat APIs
  messages: {
    getConversation: (userId) => axiosInstance.get(`/api/messages/${userId}`),
    send: (messageData) => axiosInstance.post('/api/messages', messageData),
    markAsRead: (messageId) => axiosInstance.put(`/api/messages/${messageId}/read`),
    getUnreadCount: () => axiosInstance.get('/api/messages/unread-count'),
    getRecentConversations: () => axiosInstance.get('/api/messages/recent-conversations'),
    deleteMessage: (messageId) => axiosInstance.delete(`/api/messages/${messageId}`),
  },
  
  // Community APIs
  community: {
    getPosts: () => axiosInstance.get('/api/posts'),
    createPost: (postData) => axiosInstance.post('/api/posts', postData),
    likePost: (postId) => axiosInstance.post(`/api/posts/${postId}/like`),
    commentPost: (postId, content) => axiosInstance.post(`/api/posts/${postId}/comments`, { content }),
    deletePost: (postId) => axiosInstance.delete(`/api/posts/${postId}`),
    checkLikeStatus: (postId) => axiosInstance.get(`/api/posts/${postId}/like-status`),
    getPostComments: (postId) => axiosInstance.get(`/api/posts/${postId}/comments`),
    getTrending: () => axiosInstance.get('/api/posts/trending'),
    reportPost: (postId, reason) => axiosInstance.post(`/api/posts/${postId}/report`, { reason }),
    getPinnedPosts: () => axiosInstance.get('/api/posts/pinned'),
  },
  
  // Achievements APIs
  achievements: {
    getAll: () => axiosInstance.get('/api/achievements'),
    getUserAchievements: (userId) => axiosInstance.get(`/api/users/${userId}/achievements`),
    grantAchievement: (userId, achievementId, planId) => 
      axiosInstance.post(`/api/users/${userId}/achievements`, { achievementId, planId }),
    getLeaderboard: () => axiosInstance.get('/api/achievements/leaderboard'),
    getMilestones: () => axiosInstance.get('/api/achievements/milestones'),
  },
  
  // Feedback APIs
  feedback: {
    submit: (coachId, rating, comment) => axiosInstance.post('/api/feedback', { coachId, rating, comment }),
    getByCoach: (coachId) => axiosInstance.get(`/api/feedback/coach/${coachId}`),
    getAppFeedback: () => axiosInstance.get('/api/feedback/app'),
    submitAppFeedback: (data) => axiosInstance.post('/api/feedback/app', data),
  },
  
  // Health Profile APIs
  health: {
    getProfile: (userId) => axiosInstance.get(`/api/health/profile/${userId}`),
    updateProfile: (userId, data) => axiosInstance.put(`/api/health/profile/${userId}`, data),
    getImprovements: (userId) => axiosInstance.get(`/api/health/improvements/${userId}`),
    trackVitalSigns: (userId, data) => axiosInstance.post(`/api/health/vitals/${userId}`, data),
    getHealthTimeline: (userId) => axiosInstance.get(`/api/health/timeline/${userId}`),
    getRiskAssessment: (userId) => axiosInstance.get(`/api/health/risk/${userId}`),
  },
  
  // Mood Tracking APIs
  mood: {
    getHistory: (userId, period) => axiosInstance.get(`/api/mood/${userId}?period=${period || 'month'}`),
    trackMood: (data) => axiosInstance.post('/api/mood', data),
    getChallenges: () => axiosInstance.get('/api/mood/challenges'),
    getAchievements: () => axiosInstance.get('/api/mood/achievements'),
    getInsights: (userId) => axiosInstance.get(`/api/mood/${userId}/insights`),
    getTriggerPatterns: (userId) => axiosInstance.get(`/api/mood/${userId}/triggers`),
  },
  
  // Notification APIs
  notifications: {
    getAll: () => axiosInstance.get('/api/notifications'),
    markAsRead: (notificationId) => axiosInstance.put(`/api/notifications/${notificationId}/read`),
    getSettings: () => axiosInstance.get('/api/notifications/settings'),
    updateSettings: (settings) => axiosInstance.put('/api/notifications/settings', settings),
    markAllAsRead: () => axiosInstance.put('/api/notifications/mark-all-read'),
    subscribe: (deviceToken) => axiosInstance.post('/api/notifications/subscribe', { deviceToken }),
    unsubscribe: (deviceToken) => axiosInstance.post('/api/notifications/unsubscribe', { deviceToken }),
  },
  
  // Analytics APIs
  analytics: {
    getSummary: (userId, period) => axiosInstance.get(`/api/analytics/${userId}?period=${period || 'month'}`),
    getHealthImpact: (userId) => axiosInstance.get(`/api/analytics/${userId}/health-impact`),
    getFinancialSavings: (userId) => axiosInstance.get(`/api/analytics/${userId}/financial-savings`),
    getRelapsePatterns: (userId) => axiosInstance.get(`/api/analytics/${userId}/relapse-patterns`),
    getUsageStats: () => axiosInstance.get('/api/analytics/app-usage'),
    getSuccessRate: (userId) => axiosInstance.get(`/api/analytics/${userId}/success-rate`),
  },
  
  // Alternative Habits APIs
  habits: {
    getAll: () => axiosInstance.get('/api/habits'),
    getSuggestions: () => axiosInstance.get('/api/habits/suggestions'),
    trackHabit: (data) => axiosInstance.post('/api/habits/track', data),
    getUserHabits: (userId) => axiosInstance.get(`/api/habits/user/${userId}`),
    createCustomHabit: (habitData) => axiosInstance.post('/api/habits/custom', habitData),
    deleteHabit: (habitId) => axiosInstance.delete(`/api/habits/${habitId}`),
  },
  
  // Emergency Support APIs
  emergency: {
    getHelpline: () => axiosInstance.get('/api/emergency/helpline'),
    requestCall: (data) => axiosInstance.post('/api/emergency/call-request', data),
    getSupportResources: () => axiosInstance.get('/api/emergency/resources'),
    reportCrisis: (data) => axiosInstance.post('/api/emergency/crisis', data),
    getCrisisContacts: () => axiosInstance.get('/api/emergency/contacts'),
  },
  
  // Membership APIs
  membership: {
    getPackages: () => axiosInstance.get('/api/membership/packages'),
    getCurrentSubscription: () => axiosInstance.get('/api/membership/current'),
    subscribe: (packageId, paymentData) => 
      axiosInstance.post('/api/membership/subscribe', { packageId, paymentData }),
    cancelSubscription: (reason) => 
      axiosInstance.post('/api/membership/cancel', { reason }),
    getHistory: () => axiosInstance.get('/api/membership/history'),
    upgradeSubscription: (newPackageId) => 
      axiosInstance.put('/api/membership/upgrade', { newPackageId }),
  },
  
  // Search APIs
  search: {
    global: (query) => axiosInstance.get(`/api/search?q=${encodeURIComponent(query)}`),
    users: (query) => axiosInstance.get(`/api/search/users?q=${encodeURIComponent(query)}`),
    posts: (query) => axiosInstance.get(`/api/search/posts?q=${encodeURIComponent(query)}`),
    resources: (query) => axiosInstance.get(`/api/search/resources?q=${encodeURIComponent(query)}`),
    coaches: (query, specialization) => 
      axiosInstance.get(`/api/search/coaches?q=${encodeURIComponent(query)}&specialization=${specialization || ''}`),
  },
  
  // Report APIs
  reports: {
    getUserReport: (userId, format) => axiosInstance.get(`/api/reports/user/${userId}?format=${format || 'json'}`),
    getProgressReport: (userId, startDate, endDate, format) => 
      axiosInstance.get(`/api/reports/progress/${userId}?start=${startDate}&end=${endDate}&format=${format || 'json'}`),
    getCoachReport: (coachId, format) => 
      axiosInstance.get(`/api/reports/coach/${coachId}?format=${format || 'json'}`),
    getCommunityReport: (format) => axiosInstance.get(`/api/reports/community?format=${format || 'json'}`),
  },
  
  // Export APIs
  export: {
    exportData: (dataType, format, userId) => 
      axiosInstance.get(`/api/export/${dataType}?format=${format}&userId=${userId || ''}`),
    exportHealthData: (userId, format) => 
      axiosInstance.get(`/api/export/health/${userId}?format=${format || 'json'}`),
    exportProgress: (userId, format) => 
      axiosInstance.get(`/api/export/progress/${userId}?format=${format || 'json'}`),
  },
};

export default apiService;
