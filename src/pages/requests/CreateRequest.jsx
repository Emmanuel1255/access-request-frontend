// src/pages/requests/CreateRequest.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  ArrowLeft,
  Save,
  Send,
  FileText,
  AlertCircle,
  CheckCircle,
  Edit as EditIcon,
  Users,
  Crown,
  UserCheck,
  User,
  Info
} from 'lucide-react';
import { format } from 'date-fns';

import useFormTemplateStore from '../../store/formTemplateStore';
import useRequestStore from '../../store/requestStore';

import Button from '../../components/common/Button';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import DynamicForm from '../../components/forms/DynamicForm';
import { REQUEST_PRIORITY } from '../../data/demoData';

// ──────────────────────────────────────────────────────────────────────────────
// Validation
// ──────────────────────────────────────────────────────────────────────────────
const requestSchema = z.object({
  templateId: z.number().min(1, 'Please select a template'),
  title: z.string().min(1, 'Title is required').max(200, 'Title must be less than 200 characters'),
  priority: z.enum(['low', 'normal', 'high', 'urgent']),
  formData: z.object({}).passthrough()
});

// ──────────────────────────────────────────────────────────────────────────────
// Small helpers for role UI
// ──────────────────────────────────────────────────────────────────────────────
const RoleIcon = ({ role, className = 'w-4 h-4' }) => {
  switch (role) {
    case 'admin':
      return <Crown className={`text-yellow-600 ${className}`} />;
    case 'manager':
      return <UserCheck className={`text-blue-600 ${className}`} />;
    case 'approver':
      return <User className={`text-green-600 ${className}`} />;
    default:
      return <User className={`text-gray-600 ${className}`} />;
  }
};

const roleBadgeClass = (role) => {
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

// ──────────────────────────────────────────────────────────────────────────────
// Approvers (read-only list)
// ──────────────────────────────────────────────────────────────────────────────
const ApproversSummary = ({ approvers = [], mode = 'sequential' }) => {
  const modeExplainer =
    mode === 'sequential'
      ? 'Approvers must approve in the specified order.'
      : 'Any of the listed approvers can approve.';

  if (!Array.isArray(approvers) || approvers.length === 0) {
    return (
      <div className="py-8 text-center rounded-lg border-2 border-gray-300 border-dashed">
        <Users className="mx-auto mb-3 w-10 h-10 text-gray-400" />
        <p className="text-gray-600">No approvers configured for this template.</p>
      </div>
    );
  }

  const sorted = [...approvers].sort((a, b) => (a.order || 0) - (b.order || 0));

  return (
    <div className="space-y-4">
      <div className="flex gap-2 items-start p-3 bg-blue-50 rounded-lg border border-blue-200">
        <Info className="w-4 h-4 text-blue-600 mt-0.5" />
        <div className="text-sm text-blue-900">
          <span className="font-medium">{mode === 'sequential' ? 'Sequential approval' : 'Any approver'}</span>
          <span className="ml-2 text-blue-800">{modeExplainer}</span>
        </div>
      </div>

      <div className="space-y-3">
        {sorted.map((a, idx) => (
          <div
            key={a.id || `${a.userId}-${idx}`}
            className="flex gap-4 items-start p-4 bg-white rounded-lg border border-gray-200 shadow-sm"
          >
            <div className="flex-shrink-0">
              <div className="flex justify-center items-center w-9 h-9 text-sm font-semibold text-white bg-gradient-to-r rounded-full from-africell-primary to-africell-secondary">
                {mode === 'sequential' ? (a.order || idx + 1) : (a.userName?.[0]?.toUpperCase() || '?')}
              </div>
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex gap-2 items-center">
                <span className="text-sm font-medium text-gray-900 truncate">{a.userName}</span>
                <RoleIcon role={a.userRole} />
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${roleBadgeClass(a.userRole)}`}>
                  {a.userRole}
                </span>
                {a.isRequired && (
                  <span className="ml-1 text-xs text-red-500" title="Required approval">
                    *
                  </span>
                )}
                {a.canDelegate && (
                  <span className="ml-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-purple-100 text-purple-700">
                    can delegate
                  </span>
                )}
              </div>
              <div className="text-xs text-gray-600">
                {a.userJobTitle} • {a.userDepartment}
              </div>
              {a.userEmail && (
                <div className="text-xs text-gray-500 truncate">{a.userEmail}</div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ──────────────────────────────────────────────────────────────────────────────
// Main
// ──────────────────────────────────────────────────────────────────────────────
const CreateRequest = () => {
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [formData, setFormData] = useState({});
  const [validationErrors, setValidationErrors] = useState({});
  const [step, setStep] = useState(1); // 1: Template, 2: Details, 3: Review

  const navigate = useNavigate();

  const { templates, loading: templatesLoading, fetchTemplates } = useFormTemplateStore();
  const { createRequest, loading: requestLoading } = useRequestStore();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset
  } = useForm({
    resolver: zodResolver(requestSchema),
    defaultValues: {
      templateId: 0,
      title: '',
      priority: 'normal',
      formData: {}
    }
  });

  const watchedTemplateId = watch('templateId');

  useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  useEffect(() => {
    if (watchedTemplateId) {
      const template = templates.find((t) => t.id === parseInt(watchedTemplateId, 10));
      setSelectedTemplate(template || null);
      if (template && step === 1) setStep(2);
    }
  }, [watchedTemplateId, templates, step]);

  const handleTemplateSelect = (template) => {
    setValue('templateId', template.id);
    setValue('title', `${template.templateName} Request`);
    setSelectedTemplate(template);
    setFormData({});
    setValidationErrors({});
    setStep(2);
  };

  const handleFormDataChange = (data, errors = {}) => {
    setFormData(data);
    setValidationErrors(errors);
    setValue('formData', data);
  };

  const handleNext = () => {
    if (step === 2 && Object.keys(validationErrors).length === 0) {
      setStep(3);
    }
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
    else navigate('/requests');
  };

  const onSubmit = async (data, shouldSubmit = false) => {
    try {
      const request = await createRequest({
        ...data,
        formData
      });

      if (shouldSubmit) {
        navigate(`/requests/${request.id}/submit`);
      } else {
        navigate(`/requests/${request.id}`);
      }
    } catch (error) {
      console.error('Failed to create request:', error);
    }
  };

  const handleSaveDraft = () => {
    handleSubmit((data) => onSubmit(data, false))();
  };

  const handleSubmitForApproval = () => {
    handleSubmit((data) => onSubmit(data, true))();
  };

  const approverConfig = useMemo(() => {
    return {
      mode: selectedTemplate?.approvers?.mode || 'sequential',
      approvers: selectedTemplate?.approvers?.approvers || []
    };
  }, [selectedTemplate]);

  if (templatesLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="mx-auto space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex gap-4 items-center">
          <Button variant="ghost" icon={ArrowLeft} onClick={handleBack}>
            Back
          </Button>

          <div>
            <h1 className="text-2xl font-bold text-gray-900">Create New Request</h1>
            <p className="text-gray-600">Fill out the form to submit your request</p>
          </div>
        </div>

        {/* Steps */}
        <div className="hidden gap-4 items-center md:flex">
          {[
            { step: 1, label: 'Template', icon: FileText },
            { step: 2, label: 'Details', icon: EditIcon },
            { step: 3, label: 'Review', icon: CheckCircle }
          ].map(({ step: s, label, icon: Icon }) => (
            <div
              key={s}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium ${
                step >= s ? 'bg-africell-primary text-white' : 'bg-gray-100 text-gray-500'
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </div>
          ))}
        </div>
      </div>

      {/* Step 1: Template Selection */}
      {step === 1 && (
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
          <div className="p-6 bg-white rounded-lg border border-gray-200 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">Select a Template</h2>
            <p className="mb-6 text-gray-600">Choose the type of request you want to create</p>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {templates.map((template) => (
                <motion.button
                  key={template.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleTemplateSelect(template)}
                  className="p-4 text-left rounded-lg border border-gray-200 transition-all hover:border-africell-primary hover:shadow-md"
                >
                  <div className="flex gap-3 items-center mb-2">
                    <div className="flex justify-center items-center w-10 h-10 bg-gradient-to-r rounded-lg from-africell-primary to-africell-secondary">
                      <FileText className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">{template.templateName}</h3>
                      <p className="text-sm text-gray-500">{template.category}</p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600">{template.description}</p>
                </motion.button>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* Step 2: Details (Form + NEW Approval Workflow section) */}
      {step === 2 && selectedTemplate && (
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
          <div className="p-6 bg-white rounded-lg border border-gray-200 shadow-sm">
            <div className="grid gap-6 md:grid-cols-3">
              <div className="space-y-6 md:col-span-2">
                {/* Title & Priority */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Title *</label>
                    <input
                      type="text"
                      className="mt-1 w-full rounded-md border-gray-300 shadow-sm focus:border-africell-primary focus:ring-africell-primary sm:text-sm"
                      {...register('title')}
                    />
                    {errors.title && (
                      <p className="flex gap-1 items-center mt-1 text-xs text-red-600">
                        <AlertCircle className="w-4 h-4" />
                        {errors.title.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Priority *</label>
                    <select
                      className="mt-1 w-full rounded-md border-gray-300 shadow-sm focus:border-africell-primary focus:ring-africell-primary sm:text-sm"
                      {...register('priority')}
                      defaultValue="normal"
                    >
                      {Object.keys(REQUEST_PRIORITY).map((key) => {
                        const v = REQUEST_PRIORITY[key];
                        return (
                          <option key={v} value={v}>
                            {key.toLowerCase()}
                          </option>
                        );
                      })}
                    </select>
                    {errors.priority && (
                      <p className="flex gap-1 items-center mt-1 text-xs text-red-600">
                        <AlertCircle className="w-4 h-4" />
                        {errors.priority.message}
                      </p>
                    )}
                  </div>
                </div>

                {/* Hidden templateId field to keep RHF happy */}
                <input type="hidden" {...register('templateId', { valueAsNumber: true })} />

                {/* Dynamic form */}
                <div>
                  <h3 className="mb-3 text-sm font-semibold text-gray-900">Request Details</h3>
                  <div className="p-4 rounded-lg border">
                    <DynamicForm
                      schema={selectedTemplate?.formSchema || { fields: [] }}
                      data={formData}
                      errors={validationErrors}
                      onChange={handleFormDataChange}
                    />
                  </div>
                </div>

                {/* NEW: Approval Workflow (right below the form, as requested) */}
                <div>
                  <div className="flex gap-2 items-center mb-3">
                    <Users className="w-4 h-4 text-gray-500" />
                    <h4 className="text-sm font-semibold text-gray-900">Approval Workflow</h4>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg border">
                    <ApproversSummary
                      approvers={approverConfig.approvers}
                      mode={approverConfig.mode}
                    />
                  </div>
                </div>
              </div>

              {/* Template info side card */}
              <div className="space-y-4">
                <div className="p-4 bg-gray-50 rounded-lg border">
                  <div className="text-xs text-gray-500">Template</div>
                  <div className="text-sm font-medium text-gray-900">{selectedTemplate.templateName}</div>
                  <div className="text-xs text-gray-500">{selectedTemplate.category}</div>
                </div>

                <div className="p-4 bg-gray-50 rounded-lg border">
                  <div className="text-xs text-gray-500">Last Updated</div>
                  <div className="text-sm font-medium text-gray-900">
                    {selectedTemplate.updatedAt ? format(new Date(selectedTemplate.updatedAt), 'PPP') : '—'}
                  </div>
                </div>
              </div>
            </div>

            {/* Footer actions */}
            <div className="flex gap-2 justify-end items-center mt-6">
              <Button variant="outline" icon={Save} loading={requestLoading} onClick={handleSaveDraft}>
                Save Draft
              </Button>
              <Button variant="primary" icon={CheckCircle} onClick={handleNext} disabled={Object.keys(validationErrors).length > 0}>
                Review
              </Button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Step 3: Review (includes Approval Workflow again) */}
      {step === 3 && selectedTemplate && (
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
          <div className="p-6 space-y-6 bg-white rounded-lg border border-gray-200 shadow-sm">
            <div className="grid gap-6 md:grid-cols-3">
              <div className="space-y-6 md:col-span-2">
                {/* Summary */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="p-4 bg-gray-50 rounded-lg border">
                    <div className="text-xs text-gray-500">Title</div>
                    <div className="text-sm font-medium text-gray-900">{watch('title')}</div>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg border">
                    <div className="text-xs text-gray-500">Priority</div>
                    <div className="text-sm font-medium text-gray-900 capitalize">{watch('priority')}</div>
                  </div>
                </div>

                {/* Submitted details (read-only) */}
                <div>
                  <h3 className="mb-3 text-sm font-semibold text-gray-900">Submitted Details</h3>
                  <div className="p-4 rounded-lg border">
                    <DynamicForm
                      schema={selectedTemplate?.formSchema || { fields: [] }}
                      data={formData}
                      errors={{}}
                      onChange={() => {}}
                    />
                  </div>
                </div>

                {/* Approval Workflow again */}
                <div>
                  <div className="flex gap-2 items-center mb-3">
                    <Users className="w-4 h-4 text-gray-500" />
                    <h4 className="text-sm font-semibold text-gray-900">Approval Workflow</h4>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg border">
                    <ApproversSummary
                      approvers={approverConfig.approvers}
                      mode={approverConfig.mode}
                    />
                  </div>
                </div>
              </div>

              {/* Template side card */}
              <div className="space-y-4">
                <div className="p-4 bg-gray-50 rounded-lg border">
                  <div className="text-xs text-gray-500">Template</div>
                  <div className="text-sm font-medium text-gray-900">{selectedTemplate.templateName}</div>
                  <div className="text-xs text-gray-500">{selectedTemplate.category}</div>
                </div>
              </div>
            </div>

            {/* Footer actions */}
            <div className="flex gap-2 justify-end items-center">
              <Button variant="outline" onClick={() => setStep(2)}>
                Back
              </Button>
              <Button
                variant="primary"
                icon={Send}
                loading={requestLoading}
                onClick={handleSubmitForApproval}
              >
                Submit for Approval
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default CreateRequest;
