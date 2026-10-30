import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Building2, FileText, AlertTriangle, Clock, CheckCircle, RefreshCw,
  Unlock, Plus, Upload, Shield, BarChart3, TrendingUp, Activity, AlertCircle
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import StatCard from '../../components/common/StatCard';
import { useApp } from '../../context/AppContext';
import {
  MOCK_AUDIT_EVENTS, MONTHLY_MATURITY_DATA,
  VERIFICATION_STATUS_DATA, BANK_DISTRIBUTION_DATA
} from '../../data/mockData';
import { formatCurrency, formatDateTime, getDaysToMaturity, getTimeAgo, getFDRStatusBadgeClass, getFDRStatusLabel } from '../../utils';

export default function DashboardPage() {
  const { fdrs, institutions, currentUser } = useApp();
  const navigate = useNavigate();

  const activeFDRs = fdrs.filter(f => f.lifecycleStatus === 'active').length;
  const expiringFDRs = fdrs.filter(f => f.lifecycleStatus === 'expiring_soon').length;
  const maturedFDRs = fdrs.filter(f => f.lifecycleStatus === 'matured').length;
  const pendingVerification = fdrs.filter(f => ['not_started', 'in_progress'].includes(f.verificationStatus)).length;
  const renewalPending = fdrs.filter(f => f.lifecycleStatus === 'renewal_pending').length;
  const releaseRequests = fdrs.filter(f => f.lifecycleStatus === 'release_requested').length;
  const criticalFDRs = fdrs.filter(f => f.riskLevel === 'critical');
  const totalValue = fdrs.reduce((sum, f) => sum + f.amount, 0);

  const isAdmin = currentUser?.role === 'system_admin';
  const isInstAdmin = currentUser?.role === 'institution_admin';
  const myFDRs = isInstAdmin
    ? fdrs.filter(f => f.institutionId === currentUser?.institutionId)
    : fdrs;

  return (
    <div className="page-container animate-fade-in">
      {/* Page header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{
            background: '#ffffff',
            borderRadius: 12,
            padding: '5px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '1px solid #E5E2DA',
            boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
            flexShrink: 0
          }}>
            <img
              src="/fdrguard-logo.png"
              alt="FDRGuard Logo"
              style={{ width: 50, height: 50, objectFit: 'contain' }}
            />
          </div>
          <div>
            <h1 className="section-title" style={{ marginBottom: 2 }}>
              {isAdmin ? 'FDRGuard Overview Dashboard' : isInstAdmin ? 'Institution Dashboard' : 'Verification Dashboard'}
            </h1>
            <p className="section-subtitle" style={{ margin: 0 }}>
              {isAdmin
                ? 'Monitor institutional security deposits and Fixed Deposit Receipt activities from one centralized platform.'
                : isInstAdmin
                ? `Managing FDRs for ${currentUser?.institutionId || 'Institution'}`
                : 'Review assigned FDR verification requests and document queues.'}
            </p>
          </div>
        </div>
      </div>

      {/* Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 14, marginBottom: 24 }}>
        {isAdmin && (
          <StatCard
            title="Institutions"
            value={institutions.length}
            subtitle={`${institutions.filter(i => i.status === 'active').length} active`}
            icon={<Building2 size={18} />}
            color="#172B46"
            onClick={() => navigate('/institutions')}
            trend={5}
          />
        )}
        <StatCard
          title="Total FDRs"
          value={myFDRs.length}
          subtitle={formatCurrency(totalValue) + ' total value'}
          icon={<FileText size={18} />}
          color="#2563eb"
          onClick={() => navigate('/fdrs')}
        />
        <StatCard
          title="Active FDRs"
          value={myFDRs.filter(f => f.lifecycleStatus === 'active').length}
          subtitle="Currently active"
          icon={<CheckCircle size={18} />}
          color="#16a34a"
          trend={3}
        />
        <StatCard
          title="Expiring Soon"
          value={myFDRs.filter(f => f.lifecycleStatus === 'expiring_soon').length}
          subtitle="Within 60 days"
          icon={<Clock size={18} />}
          color="#d97706"
          badge="Action needed"
          badgeColor="#d97706"
          onClick={() => navigate('/risk-radar')}
        />
        <StatCard
          title="Pending Verification"
          value={pendingVerification}
          subtitle="Awaiting review"
          icon={<AlertTriangle size={18} />}
          color="#9333ea"
          onClick={() => navigate('/fdrs')}
        />
        <StatCard
          title="Renewal Pending"
          value={renewalPending}
          subtitle="Awaiting approval"
          icon={<RefreshCw size={18} />}
          color="#D97732"
        />
        {isAdmin && (
          <StatCard
            title="Release Requests"
            value={releaseRequests}
            subtitle="Pending review"
            icon={<Unlock size={18} />}
            color="#963347"
          />
        )}
        <StatCard
          title="Matured FDRs"
          value={maturedFDRs}
          subtitle="Action required"
          icon={<BarChart3 size={18} />}
          color="#6b7280"
        />
      </div>

      {/* Charts row */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16, marginBottom: 16 }}>
        {/* Maturity Trend Chart */}
        <div className="card" style={{ padding: 20 }}>
          <div style={{ marginBottom: 16 }}>
            <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: '#172B46' }}>Monthly FDR Lifecycle Trend</h3>
            <p style={{ margin: '4px 0 0', fontSize: 12, color: '#9ca3af' }}>Matured, Renewed, and Released FDRs per month</p>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={MONTHLY_MATURITY_DATA}>
              <defs>
                <linearGradient id="maturedGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#963347" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#963347" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="renewedGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#172B46" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#172B46" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" fontSize={11} tick={{ fill: '#9ca3af' }} />
              <YAxis fontSize={11} tick={{ fill: '#9ca3af' }} />
              <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #E5E2DA', fontSize: 12 }} />
              <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
              <Area type="monotone" dataKey="matured" stroke="#963347" fill="url(#maturedGrad)" strokeWidth={2} name="Matured" />
              <Area type="monotone" dataKey="renewed" stroke="#172B46" fill="url(#renewedGrad)" strokeWidth={2} name="Renewed" />
              <Area type="monotone" dataKey="released" stroke="#16a34a" fill="#16a34a20" strokeWidth={2} name="Released" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Verification Status Pie */}
        <div className="card" style={{ padding: 20 }}>
          <div style={{ marginBottom: 16 }}>
            <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: '#172B46' }}>Verification Status</h3>
            <p style={{ margin: '4px 0 0', fontSize: 12, color: '#9ca3af' }}>FDR verification distribution</p>
          </div>
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie data={VERIFICATION_STATUS_DATA} cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={3} dataKey="value">
                {VERIFICATION_STATUS_DATA.map((entry, idx) => (
                  <Cell key={idx} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {VERIFICATION_STATUS_DATA.map(d => (
              <div key={d.name} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12 }}>
                <div style={{ width: 10, height: 10, borderRadius: 2, background: d.color, flexShrink: 0 }} />
                <span style={{ color: '#374151', flex: 1 }}>{d.name}</span>
                <span style={{ fontWeight: 700, color: '#172B46' }}>{d.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bank distribution + Critical Alerts */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
        {/* Bank-wise distribution */}
        <div className="card" style={{ padding: 20 }}>
          <div style={{ marginBottom: 16 }}>
            <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: '#172B46' }}>Bank-wise FDR Count</h3>
            <p style={{ margin: '4px 0 0', fontSize: 12, color: '#9ca3af' }}>FDR distribution across banks</p>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={BANK_DISTRIBUTION_DATA} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
              <XAxis type="number" fontSize={11} tick={{ fill: '#9ca3af' }} />
              <YAxis type="category" dataKey="bank" fontSize={11} tick={{ fill: '#374151' }} width={50} />
              <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12 }} />
              <Bar dataKey="fdrs" fill="#172B46" radius={[0, 4, 4, 0]} name="FDRs" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Critical Alerts */}
        <div className="card" style={{ padding: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <div>
              <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: '#172B46' }}>Critical Alerts</h3>
              <p style={{ margin: '4px 0 0', fontSize: 12, color: '#9ca3af' }}>Immediate action required</p>
            </div>
            <span className="badge badge-red">{criticalFDRs.length} Critical</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {criticalFDRs.map(fdr => (
              <div
                key={fdr.id}
                onClick={() => navigate(`/fdrs`)}
                style={{
                  padding: '12px 14px',
                  background: '#fef2f2',
                  borderRadius: 10,
                  border: '1px solid #fee2e2',
                  cursor: 'pointer',
                  transition: 'background 0.15s',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                  <AlertCircle size={16} color="#dc2626" style={{ marginTop: 1, flexShrink: 0 }} />
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#172B46' }}>{fdr.fdrNumber}</div>
                    <div style={{ fontSize: 12, color: '#dc2626', fontWeight: 500 }}>{fdr.institutionName}</div>
                    {fdr.remarks && <div style={{ fontSize: 11, color: '#6b7280', marginTop: 3 }}>{fdr.remarks.substring(0, 70)}...</div>}
                    <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 2 }}>
                      {getDaysToMaturity(fdr.maturityDate) > 0
                        ? `${getDaysToMaturity(fdr.maturityDate)} days to maturity`
                        : `Matured ${Math.abs(getDaysToMaturity(fdr.maturityDate))} days ago`}
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {criticalFDRs.length === 0 && (
              <div style={{ textAlign: 'center', padding: 32, color: '#16a34a', fontSize: 13 }}>
                <CheckCircle size={24} style={{ marginBottom: 8 }} />
                <div>No critical alerts</div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions + Recent Activity */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 16, marginBottom: 16 }}>
        {/* Quick Actions */}
        <div className="card" style={{ padding: 20 }}>
          <h3 style={{ margin: '0 0 16px', fontSize: 15, fontWeight: 700, color: '#172B46' }}>Quick Actions</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {isAdmin && (
              <button onClick={() => navigate('/institutions')} className="btn-secondary" style={{ justifyContent: 'flex-start', width: '100%' }}>
                <Building2 size={16} /> Add Institution
              </button>
            )}
            <button onClick={() => navigate('/fdrs')} className="btn-secondary" style={{ justifyContent: 'flex-start', width: '100%' }}>
              <Upload size={16} /> Upload FDR
            </button>
            {(isAdmin || currentUser?.role === 'verification_officer') && (
              <button onClick={() => navigate('/sentinel')} className="btn-secondary" style={{ justifyContent: 'flex-start', width: '100%' }}>
                <Shield size={16} /> Verify FDR (Sentinel)
              </button>
            )}
            <button onClick={() => navigate('/fdrs')} className="btn-secondary" style={{ justifyContent: 'flex-start', width: '100%' }}>
              <RefreshCw size={16} /> Review Renewals
            </button>
            <button onClick={() => navigate('/reports')} className="btn-secondary" style={{ justifyContent: 'flex-start', width: '100%' }}>
              <BarChart3 size={16} /> View Reports
            </button>
            {isAdmin && (
              <button onClick={() => navigate('/risk-radar')} className="btn-secondary" style={{ justifyContent: 'flex-start', width: '100%' }}>
                <Activity size={16} /> Risk Assessment
              </button>
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="card" style={{ padding: 20 }}>
          <h3 style={{ margin: '0 0 16px', fontSize: 15, fontWeight: 700, color: '#172B46' }}>Recent Activity</h3>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {MOCK_AUDIT_EVENTS.slice(0, 6).map(event => (
              <div key={event.id} className="timeline-item">
                <div style={{
                  width: 10, height: 10, borderRadius: '50%', marginTop: 5, flexShrink: 0,
                  background: event.severity === 'critical' ? '#dc2626' : event.severity === 'warning' ? '#d97706' : '#16a34a',
                }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: '#172B46' }}>{event.action}</span>
                    <span style={{ fontSize: 11, color: '#9ca3af', whiteSpace: 'nowrap' }}>{getTimeAgo(event.timestamp)}</span>
                  </div>
                  <div style={{ fontSize: 12, color: '#6b7280' }}>
                    <span style={{ fontWeight: 500 }}>{event.userName}</span> · {event.entityName}
                  </div>
                  {event.remarks && (
                    <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {event.remarks}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
          <button onClick={() => navigate('/evidence-vault')} className="btn-ghost" style={{ marginTop: 8, fontSize: 13 }}>
            View full audit trail →
          </button>
        </div>
      </div>

      {/* Pending Actions Table */}
      <div className="card" style={{ padding: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <div>
            <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: '#172B46' }}>Priority Action Queue</h3>
            <p style={{ margin: '4px 0 0', fontSize: 12, color: '#9ca3af' }}>FDRs requiring immediate attention</p>
          </div>
          <button onClick={() => navigate('/fdrs')} className="btn-outline" style={{ fontSize: 12 }}>
            View All FDRs
          </button>
        </div>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>FDR Number</th>
                <th>Institution</th>
                <th>Bank</th>
                <th>Amount</th>
                <th>Maturity</th>
                <th>Status</th>
                <th>Risk</th>
              </tr>
            </thead>
            <tbody>
              {myFDRs
                .filter(f => ['expiring_soon', 'renewal_pending', 'pending_verification', 'matured'].includes(f.lifecycleStatus))
                .sort((a, b) => b.riskScore - a.riskScore)
                .slice(0, 6)
                .map(fdr => {
                  const days = getDaysToMaturity(fdr.maturityDate);
                  return (
                    <tr key={fdr.id} style={{ cursor: 'pointer' }} onClick={() => navigate('/fdrs')}>
                      <td style={{ fontFamily: 'monospace', fontSize: 12, fontWeight: 600, color: '#172B46' }}>{fdr.fdrNumber}</td>
                      <td style={{ fontSize: 13 }}>{fdr.institutionName}</td>
                      <td style={{ fontSize: 12, color: '#6b7280' }}>{fdr.bankName}</td>
                      <td style={{ fontSize: 13, fontWeight: 600 }}>{formatCurrency(fdr.amount)}</td>
                      <td style={{ fontSize: 12, color: days <= 30 ? '#dc2626' : '#6b7280', fontWeight: days <= 30 ? 600 : 400 }}>
                        {days > 0 ? `${days}d left` : `${Math.abs(days)}d ago`}
                      </td>
                      <td><span className={getFDRStatusBadgeClass(fdr.lifecycleStatus)}>{getFDRStatusLabel(fdr.lifecycleStatus)}</span></td>
                      <td>
                        <span className={`badge risk-${fdr.riskLevel}`} style={{ padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600 }}>
                          {fdr.riskLevel.toUpperCase()}
                        </span>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
