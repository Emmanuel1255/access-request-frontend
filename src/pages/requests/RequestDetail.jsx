import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Edit,
  Send,
  X,
  Copy,
  Download,
  Calendar,
  User,
  Clock,
  FileText,
  CheckCircle,
  XCircle,
  AlertCircle,
  ChevronRight,
  Crown,
  UserCheck,
  User as UserIcon,
  FileSignature,
  ShieldCheck,
  QrCode
} from 'lucide-react';
import { format } from 'date-fns';
import useRequestStore from '../../store/requestStore';
import useAuthStore from '../../store/authStore';
import Button from '../../components/common/Button';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import StatusBadge from '../../components/requests/StatusBadge';
import PriorityBadge from '../../components/requests/PriorityBadge';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import { REQUEST_STATUS, STATUS_CONFIG, demoApprovalChains } from '../../data/demoData';

// ⬇️ QR + PDF libs
import QRCode from 'qrcode';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const RoleIcon = ({ role, className = 'w-3.5 h-3.5' }) => {
  switch (role) {
    case 'admin':
      return <Crown className={className} />;
    case 'manager':
      return <UserCheck className={className} />;
    default:
      return <UserIcon className={className} />;
  }
};

/** ---------- Signature helpers ---------- */
const makeSignatureDataUrl = (name = 'Signature') => {
  const escaped = String(name).replace(/&/g, '&amp;').replace(/</g, '&lt;');
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="260" height="70">
      <rect width="100%" height="100%" fill="white"/>
      <text x="12" y="46"
        font-family="Brush Script MT, Segoe Script, Pacifico, cursive"
        font-size="32" fill="#111"
        style="letter-spacing:0.5px;"
      >${escaped}</text>
      <path d="M16 54 C 60 64, 140 64, 240 58" stroke="#333" stroke-width="1.2" fill="none" opacity="0.6"/>
    </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
};
const getSignatureSrc = (row, appr) => {
  const explicit =
    row.signatureDataUrl ||
    row.signatureUrl ||
    row.signature ||
    null;
  if (explicit) return explicit;
  if (row.status === 'approved') return makeSignatureDataUrl(appr?.userName || 'Approved');
  return null;
};
/** ---------- /Signature helpers ---------- */

const ApprovalsCard = ({ request }) => {
  const approvers = request?.template?.approvers?.approvers || [];
  const mode = request?.template?.approvers?.mode || 'sequential';

  const actions = useMemo(
    () => demoApprovalChains.filter(a => a.requestId === request.id),
    [request.id]
  );
  const byOrder = (order) => actions.find(a => a.approvalOrder === order) || { status: 'pending' };

  const statusChip = (status) => {
    switch (status) {
      case 'approved':
        return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800"><CheckCircle className="w-3.5 h-3.5" /> Approved</span>;
      case 'rejected':
        return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800"><XCircle className="w-3.5 h-3.5" /> Rejected</span>;
      case 'skipped':
        return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">Skipped</span>;
      default:
        return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800"><Clock className="w-3.5 h-3.5" /> Pending</span>;
    }
  };

  const progressPct =
    request.totalApprovalLevels > 0
      ? Math.min(100, Math.round((request.currentApprovalLevel / request.totalApprovalLevels) * 100))
      : 0;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
      className="p-6 bg-white rounded-lg border border-gray-200 shadow-sm"
    >
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Approvals</h3>
          <p className="text-sm text-gray-600">
            Mode: <span className="font-medium">{mode === 'sequential' ? 'Sequential' : 'Any Approver'}</span>
          </p>
        </div>
        {request.status === REQUEST_STATUS.PENDING && (
          <span className="text-sm text-gray-500">
            {request.currentApprovalLevel} of {request.totalApprovalLevels} complete
          </span>
        )}
      </div>

      {request.status === REQUEST_STATUS.PENDING && request.totalApprovalLevels > 0 && (
        <div className="mb-6">
          <div className="overflow-hidden w-full h-2 bg-gray-200 rounded-full">
            <div className="h-2 rounded-full transition-all bg-africell-primary" style={{ width: `${progressPct}%` }} />
          </div>
        </div>
      )}

      {approvers.length > 0 ? (
        <div className="space-y-3">
          {approvers
            .sort((a, b) => (a.order || 0) - (b.order || 0))
            .map((appr) => {
              const row = byOrder(appr.order);
              const isDone = ['approved', 'rejected', 'skipped'].includes(row.status);
              const signatureSrc = getSignatureSrc(row, appr);

              return (
                <div key={appr.id}
                  className={`flex items-start gap-3 p-3 rounded-lg border ${isDone ? 'bg-gray-50 border-gray-200' : 'bg-white border-gray-200'}`}
                >
                  <div className="flex-shrink-0">
                    <div className="flex justify-center items-center w-10 h-10 text-sm font-semibold text-white bg-gradient-to-r rounded-full from-africell-primary to-africell-secondary">
                      {appr.userName?.charAt(0)?.toUpperCase() || 'A'}
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap gap-2 items-center">
                      <p className="text-sm font-medium text-gray-900">{appr.userName}</p>
                      <RoleIcon role={appr.userRole} />
                      <span className="text-xs text-gray-500">#{appr.order}</span>
                      {appr.isRequired && (
                        <span className="px-2 py-0.5 text-[11px] rounded-full bg-red-100 text-red-700">
                          Required
                        </span>
                      )}
                      {statusChip(row.status || 'pending')}
                      {row.signatureApplied && (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[11px] bg-violet-100 text-violet-800">
                          <FileSignature className="w-3.5 h-3.5" /> Signed
                        </span>
                      )}
                    </div>

                    <p className="mt-0.5 text-xs text-gray-600">
                      {appr.userJobTitle} • {appr.userDepartment}
                    </p>

                    <div className="mt-2 space-x-2 text-xs text-gray-600">
                      {row.comments && <span className="italic">&ldquo;{row.comments}&rdquo;</span>}
                      {row.actionDate && (
                        <>
                          <span className="text-gray-400">•</span>
                          <span>{format(new Date(row.actionDate), 'MMM d, yyyy HH:mm')}</span>
                        </>
                      )}
                      {row.dueDate && !row.actionDate && (
                        <>
                          <span className="text-gray-400">•</span>
                          <span>Due {format(new Date(row.dueDate), 'MMM d, yyyy')}</span>
                        </>
                      )}
                    </div>

                    {signatureSrc ? (
                      <div className="mt-2">
                        <img
                          src={signatureSrc}
                          alt={`${appr.userName} signature`}
                          className="object-contain h-10 opacity-90"
                        />
                      </div>
                    ) : (
                      <div className="mt-2 h-10 bg-gray-100 border border-dashed rounded flex items-center justify-center text-[11px] text-gray-400">
                        No signature
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
        </div>
      ) : (
        <div className="py-10 text-center text-gray-500">
          <ChevronRight className="mx-auto mb-2 w-6 h-6 text-gray-300" />
          No approvers configured for this template.
        </div>
      )}
    </motion.div>
  );
};

// ⬇️ Compact Access Pass card (used for PDF & on-screen preview)
const AccessPassCard = React.forwardRef(({ request }, ref) => {
  const approvers = request?.template?.approvers?.approvers || [];
  const actions = useMemo(
    () => demoApprovalChains.filter(a => a.requestId === request.id),
    [request.id]
  );
  const byOrder = (order) => actions.find(a => a.approvalOrder === order) || {};

  const validity =
    request.formData?.duration === 'temporary' && request.formData?.endDate
      ? `Valid until ${format(new Date(request.formData.endDate), 'MMM dd, yyyy')}`
      : 'Valid';

  const accessDetails = (() => {
    const fd = request.formData || {};
    const parts = [];
    if (fd.accessType) parts.push(`Type: ${fd.accessType}`);
    if (fd.facilityAccess) parts.push(`Facility: ${fd.facilityAccess}`);
    if (fd.accessLevel) parts.push(`Level: ${fd.accessLevel}`);
    if (fd.startDate) parts.push(`Start: ${format(new Date(fd.startDate), 'MMM dd, yyyy')}`);
    if (fd.endDate) parts.push(`End: ${format(new Date(fd.endDate), 'MMM dd, yyyy')}`);
    return parts;
  })();

  return (
    <div ref={ref} className="p-4 mx-auto w-full max-w-4xl bg-white rounded-xl border pdf-friendly sm:p-6">
      <div className="flex flex-col gap-4 justify-between sm:flex-row sm:items-start">
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-bold text-gray-900 sm:text-xl">Access Pass</h3>
          <p className="text-sm text-gray-600 sm:text-base">{request.title}</p>
          <p className="text-xs text-gray-500 sm:text-sm">#{request.requestNumber}</p>
        </div>
        <ShieldCheck className="flex-shrink-0 w-8 h-8 text-africell-primary" />
      </div>

      <div className="grid grid-cols-1 gap-6 mt-6 md:grid-cols-3">
        {/* QR Code Section */}
        <div className="flex flex-col items-center">
          <div className="flex overflow-hidden justify-center items-center mx-auto w-40 h-40 bg-gray-50 rounded-xl border sm:w-48 sm:h-48">
            <div id="qr-slot" className="flex justify-center items-center w-full h-full">
              <div className="w-[90%] h-[90%]" />
            </div>
          </div>
          <div className="mt-3 text-xs text-center text-gray-500">{validity}</div>
        </div>

        {/* Holder Info Section */}
        <div className="space-y-2">
          <div className="text-xs text-gray-500">Requester</div>
          <div className="text-sm font-semibold text-gray-900">{request.requesterName}</div>
          <div className="text-xs text-gray-500 break-words">{request.requesterEmail}</div>

          <div className="mt-4 text-xs text-gray-500">Access Details</div>
          <div className="space-y-1 text-sm text-gray-900">
            {accessDetails.map((detail, index) => (
              <div key={index} className="break-words">{detail}</div>
            ))}
          </div>
        </div>

        {/* Signatures Section */}
        <div>
          <div className="mb-2 text-xs text-gray-500">Approvals & Signatures</div>
          <div className="overflow-y-auto pr-2 space-y-2 max-h-80">
            {approvers
              .sort((a, b) => (a.order || 0) - (b.order || 0))
              .map((appr) => {
                const row = byOrder(appr.order);
                const signatureSrc = getSignatureSrc(row, appr);
                return (
                  <div key={appr.id} className="p-2 text-xs rounded-lg border">
                    <div className="flex justify-between items-center">
                      <div className="font-medium text-gray-900">{appr.userName}</div>
                      <div className="text-[10px] text-gray-500 ml-2 flex-shrink-0">#{appr.order}</div>
                    </div>
                    {signatureSrc ? (
                      <img
                        src={signatureSrc}
                        alt={`${appr.userName} signature`}
                        className="object-contain mt-2 h-8 sm:h-10"
                      />
                    ) : (
                      <div className="mt-2 h-8 sm:h-10 bg-gray-100 border border-dashed rounded flex items-center justify-center text-[10px] text-gray-400">
                        No signature
                      </div>
                    )}
                    <div className="mt-1 text-[10px] text-gray-500">
                      {row.status ? row.status.toUpperCase() : 'PENDING'}
                      {row.actionDate && ` • ${format(new Date(row.actionDate), 'MMM d, yyyy HH:mm')}`}
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      </div>

      <div className="mt-6 text-[10px] text-gray-500 text-center sm:text-left">
        This pass is digitally generated. QR must match the pass data. Tampering voids access.
      </div>
    </div>
  );
});
AccessPassCard.displayName = 'AccessPassCard';

const RequestDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loadingView, setLoadingView] = useState(true);
  const [confirmDialog, setConfirmDialog] = useState({ show: false, type: '' });

  const [qrUrl, setQrUrl] = useState(null);
  const [qrLoading, setQrLoading] = useState(false);

  const [showAccessModal, setShowAccessModal] = useState(false);

  const passRef = useRef(null);

  const { user, hasPermission } = useAuthStore();
  const {
    currentRequest,
    fetchRequest,
    clearCurrentRequest,
    cancelRequest,
    duplicateRequest
  } = useRequestStore();

  // Load
  useEffect(() => {
    const load = async () => {
      try {
        await fetchRequest(parseInt(id, 10));
      } catch (e) {
        navigate('/requests');
      } finally {
        setLoadingView(false);
      }
    };
    load();
    return () => clearCurrentRequest();
  }, [id, fetchRequest, clearCurrentRequest, navigate]);

  // Generate QR when approved
  useEffect(() => {
    const gen = async () => {
      if (!currentRequest || currentRequest.status !== REQUEST_STATUS.APPROVED) {
        setQrUrl(null);
        return;
      }
      setQrLoading(true);
      try {
        const payload = {
          id: currentRequest.id,
          number: currentRequest.requestNumber,
          title: currentRequest.title,
          requester: currentRequest.requesterName,
          template: currentRequest.template?.templateName,
          access: {
            type: currentRequest.formData?.accessType,
            facility: currentRequest.formData?.facilityAccess,
            level: currentRequest.formData?.accessLevel,
            start: currentRequest.formData?.startDate,
            end: currentRequest.formData?.endDate || null
          },
          verifyPath: `/verify/${currentRequest.requestNumber}`
        };

        const dataUrl = await QRCode.toDataURL(JSON.stringify(payload), {
          errorCorrectionLevel: 'M',
          width: 512,
          margin: 1,
          color: { dark: '#000000', light: '#FFFFFF' }
        });
        setQrUrl(dataUrl);
      } catch (e) {
        console.error('QR generation failed', e);
      } finally {
        setQrLoading(false);
      }
    };
    gen();
  }, [currentRequest]);

  const handleEdit = () => navigate(`/requests/${id}/edit`);
  const handleSubmit = () => navigate(`/requests/${id}/submit`);
  const handleDuplicate = async () => {
    try {
      const duplicated = await duplicateRequest(parseInt(id, 10));
      navigate(`/requests/${duplicated.id}/edit`);
    } catch {}
  };

  const handleCancel = () => {
    setConfirmDialog({
      show: true,
      type: 'cancel',
      title: 'Cancel Request',
      message: 'Are you sure you want to cancel this request? This action cannot be undone.',
      confirmText: 'Cancel Request'
    });
  };

  const handleConfirmAction = async () => {
    try {
      if (confirmDialog.type === 'cancel') {
        await cancelRequest(parseInt(id, 10), 'Cancelled by user');
        navigate('/requests');
      }
      setConfirmDialog({ show: false, type: '' });
    } catch {}
  };

  const renderFormData = () => {
    if (!currentRequest?.formData || !currentRequest?.template) return null;
    const { formData, template } = currentRequest;
    const fields = template.formSchema?.fields || [];

    return (
      <div className="space-y-4">
        {fields.map((field) => {
          const value = formData[field.name];
          if (value === undefined || value === '' || value === null) return null;

          return (
            <div key={field.name} className="pb-3 border-b border-gray-200">
              <dt className="mb-1 text-sm font-medium text-gray-500">{field.label}</dt>
              <dd className="text-sm text-gray-900">
                {field.type === 'select' && field.options ? (
                  field.options.find(opt => opt.value === value)?.label || String(value)
                ) : field.type === 'multiselect' && Array.isArray(value) ? (
                  <div className="flex flex-wrap gap-1">
                    {value.map(v => {
                      const label = field.options?.find(o => o.value === v)?.label || v;
                      return (
                        <span key={v} className="px-2 py-0.5 rounded bg-gray-100 text-gray-700 text-xs">
                          {label}
                        </span>
                      );
                    })}
                  </div>
                ) : field.type === 'date' ? (
                  format(new Date(value), 'MMMM dd, yyyy')
                ) : field.type === 'textarea' ? (
                  <div className="whitespace-pre-wrap">{value}</div>
                ) : field.type === 'checkbox' ? (
                  value ? 'Yes' : 'No'
                ) : (
                  String(value)
                )}
              </dd>
            </div>
          );
        })}
      </div>
    );
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case REQUEST_STATUS.APPROVED:
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case REQUEST_STATUS.REJECTED:
        return <XCircle className="w-5 h-5 text-red-500" />;
      case REQUEST_STATUS.PENDING:
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case REQUEST_STATUS.CANCELLED:
        return <X className="w-5 h-5 text-gray-500" />;
      default:
        return <FileText className="w-5 h-5 text-gray-500" />;
    }
  };

  const canEdit =
    currentRequest?.status === REQUEST_STATUS.DRAFT &&
    (currentRequest?.requesterId === user?.id || hasPermission('edit_any_request'));
  const canCancel =
    ['draft', 'pending'].includes(currentRequest?.status) &&
    (currentRequest?.requesterId === user?.id || hasPermission('cancel_any_request'));

  // ⬇️ Download QR PNG
  const handleDownloadQR = () => {
    if (!qrUrl) return;
    const a = document.createElement('a');
    a.href = qrUrl;
    a.download = `${currentRequest.requestNumber}-access-qr.png`;
    a.click();
  };

  /***
   * Responsive PDF export:
   * - Renders a cloned pass at a stable virtual width for crisp capture
   * - Auto-chooses portrait/landscape
   * - Slices into multiple pages if needed
   */
// Enhanced responsive PDF download with configurable variables
const handleDownloadPDF = async () => {
  if (!passRef.current) return;

  // ============ CONFIGURATION VARIABLES ============
  const PDF_CONFIG = {
    // Responsive breakpoints
    breakpoints: {
      mobile: 768,
      tablet: 1024,
      desktop: 1440
    },
    
    // Virtual canvas dimensions for different screen sizes
    virtualDimensions: {
      mobile: { width: 650, padding: 16 },
      tablet: { width: 800, padding: 20 },
      desktop: { width: 1000, padding: 24 }
    },
    
    // PDF generation settings
    pdf: {
      format: 'a4',
      margin: 15, // Points
      quality: 1.0, // Image quality (0.1 - 1.0)
      pageOverlapFactor: 0.05, // 5% overlap between pages
      maxPagesWarning: 10 // Warn if content exceeds this many pages
    },
    
    // Canvas capture settings
    canvas: {
      scale: {
        mobile: 2.5,    // Higher scale for crisp mobile output
        tablet: 2.0,    // Medium scale for tablets
        desktop: 1.8    // Lower scale for desktop (larger content)
      },
      backgroundColor: '#ffffff',
      useCORS: true,
      allowTaint: true,
      logging: false
    },
    
    // Content scaling
    contentScaling: {
      fontSizeAdjustment: {
        mobile: '11px',
        tablet: '12px', 
        desktop: '13px'
      },
      lineHeightAdjustment: 1.4,
      responsiveClasses: ['pdf-export', 'print-optimized']
    }
  };

  // ============ HELPER FUNCTIONS ============
  
  const getDeviceType = () => {
    const width = window.innerWidth;
    if (width < PDF_CONFIG.breakpoints.mobile) return 'mobile';
    if (width < PDF_CONFIG.breakpoints.tablet) return 'tablet';
    return 'desktop';
  };

  const getOptimalDimensions = (deviceType) => {
    return PDF_CONFIG.virtualDimensions[deviceType];
  };

  const getOptimalScale = (deviceType) => {
    return PDF_CONFIG.canvas.scale[deviceType];
  };

  const createOptimizedClone = (sourceElement, virtualWidth, scaleFactor, deviceType) => {
    // Create container for the clone
    const cloneWrapper = document.createElement('div');
    Object.assign(cloneWrapper.style, {
      position: 'fixed',
      left: '-99999px',
      top: '0',
      width: `${virtualWidth}px`,
      padding: `${PDF_CONFIG.virtualDimensions[deviceType].padding}px`,
      backgroundColor: PDF_CONFIG.canvas.backgroundColor,
      boxSizing: 'border-box',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      lineHeight: PDF_CONFIG.contentScaling.lineHeightAdjustment
    });

    // Clone and optimize the source element
    const cloned = sourceElement.cloneNode(true);
    Object.assign(cloned.style, {
      transform: `scale(${scaleFactor})`,
      transformOrigin: 'top left',
      width: `${sourceElement.offsetWidth}px`,
      fontSize: PDF_CONFIG.contentScaling.fontSizeAdjustment[deviceType]
    });

    // Add responsive classes for PDF export
    PDF_CONFIG.contentScaling.responsiveClasses.forEach(className => {
      cloned.classList.add(className);
    });

    return { cloneWrapper, cloned };
  };

  const injectQRCode = (clonedElement) => {
    if (!qrUrl) return;
    
    const qrSlot = clonedElement.querySelector('#qr-slot');
    if (qrSlot) {
      qrSlot.innerHTML = '';
      const qrImage = new Image();
      Object.assign(qrImage, {
        src: qrUrl,
        alt: 'Access QR Code',
      });
      Object.assign(qrImage.style, {
        width: '100%',
        height: '100%',
        objectFit: 'contain',
        imageRendering: 'crisp-edges' // Better QR code rendering
      });
      qrSlot.appendChild(qrImage);
    }
  };

  const calculatePDFLayout = (canvas) => {
    const contentAspectRatio = canvas.width / canvas.height;
    const isLandscape = contentAspectRatio > 1.2; // Threshold for landscape detection
    
    const pdf = new jsPDF({
      orientation: isLandscape ? 'landscape' : 'portrait',
      unit: 'pt',
      format: PDF_CONFIG.pdf.format,
      compress: true // Enable compression for smaller file size
    });
    
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const usableWidth = pageWidth - (PDF_CONFIG.pdf.margin * 2);
    const usableHeight = pageHeight - (PDF_CONFIG.pdf.margin * 2);

    return { pdf, pageWidth, pageHeight, usableWidth, usableHeight, isLandscape };
  };

  const calculateImageDimensions = (canvas, usableWidth, usableHeight) => {
    let imageWidth = usableWidth;
    let imageHeight = (canvas.height * imageWidth) / canvas.width;
    
    // If content is taller than page, scale to fit height
    if (imageHeight > usableHeight) {
      imageHeight = usableHeight;
      imageWidth = (canvas.width * imageHeight) / canvas.height;
    }
    
    return { imageWidth, imageHeight };
  };

  const addContentToPDF = (pdf, canvas, layout, imageDimensions) => {
    const { pageWidth, pageHeight, usableHeight } = layout;
    const { imageWidth, imageHeight } = imageDimensions;
    
    // Center the content
    const x = (pageWidth - imageWidth) / 2;
    const y = (pageHeight - imageHeight) / 2;

    // Single page layout
    if (imageHeight <= usableHeight) {
      const imageData = canvas.toDataURL('image/png', PDF_CONFIG.pdf.quality);
      pdf.addImage(imageData, 'PNG', x, y, imageWidth, imageHeight, undefined, 'FAST');
      return 1; // Return page count
    }

    // Multi-page layout
    return addMultiPageContent(pdf, canvas, layout, imageDimensions, x, y);
  };

  const addMultiPageContent = (pdf, canvas, layout, imageDimensions, x, y) => {
    const { usableHeight } = layout;
    const { imageWidth } = imageDimensions;
    
    const pixelsPerPoint = canvas.width / imageWidth;
    const maxSliceHeight = Math.floor(usableHeight * pixelsPerPoint * (1 - PDF_CONFIG.pdf.pageOverlapFactor));
    
    let sourceY = 0;
    let pageCount = 0;
    
    while (sourceY < canvas.height) {
      const remainingHeight = canvas.height - sourceY;
      const currentSliceHeight = Math.min(maxSliceHeight, remainingHeight);
      
      // Create page canvas
      const pageCanvas = document.createElement('canvas');
      pageCanvas.width = canvas.width;
      pageCanvas.height = currentSliceHeight;
      
      const context = pageCanvas.getContext('2d');
      context.fillStyle = PDF_CONFIG.canvas.backgroundColor;
      context.fillRect(0, 0, pageCanvas.width, pageCanvas.height);
      
      // Draw slice
      context.drawImage(
        canvas,
        0, sourceY, canvas.width, currentSliceHeight,
        0, 0, canvas.width, currentSliceHeight
      );

      // Add to PDF
      const pageImageData = pageCanvas.toDataURL('image/png', PDF_CONFIG.pdf.quality);
      
      if (pageCount === 0) {
        pdf.addImage(pageImageData, 'PNG', x, y, imageWidth, currentSliceHeight / pixelsPerPoint);
      } else {
        pdf.addPage();
        pdf.addImage(pageImageData, 'PNG', x, y, imageWidth, currentSliceHeight / pixelsPerPoint);
      }

      sourceY += currentSliceHeight;
      pageCount++;
      
      // Safety check for excessive pages
      if (pageCount > PDF_CONFIG.pdf.maxPagesWarning) {
        console.warn(`PDF generation created ${pageCount} pages. Consider reducing content size.`);
        break;
      }
    }
    
    return pageCount;
  };

  // ============ MAIN EXECUTION ============
  
  try {
    // 1. Determine device type and optimal settings
    const deviceType = getDeviceType();
    const optimalDimensions = getOptimalDimensions(deviceType);
    const optimalScale = getOptimalScale(deviceType);
    
    // 2. Calculate scaling factors
    const originalWidth = passRef.current.offsetWidth;
    const virtualWidth = optimalDimensions.width;
    const scaleFactor = virtualWidth / originalWidth;

    // 3. Create optimized clone
    const { cloneWrapper, cloned } = createOptimizedClone(
      passRef.current, 
      virtualWidth, 
      scaleFactor, 
      deviceType
    );

    // 4. Inject QR code for clean capture
    injectQRCode(cloned);

    // 5. Add to DOM temporarily
    cloneWrapper.appendChild(cloned);
    document.body.appendChild(cloneWrapper);

    // 6. Wait for fonts and images to load
    await new Promise(resolve => setTimeout(resolve, 100));

    // 7. Capture with html2canvas
    const canvas = await html2canvas(cloned, {
      ...PDF_CONFIG.canvas,
      scale: optimalScale,
      scrollX: 0,
      scrollY: 0,
      windowWidth: virtualWidth,
      windowHeight: cloned.scrollHeight * scaleFactor,
    });

    // 8. Clean up DOM
    document.body.removeChild(cloneWrapper);

    // 9. Generate PDF
    const layout = calculatePDFLayout(canvas);
    const imageDimensions = calculateImageDimensions(
      canvas, 
      layout.usableWidth, 
      layout.usableHeight
    );
    
    const pageCount = addContentToPDF(layout.pdf, canvas, layout, imageDimensions);

    // 10. Save with responsive filename
    const timestamp = new Date().toISOString().slice(0, 10);
    const filename = `${currentRequest.requestNumber}-${currentRequest.requesterName}-${timestamp}.pdf`;
    layout.pdf.save(filename);

    // 11. Log success info
    console.log(`PDF generated successfully: ${pageCount} page(s), ${deviceType} optimized`);
    
  } catch (error) {
    console.error('PDF generation failed:', error);
    
    // Enhanced error handling
    if (error.name === 'SecurityError') {
      alert('PDF generation failed due to security restrictions. Please try again or contact support.');
    } else if (error.message.includes('canvas')) {
      alert('PDF generation failed due to canvas limitations. Try reducing content size.');
    } else {
      alert('PDF generation failed. Please try again.');
    }
    
    // Clean up on error
    const orphanedWrapper = document.querySelector('div[style*="position: fixed"][style*="left: -99999px"]');
    if (orphanedWrapper) {
      document.body.removeChild(orphanedWrapper);
    }
  }
};

  if (loadingView) {
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
        <p className="mb-6 text-gray-500">The request you're looking for doesn't exist or has been removed.</p>
        <Button variant="primary" onClick={() => navigate('/requests')}>Back to Requests</Button>
      </div>
    );
  }

  return (
    <div className="mx-auto space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex gap-4 items-center">
          <Button variant="ghost" icon={ArrowLeft} onClick={() => navigate('/requests')}>
            Back to Requests
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{currentRequest.title}</h1>
            <p className="text-gray-600">Request #{currentRequest.requestNumber}</p>
          </div>
        </div>

        <div className="flex gap-3 items-center">
          <Button variant="outline" icon={Copy} onClick={handleDuplicate}>Duplicate</Button>
          <Button variant="outline" icon={Download} onClick={() => window.print()}>Export</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Main */}
        <div className="space-y-6 lg:col-span-2">
          {/* Request Overview */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="p-6 bg-white rounded-lg border border-gray-200 shadow-sm"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold text-gray-900">Request Details</h2>
              <div className="flex gap-2 items-center">
                <StatusBadge status={currentRequest.status} size="md" />
                <PriorityBadge priority={currentRequest.priority} size="md" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6 mb-6">
              <div>
                <dt className="text-sm font-medium text-gray-500">Template</dt>
                <dd className="mt-1 text-sm text-gray-900">{currentRequest.template?.templateName || 'Unknown Template'}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Category</dt>
                <dd className="mt-1 text-sm text-gray-900">{currentRequest.template?.category || 'General'}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Created</dt>
                <dd className="mt-1 text-sm text-gray-900">{format(new Date(currentRequest.createdAt), 'MMMM dd, yyyy HH:mm')}</dd>
              </div>
              {currentRequest.submittedAt && (
                <div>
                  <dt className="text-sm font-medium text-gray-500">Submitted</dt>
                  <dd className="mt-1 text-sm text-gray-900">{format(new Date(currentRequest.submittedAt), 'MMMM dd, yyyy HH:mm')}</dd>
                </div>
              )}
              {currentRequest.dueDate && (
                <div>
                  <dt className="text-sm font-medium text-gray-500">Due Date</dt>
                  <dd className="mt-1 text-sm text-gray-900">{format(new Date(currentRequest.dueDate), 'MMMM dd, yyyy')}</dd>
                </div>
              )}
              {currentRequest.completedAt && (
                <div>
                  <dt className="text-sm font-medium text-gray-500">Completed</dt>
                  <dd className="mt-1 text-sm text-gray-900">{format(new Date(currentRequest.completedAt), 'MMMM dd, yyyy HH:mm')}</dd>
                </div>
              )}
            </div>

            {/* Form Data */}
            <div>
              <h3 className="mb-4 font-medium text-gray-900 text-md">Form Data</h3>
              {renderFormData()}
            </div>

            {(currentRequest.rejectionReason || currentRequest.cancellationReason) && (
              <div className="p-4 mt-6 bg-red-50 rounded-lg border border-red-200">
                <h4 className="mb-2 text-sm font-medium text-red-800">
                  {currentRequest.rejectionReason ? 'Rejection Reason' : 'Cancellation Reason'}
                </h4>
                <p className="text-sm text-red-700">
                  {currentRequest.rejectionReason || currentRequest.cancellationReason}
                </p>
              </div>
            )}
          </motion.div>

          {/* Approvals */}
          <ApprovalsCard request={currentRequest} />

          {/* Actions - Draft only */}
          {currentRequest.status === REQUEST_STATUS.DRAFT && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="p-6 bg-white rounded-lg border border-gray-200 shadow-sm"
            >
              <h3 className="mb-4 text-lg font-semibold text-gray-900">Actions</h3>
              <div className="flex flex-wrap gap-3">
                {canEdit && <Button variant="primary" icon={Edit} onClick={handleEdit}>Edit Request</Button>}
                <Button variant="secondary" icon={Send} onClick={handleSubmit}>Submit for Approval</Button>
                {canCancel && (
                  <Button variant="outline" icon={X} onClick={handleCancel} className="text-red-600 border-red-300 hover:bg-red-50">
                    Cancel Request
                  </Button>
                )}
              </div>
            </motion.div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Request Info */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="p-6 bg-white rounded-lg border border-gray-200 shadow-sm"
          >
            <h3 className="mb-4 text-lg font-semibold text-gray-900">Request Information</h3>
            <div className="space-y-4">
              <div className="flex gap-3 items-center">
                {getStatusIcon(currentRequest.status)}
                <div>
                  <p className="text-sm font-medium text-gray-900">Status</p>
                  <p className="text-sm text-gray-600">{STATUS_CONFIG[currentRequest.status]?.label}</p>
                </div>
              </div>
              <div className="flex gap-3 items-center">
                <User className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Requester</p>
                  <p className="text-sm text-gray-600">{currentRequest.requesterName}</p>
                </div>
              </div>
              {currentRequest.assignedToName && (
                <div className="flex gap-3 items-center">
                  <User className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Assigned To</p>
                    <p className="text-sm text-gray-600">{currentRequest.assignedToName}</p>
                  </div>
                </div>
              )}
              <div className="flex gap-3 items-center">
                <Calendar className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Created</p>
                  <p className="text-sm text-gray-600">{format(new Date(currentRequest.createdAt), 'MMM dd, yyyy')}</p>
                </div>
              </div>
              {currentRequest.dueDate && (
                <div className="flex gap-3 items-center">
                  <Clock className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Due Date</p>
                    <p className="text-sm text-gray-600">{format(new Date(currentRequest.dueDate), 'MMM dd, yyyy')}</p>
                  </div>
                </div>
              )}
            </div>
          </motion.div>

          {/* Access Pass trigger — only when APPROVED */}
          {currentRequest.status === REQUEST_STATUS.APPROVED && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.25 }}
              className="p-6 bg-white rounded-lg border border-gray-200 shadow-sm"
            >
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-lg font-semibold text-gray-900">Access Pass</h3>
                <QrCode className="w-6 h-6 text-africell-primary" />
              </div>

              <p className="text-sm text-gray-600">
                Your request is approved. Click below to view, download the QR, or export the pass as PDF.
              </p>

              <Button
                variant="primary"
                className="mt-4 w-full"
                icon={QrCode}
                onClick={() => setShowAccessModal(true)}
              >
                Click to get the Access Pass
              </Button>
            </motion.div>
          )}
        </div>
      </div>

      {/* Access Pass Modal */}
      {showAccessModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex fixed inset-0 z-50 justify-center items-center p-4 bg-black/50"
        >
          <motion.div
            initial={{ scale: 0.98, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="overflow-hidden w-full max-w-6xl bg-white rounded-xl shadow-xl"
          >
            {/* Modal Header */}
            <div className="flex justify-between items-center px-6 py-4 border-b">
              <div className="flex gap-3 items-center">
                <QrCode className="w-5 h-5 text-africell-primary" />
                <h3 className="text-lg font-semibold text-gray-900">
                  Access Pass • {currentRequest.requestNumber}
                </h3>
              </div>
              <button
                onClick={() => setShowAccessModal(false)}
                className="p-2 text-gray-500 rounded-md hover:text-gray-700 hover:bg-gray-100"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="grid grid-cols-1 gap-6 p-6 lg:grid-cols-3">
              {/* Left: QR + Actions */}
              <div className="lg:col-span-1">
                <div className="rounded-lg border bg-gray-50 p-4 flex items-center justify-center min-h-[12rem]">
                  {qrLoading && <div className="text-sm text-gray-500">Generating QR…</div>}
                  {!qrLoading && qrUrl && (
                    <img src={qrUrl} alt="Access QR" className="object-contain w-44 h-44" />
                  )}
                </div>

                <div className="mt-4 space-y-2">
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={handleDownloadQR}
                    disabled={!qrUrl}
                  >
                    Download QR
                  </Button>
                  <Button
                    variant="primary"
                    className="w-full"
                    onClick={handleDownloadPDF}
                    disabled={!qrUrl}
                  >
                    Download Access Pass (PDF)
                  </Button>
                </div>

                <p className="mt-3 text-xs text-gray-500">
                  Present this QR at checkpoints. The PDF includes request details and signed approvals.
                </p>
              </div>

              {/* Right: Full Access Pass Preview (for PDF capture) */}
              <div className="lg:col-span-2">
                <div ref={passRef}>
                  <AccessPassCard request={currentRequest} />
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Confirm Dialog */}
      <ConfirmDialog
        isOpen={confirmDialog.show}
        title={confirmDialog.title}
        message={confirmDialog.message}
        confirmText={confirmDialog.confirmText}
        onConfirm={handleConfirmAction}
        onCancel={() => setConfirmDialog({ show: false, type: '' })}
        variant="danger"
      />
    </div>
  );
};

export default RequestDetail;
