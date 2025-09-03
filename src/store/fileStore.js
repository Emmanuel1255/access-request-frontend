// src/store/fileStore.js
import { create } from 'zustand';
import { fileService } from '../services';
import { handleApiError, handleApiSuccess } from '../utils/errorHandler';

const useFileStore = create((set, get) => ({
  // State
  files: [],
  uploadProgress: {},
  loading: false,
  error: null,

  // Actions
  uploadFile: async (file, requestId = null) => {
    const fileId = `upload_${Date.now()}_${Math.random()}`;
    
    // Validate file before upload
    const validation = fileService.validateFile(file);
    if (!validation.isValid) {
      const errorMessage = validation.errors.join(', ');
      handleApiError({ message: errorMessage }, 'File validation failed');
      throw new Error(errorMessage);
    }

    // Initialize progress tracking
    set(state => ({
      uploadProgress: {
        ...state.uploadProgress,
        [fileId]: { progress: 0, status: 'uploading', fileName: file.name }
      },
      loading: true,
      error: null
    }));

    try {
      const response = await fileService.uploadFile(
        file, 
        requestId,
        (progress) => {
          // Update progress
          set(state => ({
            uploadProgress: {
              ...state.uploadProgress,
              [fileId]: { 
                ...state.uploadProgress[fileId], 
                progress 
              }
            }
          }));
        }
      );

      // Update progress to completed
      set(state => ({
        uploadProgress: {
          ...state.uploadProgress,
          [fileId]: { 
            ...state.uploadProgress[fileId], 
            progress: 100, 
            status: 'completed',
            fileData: response.file
          }
        },
        files: [...state.files, response.file],
        loading: false,
        error: null
      }));

      handleApiSuccess(response.message || 'File uploaded successfully!');

      return {
        success: true,
        file: response.file,
        fileId,
        message: response.message
      };
    } catch (error) {
      // Update progress to failed
      set(state => ({
        uploadProgress: {
          ...state.uploadProgress,
          [fileId]: { 
            ...state.uploadProgress[fileId], 
            status: 'failed',
            error: error.message
          }
        },
        loading: false,
        error: error.message
      }));

      const errorInfo = handleApiError(error, 'File upload failed');
      throw error;
    }
  },

  uploadMultipleFiles: async (files, requestId = null) => {
    const uploadIds = [];
    const results = [];

    set({ loading: true, error: null });

    try {
      for (const file of files) {
        const result = await get().uploadFile(file, requestId);
        results.push(result);
        uploadIds.push(result.fileId);
      }

      set({ loading: false });

      handleApiSuccess(`${results.length} files uploaded successfully!`);

      return {
        success: true,
        files: results.map(r => r.file),
        uploadIds,
        message: `${results.length} files uploaded successfully`
      };
    } catch (error) {
      set({ loading: false, error: error.message });
      throw error;
    }
  },

  downloadFile: async (fileId, filename = 'download') => {
    set({ loading: true, error: null });

    try {
      const response = await fileService.downloadFile(fileId, filename);
      
      set({ loading: false, error: null });
      handleApiSuccess(response.message || 'File downloaded successfully!');

      return {
        success: true,
        message: response.message
      };
    } catch (error) {
      const errorInfo = handleApiError(error, 'Download failed');
      set({
        loading: false,
        error: errorInfo.message
      });
      throw error;
    }
  },

  deleteFile: async (fileId) => {
    set({ loading: true, error: null });

    try {
      const response = await fileService.deleteFile(fileId);
      
      // Remove from files list
      const { files } = get();
      const updatedFiles = files.filter(file => file.id !== parseInt(fileId));
      
      set({
        files: updatedFiles,
        loading: false,
        error: null
      });

      handleApiSuccess(response.message || 'File deleted successfully!');

      return {
        success: true,
        message: response.message
      };
    } catch (error) {
      const errorInfo = handleApiError(error, 'Failed to delete file');
      set({
        loading: false,
        error: errorInfo.message
      });
      throw error;
    }
  },

  getFileInfo: async (fileId) => {
    try {
      const response = await fileService.getFileInfo(fileId);
      
      return {
        success: true,
        file: response.file
      };
    } catch (error) {
      const errorInfo = handleApiError(error, 'Failed to get file info', false);
      throw error;
    }
  },

  // Clear upload progress for specific file
  clearUploadProgress: (fileId) => {
    set(state => {
      const { [fileId]: removed, ...remaining } = state.uploadProgress;
      return { uploadProgress: remaining };
    });
  },

  // Clear all upload progress
  clearAllUploadProgress: () => {
    set({ uploadProgress: {} });
  },

  // Clear actions
  clearError: () => set({ error: null }),
  clearFiles: () => set({ files: [] }),

  // Get upload progress for specific file
  getUploadProgress: (fileId) => {
    const { uploadProgress } = get();
    return uploadProgress[fileId] || null;
  },

  // Get all active uploads
  getActiveUploads: () => {
    const { uploadProgress } = get();
    return Object.entries(uploadProgress)
      .filter(([_, progress]) => progress.status === 'uploading')
      .map(([fileId, progress]) => ({ fileId, ...progress }));
  },

  // Get completed uploads
  getCompletedUploads: () => {
    const { uploadProgress } = get();
    return Object.entries(uploadProgress)
      .filter(([_, progress]) => progress.status === 'completed')
      .map(([fileId, progress]) => ({ fileId, ...progress }));
  },

  // Get failed uploads
  getFailedUploads: () => {
    const { uploadProgress } = get();
    return Object.entries(uploadProgress)
      .filter(([_, progress]) => progress.status === 'failed')
      .map(([fileId, progress]) => ({ fileId, ...progress }));
  }
}));

export default useFileStore;