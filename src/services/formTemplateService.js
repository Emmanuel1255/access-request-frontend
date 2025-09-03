// src/services/formTemplateService.js
import api from './api';

/**
 * Form template management service
 * Based on your backend form template routes
 */
export const formTemplateService = {
  /**
   * Get all form templates with filtering
   * GET /api/form-templates
   */
  getTemplates: async (params = {}) => {
    try {
      const queryParams = {
        page: params.page || 1,
        limit: params.limit || 20,
        search: params.search || '',
        category: params.category || '',
        isActive: params.isActive !== undefined ? params.isActive : true,
        sortBy: params.sortBy || 'templateName',
        sortOrder: params.sortOrder || 'asc',
        ...params
      };

      const response = await api.get('/form-templates', { params: queryParams });
      
      return {
        success: true,
        templates: response.data.templates || [],
        pagination: response.data.pagination || {},
        message: response.data.message
      };
    } catch (error) {
      throw {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch templates',
        code: error.response?.data?.code || 'FETCH_ERROR'
      };
    }
  },

  /**
   * Get template by ID with full details
   * GET /api/form-templates/:templateId
   */
  getTemplateById: async (templateId) => {
    try {
      const response = await api.get(`/form-templates/${templateId}`);
      
      return {
        success: true,
        template: response.data.template,
        message: response.data.message
      };
    } catch (error) {
      throw {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch template',
        code: error.response?.data?.code || 'FETCH_ERROR',
        status: error.response?.status
      };
    }
  },

  /**
   * Create new form template
   * POST /api/form-templates
   */
  createTemplate: async (templateData) => {
    try {
      const payload = {
        templateName: templateData.templateName?.trim(),
        description: templateData.description?.trim() || '',
        category: templateData.category?.trim(),
        formSchema: templateData.formSchema || { fields: [] },
        approvers: templateData.approvers || { mode: 'sequential', approvers: [] },
        settings: templateData.settings || {},
        isActive: templateData.isActive !== undefined ? templateData.isActive : true,
        ...templateData
      };

      const response = await api.post('/form-templates', payload);
      
      return {
        success: true,
        template: response.data.template,
        message: response.data.message || 'Template created successfully'
      };
    } catch (error) {
      throw {
        success: false,
        message: error.response?.data?.message || 'Failed to create template',
        code: error.response?.data?.code || 'CREATE_ERROR',
        validationErrors: error.response?.data?.validationErrors || []
      };
    }
  },

  /**
   * Update existing form template
   * PUT /api/form-templates/:templateId
   */
  updateTemplate: async (templateId, templateData) => {
    try {
      const payload = {
        templateName: templateData.templateName?.trim(),
        description: templateData.description?.trim(),
        category: templateData.category?.trim(),
        formSchema: templateData.formSchema,
        approvers: templateData.approvers,
        settings: templateData.settings || {},
        isActive: templateData.isActive,
        ...templateData
      };

      const response = await api.put(`/form-templates/${templateId}`, payload);
      
      return {
        success: true,
        template: response.data.template,
        message: response.data.message || 'Template updated successfully'
      };
    } catch (error) {
      throw {
        success: false,
        message: error.response?.data?.message || 'Failed to update template',
        code: error.response?.data?.code || 'UPDATE_ERROR',
        validationErrors: error.response?.data?.validationErrors || []
      };
    }
  },

  /**
   * Delete form template
   * DELETE /api/form-templates/:templateId
   */
  deleteTemplate: async (templateId) => {
    try {
      const response = await api.delete(`/form-templates/${templateId}`);
      
      return {
        success: true,
        message: response.data.message || 'Template deleted successfully'
      };
    } catch (error) {
      throw {
        success: false,
        message: error.response?.data?.message || 'Failed to delete template',
        code: error.response?.data?.code || 'DELETE_ERROR'
      };
    }
  },

  /**
   * Clone/duplicate template
   * POST /api/form-templates/:templateId/clone
   */
  cloneTemplate: async (templateId, newName) => {
    try {
      const payload = {
        templateName: newName?.trim()
      };

      const response = await api.post(`/form-templates/${templateId}/clone`, payload);
      
      return {
        success: true,
        template: response.data.template,
        message: response.data.message || 'Template cloned successfully'
      };
    } catch (error) {
      throw {
        success: false,
        message: error.response?.data?.message || 'Failed to clone template',
        code: error.response?.data?.code || 'CLONE_ERROR'
      };
    }
  },

  /**
   * Get template categories
   * GET /api/form-templates/categories
   */
  getCategories: async () => {
    try {
      const response = await api.get('/form-templates/categories');
      
      return {
        success: true,
        categories: response.data.categories || [],
        message: response.data.message
      };
    } catch (error) {
      throw {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch categories',
        code: error.response?.data?.code || 'FETCH_ERROR'
      };
    }
  },

  /**
   * Validate form schema
   * POST /api/form-templates/validate-schema
   */
  validateSchema: async (formSchema) => {
    try {
      const response = await api.post('/form-templates/validate-schema', {
        formSchema
      });
      
      return {
        success: true,
        isValid: response.data.isValid,
        errors: response.data.errors || [],
        message: response.data.message
      };
    } catch (error) {
      throw {
        success: false,
        message: error.response?.data?.message || 'Schema validation failed',
        errors: error.response?.data?.errors || [],
        code: error.response?.data?.code || 'VALIDATION_ERROR'
      };
    }
  }
};