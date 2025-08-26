// src/pages/PendingApprovals.jsx
import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle,
  XCircle,
  Eye,
  Clock,
  ClipboardList,
  ShieldCheck,
  User,
  FileText,
  AlertTriangle,
} from 'lucide-react';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import { format } from 'date-fns';

import Button from '../../components/common/Button';
import SignatureField from '../../components/forms/SignatureField';

// NEW: centralized preview (shows schema-driven details + previous approvals & signatures)
import ApprovalPreview from '../../components/approvals/ApprovalPreview';

import {
  demoRequests,
  demoApprovalChains,
  STATUS_CONFIG,
  PRIORITY_CONFIG,
} from '../../data/demoData';

const PendingApprovals = ({ currentUserId = 2 }) => {
  const [pendingApprovals, setPendingApprovals] = useState([]);
  const [viewState, setViewState] = useState({
    open: false,
    // chain/approval record id
    approvalId: null,
    // the request object
    request: null,
  });

  // For approve/reject panel inside modal
  const [actionComment, setActionComment] = useState('');
  const [signatureData, setSignatureData] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // For confirm dialog
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    actionType: null, // 'approved' or 'rejected'
    approvalId: null,
    title: '',
    message: '',
  });

  // Load pending approvals for this manager
  useEffect(() => {
    const userApprovals = demoApprovalChains
      .filter((chain) => chain.approverId === currentUserId && chain.status === 'pending')
      .map((chain) => {
        const request = demoRequests.find((r) => r.id === chain.requestId);
        return request ? { ...chain, request } : null;
      })
      .filter(Boolean);

    setPendingApprovals(userApprovals);
  }, [currentUserId]);

  const openView = (approvalId, request) => {
    setActionComment('');
    setSignatureData(null);
    setViewState({ open: true, approvalId, request });
  };

  const closeView = () => {
    setViewState({ open: false, approvalId: null, request: null });
    setActionComment('');
    setSignatureData(null);
  };

  // Handle confirm dialog open
  const handleActionClick = (type, approvalId) => {
    const isApproval = type === 'approved';
    setConfirmDialog({
      isOpen: true,
      actionType: type,
      approvalId,
      title: `Confirm ${isApproval ? 'Approval' : 'Rejection'}`,
      message: `Are you sure you want to ${isApproval ? 'approve' : 'reject'} this request?`,
      variant: isApproval ? 'primary' : 'danger',
    });
  };

  // Handle confirm dialog confirm
  const handleConfirmAction = async () => {
    const { actionType, approvalId } = confirmDialog;
    setIsSubmitting(true);
    
    try {
      // Replace with real API call:
      // await api.approvals.update({ 
      //   id: approvalId, 
      //   status: actionType, 
      //   comment: actionComment, 
      //   signature: signatureData 
      // });
      
      // For demo purposes, we'll log the action
      console.log(`${actionType === 'approved' ? 'Approved' : 'Rejected'} (chain ID: ${approvalId})`);
      if (actionComment) console.log(`Comment: ${actionComment}`);
      if (signatureData) console.log('Signature: attached');

      // Optimistic UI update – remove this item from the list
      setPendingApprovals((prev) => prev.filter((p) => p.id !== approvalId));
      closeView();
    } catch (error) {
      console.error('Error performing action:', error);
    } finally {
      setIsSubmitting(false);
      setConfirmDialog(prev => ({ ...prev, isOpen: false }));
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Pending Approvals</h1>
        <p className="text-gray-600">
          Review and take action on requests that require your approval.
        </p>
      </div>

      {/* Empty State */}
      {pendingApprovals.length === 0 ? (
        <div className="py-12 text-center">
          <ShieldCheck className="mx-auto mb-4 w-16 h-16 text-green-400" />
          <h3 className="text-lg font-medium text-gray-900">No pending approvals</h3>
          <p className="text-gray-500">You have no requests awaiting your action.</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {pendingApprovals.map(({ id, request, dueDate, approvalOrder }) => {
            const priorityCfg = PRIORITY_CONFIG[request.priority] || {};
            const statusCfg = STATUS_CONFIG[request.status] || {};
            return (
              <motion.div
                key={id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${priorityCfg.color}`}>
                      {priorityCfg.label} Priority
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusCfg.color}`}>
                      {statusCfg.label}
                    </span>
                  </div>

                  <h3 className="font-semibold text-gray-900 mb-1">{request.title}</h3>
                  <p className="text-sm text-gray-600 mb-4">{request.requestNumber}</p>

                  <div className="space-y-1 text-sm text-gray-500 mb-4">
                    <p className="flex items-center gap-1">
                      <User className="w-4 h-4" />
                      <span><strong>Requester:</strong> {request.requesterName}</span>
                    </p>
                    <p className="flex items-center gap-1">
                      <ClipboardList className="w-4 h-4" />
                      <span><strong>Approval Level:</strong> {approvalOrder} / {request.totalApprovalLevels}</span>
                    </p>
                    {dueDate && (
                      <p className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>Due: {format(new Date(dueDate), 'PPpp')}</span>
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex gap-2 mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    icon={Eye}
                    onClick={() => openView(id, request)}
                    className="flex-1"
                  >
                    View
                  </Button>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* VIEW MODAL */}
      <AnimatePresence>
        {viewState.open && viewState.request && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.98, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.98, opacity: 0 }}
              className="w-full max-w-5xl bg-white rounded-xl shadow-xl overflow-hidden"
            >
              {/* Modal Header */}
              <div className="flex items-start justify-between p-6 pb-4 border-b">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-bold text-gray-900">
                      {viewState.request.title}
                    </h3>
                    {viewState.request.priority && (
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${PRIORITY_CONFIG[viewState.request.priority]?.color || 'bg-gray-100 text-gray-800'}`}>
                        {PRIORITY_CONFIG[viewState.request.priority]?.label || 'Normal'} Priority
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-600">
                    <span className="flex items-center gap-1">
                      <span className="font-medium">Request #:</span> {viewState.request.requestNumber}
                    </span>
                    <span className="text-gray-400">•</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {format(
                        new Date(viewState.request.submittedAt || viewState.request.createdAt),
                        'MMM d, yyyy h:mm a'
                      )}
                    </span>
                    <span className="text-gray-400">•</span>
                    <span className="flex items-center gap-1">
                      <User className="w-3.5 h-3.5" />
                      {viewState.request.requesterName}
                    </span>
                  </div>
                </div>
                <button
                  onClick={closeView}
                  className="p-1.5 -mt-1 -mr-1.5 text-gray-400 rounded-lg hover:text-gray-600 hover:bg-gray-100 transition-colors"
                  aria-label="Close"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Modal Body */}
              <div className="flex flex-col h-[65vh] overflow-hidden">
                <div className="flex-1 overflow-y-auto p-6 space-y-8">
                  {/* Request Details Section */}
                  <section className="space-y-4">
                    <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                      <FileText className="w-5 h-5 text-africell-primary" />
                      Request Details
                    </h2>
                    <div className="bg-gray-50 rounded-xl p-5 border border-gray-100">
                      <ApprovalPreview requestId={viewState.request.id} />
                    </div>
                  </section>

                  {/* Approval Action Section */}
                  <section className="space-y-4">
                    <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                      <ShieldCheck className="w-5 h-5 text-africell-primary" />
                      Your Approval Action
                    </h2>
                    <div className="space-y-4">
                      <div>
                        <label htmlFor="approval-comment" className="block text-sm font-medium text-gray-700 mb-1.5">
                          Add a comment <span className="text-gray-400">(optional)</span>
                        </label>
                        <textarea
                          id="approval-comment"
                          rows={3}
                          value={actionComment}
                          onChange={(e) => setActionComment(e.target.value)}
                          placeholder="Add any additional notes or instructions for the requester..."
                          className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-africell-primary focus:border-transparent transition-shadow shadow-sm"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">
                          Add your signature <span className="text-gray-400">(optional)</span>
                        </label>
                        <div className="p-4 rounded-xl border border-gray-200 bg-white">
                          <SignatureField
                            label={null}
                            value={signatureData}
                            onChange={setSignatureData}
                            maxWidth={500}
                            maxHeight={140}
                            clearButton={!!signatureData}
                            clearButtonText="Clear"
                            className="border-2 border-dashed border-gray-200 rounded-lg"
                          />
                        </div>
                      </div>
                    </div>
                  </section>
                </div>

                {/* Sticky Footer */}
                <div className="border-t border-gray-200 bg-white p-4">
                  <div className="flex flex-col sm:flex-row-reverse sm:items-center justify-between gap-3">
                    <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                      <Button
                        variant="primary"
                        size="lg"
                        icon={CheckCircle}
                        loading={isSubmitting}
                        disabled={isSubmitting}
                        onClick={() => handleActionClick('approved', viewState.approvalId)}
                        className="w-full sm:w-auto justify-center"
                      >
                        Approve
                      </Button>
                      <Button
                        variant="danger"
                        size="lg"
                        icon={XCircle}
                        loading={isSubmitting}
                        disabled={isSubmitting}
                        onClick={() => handleActionClick('rejected', viewState.approvalId)}
                      >
                        Reject
                      </Button>
                    </div>
                    <Button 
                      variant="ghost" 
                      onClick={closeView}
                      className="w-full sm:w-auto justify-center"
                    >
                      Close
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Confirm Dialog */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title={confirmDialog.title}
        message={confirmDialog.message}
        confirmText={confirmDialog.actionType === 'approved' ? 'Approve' : 'Reject'}
        cancelText="Cancel"
        variant={confirmDialog.variant}
        onConfirm={handleConfirmAction}
        onCancel={() => setConfirmDialog(prev => ({ ...prev, isOpen: false }))}
        loading={isSubmitting}
      />
    </div>
  );
};

export default PendingApprovals;
