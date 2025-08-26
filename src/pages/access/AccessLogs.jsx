import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { ShieldCheck, Search, Filter, RefreshCw, CheckCircle, XCircle, Download } from 'lucide-react';
import Button from '../../components/common/Button';
import {
  getAccessLogs,
  setAccessLogs,
  ACCESS_ACTION,
  ACCESS_METHOD,
} from '../../data/demoData';

const ActionBadge = ({ action }) => {
  const isAdmit = action === ACCESS_ACTION.ADMIT;
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
        isAdmit ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
      }`}
    >
      {isAdmit ? (
        <CheckCircle className="w-3 h-3 flex-shrink-0" />
      ) : (
        <XCircle className="w-3 h-3 flex-shrink-0" />
      )}
      <span className="hidden xs:inline">{isAdmit ? 'Admit' : 'Deny'}</span>
    </span>
  );
};

const MethodChip = ({ method }) => {
  const label = method === ACCESS_METHOD.SCAN ? 'Scan' : 'Manual';
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded bg-gray-100 text-gray-700 text-xs">
      {label}
    </span>
  );
};

const exportCSV = (rows) => {
  const header = [
    'id','timestamp','requestNumber','requestId','requesterName','facility','gate','action','method','guardName','reason','valid'
  ];
  const csv = [
    header.join(','),
    ...rows.map(r => [
      r.id,
      r.ts,
      r.requestNumber,
      r.requestId,
      `"${(r.requesterName||'').replace(/"/g,'""')}"`,
      r.facility,
      `"${(r.gate||'').replace(/"/g,'""')}"`,
      r.action,
      r.method,
      `"${(r.guardName||'').replace(/"/g,'""')}"`,
      `"${(r.reason||'').replace(/"/g,'""')}"`,
      r.valid ? 'true' : 'false',
    ].join(','))
  ].join('\n');

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `access-logs-${new Date().toISOString().slice(0,10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
};

const AccessLogs = () => {
  const [all, setAll] = useState([]);
  const [q, setQ] = useState('');
  const [facility, setFacility] = useState('all');
  const [action, setAction] = useState('all');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');

  // Load (from localStorage or seed)
  useEffect(() => {
    setAll(getAccessLogs());
  }, []);

  const facilities = useMemo(() => {
    const set = new Set(all.map(r => r.facility).filter(Boolean));
    return ['all', ...Array.from(set)];
  }, [all]);

  const filtered = useMemo(() => {
    let rows = [...all].sort((a,b) => new Date(b.ts) - new Date(a.ts));

    if (q) {
      const needle = q.toLowerCase();
      rows = rows.filter(r =>
        r.requestNumber?.toLowerCase().includes(needle) ||
        r.requesterName?.toLowerCase().includes(needle) ||
        r.gate?.toLowerCase().includes(needle) ||
        r.guardName?.toLowerCase().includes(needle)
      );
    }
    if (facility !== 'all') {
      rows = rows.filter(r => r.facility === facility);
    }
    if (action !== 'all') {
      rows = rows.filter(r => r.action === action);
    }
    if (from) {
      const f = new Date(from);
      rows = rows.filter(r => new Date(r.ts) >= f);
    }
    if (to) {
      const t = new Date(to);
      rows = rows.filter(r => new Date(r.ts) <= t);
    }
    return rows;
  }, [all, q, facility, action, from, to]);

  const resetFilters = () => {
    setQ(''); setFacility('all'); setAction('all'); setFrom(''); setTo('');
  };

  const clearAll = () => {
    setAll([]); setAccessLogs([]); // clear localStorage
  };

  return (
    <div className="max-w-6xl mx-auto p-3 sm:p-4 md:p-6 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <ShieldCheck className="w-5 h-5 sm:w-6 sm:h-6 text-africell-primary" />
          <h1 className="text-lg sm:text-xl font-semibold text-gray-900">Access Logs</h1>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" className="text-xs sm:text-sm" icon={Download} onClick={() => exportCSV(filtered)}>
            <span className="hidden sm:inline">Export CSV</span>
            <span className="sm:hidden">CSV</span>
          </Button>
          <Button variant="outline" size="sm" className="text-xs sm:text-sm" icon={RefreshCw} onClick={() => { setAll(getAccessLogs()); }}>
            Refresh
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="rounded-xl border bg-white p-3 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
          <div className="md:col-span-2">
            <label className="text-xs text-gray-500 mb-1 block">Search</label>
            <div className="flex items-center gap-2 border rounded-lg px-2">
              <Search className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <input
                value={q}
                onChange={e => setQ(e.target.value)}
                placeholder="Search requests, people, gates..."
                className="w-full py-2 text-sm outline-none"
              />
            </div>
          </div>

          <div>
            <label className="text-xs text-gray-500 mb-1 block">Facility</label>
            <select 
              value={facility} 
              onChange={e=>setFacility(e.target.value)} 
              className="w-full border rounded-lg px-2 py-2 text-sm"
            >
              {facilities.map(f => (
                <option key={f} value={f}>
                  {f === 'all' ? 'All Facilities' : f}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs text-gray-500 mb-1 block">Action</label>
            <select 
              value={action} 
              onChange={e=>setAction(e.target.value)} 
              className="w-full border rounded-lg px-2 py-2 text-sm"
            >
              <option value="all">All Actions</option>
              <option value={ACCESS_ACTION.ADMIT}>Admit</option>
              <option value={ACCESS_ACTION.DENY}>Deny</option>
            </select>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <label className="text-xs text-gray-500 mb-1 block">Date Range</label>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <input 
                    type="date" 
                    value={from} 
                    onChange={e=>setFrom(e.target.value)} 
                    className="w-full border rounded-lg px-2 py-2 text-sm"
                    placeholder="From"
                  />
                </div>
                <div>
                  <input 
                    type="date" 
                    value={to} 
                    onChange={e=>setTo(e.target.value)} 
                    className="w-full border rounded-lg px-2 py-2 text-sm"
                    placeholder="To"
                  />
                </div>
              </div>
            </div>
            <div className="flex items-end gap-2">
              <Button variant="outline" size="sm" icon={Filter} onClick={resetFilters}>
                <span className="sr-only sm:not-sr-only">Reset</span>
              </Button>
              <Button variant="outline" size="sm" onClick={clearAll}>
                <span className="sr-only sm:not-sr-only">Clear All</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="text-left px-3 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                <th className="text-left px-3 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider">Request</th>
                <th className="text-left px-3 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">Requester</th>
                <th className="text-left px-3 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">Facility</th>
                <th className="text-left px-3 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider hidden xl:table-cell">Gate</th>
                <th className="text-left px-3 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                <th className="text-left px-3 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">Method</th>
                <th className="text-left px-3 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider hidden xl:table-cell">Guard</th>
                <th className="text-left px-3 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider hidden 2xl:table-cell">Reason</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filtered.length === 0 && (
                <tr>
                  <td colSpan="9" className="px-4 py-6 text-center text-gray-500 text-sm">
                    No access logs match your filters.
                  </td>
                </tr>
              )}
              {filtered.map(row => (
                <tr key={row.id} className="hover:bg-gray-50">
                  <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-900">
                    <div className="flex flex-col">
                      <span className="font-medium">{format(new Date(row.ts), 'MMM dd')}</span>
                      <span className="text-gray-500 text-xs">{format(new Date(row.ts), 'HH:mm')}</span>
                    </div>
                  </td>
                  <td className="px-3 py-3 whitespace-nowrap">
                    <Link 
                      to={`/requests/${row.requestId}`} 
                      className="text-africell-primary hover:underline font-medium text-sm inline-flex items-center"
                    >
                      {row.requestNumber}
                    </Link>
                    <div className="text-gray-500 text-xs sm:hidden">{row.requesterName}</div>
                  </td>
                  <td className="px-3 py-3 text-sm text-gray-900 hidden sm:table-cell">
                    {row.requesterName}
                  </td>
                  <td className="px-3 py-3 text-sm text-gray-900 hidden lg:table-cell">
                    <span className="font-mono text-xs">{row.facility}</span>
                  </td>
                  <td className="px-3 py-3 text-sm text-gray-900 hidden xl:table-cell">
                    {row.gate || '—'}
                  </td>
                  <td className="px-3 py-3 whitespace-nowrap">
                    <ActionBadge action={row.action} />
                  </td>
                  <td className="px-3 py-3 whitespace-nowrap hidden md:table-cell">
                    <MethodChip method={row.method} />
                  </td>
                  <td className="px-3 py-3 text-sm text-gray-900 hidden xl:table-cell">
                    {row.guardName || '—'}
                  </td>
                  <td className="px-3 py-3 text-sm text-gray-900 hidden 2xl:table-cell truncate max-w-xs">
                    {row.reason || '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

export default AccessLogs;
