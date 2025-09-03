// src/store/requestStore.js
import { create } from 'zustand';
import { requestService } from '../services';
import { handleApiError, handleApiSuccess } from '../utils/errorHandler';

const useRequestStore = create((set, get) => ({
  // State
  requests: [],
  currentRequest: null,
  loading: false,
  error: null,
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  },
  filters: {
    search: '',
    status: '',
    priority: '',
    templateId: '',
    sortBy: 'createdAt',
    sortOrder: 'desc'
  },

  // Actions
  fetchRequests: async (params = {}) => {
    set({ loading: true, error: null });
    
    try {
      const { filters } = get();
      const queryParams = { ...filters, ...params };
      
      const response = await requestService.getRequests(queryParams);
      
      set({
        requests: response.requests,
        pagination: response.pagination,
        loading: false,
        error: null
      });
      
      return {
        success: true,
        requests: response.requests,
        pagination: response.pagination
      };
    } catch (error) {
      const errorInfo = handleApiError(error, 'Failed to fetch requests');
      set({
        loading: false,
        error: errorInfo.message,
        requests: [],
        pagination: { page: 1, limit: 10, total: 0, pages: 0 }
      });
      throw error;
    }
  },

  fetchRequest: async (requestId) => {
    set({ loading: true, error: null });
    
    try {
      const response = await requestService.getRequestById(requestId);
      
      set({
        currentRequest: response.request,
        loading: false,
        error: null
      });
      
      return {
        success: true,
        request: response.request
      };
    } catch (error) {
      const errorInfo = handleApiError(error, 'Failed to fetch request details');
      set({
        loading: false,
        error: errorInfo.message,
        currentRequest: null
      });
      throw error;
    }
  },

  createRequest: async (requestData) => {
    set({ loading: true, error: null });
    
    try {
      const response = await requestService.createRequest(requestData);
      
      // Add to requests list if currently loaded
      const { requests } = get();
      const updatedRequests = [response.request, ...requests];
      
      set({
        requests: updatedRequests,
        currentRequest: response.request,
        loading: false,
        error: null
      });
      
      handleApiSuccess(response.message || 'Request created successfully!');
      
      return {
        success: true,
        request: response.request,
        message: response.message
      };
    } catch (error) {
      const errorInfo = handleApiError(error, 'Failed to create request');
      set({
        loading: false,
        error: errorInfo.message
      });
      throw error;
    }
  },

  updateRequest: async (requestId, requestData) => {
    set({ loading: true, error: null });
    
    try {
      const response = await requestService.updateRequest(requestId, requestData);
      
      // Update in requests list
      const { requests } = get();
      const updatedRequests = requests.map(req => 
        req.id === parseInt(requestId) ? response.request : req
      );
      
      set({
        requests: updatedRequests,
        currentRequest: response.request,
        loading: false,
        error: null
      });
      
      handleApiSuccess(response.message || 'Request updated successfully!');
      
      return {
        success: true,
        request: response.request,
        message: response.message
      };
    } catch (error) {
      const errorInfo = handleApiError(error, 'Failed to update request');
      set({
        loading: false,
        error: errorInfo.message
      });
      throw error;
    }
  },

  processApproval: async (requestId, approvalData) => {
    set({ loading: true, error: null });
    
    try {
      const response = await requestService.processApproval(requestId, approvalData);
      
      // Update in requests list
      const { requests } = get();
      const updatedRequests = requests.map(req => 
        req.id === parseInt(requestId) ? response.request : req
      );
      
      set({
        requests: updatedRequests,
        currentRequest: response.request,
        loading: false,
        error: null
      });
      
      const actionText = approvalData.action === 'approve' ? 'approved' : 'rejected';
      handleApiSuccess(response.message || `Request ${actionText} successfully!`);
      
      return {
        success: true,
        request: response.request,
        message: response.message
      };
    } catch (error) {
      const errorInfo = handleApiError(error, 'Failed to process approval');
      set({
        loading: false,
        error: errorInfo.message
      });
      throw error;
    }
  },

  addComment: async (requestId, commentData) => {
    set({ loading: true, error: null });
    
    try {
      const response = await requestService.addComment(requestId, commentData);
      
      // Refresh current request to get updated comments
      if (get().currentRequest?.id === parseInt(requestId)) {
        await get().fetchRequest(requestId);
      }
      
      set({ loading: false, error: null });
      handleApiSuccess(response.message || 'Comment added successfully!');
      
      return {
        success: true,
        comment: response.comment,
        message: response.message
      };
    } catch (error) {
      const errorInfo = handleApiError(error, 'Failed to add comment');
      set({
        loading: false,
        error: errorInfo.message
      });
      throw error;
    }
  },

  withdrawRequest: async (requestId, reason) => {
    set({ loading: true, error: null });
    
    try {
      const response = await requestService.withdrawRequest(requestId, reason);
      
      // Update in requests list
      const { requests } = get();
      const updatedRequests = requests.map(req => 
        req.id === parseInt(requestId) ? response.request : req
      );
      
      set({
        requests: updatedRequests,
        currentRequest: response.request,
        loading: false,
        error: null
      });
      
      handleApiSuccess(response.message || 'Request withdrawn successfully!');
      
      return {
        success: true,
        request: response.request,
        message: response.message
      };
    } catch (error) {
      const errorInfo = handleApiError(error, 'Failed to withdraw request');
      set({
        loading: false,
        error: errorInfo.message
      });
      throw error;
    }
  },

  cancelRequest: async (requestId, reason) => {
    set({ loading: true, error: null });
    
    try {
      const response = await requestService.cancelRequest(requestId, reason);
      
      // Update in requests list
      const { requests } = get();
      const updatedRequests = requests.map(req => 
        req.id === parseInt(requestId) ? response.request : req
      );
      
      set({
        requests: updatedRequests,
        currentRequest: response.request,
        loading: false,
        error: null
      });
      
      handleApiSuccess(response.message || 'Request cancelled successfully!');
      
      return {
        success: true,
        request: response.request,
        message: response.message
      };
    } catch (error) {
      const errorInfo = handleApiError(error, 'Failed to cancel request');
      set({
        loading: false,
        error: errorInfo.message
      });
      throw error;
    }
  },

  delegateApproval: async (requestId, delegationData) => {
    set({ loading: true, error: null });
    
    try {
      const response = await requestService.delegateApproval(requestId, delegationData);
      
      // Update in requests list
      const { requests } = get();
      const updatedRequests = requests.map(req => 
        req.id === parseInt(requestId) ? response.request : req
      );
      
      set({
        requests: updatedRequests,
        currentRequest: response.request,
        loading: false,
        error: null
      });
      
      handleApiSuccess(response.message || 'Approval delegated successfully!');
      
      return {
        success: true,
        request: response.request,
        message: response.message
      };
    } catch (error) {
      const errorInfo = handleApiError(error, 'Failed to delegate approval');
      set({
        loading: false,
        error: errorInfo.message
      });
      throw error;
    }
  },

  getRequestTimeline: async (requestId) => {
    try {
      const response = await requestService.getRequestTimeline(requestId);
      
      return {
        success: true,
        timeline: response.timeline
      };
    } catch (error) {
      const errorInfo = handleApiError(error, 'Failed to fetch request timeline', false);
      throw error;
    }
  },

  bulkOperation: async (operation, requestIds, data = {}) => {
    set({ loading: true, error: null });
    
    try {
      const response = await requestService.bulkOperation(operation, requestIds, data);
      
      // Refresh requests to get updated data
      await get().fetchRequests();
      
      set({ loading: false, error: null });
      handleApiSuccess(response.message || 'Bulk operation completed successfully!');
      
      return {
        success: true,
        results: response.results,
        message: response.message
      };
    } catch (error) {
      const errorInfo = handleApiError(error, 'Bulk operation failed');
      set({
        loading: false,
        error: errorInfo.message
      });
      throw error;
    }
  },

  // Filter and pagination actions
  setFilters: (newFilters) => {
    set({ 
      filters: { ...get().filters, ...newFilters },
      pagination: { ...get().pagination, page: 1 } // Reset to first page
    });
    // Auto-fetch with new filters
    get().fetchRequests();
  },

  setPage: (page) => {
    set({ 
      pagination: { ...get().pagination, page }
    });
    // Auto-fetch with new page
    get().fetchRequests({ page });
  },

  setLimit: (limit) => {
    set({ 
      pagination: { ...get().pagination, limit, page: 1 }
    });
    // Auto-fetch with new limit
    get().fetchRequests({ limit, page: 1 });
  },

  // Clear actions
  clearCurrentRequest: () => set({ currentRequest: null }),
  clearError: () => set({ error: null }),
  clearRequests: () => set({ 
    requests: [], 
    pagination: { page: 1, limit: 10, total: 0, pages: 0 } 
  }),

  // Search action
  searchRequests: (searchTerm) => {
    get().setFilters({ search: searchTerm });
  },

  // Status filter action  
  filterByStatus: (status) => {
    get().setFilters({ status });
  },

  // Priority filter action
  filterByPriority: (priority) => {
    get().setFilters({ priority });
  }
}));

export default useRequestStore;