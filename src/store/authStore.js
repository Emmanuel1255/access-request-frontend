import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { demoUsers, USER_ROLES } from '../data/demoData';

const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      permissions: [],

      // Demo login - replace with real API call later
      login: async (credentials) => {
        try {
          // Simulate API call
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          const user = demoUsers.find(u => 
            u.username === credentials.username && 
            credentials.password === 'password123' // Demo password
          );

          if (!user) {
            throw new Error('Invalid credentials');
          }

          const token = 'demo-jwt-token-' + Date.now();
          const permissions = getPermissionsByRole(user.role);

          set({
            user,
            token,
            isAuthenticated: true,
            permissions
          });

          return { user, token };
        } catch (error) {
          throw error;
        }
      },

      logout: () => {
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          permissions: []
        });
      },

      // Helper methods
      hasPermission: (permission) => {
        const { permissions } = get();
        return permissions.includes(permission);
      },

      isAdmin: () => {
        const { user } = get();
        return user?.role === USER_ROLES.ADMIN;
      },

      isManager: () => {
        const { user } = get();
        return user?.role === USER_ROLES.MANAGER;
      },

      isApprover: () => {
        const { user } = get();
        return [USER_ROLES.ADMIN, USER_ROLES.MANAGER, USER_ROLES.APPROVER].includes(user?.role);
      },

      // Update profile method with signature support
      updateProfile: (profileData) => {
        const { user } = get();
        const updatedUser = { ...user, ...profileData, updatedAt: new Date().toISOString() };
        
        // Update demo data
        const userIndex = demoUsers.findIndex(u => u.id === user.id);
        if (userIndex !== -1) {
          demoUsers[userIndex] = updatedUser;
        }
        
        set({ user: updatedUser });
        
        return updatedUser;
      },
      
      // Avatar upload method
      uploadAvatar: async (file) => {
        try {
          // Simulate file upload
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // In real app, upload to server and get URL
          const avatarUrl = URL.createObjectURL(file);
          
          get().updateProfile({ avatarUrl });
          return avatarUrl;
        } catch (error) {
          throw new Error('Failed to upload avatar');
        }
      },

      // Signature upload method
      uploadSignature: async (signatureData) => {
        try {
          // Simulate signature upload
          await new Promise(resolve => setTimeout(resolve, 800));
          
          // In real app, upload signature to server and get URL
          // For demo, we'll store the base64 data directly
          const signatureUrl = signatureData;
          
          get().updateProfile({ signatureUrl });
          return signatureUrl;
        } catch (error) {
          throw new Error('Failed to upload signature');
        }
      },

      // Get user signature for approvals
      getUserSignature: () => {
        const { user } = get();
        return user?.signatureUrl || null;
      },

      // Check if user has signature
      hasSignature: () => {
        const { user } = get();
        return !!(user?.signatureUrl);
      },

      // Clear signature
      clearSignature: async () => {
        try {
          // Simulate API call
          await new Promise(resolve => setTimeout(resolve, 300));
          
          get().updateProfile({ signatureUrl: null });
          return true;
        } catch (error) {
          throw new Error('Failed to clear signature');
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
        permissions: state.permissions
      })
    }
  )
);

// Helper function to get permissions by role
function getPermissionsByRole(role) {
  const permissionMap = {
    [USER_ROLES.ADMIN]: [
      'manage_users',
      'manage_templates',
      'view_all_requests',
      'manage_settings',
      'view_reports',
      'manage_system'
    ],
    [USER_ROLES.MANAGER]: [
      'manage_templates',
      'view_department_requests',
      'approve_requests',
      'view_reports'
    ],
    [USER_ROLES.APPROVER]: [
      'approve_requests',
      'view_assigned_requests'
    ],
    [USER_ROLES.USER]: [
      'create_requests',
      'view_own_requests'
    ]
  };
  
  return permissionMap[role] || permissionMap[USER_ROLES.USER];
}

export default useAuthStore;