// src/store/index.js
// Centralized exports for all stores
import useAuthStore from './authStore';
import useRequestStore from './requestStore';
import useFormTemplateStore from './formTemplateStore';
import useUserStore from './userStore';
import useFileStore from './fileStore';

export { default as useAuthStore } from './authStore';
export { default as useRequestStore } from './requestStore';
export { default as useFormTemplateStore } from './formTemplateStore';
export { default as useUserStore } from './userStore';
export { default as useFileStore } from './fileStore';

/**
 * Initialize all stores - call this in your App.jsx
 */
export const initializeStores = () => {
  // Initialize auth store to check for existing tokens
  const authStore = useAuthStore.getState();
  if (authStore.initialize) {
    authStore.initialize();
  }

  // Initialize other stores as needed
  console.log('🏪 Stores initialized');
};

/**
 * Reset all stores - useful for logout or testing
 */
export const resetAllStores = () => {
  // Reset auth store
  useAuthStore.getState().logout();
  
  // Clear other stores
  useRequestStore.getState().clearRequests();
  useFormTemplateStore.getState().clearTemplates();
  useUserStore.getState().clearUsers();
  useFileStore.getState().clearFiles();
  
  console.log('🧹 All stores reset');
};

/**
 * Development helpers
 */
if (import.meta.env.DEV) {
  window.stores = {
    auth: useAuthStore,
    request: useRequestStore,
    template: useFormTemplateStore,
    user: useUserStore,
    file: useFileStore
  };
  
  window.initStores = initializeStores;
  window.resetStores = resetAllStores;
}