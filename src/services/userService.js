// src/services/userService.js
import api from './api';

/**
 * User management service
 * Based on your backend user routes
 */
export const userService = {
  /**
   * Get users with filtering and pagination
   * GET /api/users
   */
  getUsers: async (params = {}) => {
    try {
      const queryParams = {
        page: params.page || 1,
        limit: params.limit || 20,
        search: params.search || '',
        role: params.role || '',
        department: params.department || '',
        isActive: params.isActive !== undefined ? params.isActive : true,
        sortBy: params.sortBy || 'username',
        sortOrder: params.sortOrder || 'asc',
        ...params
      };

      const response = await api.get('/users', { params: queryParams });
      
      return {
        success: true,
        users: response.data.users || [],
        pagination: response.data.pagination || {},
        message: response.data.message
      };
    } catch (error) {
      throw {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch users',
        code: error.response?.data?.code || 'FETCH_ERROR'
      };
    }
  },

  /**
   * Get user by ID
   * GET /api/users/:userId
   */
  getUserById: async (userId) => {
    try {
      const response = await api.get(`/users/${userId}`);
      
      return {
        success: true,
        user: response.data.user,
        message: response.data.message
      };
    } catch (error) {
      throw {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch user',
        code: error.response?.data?.code || 'FETCH_ERROR',
        status: error.response?.status
      };
    }
  },

  /**
   * Update user profile
   * PUT /api/users/:userId
   */
  updateUser: async (userId, userData) => {
    try {
      const payload = {
        email: userData.email?.trim().toLowerCase(),
        phoneNumber: userData.phoneNumber?.trim(),
        jobTitle: userData.jobTitle?.trim(),
        department: userData.department?.trim(),
        role: userData.role,
        isActive: userData.isActive,
        ...userData
      };

      const response = await api.put(`/users/${userId}`, payload);
      
      return {
        success: true,
        user: response.data.user,
        message: response.data.message || 'User updated successfully'
      };
    } catch (error) {
      throw {
        success: false,
        message: error.response?.data?.message || 'Failed to update user',
        code: error.response?.data?.code || 'UPDATE_ERROR',
        validationErrors: error.response?.data?.validationErrors || []
      };
    }
  },

  /**
   * Get current user's profile
   * GET /api/users/profile
   */
  getProfile: async () => {
    try {
      const response = await api.get('/users/profile');
      
      return {
        success: true,
        user: response.data.user,
        message: response.data.message
      };
    } catch (error) {
      throw {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch profile',
        code: error.response?.data?.code || 'PROFILE_ERROR'
      };
    }
  },

  /**
   * Update current user's profile
   * PUT /api/users/profile
   */
  updateProfile: async (profileData) => {
    try {
      const payload = {
        email: profileData.email?.trim().toLowerCase(),
        phoneNumber: profileData.phoneNumber?.trim(),
        jobTitle: profileData.jobTitle?.trim(),
        department: profileData.department?.trim(),
        preferences: profileData.preferences || {},
        ...profileData
      };

      const response = await api.put('/users/profile', payload);
      
      return {
        success: true,
        user: response.data.user,
        message: response.data.message || 'Profile updated successfully'
      };
    } catch (error) {
      throw {
        success: false,
        message: error.response?.data?.message || 'Failed to update profile',
        code: error.response?.data?.code || 'UPDATE_ERROR',
        validationErrors: error.response?.data?.validationErrors || []
      };
    }
  }
};