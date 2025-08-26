import { create } from 'zustand';
import { demoNotifications } from '../data/demoData';

const useNotificationStore = create((set, get) => ({
  notifications: [],
  unreadCount: 0,
  loading: false,
  error: null,
  preferences: {
    email: true,
    push: true,
    inApp: true,
    frequency: 'immediate' // immediate, daily, weekly
  },

  // Fetch notifications
  fetchNotifications: async () => {
    set({ loading: true, error: null });
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Get current user ID from auth store
      const authStore = (await import('./authStore')).default;
      const userId = authStore.getState().user?.id;
      
      if (!userId) {
        set({ notifications: [], unreadCount: 0, loading: false });
        return;
      }
      
      const notifications = demoNotifications
        .filter(n => n.userId === userId)
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      
      set({ 
        notifications,
        unreadCount: notifications.filter(n => !n.isRead).length,
        loading: false 
      });
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
      set({ error: error.message, loading: false });
    }
  },

  // Fetch unread count only
  fetchUnreadCount: async () => {
    try {
      const authStore = (await import('./authStore')).default;
      const userId = authStore.getState().user?.id;
      
      if (!userId) {
        set({ unreadCount: 0 });
        return;
      }

      const unreadNotifications = demoNotifications.filter(n => 
        n.userId === userId && !n.isRead
      );
      
      set({ unreadCount: unreadNotifications.length });
    } catch (error) {
      console.error('Failed to fetch unread count:', error);
    }
  },

  // Mark notification as read
  markAsRead: async (notificationId) => {
    const { notifications } = get();
    
    // Update local state immediately
    const updatedNotifications = notifications.map(n => 
      n.id === notificationId ? { ...n, isRead: true } : n
    );
    
    set({
      notifications: updatedNotifications,
      unreadCount: updatedNotifications.filter(n => !n.isRead).length
    });

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Update demo data
      const notification = demoNotifications.find(n => n.id === notificationId);
      if (notification) {
        notification.isRead = true;
      }
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
      // Revert on error
      get().fetchNotifications();
    }
  },

  // Mark all notifications as read
  markAllAsRead: async () => {
    const { notifications } = get();
    
    // Update local state immediately
    const updatedNotifications = notifications.map(n => ({ ...n, isRead: true }));
    
    set({
      notifications: updatedNotifications,
      unreadCount: 0
    });

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 200));
      
      // Update demo data
      const authStore = (await import('./authStore')).default;
      const userId = authStore.getState().user?.id;
      
      demoNotifications.forEach(n => {
        if (n.userId === userId) {
          n.isRead = true;
        }
      });
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
      // Revert on error
      get().fetchNotifications();
    }
  },

  // Add new notification (for real-time updates)
  addNotification: (notification) => {
    const { notifications } = get();
    const newNotifications = [notification, ...notifications];
    
    set({
      notifications: newNotifications,
      unreadCount: newNotifications.filter(n => !n.isRead).length
    });
  },

  // Update notification preferences
  updatePreferences: async (newPreferences) => {
    set({ preferences: { ...get().preferences, ...newPreferences } });
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 300));
      // In real app, send to backend
    } catch (error) {
      console.error('Failed to update preferences:', error);
    }
  },

  // Connect to real-time notification stream
  connectToStream: () => {
    // Simulate WebSocket connection
    const interval = setInterval(() => {
      // Randomly add new notifications for demo
      if (Math.random() > 0.95) {
        const authStore = require('./authStore').default;
        const userId = authStore.getState().user?.id;
        
        if (userId) {
          const newNotification = {
            id: Date.now(),
            userId,
            type: 'system',
            title: 'Demo Notification',
            message: 'This is a real-time demo notification',
            data: {},
            isRead: false,
            createdAt: new Date().toISOString()
          };
          
          get().addNotification(newNotification);
        }
      }
    }, 30000); // Check every 30 seconds

    // Store interval ID for cleanup
    set({ streamInterval: interval });
  },

  // Disconnect from stream
  disconnectFromStream: () => {
    const { streamInterval } = get();
    if (streamInterval) {
      clearInterval(streamInterval);
      set({ streamInterval: null });
    }
  },

  // Reset store
  reset: () => {
    const { streamInterval } = get();
    if (streamInterval) {
      clearInterval(streamInterval);
    }
    
    set({
      notifications: [],
      unreadCount: 0,
      loading: false,
      error: null,
      streamInterval: null
    });
  }
}));

export default useNotificationStore;