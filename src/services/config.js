// src/services/config.js
// Service configuration and constants

/**
 * API endpoints configuration
 */
export const API_ENDPOINTS = {
    // Auth endpoints
    AUTH: {
      LOGIN_AD: '/auth/login-ad',
      LOGIN_LOCAL: '/auth/login-local',
      VERIFY_OTP: '/auth/verify-otp',
      RESEND_OTP: '/auth/resend-otp',
      LOGOUT: '/auth/logout',
      REFRESH_TOKEN: '/auth/refresh-token',
      PROFILE: '/auth/profile',
      FORGOT_PASSWORD: '/auth/forgot-password'
    },
    
    // Request endpoints
    REQUESTS: {
      BASE: '/requests',
      BY_ID: (id) => `/requests/${id}`,
      PROCESS: (id) => `/requests/${id}/process`,
      COMMENTS: (id) => `/requests/${id}/comments`,
      WITHDRAW: (id) => `/requests/${id}/withdraw`,
      CANCEL: (id) => `/requests/${id}/cancel`,
      DELEGATE: (id) => `/requests/${id}/delegate`,
      TIMELINE: (id) => `/requests/${id}/timeline`,
      BULK: '/requests/bulk'
    },
    
    // Form template endpoints
    TEMPLATES: {
      BASE: '/form-templates',
      BY_ID: (id) => `/form-templates/${id}`,
      CLONE: (id) => `/form-templates/${id}/clone`,
      CATEGORIES: '/form-templates/categories',
      VALIDATE_SCHEMA: '/form-templates/validate-schema'
    },
    
    // User endpoints
    USERS: {
      BASE: '/users',
      BY_ID: (id) => `/users/${id}`,
      PROFILE: '/users/profile'
    },
    
    // File endpoints
    FILES: {
      UPLOAD: '/files/upload',
      UPLOAD_MULTIPLE: '/files/upload-multiple',
      BY_ID: (id) => `/files/${id}`,
      INFO: (id) => `/files/${id}/info`
    }
  };
  
  /**
   * Default pagination settings
   */
  export const DEFAULT_PAGINATION = {
    page: 1,
    limit: 10,
    sortBy: 'createdAt',
    sortOrder: 'desc'
  };
  
  /**
   * File upload settings
   */
  export const FILE_UPLOAD = {
    MAX_SIZE: 50 * 1024 * 1024, // 50MB
    ALLOWED_TYPES: [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'image/jpeg',
      'image/png',
      'image/gif',
      'text/plain',
      'application/zip',
      'application/x-zip-compressed'
    ],
    CHUNK_SIZE: 1024 * 1024 // 1MB chunks for large uploads
  };
  
  /**
   * Request priorities
   */
  export const REQUEST_PRIORITIES = {
    LOW: 'low',
    NORMAL: 'normal',
    HIGH: 'high',
    URGENT: 'urgent',
    CRITICAL: 'critical'
  };
  
  /**
   * Request statuses
   */
  export const REQUEST_STATUSES = {
    DRAFT: 'draft',
    PENDING: 'pending',
    IN_REVIEW: 'in_review',
    APPROVED: 'approved',
    REJECTED: 'rejected',
    CANCELLED: 'cancelled',
    WITHDRAWN: 'withdrawn'
  };
  
  /**
   * User roles
   */
  export const USER_ROLES = {
    ADMIN: 'admin',
    MANAGER: 'manager',
    APPROVER: 'approver',
    USER: 'user'
  };
  
  /**
   * API timeout settings
   */
  export const TIMEOUTS = {
    DEFAULT: 30000, // 30 seconds
    UPLOAD: 300000, // 5 minutes for file uploads
    DOWNLOAD: 120000 // 2 minutes for downloads
  };
  
  /**
   * Retry settings
   */
  export const RETRY_CONFIG = {
    MAX_RETRIES: 3,
    INITIAL_DELAY: 1000,
    MAX_DELAY: 10000,
    BACKOFF_FACTOR: 2
  };