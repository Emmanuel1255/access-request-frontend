import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Search,
  Filter,
  MoreVertical,
  Edit,
  Eye,
  Copy,
  Trash2,
  Download,
  FileText,
  Layers
} from 'lucide-react';
import { format } from 'date-fns';
import useFormTemplateStore from '../../store/formTemplateStore';
import useAuthStore from '../../store/authStore';
import Button from '../../components/common/Button';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ConfirmDialog from '../../components/common/ConfirmDialog';

const FormTemplateManager = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [showActions, setShowActions] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState({ show: false, template: null });

  const navigate = useNavigate();
  const { hasPermission } = useAuthStore();
  const {
    templates,
    loading,
    fetchTemplates,
    deleteTemplate,
    getCategories
  } = useFormTemplateStore();

  useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  const categories = getCategories();

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = !searchTerm || 
      template.templateName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = !selectedCategory || template.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const handleCreateTemplate = () => {
    navigate('/form-templates/create');
  };

  const handleEditTemplate = (template) => {
    navigate(`/form-templates/${template.id}/edit`);
  };

  const handleViewTemplate = (template) => {
    navigate(`/form-templates/${template.id}`);
  };

  const handleDeleteTemplate = (template) => {
    setConfirmDialog({
      show: true,
      template,
      title: 'Delete Template',
      message: `Are you sure you want to delete "${template.templateName}"? This action cannot be undone.`
    });
  };

  const handleConfirmDelete = async () => {
    try {
      await deleteTemplate(confirmDialog.template.id);
      setConfirmDialog({ show: false, template: null });
    } catch (error) {
      console.error('Failed to delete template:', error);
    }
  };

  const getActionMenuItems = (template) => {
    return [
      {
        label: 'View Details',
        icon: Eye,
        onClick: () => handleViewTemplate(template),
        show: true
      },
      {
        label: 'Edit Template',
        icon: Edit,
        onClick: () => handleEditTemplate(template),
        show: hasPermission('manage_templates')
      },
      {
        label: 'Duplicate',
        icon: Copy,
        onClick: () => console.log('Duplicate template:', template.id),
        show: hasPermission('manage_templates')
      },
      {
        label: 'Export',
        icon: Download,
        onClick: () => {
          const dataStr = JSON.stringify(template, null, 2);
          const dataBlob = new Blob([dataStr], { type: 'application/json' });
          const url = URL.createObjectURL(dataBlob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `${template.templateName.replace(/\s+/g, '_')}_template.json`;
          link.click();
        },
        show: true
      },
      {
        label: 'Delete',
        icon: Trash2,
        onClick: () => handleDeleteTemplate(template),
        show: hasPermission('manage_templates'),
        className: 'text-red-600 hover:text-red-700'
      }
    ].filter(item => item.show);
  };

  if (loading && templates.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Form Templates</h1>
          <p className="text-gray-600">Create and manage form templates for requests</p>
        </div>
        
        {hasPermission('manage_templates') && (
          <Button
            variant="primary"
            icon={Plus}
            onClick={handleCreateTemplate}
          >
            Create Template
          </Button>
        )}
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 w-5 h-5 text-gray-400 transform -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search templates..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-africell-primary focus:border-transparent"
          />
        </div>
        
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-africell-primary focus:border-transparent"
        >
          <option value="">All Categories</option>
          {categories.map(category => (
            <option key={category} value={category}>{category}</option>
          ))}
        </select>
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredTemplates.map((template) => (
          <motion.div
            key={template.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-lg border border-gray-200 shadow-sm transition-shadow hover:shadow-md"
          >
            <div className="p-6">
              {/* Template Header */}
              <div className="flex justify-between items-start mb-4">
                <div className="flex gap-3 items-center">
                  <div className="flex justify-center items-center w-12 h-12 bg-gradient-to-r rounded-lg from-africell-primary to-africell-secondary">
                    <FileText className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 line-clamp-2">
                      {template.templateName}
                    </h3>
                    <p className="text-sm text-gray-600">{template.category}</p>
                  </div>
                </div>

                {/* Actions Menu */}
                <div className="relative">
                  <button
                    onClick={() => {
                      setSelectedTemplate(template);
                      setShowActions(!showActions);
                    }}
                    className="p-2 text-gray-400 rounded-lg transition-colors hover:text-gray-600 hover:bg-gray-100"
                  >
                    <MoreVertical className="w-4 h-4" />
                  </button>

                  <AnimatePresence>
                    {showActions && selectedTemplate?.id === template.id && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -10 }}
                        className="absolute right-0 z-50 mt-2 w-48 bg-white rounded-lg border border-gray-200 shadow-lg"
                      >
                        <div className="py-1">
                          {getActionMenuItems(template).map((item, index) => (
                            <button
                              key={index}
                              onClick={() => {
                                item.onClick();
                                setShowActions(false);
                                setSelectedTemplate(null);
                              }}
                              className={`flex items-center gap-3 w-full px-4 py-2 text-sm transition-colors hover:bg-gray-50 ${
                                item.className || 'text-gray-700'
                              }`}
                            >
                              <item.icon className="w-4 h-4" />
                              {item.label}
                            </button>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* Template Description */}
              <p className="mb-4 text-sm text-gray-600 line-clamp-2">
                {template.description || 'No description provided'}
              </p>

              {/* Template Stats */}
              <div className="flex justify-between items-center mb-4 text-sm text-gray-500">
                <div className="flex gap-1 items-center">
                  <Layers className="w-4 h-4" />
                  <span>{template.formSchema?.fields?.length || 0} fields</span>
                </div>
                <span>v{template.version || 1}</span>
              </div>

              {/* Template Meta */}
              <div className="space-y-1 text-xs text-gray-500">
                <p>Created: {format(new Date(template.createdAt), 'MMM dd, yyyy')}</p>
                <p>Updated: {format(new Date(template.updatedAt), 'MMM dd, yyyy')}</p>
              </div>

              {/* Default Badge */}
              {template.isDefault && (
                <div className="mt-3">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Default Template
                  </span>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-2 mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  icon={Eye}
                  onClick={() => handleViewTemplate(template)}
                  className="flex-1"
                >
                  View
                </Button>
                {hasPermission('manage_templates') && (
                  <Button
                    variant="primary"
                    size="sm"
                    icon={Edit}
                    onClick={() => handleEditTemplate(template)}
                    className="flex-1"
                  >
                    Edit
                  </Button>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Empty State */}
      {filteredTemplates.length === 0 && !loading && (
        <div className="py-12 text-center">
          <FileText className="mx-auto mb-4 w-16 h-16 text-gray-300" />
          <h3 className="mb-2 text-lg font-medium text-gray-900">
            {searchTerm || selectedCategory ? 'No templates found' : 'No templates yet'}
          </h3>
          <p className="mb-6 text-gray-500">
            {searchTerm || selectedCategory
              ? 'Try adjusting your search or filters'
              : 'Create your first form template to get started'
            }
          </p>
          {hasPermission('manage_templates') && (
            <Button
              variant="primary"
              icon={Plus}
              onClick={handleCreateTemplate}
            >
              Create Template
            </Button>
          )}
        </div>
      )}

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        isOpen={confirmDialog.show}
        title={confirmDialog.title}
        message={confirmDialog.message}
        confirmText="Delete Template"
        onConfirm={handleConfirmDelete}
        onCancel={() => setConfirmDialog({ show: false, template: null })}
        variant="danger"
      />

      {/* Click outside to close actions menu */}
      {showActions && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => {
            setShowActions(false);
            setSelectedTemplate(null);
          }}
        />
      )}
    </div>
  );
};

export default FormTemplateManager;