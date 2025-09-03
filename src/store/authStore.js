// src/store/authStore.js
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authService } from '../services';
import { handleApiError, handleApiSuccess } from '../utils/errorHandler';

const useAuthStore = create(
  persist(
    (set, get) => ({
      // State
      user: null,
      isAuthenticated: false,
      loading: false,
      error: null,
      pendingAuth: null, // For OTP verification
      
      // Actions
      login: async (credentials) => {
        set({ loading: true, error: null });
        
        try {
          const response = await authService.loginAD(
            credentials.username, 
            credentials.password
          );
          
          if (response.requiresOTP) {
            // Store pending auth data for OTP verification
            set({
              loading: false,
              pendingAuth: {
                userId: response.userId,
                contactInfo: response.contactInfo,
                username: credentials.username
              },
              error: null
            });
            
            return {
              success: true,
              requiresOTP: true,
              userId: response.userId,
              contactInfo: response.contactInfo,
              message: response.message
            };
          } else {
            // Direct login success (no OTP required)
            localStorage.setItem('authToken', response.token);
            localStorage.setItem('refreshToken', response.refreshToken);
            
            set({
              user: response.user,
              isAuthenticated: true,
              loading: false,
              error: null,
              pendingAuth: null
            });
            
            handleApiSuccess(response.message || 'Login successful!');
            
            return {
              success: true,
              requiresOTP: false,
              user: response.user,
              message: response.message
            };
          }
        } catch (error) {
          const errorInfo = handleApiError(error, 'Login failed');
          set({ 
            loading: false, 
            error: errorInfo.message,
            pendingAuth: null
          });
          throw error;
        }
      },

      loginLocal: async (credentials) => {
        set({ loading: true, error: null });
        
        try {
          const response = await authService.loginLocal(
            credentials.email, 
            credentials.password
          );
          
          if (response.requiresOTP) {
            set({
              loading: false,
              pendingAuth: {
                userId: response.userId,
                contactInfo: response.contactInfo,
                email: credentials.email
              },
              error: null
            });
            
            return {
              success: true,
              requiresOTP: true,
              userId: response.userId,
              contactInfo: response.contactInfo,
              message: response.message
            };
          } else {
            localStorage.setItem('authToken', response.token);
            localStorage.setItem('refreshToken', response.refreshToken);
            
            set({
              user: response.user,
              isAuthenticated: true,
              loading: false,
              error: null,
              pendingAuth: null
            });
            
            handleApiSuccess(response.message || 'Login successful!');
            
            return {
              success: true,
              requiresOTP: false,
              user: response.user,
              message: response.message
            };
          }
        } catch (error) {
          const errorInfo = handleApiError(error, 'Login failed');
          set({ 
            loading: false, 
            error: errorInfo.message,
            pendingAuth: null
          });
          throw error;
        }
      },

      verifyOTP: async (otpCode, type = 'login') => {
        const { pendingAuth } = get();
        if (!pendingAuth?.userId) {
          const error = new Error('No pending authentication found');
          handleApiError(error, 'Please restart the login process');
          throw error;
        }

        set({ loading: true, error: null });
        
        try {
          const response = await authService.verifyOTP(
            pendingAuth.userId,
            otpCode,
            type
          );
          
          localStorage.setItem('authToken', response.token);
          localStorage.setItem('refreshToken', response.refreshToken);
          
          set({
            user: response.user,
            isAuthenticated: true,
            loading: false,
            error: null,
            pendingAuth: null
          });
          
          handleApiSuccess(response.message || 'Authentication successful!');
          
          return {
            success: true,
            user: response.user,
            message: response.message
          };
        } catch (error) {
          const errorInfo = handleApiError(error, 'OTP verification failed');
          set({ 
            loading: false, 
            error: errorInfo.message
          });
          throw error;
        }
      },

      resendOTP: async (type = 'login') => {
        const { pendingAuth } = get();
        if (!pendingAuth?.userId) {
          const error = new Error('No pending authentication found');
          handleApiError(error, 'Please restart the login process');
          throw error;
        }

        set({ loading: true, error: null });
        
        try {
          const response = await authService.resendOTP(pendingAuth.userId, type);
          
          set({ loading: false, error: null });
          handleApiSuccess(response.message || 'OTP sent successfully!');
          
          return {
            success: true,
            message: response.message
          };
        } catch (error) {
          const errorInfo = handleApiError(error, 'Failed to resend OTP');
          set({ 
            loading: false, 
            error: errorInfo.message
          });
          throw error;
        }
      },

      logout: async () => {
        set({ loading: true });
        
        try {
          await authService.logout();
        } catch (error) {
          console.error('Logout API call failed:', error);
          // Continue with logout even if API call fails
        }
        
        // Clear local storage
        localStorage.removeItem('authToken');
        localStorage.removeItem('refreshToken');
        
        // Reset state
        set({
          user: null,
          isAuthenticated: false,
          loading: false,
          error: null,
          pendingAuth: null
        });
        
        handleApiSuccess('Logged out successfully');
      },

      refreshToken: async () => {
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }

        try {
          const response = await authService.refreshToken(refreshToken);
          
          localStorage.setItem('authToken', response.token);
          if (response.refreshToken) {
            localStorage.setItem('refreshToken', response.refreshToken);
          }
          
          // Update user data if provided
          if (response.user) {
            set({ user: response.user });
          }
          
          return {
            success: true,
            token: response.token
          };
        } catch (error) {
          // If refresh fails, logout user
          get().logout();
          throw error;
        }
      },

      getProfile: async () => {
        set({ loading: true, error: null });
        
        try {
          const response = await authService.getProfile();
          
          set({
            user: response.user,
            loading: false,
            error: null
          });
          
          return {
            success: true,
            user: response.user
          };
        } catch (error) {
          const errorInfo = handleApiError(error, 'Failed to fetch profile', false);
          set({ 
            loading: false, 
            error: errorInfo.message
          });
          throw error;
        }
      },

      forgotPassword: async (email) => {
        set({ loading: true, error: null });
        
        try {
          const response = await authService.forgotPassword(email);
          
          set({ loading: false, error: null });
          handleApiSuccess(response.message || 'Password reset instructions sent!');
          
          return {
            success: true,
            message: response.message
          };
        } catch (error) {
          const errorInfo = handleApiError(error, 'Failed to send reset email');
          set({ 
            loading: false, 
            error: errorInfo.message
          });
          throw error;
        }
      },

      clearError: () => set({ error: null }),
      
      clearPendingAuth: () => set({ pendingAuth: null }),

      // Initialize auth state from stored tokens
      initialize: () => {
        const token = localStorage.getItem('authToken');
        const refreshToken = localStorage.getItem('refreshToken');
        
        if (token && refreshToken) {
          // Try to get profile to verify token is still valid
          get().getProfile().catch(() => {
            // If profile fetch fails, clear tokens
            localStorage.removeItem('authToken');
            localStorage.removeItem('refreshToken');
          });
        }
      }
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated
      })
    }
  )
);

export default useAuthStore;