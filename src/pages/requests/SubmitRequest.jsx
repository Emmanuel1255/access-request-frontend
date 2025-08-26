// src/pages/requests/SubmitRequest.jsx
import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Send,
  X,
  Calendar,
  Clock,
  User,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  FileText,
  Layers,
  ChevronRight
} from 'lucide-react';
import { format } from 'date-fns';

import useRequestStore from '../../store/requestStore';
import useAuthStore from '../../store/authStore';

import Button from '../../components/common/Button';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import StatusBadge from '../../components/requests/StatusBadge';
import PriorityBadge from '../../components/requests/PriorityBadge';
import { REQUEST_STATUS, STATUS_CONFIG } from '../../data/demoData';

const SubmitRequest = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [confirmDialog, setConfirmDialog] = useState({ show: false });

  const { user } = useAuthStore();
  const {
    currentRequest,
    fetchRequest,
    clearCurrentRequest,
    updateRequest,
    submitRequest, // optional in your store; we’ll try this first if it exists
    loading: storeLoading
  } = useRequestStore();

  useEffect(() => {
    const load = async () => {
      try {
        await fetchRequest(parseInt(id, 10));
      } catch (e) {
        navigate('/requests');
      } finally {
        setLoading(false);
      }
    };
    load();
    return () => clearCurrentRequest();
  }, [id, fetchRequest, clearCurrentRequest, navigate]);

  const approvers = useMemo(
    () => currentRequest?.template?.approvers?.approvers ?? [],
    [currentRequest]
  );
  const approvalMode = currentRequest?.template?.approvers?.mode ?? 'sequential';

  const canSubmit = useMemo(() => {
    if (!currentRequest) return false;
    if (currentRequest.status !== REQUEST_STATUS.DRAFT) return false;
    if (approvers.length === 0) return false;
    if (currentRequest.requesterId !== user?.id) return false;
    return true;
  }, [currentRequest, approvers.length, user?.id]);

  const renderFormData = () => {
    if (!currentRequest?.formData || !currentRequest?.template) return null;
    const { formData, template } = currentRequest;
    const fields = template.formSchema?.fields || [];
    if (fields.length === 0) return null;

    return (
      <div className="space-y-4">
        {fields.map((field) => {
          const value = formData[field.name];
          if (
            value === undefined ||
            value === null ||
            (Array.isArray(value) && value.length === 0) ||
            value === ''
          )
            return null;

          const label =
            field.type === 'select' && field.options
              ? field.options.find((o) => o.value === value)?.label || value
              : Array.isArray(value)
              ? value
                  .map((v) => field.options?.find((o) => o.value === v)?.label || v)
                  .join(', ')
              : field.type === 'date'
              ? (() => {
                  try {
                    return format(new Date(value), 'MMMM dd, yyyy');
                  } catch {
                    return String(value);
                  }
                })()
              : field.type === 'textarea'
              ? value
              : String(value);

          return (
            <div key={field.name} className="pb-3 border-b border-gray-200">
              <dt className="mb-1 text-sm font-medium text-gray-500">{field.label}</dt>
              <dd
                className={`text-sm text-gray-900 ${
                  field.type === 'textarea' ? 'whitespace-pre-wrap' : ''
                }`}
              >
                {label}
              </dd>
            </div>
          );
        })}
      </div>
    );
  };

  const handleConfirmSubmit = async () => {
    try {
      const submittedAt = new Date().toISOString();
      const totalApprovalLevels = approvers.length;

      // Prefer a dedicated submitRequest if your store exposes it
      if (typeof submitRequest === 'function') {
        await submitRequest(parseInt(id, 10));
      } else {
        // Fallback to updateRequest with sensible fields
        await updateRequest(parseInt(id, 10), {
          status: REQUEST_STATUS.PENDING,
          submittedAt,
          currentApprovalLevel: 1, // after submit, first approver is up next
          totalApprovalLevels,
          assignedTo: approvers[0]?.userId || null,
          assignedToName: approvers[0]?.userName || null
        });
      }

      setConfirmDialog({ show: false });
      navigate(`/requests/${id}`);
    } catch (error) {
      console.error('Submit failed', error);
      setConfirmDialog({ show: false });
    }
  };

  if (loading || storeLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!currentRequest) {
    return (
      <div className="py-12 text-center">
        <AlertCircle className="mx-auto mb-4 w-12 h-12 text-gray-400" />
        <h3 className="mb-2 text-lg font-medium text-gray-900">Request not found</h3>
        <p className="mb-6 text-gray-500">This request does not exist or has been removed.</p>
        <Button variant="primary" onClick={() => navigate('/requests')}>
          Back to Requests
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex gap-4 items-center">
          <Button variant="ghost" icon={ArrowLeft} onClick={() => navigate(`/requests/${id}`)}>
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Submit Request</h1>
            <p className="text-gray-600">
              Request #{currentRequest.requestNumber} • {currentRequest.title}
            </p>
          </div>
        </div>

        <div className="hidden gap-2 items-center md:flex">
          <StatusBadge status={currentRequest.status} size="md" />
          <PriorityBadge priority={currentRequest.priority} size="md" />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Main Card */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-2 p-6 bg-white rounded-lg border border-gray-200 shadow-sm"
        >
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Review your request</h2>
              <p className="text-gray-600">Please confirm the details before submitting for approval.</p>
            </div>
            <div className="text-right">
              <div className="text-xs text-gray-500">Created</div>
              <div className="text-sm text-gray-800">
                {format(new Date(currentRequest.createdAt), 'MMM dd, yyyy HH:mm')}
              </div>
            </div>
          </div>

          {/* Quick Meta */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3 mb-6">
            <div className="flex gap-3 items-center p-3 rounded-lg bg-gray-50">
              <Layers className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-xs text-gray-500">Template</p>
                <p className="text-sm font-medium text-gray-900">
                  {currentRequest.template?.templateName || 'Unknown'}
                </p>
              </div>
            </div>
            <div className="flex gap-3 items-center p-3 rounded-lg bg-gray-50">
              <User className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-xs text-gray-500">Requester</p>
                <p className="text-sm font-medium text-gray-900">{currentRequest.requesterName}</p>
              </div>
            </div>
            <div className="flex gap-3 items-center p-3 rounded-lg bg-gray-50">
              <Calendar className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-xs text-gray-500">Due Date</p>
                <p className="text-sm font-medium text-gray-900">
                  {currentRequest.dueDate
                    ? format(new Date(currentRequest.dueDate), 'MMM dd, yyyy')
                    : '—'}
                </p>
              </div>
            </div>
          </div>

          {/* Form Data */}
          <div className="mt-2">
            <h3 className="mb-3 text-md font-medium text-gray-900 flex items-center gap-2">
              <FileText className="w-4 h-4 text-gray-500" />
              Form Details
            </h3>
            {renderFormData() || (
              <div className="p-4 text-sm text-gray-600 border border-gray-200 rounded-lg">
                No form values found.
              </div>
            )}
          </div>
        </motion.div>

        {/* Approvals Card */}
        <motion.div
          initial={{ opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          className="p-6 bg-white rounded-lg border border-gray-200 shadow-sm"
        >
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Approval Workflow</h3>
              <p className="text-sm text-gray-600">
                Mode:{' '}
                <span className="font-medium">
                  {approvalMode === 'sequential' ? 'Sequential' : 'Any Approver'}
                </span>
              </p>
            </div>
            <ShieldCheck className="w-6 h-6 text-africell-primary" />
          </div>

          {/* Approver List */}
          <div className="space-y-3">
            {approvers.length === 0 && (
              <div className="p-3 text-sm text-gray-600 bg-gray-50 rounded-lg border border-gray-200">
                No approvers configured on this template.
              </div>
            )}
            {approvers.map((a, index) => (
              <motion.div
                key={a.id || `${a.userId}-${index}`}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:shadow-sm transition"
              >
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-r from-africell-primary to-africell-secondary flex items-center justify-center text-white font-medium">
                  {a.userName?.charAt(0)?.toUpperCase() ?? 'A'}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-gray-900 truncate">{a.userName}</p>
                    {a.isRequired && (
                      <span className="px-2 py-0.5 text-[10px] font-medium rounded-full bg-red-100 text-red-700">
                        Required
                      </span>
                    )}
                    {a.canDelegate && (
                      <span className="px-2 py-0.5 text-[10px] font-medium rounded-full bg-blue-100 text-blue-700">
                        Can delegate
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-600 truncate">
                    {a.userJobTitle} • {a.userDepartment}
                  </p>
                </div>
                {approvalMode === 'sequential' && (
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <span>Step {index + 1}</span>
                    <ChevronRight className="w-4 h-4" />
                  </div>
                )}
              </motion.div>
            ))}
          </div>

          {/* Progress Preview (hidden until pending) */}
          {currentRequest.status !== REQUEST_STATUS.DRAFT && currentRequest.totalApprovalLevels > 0 && (
            <div className="mt-4">
              <div className="flex justify-between items-center mb-2 text-sm text-gray-600">
                <span>Approval Progress</span>
                <span>
                  {currentRequest.currentApprovalLevel} of {currentRequest.totalApprovalLevels}
                </span>
              </div>
              <div className="w-full h-2 bg-gray-200 rounded-full">
                <div
                  className="h-2 rounded-full transition-all bg-africell-primary"
                  style={{
                    width: `${
                      (currentRequest.currentApprovalLevel / currentRequest.totalApprovalLevels) * 100
                    }%`
                  }}
                />
              </div>
            </div>
          )}
        </motion.div>
      </div>

      {/* Submit Card */}
      {/* <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 bg-white rounded-lg border border-gray-200 shadow-sm"
        >
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="space-y-1">
              <h3 className="text-lg font-semibold text-gray-900">Submit for Approval</h3>
              <p className="text-sm text-gray-600">
                Once submitted, the request will be routed to the approvers shown above.
              </p>
              {!canSubmit && (
                <div className="flex gap-2 items-center text-sm text-red-600">
                  <AlertCircle className="w-4 h-4" />
                  <span>
                    You can only submit your own draft requests that have at least one approver.
                  </span>
                </div>
              )}
            </div>
            <div className="flex gap-3">
              <Button variant="outline" icon={X} onClick={() => navigate(`/requests/${id}`)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                icon={Send}
                disabled={!canSubmit}
                onClick={() =>
                  setConfirmDialog({
                    show: true,
                    title: 'Submit Request',
                    message:
                      'Are you sure you want to submit this request for approval? You will not be able to edit after submission.',
                    confirmText: 'Submit'
                  })
                }
              >
                Submit
              </Button>
            </div>
          </div>
        </motion.div>
      </AnimatePresence> */}

      {/* Confirm Submit */}
      <ConfirmDialog
        isOpen={confirmDialog.show}
        title={confirmDialog.title}
        message={confirmDialog.message}
        confirmText={confirmDialog.confirmText}
        onConfirm={handleConfirmSubmit}
        onCancel={() => setConfirmDialog({ show: false })}
        variant="primary"
      />
    </div>
  );
};

export default SubmitRequest;
