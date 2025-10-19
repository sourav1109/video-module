import axios from 'axios';

const API_BASE_URL = `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/video-call`;

console.log('🔧 API Configuration:', {
  REACT_APP_API_URL: process.env.REACT_APP_API_URL,
  API_BASE_URL: API_BASE_URL
});

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      // Ensure token is properly formatted (no extra quotes or whitespace)
      const cleanToken = token.trim().replace(/^["']|["']$/g, '');
      config.headers.Authorization = `Bearer ${cleanToken}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // If we get a 401, clear invalid token
    if (error.response && error.response.status === 401) {
      const errorMessage = error.response.data?.message || '';
      
      // If token is invalid or malformed, clear it
      if (errorMessage.includes('Invalid token') || 
          errorMessage.includes('jwt malformed') ||
          errorMessage.includes('No token provided')) {
        console.warn('🔐 Invalid or expired token detected, clearing auth data');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        
        // Optionally redirect to login
        // window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

const liveClassAPI = {
  // Get all active classes
  getActiveClasses: async () => {
    const response = await api.get('/active');
    return response.data;
  },

  // Get upcoming classes
  getUpcomingClasses: async () => {
    const response = await api.get('/upcoming');
    return response.data;
  },

  // Get teacher's classes
  getTeacherClasses: async (status = null) => {
    const params = status ? { status } : {};
    const response = await api.get('/teacher/classes', { params });
    return response.data;
  },

  // Get student's classes
  getStudentClasses: async () => {
    const response = await api.get('/student/classes');
    return response.data;
  },

  // Create/Schedule a new class
  scheduleClass: async (classData) => {
    const response = await api.post('/create', classData);
    return response.data;
  },

  // Get class by ID
  getClass: async (classId) => {
    const response = await api.get(`/${classId}`);
    return response.data;
  },

  // Get class by room ID
  getClassByRoomId: async (roomId) => {
    const response = await api.get(`/room/${roomId}`);
    return response.data;
  },

  // Start a class
  startClass: async (classId) => {
    const response = await api.post(`/${classId}/start`);
    return response.data;
  },

  // End a class
  endClass: async (classId) => {
    const response = await api.post(`/${classId}/end`);
    return response.data;
  },

  // Cancel a class
  cancelClass: async (classId) => {
    const response = await api.post(`/${classId}/cancel`);
    return response.data;
  },

  // Delete a class
  deleteClass: async (classId) => {
    const response = await api.delete(`/${classId}`);
    return response.data;
  },

  // Get class statistics
  getClassStatistics: async (classId) => {
    const response = await api.get(`/${classId}/statistics`);
    return response.data;
  },

  // Search classes
  searchClasses: async (query) => {
    const response = await api.get('/search', { params: { query } });
    return response.data;
  }
};

export default liveClassAPI;
