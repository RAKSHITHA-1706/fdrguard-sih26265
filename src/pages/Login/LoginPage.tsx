import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, CheckCircle, Building2, ClipboardCheck, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { useApp, SYSTEM_USERS } from '../../context/AppContext';
import type { UserRole } from '../../types';

const roles: {
  id: UserRole;
  label: string;
  icon: React.ReactNode;
  desc: string;
  access: string[];
  credentialUsername: string;
}[] = [
  {
    id: 'system_admin',
    label: 'System Administrator',
    icon: <Shield size={24} />,
    desc: 'Manage institutions, FDR records, verification workflows, security monitoring, and reports.',
    access: [
      'All Institutions Directory',
      'Full FDR Deposit Records',
      'FDR Sentinel & Verification Engine',
      'Institution Network Intelligence',
      'Guardian AI Security Monitoring',
      'Lifecycle Risk Radar',
      'Digital Evidence Vault',
      'Regulatory Reports & Analytics',
    ],
    credentialUsername: 'admin@fdrguard.in',
  },
  {
    id: 'institution_admin',
    label: 'Institution Administrator',
    icon: <Building2 size={24} />,
    desc: "Manage the institution's FDR records, submit renewal and release requests, and view verification results.",
    access: [
      'Institutional FDR Portfolio',
      'Upload & Submit New FDRs',
      'Deposit Renewal Requests',
      'Maturity Release Applications',
      'Compliance & Verification Alerts',
    ],
    credentialUsername: 'principal@rvce.edu.in',
  },
  {
    id: 'verification_officer',
    label: 'Verification Officer',
    icon: <ClipboardCheck size={24} />,
    desc: 'Review assigned FDR verification requests, analyze documents, and record verification decisions.',
    access: [
      'Verification Task Queue',
      'Document Authenticity Checks',
      'FDR Sentinel Analysis Engine',
      'Lifecycle Risk Radar',
      'Digital Evidence Vault',
    ],
    credentialUsername: 'officer@fdrguard.in',
  },
];

export default function LoginPage() {
  const [selectedRole, setSelectedRole] = useState<UserRole>('system_admin');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { setCurrentUser } = useApp();
  const navigate = useNavigate();

  const handleLogin = () => {
    setLoading(true);
    setTimeout(() => {
      setCurrentUser(SYSTEM_USERS[selectedRole]);
      navigate('/dashboard');
    }, 600);
  };

  const selectedRoleData = roles.find(r => r.id === selectedRole)!;

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #172B46 0%, #0f1e30 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
        fontFamily: 'Inter, sans-serif',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 960,
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 0,
          borderRadius: 20,
          overflow: 'hidden',
          boxShadow: '0 24px 80px rgba(0,0,0,0.4)',
        }}
      >
        {/* Left Panel */}
        <div
          style={{
            background: '#172B46',
            padding: '48px 40px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 36 }}>
              <div
                style={{
                  background: '#ffffff',
                  borderRadius: 12,
                  padding: '5px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 14px rgba(0,0,0,0.2)',
                  flexShrink: 0,
                }}
              >
                <img
                  src="/fdrguard-logo.png"
                  alt="FDRGuard Logo"
                  style={{ width: 48, height: 48, objectFit: 'contain' }}
                />
              </div>
              <div>
                <div style={{ fontSize: 22, fontWeight: 800, color: 'white', lineHeight: 1.1 }}>
                  FDRGuard
                </div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', marginTop: 2 }}>
                  Intelligent FDR Lifecycle & Compliance
                </div>
              </div>
            </div>

            <h1
              style={{
                fontSize: 28,
                fontWeight: 800,
                color: 'white',
                margin: '0 0 12px',
                lineHeight: 1.3,
              }}
            >
              Secure Access Portal
            </h1>
            <p
              style={{
                fontSize: 14,
                color: 'rgba(255,255,255,0.65)',
                lineHeight: 1.7,
                margin: '0 0 28px',
              }}
            >
              Enterprise deposit lifecycle and institutional compliance monitoring platform. Select
              your authenticated role to proceed to the management console.
            </p>

            <div>
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  color: 'rgba(255,255,255,0.45)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  marginBottom: 12,
                }}
              >
                {selectedRoleData.label} Capabilities
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {selectedRoleData.access.map(item => (
                  <div key={item} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <CheckCircle size={14} color="#16a34a" style={{ flexShrink: 0 }} />
                    <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.75)' }}>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div
            style={{
              fontSize: 11,
              color: 'rgba(255,255,255,0.3)',
              borderTop: '1px solid rgba(255,255,255,0.08)',
              paddingTop: 16,
              marginTop: 32,
            }}
          >
            FDRGuard Enterprise Security & Compliance System · v1.0
          </div>
        </div>

        {/* Right Panel */}
        <div style={{ background: 'white', padding: '44px 38px' }}>
          <div style={{ marginBottom: 18 }}>
            <img
              src="/fdrguard-logo.png"
              alt="FDRGuard Logo"
              style={{ height: 46, width: 'auto', objectFit: 'contain' }}
            />
          </div>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: '#172B46', margin: '0 0 6px' }}>
            Choose Your Role
          </h2>
          <p style={{ fontSize: 13, color: '#6b7280', margin: '0 0 24px' }}>
            Select your role to access the platform.
          </p>

          {/* Role cards */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
            {roles.map(role => {
              const isSelected = selectedRole === role.id;
              return (
                <div
                  key={role.id}
                  onClick={() => setSelectedRole(role.id)}
                  style={{
                    border: `2px solid ${isSelected ? '#963347' : '#E5E2DA'}`,
                    borderRadius: 12,
                    padding: '12px 14px',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    background: isSelected ? '#fde8ec' : 'white',
                    display: 'flex',
                    gap: 12,
                    alignItems: 'flex-start',
                  }}
                >
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 10,
                      flexShrink: 0,
                      background: isSelected ? '#963347' : '#f3f4f6',
                      color: isSelected ? 'white' : '#6b7280',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {role.icon}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        fontSize: 14,
                        fontWeight: 700,
                        color: '#172B46',
                        marginBottom: 3,
                      }}
                    >
                      {role.label}
                    </div>
                    <div style={{ fontSize: 12, color: '#6b7280', lineHeight: 1.4 }}>
                      {role.desc}
                    </div>
                  </div>
                  {isSelected && (
                    <CheckCircle
                      size={18}
                      color="#963347"
                      style={{ flexShrink: 0, marginLeft: 6, marginTop: 2 }}
                    />
                  )}
                </div>
              );
            })}
          </div>

          {/* Login Credentials Section */}
          <div
            style={{
              background: '#F4F2EC',
              borderRadius: 10,
              padding: '12px 16px',
              marginBottom: 20,
              border: '1px solid #E5E2DA',
            }}
          >
            <div style={{ fontSize: 12, fontWeight: 700, color: '#172B46', marginBottom: 8 }}>
              Login Credentials
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <div style={{ fontSize: 11, color: '#6b7280', marginBottom: 2 }}>Username</div>
                <div
                  style={{
                    fontSize: 12,
                    fontWeight: 600,
                    color: '#172B46',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {selectedRoleData.credentialUsername}
                </div>
              </div>
              <div>
                <div style={{ fontSize: 11, color: '#6b7280', marginBottom: 2 }}>Password</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: '#172B46' }}>
                    {showPassword ? 'Secure@2024' : '••••••••'}
                  </div>
                  <button
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: '#6b7280',
                      padding: 0,
                      display: 'flex',
                    }}
                    title={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={handleLogin}
            disabled={loading}
            className="btn-primary"
            style={{
              width: '100%',
              justifyContent: 'center',
              padding: '13px',
              fontSize: 14,
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? (
              <>
                <div
                  style={{
                    width: 16,
                    height: 16,
                    border: '2px solid rgba(255,255,255,0.4)',
                    borderTopColor: 'white',
                    borderRadius: '50%',
                    animation: 'spin 0.8s linear infinite',
                  }}
                />
                Authenticating...
              </>
            ) : (
              <>
                Continue as {selectedRoleData.label} <ArrowRight size={16} />
              </>
            )}
          </button>

          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    </div>
  );
}
