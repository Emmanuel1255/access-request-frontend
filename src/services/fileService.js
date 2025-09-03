// src/services/fileService.js
import api from './api';

/**
 * File upload and management service
 */
export const fileService = {
  /**
   * Upload single file
   * POST /api/files/upload (or your upload endpoint)
   */
  uploadFile: async (file, requestId = null, onProgress = null) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      if (requestId) formData.append('requestId', requestId);

      const response = await api.post('/files/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          if (onProgress && progressEvent.total) {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            onProgress(percentCompleted);
          }
        }
      });

      return {
        success: true,
        file: response.data.file,
        message: response.data.message || 'File uploaded successfully'
      };
    } catch (error) {
      throw {
        success: false,
        message: error.response?.data?.message || 'File upload failed',
        code: error.response?.data?.code || 'UPLOAD_ERROR'
      };
    }
  },

  /**
   * Upload multiple files
   * POST /api/files/upload-multiple
   */
  uploadMultipleFiles: async (files, requestId = null, onProgress = null) => {
    try {
      const formData = new FormData();
      files.forEach((file, index) => {
        formData.append(`files`, file);
      });
      if (requestId) formData.append('requestId', requestId);

      const response = await api.post('/files/upload-multiple', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          if (onProgress && progressEvent.total) {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            onProgress(percentCompleted);
          }
        }
      });

      return {
        success: true,
        files: response.data.files || [],
        message: response.data.message || 'Files uploaded successfully'
      };
    } catch (error) {
      throw {
        success: false,
        message: error.response?.data?.message || 'File upload failed',
        code: error.response?.data?.code || 'UPLOAD_ERROR'
      };
    }
  },

  /**
   * Download file
   * GET /api/files/:fileId
   */
  downloadFile: async (fileId, filename = 'download') => {
    try {
      const response = await api.get(`/files/${fileId}`, {
        responseType: 'blob'
      });

      // Create blob link to download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      return {
        success: true,
        message: 'File downloaded successfully'
      };
    } catch (error) {
      throw {
        success: false,
        message: error.response?.data?.message || 'Download failed',
        code: error.response?.data?.code || 'DOWNLOAD_ERROR'
      };
    }
  },

   /**
   * Delete file
   * DELETE /api/files/:fileId
   */
   deleteFile: async (fileId) => {
    try {
      const response = await api.delete(`/files/${fileId}`);
      
      return {
        success: true,
        message: response.data.message || 'File deleted successfully'
      };
    } catch (error) {
      throw {
        success: false,
        message: error.response?.data?.message || 'Failed to delete file',
        code: error.response?.data?.code || 'DELETE_ERROR'
      };
    }
  },

  /**
   * Get file info/metadata
   * GET /api/files/:fileId/info
   */
  getFileInfo: async (fileId) => {
    try {
      const response = await api.get(`/files/${fileId}/info`);
      
      return {
        success: true,
        file: response.data.file,
        message: response.data.message
      };
    } catch (error) {
      throw {
        success: false,
        message: error.response?.data?.message || 'Failed to get file info',
        code: error.response?.data?.code || 'INFO_ERROR'
      };
    }
  },

  /**
   * Validate file before upload
   */
  validateFile: (file, maxSize = 50 * 1024 * 1024, allowedTypes = []) => {
    const errors = [];

    // Check file size (default 50MB)
    if (file.size > maxSize) {
      errors.push(`File size must be less than ${Math.round(maxSize / 1024 / 1024)}MB`);
    }

    // Check file type if specified
    if (allowedTypes.length > 0 && !allowedTypes.includes(file.type)) {
      errors.push(`File type ${file.type} is not allowed`);
    }

    // Check file name
    if (file.name.length > 255) {
      errors.push('File name is too long');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
};