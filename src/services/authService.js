// src/services/authService.js
import api from './api';

/**
 * Authentication service handling all auth-related API calls
 * Based on your backend auth routes
 */
export const authService = {
  /**
   * Active Directory Login
   * POST /api/auth/login-ad
   */
  loginAD: async (username, password) => {
    try {
      const response = await api.post('/auth/login-ad', {
        username: username.trim(),
        password
      });
      
      return {
        success: true,
        ...response.data
      };
    } catch (error) {
      throw {
        success: false,
        message: error.response?.data?.message || 'Login failed',
        code: error.response?.data?.code || 'LOGIN_ERROR',
        validationErrors: error.response?.data?.validationErrors || []
      };
    }
  },

  /**
   * Local Login (for future use)
   * POST /api/auth/login-local
   */
  loginLocal: async (email, password) => {
    try {
      const response = await api.post('/auth/login-local', {
        email: email.trim().toLowerCase(),
        password
      });
      
      return {
        success: true,
        ...response.data
      };
    } catch (error) {
      throw {
        success: false,
        message: error.response?.data?.message || 'Login failed',
        code: error.response?.data?.code || 'LOGIN_ERROR',
        validationErrors: error.response?.data?.validationErrors || []
      };
    }
  },

  /**
   * Verify OTP
   * POST /api/auth/verify-otp
   */
  verifyOTP: async (userId, otpCode, type = 'login') => {
    try {
      const response = await api.post('/auth/verify-otp', {
        userId: parseInt(userId),
        otpCode: otpCode.trim(),
        type
      });
      
      return {
        success: true,
        ...response.data
      };
    } catch (error) {
      throw {
        success: false,
        message: error.response?.data?.message || 'OTP verification failed',
        code: error.response?.data?.code || 'OTP_ERROR',
        validationErrors: error.response?.data?.validationErrors || []
      };
    }
  },

  /**
   * Resend OTP
   * POST /api/auth/resend-otp
   */
  resendOTP: async (userId, type = 'login') => {
    try {
      const response = await api.post('/auth/resend-otp', {
        userId: parseInt(userId),
        type
      });
      
      return {
        success: true,
        ...response.data
      };
    } catch (error) {
      throw {
        success: false,
        message: error.response?.data?.message || 'Failed to resend OTP',
        code: error.response?.data?.code || 'RESEND_ERROR'
      };
    }
  },

  /**
   * Logout
   * POST /api/auth/logout
   */
  logout: async () => {
    try {
      const response = await api.post('/auth/logout');
      return {
        success: true,
        ...response.data
      };
    } catch (error) {
      // Even if logout fails on server, clear local storage
      return {
        success: true,
        message: 'Logged out locally'
      };
    }
  },

  /**
   * Refresh Token
   * POST /api/auth/refresh-token
   */
  refreshToken: async (refreshToken) => {
    try {
      const response = await api.post('/auth/refresh-token', {
        refreshToken
      });
      
      return {
        success: true,
        ...response.data
      };
    } catch (error) {
      throw {
        success: false,
        message: error.response?.data?.message || 'Token refresh failed',
        code: error.response?.data?.code || 'TOKEN_ERROR'
      };
    }
  },

  /**
   * Get current user profile
   * GET /api/auth/profile (if this route exists)
   */
  getProfile: async () => {
    try {
      const response = await api.get('/auth/profile');
      return {
        success: true,
        user: response.data.user
      };
    } catch (error) {
      throw {
        success: false,
        message: error.response?.data?.message || 'Failed to get profile',
        code: error.response?.data?.code || 'PROFILE_ERROR'
      };
    }
  },

  /**
   * Forgot Password (if implemented)
   * POST /api/auth/forgot-password
   */
  forgotPassword: async (email) => {
    try {
      const response = await api.post('/auth/forgot-password', {
        email: email.trim().toLowerCase()
      });
      
      return {
        success: true,
        ...response.data
      };
    } catch (error) {
      throw {
        success: false,
        message: error.response?.data?.message || 'Failed to send reset email',
        code: error.response?.data?.code || 'FORGOT_PASSWORD_ERROR'
      };
    }
  }
};