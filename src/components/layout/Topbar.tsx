import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Bell, Menu, ChevronRight, Check, CheckCheck, X, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { getTimeAgo } from '../../utils';

function getBreadcrumbs(pathname: string): string[] {
  const map: Record<string, string[]> = {
    '/dashboard': ['Dashboard'],
    '/institutions': ['Institutions'],
    '/fdrs': ['FDR Management'],
    '/fdrs/new': ['FDR Management', 'Add FDR'],
    '/sentinel': ['Verification', 'FDR Sentinel'],
    '/network': ['Intelligence', 'Institution Network Intelligence'],
    '/guardian': ['Security', 'Guardian AI'],
    '/risk-radar': ['Analytics', 'Lifecycle Risk Radar'],
    '/evidence-vault': ['Compliance', 'Digital Evidence Vault'],
    '/notifications': ['Notifications'],
    '/reports': ['Reports & Analytics'],
  };
  return map[pathname] || ['Dashboard'];
}

const notifIcons: Record<string, React.ReactNode> = {
  fdr_expiry: <AlertCircle size={14} color="#dc2626" />,
  maturity_alert: <AlertTriangle size={14} color="#d97706" />,
  renewal_reminder: <Info size={14} color="#2563eb" />,
  verification_pending: <Info size={14} color="#6b7280" />,
  document_discrepancy: <AlertCircle size={14} color="#dc2626" />,
  release_request: <Info size={14} color="#2563eb" />,
  security_alert: <AlertCircle size={14} color="#dc2626" />,
  compliance_warning: <AlertTriangle size={14} color="#d97706" />,
};

export default function Topbar() {
  const { currentUser, setIsSidebarOpen, isSidebarOpen, notifications, unreadCount, markNotificationRead, markAllRead } = useApp();
  const [notifOpen, setNotifOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const location = useLocation();

  const breadcrumbs = getBreadcrumbs(location.pathname);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!currentUser) return null;

  const recentNotifs = notifications.slice(0, 8);

  return (
    <header style={{
      background: 'white',
      borderBottom: '1px solid #E5E2DA',
      padding: '0 20px',
      height: 56,
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      position: 'sticky',
      top: 0,
      zIndex: 20,
      flexShrink: 0,
    }}>
      {/* Menu toggle */}
      <button
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 6, borderRadius: 8, color: '#172B46', display: 'flex', alignItems: 'center' }}
        title="Toggle sidebar"
      >
        <Menu size={20} />
      </button>

      {/* Topbar Brand Logo */}
      <Link to="/dashboard" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none', marginRight: 6 }}>
        <img
          src="/fdrguard-logo.png"
          alt="FDRGuard Logo"
          style={{ height: 38, width: 'auto', objectFit: 'contain' }}
        />
      </Link>

      {/* Breadcrumbs */}
      <nav style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 6 }}>
        {breadcrumbs.map((crumb, idx) => (
          <React.Fragment key={idx}>
            {idx > 0 && <ChevronRight size={14} color="#9ca3af" />}
            <span style={{
              fontSize: 13,
              color: idx === breadcrumbs.length - 1 ? '#172B46' : '#9ca3af',
              fontWeight: idx === breadcrumbs.length - 1 ? 600 : 400,
            }}>
              {crumb}
            </span>
          </React.Fragment>
        ))}
      </nav>

      {/* Right actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        {/* Notification bell */}
        <div style={{ position: 'relative' }} ref={notifRef}>
          <button
            onClick={() => setNotifOpen(!notifOpen)}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '6px',
              borderRadius: 8,
              color: '#172B46',
              display: 'flex',
              alignItems: 'center',
              position: 'relative',
            }}
          >
            <Bell size={20} />
            {unreadCount > 0 && (
              <span style={{
                position: 'absolute',
                top: 2, right: 2,
                background: '#963347',
                color: 'white',
                fontSize: 9,
                fontWeight: 700,
                borderRadius: 10,
                minWidth: 16,
                height: 16,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '0 3px',
              }}>
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {/* Notification dropdown */}
          {notifOpen && (
            <div style={{
              position: 'absolute',
              right: 0,
              top: '100%',
              marginTop: 8,
              width: 380,
              background: 'white',
              borderRadius: 12,
              boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
              border: '1px solid #E5E2DA',
              overflow: 'hidden',
              zIndex: 100,
            }}>
              <div style={{ padding: '14px 16px', borderBottom: '1px solid #f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#172B46' }}>Notifications</div>
                  <div style={{ fontSize: 12, color: '#9ca3af' }}>{unreadCount} unread</div>
                </div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  {unreadCount > 0 && (
                    <button onClick={markAllRead} className="btn-ghost" style={{ fontSize: 12, padding: '4px 8px' }}>
                      <CheckCheck size={14} /> Mark all read
                    </button>
                  )}
                  <button onClick={() => setNotifOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af' }}>
                    <X size={16} />
                  </button>
                </div>
              </div>

              <div style={{ maxHeight: 400, overflowY: 'auto' }}>
                {recentNotifs.length === 0 ? (
                  <div style={{ padding: 32, textAlign: 'center', color: '#9ca3af', fontSize: 13 }}>
                    No notifications
                  </div>
                ) : (
                  recentNotifs.map(notif => (
                    <div
                      key={notif.id}
                      style={{
                        padding: '12px 16px',
                        borderBottom: '1px solid #f5f5f5',
                        background: notif.isRead ? 'white' : '#fef8f9',
                        cursor: 'pointer',
                        transition: 'background 0.15s',
                      }}
                      onClick={() => {
                        markNotificationRead(notif.id);
                        setNotifOpen(false);
                        if (notif.link) navigate(notif.link);
                      }}
                    >
                      <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                        <div style={{ marginTop: 2 }}>{notifIcons[notif.type] || <Info size={14} />}</div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 13, fontWeight: notif.isRead ? 500 : 700, color: '#172B46', marginBottom: 2 }}>
                            {notif.title}
                          </div>
                          <div style={{ fontSize: 12, color: '#6b7280', lineHeight: 1.4 }}>
                            {notif.message}
                          </div>
                          <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 4 }}>
                            {getTimeAgo(notif.timestamp)}
                          </div>
                        </div>
                        {!notif.isRead && (
                          <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#963347', flexShrink: 0, marginTop: 4 }} />
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div style={{ padding: '10px 16px', borderTop: '1px solid #f0f0f0', textAlign: 'center' }}>
                <Link to="/notifications" onClick={() => setNotifOpen(false)} style={{ fontSize: 13, color: '#963347', fontWeight: 600, textDecoration: 'none' }}>
                  View all notifications
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* User avatar */}
        <div style={{
          width: 34,
          height: 34,
          borderRadius: '50%',
          background: '#172B46',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontSize: 13,
          fontWeight: 700,
          cursor: 'pointer',
          flexShrink: 0,
        }}
          title={currentUser.name}
        >
          {currentUser.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
        </div>
      </div>
    </header>
  );
}
