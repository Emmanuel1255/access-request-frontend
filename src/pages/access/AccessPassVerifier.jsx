import React, { useMemo, useState } from 'react';
import { format } from 'date-fns';
import { CheckCircle, XCircle, QrCode, Calendar, MapPin, User } from 'lucide-react';
import { Scanner } from '@yudiel/react-qr-scanner';
import Button from '../../components/common/Button';

// ⬇️ import the logging helpers/constants from your demo data
import {
  recordAccessLog,
  ACCESS_ACTION,
  ACCESS_METHOD,
} from '../../data/demoData';

const AccessPassVerifier = ({ expectedFacility = null }) => {
  const [scanError, setScanError] = useState(null);
  const [result, setResult] = useState(null); // { data, ok, reasons[] }
  const [gate, setGate] = useState('Main Gate');       // optional metadata
  const [guardName, setGuardName] = useState('');      // optional metadata
  const [justLogged, setJustLogged] = useState(null);  // feedback after logging

  const reset = () => {
    setScanError(null);
    setResult(null);
    setJustLogged(null);
  };

  const validatePayload = (data) => {
    const reasons = [];
    let ok = true;

    if (!data?.number) {
      ok = false;
      reasons.push('Missing request number.');
    }

    const now = new Date();
    const start = data?.access?.start ? new Date(data.access.start) : null;
    const end = data?.access?.end ? new Date(data.access.end) : null;

    if (start && start > now) {
      ok = false;
      reasons.push('Pass not active yet.');
    }
    if (end && end < now) {
      ok = false;
      reasons.push('Pass has expired.');
    }

    if (expectedFacility && data?.access?.facility && data.access.facility !== expectedFacility) {
      ok = false;
      reasons.push('Facility mismatch for this checkpoint.');
    }

    return { ok, reasons };
  };

  const onDecode = async (text) => {
    try {
      let parsed = null;

      // Try direct JSON
      try {
        parsed = JSON.parse(text);
      } catch {
        // Fallback: URL with ?data=...
        try {
          const url = new URL(text);
          const raw = url.searchParams.get('data');
          if (raw) parsed = JSON.parse(raw);
        } catch {}
      }

      if (!parsed) throw new Error('Invalid QR payload.');

      // Optional server verify:
      // const res = await fetch(parsed.verifyPath);
      // if (!res.ok) throw new Error('Server verification failed.');
      // const serverView = await res.json();

      const { ok, reasons } = validatePayload(parsed);
      setResult({ data: parsed, ok, reasons });
      setScanError(null);
      setJustLogged(null);
    } catch (e) {
      setScanError(e.message || 'Failed to read QR code.');
      setResult(null);
      setJustLogged(null);
    }
  };

  const onError = (err) => {
    setScanError(typeof err === 'string' ? err : (err?.message || 'Camera error.'));
  };

  const summary = useMemo(() => {
    if (!result?.data) return null;
    const d = result.data;
    const a = d.access || {};
    const lines = [];

    if (a.type) lines.push(['Type', a.type]);
    if (a.facility) lines.push(['Facility', a.facility]);
    if (a.level) lines.push(['Level', a.level]);
    if (a.start) lines.push(['Start', format(new Date(a.start), 'MMM dd, yyyy')]);
    if (a.end) lines.push(['End', format(new Date(a.end), 'MMM dd, yyyy')]);

    return { d, a, lines };
  }, [result]);

  // ⬇️ convenience helpers to write logs
  const logAdmit = () => {
    if (!summary?.d) return;
    const payload = summary.d;
    recordAccessLog({
      requestId: payload.id,                           // from QR
      requestNumber: payload.number,
      requesterName: payload.requester,
      facility: payload.access?.facility || expectedFacility || 'unknown',
      gate: gate || undefined,
      action: ACCESS_ACTION.ADMIT,
      method: ACCESS_METHOD.SCAN,
      guardName: guardName || undefined,
      reason: 'Valid pass',
      valid: true,
    });
    setJustLogged('admit');
    // optionally clear to scan next:
    reset();
  };

  const logDeny = () => {
    if (!summary?.d) return;
    const payload = summary.d;
    const reason =
      result?.reasons?.length ? result.reasons.join('; ') : 'Invalid pass';
    recordAccessLog({
      requestId: payload.id,
      requestNumber: payload.number,
      requesterName: payload.requester,
      facility: payload.access?.facility || expectedFacility || 'unknown',
      gate: gate || undefined,
      action: ACCESS_ACTION.DENY,
      method: ACCESS_METHOD.SCAN,
      guardName: guardName || undefined,
      reason,
      valid: false,
    });
    setJustLogged('deny');
    // keep the screen so guard can review; or call reset() to scan next automatically
  };

  return (
    <div className="p-4 mx-auto max-w-3xl sm:p-6">
      <div className="flex gap-3 items-center mb-4">
        <QrCode className="w-6 h-6 text-africell-primary" />
        <h1 className="text-xl font-semibold text-gray-900">Access Pass Verification</h1>
      </div>

      {!result && (
        <div className="p-4 bg-white rounded-xl border shadow-sm sm:p-6">
          <p className="mb-4 text-sm text-gray-600">
            Point the camera at the visitor’s pass QR to validate their access details.
          </p>

          {/* Optional quick metadata the guard can fill before/after scan */}
          <div className="grid grid-cols-1 gap-3 mb-4 sm:grid-cols-2">
            <div>
              <label className="block mb-1 text-xs text-gray-500">Gate (optional)</label>
              <input
                value={gate}
                onChange={e => setGate(e.target.value)}
                placeholder="e.g., Server Room North Gate"
                className="px-3 py-2 w-full rounded-lg border"
              />
            </div>
            <div>
              <label className="block mb-1 text-xs text-gray-500">Guard name (optional)</label>
              <input
                value={guardName}
                onChange={e => setGuardName(e.target.value)}
                placeholder="e.g., Guard Alpha"
                className="px-3 py-2 w-full rounded-lg border"
              />
            </div>
          </div>

          <div className="overflow-hidden rounded-lg border bg-black/5">
            <Scanner
              // ✅ This lib uses onScan (array of results). We forward the first rawValue to your onDecode.
              onScan={(detected) => {
                const text = detected?.[0]?.rawValue;
                if (text) onDecode(text);
              }}
              onError={onError}
              constraints={{ facingMode: { ideal: 'environment' } }} // back camera when available
              styles={{ container: { width: '100%' }, video: { width: '100%' } }}
            />
          </div>

          {scanError && (
            <div className="mt-3 text-sm text-red-600">{scanError}</div>
          )}

          {expectedFacility && (
            <div className="inline-flex gap-2 items-center px-3 py-2 mt-3 text-sm text-blue-700 bg-blue-50 rounded-md">
              <MapPin className="w-4 h-4" />
              Verifying for facility: <span className="font-medium">{expectedFacility}</span>
            </div>
          )}
        </div>
      )}

      {result && (
        <div className="p-4 bg-white rounded-xl border shadow-sm sm:p-6">
          <div className="flex gap-3 justify-between items-start">
            <div className="space-y-1">
              <div className="text-sm text-gray-500">Request</div>
              <div className="text-lg font-semibold text-gray-900">
                {summary?.d?.title || 'Untitled'}
              </div>
              <div className="text-sm text-gray-600">
                #{summary?.d?.number}
              </div>
            </div>

            {result.ok ? (
              <span className="inline-flex items-center gap-2 rounded-full bg-green-100 px-3 py-1.5 text-sm font-medium text-green-800">
                <CheckCircle className="w-4 h-4" /> Valid Pass
              </span>
            ) : (
              <span className="inline-flex items-center gap-2 rounded-full bg-red-100 px-3 py-1.5 text-sm font-medium text-red-800">
                <XCircle className="w-4 h-4" /> Invalid Pass
              </span>
            )}
          </div>

          {/* Show/edit metadata here too */}
          <div className="grid grid-cols-1 gap-3 mt-4 sm:grid-cols-2">
            <div>
              <label className="block mb-1 text-xs text-gray-500">Gate (optional)</label>
              <input
                value={gate}
                onChange={e => setGate(e.target.value)}
                placeholder="e.g., Server Room North Gate"
                className="px-3 py-2 w-full rounded-lg border"
              />
            </div>
            <div>
              <label className="block mb-1 text-xs text-gray-500">Guard name (optional)</label>
              <input
                value={guardName}
                onChange={e => setGuardName(e.target.value)}
                placeholder="e.g., Guard Alpha"
                className="px-3 py-2 w-full rounded-lg border"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 mt-6 sm:grid-cols-2">
            <div className="space-y-2">
              <div className="text-xs text-gray-500">Requester</div>
              <div className="inline-flex gap-2 items-center">
                <User className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-900">{summary?.d?.requester || 'Unknown'}</span>
              </div>

              <div className="mt-4 text-xs text-gray-500">Access Details</div>
              <div className="space-y-1 text-sm text-gray-900">
                {summary?.lines?.map(([k, v]) => (
                  <div key={k} className="flex gap-2 items-baseline">
                    <span className="w-24 text-gray-500">{k}:</span>
                    <span className="flex-1 break-words">{v}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-xs text-gray-500">Dates</div>
              <div className="inline-flex gap-2 items-center">
                <Calendar className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-900">
                  {summary?.a?.start
                    ? format(new Date(summary.a.start), 'MMM dd, yyyy')
                    : '—'}{' '}
                  →{' '}
                  {summary?.a?.end
                    ? format(new Date(summary.a.end), 'MMM dd, yyyy')
                    : 'No end (policy)'}
                </span>
              </div>

              {expectedFacility && (
                <>
                  <div className="mt-4 text-xs text-gray-500">Checkpoint</div>
                  <div className="inline-flex gap-2 items-center">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-900">{expectedFacility}</span>
                  </div>
                </>
              )}
            </div>
          </div>

          {!result.ok && result.reasons?.length > 0 && (
            <div className="p-3 mt-6 bg-red-50 rounded-lg border border-red-200">
              <div className="mb-1 text-sm font-medium text-red-800">Why invalid</div>
              <ul className="list-disc pl-5 text-sm text-red-700 space-y-0.5">
                {result.reasons.map((r, i) => <li key={i}>{r}</li>)}
              </ul>
            </div>
          )}

          <div className="flex flex-wrap gap-2 mt-6">
            {/* ✅ Record admit/deny in the demo access logs */}
            {result.ok ? (
              <Button
                variant="primary"
                onClick={logAdmit}
              >
                Mark Admitted & Record Log
              </Button>
            ) : (
              <Button
                variant="outline"
                onClick={logDeny}
              >
                Record Deny & Keep On Screen
              </Button>
            )}

            <Button
              variant="outline"
              onClick={reset}
            >
              {result.ok ? 'Scan Next' : 'Rescan'}
            </Button>

            {summary?.d?.verifyPath && (
              <a
                href={summary.d.verifyPath}
                className="inline-flex items-center px-3 py-2 text-sm text-gray-700 rounded-md border hover:bg-gray-50"
              >
                Open Details
              </a>
            )}
          </div>

          {justLogged && (
            <div className="inline-block px-2 py-1 mt-3 text-xs text-green-700 bg-green-50 rounded">
              {justLogged === 'admit' ? 'Admit' : 'Deny'} event recorded.
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AccessPassVerifier;
