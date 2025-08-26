// src/pages/requests/EditRequest.jsx
import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  ArrowLeft,
  Save,
  Send,
  FileText,
  User,
  Crown,
  UserCheck,
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';
import { format } from 'date-fns';

import useRequestStore from '../../store/requestStore';
import Button from '../../components/common/Button';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import DynamicForm from '../../components/forms/DynamicForm';
import StatusBadge from '../../components/requests/StatusBadge';
import PriorityBadge from '../../components/requests/PriorityBadge';
import { REQUEST_PRIORITY, REQUEST_STATUS } from '../../data/demoData';

const schema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Max 200 characters'),
  priority: z.enum(['low', 'normal', 'high', 'urgent']),
  formData: z.object({}).passthrough(),
});

const roleIcon = (role) => {
  switch (role) {
    case 'admin':
      return <Crown className="w-4 h-4 text-yellow-600" />;
    case 'manager':
      return <UserCheck className="w-4 h-4 text-blue-600" />;
    default:
      return <User className="w-4 h-4 text-green-600" />;
  }
};

const roleBadge = (role) => {
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

const EditRequest = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const {
    currentRequest,
    fetchRequest,
    clearCurrentRequest,
    updateRequest,
    loading,
  } = useRequestStore();

  const [formErrors, setFormErrors] = useState({});
  const [formValues, setFormValues] = useState({});

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      title: '',
      priority: 'normal',
      formData: {},
    },
  });

  useEffect(() => {
    (async () => {
      try {
        await fetchRequest(parseInt(id, 10));
      } catch {
        navigate('/requests');
      }
    })();
    return () => clearCurrentRequest();
  }, [id, fetchRequest, clearCurrentRequest, navigate]);

  // Initialize form when request is loaded
  useEffect(() => {
    if (!currentRequest) return;
    reset({
      title: currentRequest.title || `${currentRequest.template?.templateName || 'Request'} Request`,
      priority: currentRequest.priority || 'normal',
      formData: currentRequest.formData || {},
    });
    setFormValues(currentRequest.formData || {});
  }, [currentRequest, reset]);

  const template = currentRequest?.template;
  const schemaFields = useMemo(() => template?.formSchema || { fields: [] }, [template]);

  const onDynamicFormChange = (data, errs = {}) => {
    setFormValues(data);
    setFormErrors(errs);
    setValue('formData', data);
  };

  const hasFormErrors = useMemo(() => Object.keys(formErrors || {}).length > 0, [formErrors]);

  const onSave = handleSubmit(async (values) => {
    await updateRequest(parseInt(id, 10), {
      title: values.title,
      priority: values.priority,
      formData: formValues,
      updatedAt: new Date().toISOString(),
    });
    navigate(`/requests/${id}`);
  });

  const onSubmitForApproval = handleSubmit(async (values) => {
    if (hasFormErrors) {
      // Surface a simple message; your DynamicForm already shows field level errors
      alert('Please correct the highlighted form errors before submitting.');
      return;
    }
    await updateRequest(parseInt(id, 10), {
      title: values.title,
      priority: values.priority,
      formData: formValues,
      updatedAt: new Date().toISOString(),
    });
    // Follow your existing flow that takes users to the submit page
    navigate(`/requests/${id}/submit`);
  });

  if (loading && !currentRequest) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!currentRequest) {
    return (
      <div className="py-12 text-center">
        <AlertCircle className="mx-auto mb-4 w-12 h-12 text-gray-400" />
        <h3 className="mb-2 text-lg font-medium text-gray-900">Request not found</h3>
        <p className="mb-6 text-gray-500">This request doesn’t exist or was removed.</p>
        <Button variant="primary" onClick={() => navigate('/requests')}>
          Back to Requests
        </Button>
      </div>
    );
  }

  const approvals = template?.approvers?.approvers || [];
  const approvalMode = template?.approvers?.mode || 'sequential';

  const readOnly =
    currentRequest.status !== REQUEST_STATUS.DRAFT; // Only drafts editable per your logic

  return (
    <div className="mx-auto space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex gap-4 items-center">
          <Button variant="ghost" icon={ArrowLeft} onClick={() => navigate(`/requests/${id}`)}>
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Edit Request</h1>
            <p className="text-gray-600">
              #{currentRequest.requestNumber} • {template?.templateName || 'Request'}
            </p>
          </div>
        </div>

        <div className="hidden md:flex gap-2 items-center">
          <StatusBadge status={currentRequest.status} size="md" />
          <PriorityBadge priority={currentRequest.priority} size="md" />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Main form */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-2 p-6 bg-white rounded-lg border border-gray-200 shadow-sm"
        >
          {/* Basics */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="md:col-span-2">
              <label className="block mb-1 text-sm font-medium text-gray-700">
                Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                disabled={readOnly}
                {...register('title')}
                className={`w-full px-3 py-2 rounded-lg border ${
                  errors.title ? 'border-red-300' : 'border-gray-300'
                } focus:outline-none focus:ring-2 focus:ring-africell-primary`}
                placeholder="Short summary for this request"
              />
              {errors.title && (
                <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
              )}
            </div>

            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700">
                Priority <span className="text-red-500">*</span>
              </label>
              <select
                disabled={readOnly}
                {...register('priority')}
                className={`w-full px-3 py-2 rounded-lg border ${
                  errors.priority ? 'border-red-300' : 'border-gray-300'
                } focus:outline-none focus:ring-2 focus:ring-africell-primary`}
              >
                {Object.keys(REQUEST_PRIORITY).map((k) => (
                  <option key={k} value={REQUEST_PRIORITY[k]}>
                    {REQUEST_PRIORITY[k]}
                  </option>
                ))}
              </select>
              {errors.priority && (
                <p className="mt-1 text-sm text-red-600">{errors.priority.message}</p>
              )}
            </div>
          </div>

          {/* Dynamic Form */}
          <div className="mt-6">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold text-gray-900">Details</h2>
              <div className="text-sm text-gray-500 flex items-center gap-2">
                <FileText className="w-4 h-4" />
                {template?.templateName || 'Form'}
              </div>
            </div>

            <div className={`${readOnly ? 'opacity-70 pointer-events-none' : ''}`}>
              <DynamicForm
                schema={schemaFields}
                data={formValues}
                onChange={onDynamicFormChange}
                errors={formErrors}
              />
            </div>

            {hasFormErrors && (
              <div className="flex gap-2 items-center p-3 mt-4 bg-red-50 rounded-lg border border-red-200">
                <AlertCircle className="w-4 h-4 text-red-500" />
                <span className="text-sm text-red-700">
                  Please resolve the highlighted errors above.
                </span>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-3 mt-8">
            <Button
              variant="primary"
              icon={Save}
              onClick={onSave}
              disabled={isSubmitting || readOnly}
              loading={isSubmitting}
            >
              Save Changes
            </Button>
            <Button
              variant="secondary"
              icon={Send}
              onClick={onSubmitForApproval}
              disabled={isSubmitting || readOnly}
            >
              Submit for Approval
            </Button>
          </div>
        </motion.div>

        {/* Sidebar: Approvals + Meta */}
        <div className="space-y-6">
          {/* Approvals Panel */}
          <motion.div
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            className="p-6 bg-white rounded-lg border border-gray-200 shadow-sm"
          >
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold text-gray-900">Approvals</h3>
              <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-700 capitalize">
                {approvalMode === 'sequential' ? 'Sequential' : 'Any approver'}
              </span>
            </div>

            {approvals.length === 0 ? (
              <div className="py-6 text-center">
                <AlertCircle className="mx-auto mb-2 w-8 h-8 text-gray-300" />
                <p className="text-sm text-gray-500">No approvers configured on this template.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {approvals.map((a, idx) => (
                  <div
                    key={a.id ?? `${a.userId}-${idx}`}
                    className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 border border-gray-200"
                  >
                    <div className="flex-shrink-0">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-r from-africell-primary to-africell-secondary text-white flex items-center justify-center text-sm font-semibold">
                        {(a.userName || 'A').charAt(0).toUpperCase()}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-900 truncate">
                          {a.userName}
                        </span>
                        {roleIcon(a.userRole)}
                        <span className={`text-xs px-2 py-0.5 rounded-full ${roleBadge(a.userRole)}`}>
                          {a.userRole}
                        </span>
                        {a.isRequired && (
                          <span className="ml-1 text-xs text-red-600">* required</span>
                        )}
                      </div>
                      <p className="text-xs text-gray-600 truncate">
                        {a.userJobTitle} • {a.userDepartment}
                      </p>
                      <p className="text-xs text-gray-500 truncate">{a.userEmail}</p>
                    </div>
                    <div className="text-xs text-gray-500 pl-2">
                      {approvalMode === 'sequential' ? `#${a.order || idx + 1}` : 'any'}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Progress (if pending) */}
            {currentRequest.status === REQUEST_STATUS.PENDING && (
              <div className="mt-5">
                <div className="flex justify-between items-center mb-2 text-sm text-gray-600">
                  <span>Approval Progress</span>
                  <span>
                    {currentRequest.currentApprovalLevel} of {currentRequest.totalApprovalLevels}
                  </span>
                </div>
                <div className="w-full h-2 bg-gray-200 rounded-full">
                  <div
                    className="h-2 rounded-full bg-africell-primary transition-all"
                    style={{
                      width: `${
                        (currentRequest.currentApprovalLevel /
                          Math.max(1, currentRequest.totalApprovalLevels)) * 100
                      }%`,
                    }}
                  />
                </div>
              </div>
            )}
          </motion.div>

          {/* Meta */}
          <motion.div
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            className="p-6 bg-white rounded-lg border border-gray-200 shadow-sm"
          >
            <h3 className="mb-4 text-lg font-semibold text-gray-900">Request Info</h3>
            <div className="space-y-4 text-sm">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="font-medium text-gray-900">Status</p>
                  <p className="text-gray-600 capitalize">{currentRequest.status}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="font-medium text-gray-900">Created</p>
                  <p className="text-gray-600">
                    {format(new Date(currentRequest.createdAt), 'MMM dd, yyyy')}
                  </p>
                </div>
              </div>

              {currentRequest.dueDate && (
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="font-medium text-gray-900">Due</p>
                    <p className="text-gray-600">
                      {format(new Date(currentRequest.dueDate), 'MMM dd, yyyy')}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default EditRequest;
