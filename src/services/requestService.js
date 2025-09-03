// src/services/requestService.js
import api from './api';

/**
 * Request management service handling all request-related API calls
 * Based on your backend request routes
 */
export const requestService = {
  /**
   * Get requests with filtering and pagination
   * GET /api/requests
   */
  getRequests: async (params = {}) => {
    try {
      const queryParams = {
        page: params.page || 1,
        limit: params.limit || 10,
        search: params.search || '',
        status: params.status || '',
        priority: params.priority || '',
        sortBy: params.sortBy || 'createdAt',
        sortOrder: params.sortOrder || 'desc',
        templateId: params.templateId || '',
        requesterId: params.requesterId || '',
        assignedUserId: params.assignedUserId || '',
        ...params // Include any additional filters
      };

      const response = await api.get('/requests', { params: queryParams });
      
      return {
        success: true,
        requests: response.data.requests || [],
        pagination: response.data.pagination || {},
        message: response.data.message
      };
    } catch (error) {
      throw {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch requests',
        code: error.response?.data?.code || 'FETCH_ERROR'
      };
    }
  },

  /**
   * Get request by ID with full details
   * GET /api/requests/:requestId
   */
  getRequestById: async (requestId) => {
    try {
      const response = await api.get(`/requests/${requestId}`);
      
      return {
        success: true,
        request: response.data.request,
        message: response.data.message
      };
    } catch (error) {
      throw {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch request details',
        code: error.response?.data?.code || 'FETCH_ERROR',
        status: error.response?.status
      };
    }
  },

  /**
   * Create new request
   * POST /api/requests
   */
  createRequest: async (requestData) => {
    try {
      const payload = {
        templateId: parseInt(requestData.templateId),
        title: requestData.title?.trim(),
        priority: requestData.priority || 'normal',
        formData: requestData.formData || {},
        attachments: requestData.attachments || [],
        tags: requestData.tags || [],
        dueDate: requestData.dueDate || null,
        description: requestData.description?.trim() || '',
        ...requestData // Include any additional fields
      };

      const response = await api.post('/requests', payload);
      
      return {
        success: true,
        request: response.data.request,
        message: response.data.message || 'Request created successfully'
      };
    } catch (error) {
      throw {
        success: false,
        message: error.response?.data?.message || 'Failed to create request',
        code: error.response?.data?.code || 'CREATE_ERROR',
        validationErrors: error.response?.data?.validationErrors || []
      };
    }
  },

  /**
   * Update existing request
   * PUT /api/requests/:requestId
   */
  updateRequest: async (requestId, requestData) => {
    try {
      const payload = {
        title: requestData.title?.trim(),
        priority: requestData.priority,
        formData: requestData.formData || {},
        tags: requestData.tags || [],
        dueDate: requestData.dueDate || null,
        description: requestData.description?.trim() || '',
        ...requestData // Include any additional fields
      };

      const response = await api.put(`/requests/${requestId}`, payload);
      
      return {
        success: true,
        request: response.data.request,
        message: response.data.message || 'Request updated successfully'
      };
    } catch (error) {
      throw {
        success: false,
        message: error.response?.data?.message || 'Failed to update request',
        code: error.response?.data?.code || 'UPDATE_ERROR',
        validationErrors: error.response?.data?.validationErrors || []
      };
    }
  },

  /**
   * Process approval/rejection
   * POST /api/requests/:requestId/process
   */
  processApproval: async (requestId, approvalData) => {
    try {
      const payload = {
        action: approvalData.action, // 'approve' or 'reject'
        comment: approvalData.comment?.trim() || '',
        conditions: approvalData.conditions || [],
        delegateToUserId: approvalData.delegateToUserId || null,
        ...approvalData
      };

      const response = await api.post(`/requests/${requestId}/process`, payload);
      
      return {
        success: true,
        request: response.data.request,
        message: response.data.message || 'Request processed successfully'
      };
    } catch (error) {
      throw {
        success: false,
        message: error.response?.data?.message || 'Failed to process request',
        code: error.response?.data?.code || 'PROCESS_ERROR',
        validationErrors: error.response?.data?.validationErrors || []
      };
    }
  },

  /**
   * Add comment to request
   * POST /api/requests/:requestId/comments
   */
  addComment: async (requestId, commentData) => {
    try {
      const payload = {
        comment: commentData.comment?.trim(),
        commentType: commentData.commentType || 'general',
        isInternal: commentData.isInternal || false,
        parentCommentId: commentData.parentCommentId || null,
        ...commentData
      };

      const response = await api.post(`/requests/${requestId}/comments`, payload);
      
      return {
        success: true,
        comment: response.data.comment,
        message: response.data.message || 'Comment added successfully'
      };
    } catch (error) {
      throw {
        success: false,
        message: error.response?.data?.message || 'Failed to add comment',
        code: error.response?.data?.code || 'COMMENT_ERROR',
        validationErrors: error.response?.data?.validationErrors || []
      };
    }
  },

  /**
   * Withdraw request
   * POST /api/requests/:requestId/withdraw
   */
  withdrawRequest: async (requestId, reason) => {
    try {
      const response = await api.post(`/requests/${requestId}/withdraw`, {
        reason: reason?.trim() || ''
      });
      
      return {
        success: true,
        request: response.data.request,
        message: response.data.message || 'Request withdrawn successfully'
      };
    } catch (error) {
      throw {
        success: false,
        message: error.response?.data?.message || 'Failed to withdraw request',
        code: error.response?.data?.code || 'WITHDRAW_ERROR'
      };
    }
  },

  /**
   * Cancel request
   * POST /api/requests/:requestId/cancel
   */
  cancelRequest: async (requestId, reason) => {
    try {
      const response = await api.post(`/requests/${requestId}/cancel`, {
        reason: reason?.trim() || ''
      });
      
      return {
        success: true,
        request: response.data.request,
        message: response.data.message || 'Request cancelled successfully'
      };
    } catch (error) {
      throw {
        success: false,
        message: error.response?.data?.message || 'Failed to cancel request',
        code: error.response?.data?.code || 'CANCEL_ERROR'
      };
    }
  },

  /**
   * Delegate approval
   * POST /api/requests/:requestId/delegate
   */
  delegateApproval: async (requestId, delegationData) => {
    try {
      const payload = {
        delegateToUserId: parseInt(delegationData.delegateToUserId),
        reason: delegationData.reason?.trim() || '',
        ...delegationData
      };

      const response = await api.post(`/requests/${requestId}/delegate`, payload);
      
      return {
        success: true,
        request: response.data.request,
        message: response.data.message || 'Approval delegated successfully'
      };
    } catch (error) {
      throw {
        success: false,
        message: error.response?.data?.message || 'Failed to delegate approval',
        code: error.response?.data?.code || 'DELEGATE_ERROR'
      };
    }
  },

  /**
   * Get request timeline/history
   * GET /api/requests/:requestId/timeline
   */
  getRequestTimeline: async (requestId) => {
    try {
      const response = await api.get(`/requests/${requestId}/timeline`);
      
      return {
        success: true,
        timeline: response.data.timeline || [],
        message: response.data.message
      };
    } catch (error) {
      throw {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch request timeline',
        code: error.response?.data?.code || 'TIMELINE_ERROR'
      };
    }
  },

  /**
   * Bulk operations on requests
   * POST /api/requests/bulk
   */
  bulkOperation: async (operation, requestIds, data = {}) => {
    try {
      const payload = {
        operation, // 'cancel', 'change_priority', 'add_tags', 'remove_tags'
        requestIds: requestIds.map(id => parseInt(id)),
        data
      };

      const response = await api.post('/requests/bulk', payload);
      
      return {
        success: true,
        results: response.data.results || [],
        message: response.data.message || 'Bulk operation completed'
      };
    } catch (error) {
      throw {
        success: false,
        message: error.response?.data?.message || 'Bulk operation failed',
        code: error.response?.data?.code || 'BULK_ERROR'
      };
    }
  }
};