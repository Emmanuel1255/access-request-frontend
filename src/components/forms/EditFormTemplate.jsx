// src/components/forms/EditFormTemplate.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import Button from '../common/Button';
import FormBuilder from './FormBuilder';
import TemplateApproverSelector from './TemplateApproverSelector';
import useFormTemplateStore from '../../store/formTemplateStore';

const EditFormTemplate = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const { 
    currentTemplate, 
    loading, 
    fetchTemplate, 
    updateTemplate, 
    clearCurrentTemplate 
  } = useFormTemplateStore();
  
  const [formData, setFormData] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [formBuilderKey, setFormBuilderKey] = useState(0);

  // Load template data on mount
  useEffect(() => {
    const loadTemplate = async () => {
      console.log('Loading template with ID:', id);
      
      try {
        const template = await fetchTemplate(parseInt(id));
        console.log('Template fetched from store:', template);
        console.log('Template formSchema:', template.formSchema);
        console.log('Template fields:', template.formSchema?.fields);
        console.log('Field count:', template.formSchema?.fields?.length);

        // Ensure proper structure with IDs for fields
        const originalFields = template.formSchema?.fields || [];
        console.log('Original fields:', originalFields);
        console.log('Original fields length:', originalFields.length);

        const fieldsWithIds = originalFields.map((field, index) => ({
          ...field,
          id: field.id || `field_${Date.now()}_${index}`,
          name: field.name || `${field.type}_${index}`
        }));

        console.log('Fields with IDs:', fieldsWithIds);
        console.log('Fields with IDs length:', fieldsWithIds.length);

        const templateData = {
          ...template,
          approvers: template.approvers || { approvers: [], mode: 'sequential' },
          formSchema: {
            ...template.formSchema,
            fields: fieldsWithIds
          }
        };

        console.log('Final template data being set:', templateData);
        console.log('Final fields count:', templateData.formSchema.fields.length);
        
        setFormData(templateData);
        
        // Force FormBuilder re-render after state is set
        setTimeout(() => {
          console.log('Forcing FormBuilder re-render');
          setFormBuilderKey(prev => prev + 1);
        }, 100);
        
      } catch (error) {
        console.error('Failed to load template:', error);
        navigate('/form-templates');
      }
    };

    if (id) {
      loadTemplate();
    }

    // Cleanup on unmount
    return () => {
      clearCurrentTemplate();
    };
  }, [id, fetchTemplate, navigate, clearCurrentTemplate]);

  // Watch for currentTemplate changes from store
  useEffect(() => {
    console.log('Store currentTemplate changed:', currentTemplate);
    
    if (currentTemplate && !formData) {
      console.log('Setting formData from store currentTemplate');
      
      const originalFields = currentTemplate.formSchema?.fields || [];
      console.log('Setting formData from store - original fields:', originalFields);
      console.log('Setting formData from store - fields count:', originalFields.length);
      
      const fieldsWithIds = originalFields.map((field, index) => ({
        ...field,
        id: field.id || `field_${Date.now()}_${index}`,
        name: field.name || `${field.type}_${index}`
      }));

      console.log('Setting formData from store - fields with IDs:', fieldsWithIds);
      console.log('Setting formData from store - fields with IDs count:', fieldsWithIds.length);

      const templateData = {
        ...currentTemplate,
        approvers: currentTemplate.approvers || { approvers: [], mode: 'sequential' },
        formSchema: {
          ...currentTemplate.formSchema,
          fields: fieldsWithIds
        }
      };

      setFormData(templateData);
      setFormBuilderKey(prev => prev + 1);
    }
  }, [currentTemplate, formData]);

  const handleFormChange = (newSchema) => {
    console.log('Form schema changed in edit:', newSchema);
    
    if (!formData) return;
    
    setFormData(prev => ({
      ...prev,
      formSchema: {
        fields: Array.isArray(newSchema.fields) ? newSchema.fields : []
      }
    }));
  };

  const handleApproversChange = (approversConfig) => {
    console.log('Approvers changed:', approversConfig);
    setFormData(prev => ({
      ...prev,
      approvers: approversConfig
    }));
  };

  const handleSave = async () => {
    if (!formData) return;
    
    setIsSaving(true);
    try {
      await updateTemplate(parseInt(id), formData);
      navigate('/form-templates');
    } catch (error) {
      console.error('Error saving template:', error);
    } finally {
      setIsSaving(false);
    }
  };

  // Show loading state
  if (loading || !formData) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-africell-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading template...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            icon={ArrowLeft}
            onClick={() => navigate('/form-templates')}
          >
            Back
          </Button>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Edit Form Template
            </h2>
            <p className="text-gray-600">{formData.templateName}</p>
          </div>
        </div>
        
        <div className="flex space-x-2">
          <Button
            variant="outline"
            onClick={() => navigate('/form-templates')}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleSave}
            disabled={isSaving}
            icon={Save}
            loading={isSaving}
          >
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>

      {/* Enhanced Debug Info */}
      {/* {process.env.NODE_ENV === 'development' && (
        <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
          <h4 className="text-sm font-medium text-yellow-800">Debug Info:</h4>
          <div className="space-y-1 text-xs text-yellow-700">
            <p>Template ID: {id}</p>
            <p>Store currentTemplate: {currentTemplate ? 'Present' : 'Null'}</p>
            <p>Store loading: {loading ? 'True' : 'False'}</p>
            <p>FormData: {formData ? 'Present' : 'Null'}</p>
            <p>Current Fields: {formData?.formSchema?.fields?.length || 0}</p>
            <p>FormBuilder Key: {formBuilderKey}</p>
            <p>Template Name: {formData?.templateName}</p>
            
            {formData?.formSchema?.fields && (
              <details className="mt-2">
                <summary className="cursor-pointer font-medium">Field Details</summary>
                <div className="mt-2 space-y-1">
                  {formData.formSchema.fields.map((field, index) => (
                    <p key={index}>
                      {index + 1}. {field.label} ({field.type}) - {field.name}
                    </p>
                  ))}
                </div>
              </details>
            )}
            
            <details className="mt-2">
              <summary className="cursor-pointer font-medium">Store Current Template</summary>
              <pre className="mt-2 p-2 bg-white rounded text-xs overflow-auto max-h-40">
                {JSON.stringify(currentTemplate, null, 2)}
              </pre>
            </details>
            
            <details className="mt-2">
              <summary className="cursor-pointer font-medium">FormData Being Used</summary>
              <pre className="mt-2 p-2 bg-white rounded text-xs overflow-auto max-h-40">
                {JSON.stringify(formData, null, 2)}
              </pre>
            </details>
          </div>
        </div>
      )} */}

      <div className="p-6 bg-white rounded-lg shadow">
        <div className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Template Name
              </label>
              <input
                type="text"
                value={formData.templateName || ''}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  templateName: e.target.value
                }))}
                className="block mt-1 w-full rounded-md border-gray-300 shadow-sm focus:border-africell-primary focus:ring-africell-primary sm:text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Category
              </label>
              <input
                type="text"
                value={formData.category || ''}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  category: e.target.value
                }))}
                className="block mt-1 w-full rounded-md border-gray-300 shadow-sm focus:border-africell-primary focus:ring-africell-primary sm:text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Description
            </label>
            <textarea
              rows={3}
              value={formData.description || ''}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                description: e.target.value
              }))}
              className="block mt-1 w-full rounded-md border-gray-300 shadow-sm focus:border-africell-primary focus:ring-africell-primary sm:text-sm"
            />
          </div>

          {/* Form Builder */}
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700">
              Form Fields ({formData.formSchema?.fields?.length || 0} fields)
            </label>
            
            {/* Additional debug for FormBuilder */}
            {/* {process.env.NODE_ENV === 'development' && (
              <div className="mb-4 p-2 bg-blue-50 rounded text-xs">
                <p><strong>Passing to FormBuilder:</strong></p>
                <p>Schema fields count: {formData.formSchema?.fields?.length || 0}</p>
                <p>Initial fields count: {formData.formSchema?.fields?.length || 0}</p>
                <p>Key: form-builder-edit-{formBuilderKey}-{formData.formSchema?.fields?.length || 0}</p>
                {formData.formSchema?.fields?.length > 0 && (
                  <p>First field: {formData.formSchema.fields[0]?.label} ({formData.formSchema.fields[0]?.type})</p>
                )}
              </div>
            )} */}
            
            <div className="overflow-hidden rounded-lg border">
              <FormBuilder
                key={`form-builder-edit-${formBuilderKey}-${formData.formSchema?.fields?.length || 0}`}
                schema={formData.formSchema || { fields: [] }}
                onChange={handleFormChange}
                initialFields={formData.formSchema?.fields || []}
              />
            </div>
          </div>

          {/* Approver Configuration */}
          <div>
            <TemplateApproverSelector
              key={`approver-selector-edit-${formBuilderKey}`}
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
                  checked={formData.isActive || false}
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
                  checked={formData.isDefault || false}
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
          <div className="p-4 bg-gray-50 rounded-lg">
            <h4 className="mb-2 text-sm font-medium text-gray-700">Template Summary</h4>
            <div className="space-y-1 text-sm text-gray-600">
              <p><strong>Fields:</strong> {formData.formSchema?.fields?.length || 0}</p>
              <p><strong>Required fields:</strong> {formData.formSchema?.fields?.filter(f => f.required).length || 0}</p>
              <p><strong>Field types:</strong> {[...new Set(formData.formSchema?.fields?.map(f => f.type))].join(', ') || 'None'}</p>
              <p><strong>Approvers:</strong> {formData.approvers?.approvers?.length || 0}</p>
              <p><strong>Approval mode:</strong> {formData.approvers?.mode === 'sequential' ? 'Sequential' : 'Any approver'}</p>
              <p><strong>Required approvers:</strong> {formData.approvers?.approvers?.filter(a => a.isRequired)?.length || 0}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditFormTemplate;