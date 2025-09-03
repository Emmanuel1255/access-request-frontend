// src/store/userStore.js
import { create } from 'zustand';
import { userService } from '../services';
import { handleApiError, handleApiSuccess } from '../utils/errorHandler';

const useUserStore = create((set, get) => ({
  // State
  users: [],
  currentUser: null,
  loading: false,
  error: null,
  pagination: {
    page: 1,
    limit: 20,
    total: 0,
    pages: 0
  },
  filters: {
    search: '',
    role: '',
    department: '',
    isActive: true,
    sortBy: 'username',
    sortOrder: 'asc'
  },

  // Actions
  fetchUsers: async (params = {}) => {
    set({ loading: true, error: null });
    
    try {
      const { filters } = get();
      const queryParams = { ...filters, ...params };
      
      const response = await userService.getUsers(queryParams);
      
      set({
        users: response.users,
        pagination: response.pagination,
        loading: false,
        error: null
      });
      
      return {
        success: true,
        users: response.users,
        pagination: response.pagination
      };
    } catch (error) {
      const errorInfo = handleApiError(error, 'Failed to fetch users');
      set({
        loading: false,
        error: errorInfo.message,
        users: [],
        pagination: { page: 1, limit: 20, total: 0, pages: 0 }
      });
      throw error;
    }
  },

  fetchUser: async (userId) => {
    set({ loading: true, error: null });
    
    try {
      const response = await userService.getUserById(userId);
      
      set({
        currentUser: response.user,
        loading: false,
        error: null
      });
      
      return {
        success: true,
        user: response.user
      };
    } catch (error) {
      const errorInfo = handleApiError(error, 'Failed to fetch user details');
      set({
        loading: false,
        error: errorInfo.message,
        currentUser: null
      });
      throw error;
    }
  },

  updateUser: async (userId, userData) => {
    set({ loading: true, error: null });
    
    try {
      const response = await userService.updateUser(userId, userData);
      
      // Update in users list
      const { users } = get();
      const updatedUsers = users.map(user => 
        user.id === parseInt(userId) ? response.user : user
      );
      
      set({
        users: updatedUsers,
        currentUser: response.user,
        loading: false,
        error: null
      });
      
      handleApiSuccess(response.message || 'User updated successfully!');
      
      return {
        success: true,
        user: response.user,
        message: response.message
      };
    } catch (error) {
      const errorInfo = handleApiError(error, 'Failed to update user');
      set({
        loading: false,
        error: errorInfo.message
      });
      throw error;
    }
  },

  getProfile: async () => {
    set({ loading: true, error: null });
    
    try {
      const response = await userService.getProfile();
      
      set({
        currentUser: response.user,
        loading: false,
        error: null
      });
      
      return {
        success: true,
        user: response.user
      };
    } catch (error) {
      const errorInfo = handleApiError(error, 'Failed to fetch profile');
      set({
        loading: false,
        error: errorInfo.message,
        currentUser: null
      });
      throw error;
    }
  },

  updateProfile: async (profileData) => {
    set({ loading: true, error: null });
    
    try {
      const response = await userService.updateProfile(profileData);
      
      set({
        currentUser: response.user,
        loading: false,
        error: null
      });
      
      handleApiSuccess(response.message || 'Profile updated successfully!');
      
      return {
        success: true,
        user: response.user,
        message: response.message
      };
    } catch (error) {
      const errorInfo = handleApiError(error, 'Failed to update profile');
      set({
        loading: false,
        error: errorInfo.message
      });
      throw error;
    }
  },

  // Filter and pagination actions
  setFilters: (newFilters) => {
    set({ 
      filters: { ...get().filters, ...newFilters },
      pagination: { ...get().pagination, page: 1 } // Reset to first page
    });
    // Auto-fetch with new filters
    get().fetchUsers();
  },

  setPage: (page) => {
    set({ 
      pagination: { ...get().pagination, page }
    });
    // Auto-fetch with new page
    get().fetchUsers({ page });
  },

  setLimit: (limit) => {
    set({ 
      pagination: { ...get().pagination, limit, page: 1 }
    });
    // Auto-fetch with new limit
    get().fetchUsers({ limit, page: 1 });
  },

  // Clear actions
  clearCurrentUser: () => set({ currentUser: null }),
  clearError: () => set({ error: null }),
  clearUsers: () => set({ 
    users: [], 
    pagination: { page: 1, limit: 20, total: 0, pages: 0 } 
  }),

  // Search action
  searchUsers: (searchTerm) => {
    get().setFilters({ search: searchTerm });
  },

  // Role filter action
  filterByRole: (role) => {
    get().setFilters({ role });
  },

  // Department filter action
  filterByDepartment: (department) => {
    get().setFilters({ department });
  },

  // Active filter action
  filterByActive: (isActive) => {
    get().setFilters({ isActive });
  },

  // Get user by ID from current users (avoid API call if already loaded)
  getUserById: (userId) => {
    const { users } = get();
    return users.find(user => user.id === parseInt(userId)) || null;
  },

  // Refresh current data
  refresh: () => {
    get().fetchUsers();
  }
}));

export default useUserStore;