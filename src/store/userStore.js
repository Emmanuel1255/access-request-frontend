import { create } from 'zustand';
import { demoUsers, USER_ROLES } from '../data/demoData';
import toast from 'react-hot-toast';

const useUserStore = create((set, get) => ({
  users: [],
  currentUser: null,
  loading: false,
  error: null,
  filters: {
    search: '',
    role: '',
    department: '',
    status: '',
    page: 1,
    limit: 10,
    sortBy: 'fullName',
    sortOrder: 'asc'
  },
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  },

  // Fetch users with filters and pagination
  fetchUsers: async () => {
    set({ loading: true, error: null });
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const { filters } = get();
      let filteredUsers = [...demoUsers];

      // Apply filters
      if (filters.search) {
        filteredUsers = filteredUsers.filter(user =>
          user.fullName?.toLowerCase().includes(filters.search.toLowerCase()) ||
          user.username?.toLowerCase().includes(filters.search.toLowerCase()) ||
          user.email?.toLowerCase().includes(filters.search.toLowerCase())
        );
      }

      if (filters.role) {
        filteredUsers = filteredUsers.filter(user => user.role === filters.role);
      }

      if (filters.department) {
        filteredUsers = filteredUsers.filter(user => user.department === filters.department);
      }

      if (filters.status !== '') {
        const isActive = filters.status === 'active';
        filteredUsers = filteredUsers.filter(user => user.isActive === isActive);
      }

      // Apply sorting
      filteredUsers.sort((a, b) => {
        const aValue = a[filters.sortBy] || '';
        const bValue = b[filters.sortBy] || '';
        
        if (filters.sortOrder === 'asc') {
          return aValue.localeCompare(bValue);
        } else {
          return bValue.localeCompare(aValue);
        }
      });

      // Apply pagination
      const total = filteredUsers.length;
      const pages = Math.ceil(total / filters.limit);
      const startIndex = (filters.page - 1) * filters.limit;
      const endIndex = startIndex + filters.limit;
      const paginatedUsers = filteredUsers.slice(startIndex, endIndex);

      set({
        users: paginatedUsers,
        pagination: {
          page: filters.page,
          limit: filters.limit,
          total,
          pages
        },
        loading: false
      });
    } catch (error) {
      console.error('Failed to fetch users:', error);
      set({ error: error.message, loading: false });
      toast.error('Failed to fetch users');
    }
  },

  // Create new user
  createUser: async (userData) => {
    set({ loading: true });
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const newUser = {
        id: Math.max(...demoUsers.map(u => u.id)) + 1,
        ...userData,
        createdAt: new Date().toISOString(),
        isActive: true
      };
      
      demoUsers.push(newUser);
      
      // Refresh users list
      await get().fetchUsers();
      
      toast.success('User created successfully');
      set({ loading: false });
      
      return newUser;
    } catch (error) {
      console.error('Failed to create user:', error);
      set({ loading: false });
      toast.error('Failed to create user');
      throw error;
    }
  },

  // Update user
  updateUser: async (userId, updates) => {
    set({ loading: true });
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 600));
      
      const userIndex = demoUsers.findIndex(u => u.id === userId);
      if (userIndex === -1) {
        throw new Error('User not found');
      }
      
      demoUsers[userIndex] = {
        ...demoUsers[userIndex],
        ...updates,
        updatedAt: new Date().toISOString()
      };
      
      // Refresh users list
      await get().fetchUsers();
      
      toast.success('User updated successfully');
      set({ loading: false });
      
      return demoUsers[userIndex];
    } catch (error) {
      console.error('Failed to update user:', error);
      set({ loading: false });
      toast.error('Failed to update user');
      throw error;
    }
  },

  // Delete user
  deleteUser: async (userId) => {
    set({ loading: true });
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 400));
      
      const userIndex = demoUsers.findIndex(u => u.id === userId);
      if (userIndex === -1) {
        throw new Error('User not found');
      }
      
      demoUsers.splice(userIndex, 1);
      
      // Refresh users list
      await get().fetchUsers();
      
      toast.success('User deleted successfully');
      set({ loading: false });
    } catch (error) {
      console.error('Failed to delete user:', error);
      set({ loading: false });
      toast.error('Failed to delete user');
      throw error;
    }
  },

  // Set filters
  setFilters: (newFilters) => {
    set({
      filters: { ...get().filters, ...newFilters }
    });
  },

  // Export users
  exportUsers: async () => {
    try {
      const { users } = get();
      
      // Create CSV content
      const headers = ['Name', 'Username', 'Email', 'Role', 'Department', 'Status', 'Last Login'];
      const csvContent = [
        headers.join(','),
        ...users.map(user => [
          user.fullName || '',
          user.username || '',
          user.email || '',
          user.role || '',
          user.department || '',
          user.isActive ? 'Active' : 'Inactive',
          user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never'
        ].join(','))
      ].join('\n');
      
      // Download file
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `users-export-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast.success('Users exported successfully');
    } catch (error) {
      console.error('Failed to export users:', error);
      toast.error('Failed to export users');
    }
  },

  // Sync with Active Directory
  syncWithAD: async () => {
    set({ loading: true });
    
    try {
      // Simulate AD sync
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Add some demo synced users
      const syncedUsers = [
        {
          id: Math.max(...demoUsers.map(u => u.id)) + 1,
          username: 'sarah.wilson',
          email: 'sarah.wilson@company.com',
          fullName: 'Sarah Wilson',
          role: 'user',
          department: 'Marketing',
          isActive: true,
          createdAt: new Date().toISOString(),
          lastSyncedAt: new Date().toISOString()
        }
      ];
      
      demoUsers.push(...syncedUsers);
      
      // Refresh users list
      await get().fetchUsers();
      
      toast.success(`Synced ${syncedUsers.length} users from Active Directory`);
      set({ loading: false });
    } catch (error) {
      console.error('Failed to sync with AD:', error);
      set({ loading: false });
      toast.error('Failed to sync with Active Directory');
    }
  },

  // Get departments for filtering
  getDepartments: () => {
    const departments = [...new Set(demoUsers.map(u => u.department).filter(Boolean))];
    return departments.sort();
  },

  // Reset store
  reset: () => {
    set({
      users: [],
      currentUser: null,
      loading: false,
      error: null,
      filters: {
        search: '',
        role: '',
        department: '',
        status: '',
        page: 1,
        limit: 10,
        sortBy: 'fullName',
        sortOrder: 'asc'
      },
      pagination: {
        page: 1,
        limit: 10,
        total: 0,
        pages: 0
      }
    });
  }
}));

export default useUserStore;