import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, CheckCheck, AlertCircle, AlertTriangle, Info, Filter, Search, Clock } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { getTimeAgo } from '../../utils';
import type { Notification } from '../../types';

const typeIcons: Record<Notification['type'], React.ReactNode> = {
  fdr_expiry: <AlertCircle size={18} color="#dc2626" />,
  maturity_alert: <AlertTriangle size={18} color="#d97706" />,
  renewal_reminder: <Info size={18} color="#2563eb" />,
  verification_pending: <Clock size={18} color="#6b7280" />,
  document_discrepancy: <AlertCircle size={18} color="#dc2626" />,
  release_request: <Info size={18} color="#2563eb" />,
  security_alert: <AlertCircle size={18} color="#dc2626" />,
  compliance_warning: <AlertTriangle size={18} color="#d97706" />,
};

const typeColors: Record<Notification['type'], string> = {
  fdr_expiry: '#fee2e2',
  maturity_alert: '#fef3c7',
  renewal_reminder: '#dbeafe',
  verification_pending: '#f3f4f6',
  document_discrepancy: '#fee2e2',
  release_request: '#dbeafe',
  security_alert: '#fee2e2',
  compliance_warning: '#fef3c7',
};

const priorityColors = {
  critical: '#dc2626',
  high: '#ea580c',
  medium: '#d97706',
  low: '#16a34a',
};

const typeLabels: Record<Notification['type'], string> = {
  fdr_expiry: 'FDR Expiry',
  maturity_alert: 'Maturity Alert',
  renewal_reminder: 'Renewal Reminder',
  verification_pending: 'Verification Pending',
  document_discrepancy: 'Document Discrepancy',
  release_request: 'Release Request',
  security_alert: 'Security Alert',
  compliance_warning: 'Compliance Warning',
};

export default function NotificationsPage() {
  const { notifications, markNotificationRead, markAllRead } = useApp();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [readFilter, setReadFilter] = useState('all');

  const filtered = notifications.filter(n =>
    (typeFilter === 'all' || n.type === typeFilter) &&
    (priorityFilter === 'all' || n.priority === priorityFilter) &&
    (readFilter === 'all' || (readFilter === 'unread' ? !n.isRead : n.isRead)) &&
    (search === '' || n.title.toLowerCase().includes(search.toLowerCase()) ||
      n.message.toLowerCase().includes(search.toLowerCase()))
  );

  const unread = notifications.filter(n => !n.isRead).length;

  return (
    <div className="page-container animate-fade-in">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h1 className="section-title">Notification Center</h1>
          <p className="section-subtitle">{unread} unread · {notifications.length} total</p>
        </div>
        {unread > 0 && (
          <button className="btn-secondary" onClick={markAllRead}>
            <CheckCheck size={15} /> Mark all as read
          </button>
        )}
      </div>

      {/* Filter bar */}
      <div className="card" style={{ padding: '12px 16px', marginBottom: 16 }}>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: '1 1 200px' }}>
            <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
            <input className="form-input" placeholder="Search notifications..." value={search} onChange={e => setSearch(e.target.value)} style={{ paddingLeft: 30 }} />
          </div>
          <select className="form-input" value={typeFilter} onChange={e => setTypeFilter(e.target.value)} style={{ flex: '1 1 160px' }}>
            <option value="all">All Types</option>
            {Object.entries(typeLabels).map(([key, label]) => <option key={key} value={key}>{label}</option>)}
          </select>
          <select className="form-input" value={priorityFilter} onChange={e => setPriorityFilter(e.target.value)} style={{ flex: '1 1 130px' }}>
            <option value="all">All Priority</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
          <select className="form-input" value={readFilter} onChange={e => setReadFilter(e.target.value)} style={{ flex: '1 1 130px' }}>
            <option value="all">All Status</option>
            <option value="unread">Unread</option>
            <option value="read">Read</option>
          </select>
        </div>
      </div>

      {/* Notification list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {filtered.map(notif => (
          <div
            key={notif.id}
            className="card"
            style={{
              padding: '16px 20px',
              cursor: 'pointer',
              background: notif.isRead ? 'white' : '#fef8f9',
              borderLeft: `4px solid ${notif.isRead ? '#E5E2DA' : priorityColors[notif.priority]}`,
              transition: 'transform 0.15s, box-shadow 0.15s',
            }}
            onClick={() => {
              markNotificationRead(notif.id);
              if (notif.link) navigate(notif.link);
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateX(2px)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = ''; }}
          >
            <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
              {/* Icon */}
              <div style={{
                width: 40, height: 40, borderRadius: 10,
                background: typeColors[notif.type],
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}>
                {typeIcons[notif.type]}
              </div>

              {/* Content */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10, marginBottom: 4 }}>
                  <div style={{ fontSize: 14, fontWeight: notif.isRead ? 500 : 700, color: '#172B46' }}>
                    {notif.title}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                    <span style={{
                      fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 20,
                      background: `${priorityColors[notif.priority]}20`,
                      color: priorityColors[notif.priority],
                    }}>
                      {notif.priority.toUpperCase()}
                    </span>
                    {!notif.isRead && (
                      <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#963347', flexShrink: 0 }} />
                    )}
                  </div>
                </div>
                <div style={{ fontSize: 13, color: '#6b7280', lineHeight: 1.5, marginBottom: 8 }}>{notif.message}</div>
                <div style={{ display: 'flex', gap: 14, alignItems: 'center', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 12, color: '#9ca3af' }}>{getTimeAgo(notif.timestamp)}</span>
                  {notif.institutionName && (
                    <span className="badge badge-navy" style={{ fontSize: 11 }}>{notif.institutionName}</span>
                  )}
                  {notif.fdrNumber && (
                    <span className="badge badge-grey" style={{ fontSize: 11, fontFamily: 'monospace' }}>{notif.fdrNumber}</span>
                  )}
                  <span style={{
                    fontSize: 11, color: '#963347', fontWeight: 600,
                  }}>
                    {typeLabels[notif.type]}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="empty-state card" style={{ padding: 60 }}>
            <Bell size={40} />
            <h3>No notifications found</h3>
            <p>Adjust filters or check back later</p>
          </div>
        )}
      </div>
    </div>
  );
}
