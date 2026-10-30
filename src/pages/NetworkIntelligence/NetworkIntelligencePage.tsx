import React, { useState } from 'react';
import { Network, AlertTriangle, CheckCircle, Eye, AlertCircle, Filter, Search, Info } from 'lucide-react';
import { MOCK_ANOMALIES } from '../../data/mockData';
import { useApp } from '../../context/AppContext';
import { formatDate, getTimeAgo } from '../../utils';
import type { AnomalyRecord } from '../../types';
import Modal from '../../components/common/Modal';

const severityColor = { low: '#16a34a', medium: '#d97706', high: '#ea580c', critical: '#dc2626' };
const severityBg = { low: '#dcfce7', medium: '#fef3c7', high: '#ffedd5', critical: '#fee2e2' };

function AnomalyBadge({ severity }: { severity: keyof typeof severityColor }) {
  return (
    <span style={{
      background: severityBg[severity], color: severityColor[severity],
      fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20,
    }}>
      {severity.toUpperCase()}
    </span>
  );
}

function AnomalyDetailModal({ anomaly, onClose, onStatusChange }: { anomaly: AnomalyRecord; onClose: () => void; onStatusChange: (id: string, status: AnomalyRecord['status']) => void }) {
  return (
    <Modal isOpen={true} onClose={onClose} title="Anomaly Investigation Details" maxWidth={680}
      footer={
        <div style={{ display: 'flex', gap: 8 }}>
          {anomaly.status === 'open' && (
            <button className="btn-primary" onClick={() => { onStatusChange(anomaly.id, 'investigating'); onClose(); }}>
              Start Investigation
            </button>
          )}
          {anomaly.status === 'investigating' && (
            <>
              <button className="btn-primary" style={{ background: '#16a34a' }} onClick={() => { onStatusChange(anomaly.id, 'false_positive'); onClose(); }}>
                Mark False Positive
              </button>
              <button className="btn-primary" style={{ background: '#dc2626' }} onClick={() => { onStatusChange(anomaly.id, 'resolved'); onClose(); }}>
                Mark Resolved
              </button>
            </>
          )}
          <button className="btn-secondary" onClick={onClose}>Close</button>
        </div>
      }
    >
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 16 }}>
        <div style={{ background: '#F4F2EC', borderRadius: 8, padding: '12px 14px' }}>
          <div style={{ fontSize: 11, color: '#9ca3af', fontWeight: 600, textTransform: 'uppercase', marginBottom: 4 }}>Anomaly Type</div>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#172B46' }}>{anomaly.type.replace(/_/g, ' ').toUpperCase()}</div>
        </div>
        <div style={{ background: '#F4F2EC', borderRadius: 8, padding: '12px 14px' }}>
          <div style={{ fontSize: 11, color: '#9ca3af', fontWeight: 600, textTransform: 'uppercase', marginBottom: 4 }}>Severity</div>
          <AnomalyBadge severity={anomaly.severity} />
        </div>
        <div style={{ background: '#F4F2EC', borderRadius: 8, padding: '12px 14px' }}>
          <div style={{ fontSize: 11, color: '#9ca3af', fontWeight: 600, textTransform: 'uppercase', marginBottom: 4 }}>Institution 1</div>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#172B46' }}>{anomaly.institution1Name}</div>
          <div style={{ fontSize: 11, color: '#6b7280', marginTop: 2 }}>FDR: {anomaly.fdr1Number}</div>
        </div>
        <div style={{ background: '#F4F2EC', borderRadius: 8, padding: '12px 14px' }}>
          <div style={{ fontSize: 11, color: '#9ca3af', fontWeight: 600, textTransform: 'uppercase', marginBottom: 4 }}>Institution 2</div>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#172B46' }}>{anomaly.institution2Name}</div>
          <div style={{ fontSize: 11, color: '#6b7280', marginTop: 2 }}>FDR: {anomaly.fdr2Number}</div>
        </div>
      </div>

      <div style={{ background: '#fef3c7', border: '1px solid #fcd34d', borderRadius: 10, padding: '14px 16px', marginBottom: 14 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: '#92400e', marginBottom: 6 }}>DETECTION DESCRIPTION</div>
        <p style={{ fontSize: 13, color: '#374151', margin: 0, lineHeight: 1.6 }}>{anomaly.description}</p>
      </div>

      <div style={{ background: '#dbeafe', border: '1px solid #93c5fd', borderRadius: 10, padding: '12px 16px', marginBottom: 14 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: '#1e40af', marginBottom: 6 }}>
          <Info size={13} style={{ display: 'inline', marginRight: 4 }} />
          IMPORTANT DISCLAIMER
        </div>
        <p style={{ fontSize: 12, color: '#1e3a8a', margin: 0, lineHeight: 1.6 }}>
          A detected connection is an investigation indicator only. It is NOT proof of fraud, collusion, or any wrongdoing.
          All connections must be investigated through proper channels before any conclusion is drawn.
          Use neutral labels: "Potential Match", "Needs Review", "Investigation Required".
        </p>
      </div>

      {anomaly.notes && (
        <div style={{ background: '#f0f9ff', borderRadius: 10, padding: '12px 16px' }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#0369a1', marginBottom: 6 }}>INVESTIGATION NOTES</div>
          <p style={{ fontSize: 13, color: '#374151', margin: 0 }}>{anomaly.notes}</p>
          {anomaly.investigatedBy && <div style={{ fontSize: 12, color: '#6b7280', marginTop: 6 }}>Investigated by: {anomaly.investigatedBy}</div>}
        </div>
      )}
    </Modal>
  );
}

export default function NetworkIntelligencePage() {
  const { institutions, fdrs } = useApp();
  const [anomalies, setAnomalies] = useState<AnomalyRecord[]>(MOCK_ANOMALIES);
  const [selectedAnomaly, setSelectedAnomaly] = useState<AnomalyRecord | null>(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [severityFilter, setSeverityFilter] = useState('all');
  const [search, setSearch] = useState('');

  const filtered = anomalies.filter(a =>
    (statusFilter === 'all' || a.status === statusFilter) &&
    (severityFilter === 'all' || a.severity === severityFilter) &&
    (search === '' || a.institution1Name.toLowerCase().includes(search.toLowerCase()) ||
      a.institution2Name.toLowerCase().includes(search.toLowerCase()) ||
      a.fdr1Number.toLowerCase().includes(search.toLowerCase()))
  );

  const handleStatusChange = (id: string, status: AnomalyRecord['status']) => {
    setAnomalies(prev => prev.map(a => a.id === id ? { ...a, status, investigatedBy: 'System Admin' } : a));
  };

  const typeLabel: Record<AnomalyRecord['type'], string> = {
    duplicate_fdr: 'Duplicate FDR Reference',
    duplicate_document: 'Duplicate Document Fingerprint',
    suspicious_pattern: 'Suspicious Pattern',
    repeated_bank_reference: 'Repeated Bank Reference',
  };

  const statusBadge = {
    open: <span className="badge badge-red">Open</span>,
    investigating: <span className="badge badge-amber">Investigating</span>,
    resolved: <span className="badge badge-green">Resolved</span>,
    false_positive: <span className="badge badge-grey">False Positive</span>,
  };

  return (
    <div className="page-container animate-fade-in">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24 }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <div style={{ width: 40, height: 40, background: '#172B46', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Network size={22} color="white" />
          </div>
          <div>
            <h1 className="section-title">Institution Network Intelligence</h1>
            <p className="section-subtitle">Cross-Institution Deposit Correlation & Graph Analysis</p>
          </div>
        </div>
      </div>

      {/* Disclaimer */}
      <div style={{ background: '#dbeafe', border: '1px solid #93c5fd', borderRadius: 10, padding: '10px 16px', marginBottom: 20, fontSize: 12, color: '#1e3a8a' }}>
        <strong>Important:</strong> Detected connections are investigation indicators only, not evidence of fraud or collusion.
        Labels used: "Potential Match", "Needs Review", "Investigation Required".
      </div>

      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 20 }}>
        {[
          { label: 'Total Anomalies', value: anomalies.length, color: '#172B46' },
          { label: 'Open / Active', value: anomalies.filter(a => a.status === 'open' || a.status === 'investigating').length, color: '#dc2626' },
          { label: 'Under Investigation', value: anomalies.filter(a => a.status === 'investigating').length, color: '#d97706' },
          { label: 'Resolved / FP', value: anomalies.filter(a => a.status === 'resolved' || a.status === 'false_positive').length, color: '#16a34a' },
        ].map(stat => (
          <div key={stat.label} className="stat-card">
            <div style={{ fontSize: 11, color: '#9ca3af', fontWeight: 600, textTransform: 'uppercase', marginBottom: 8 }}>{stat.label}</div>
            <div style={{ fontSize: 32, fontWeight: 800, color: stat.color }}>{stat.value}</div>
          </div>
        ))}
      </div>

      {/* Network Visualization (Simplified) */}
      <div className="card" style={{ padding: 20, marginBottom: 16 }}>
        <h3 style={{ margin: '0 0 16px', fontSize: 15, fontWeight: 700, color: '#172B46' }}>Institution Connection Map</h3>
        <div style={{ position: 'relative', height: 280, background: '#F4F2EC', borderRadius: 12, overflow: 'hidden' }}>
          <svg width="100%" height="100%" style={{ position: 'absolute', inset: 0 }}>
            {/* Connection lines */}
            <line x1="20%" y1="50%" x2="50%" y2="30%" stroke="#dc2626" strokeWidth="2" strokeDasharray="6,4" opacity="0.7" />
            <line x1="80%" y1="50%" x2="50%" y2="30%" stroke="#d97706" strokeWidth="2" strokeDasharray="6,4" opacity="0.6" />
            <line x1="35%" y1="75%" x2="20%" y2="50%" stroke="#6b7280" strokeWidth="1.5" strokeDasharray="4,4" opacity="0.4" />
            <line x1="65%" y1="75%" x2="80%" y2="50%" stroke="#6b7280" strokeWidth="1.5" strokeDasharray="4,4" opacity="0.4" />
            {/* Red connection label */}
            <text x="34%" y="37%" fontSize="10" fill="#dc2626" fontWeight="700" textAnchor="middle">NEEDS REVIEW</text>
          </svg>

          {/* Institution nodes */}
          {[
            { x: '20%', y: '50%', label: 'LPU', color: '#dc2626', size: 52 },
            { x: '50%', y: '30%', label: 'FDRGuard', color: '#172B46', size: 64, isCenter: true },
            { x: '80%', y: '50%', label: 'VIT', color: '#d97706', size: 48 },
            { x: '35%', y: '75%', label: 'Amity', color: '#6b7280', size: 44 },
            { x: '65%', y: '75%', label: 'Nirma', color: '#6b7280', size: 44 },
            { x: '15%', y: '20%', label: 'RVCE', color: '#16a34a', size: 40 },
            { x: '85%', y: '20%', label: 'BITS', color: '#16a34a', size: 40 },
          ].map(node => (
            <div key={node.label} style={{
              position: 'absolute',
              left: node.x, top: node.y,
              transform: 'translate(-50%, -50%)',
              width: node.size, height: node.size,
              borderRadius: '50%',
              background: node.color,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'white', fontSize: node.isCenter ? 11 : 10, fontWeight: 700,
              boxShadow: node.isCenter ? '0 4px 20px rgba(0,0,0,0.3)' : '0 2px 8px rgba(0,0,0,0.2)',
              cursor: 'pointer',
            }}>
              {node.label}
            </div>
          ))}

          <div style={{ position: 'absolute', bottom: 12, left: 12, display: 'flex', gap: 14, fontSize: 11 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}><div style={{ width: 12, height: 2, background: '#dc2626' }} /> Critical connection</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}><div style={{ width: 12, height: 2, background: '#d97706' }} /> Potential match</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}><div style={{ width: 12, height: 2, background: '#6b7280' }} /> Normal relation</div>
          </div>
        </div>
      </div>

      {/* Anomaly List */}
      <div className="card" style={{ padding: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: '#172B46' }}>Suspicious Relationship Registry</h3>
          <div style={{ display: 'flex', gap: 10 }}>
            <div style={{ position: 'relative' }}>
              <Search size={13} style={{ position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
              <input className="form-input" placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} style={{ paddingLeft: 26, width: 160, fontSize: 13 }} />
            </div>
            <select className="form-input" value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={{ fontSize: 13 }}>
              <option value="all">All Status</option>
              <option value="open">Open</option>
              <option value="investigating">Investigating</option>
              <option value="resolved">Resolved</option>
              <option value="false_positive">False Positive</option>
            </select>
            <select className="form-input" value={severityFilter} onChange={e => setSeverityFilter(e.target.value)} style={{ fontSize: 13 }}>
              <option value="all">All Severity</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
        </div>

        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Type</th>
                <th>Institution 1</th>
                <th>Institution 2</th>
                <th>FDR Numbers</th>
                <th>Detected</th>
                <th>Severity</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(anomaly => (
                <tr key={anomaly.id}>
                  <td style={{ fontSize: 12, fontWeight: 600, color: '#374151', maxWidth: 140 }}>{typeLabel[anomaly.type]}</td>
                  <td style={{ fontSize: 12 }}>{anomaly.institution1Name}</td>
                  <td style={{ fontSize: 12 }}>{anomaly.institution2Name}</td>
                  <td style={{ fontSize: 11, fontFamily: 'monospace', color: '#6b7280' }}>
                    <div>{anomaly.fdr1Number}</div>
                    <div>{anomaly.fdr2Number}</div>
                  </td>
                  <td style={{ fontSize: 12, color: '#6b7280', whiteSpace: 'nowrap' }}>{getTimeAgo(anomaly.detectedDate)}</td>
                  <td><AnomalyBadge severity={anomaly.severity} /></td>
                  <td>{statusBadge[anomaly.status]}</td>
                  <td>
                    <button className="btn-ghost" style={{ fontSize: 12, padding: '4px 10px' }}
                      onClick={() => setSelectedAnomaly(anomaly)}>
                      <Eye size={13} /> Investigate
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {selectedAnomaly && (
        <AnomalyDetailModal
          anomaly={selectedAnomaly}
          onClose={() => setSelectedAnomaly(null)}
          onStatusChange={handleStatusChange}
        />
      )}
    </div>
  );
}
