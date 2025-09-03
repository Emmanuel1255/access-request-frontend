// src/services/index.js
// Centralized exports for all services

export { authService } from './authService';
export { requestService } from './requestService';
export { formTemplateService } from './formTemplateService';
export { userService } from './userService';
export { fileService } from './fileService';

// Re-export the main API instance
export { default as api, checkApiHealth } from './api';

// Re-export error handling utilities
export * from '../utils/errorHandler';

/**
 * Service status checker - useful for debugging
 */
export const checkAllServices = async () => {
  const results = [];
  
  try {
    // Test health endpoint
    const health = await checkApiHealth();
    results.push({ service: 'API Health', ...health });
    
    // Test auth service (should fail without credentials, but endpoint should exist)
    try {
      await authService.getProfile();
      results.push({ service: 'Auth Service', success: true, note: 'Unexpected success' });
    } catch (error) {
      if (error?.code === 'UNAUTHORIZED' || error?.status === 401) {
        results.push({ service: 'Auth Service', success: true, note: 'Properly secured' });
      } else {
        results.push({ service: 'Auth Service', success: false, error: error.message });
      }
    }
    
    // Test request service (should fail without auth)
    try {
      await requestService.getRequests({ limit: 1 });
      results.push({ service: 'Request Service', success: true, note: 'Unexpected success' });
    } catch (error) {
      if (error?.code === 'UNAUTHORIZED' || error?.status === 401) {
        results.push({ service: 'Request Service', success: true, note: 'Properly secured' });
      } else {
        results.push({ service: 'Request Service', success: false, error: error.message });
      }
    }
    
    // Test template service (should fail without auth)
    try {
      await formTemplateService.getTemplates({ limit: 1 });
      results.push({ service: 'Template Service', success: true, note: 'Unexpected success' });
    } catch (error) {
      if (error?.code === 'UNAUTHORIZED' || error?.status === 401) {
        results.push({ service: 'Template Service', success: true, note: 'Properly secured' });
      } else {
        results.push({ service: 'Template Service', success: false, error: error.message });
      }
    }
    
  } catch (error) {
    results.push({ service: 'General', success: false, error: error.message });
  }
  
  return results;
};

// Development helpers
if (import.meta.env.DEV) {
  window.checkServices = checkAllServices;
}