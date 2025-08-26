import { create } from 'zustand';
import { demoFormTemplates } from '../data/demoData';
import toast from 'react-hot-toast';

const useFormTemplateStore = create((set, get) => ({
  templates: [],
  currentTemplate: null,
  loading: false,
  error: null,
  
  // Fetch form templates
  fetchTemplates: async () => {
    set({ loading: true, error: null });
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Filter active templates
      const activeTemplates = demoFormTemplates.filter(template => template.isActive);
      
      set({
        templates: activeTemplates,
        loading: false
      });
    } catch (error) {
      console.error('Failed to fetch templates:', error);
      set({ error: error.message, loading: false });
      toast.error('Failed to fetch form templates');
    }
  },

  // Fetch single template
  fetchTemplate: async (templateId) => {
    set({ loading: true, error: null });
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 200));
      
      const template = demoFormTemplates.find(t => t.id === templateId);
      
      if (!template) {
        throw new Error('Template not found');
      }

      set({ 
        currentTemplate: template, 
        loading: false 
      });
      
      return template;
    } catch (error) {
      console.error('Failed to fetch template:', error);
      set({ error: error.message, loading: false });
      toast.error('Failed to fetch template');
      throw error;
    }
  },

  // Create new template
  createTemplate: async (templateData) => {
    set({ loading: true });
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const authStore = (await import('./authStore')).default;
      const currentUser = authStore.getState().user;
      
      const newTemplate = {
        id: Math.max(...demoFormTemplates.map(t => t.id)) + 1,
        createdBy: currentUser.id,
        isActive: true,
        version: 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        ...templateData
      };
      
      demoFormTemplates.push(newTemplate);
      
      // Refresh templates
      await get().fetchTemplates();
      
      toast.success('Template created successfully');
      set({ loading: false });
      
      return newTemplate;
    } catch (error) {
      console.error('Failed to create template:', error);
      set({ loading: false });
      toast.error('Failed to create template');
      throw error;
    }
  },

  // Update template
  updateTemplate: async (templateId, updates) => {
    set({ loading: true });
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 600));
      
      const templateIndex = demoFormTemplates.findIndex(t => t.id === templateId);
      if (templateIndex === -1) {
        throw new Error('Template not found');
      }
      
      demoFormTemplates[templateIndex] = {
        ...demoFormTemplates[templateIndex],
        ...updates,
        updatedAt: new Date().toISOString()
      };
      
      // Update current template if it's the same
      const { currentTemplate } = get();
      if (currentTemplate?.id === templateId) {
        set({ currentTemplate: demoFormTemplates[templateIndex] });
      }
      
      // Refresh templates
      await get().fetchTemplates();
      
      toast.success('Template updated successfully');
      set({ loading: false });
      
      return demoFormTemplates[templateIndex];
    } catch (error) {
      console.error('Failed to update template:', error);
      set({ loading: false });
      toast.error('Failed to update template');
      throw error;
    }
  },

  // Delete template
  deleteTemplate: async (templateId) => {
    set({ loading: true });
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 400));
      
      const templateIndex = demoFormTemplates.findIndex(t => t.id === templateId);
      if (templateIndex === -1) {
        throw new Error('Template not found');
      }
      
      // Soft delete
      demoFormTemplates[templateIndex].isActive = false;
      demoFormTemplates[templateIndex].updatedAt = new Date().toISOString();
      
      // Refresh templates
      await get().fetchTemplates();
      
      toast.success('Template deleted successfully');
      set({ loading: false });
    } catch (error) {
      console.error('Failed to delete template:', error);
      set({ loading: false });
      toast.error('Failed to delete template');
      throw error;
    }
  },

  // Get categories
  getCategories: () => {
    const categories = [...new Set(demoFormTemplates.map(t => t.category).filter(Boolean))];
    return categories.sort();
  },

  // Clear current template
  clearCurrentTemplate: () => {
    set({ currentTemplate: null });
  },

  // Reset store
  reset: () => {
    set({
      templates: [],
      currentTemplate: null,
      loading: false,
      error: null
    });
  }
}));

export default useFormTemplateStore;