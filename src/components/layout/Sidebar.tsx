import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Building2, FileText, Shield, Network,
  Eye, Radar, Archive, Bell, BarChart3, LogOut, X, ChevronRight
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import type { UserRole } from '../../types';

interface NavItem {
  to: string;
  icon: React.ReactNode;
  label: string;
  roles: UserRole[];
  badge?: string;
}

const navItems: NavItem[] = [
  { to: '/dashboard', icon: <LayoutDashboard size={18} />, label: 'Dashboard', roles: ['system_admin', 'institution_admin', 'verification_officer'] },
  { to: '/institutions', icon: <Building2 size={18} />, label: 'Institutions', roles: ['system_admin', 'verification_officer'] },
  { to: '/fdrs', icon: <FileText size={18} />, label: 'FDR Management', roles: ['system_admin', 'institution_admin', 'verification_officer'] },
  { to: '/sentinel', icon: <Shield size={18} />, label: 'FDR Sentinel', roles: ['system_admin', 'verification_officer'] },
  { to: '/network', icon: <Network size={18} />, label: 'Network Intelligence', roles: ['system_admin'] },
  { to: '/guardian', icon: <Eye size={18} />, label: 'Guardian AI', roles: ['system_admin'] },
  { to: '/risk-radar', icon: <Radar size={18} />, label: 'Risk Radar', roles: ['system_admin', 'verification_officer'] },
  { to: '/evidence-vault', icon: <Archive size={18} />, label: 'Evidence Vault', roles: ['system_admin', 'verification_officer'] },
  { to: '/notifications', icon: <Bell size={18} />, label: 'Notifications', roles: ['system_admin', 'institution_admin', 'verification_officer'] },
  { to: '/reports', icon: <BarChart3 size={18} />, label: 'Reports', roles: ['system_admin', 'institution_admin'] },
];

export default function Sidebar() {
  const { currentUser, setCurrentUser, isSidebarOpen, setIsSidebarOpen, unreadCount } = useApp();
  const navigate = useNavigate();

  if (!currentUser) return null;

  const visibleItems = navItems.filter(item => item.roles.includes(currentUser.role));

  const roleLabel = {
    system_admin: 'System Administrator',
    institution_admin: 'Institution Administrator',
    verification_officer: 'Verification Officer',
  }[currentUser.role];

  const handleLogout = () => {
    setCurrentUser(null);
    navigate('/');
  };

  return (
    <>
      {/* Mobile overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <aside
        style={{
          width: isSidebarOpen ? 240 : 0,
          minWidth: isSidebarOpen ? 240 : 0,
          backgroundColor: '#172B46',
          display: 'flex',
          flexDirection: 'column',
          height: '100vh',
          position: 'sticky',
          top: 0,
          overflow: 'hidden',
          transition: 'width 0.25s ease, min-width 0.25s ease',
          flexShrink: 0,
          zIndex: 40,
        }}
      >
        {/* Logo */}
        <div style={{ padding: '20px 16px 16px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <NavLink to="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
              <div style={{
                background: '#ffffff',
                borderRadius: 10,
                padding: '4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                boxShadow: '0 2px 8px rgba(0,0,0,0.25)'
              }}>
                <img
                  src="/fdrguard-logo.png"
                  alt="FDRGuard Logo"
                  style={{ width: 42, height: 42, objectFit: 'contain' }}
                />
              </div>
              <div>
                <div style={{ color: 'white', fontWeight: 800, fontSize: 17, lineHeight: 1.1 }}>FDRGuard</div>
                <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 10, fontWeight: 500 }}>Institutional Platform</div>
              </div>
            </NavLink>
            <button
              onClick={() => setIsSidebarOpen(false)}
              style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', cursor: 'pointer', padding: 4 }}
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Role badge */}
        <div style={{ padding: '12px 16px', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
          <div style={{
            background: 'rgba(255,255,255,0.08)',
            borderRadius: 8,
            padding: '8px 12px',
          }}>
            <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Logged in as
            </div>
            <div style={{ color: 'white', fontSize: 13, fontWeight: 600, marginTop: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {currentUser.name}
            </div>
            <div style={{ color: '#D97732', fontSize: 11, fontWeight: 500, marginTop: 1 }}>
              {roleLabel}
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav style={{ flex: 1, padding: '12px 10px', overflowY: 'auto' }}>
          <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', padding: '4px 6px 8px' }}>
            Navigation
          </div>
          {visibleItems.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
              style={{ marginBottom: 2, position: 'relative' }}
              onClick={() => window.innerWidth < 768 && setIsSidebarOpen(false)}
            >
              {item.icon}
              <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.label}</span>
              {item.label === 'Notifications' && unreadCount > 0 && (
                <span style={{
                  marginLeft: 'auto',
                  background: '#963347',
                  color: 'white',
                  fontSize: 10,
                  fontWeight: 700,
                  borderRadius: 10,
                  padding: '1px 6px',
                  minWidth: 18,
                  textAlign: 'center',
                }}>
                  {unreadCount}
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        <div style={{ padding: '12px 10px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          <button
            onClick={handleLogout}
            className="sidebar-link"
            style={{ color: 'rgba(255,100,100,0.8)' }}
          >
            <LogOut size={18} />
            <span>Sign Out</span>
          </button>
          <div style={{ color: 'rgba(255,255,255,0.25)', fontSize: 10, textAlign: 'center', marginTop: 10 }}>
            FDRGuard Enterprise Platform · v1.0
          </div>
        </div>
      </aside>

      {/* Collapsed toggle */}
      {!isSidebarOpen && (
        <button
          onClick={() => setIsSidebarOpen(true)}
          style={{
            position: 'fixed',
            left: 0,
            top: '50%',
            transform: 'translateY(-50%)',
            background: '#172B46',
            color: 'white',
            border: 'none',
            borderRadius: '0 8px 8px 0',
            padding: '12px 8px',
            cursor: 'pointer',
            zIndex: 50,
            boxShadow: '2px 0 8px rgba(0,0,0,0.2)',
          }}
        >
          <ChevronRight size={18} />
        </button>
      )}
    </>
  );
}
