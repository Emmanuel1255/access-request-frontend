// src/utils/errorHandler.js
import toast from 'react-hot-toast';
/** 
 * Centralized error handling utility
 */

/**
 * Handle API errors with user-friendly messages
 */
export const handleApiError = (error, customMessage = null, showToast = true) => {
    console.error('API Error:', error);
    
    let message = customMessage || 'An unexpected error occurred';
    let code = 'UNKNOWN_ERROR';
    
    if (error.message && typeof error.message === 'string') {
      message = error.message;
      code = error.code || 'API_ERROR';
    } else if (error.response) {
      // Server responded with error status
      const { status, data } = error.response;
      
      if (data?.message) {
        message = data.message;
        code = data.code || 'SERVER_ERROR';
      } else if (data?.error) {
        message = data.error;
        code = data.code || 'SERVER_ERROR';
      } else {
        // Default messages based on status codes
        switch (status) {
          case 400:
            message = 'Invalid request. Please check your input.';
            code = 'BAD_REQUEST';
            break;
          case 401:
            message = 'Authentication required. Please log in.';
            code = 'UNAUTHORIZED';
            break;
          case 403:
            message = 'Access denied. You do not have permission for this action.';
            code = 'FORBIDDEN';
            break;
          case 404:
            message = 'The requested resource was not found.';
            code = 'NOT_FOUND';
            break;
          case 422:
            message = 'Validation error. Please check your input.';
            code = 'VALIDATION_ERROR';
            break;
          case 429:
            message = 'Too many requests. Please try again later.';
            code = 'RATE_LIMITED';
            break;
          case 500:
            message = 'Server error. Please try again later.';
            code = 'INTERNAL_ERROR';
            break;
          case 503:
            message = 'Service temporarily unavailable. Please try again later.';
            code = 'SERVICE_UNAVAILABLE';
            break;
          default:
            message = `Server error (${status}). Please try again later.`;
            code = 'HTTP_ERROR';
        }
      }
    } else if (error.request) {
      // Network error (no response received)
      message = 'Network error. Please check your internet connection.';
      code = 'NETWORK_ERROR';
    }
    
    if (showToast) {
      toast.error(message);
    }
    
    return {
      message,
      code,
      originalError: error
    };
  };
  
  /**
   * Handle validation errors from API responses
   */
  export const handleValidationErrors = (validationErrors, showToast = true) => {
    if (!Array.isArray(validationErrors)) {
      return [];
    }
  
    const formattedErrors = validationErrors.map(error => {
      const message = error.message || error.msg || 'Validation error';
      const field = error.field || error.param || error.path || 'unknown';
      
      if (showToast) {
        toast.error(`${field}: ${message}`);
      }
      
      return {
        field,
        message,
        value: error.value
      };
    });
  
    return formattedErrors;
  };
  
  /**
   * Create a retry wrapper for API calls
   */
  export const withRetry = async (apiCall, maxRetries = 3, delay = 1000) => {
    let lastError;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await apiCall();
      } catch (error) {
        lastError = error;
        
        // Don't retry on certain errors
        if (error.response?.status && [400, 401, 403, 404, 422].includes(error.response.status)) {
          throw error;
        }
        
        // Don't retry on last attempt
        if (attempt === maxRetries) {
          break;
        }
        
        // Wait before retry
        await new Promise(resolve => setTimeout(resolve, delay * attempt));
        
        console.log(`API call failed, retrying... (attempt ${attempt + 1}/${maxRetries})`);
      }
    }
    
    throw lastError;
  };
  
  /**
   * Loading state wrapper for API calls
   */
  export const withLoading = async (apiCall, setLoading) => {
    try {
      setLoading(true);
      return await apiCall();
    } finally {
      setLoading(false);
    }
  };
  
  /**
   * Success message handler
   */
  export const handleApiSuccess = (message, showToast = true) => {
    if (showToast && message) {
      toast.success(message);
    }
  };
  
  /**
   * Format error for display in UI
   */
  export const formatErrorForDisplay = (error) => {
    if (typeof error === 'string') {
      return error;
    }
    
    if (error?.message) {
      return error.message;
    }
    
    if (error?.response?.data?.message) {
      return error.response.data.message;
    }
    
    return 'An unexpected error occurred';
  };
  
  /**
   * Check if error is a specific type
   */
  export const isErrorType = (error, type) => {
    return error?.code === type || error?.response?.data?.code === type;
  };
  
  /**
   * Extract error details for debugging
   */
  export const getErrorDetails = (error) => {
    return {
      message: error?.message,
      code: error?.code || error?.response?.data?.code,
      status: error?.response?.status,
      url: error?.config?.url,
      method: error?.config?.method,
      timestamp: new Date().toISOString(),
      stack: error?.stack
    };
  };