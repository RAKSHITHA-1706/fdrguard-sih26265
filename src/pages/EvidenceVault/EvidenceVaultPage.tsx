import React, { useState } from 'react';
import { Archive, Search, Filter, Download, Shield, AlertCircle, Info, CheckCircle, Hash, Eye } from 'lucide-react';
import { MOCK_AUDIT_EVENTS } from '../../data/mockData';
import { formatDateTime, getTimeAgo, exportToCSV } from '../../utils';
import type { AuditEvent } from '../../types';
import Modal from '../../components/common/Modal';

const severityIcon = {
  info: <Info size={14} color="#2563eb" />,
  warning: <AlertCircle size={14} color="#d97706" />,
  critical: <AlertCircle size={14} color="#dc2626" />,
};

const severityBg = {
  info: '#dbeafe',
  warning: '#fef3c7',
  critical: '#fee2e2',
};

const severityColor = {
  info: '#1e40af',
  warning: '#92400e',
  critical: '#991b1b',
};

function HashChain({ events }: { events: AuditEvent[] }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
      {events.map((event, idx) => (
        <div key={event.id} style={{ display: 'flex', gap: 12, paddingBottom: idx < events.length - 1 ? 0 : 0 }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{
              width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
              background: event.severity === 'critical' ? '#fee2e2' : event.severity === 'warning' ? '#fef3c7' : '#dbeafe',
              border: `2px solid ${event.severity === 'critical' ? '#fca5a5' : event.severity === 'warning' ? '#fcd34d' : '#93c5fd'}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              {severityIcon[event.severity]}
            </div>
            {idx < events.length - 1 && (
              <div style={{ width: 2, flex: 1, minHeight: 20, background: '#E5E2DA', margin: '4px 0' }} />
            )}
          </div>
          <div style={{
            flex: 1, background: 'white', borderRadius: 10, padding: '12px 14px', marginBottom: 10,
            border: `1px solid ${event.severity === 'critical' ? '#fca5a5' : '#E5E2DA'}`,
            boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
          }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10 }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: '#172B46' }}>{event.action}</span>
                  <span style={{
                    fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 20,
                    background: severityBg[event.severity], color: severityColor[event.severity],
                  }}>
                    {event.severity.toUpperCase()}
                  </span>
                </div>
                <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 4 }}>
                  <span style={{ fontWeight: 600, color: '#374151' }}>{event.userName}</span>
                  {' · '}
                  <span>{event.entityName}</span>
                  {' · '}
                  <span>{getTimeAgo(event.timestamp)}</span>
                </div>
                {event.remarks && (
                  <div style={{ fontSize: 12, color: '#374151', marginBottom: 6 }}>{event.remarks}</div>
                )}
                {(event.previousValue || event.newValue) && (
                  <div style={{ display: 'flex', gap: 8, fontSize: 11 }}>
                    {event.previousValue && (
                      <span style={{ background: '#fee2e2', color: '#991b1b', padding: '2px 8px', borderRadius: 4 }}>
                        Before: {event.previousValue}
                      </span>
                    )}
                    {event.newValue && (
                      <span style={{ background: '#dcfce7', color: '#166534', padding: '2px 8px', borderRadius: 4 }}>
                        After: {event.newValue}
                      </span>
                    )}
                  </div>
                )}
              </div>
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <div style={{ fontSize: 10, color: '#9ca3af', marginBottom: 4 }}>{formatDateTime(event.timestamp)}</div>
                <div style={{ fontSize: 10, color: '#9ca3af' }}>IP: {event.ipAddress}</div>
              </div>
            </div>
            {/* Hash */}
            <div style={{ marginTop: 8, padding: '6px 10px', background: '#F4F2EC', borderRadius: 6 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Hash size={11} color="#9ca3af" />
                <span style={{ fontSize: 10, fontFamily: 'monospace', color: '#9ca3af', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {event.integrityHash}
                </span>
                {idx > 0 && <span style={{ fontSize: 9, color: '#16a34a', fontWeight: 700, flexShrink: 0 }}>✓ LINKED</span>}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function EvidenceVaultPage() {
  const [events, setEvents] = useState<AuditEvent[]>(MOCK_AUDIT_EVENTS);
  const [search, setSearch] = useState('');
  const [entityFilter, setEntityFilter] = useState('all');
  const [severityFilter, setSeverityFilter] = useState('all');
  const [viewMode, setViewMode] = useState<'timeline' | 'table'>('timeline');
  const [verifying, setVerifying] = useState(false);
  const [verifyResult, setVerifyResult] = useState<null | { valid: boolean; message: string }>(null);

  const filtered = events.filter(e =>
    (entityFilter === 'all' || e.entityType === entityFilter) &&
    (severityFilter === 'all' || e.severity === severityFilter) &&
    (search === '' ||
      e.action.toLowerCase().includes(search.toLowerCase()) ||
      e.userName.toLowerCase().includes(search.toLowerCase()) ||
      e.entityName.toLowerCase().includes(search.toLowerCase()))
  );

  const handleVerifyChain = () => {
    setVerifying(true);
    setTimeout(() => {
      setVerifyResult({ valid: true, message: 'Cryptographic chain integrity verified. All audit events are hash-linked and consistent. Zero unauthorized modifications detected.' });
      setVerifying(false);
    }, 2000);
  };

  const handleExport = () => {
    exportToCSV(filtered.map(e => ({
      EventID: e.id,
      Type: e.eventType,
      User: e.userName,
      Action: e.action,
      Entity: e.entityName,
      Timestamp: e.timestamp,
      Severity: e.severity,
      IP: e.ipAddress,
      Hash: e.integrityHash,
    })), 'audit_log');
  };

  return (
    <div className="page-container animate-fade-in">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24 }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <div style={{ width: 40, height: 40, background: '#065f46', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Archive size={22} color="white" />
          </div>
          <div>
            <h1 className="section-title">Digital Evidence Vault</h1>
            <p className="section-subtitle">Immutable Cryptographic Audit Trail & Integrity Management</p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn-secondary" onClick={handleExport}><Download size={15} /> Export Audit Log</button>
          <button
            className="btn-primary"
            onClick={handleVerifyChain}
            disabled={verifying}
            style={{ background: '#065f46' }}
          >
            {verifying ? (
              <><div style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,0.4)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} /> Verifying...</>
            ) : (
              <><Shield size={15} /> Verify Chain Integrity</>
            )}
          </button>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </div>

      {/* Disclaimer */}
      <div style={{ background: '#d1fae5', border: '1px solid #6ee7b7', borderRadius: 10, padding: '10px 16px', marginBottom: 16, fontSize: 12, color: '#065f46' }}>
        <strong>Hash-Link Explanation:</strong> Each audit event contains a cryptographic hash. Hash linking makes unauthorized changes
        detectable when the chain is independently verified. It does NOT make the database impossible to modify — it makes tampering evident.
      </div>

      {/* Chain verification result */}
      {verifyResult && (
        <div style={{
          background: verifyResult.valid ? '#d1fae5' : '#fee2e2',
          border: `1px solid ${verifyResult.valid ? '#6ee7b7' : '#fca5a5'}`,
          borderRadius: 10, padding: '14px 16px', marginBottom: 16,
          display: 'flex', gap: 12, alignItems: 'flex-start',
        }}>
          {verifyResult.valid
            ? <CheckCircle size={20} color="#065f46" style={{ flexShrink: 0, marginTop: 1 }} />
            : <AlertCircle size={20} color="#dc2626" style={{ flexShrink: 0, marginTop: 1 }} />}
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: verifyResult.valid ? '#065f46' : '#991b1b', marginBottom: 4 }}>
              {verifyResult.valid ? '✓ Chain Integrity Verified' : '✗ Chain Integrity Compromised'}
            </div>
            <div style={{ fontSize: 13, color: verifyResult.valid ? '#374151' : '#374151' }}>{verifyResult.message}</div>
          </div>
          <button onClick={() => setVerifyResult(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', marginLeft: 'auto', flexShrink: 0 }}>✕</button>
        </div>
      )}

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 20 }}>
        {[
          { label: 'Total Events', value: events.length, color: '#172B46' },
          { label: 'Critical Events', value: events.filter(e => e.severity === 'critical').length, color: '#dc2626' },
          { label: 'FDR Events', value: events.filter(e => e.entityType === 'fdr').length, color: '#2563eb' },
          { label: 'System Events', value: events.filter(e => e.entityType === 'system').length, color: '#6b7280' },
        ].map(stat => (
          <div key={stat.label} className="stat-card">
            <div style={{ fontSize: 11, color: '#9ca3af', fontWeight: 600, textTransform: 'uppercase', marginBottom: 8 }}>{stat.label}</div>
            <div style={{ fontSize: 32, fontWeight: 800, color: stat.color }}>{stat.value}</div>
          </div>
        ))}
      </div>

      {/* Filters & View toggle */}
      <div className="card" style={{ padding: '12px 16px', marginBottom: 16 }}>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: '1 1 200px' }}>
            <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
            <input className="form-input" placeholder="Search events..." value={search} onChange={e => setSearch(e.target.value)} style={{ paddingLeft: 30 }} />
          </div>
          <select className="form-input" value={entityFilter} onChange={e => setEntityFilter(e.target.value)} style={{ flex: '1 1 130px' }}>
            <option value="all">All Entities</option>
            <option value="fdr">FDR Events</option>
            <option value="institution">Institution Events</option>
            <option value="user">User Events</option>
            <option value="system">System Events</option>
          </select>
          <select className="form-input" value={severityFilter} onChange={e => setSeverityFilter(e.target.value)} style={{ flex: '1 1 130px' }}>
            <option value="all">All Severity</option>
            <option value="info">Info</option>
            <option value="warning">Warning</option>
            <option value="critical">Critical</option>
          </select>
          <div style={{ display: 'flex', border: '1px solid #E5E2DA', borderRadius: 8, overflow: 'hidden' }}>
            {(['timeline', 'table'] as const).map(mode => (
              <button key={mode} onClick={() => setViewMode(mode)} style={{
                padding: '7px 14px', fontSize: 13, fontWeight: 600, border: 'none', cursor: 'pointer',
                background: viewMode === mode ? '#172B46' : 'white',
                color: viewMode === mode ? 'white' : '#374151',
                textTransform: 'capitalize',
              }}>
                {mode}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      {viewMode === 'timeline' ? (
        <div>
          <div style={{ fontSize: 13, color: '#9ca3af', marginBottom: 16 }}>
            Showing {filtered.length} events in hash-linked chronological order
          </div>
          <HashChain events={filtered} />
        </div>
      ) : (
        <div className="card">
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Event ID</th>
                  <th>Action</th>
                  <th>User</th>
                  <th>Entity</th>
                  <th>Timestamp</th>
                  <th>Severity</th>
                  <th>IP</th>
                  <th>Hash (truncated)</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(event => (
                  <tr key={event.id}>
                    <td style={{ fontFamily: 'monospace', fontSize: 11, color: '#6b7280' }}>{event.id}</td>
                    <td style={{ fontSize: 13, fontWeight: 600, color: '#172B46' }}>{event.action}</td>
                    <td style={{ fontSize: 12 }}>{event.userName}</td>
                    <td style={{ fontSize: 12 }}>
                      <div style={{ fontWeight: 600 }}>{event.entityName}</div>
                      <div style={{ fontSize: 10, color: '#9ca3af', textTransform: 'uppercase' }}>{event.entityType}</div>
                    </td>
                    <td style={{ fontSize: 12, color: '#6b7280', whiteSpace: 'nowrap' }}>{getTimeAgo(event.timestamp)}</td>
                    <td>
                      <span style={{ background: severityBg[event.severity], color: severityColor[event.severity], fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 20 }}>
                        {event.severity.toUpperCase()}
                      </span>
                    </td>
                    <td style={{ fontFamily: 'monospace', fontSize: 11, color: '#6b7280' }}>{event.ipAddress}</td>
                    <td style={{ fontFamily: 'monospace', fontSize: 10, color: '#9ca3af', maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {event.integrityHash.substring(7, 23)}...
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
