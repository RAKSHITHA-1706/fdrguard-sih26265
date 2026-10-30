import React, { useState } from 'react';
import { BarChart3, Download, Filter, Calendar } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, AreaChart, Area
} from 'recharts';
import {
  formatCurrency, formatDate, getFDRStatusLabel, getVerificationStatusLabel,
  getDaysToMaturity, exportToCSV
} from '../../utils';
import { BANK_DISTRIBUTION_DATA, MONTHLY_MATURITY_DATA, MOCK_SECURITY_EVENTS } from '../../data/mockData';

const COLORS = ['#172B46', '#963347', '#D97732', '#16a34a', '#2563eb', '#7c3aed', '#dc2626', '#6b7280'];

const REPORT_TYPES = [
  'Institution-wise FDR Report',
  'Bank-wise FDR Distribution',
  'Active & Matured FDR Report',
  'Upcoming Maturity Report',
  'Renewal Tracking Report',
  'Pending Verification Report',
  'Compliance Report',
  'Security Incident Report',
  'Audit Activity Report',
];

export default function ReportsPage() {
  const { fdrs, institutions } = useApp();
  const [activeReport, setActiveReport] = useState(0);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [institutionFilter, setInstitutionFilter] = useState('all');

  const filteredFDRs = fdrs.filter(fdr => {
    const matchInst = institutionFilter === 'all' || fdr.institutionId === institutionFilter;
    const matchFrom = !dateFrom || new Date(fdr.issueDate) >= new Date(dateFrom);
    const matchTo = !dateTo || new Date(fdr.issueDate) <= new Date(dateTo);
    return matchInst && matchFrom && matchTo;
  });

  // Institution-wise data
  const instData = institutions.map(inst => ({
    name: inst.shortName,
    total: filteredFDRs.filter(f => f.institutionId === inst.id).length,
    active: filteredFDRs.filter(f => f.institutionId === inst.id && f.lifecycleStatus === 'active').length,
    expiring: filteredFDRs.filter(f => f.institutionId === inst.id && f.lifecycleStatus === 'expiring_soon').length,
  })).filter(d => d.total > 0);

  // Status distribution
  const statusData = [
    { name: 'Active', value: filteredFDRs.filter(f => f.lifecycleStatus === 'active').length },
    { name: 'Expiring', value: filteredFDRs.filter(f => f.lifecycleStatus === 'expiring_soon').length },
    { name: 'Matured', value: filteredFDRs.filter(f => f.lifecycleStatus === 'matured').length },
    { name: 'Pending Verification', value: filteredFDRs.filter(f => f.lifecycleStatus === 'pending_verification').length },
    { name: 'Renewal Pending', value: filteredFDRs.filter(f => f.lifecycleStatus === 'renewal_pending').length },
    { name: 'Submitted', value: filteredFDRs.filter(f => f.lifecycleStatus === 'submitted').length },
  ].filter(d => d.value > 0);

  const handleExport = () => {
    const data = filteredFDRs.map(f => ({
      FDRNumber: f.fdrNumber,
      Institution: f.institutionName,
      Bank: f.bankName,
      Amount: f.amount,
      IssueDate: f.issueDate,
      MaturityDate: f.maturityDate,
      Status: getFDRStatusLabel(f.lifecycleStatus),
      Verification: getVerificationStatusLabel(f.verificationStatus),
      RiskLevel: f.riskLevel,
      DaysToMaturity: getDaysToMaturity(f.maturityDate),
    }));
    exportToCSV(data, `fdrguard_${REPORT_TYPES[activeReport].toLowerCase().replace(/\s+/g, '_')}`);
  };

  const renderReport = () => {
    switch (activeReport) {
      case 0: // Institution-wise
        return (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
              <div className="card" style={{ padding: 20 }}>
                <h3 style={{ margin: '0 0 14px', fontSize: 14, fontWeight: 700, color: '#172B46' }}>Institution FDR Count</h3>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={instData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="name" fontSize={11} tick={{ fill: '#9ca3af' }} />
                    <YAxis fontSize={11} tick={{ fill: '#9ca3af' }} />
                    <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12 }} />
                    <Legend wrapperStyle={{ fontSize: 12 }} />
                    <Bar dataKey="total" fill="#172B46" radius={[4, 4, 0, 0]} name="Total" />
                    <Bar dataKey="active" fill="#16a34a" radius={[4, 4, 0, 0]} name="Active" />
                    <Bar dataKey="expiring" fill="#d97706" radius={[4, 4, 0, 0]} name="Expiring" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="card" style={{ padding: 20 }}>
                <h3 style={{ margin: '0 0 14px', fontSize: 14, fontWeight: 700, color: '#172B46' }}>Compliance Scores</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {institutions.map(inst => (
                    <div key={inst.id}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
                        <span style={{ color: '#374151', fontWeight: 500 }}>{inst.shortName}</span>
                        <span style={{ fontWeight: 700, color: inst.complianceScore >= 80 ? '#16a34a' : inst.complianceScore >= 60 ? '#d97706' : '#dc2626' }}>
                          {inst.complianceScore}%
                        </span>
                      </div>
                      <div style={{ height: 6, background: '#f3f4f6', borderRadius: 3 }}>
                        <div style={{
                          height: '100%', borderRadius: 3, width: `${inst.complianceScore}%`,
                          background: inst.complianceScore >= 80 ? '#16a34a' : inst.complianceScore >= 60 ? '#d97706' : '#dc2626',
                        }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="card">
              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>Institution</th>
                      <th>Institution Code</th>
                      <th>State</th>
                      <th>Total FDRs</th>
                      <th>Active</th>
                      <th>Expiring</th>
                      <th>Matured</th>
                      <th>Pending</th>
                      <th>Compliance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {institutions.map(inst => (
                      <tr key={inst.id}>
                        <td style={{ fontWeight: 600, fontSize: 13 }}>{inst.name}</td>
                        <td style={{ fontSize: 12, color: '#6b7280' }}>{inst.code}</td>
                        <td style={{ fontSize: 12 }}>{inst.state}</td>
                        <td style={{ fontSize: 13, fontWeight: 700 }}>{inst.totalFDRs}</td>
                        <td style={{ fontSize: 13, color: '#16a34a', fontWeight: 600 }}>{inst.activeFDRs}</td>
                        <td style={{ fontSize: 13, color: '#d97706', fontWeight: 600 }}>{fdrs.filter(f => f.institutionId === inst.id && f.lifecycleStatus === 'expiring_soon').length}</td>
                        <td style={{ fontSize: 13, color: '#6b7280', fontWeight: 600 }}>{inst.expiredFDRs}</td>
                        <td style={{ fontSize: 13, color: '#9333ea', fontWeight: 600 }}>{inst.pendingVerification}</td>
                        <td>
                          <span style={{
                            fontSize: 12, fontWeight: 700,
                            color: inst.complianceScore >= 80 ? '#16a34a' : inst.complianceScore >= 60 ? '#d97706' : '#dc2626',
                          }}>{inst.complianceScore}%</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );

      case 1: // Bank-wise
        return (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16 }}>
              <div className="card" style={{ padding: 20 }}>
                <h3 style={{ margin: '0 0 14px', fontSize: 14, fontWeight: 700, color: '#172B46' }}>Bank-wise FDR Distribution</h3>
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={BANK_DISTRIBUTION_DATA}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="bank" fontSize={11} tick={{ fill: '#9ca3af' }} />
                    <YAxis fontSize={11} tick={{ fill: '#9ca3af' }} />
                    <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12 }} />
                    <Bar dataKey="fdrs" fill="#172B46" radius={[4, 4, 0, 0]} name="FDR Count" />
                    <Bar dataKey="amount" fill="#963347" radius={[4, 4, 0, 0]} name="Amount (Cr)" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="card" style={{ padding: 20 }}>
                <h3 style={{ margin: '0 0 14px', fontSize: 14, fontWeight: 700, color: '#172B46' }}>Bank Share</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie data={BANK_DISTRIBUTION_DATA} cx="50%" cy="50%" outerRadius={80} dataKey="fdrs">
                      {BANK_DISTRIBUTION_DATA.map((_, idx) => <Cell key={idx} fill={COLORS[idx % COLORS.length]} />)}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12 }} />
                  </PieChart>
                </ResponsiveContainer>
                {BANK_DISTRIBUTION_DATA.map((d, idx) => (
                  <div key={d.bank} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, marginBottom: 4 }}>
                    <div style={{ width: 10, height: 10, borderRadius: 2, background: COLORS[idx % COLORS.length] }} />
                    <span style={{ flex: 1 }}>{d.bank}</span>
                    <span style={{ fontWeight: 700 }}>{d.fdrs}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 2: // Active & Matured
        return (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
              <div className="card" style={{ padding: 20 }}>
                <h3 style={{ margin: '0 0 14px', fontSize: 14, fontWeight: 700, color: '#172B46' }}>FDR Status Distribution</h3>
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie data={statusData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} dataKey="value">
                      {statusData.map((_, idx) => <Cell key={idx} fill={COLORS[idx % COLORS.length]} />)}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12 }} />
                    <Legend wrapperStyle={{ fontSize: 12 }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="card" style={{ padding: 20 }}>
                <h3 style={{ margin: '0 0 14px', fontSize: 14, fontWeight: 700, color: '#172B46' }}>Monthly Trend</h3>
                <ResponsiveContainer width="100%" height={220}>
                  <AreaChart data={MONTHLY_MATURITY_DATA}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="month" fontSize={11} tick={{ fill: '#9ca3af' }} />
                    <YAxis fontSize={11} tick={{ fill: '#9ca3af' }} />
                    <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12 }} />
                    <Area type="monotone" dataKey="matured" stroke="#963347" fill="#96334720" strokeWidth={2} name="Matured" />
                    <Area type="monotone" dataKey="renewed" stroke="#172B46" fill="#172B4620" strokeWidth={2} name="Renewed" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="card">
              <div className="table-container">
                <table>
                  <thead>
                    <tr><th>FDR Number</th><th>Institution</th><th>Bank</th><th>Amount</th><th>Maturity Date</th><th>Status</th></tr>
                  </thead>
                  <tbody>
                    {filteredFDRs.filter(f => ['active', 'matured'].includes(f.lifecycleStatus)).map(fdr => (
                      <tr key={fdr.id}>
                        <td style={{ fontFamily: 'monospace', fontSize: 12, fontWeight: 600 }}>{fdr.fdrNumber}</td>
                        <td style={{ fontSize: 13 }}>{fdr.institutionName}</td>
                        <td style={{ fontSize: 12, color: '#6b7280' }}>{fdr.bankName}</td>
                        <td style={{ fontSize: 13, fontWeight: 600 }}>{formatCurrency(fdr.amount)}</td>
                        <td style={{ fontSize: 12 }}>{formatDate(fdr.maturityDate)}</td>
                        <td><span className={`badge badge-${fdr.lifecycleStatus === 'active' ? 'green' : 'grey'}`}>{getFDRStatusLabel(fdr.lifecycleStatus)}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );

      case 7: // Security
        return (
          <div className="card">
            <div className="table-container">
              <table>
                <thead>
                  <tr><th>Event</th><th>User</th><th>IP</th><th>Severity</th><th>Status</th><th>Date</th></tr>
                </thead>
                <tbody>
                  {MOCK_SECURITY_EVENTS.map(e => (
                    <tr key={e.id}>
                      <td style={{ fontSize: 12, fontWeight: 600 }}>{e.eventType.replace(/_/g, ' ')}</td>
                      <td style={{ fontSize: 12 }}>{e.userName || 'Unknown'}</td>
                      <td style={{ fontSize: 11, fontFamily: 'monospace', color: '#6b7280' }}>{e.ipAddress}</td>
                      <td><span className={`badge badge-${e.severity === 'critical' ? 'red' : e.severity === 'high' ? 'red' : 'amber'}`}>{e.severity}</span></td>
                      <td><span className={`badge badge-${e.status === 'resolved' ? 'green' : e.status === 'open' ? 'red' : 'amber'}`}>{e.status}</span></td>
                      <td style={{ fontSize: 12, color: '#6b7280' }}>{formatDate(e.timestamp)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );

      default:
        return (
          <div className="card">
            <div className="table-container">
              <table>
                <thead>
                  <tr><th>FDR Number</th><th>Institution</th><th>Bank</th><th>Amount</th><th>Issue Date</th><th>Maturity</th><th>Days Left</th><th>Status</th><th>Verification</th></tr>
                </thead>
                <tbody>
                  {filteredFDRs.map(fdr => {
                    const days = getDaysToMaturity(fdr.maturityDate);
                    return (
                      <tr key={fdr.id}>
                        <td style={{ fontFamily: 'monospace', fontSize: 12, fontWeight: 600 }}>{fdr.fdrNumber}</td>
                        <td style={{ fontSize: 13 }}>{fdr.institutionName}</td>
                        <td style={{ fontSize: 12, color: '#6b7280' }}>{fdr.bankName}</td>
                        <td style={{ fontSize: 13, fontWeight: 600 }}>{formatCurrency(fdr.amount)}</td>
                        <td style={{ fontSize: 12 }}>{formatDate(fdr.issueDate)}</td>
                        <td style={{ fontSize: 12 }}>{formatDate(fdr.maturityDate)}</td>
                        <td style={{ fontSize: 12, color: days <= 30 ? '#dc2626' : '#6b7280', fontWeight: days <= 30 ? 700 : 400 }}>
                          {days > 0 ? `${days}d` : `${Math.abs(days)}d ago`}
                        </td>
                        <td><span className={`badge badge-${fdr.lifecycleStatus === 'active' ? 'green' : fdr.lifecycleStatus === 'expiring_soon' ? 'amber' : 'grey'}`}>{getFDRStatusLabel(fdr.lifecycleStatus)}</span></td>
                        <td><span className={`badge badge-${fdr.verificationStatus === 'verified' ? 'green' : fdr.verificationStatus === 'discrepancy_found' ? 'red' : 'grey'}`}>{getVerificationStatusLabel(fdr.verificationStatus)}</span></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="page-container animate-fade-in">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h1 className="section-title">Reports & Analytics</h1>
          <p className="section-subtitle">Generate, filter, and export FDRGuard reports</p>
        </div>
        <button className="btn-primary" onClick={handleExport}>
          <Download size={15} /> Export CSV
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr', gap: 16 }}>
        {/* Report selector */}
        <div className="card" style={{ padding: 16, height: 'fit-content' }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 12 }}>Report Types</div>
          {REPORT_TYPES.map((type, idx) => (
            <button
              key={idx}
              onClick={() => setActiveReport(idx)}
              style={{
                display: 'block', width: '100%', textAlign: 'left', padding: '9px 12px',
                borderRadius: 8, fontSize: 13, fontWeight: activeReport === idx ? 700 : 500,
                background: activeReport === idx ? '#172B46' : 'transparent',
                color: activeReport === idx ? 'white' : '#374151',
                border: 'none', cursor: 'pointer', marginBottom: 2, transition: 'all 0.2s',
              }}
            >
              {type}
            </button>
          ))}
        </div>

        {/* Report content */}
        <div>
          {/* Filters */}
          <div className="card" style={{ padding: '12px 16px', marginBottom: 16 }}>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
              <select className="form-input" value={institutionFilter} onChange={e => setInstitutionFilter(e.target.value)} style={{ flex: '1 1 180px' }}>
                <option value="all">All Institutions</option>
                {institutions.map(i => <option key={i.id} value={i.id}>{i.name}</option>)}
              </select>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Calendar size={14} color="#9ca3af" />
                <input type="date" className="form-input" value={dateFrom} onChange={e => setDateFrom(e.target.value)} style={{ flex: 1 }} placeholder="From" />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 12, color: '#9ca3af' }}>to</span>
                <input type="date" className="form-input" value={dateTo} onChange={e => setDateTo(e.target.value)} style={{ flex: 1 }} />
              </div>
            </div>
          </div>

          {/* Report title */}
          <div style={{ marginBottom: 16 }}>
            <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#172B46' }}>{REPORT_TYPES[activeReport]}</h2>
            <p style={{ margin: '4px 0 0', fontSize: 12, color: '#9ca3af' }}>
              {filteredFDRs.length} records · Generated {new Date().toLocaleString('en-IN')}
            </p>
          </div>

          {renderReport()}
        </div>
      </div>
    </div>
  );
}
