import { create } from 'zustand';
import { demoRequests, demoFormTemplates, REQUEST_STATUS, REQUEST_PRIORITY } from '../data/demoData';
import toast from 'react-hot-toast';

const useRequestStore = create((set, get) => ({
  requests: [],
  currentRequest: null,
  loading: false,
  error: null,
  filters: {
    search: '',
    status: '',
    priority: '',
    templateId: '',
    assignedTo: '',
    dateFrom: '',
    dateTo: '',
    page: 1,
    limit: 10,
    sortBy: 'createdAt',
    sortOrder: 'desc'
  },
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  },
  statistics: {
    total: 0,
    draft: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    cancelled: 0
  },

  // Fetch requests with filters and pagination
  fetchRequests: async () => {
    set({ loading: true, error: null });
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 600));
      
      const { filters } = get();
      const authStore = (await import('./authStore')).default;
      const currentUser = authStore.getState().user;
      
      let filteredRequests = [...demoRequests];

      // Apply role-based filtering
      if (currentUser?.role !== 'admin') {
        filteredRequests = filteredRequests.filter(req => 
          req.requesterId === currentUser?.id || req.assignedTo === currentUser?.id
        );
      }

      // Apply search filter
      if (filters.search) {
        filteredRequests = filteredRequests.filter(req =>
          req.title?.toLowerCase().includes(filters.search.toLowerCase()) ||
          req.requestNumber?.toLowerCase().includes(filters.search.toLowerCase())
        );
      }

      // Apply status filter
      if (filters.status) {
        filteredRequests = filteredRequests.filter(req => req.status === filters.status);
      }

      // Apply priority filter
      if (filters.priority) {
        filteredRequests = filteredRequests.filter(req => req.priority === filters.priority);
      }

      // Apply template filter
      if (filters.templateId) {
        filteredRequests = filteredRequests.filter(req => req.templateId === parseInt(filters.templateId));
      }

      // Apply assigned to filter
      if (filters.assignedTo) {
        filteredRequests = filteredRequests.filter(req => req.assignedTo === parseInt(filters.assignedTo));
      }

      // Apply date range filters
      if (filters.dateFrom) {
        filteredRequests = filteredRequests.filter(req => 
          new Date(req.createdAt) >= new Date(filters.dateFrom)
        );
      }

      if (filters.dateTo) {
        filteredRequests = filteredRequests.filter(req => 
          new Date(req.createdAt) <= new Date(filters.dateTo)
        );
      }

      // Apply sorting
      filteredRequests.sort((a, b) => {
        const aValue = a[filters.sortBy];
        const bValue = b[filters.sortBy];
        
        if (filters.sortBy === 'createdAt' || filters.sortBy === 'updatedAt') {
          const aDate = new Date(aValue);
          const bDate = new Date(bValue);
          return filters.sortOrder === 'asc' ? aDate - bDate : bDate - aDate;
        }
        
        if (typeof aValue === 'string' && typeof bValue === 'string') {
          return filters.sortOrder === 'asc' 
            ? aValue.localeCompare(bValue)
            : bValue.localeCompare(aValue);
        }
        
        return filters.sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
      });

      // Calculate statistics
      const statistics = {
        total: filteredRequests.length,
        draft: filteredRequests.filter(r => r.status === REQUEST_STATUS.DRAFT).length,
        pending: filteredRequests.filter(r => r.status === REQUEST_STATUS.PENDING).length,
        approved: filteredRequests.filter(r => r.status === REQUEST_STATUS.APPROVED).length,
        rejected: filteredRequests.filter(r => r.status === REQUEST_STATUS.REJECTED).length,
        cancelled: filteredRequests.filter(r => r.status === REQUEST_STATUS.CANCELLED).length,
      };

      // Apply pagination
      const total = filteredRequests.length;
      const pages = Math.ceil(total / filters.limit);
      const startIndex = (filters.page - 1) * filters.limit;
      const endIndex = startIndex + filters.limit;
      const paginatedRequests = filteredRequests.slice(startIndex, endIndex);

      set({
        requests: paginatedRequests,
        pagination: {
          page: filters.page,
          limit: filters.limit,
          total,
          pages
        },
        statistics,
        loading: false
      });
    } catch (error) {
      console.error('Failed to fetch requests:', error);
      set({ error: error.message, loading: false });
      toast.error('Failed to fetch requests');
    }
  },

  // Fetch single request
  fetchRequest: async (requestId) => {
    set({ loading: true, error: null });
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 400));
      
      const request = demoRequests.find(r => r.id === requestId);
      
      if (!request) {
        throw new Error('Request not found');
      }

      // Get template information
      const template = demoFormTemplates.find(t => t.id === request.templateId);
      
      // Enhance request with template data
      const enhancedRequest = {
        ...request,
        template: template || null
      };

      set({ currentRequest: enhancedRequest, loading: false });
      return enhancedRequest;
    } catch (error) {
      console.error('Failed to fetch request:', error);
      set({ error: error.message, loading: false });
      toast.error('Failed to fetch request details');
      throw error;
    }
  },

  // Create new request
  createRequest: async (requestData) => {
    set({ loading: true });
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const authStore = (await import('./authStore')).default;
      const currentUser = authStore.getState().user;
      
      const newRequest = {
        id: Math.max(...demoRequests.map(r => r.id)) + 1,
        requestNumber: `REQ-${String(Math.max(...demoRequests.map(r => r.id)) + 1).padStart(5, '0')}`,
        requesterId: currentUser.id,
        status: REQUEST_STATUS.DRAFT,
        priority: requestData.priority || REQUEST_PRIORITY.NORMAL,
        currentApprovalLevel: 0,
        totalApprovalLevels: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        ...requestData
      };
      
      demoRequests.push(newRequest);
      
      // Refresh requests list
      await get().fetchRequests();
      
      toast.success('Request created successfully');
      set({ loading: false });
      
      return newRequest;
    } catch (error) {
      console.error('Failed to create request:', error);
      set({ loading: false });
      toast.error('Failed to create request');
      throw error;
    }
  },

  // Update request
  updateRequest: async (requestId, updates) => {
    set({ loading: true });
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 600));
      
      const requestIndex = demoRequests.findIndex(r => r.id === requestId);
      if (requestIndex === -1) {
        throw new Error('Request not found');
      }
      
      // Only allow updates to draft requests
      if (demoRequests[requestIndex].status !== REQUEST_STATUS.DRAFT) {
        throw new Error('Only draft requests can be edited');
      }
      
      demoRequests[requestIndex] = {
        ...demoRequests[requestIndex],
        ...updates,
        updatedAt: new Date().toISOString()
      };
      
      // Update current request if it's the same
      const { currentRequest } = get();
      if (currentRequest?.id === requestId) {
        set({ currentRequest: demoRequests[requestIndex] });
      }
      
      // Refresh requests list
      await get().fetchRequests();
      
      toast.success('Request updated successfully');
      set({ loading: false });
      
      return demoRequests[requestIndex];
    } catch (error) {
      console.error('Failed to update request:', error);
      set({ loading: false });
      toast.error(error.message || 'Failed to update request');
      throw error;
    }
  },

  // Submit request for approval
  submitRequest: async (requestId, approvalChain) => {
    set({ loading: true });
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const requestIndex = demoRequests.findIndex(r => r.id === requestId);
      if (requestIndex === -1) {
        throw new Error('Request not found');
      }
      
      if (demoRequests[requestIndex].status !== REQUEST_STATUS.DRAFT) {
        throw new Error('Only draft requests can be submitted');
      }
      
      // Update request status
      demoRequests[requestIndex] = {
        ...demoRequests[requestIndex],
        status: REQUEST_STATUS.PENDING,
        currentApprovalLevel: 1,
        totalApprovalLevels: approvalChain.length,
        submittedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      // Create approval chain (this would normally be handled by the backend)
      // For demo purposes, we'll just update the request
      
      // Refresh requests list
      await get().fetchRequests();
      
      toast.success('Request submitted for approval');
      set({ loading: false });
      
      return demoRequests[requestIndex];
    } catch (error) {
      console.error('Failed to submit request:', error);
      set({ loading: false });
      toast.error(error.message || 'Failed to submit request');
      throw error;
    }
  },

  // Cancel request
  cancelRequest: async (requestId, reason) => {
    set({ loading: true });
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 400));
      
      const requestIndex = demoRequests.findIndex(r => r.id === requestId);
      if (requestIndex === -1) {
        throw new Error('Request not found');
      }
      
      const authStore = (await import('./authStore')).default;
      const currentUser = authStore.getState().user;
      
      // Check permissions
      if (demoRequests[requestIndex].requesterId !== currentUser.id && currentUser.role !== 'admin') {
        throw new Error('You can only cancel your own requests');
      }
      
      if (!['draft', 'pending'].includes(demoRequests[requestIndex].status)) {
        throw new Error('Cannot cancel completed requests');
      }
      
      demoRequests[requestIndex] = {
        ...demoRequests[requestIndex],
        status: REQUEST_STATUS.CANCELLED,
        cancellationReason: reason,
        completedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      // Refresh requests list
      await get().fetchRequests();
      
      toast.success('Request cancelled successfully');
      set({ loading: false });
      
      return demoRequests[requestIndex];
    } catch (error) {
      console.error('Failed to cancel request:', error);
      set({ loading: false });
      toast.error(error.message || 'Failed to cancel request');
      throw error;
    }
  },

  // Duplicate request
  duplicateRequest: async (requestId) => {
    set({ loading: true });
    
    try {
      const originalRequest = demoRequests.find(r => r.id === requestId);
      if (!originalRequest) {
        throw new Error('Request not found');
      }
      
      const authStore = (await import('./authStore')).default;
      const currentUser = authStore.getState().user;
      
      const duplicatedRequest = await get().createRequest({
        templateId: originalRequest.templateId,
        title: `Copy of ${originalRequest.title}`,
        formData: originalRequest.formData,
        priority: originalRequest.priority
      });
      
      set({ loading: false });
      return duplicatedRequest;
    } catch (error) {
      console.error('Failed to duplicate request:', error);
      set({ loading: false });
      toast.error('Failed to duplicate request');
      throw error;
    }
  },

  // Set filters
  setFilters: (newFilters) => {
    set({
      filters: { ...get().filters, ...newFilters }
    });
  },

  // Clear current request
  clearCurrentRequest: () => {
    set({ currentRequest: null });
  },

  // Export requests
  exportRequests: async () => {
    try {
      const { requests } = get();
      
      // Create CSV content
      const headers = [
        'Request Number', 'Title', 'Status', 'Priority', 
        'Requester', 'Created Date', 'Updated Date'
      ];
      
      const csvContent = [
        headers.join(','),
        ...requests.map(req => [
          req.requestNumber || '',
          `"${req.title || ''}"`,
          req.status || '',
          req.priority || '',
          req.requesterName || '',
          req.createdAt ? new Date(req.createdAt).toLocaleDateString() : '',
          req.updatedAt ? new Date(req.updatedAt).toLocaleDateString() : ''
        ].join(','))
      ].join('\n');
      
      // Download file
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `requests-export-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast.success('Requests exported successfully');
    } catch (error) {
      console.error('Failed to export requests:', error);
      toast.error('Failed to export requests');
    }
  },

  // Reset store
  reset: () => {
    set({
      requests: [],
      currentRequest: null,
      loading: false,
      error: null,
      filters: {
        search: '',
        status: '',
        priority: '',
        templateId: '',
        assignedTo: '',
        dateFrom: '',
        dateTo: '',
        page: 1,
        limit: 10,
        sortBy: 'createdAt',
        sortOrder: 'desc'
      },
      pagination: {
        page: 1,
        limit: 10,
        total: 0,
        pages: 0
      },
      statistics: {
        total: 0,
        draft: 0,
        pending: 0,
        approved: 0,
        rejected: 0,
        cancelled: 0
      }
    });
  }
}));

export default useRequestStore;