// src/store/formTemplateStore.js
import { create } from 'zustand';
import { formTemplateService } from '../services';
import { handleApiError, handleApiSuccess } from '../utils/errorHandler';

const useFormTemplateStore = create((set, get) => ({
  // State
  templates: [],
  currentTemplate: null,
  categories: [],
  loading: false,
  error: null,
  pagination: {
    page: 1,
    limit: 20,
    total: 0,
    pages: 0
  },
  filters: {
    search: '',
    category: '',
    isActive: true,
    sortBy: 'templateName',
    sortOrder: 'asc'
  },

  // Actions
  fetchTemplates: async (params = {}) => {
    set({ loading: true, error: null });
    
    try {
      const { filters } = get();
      const queryParams = { ...filters, ...params };
      
      const response = await formTemplateService.getTemplates(queryParams);
      
      set({
        templates: response.templates,
        pagination: response.pagination,
        loading: false,
        error: null
      });
      
      return {
        success: true,
        templates: response.templates,
        pagination: response.pagination
      };
    } catch (error) {
      const errorInfo = handleApiError(error, 'Failed to fetch templates');
      set({
        loading: false,
        error: errorInfo.message,
        templates: [],
        pagination: { page: 1, limit: 20, total: 0, pages: 0 }
      });
      throw error;
    }
  },

  fetchTemplate: async (templateId) => {
    set({ loading: true, error: null });
    
    try {
      const response = await formTemplateService.getTemplateById(templateId);
      
      set({
        currentTemplate: response.template,
        loading: false,
        error: null
      });
      
      return {
        success: true,
        template: response.template
      };
    } catch (error) {
      const errorInfo = handleApiError(error, 'Failed to fetch template details');
      set({
        loading: false,
        error: errorInfo.message,
        currentTemplate: null
      });
      throw error;
    }
  },

  createTemplate: async (templateData) => {
    set({ loading: true, error: null });
    
    try {
      const response = await formTemplateService.createTemplate(templateData);
      
      // Add to templates list if currently loaded
      const { templates } = get();
      const updatedTemplates = [response.template, ...templates];
      
      set({
        templates: updatedTemplates,
        currentTemplate: response.template,
        loading: false,
        error: null
      });
      
      handleApiSuccess(response.message || 'Template created successfully!');
      
      return {
        success: true,
        template: response.template,
        message: response.message
      };
    } catch (error) {
      const errorInfo = handleApiError(error, 'Failed to create template');
      set({
        loading: false,
        error: errorInfo.message
      });
      throw error;
    }
  },

  updateTemplate: async (templateId, templateData) => {
    set({ loading: true, error: null });
    
    try {
      const response = await formTemplateService.updateTemplate(templateId, templateData);
      
      // Update in templates list
      const { templates } = get();
      const updatedTemplates = templates.map(template => 
        template.id === parseInt(templateId) ? response.template : template
      );
      
      set({
        templates: updatedTemplates,
        currentTemplate: response.template,
        loading: false,
        error: null
      });
      
      handleApiSuccess(response.message || 'Template updated successfully!');
      
      return {
        success: true,
        template: response.template,
        message: response.message
      };
    } catch (error) {
      const errorInfo = handleApiError(error, 'Failed to update template');
      set({
        loading: false,
        error: errorInfo.message
      });
      throw error;
    }
  },

  deleteTemplate: async (templateId) => {
    set({ loading: true, error: null });
    
    try {
      const response = await formTemplateService.deleteTemplate(templateId);
      
      // Remove from templates list
      const { templates } = get();
      const updatedTemplates = templates.filter(template => 
        template.id !== parseInt(templateId)
      );
      
      set({
        templates: updatedTemplates,
        loading: false,
        error: null
      });
      
      // Clear current template if it was the deleted one
      const { currentTemplate } = get();
      if (currentTemplate?.id === parseInt(templateId)) {
        set({ currentTemplate: null });
      }
      
      handleApiSuccess(response.message || 'Template deleted successfully!');
      
      return {
        success: true,
        message: response.message
      };
    } catch (error) {
      const errorInfo = handleApiError(error, 'Failed to delete template');
      set({
        loading: false,
        error: errorInfo.message
      });
      throw error;
    }
  },

  cloneTemplate: async (templateId, newName) => {
    set({ loading: true, error: null });
    
    try {
      const response = await formTemplateService.cloneTemplate(templateId, newName);
      
      // Add cloned template to templates list
      const { templates } = get();
      const updatedTemplates = [response.template, ...templates];
      
      set({
        templates: updatedTemplates,
        currentTemplate: response.template,
        loading: false,
        error: null
      });
      
      handleApiSuccess(response.message || 'Template cloned successfully!');
      
      return {
        success: true,
        template: response.template,
        message: response.message
      };
    } catch (error) {
      const errorInfo = handleApiError(error, 'Failed to clone template');
      set({
        loading: false,
        error: errorInfo.message
      });
      throw error;
    }
  },

  fetchCategories: async () => {
    try {
      const response = await formTemplateService.getCategories();
      
      set({ categories: response.categories });
      
      return {
        success: true,
        categories: response.categories
      };
    } catch (error) {
      const errorInfo = handleApiError(error, 'Failed to fetch categories', false);
      set({ categories: [] });
      throw error;
    }
  },

  validateSchema: async (formSchema) => {
    try {
      const response = await formTemplateService.validateSchema(formSchema);
      
      return {
        success: response.isValid,
        isValid: response.isValid,
        errors: response.errors,
        message: response.message
      };
    } catch (error) {
      const errorInfo = handleApiError(error, 'Schema validation failed', false);
      return {
        success: false,
        isValid: false,
        errors: error.errors || [errorInfo.message],
        message: errorInfo.message
      };
    }
  },

  // Filter and pagination actions
  setFilters: (newFilters) => {
    set({ 
      filters: { ...get().filters, ...newFilters },
      pagination: { ...get().pagination, page: 1 } // Reset to first page
    });
    // Auto-fetch with new filters
    get().fetchTemplates();
  },

  setPage: (page) => {
    set({ 
      pagination: { ...get().pagination, page }
    });
    // Auto-fetch with new page
    get().fetchTemplates({ page });
  },

  setLimit: (limit) => {
    set({ 
      pagination: { ...get().pagination, limit, page: 1 }
    });
    // Auto-fetch with new limit
    get().fetchTemplates({ limit, page: 1 });
  },

  // Clear actions
  clearCurrentTemplate: () => set({ currentTemplate: null }),
  clearError: () => set({ error: null }),
  clearTemplates: () => set({ 
    templates: [], 
    pagination: { page: 1, limit: 20, total: 0, pages: 0 } 
  }),

  // Search action
  searchTemplates: (searchTerm) => {
    get().setFilters({ search: searchTerm });
  },

  // Category filter action
  filterByCategory: (category) => {
    get().setFilters({ category });
  },

  // Active filter action
  filterByActive: (isActive) => {
    get().setFilters({ isActive });
  },

  // Get template by ID from current templates (avoid API call if already loaded)
  getTemplateById: (templateId) => {
    const { templates } = get();
    return templates.find(template => template.id === parseInt(templateId)) || null;
  },

  // Refresh current data
  refresh: () => {
    get().fetchTemplates();
    if (get().categories.length === 0) {
      get().fetchCategories();
    }
  }
}));

export default useFormTemplateStore;