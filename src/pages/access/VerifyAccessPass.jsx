import React, { useEffect, useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { format } from 'date-fns';
import {
  CheckCircle, XCircle, QrCode, Calendar, MapPin, User, ShieldCheck, FileSignature, ArrowLeft
} from 'lucide-react';
import Button from '../../components/common/Button';

// Pull straight from your demo data
import {
  demoRequests,
  demoFormTemplates,
  demoApprovalChains,
  REQUEST_STATUS,
  // ⬇️ NEW: logging helpers/constants
  recordAccessLog,
  ACCESS_ACTION,
  ACCESS_METHOD,
} from '../../data/demoData';

/** --- Signature helpers (same idea as in RequestDetail) --- */
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

const getSignatureSrc = (row, name) => {
  const explicit =
    row?.signatureDataUrl ||
    row?.signatureUrl ||
    row?.signature ||
    null;
  if (explicit) return explicit;
  if (row?.status === 'approved') return makeSignatureDataUrl(name || 'Approved');
  return null;
};
/** -------------------------------------------------------- */

const VerifyAccessPass = ({ expectedFacility = null }) => {
  const { number } = useParams(); // e.g. REQ-00002
  const [loading, setLoading] = useState(true);
  const [request, setRequest] = useState(null);

  // NEW: guard metadata + feedback
  const [gate, setGate] = useState('Main Gate');
  const [guardName, setGuardName] = useState('');
  const [justLogged, setJustLogged] = useState(null); // 'admit' | 'deny' | null

  // Find the request by requestNumber in demo data
  useEffect(() => {
    const r = demoRequests.find(rq => rq.requestNumber === number);
    if (!r) {
      setRequest(null);
      setLoading(false);
      return;
    }
    // Attach the template to mimic your RequestDetail shape
    const tpl = demoFormTemplates.find(t => t.id === r.templateId);
    setRequest({ ...r, template: tpl || null });
    setLoading(false);
  }, [number]);

  // Grab this request's recorded approval actions
  const actions = useMemo(
    () => (request ? demoApprovalChains.filter(a => a.requestId === request.id) : []),
    [request]
  );
  const byOrder = (order) => actions.find(a => a.approvalOrder === order) || {};

  // Core validation (mirrors scanner rules)
  const verdict = useMemo(() => {
    if (!request) return { ok: false, reasons: ['Request not found.'] };

    const reasons = [];
    let ok = true;

    // Must be approved to be valid at gate
    if (request.status !== REQUEST_STATUS.APPROVED) {
      ok = false;
      reasons.push(`Request is not approved (status: ${request.status}).`);
    }

    const a = request.formData || {};
    const now = new Date();
    const start = a.startDate ? new Date(a.startDate) : null;
    const end = a.endDate ? new Date(a.endDate) : null;

    if (start && start > now) {
      ok = false;
      reasons.push('Pass not active yet.');
    }
    if (end && end < now) {
      ok = false;
      reasons.push('Pass has expired.');
    }

    if (expectedFacility && a.facilityAccess && a.facilityAccess !== expectedFacility) {
      ok = false;
      reasons.push('Facility mismatch for this checkpoint.');
    }

    return { ok, reasons };
  }, [request, expectedFacility]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="animate-pulse text-gray-400">Loading…</div>
      </div>
    );
  }

  if (!request) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="rounded-xl border bg-white p-6">
          <div className="flex items-center gap-3 mb-2">
            <XCircle className="w-6 h-6 text-red-500" />
            <h1 className="text-lg font-semibold text-gray-900">Pass not found</h1>
          </div>
          <p className="text-sm text-gray-600">No request with number <span className="font-mono">{number}</span> exists in demo data.</p>
          <div className="mt-4">
            <Link to="/requests">
              <Button variant="outline" icon={ArrowLeft}>Back to Requests</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const a = request.formData || {};
  const approvers = request.template?.approvers?.approvers || [];

  const validityText =
    a.duration === 'temporary' && a.endDate
      ? `Valid until ${format(new Date(a.endDate), 'MMM dd, yyyy')}`
      : 'Valid (per company policy)';

  // --- NEW: log helpers (Admit/Deny) ---
  const handleLogAdmit = () => {
    recordAccessLog({
      requestId: request.id,
      requestNumber: request.requestNumber,
      requesterName: request.requesterName,
      facility: a.facilityAccess || expectedFacility || 'unknown',
      gate: gate || undefined,
      action: ACCESS_ACTION.ADMIT,
      method: ACCESS_METHOD.MANUAL, // or SCAN if you prefer
      guardName: guardName || undefined,
      reason: 'Valid pass (verified page)',
      valid: true,
    });
    setJustLogged('admit');
  };

  const handleLogDeny = () => {
    const reason = verdict.reasons?.length ? verdict.reasons.join('; ') : 'Invalid pass';
    recordAccessLog({
      requestId: request.id,
      requestNumber: request.requestNumber,
      requesterName: request.requesterName,
      facility: a.facilityAccess || expectedFacility || 'unknown',
      gate: gate || undefined,
      action: ACCESS_ACTION.DENY,
      method: ACCESS_METHOD.MANUAL,
      guardName: guardName || undefined,
      reason,
      valid: false,
    });
    setJustLogged('deny');
  };
  // -------------------------------------

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <QrCode className="w-6 h-6 text-africell-primary" />
          <h1 className="text-xl font-semibold text-gray-900">Verify Access Pass</h1>
        </div>
        <Link to="/requests">
          <Button variant="ghost" icon={ArrowLeft}>Back</Button>
        </Link>
      </div>

      <div className="rounded-xl border bg-white p-4 sm:p-6 shadow-sm">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-sm text-gray-500">Request</div>
            <div className="text-lg font-semibold text-gray-900">{request.title}</div>
            <div className="text-sm text-gray-600">#{request.requestNumber}</div>
          </div>

          {verdict.ok ? (
            <span className="inline-flex items-center gap-2 rounded-full bg-green-100 px-3 py-1.5 text-sm font-medium text-green-800">
              <CheckCircle className="w-4 h-4" /> Valid Pass
            </span>
          ) : (
            <span className="inline-flex items-center gap-2 rounded-full bg-red-100 px-3 py-1.5 text-sm font-medium text-red-800">
              <XCircle className="w-4 h-4" /> Invalid Pass
            </span>
          )}
        </div>

        {/* Guard/Gate metadata */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
          <div>
            <label className="block text-xs text-gray-500 mb-1">Gate (optional)</label>
            <input
              value={gate}
              onChange={e => setGate(e.target.value)}
              placeholder="e.g., Server Room North Gate"
              className="w-full border rounded-lg px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Guard name (optional)</label>
            <input
              value={guardName}
              onChange={e => setGuardName(e.target.value)}
              placeholder="e.g., Guard Alpha"
              className="w-full border rounded-lg px-3 py-2"
            />
          </div>
        </div>

        {/* Body */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
          {/* Badge / Meta */}
          <div className="md:col-span-1">
            <div className="rounded-xl border bg-gray-50 p-4">
              <div className="flex items-center gap-2 text-gray-900">
                <ShieldCheck className="w-5 h-5 text-africell-primary" />
                <span className="font-medium">Access Window</span>
              </div>
              <div className="mt-3 text-sm text-gray-800">
                <div className="inline-flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  <span>
                    {a.startDate ? format(new Date(a.startDate), 'MMM dd, yyyy') : '—'} →{' '}
                    {a.endDate ? format(new Date(a.endDate), 'MMM dd, yyyy') : 'No end (policy)'}
                  </span>
                </div>
                <div className="mt-1 text-xs text-gray-500">{validityText}</div>
              </div>

              {a.facilityAccess && (
                <div className="mt-4 text-sm text-gray-800">
                  <div className="inline-flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-gray-500" />
                    <span>Facility: <span className="font-medium">{a.facilityAccess}</span></span>
                  </div>
                  {expectedFacility && (
                    <div className="mt-1 text-xs text-blue-700 bg-blue-50 inline-flex rounded px-2 py-1">
                      Checkpoint expects: {expectedFacility}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="mt-4 rounded-xl border bg-gray-50 p-4">
              <div className="text-xs text-gray-500">Requester</div>
              <div className="mt-1 inline-flex items-center gap-2">
                <User className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-900">{request.requesterName}</span>
              </div>
              <div className="text-xs text-gray-600 break-words">{request.requesterEmail}</div>

              <div className="mt-3 text-xs text-gray-500">Access Details</div>
              <div className="text-sm text-gray-900 space-y-1">
                {a.accessType && <div>Type: {a.accessType}</div>}
                {a.accessLevel && <div>Level: {a.accessLevel}</div>}
                {Array.isArray(a.systemAccess) && a.systemAccess.length > 0 && (
                  <div>Systems: {a.systemAccess.join(', ')}</div>
                )}
              </div>
            </div>
          </div>

          {/* Approvals & signatures */}
          <div className="md:col-span-2">
            <div className="text-sm font-medium text-gray-900 mb-2">Approvals & Signatures</div>
            <div className="grid sm:grid-cols-2 gap-3">
              {approvers
                .slice()
                .sort((x, y) => (x.order || 0) - (y.order || 0))
                .map((appr) => {
                  const row = byOrder(appr.order);
                  const sig = getSignatureSrc(row, appr.userName);
                  const isApproved = row?.status === 'approved';

                  return (
                    <div key={appr.id} className="border rounded-lg p-3">
                      <div className="flex items-center justify-between">
                        <div className="font-medium text-gray-900 truncate">{appr.userName}</div>
                        <div className="text-[11px] text-gray-500">#{appr.order}</div>
                      </div>

                      {sig ? (
                        <img src={sig} alt={`${appr.userName} signature`} className="mt-1 h-10 object-contain" />
                      ) : (
                        <div className="mt-1 h-10 bg-gray-100 border border-dashed rounded text-[11px] text-gray-400 flex items-center justify-center">
                          No signature
                        </div>
                      )}

                      <div className="mt-2 text-xs text-gray-600 flex items-center gap-1">
                        <FileSignature className={`w-3.5 h-3.5 ${isApproved ? 'text-green-600' : 'text-gray-400'}`} />
                        <span>{row?.status ? row.status.toUpperCase() : 'PENDING'}</span>
                        {row?.actionDate && (
                          <span className="ml-1 text-gray-400">• {format(new Date(row.actionDate), 'MMM d, yyyy HH:mm')}</span>
                        )}
                      </div>
                    </div>
                  );
                })}
            </div>

            {!verdict.ok && verdict.reasons.length > 0 && (
              <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3">
                <div className="text-sm font-medium text-red-800 mb-1">Why invalid</div>
                <ul className="list-disc pl-5 text-sm text-red-700 space-y-0.5">
                  {verdict.reasons.map((r, i) => <li key={i}>{r}</li>)}
                </ul>
              </div>
            )}

            <div className="mt-6 flex flex-wrap gap-2">
              {verdict.ok ? (
                <Button variant="primary" onClick={handleLogAdmit}>
                  Mark Admitted & Record Log
                </Button>
              ) : (
                <Button variant="outline" onClick={handleLogDeny}>
                  Record Deny
                </Button>
              )}

              <Link to="/access-logs">
                <Button variant="outline">View Access Logs</Button>
              </Link>
            </div>

            {justLogged && (
              <div className="mt-3 text-xs text-green-700 bg-green-50 inline-block px-2 py-1 rounded">
                {justLogged === 'admit' ? 'Admit' : 'Deny'} event recorded.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyAccessPass;
