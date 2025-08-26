import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Edit,
  Copy,
  Download,
  Eye,
  Users,
  Layers,
  Calendar,
  User,
  Crown,
  UserCheck,
  Settings,
  FileText,
  CheckSquare,
  PenTool,
  Type,
  Hash,
  Mail,
  List,
  Upload,
  Container,
  Columns,
  Grid3X3
} from 'lucide-react';
import { format } from 'date-fns';
import Button from '../common/Button';
import FormPreview from './FormPreview';
import useFormTemplateStore from '../../store/formTemplateStore';
import useAuthStore from '../../store/authStore';
import { USER_ROLES } from '../../data/demoData';

const FIELD_ICONS = {
  text: Type,
  number: Hash,
  email: Mail,
  date: Calendar,
  select: List,
  multiselect: CheckSquare,
  textarea: FileText,
  checkbox: CheckSquare,
  file: Upload,
  signature: PenTool,
  container: Container,
  columns: Columns,
  grid: Grid3X3
};

const ViewFormTemplate = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { hasPermission } = useAuthStore();
  const { currentTemplate, loading, fetchTemplate } = useFormTemplateStore();
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    if (id) {
      fetchTemplate(parseInt(id));
    }
  }, [id, fetchTemplate]);

  if (loading || !currentTemplate) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-africell-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading template...</p>
        </div>
      </div>
    );
  }

  const handleEdit = () => {
    navigate(`/form-templates/${id}/edit`);
  };

  const handleDuplicate = () => {
    // In a real app, this would call an API to duplicate the template
    navigate('/form-templates/create', { 
      state: { duplicateFrom: currentTemplate } 
    });
  };

  const handleExport = () => {
    const dataStr = JSON.stringify(currentTemplate, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${currentTemplate.templateName.replace(/\s+/g, '_')}_template.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'admin':
        return Crown;
      case 'manager':
        return UserCheck;
      case 'approver':
        return User;
      default:
        return User;
    }
  };

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'admin':
        return 'bg-yellow-100 text-yellow-800';
      case 'manager':
        return 'bg-blue-100 text-blue-800';
      case 'approver':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getFieldTypeBadgeColor = (type) => {
    const colors = {
      text: 'bg-blue-100 text-blue-800',
      number: 'bg-green-100 text-green-800',
      email: 'bg-purple-100 text-purple-800',
      date: 'bg-orange-100 text-orange-800',
      select: 'bg-yellow-100 text-yellow-800',
      multiselect: 'bg-pink-100 text-pink-800',
      textarea: 'bg-indigo-100 text-indigo-800',
      checkbox: 'bg-red-100 text-red-800',
      file: 'bg-teal-100 text-teal-800',
      signature: 'bg-violet-100 text-violet-800',
      container: 'bg-slate-100 text-slate-800',
      columns: 'bg-emerald-100 text-emerald-800',
      grid: 'bg-cyan-100 text-cyan-800'
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  const renderFieldDetails = (field, index, level = 0) => {
    const FieldIcon = FIELD_ICONS[field.type] || FileText;
    
    return (
      <div key={index} className={`${level > 0 ? 'ml-6' : ''} mb-4`}>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="p-4 bg-white rounded-lg border border-gray-200 hover:shadow-sm transition-shadow"
        >
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3 flex-1">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${getFieldTypeBadgeColor(field.type)}`}>
                <FieldIcon className="w-5 h-5" />
              </div>
              
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-medium text-gray-900">
                    {field.label || 'Untitled Field'}
                  </h4>
                  {field.required && (
                    <span className="px-2 py-0.5 text-xs font-medium bg-red-100 text-red-800 rounded">
                      Required
                    </span>
                  )}
                </div>
                
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <span className={`px-2 py-0.5 text-xs font-medium rounded ${getFieldTypeBadgeColor(field.type)}`}>
                    {field.type}
                  </span>
                  <span>•</span>
                  <span>{field.name}</span>
                  {field.placeholder && (
                    <>
                      <span>•</span>
                      <span className="italic">"{field.placeholder}"</span>
                    </>
                  )}
                </div>

                {/* Field-specific details */}
                <div className="mt-2 space-y-1 text-xs text-gray-500">
                  {field.type === 'text' && field.maxLength && (
                    <p>Max length: {field.maxLength} characters</p>
                  )}
                  {field.type === 'number' && (
                    <p>Range: {field.min || 0} - {field.max || '∞'} (Step: {field.step || 1})</p>
                  )}
                  {(field.type === 'select' || field.type === 'multiselect') && field.options && (
                    <p>Options: {field.options.map(opt => opt.label).join(', ')}</p>
                  )}
                  {field.type === 'file' && (
                    <p>Accepts: {field.accept || 'All files'} • Max size: {field.maxSize || 'No limit'}</p>
                  )}
                  {field.type === 'signature' && (
                    <p>Canvas: {field.maxWidth || 400}×{field.maxHeight || 200}px • Mode: {field.signatureMode || 'draw'}</p>
                  )}
                  {field.type === 'date' && (field.min || field.max) && (
                    <p>Date range: {field.min || 'No start'} to {field.max || 'No end'}</p>
                  )}
                  {field.conditional && (
                    <p className="text-blue-600">
                      Conditional: Shows when "{field.conditional.field}" {field.conditional.operator} "{field.conditional.value}"
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Render child fields for layout types */}
          {field.children && field.children.length > 0 && (
            <div className="mt-4 pl-4 border-l-2 border-gray-200">
              <p className="text-xs font-medium text-gray-500 mb-2">
                Contains {field.children.length} field(s):
              </p>
              {field.children.map((child, childIndex) =>
                renderFieldDetails(child, childIndex, level + 1)
              )}
            </div>
          )}
        </motion.div>
      </div>
    );
  };

  const requiredFieldsCount = currentTemplate.formSchema?.fields?.filter(f => f.required).length || 0;
  const fieldTypes = [...new Set(currentTemplate.formSchema?.fields?.map(f => f.type))] || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            icon={ArrowLeft}
            onClick={() => navigate('/form-templates')}
            className="-ml-2"
          >
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{currentTemplate.templateName}</h1>
            <p className="text-gray-600">{currentTemplate.description}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Status Badges */}
          <div className="flex gap-2">
            {currentTemplate.isDefault && (
              <span className="inline-flex items-center px-3 py-1 text-xs font-medium text-green-800 bg-green-100 rounded-full">
                Default Template
              </span>
            )}
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
              currentTemplate.isActive 
                ? 'bg-green-100 text-green-800' 
                : 'bg-gray-100 text-gray-800'
            }`}>
              {currentTemplate.isActive ? 'Active' : 'Inactive'}
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              icon={Eye}
              onClick={() => setShowPreview(true)}
            >
              Preview
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              icon={Download}
              onClick={handleExport}
            >
              Export
            </Button>

            {hasPermission('manage_templates') && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  icon={Copy}
                  onClick={handleDuplicate}
                >
                  Duplicate
                </Button>
                
                <Button
                  variant="primary"
                  size="sm"
                  icon={Edit}
                  onClick={handleEdit}
                >
                  Edit
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Template Overview */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Template Info */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Template Information</h2>
            
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <dt className="text-sm font-medium text-gray-500">Category</dt>
                <dd className="mt-1 text-sm text-gray-900">{currentTemplate.category || 'Uncategorized'}</dd>
              </div>
              
              <div>
                <dt className="text-sm font-medium text-gray-500">Version</dt>
                <dd className="mt-1 text-sm text-gray-900">v{currentTemplate.version || 1}</dd>
              </div>
              
              <div>
                <dt className="text-sm font-medium text-gray-500">Created</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {format(new Date(currentTemplate.createdAt), 'PPP')}
                </dd>
              </div>
              
              <div>
                <dt className="text-sm font-medium text-gray-500">Last Updated</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {format(new Date(currentTemplate.updatedAt), 'PPP')}
                </dd>
              </div>
            </div>
          </div>

          {/* Form Fields */}
          <div className="mt-6 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">
                Form Fields ({currentTemplate.formSchema?.fields?.length || 0})
              </h2>
              <Button
                variant="outline"
                size="sm"
                icon={Eye}
                onClick={() => setShowPreview(true)}
              >
                Preview Form
              </Button>
            </div>

            {currentTemplate.formSchema?.fields?.length > 0 ? (
              <div className="space-y-4">
                {currentTemplate.formSchema.fields.map((field, index) => 
                  renderFieldDetails(field, index)
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No fields defined for this template</p>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Stats */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Statistics</h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Total Fields</span>
                <span className="font-medium">{currentTemplate.formSchema?.fields?.length || 0}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Required Fields</span>
                <span className="font-medium">{requiredFieldsCount}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Field Types</span>
                <span className="font-medium">{fieldTypes.length}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Approvers</span>
                <span className="font-medium">{currentTemplate.approvers?.approvers?.length || 0}</span>
              </div>
            </div>

            {/* Field Types Breakdown */}
            {fieldTypes.length > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <p className="text-sm font-medium text-gray-700 mb-2">Field Types Used:</p>
                <div className="flex flex-wrap gap-1">
                  {fieldTypes.map(type => (
                    <span
                      key={type}
                      className={`px-2 py-1 text-xs font-medium rounded ${getFieldTypeBadgeColor(type)}`}
                    >
                      {type}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Approval Workflow */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Approval Workflow</h3>
            
            <div className="space-y-4">
              <div>
                <dt className="text-sm font-medium text-gray-500">Mode</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {currentTemplate.approvers?.mode === 'sequential' ? 'Sequential Approval' : 'Any Approver'}
                </dd>
              </div>
              
              <div>
                <dt className="text-sm font-medium text-gray-500">Total Approvers</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {currentTemplate.approvers?.approvers?.length || 0}
                </dd>
              </div>
              
              <div>
                <dt className="text-sm font-medium text-gray-500">Required Approvals</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {currentTemplate.approvers?.approvers?.filter(a => a.isRequired).length || 0}
                </dd>
              </div>
            </div>

            {/* Approvers List */}
            {currentTemplate.approvers?.approvers?.length > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <p className="text-sm font-medium text-gray-700 mb-3">Approvers:</p>
                <div className="space-y-2">
                  {currentTemplate.approvers.approvers.map((approver, index) => {
                    const RoleIcon = getRoleIcon(approver.userRole);
                    return (
                      <div key={index} className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg">
                        <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-r from-africell-primary to-africell-secondary rounded-full flex items-center justify-center">
                          <span className="text-xs font-medium text-white">
                            {approver.userName?.charAt(0)?.toUpperCase() || 'A'}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {approver.userName}
                            </p>
                            {approver.isRequired && (
                              <span className="text-red-500">*</span>
                            )}
                          </div>
                          <div className="flex items-center gap-1">
                            <RoleIcon className="w-3 h-3 text-gray-400" />
                            <p className="text-xs text-gray-600 truncate">
                              {approver.userJobTitle}
                            </p>
                          </div>
                        </div>
                        <div className="text-xs text-gray-500">
                          #{approver.order || index + 1}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Form Preview Modal */}
      <FormPreview
        isOpen={showPreview}
        schema={currentTemplate.formSchema || { fields: [] }}
        onClose={() => setShowPreview(false)}
      />
    </div>
  );
};

export default ViewFormTemplate;