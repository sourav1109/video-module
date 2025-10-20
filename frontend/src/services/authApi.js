// ============================================================================
// Authentication API Service
// Handles login, logout, session management
// ============================================================================

import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
const AUTH_BASE_URL = `${API_BASE_URL}/api/video-call/auth`;

class AuthAPI {
  
  // Get authorization headers
  getAuthHeaders(token) {
    return {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    };
  }

  /**
   * Login user
   */
  async login(email, password, role) {
    try {
      const response = await axios.post(`${AUTH_BASE_URL}/login`, {
        email,
        password,
        role
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Login failed');
    }
  }

  /**
   * Register user
   */
  async register(userData) {
    try {
      const response = await axios.post(`${AUTH_BASE_URL}/register`, userData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Registration failed');
    }
  }

  /**
   * Logout user (server-side session termination)
   */
  async logout(token) {
    try {
      const response = await axios.post(
        `${AUTH_BASE_URL}/logout`,
        {},
        this.getAuthHeaders(token)
      );
      
      // Clear local storage
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      sessionStorage.clear();
      
      return response.data;
    } catch (error) {
      // Even if API fails, clear local storage
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      sessionStorage.clear();
      
      console.error('Logout API error:', error);
      throw new Error(error.response?.data?.message || 'Logout failed');
    }
  }

  /**
   * Logout from all devices
   */
  async logoutAll(token) {
    try {
      const response = await axios.post(
        `${AUTH_BASE_URL}/logout-all`,
        {},
        this.getAuthHeaders(token)
      );
      
      // Clear local storage
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      sessionStorage.clear();
      
      return response.data;
    } catch (error) {
      // Even if API fails, clear local storage
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      sessionStorage.clear();
      
      console.error('Logout-all API error:', error);
      throw new Error(error.response?.data?.message || 'Logout from all devices failed');
    }
  }

  /**
   * Get current user info
   */
  async getMe(token) {
    try {
      const response = await axios.get(
        `${AUTH_BASE_URL}/me`,
        this.getAuthHeaders(token)
      );
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to get user info');
    }
  }

  /**
   * Get all active sessions
   */
  async getSessions(token) {
    try {
      const response = await axios.get(
        `${AUTH_BASE_URL}/sessions`,
        this.getAuthHeaders(token)
      );
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to get sessions');
    }
  }

  /**
   * Check if token is valid
   */
  async validateToken(token) {
    try {
      const response = await axios.get(
        `${AUTH_BASE_URL}/me`,
        this.getAuthHeaders(token)
      );
      return response.data.success;
    } catch (error) {
      return false;
    }
  }

  /**
   * Setup axios interceptor for automatic logout on 401
   */
  setupInterceptors(onLogout) {
    axios.interceptors.response.use(
      (response) => {
        // Check for token expiration warning
        if (response.headers['x-token-expires-soon']) {
          const expiresIn = parseInt(response.headers['x-token-expires-in'] || '0');
          console.warn(`⚠️ Token expires in ${Math.floor(expiresIn / 60)} minutes`);
          
          // You can show a notification to user here
          if (window.showTokenExpirationWarning) {
            window.showTokenExpirationWarning(expiresIn);
          }
        }
        return response;
      },
      (error) => {
        // Handle 401 errors (unauthorized)
        if (error.response?.status === 401) {
          const errorCode = error.response?.data?.code;
          
          // Token expired, blacklisted, or session inactive
          if (['TOKEN_EXPIRED', 'TOKEN_BLACKLISTED', 'SESSION_INACTIVE'].includes(errorCode)) {
            console.error(`🚫 ${errorCode}: Logging out`);
            
            // Clear local storage
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            sessionStorage.clear();
            
            // Trigger logout callback
            if (onLogout) {
              onLogout();
            }
            
            // Redirect to login
            if (window.location.pathname !== '/login') {
              window.location.href = '/login';
            }
          }
        }
        return Promise.reject(error);
      }
    );
  }
}

// Create singleton instance
const authAPI = new AuthAPI();

export default authAPI;
