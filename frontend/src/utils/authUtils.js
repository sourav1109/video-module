/**
 * Authentication Utilities
 * Helper functions for token validation and cleanup
 */

/**
 * Validate if a token has a valid JWT structure (3 parts separated by dots)
 */
export const isValidTokenFormat = (token) => {
  if (!token || typeof token !== 'string') {
    return false;
  }

  // JWT should have 3 parts: header.payload.signature
  const parts = token.trim().split('.');
  return parts.length === 3 && parts.every(part => part.length > 0);
};

/**
 * Clean and validate token from storage
 */
export const getValidToken = () => {
  try {
    const token = localStorage.getItem('token');
    
    if (!token) {
      return null;
    }

    // Clean the token (remove quotes, whitespace, etc.)
    const cleanToken = token.trim().replace(/^["']|["']$/g, '');

    // Validate format
    if (!isValidTokenFormat(cleanToken)) {
      console.warn('⚠️ Invalid token format detected, clearing...');
      clearAuthData();
      return null;
    }

    return cleanToken;
  } catch (error) {
    console.error('❌ Error validating token:', error);
    clearAuthData();
    return null;
  }
};

/**
 * Clear all authentication data from localStorage
 */
export const clearAuthData = () => {
  console.log('🧹 Clearing authentication data');
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

/**
 * Initialize auth cleanup - run on app start
 */
export const initAuthCleanup = () => {
  const token = localStorage.getItem('token');
  
  if (token && !isValidTokenFormat(token.trim().replace(/^["']|["']$/g, ''))) {
    console.warn('🔧 Found invalid token on startup, cleaning up...');
    clearAuthData();
  }
};

/**
 * Store token safely
 */
export const storeToken = (token) => {
  if (!token || typeof token !== 'string') {
    console.error('❌ Invalid token provided to storeToken');
    return false;
  }

  const cleanToken = token.trim().replace(/^["']|["']$/g, '');

  if (!isValidTokenFormat(cleanToken)) {
    console.error('❌ Token does not have valid JWT format');
    return false;
  }

  localStorage.setItem('token', cleanToken);
  return true;
};

const authUtils = {
  isValidTokenFormat,
  getValidToken,
  clearAuthData,
  initAuthCleanup,
  storeToken
};

export default authUtils;
