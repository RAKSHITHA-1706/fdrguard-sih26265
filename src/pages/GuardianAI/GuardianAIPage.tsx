import React, { useState } from 'react';
import { Eye, AlertTriangle, Shield, Filter, Search, Check, AlertCircle, Clock, MapPin, User, Activity } from 'lucide-react';
import { MOCK_SECURITY_EVENTS } from '../../data/mockData';
import { formatDateTime, getTimeAgo } from '../../utils';
import type { SecurityEvent } from '../../types';
import Modal from '../../components/common/Modal';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const eventTypeLabel: Record<SecurityEvent['eventType'], string> = {
  failed_login: 'Failed Login Attempt',
  unauthorized_access: 'Unauthorized Access',
  bulk_download: 'Unusual Bulk Download',
  restricted_record_access: 'Restricted Record Access',
  unusual_activity: 'Unusual Activity',
  api_abuse: 'API Abuse Detected',
  record_modification_attempt: 'Unauthorized Modification Attempt',
  session_anomaly: 'Session Anomaly',
};

const severityColors: Record<SecurityEvent['severity'], { bg: string; color: string; border: string }> = {
  low: { bg: '#dcfce7', color: '#166534', border: '#bbf7d0' },
  medium: { bg: '#fef3c7', color: '#92400e', border: '#fcd34d' },
  high: { bg: '#ffedd5', color: '#9a3412', border: '#fdba74' },
  critical: { bg: '#fee2e2', color: '#991b1b', border: '#fca5a5' },
};

const weeklyData = [
  { day: 'Mon', events: 4, blocked: 2 },
  { day: 'Tue', events: 7, blocked: 5 },
  { day: 'Wed', events: 2, blocked: 1 },
  { day: 'Thu', events: 12, blocked: 9 },
  { day: 'Fri', events: 5, blocked: 3 },
  { day: 'Sat', events: 8, blocked: 7 },
  { day: 'Sun', events: 3, blocked: 2 },
];

function SecurityEventModal({ event, onClose, onResolve }: { event: SecurityEvent; onClose: () => void; onResolve: (id: string) => void }) {
  const sc = severityColors[event.severity];
  return (
    <Modal isOpen={true} onClose={onClose} title="Security Event Details" maxWidth={640}
      footer={
        <div style={{ display: 'flex', gap: 8 }}>
          {event.status === 'open' && (
            <button className="btn-primary" style={{ background: '#d97706' }} onClick={() => { onResolve(event.id); onClose(); }}>
              Mark Under Investigation
            </button>
          )}
          {event.status === 'investigating' && (
            <>
              <button className="btn-primary" style={{ background: '#16a34a' }} onClick={() => { onResolve(event.id); onClose(); }}>
                Resolve Event
              </button>
              <button className="btn-secondary" onClick={() => { onResolve(event.id); onClose(); }}>
                Mark False Positive
              </button>
            </>
          )}
          <button className="btn-secondary" onClick={onClose}>Close</button>
        </div>
      }
    >
      <div style={{ ...sc, border: `1px solid ${sc.border}`, borderRadius: 10, padding: '14px 16px', marginBottom: 16, display: 'flex', gap: 12, alignItems: 'center' }}>
        <AlertCircle size={24} color={sc.color} />
        <div>
          <div style={{ fontSize: 15, fontWeight: 800, color: sc.color }}>{event.severity.toUpperCase()} SEVERITY</div>
          <div style={{ fontSize: 13, color: sc.color, opacity: 0.8 }}>{eventTypeLabel[event.eventType]}</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
        {[
          { label: 'Event ID', value: event.id },
          { label: 'Status', value: event.status.toUpperCase() },
          { label: 'Detected', value: formatDateTime(event.timestamp) },
          { label: 'IP Address', value: event.ipAddress },
          { label: 'User', value: event.userName || 'Unknown' },
          { label: 'Location', value: event.location || 'Unknown' },
          { label: 'Affected Resource', value: event.affectedResource || 'N/A', span: 2 },
        ].map(item => (
          <div key={item.label} style={{ background: '#F4F2EC', borderRadius: 8, padding: '10px 12px', gridColumn: (item as any).span ? `span ${(item as any).span}` : undefined }}>
            <div style={{ fontSize: 10, color: '#9ca3af', fontWeight: 600, textTransform: 'uppercase', marginBottom: 3 }}>{item.label}</div>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#172B46' }}>{item.value}</div>
          </div>
        ))}
      </div>

      <div style={{ background: '#F4F2EC', borderRadius: 10, padding: '14px 16px', marginBottom: 14 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: '#172B46', marginBottom: 6 }}>EVENT DESCRIPTION</div>
        <p style={{ fontSize: 13, color: '#374151', margin: 0, lineHeight: 1.6 }}>{event.description}</p>
      </div>

      <div style={{ background: '#fef3c7', border: '1px solid #fcd34d', borderRadius: 10, padding: '12px 14px' }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: '#92400e', marginBottom: 6 }}>⚠️ Investigation Notice</div>
        <p style={{ fontSize: 12, color: '#374151', margin: 0, lineHeight: 1.6 }}>
          Unusual activity does not automatically indicate malicious intent. All events must be investigated
          through proper channels before any action is taken against a user or account.
        </p>
      </div>
    </Modal>
  );
}

export default function GuardianAIPage() {
  const [events, setEvents] = useState<SecurityEvent[]>(MOCK_SECURITY_EVENTS);
  const [selectedEvent, setSelectedEvent] = useState<SecurityEvent | null>(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [severityFilter, setSeverityFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [search, setSearch] = useState('');

  const filtered = events.filter(e =>
    (statusFilter === 'all' || e.status === statusFilter) &&
    (severityFilter === 'all' || e.severity === severityFilter) &&
    (typeFilter === 'all' || e.eventType === typeFilter) &&
    (search === '' || (e.userName || '').toLowerCase().includes(search.toLowerCase()) ||
      e.description.toLowerCase().includes(search.toLowerCase()) ||
      e.ipAddress.includes(search))
  );

  const handleResolve = (id: string) => {
    setEvents(prev => prev.map(e => {
      if (e.id !== id) return e;
      if (e.status === 'open') return { ...e, status: 'investigating' as const };
      return { ...e, status: 'resolved' as const, resolvedBy: 'System Admin', resolvedAt: new Date().toISOString() };
    }));
  };

  const stats = {
    total: events.length,
    open: events.filter(e => e.status === 'open').length,
    critical: events.filter(e => e.severity === 'critical').length,
    resolved: events.filter(e => e.status === 'resolved' || e.status === 'false_positive').length,
    failedLogins: events.filter(e => e.eventType === 'failed_login').length,
    blocked: events.filter(e => e.status === 'resolved').length,
  };

  const statusBadgeClass = {
    open: 'badge badge-red',
    investigating: 'badge badge-amber',
    resolved: 'badge badge-green',
    false_positive: 'badge badge-grey',
  };

  return (
    <div className="page-container animate-fade-in">
      {/* Header */}
      <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 24 }}>
        <div style={{ width: 40, height: 40, background: '#D97732', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Eye size={22} color="white" />
        </div>
        <div>
          <h1 className="section-title">Guardian AI</h1>
          <p className="section-subtitle">Real-Time Threat Intelligence & Platform Misuse Detection</p>
        </div>
      </div>

      {/* Security Advisory */}
      <div style={{ background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: 10, padding: '10px 16px', marginBottom: 20, fontSize: 12, color: '#334155' }}>
        <strong>Security Advisory:</strong> Live security event stream actively analyzes session behavior and authentication patterns. High-severity alerts require administrator review and investigation before taking enforcement action.
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 14, marginBottom: 20 }}>
        {[
          { label: 'Total Events', value: stats.total, color: '#172B46', icon: <Activity size={18} /> },
          { label: 'Open Alerts', value: stats.open, color: '#dc2626', icon: <AlertCircle size={18} /> },
          { label: 'Critical Events', value: stats.critical, color: '#ea580c', icon: <AlertTriangle size={18} /> },
          { label: 'Failed Logins', value: stats.failedLogins, color: '#d97706', icon: <User size={18} /> },
          { label: 'Blocked Requests', value: stats.blocked, color: '#7c3aed', icon: <Shield size={18} /> },
          { label: 'Resolved', value: stats.resolved, color: '#16a34a', icon: <Check size={18} /> },
        ].map(stat => (
          <div key={stat.label} className="stat-card" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontSize: 11, color: '#9ca3af', fontWeight: 600, textTransform: 'uppercase' }}>{stat.label}</div>
              <div style={{ color: stat.color, opacity: 0.7 }}>{stat.icon}</div>
            </div>
            <div style={{ fontSize: 28, fontWeight: 800, color: stat.color }}>{stat.value}</div>
          </div>
        ))}
      </div>

      {/* Chart + Timeline */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
        <div className="card" style={{ padding: 20 }}>
          <h3 style={{ margin: '0 0 14px', fontSize: 14, fontWeight: 700, color: '#172B46' }}>Weekly Security Events</h3>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={weeklyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="day" fontSize={11} tick={{ fill: '#9ca3af' }} />
              <YAxis fontSize={11} tick={{ fill: '#9ca3af' }} />
              <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12 }} />
              <Bar dataKey="events" fill="#D97732" radius={[4, 4, 0, 0]} name="Events" />
              <Bar dataKey="blocked" fill="#172B46" radius={[4, 4, 0, 0]} name="Blocked" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card" style={{ padding: 20 }}>
          <h3 style={{ margin: '0 0 14px', fontSize: 14, fontWeight: 700, color: '#172B46' }}>Recent Security Timeline</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {events.slice(0, 5).map(event => {
              const sc = severityColors[event.severity];
              return (
                <div key={event.id} className="timeline-item" style={{ cursor: 'pointer' }} onClick={() => setSelectedEvent(event)}>
                  <div style={{ width: 10, height: 10, borderRadius: '50%', background: sc.color, marginTop: 5, flexShrink: 0 }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#172B46' }}>{eventTypeLabel[event.eventType]}</div>
                    <div style={{ fontSize: 12, color: '#6b7280' }}>{event.userName || 'Unknown'} · {event.ipAddress}</div>
                    <div style={{ fontSize: 11, color: '#9ca3af' }}>{getTimeAgo(event.timestamp)}</div>
                  </div>
                  <span style={{ ...sc, border: `1px solid ${sc.border}`, fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 20, flexShrink: 0 }}>
                    {event.severity.toUpperCase()}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Event Table */}
      <div className="card" style={{ padding: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: '#172B46' }}>Security Alert Registry</h3>
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
                <th>Event Type</th>
                <th>User</th>
                <th>IP Address</th>
                <th>Location</th>
                <th>Time</th>
                <th>Severity</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(event => {
                const sc = severityColors[event.severity];
                return (
                  <tr key={event.id} style={{ background: event.severity === 'critical' ? '#fef9f9' : undefined }}>
                    <td style={{ fontSize: 12, fontWeight: 600, color: '#172B46' }}>{eventTypeLabel[event.eventType]}</td>
                    <td style={{ fontSize: 12 }}>{event.userName || 'Unknown'}</td>
                    <td style={{ fontSize: 11, fontFamily: 'monospace', color: '#6b7280' }}>{event.ipAddress}</td>
                    <td style={{ fontSize: 12, color: '#6b7280' }}>
                      {event.location && <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><MapPin size={11} />{event.location}</span>}
                    </td>
                    <td style={{ fontSize: 12, color: '#6b7280', whiteSpace: 'nowrap' }}>{getTimeAgo(event.timestamp)}</td>
                    <td>
                      <span style={{ ...sc, border: `1px solid ${sc.border}`, fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20 }}>
                        {event.severity.toUpperCase()}
                      </span>
                    </td>
                    <td><span className={statusBadgeClass[event.status]}>{event.status.replace('_', ' ')}</span></td>
                    <td>
                      <button className="btn-ghost" style={{ fontSize: 12, padding: '4px 10px' }} onClick={() => setSelectedEvent(event)}>
                        <Eye size={13} /> View
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {selectedEvent && (
        <SecurityEventModal event={selectedEvent} onClose={() => setSelectedEvent(null)} onResolve={handleResolve} />
      )}
    </div>
  );
}
