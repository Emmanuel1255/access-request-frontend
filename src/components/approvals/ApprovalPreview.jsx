// src/components/approvals/ApprovalPreview.jsx
import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  FileText,
  Clock,
  User,
  CheckCircle,
  XCircle,
  ShieldCheck,
  BadgeCheck,
  Stamp,
} from 'lucide-react';
import { format } from 'date-fns';

import Button from '../../components/common/Button'; // adjust path if different
import {
  demoRequests,
  demoApprovalChains,
  demoFormTemplates,
  PRIORITY_CONFIG,
  STATUS_CONFIG,
} from '../../data/demoData';

// Resolve a template by id
const getTemplateById = (id) => demoFormTemplates.find((t) => t.id === id);

// Map stored values to display labels via schema
const valueToLabel = (field, value) => {
  if (!field) return String(value ?? '');
  if (field.type === 'select') {
    const opt = field.options?.find((o) => o.value === value);
    return opt ? opt.label : String(value ?? '');
  }
  if (field.type === 'multiselect') {
    const values = Array.isArray(value) ? value : [];
    const labels =
      values
        .map((v) => field.options?.find((o) => o.value === v)?.label || v)
        .filter(Boolean) || [];
    return labels.join(', ');
  }
  if (field.type === 'checkbox') {
    return value ? 'Yes' : 'No';
  }
  return String(value ?? '');
};

// Read-only renderer driven by template schema + submitted data
const ReadOnlyFormView = ({ schema, data }) => {
  if (!schema?.fields?.length) {
    return (
      <div className="py-8 text-center text-gray-500">
        No form schema found.
      </div>
    );
  }

  const renderField = (field, idx) => {
    // Layout containers: render children but keep structure hints
    if (['container', 'columns', 'grid'].includes(field.type)) {
      const cols =
        field.layout?.columns ||
        field.layout?.gridColumns ||
        2;
      return (
        <div key={field.name || idx} className="space-y-3">
          {field.label && (
            <div className="text-sm font-medium text-gray-700">{field.label}</div>
          )}
          <div
            className={
              field.type === 'columns' || field.type === 'grid'
                ? `grid gap-4 grid-cols-${cols}`
                : 'space-y-4'
            }
          >
            {(field.children || []).map((child, i) =>
              renderField(child, `${idx}-${i}`)
            )}
          </div>
        </div>
      );
    }

    const value = data?.[field.name];
    const display = valueToLabel(field, value);

    return (
      <div key={field.name || idx} className="space-y-1">
        <div className="text-xs font-medium text-gray-500">
          {field.label}
          {field.required ? ' *' : ''}
        </div>
        <div className="px-3 py-2 rounded-lg border border-gray-200 bg-gray-50 text-sm text-gray-800">
          {display || <span className="text-gray-400">—</span>}
        </div>
      </div>
    );
  };

  return <div className="space-y-4">{schema.fields.map((f, i) => renderField(f, i))}</div>;
};

/**
 * ApprovalPreview
 *
 * Props:
 * - requestId (number) – ID of the request to preview
 * - onClose (fn) – optional close handler (if used inside a modal)
 * - headerActions (ReactNode) – optional actions area in header (e.g., Approve/Reject buttons)
 *
 * Notes:
 * - Shows request meta + read-only form preview
 * - Shows previous approvals with signature (if chain.signatureData present) or a "Signed" badge when signatureApplied
 */
const ApprovalPreview = ({ requestId, onClose, headerActions }) => {
  const request = useMemo(
    () => demoRequests.find((r) => r.id === requestId),
    [requestId]
  );

  const template = useMemo(
    () => (request ? getTemplateById(request.templateId) : null),
    [request]
  );

  const chainsForRequest = useMemo(
    () => demoApprovalChains.filter((c) => c.requestId === requestId),
    [requestId]
  );

  // All chains that are completed (approved/rejected/skipped) are "previous"
  const previousApprovals = useMemo(
    () =>
      chainsForRequest
        .filter((c) => c.status !== 'pending')
        // typical timeline order: by approvalOrder asc or fallback by actionDate
        .sort((a, b) => {
          const ao = a.approvalOrder ?? 0;
          const bo = b.approvalOrder ?? 0;
          if (ao !== bo) return ao - bo;
          const ad = a.actionDate ? new Date(a.actionDate).getTime() : 0;
          const bd = b.actionDate ? new Date(b.actionDate).getTime() : 0;
          return ad - bd;
        }),
    [chainsForRequest]
  );

  if (!request) {
    return (
      <div className="p-6 text-center text-gray-600">
        Request not found.
      </div>
    );
  }

  const priorityCfg = PRIORITY_CONFIG[request.priority] || {};
  const statusCfg = STATUS_CONFIG[request.status] || {};

  return (
    <div className="w-full max-w-5xl mx-auto bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            {request.title}
          </h3>
          <p className="text-sm text-gray-600">
            {request.requestNumber} • Submitted{' '}
            {format(
              new Date(request.submittedAt || request.createdAt),
              'PPpp'
            )}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {headerActions}
          {onClose && (
            <Button variant="ghost" onClick={onClose}>
              Close
            </Button>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="p-6 space-y-8">
        {/* Top meta row */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
          <div className="p-4 bg-gray-50 rounded-lg border">
            <div className="text-xs text-gray-500">Requester</div>
            <div className="text-sm font-medium text-gray-900">
              {request.requesterName}
            </div>
            <div className="text-xs text-gray-500">{request.requesterEmail}</div>
          </div>

          <div className="p-4 bg-gray-50 rounded-lg border">
            <div className="text-xs text-gray-500">Priority</div>
            <span
              className={`inline-flex mt-1 px-2 py-1 rounded-full text-xs font-medium ${priorityCfg.color}`}
            >
              {priorityCfg.label || '—'}
            </span>
          </div>

          <div className="p-4 bg-gray-50 rounded-lg border">
            <div className="text-xs text-gray-500">Status</div>
            <span
              className={`inline-flex mt-1 px-2 py-1 rounded-full text-xs font-medium ${statusCfg.color}`}
            >
              {statusCfg.label || '—'}
            </span>
          </div>

          <div className="p-4 bg-gray-50 rounded-lg border">
            <div className="text-xs text-gray-500">Due Date</div>
            <div className="flex items-center gap-2 text-sm font-medium text-gray-900">
              <Clock className="w-4 h-4 text-gray-500" />
              {request.dueDate ? format(new Date(request.dueDate), 'PPpp') : '—'}
            </div>
          </div>
        </div>

        {/* Read-only schema-driven submitted details */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <FileText className="w-4 h-4 text-gray-500" />
            <h4 className="text-sm font-semibold text-gray-900">
              Submitted Details
            </h4>
          </div>
          <div className="p-4 rounded-lg border">
            <ReadOnlyFormView
              schema={template?.formSchema || { fields: [] }}
              data={request.formData || {}}
            />
          </div>
        </div>

        {/* Previous approvals & signatures */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <ShieldCheck className="w-4 h-4 text-gray-500" />
            <h4 className="text-sm font-semibold text-gray-900">
              Previous Approvals & Signatures
            </h4>
          </div>

          {previousApprovals.length === 0 ? (
            <div className="p-6 text-center border rounded-lg text-gray-500">
              No previous approvals yet.
            </div>
          ) : (
            <div className="space-y-3">
              {previousApprovals.map((appr, idx) => {
                const isApproved = appr.status === 'approved';
                const isRejected = appr.status === 'rejected';
                const chip =
                  isApproved ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      <CheckCircle className="w-3 h-3" />
                      Approved
                    </span>
                  ) : isRejected ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                      <XCircle className="w-3 h-3" />
                      Rejected
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      Pending
                    </span>
                  );

                // If your backend stores a signature image, it can be on appr.signatureData (dataURL).
                // In demo data we only have `signatureApplied: true`, so we show a Signed stamp if image is missing.
                const hasSignatureImage = Boolean(appr.signatureData);
                const showSignedStamp = appr.signatureApplied && !hasSignatureImage;

                return (
                  <motion.div
                    key={appr.id || idx}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 rounded-lg border bg-white"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-r from-africell-primary to-africell-secondary text-white flex items-center justify-center text-sm font-medium">
                          {appr.approverName?.charAt(0)?.toUpperCase() || 'A'}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <div className="text-sm font-medium text-gray-900">
                              {appr.approverName}
                            </div>
                            {chip}
                            {typeof appr.approvalOrder === 'number' && (
                              <span className="text-xs text-gray-500">
                                • Step {appr.approvalOrder}
                              </span>
                            )}
                          </div>
                          <div className="mt-1 text-xs text-gray-500">
                            {appr.actionDate ? (
                              <>Actioned on {format(new Date(appr.actionDate), 'PPpp')}</>
                            ) : (
                              <>Created {appr.createdAt ? format(new Date(appr.createdAt), 'PPpp') : '—'}</>
                            )}
                          </div>
                          {appr.comments && (
                            <div className="mt-2 text-sm text-gray-700">
                              <span className="font-medium">Comments: </span>
                              {appr.comments}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Signature block */}
                      <div className="flex-shrink-0">
                        {hasSignatureImage ? (
                          <div className="border rounded-md p-2 bg-gray-50">
                            {/* Signature image preview */}
                            <img
                              src={appr.signatureData}
                              alt="Signature"
                              className="max-h-20 object-contain"
                            />
                          </div>
                        ) : showSignedStamp ? (
                          <div className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-200">
                            <Stamp className="w-3 h-3" />
                            Signed
                          </div>
                        ) : (
                          <div className="text-xs text-gray-400">No signature</div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ApprovalPreview;
