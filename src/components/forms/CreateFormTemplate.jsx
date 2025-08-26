// src/components/forms/CreateFormTemplate.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Save, Copy, FileText } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Button from '../common/Button';
import FormBuilder from './FormBuilder';
import TemplateApproverSelector from './TemplateApproverSelector';
import { demoFormTemplates } from '../../data/demoData';

// Categories for the dropdown
const FORM_CATEGORIES = [
  'IT',
  'Server',
  'Switch',
  'Data Center',
  'NOC',
  'Custom'
];

const CreateFormTemplate = ({ templates = demoFormTemplates, onSave }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [formData, setFormData] = useState({
    templateName: '',
    description: '',
    category: '',
    isActive: true,
    isDefault: false,
    formSchema: { fields: [] },
    approvers: {
      approvers: [],
      mode: 'sequential'
    }
  });
  const [isSaving, setIsSaving] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [showTemplateSelector, setShowTemplateSelector] = useState(false);
  const [customCategory, setCustomCategory] = useState('');
  const [formBuilderKey, setFormBuilderKey] = useState(0);
  const [isInitialized, setIsInitialized] = useState(false);

  const availableTemplates = templates.filter(t => t.isActive);

  // Initialize with duplicate template data if provided via navigation state
  useEffect(() => {
    console.log('=== Initializing CreateFormTemplate ===');
    console.log('Location state:', location.state);
    
    if (location.state?.duplicateFrom && !isInitialized) {
      console.log('Duplicating from template:', location.state.duplicateFrom);
      handleTemplateSelection(location.state.duplicateFrom, true);
      setIsInitialized(true);
    } else if (!isInitialized) {
      console.log('Starting fresh template creation');
      setIsInitialized(true);
    }
  }, [location.state, isInitialized]);

  // Reset form when a template is selected
  const handleTemplateSelection = (template, isDuplicate = false) => {
    if (template) {
      console.log('Selected template for duplication:', template);
      console.log('Original fields:', template.formSchema?.fields);
      
      // Ensure fields have proper structure with IDs
      const fieldsWithIds = template.formSchema?.fields?.map((field, index) => ({
        ...field,
        id: field.id || `field_${Date.now()}_${index}`,
        // Ensure all required properties are present
        name: field.name || `${field.type}_${index}`,
        label: field.label || `Field ${index + 1}`,
        required: field.required || false,
        type: field.type || 'text'
      })) || [];
      
      console.log('Processed fields with IDs:', fieldsWithIds);
      
      const newFormData = {
        templateName: isDuplicate ? `${template.templateName} (Copy)` : `${template.templateName} (Copy)`,
        description: template.description || '',
        category: template.category || '',
        isActive: true,
        isDefault: false,
        formSchema: {
          fields: fieldsWithIds
        },
        approvers: {
          approvers: template.approvers?.approvers ? [...template.approvers.approvers] : [],
          mode: template.approvers?.mode || 'sequential'
        }
      };
      
      console.log('New form data being set:', newFormData);
      console.log('Fields count:', newFormData.formSchema.fields.length);
      console.log('Approvers count:', newFormData.approvers.approvers.length);
      
      setFormData(newFormData);
      setSelectedTemplate(template);
      
      // Set custom category if needed
      if (template.category && !FORM_CATEGORIES.includes(template.category)) {
        setCustomCategory(template.category);
      }
      
      // Force FormBuilder to re-render with a delay to ensure state is updated
      setTimeout(() => {
        console.log('Forcing FormBuilder re-render');
        setFormBuilderKey(prev => prev + 1);
      }, 100);
      
    } else {
      // Start fresh
      console.log('Starting fresh template');
      const freshFormData = {
        templateName: '',
        description: '',
        category: '',
        isActive: true,
        isDefault: false,
        formSchema: { fields: [] },
        approvers: {
          approvers: [],
          mode: 'sequential'
        }
      };
      
      setFormData(freshFormData);
      setSelectedTemplate(null);
      setCustomCategory('');
      setFormBuilderKey(prev => prev + 1);
    }
    setShowTemplateSelector(false);
  };

  const handleFormChange = (newSchema) => {
    console.log('Form schema changed:', newSchema);
    
    setFormData(prev => {
      const updated = {
        ...prev,
        formSchema: {
          fields: Array.isArray(newSchema.fields) ? newSchema.fields : []
        }
      };
      console.log('Updated formData after form change:', updated);
      return updated;
    });
  };

  const handleApproversChange = (approversConfig) => {
    console.log('Approvers changed:', approversConfig);
    setFormData(prev => ({
      ...prev,
      approvers: approversConfig
    }));
  };

  const handleCategoryChange = (e) => {
    const value = e.target.value;
    setFormData(prev => ({
      ...prev,
      category: value === 'Custom' ? customCategory : value
    }));
  };

  const handleCustomCategoryChange = (e) => {
    setCustomCategory(e.target.value);
    if (formData.category === 'Custom' || customCategory) {
      setFormData(prev => ({
        ...prev,
        category: e.target.value
      }));
    }
  };

  const handleSave = async () => {
    if (!formData.templateName.trim()) {
      alert('Please enter a template name');
      return;
    }
    
    if (!formData.category.trim()) {
      alert('Please select a category');
      return;
    }

    if (!formData.formSchema.fields.length) {
      alert('Please add at least one form field');
      return;
    }

    if (!formData.approvers?.approvers?.length) {
      alert('Please add at least one approver');
      return;
    }

    setIsSaving(true);
    try {
      const newTemplate = {
        ...formData,
        id: Date.now(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: 1
      };
      
      console.log('Saving template:', newTemplate);
      await onSave(newTemplate);
      navigate('/form-templates');
    } catch (error) {
      console.error('Error saving template:', error);
      alert('Error saving template. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  // Debug: Log current form data changes
  useEffect(() => {
    console.log('=== FormData State Update ===');
    console.log('Current formData:', formData);
    console.log('Fields count:', formData.formSchema.fields.length);
    console.log('Approvers count:', formData.approvers?.approvers?.length || 0);
    console.log('FormBuilder Key:', formBuilderKey);
    console.log('Is Initialized:', isInitialized);
    console.log('Selected Template:', selectedTemplate?.templateName || 'None');
    if (formData.formSchema.fields.length > 0) {
      console.log('First field:', formData.formSchema.fields[0]);
    }
    console.log('===========================');
  }, [formData, formBuilderKey, isInitialized, selectedTemplate]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Create Form Template
          </h2>
          {selectedTemplate && (
            <p className="mt-1 text-sm text-gray-600">
              Based on: {selectedTemplate.templateName}
            </p>
          )}
          {location.state?.duplicateFrom && (
            <p className="mt-1 text-sm text-blue-600">
              Duplicating: {location.state.duplicateFrom.templateName}
            </p>
          )}
        </div>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            onClick={() => setShowTemplateSelector(!showTemplateSelector)}
            icon={Copy}
          >
            Use Existing Template
          </Button>
          <Button
            variant="ghost"
            onClick={() => navigate('/form-templates')}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleSave}
            disabled={isSaving || !formData.templateName.trim()}
            icon={Save}
            loading={isSaving}
          >
            {isSaving ? 'Creating...' : 'Create Template'}
          </Button>
        </div>
      </div>

      {/* Template Selector Modal */}
      <AnimatePresence>
        {showTemplateSelector && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex fixed inset-0 z-50 justify-center items-center bg-black bg-opacity-50"
            onClick={() => setShowTemplateSelector(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 border-b">
                <h3 className="text-lg font-semibold text-gray-900">
                  Choose a Template to Start With
                </h3>
                <p className="mt-1 text-sm text-gray-600">
                  Select an existing template to use as a starting point, or start from scratch.
                </p>
              </div>
              
              <div className="overflow-y-auto p-6 max-h-96">
                <div className="grid gap-4">
                  {/* Start from scratch option */}
                  <button
                    onClick={() => handleTemplateSelection(null)}
                    className="p-4 text-left rounded-lg border-2 border-gray-300 border-dashed transition-colors hover:border-africell-primary hover:bg-gray-50"
                  >
                    <div className="flex gap-3 items-center">
                      <div className="flex justify-center items-center w-12 h-12 bg-gray-100 rounded-lg">
                        <FileText className="w-6 h-6 text-gray-600" />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">Start from Scratch</h4>
                        <p className="text-sm text-gray-600">Create a new template with no pre-filled fields</p>
                      </div>
                    </div>
                  </button>

                  {/* Existing templates */}
                  {availableTemplates.map((template) => (
                    <button
                      key={template.id}
                      onClick={() => handleTemplateSelection(template)}
                      className="p-4 text-left rounded-lg border border-gray-200 transition-colors hover:border-africell-primary hover:bg-africell-50"
                    >
                      <div className="flex gap-3 items-start">
                        <div className="flex justify-center items-center w-12 h-12 rounded-lg bg-africell-100">
                          <FileText className="w-6 h-6 text-africell-600" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">{template.templateName}</h4>
                          <p className="mt-1 text-sm text-gray-600">{template.description}</p>
                          <div className="flex gap-4 items-center mt-2">
                            <span className="inline-flex items-center px-2 py-1 text-xs font-medium text-gray-700 bg-gray-100 rounded">
                              {template.category}
                            </span>
                            <span className="text-xs text-gray-500">
                              {template.formSchema?.fields?.length || 0} fields
                            </span>
                            <span className="text-xs text-gray-500">
                              {template.approvers?.approvers?.length || 0} approvers
                            </span>
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="p-6 bg-gray-50 border-t">
                <Button
                  variant="ghost"
                  onClick={() => setShowTemplateSelector(false)}
                  className="w-full"
                >
                  Cancel
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Debug Info (development only) */}
      {/* {process.env.NODE_ENV === 'development' && (
        <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
          <h4 className="text-sm font-medium text-yellow-800">Debug Info:</h4>
          <div className="space-y-1 text-xs text-yellow-700">
            <p>Location State: {location.state?.duplicateFrom ? 'Has duplicate data' : 'No duplicate data'}</p>
            <p>Selected Template: {selectedTemplate?.templateName || 'None'}</p>
            <p>Current Fields: {formData.formSchema.fields.length}</p>
            <p>Current Approvers: {formData.approvers?.approvers?.length || 0}</p>
            <p>FormBuilder Key: {formBuilderKey}</p>
            <p>Is Initialized: {isInitialized ? 'Yes' : 'No'}</p>
            <p>Schema being passed to FormBuilder: Fields={formData.formSchema.fields.length}</p>
            {formData.formSchema.fields.length > 0 && (
              <details className="mt-2">
                <summary className="cursor-pointer">View Fields Data</summary>
                <pre className="mt-1 text-xs bg-white p-2 rounded overflow-auto max-h-32">
                  {JSON.stringify(formData.formSchema.fields.map(f => ({ 
                    id: f.id, 
                    name: f.name, 
                    type: f.type, 
                    label: f.label 
                  })), null, 2)}
                </pre>
              </details>
            )}
          </div>
        </div>
      )} */}

      {/* Main Form */}
      <div className="p-6 bg-white rounded-lg shadow">
        <div className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Template Name *
              </label>
              <input
                type="text"
                value={formData.templateName}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  templateName: e.target.value
                }))}
                className="block mt-1 w-full rounded-md border-gray-300 shadow-sm focus:border-africell-primary focus:ring-africell-primary sm:text-sm"
                placeholder="Enter template name"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Category *
              </label>
              <div className="mt-1 space-y-2">
                <select
                  value={formData.category === customCategory && customCategory ? 'Custom' : formData.category}
                  onChange={handleCategoryChange}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-africell-primary focus:ring-africell-primary sm:text-sm"
                  required
                >
                  <option value="">Select a category</option>
                  {FORM_CATEGORIES.map(category => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
                
                {(formData.category === 'Custom' || customCategory) && (
                  <input
                    type="text"
                    value={customCategory}
                    onChange={handleCustomCategoryChange}
                    placeholder="Enter custom category name"
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-africell-primary focus:ring-africell-primary sm:text-sm"
                  />
                )}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Description
            </label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                description: e.target.value
              }))}
              className="block mt-1 w-full rounded-md border-gray-300 shadow-sm focus:border-africell-primary focus:ring-africell-primary sm:text-sm"
              placeholder="Describe what this template is for..."
            />
          </div>

          {/* Form Builder */}
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700">
              Form Fields * (Currently: {formData.formSchema.fields.length} fields)
            </label>
            <div className="overflow-hidden rounded-lg border">
              <FormBuilder
                key={`form-builder-create-${formBuilderKey}-${formData.formSchema.fields.length}-${isInitialized}`}
                schema={formData.formSchema}
                onChange={handleFormChange}
                initialFields={formData.formSchema.fields}
              />
            </div>
            {formData.formSchema.fields.length === 0 && (
              <p className="mt-2 text-sm text-gray-500">
                Add at least one field to your form template.
              </p>
            )}
          </div>

          {/* Approver Configuration */}
          <div>
            <TemplateApproverSelector
              key={`approver-selector-create-${formBuilderKey}`}
              approvers={formData.approvers?.approvers || []}
              onChange={handleApproversChange}
            />
          </div>

          {/* Settings */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-gray-700">Template Settings</h4>
            
            <div className="space-y-3">
              <div className="flex items-center">
                <input
                  id="isActive"
                  name="isActive"
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    isActive: e.target.checked
                  }))}
                  className="w-4 h-4 rounded border-gray-300 text-africell-primary focus:ring-africell-primary"
                />
                <label htmlFor="isActive" className="block ml-2 text-sm text-gray-700">
                  Active template (users can create requests using this template)
                </label>
              </div>
              
              <div className="flex items-center">
                <input
                  id="isDefault"
                  name="isDefault"
                  type="checkbox"
                  checked={formData.isDefault}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    isDefault: e.target.checked
                  }))}
                  className="w-4 h-4 rounded border-gray-300 text-africell-primary focus:ring-africell-primary"
                />
                <label htmlFor="isDefault" className="block ml-2 text-sm text-gray-700">
                  Set as default template for this category
                </label>
              </div>
            </div>
          </div>

          {/* Preview Summary */}
          {(formData.formSchema.fields.length > 0 || formData.approvers?.approvers?.length > 0) && (
            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="mb-2 text-sm font-medium text-gray-700">Template Summary</h4>
              <div className="space-y-1 text-sm text-gray-600">
                <p><strong>Fields:</strong> {formData.formSchema.fields.length}</p>
                <p><strong>Required fields:</strong> {formData.formSchema.fields.filter(f => f.required).length}</p>
                <p><strong>Field types:</strong> {[...new Set(formData.formSchema.fields.map(f => f.type))].join(', ') || 'None'}</p>
                <p><strong>Approvers:</strong> {formData.approvers?.approvers?.length || 0}</p>
                <p><strong>Approval mode:</strong> {formData.approvers?.mode === 'sequential' ? 'Sequential' : 'Any approver'}</p>
                <p><strong>Required approvers:</strong> {formData.approvers?.approvers?.filter(a => a.isRequired)?.length || 0}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreateFormTemplate;