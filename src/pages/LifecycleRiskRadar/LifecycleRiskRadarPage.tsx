import React, { useState } from 'react';
import { Radar, AlertTriangle, Clock, CheckCircle, AlertCircle, TrendingUp, Zap } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { getDaysToMaturity, formatCurrency, formatDate } from '../../utils';
import type { FDR } from '../../types';
import { RadarChart, PolarGrid, PolarAngleAxis, Radar as RadarShape, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

function calculateRiskScore(fdr: FDR): { score: number; factors: { factor: string; score: number; desc: string }[] } {
  const factors: { factor: string; score: number; desc: string }[] = [];
  let total = 0;

  const days = getDaysToMaturity(fdr.maturityDate);

  // Maturity proximity
  if (days < 0) { factors.push({ factor: 'Maturity Overdue', score: 30, desc: `Matured ${Math.abs(days)} days ago` }); total += 30; }
  else if (days <= 7) { factors.push({ factor: 'Critical Maturity', score: 25, desc: `${days} days remaining` }); total += 25; }
  else if (days <= 30) { factors.push({ factor: 'Near Maturity', score: 18, desc: `${days} days remaining` }); total += 18; }
  else if (days <= 90) { factors.push({ factor: 'Approaching Maturity', score: 8, desc: `${days} days remaining` }); total += 8; }
  else { factors.push({ factor: 'Maturity Timeline', score: 2, desc: `${days} days remaining - comfortable` }); total += 2; }

  // Verification status
  if (fdr.verificationStatus === 'discrepancy_found') { factors.push({ factor: 'Document Discrepancy', score: 30, desc: 'Critical discrepancy flagged' }); total += 30; }
  else if (fdr.verificationStatus === 'not_started') { factors.push({ factor: 'Unverified Document', score: 20, desc: 'Verification not initiated' }); total += 20; }
  else if (fdr.verificationStatus === 'in_progress') { factors.push({ factor: 'Pending Verification', score: 10, desc: 'Verification in progress' }); total += 10; }
  else { factors.push({ factor: 'Verification Status', score: 0, desc: 'Verified - no issue' }); }

  // Lifecycle status
  if (fdr.lifecycleStatus === 'renewal_pending') { factors.push({ factor: 'Renewal Pending', score: 20, desc: 'Renewal awaiting approval' }); total += 20; }
  else if (fdr.lifecycleStatus === 'matured') { factors.push({ factor: 'Matured Pending Action', score: 15, desc: 'No release request submitted' }); total += 15; }

  // Renewal history
  if (fdr.renewalCount > 2) { factors.push({ factor: 'Multiple Renewals', score: 10, desc: `${fdr.renewalCount} renewals indicate repeated delays` }); total += 10; }

  return { score: Math.min(100, total), factors };
}

function RiskGauge({ score }: { score: number }) {
  const color = score >= 80 ? '#dc2626' : score >= 60 ? '#ea580c' : score >= 40 ? '#d97706' : '#16a34a';
  const label = score >= 80 ? 'CRITICAL' : score >= 60 ? 'HIGH' : score >= 40 ? 'MEDIUM' : 'LOW';
  const angle = (score / 100) * 180 - 90;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <svg width="140" height="80" viewBox="0 0 140 80">
        {/* Background arc */}
        <path d="M 10 75 A 60 60 0 0 1 130 75" fill="none" stroke="#E5E2DA" strokeWidth="12" strokeLinecap="round" />
        {/* Colored arc */}
        <path d="M 10 75 A 60 60 0 0 1 130 75" fill="none" stroke={color} strokeWidth="12" strokeLinecap="round"
          strokeDasharray={`${score * 1.885} 188.5`} />
        {/* Needle */}
        <line x1="70" y1="75" x2={70 + 50 * Math.cos((angle - 90) * Math.PI / 180)} y2={75 + 50 * Math.sin((angle - 90) * Math.PI / 180)}
          stroke="#172B46" strokeWidth="2" strokeLinecap="round" />
        <circle cx="70" cy="75" r="4" fill="#172B46" />
        <text x="70" y="40" textAnchor="middle" fontSize="18" fontWeight="800" fill={color}>{score}</text>
        <text x="70" y="55" textAnchor="middle" fontSize="10" fill="#9ca3af">/100</text>
      </svg>
      <div style={{ fontSize: 14, fontWeight: 800, color, marginTop: -4 }}>{label} RISK</div>
    </div>
  );
}

const RADAR_FIELDS = ['Maturity', 'Verification', 'Renewal', 'Compliance', 'Documentation', 'Lifecycle'];

export default function LifecycleRiskRadarPage() {
  const { fdrs } = useApp();
  const [selectedFDRId, setSelectedFDRId] = useState(fdrs[0]?.id || '');
  const [simulatorDays, setSimulatorDays] = useState(15);

  const selectedFDR = fdrs.find(f => f.id === selectedFDRId);
  const assessment = selectedFDR ? calculateRiskScore(selectedFDR) : null;

  // Sort by risk
  const sortedByRisk = [...fdrs].sort((a, b) => b.riskScore - a.riskScore);
  const criticalCount = fdrs.filter(f => f.riskLevel === 'critical').length;
  const highCount = fdrs.filter(f => f.riskLevel === 'high').length;

  // Simulator
  const expiringInDays = fdrs.filter(f => {
    const days = getDaysToMaturity(f.maturityDate);
    return days >= 0 && days <= simulatorDays;
  });

  const radarData = selectedFDR ? [
    { field: 'Maturity', A: Math.max(0, 100 - getDaysToMaturity(selectedFDR.maturityDate)) },
    { field: 'Verification', A: selectedFDR.verificationStatus === 'discrepancy_found' ? 90 : selectedFDR.verificationStatus === 'not_started' ? 70 : 10 },
    { field: 'Renewal', A: selectedFDR.lifecycleStatus === 'renewal_pending' ? 80 : selectedFDR.renewalCount * 15 },
    { field: 'Compliance', A: selectedFDR.riskScore * 0.7 },
    { field: 'Documentation', A: selectedFDR.documentHash ? 10 : 60 },
    { field: 'Lifecycle', A: ['matured', 'release_requested'].includes(selectedFDR.lifecycleStatus) ? 70 : 20 },
  ] : [];

  return (
    <div className="page-container animate-fade-in">
      {/* Header */}
      <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 24 }}>
        <div style={{ width: 40, height: 40, background: '#1e40af', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Radar size={22} color="white" />
        </div>
        <div>
          <h1 className="section-title">Lifecycle Risk Radar</h1>
          <p className="section-subtitle">Predictive Compliance Intelligence · Feature 4 of 5</p>
        </div>
      </div>

      <div style={{ background: '#dbeafe', border: '1px solid #93c5fd', borderRadius: 10, padding: '10px 16px', marginBottom: 20, fontSize: 12, color: '#1e40af' }}>
        <strong>Transparency Note:</strong> Risk scores are calculated using transparent rule-based logic.
        Factors shown include maturity timeline, verification status, renewal history, and lifecycle stage. This is NOT a trained AI model prediction.
      </div>

      {/* Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 20 }}>
        {[
          { label: 'Critical Risk', value: criticalCount, color: '#dc2626', icon: <AlertCircle size={18} /> },
          { label: 'High Risk', value: highCount, color: '#ea580c', icon: <AlertTriangle size={18} /> },
          { label: 'Medium Risk', value: fdrs.filter(f => f.riskLevel === 'medium').length, color: '#d97706', icon: <Clock size={18} /> },
          { label: 'Low Risk', value: fdrs.filter(f => f.riskLevel === 'low').length, color: '#16a34a', icon: <CheckCircle size={18} /> },
        ].map(stat => (
          <div key={stat.label} className="stat-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <div style={{ fontSize: 11, color: '#9ca3af', fontWeight: 600, textTransform: 'uppercase' }}>{stat.label}</div>
              <div style={{ color: stat.color }}>{stat.icon}</div>
            </div>
            <div style={{ fontSize: 32, fontWeight: 800, color: stat.color }}>{stat.value}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
        {/* Risk Assessment Detail */}
        <div className="card" style={{ padding: 20 }}>
          <h3 style={{ margin: '0 0 14px', fontSize: 15, fontWeight: 700, color: '#172B46' }}>FDR Risk Assessment</h3>
          <div style={{ marginBottom: 14 }}>
            <label className="form-label">Select FDR</label>
            <select className="form-input" value={selectedFDRId} onChange={e => setSelectedFDRId(e.target.value)}>
              {fdrs.map(f => <option key={f.id} value={f.id}>{f.fdrNumber} ({f.riskLevel.toUpperCase()})</option>)}
            </select>
          </div>

          {assessment && selectedFDR && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
                <RiskGauge score={assessment.score} />
              </div>

              <div style={{ fontSize: 13, fontWeight: 700, color: '#172B46', marginBottom: 10 }}>Risk Factors Breakdown:</div>
              {assessment.factors.filter(f => f.score > 0).map(factor => (
                <div key={factor.factor} style={{ marginBottom: 10 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ fontSize: 12, color: '#374151' }}>{factor.factor}</span>
                    <span style={{ fontSize: 12, fontWeight: 700, color: factor.score > 15 ? '#dc2626' : factor.score > 8 ? '#d97706' : '#374151' }}>+{factor.score}</span>
                  </div>
                  <div style={{ height: 6, background: '#f3f4f6', borderRadius: 3 }}>
                    <div style={{
                      height: '100%', borderRadius: 3,
                      width: `${(factor.score / 30) * 100}%`,
                      background: factor.score > 15 ? '#dc2626' : factor.score > 8 ? '#d97706' : '#16a34a',
                    }} />
                  </div>
                  <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 2 }}>{factor.desc}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Radar Chart */}
        <div className="card" style={{ padding: 20 }}>
          <h3 style={{ margin: '0 0 14px', fontSize: 15, fontWeight: 700, color: '#172B46' }}>Risk Dimension Radar</h3>
          {radarData.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="#E5E2DA" />
                <PolarAngleAxis dataKey="field" fontSize={11} tick={{ fill: '#374151' }} />
                <RadarShape dataKey="A" stroke="#963347" fill="#963347" fillOpacity={0.2} strokeWidth={2} name="Risk" />
              </RadarChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ height: 280, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af' }}>Select an FDR to view radar</div>
          )}
        </div>
      </div>

      {/* What-If Simulator */}
      <div className="card" style={{ padding: 20, marginBottom: 16, background: 'linear-gradient(135deg, #172B46 0%, #1e3a5f 100%)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
          <Zap size={20} color="#D97732" />
          <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: 'white' }}>What-If Compliance Simulator</h3>
        </div>
        <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', marginBottom: 16 }}>
          What happens if all FDRs maturing within the next <strong style={{ color: '#D97732' }}>{simulatorDays} days</strong> are not renewed?
        </p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
          <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)' }}>Days: {simulatorDays}</span>
          <input type="range" min={7} max={90} value={simulatorDays} onChange={e => setSimulatorDays(Number(e.target.value))}
            style={{ flex: 1, accentColor: '#963347' }} />
          <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)' }}>90d</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12 }}>
          {[
            { label: 'FDRs Affected', value: expiringInDays.length, color: '#dc2626' },
            { label: 'Institutions Affected', value: new Set(expiringInDays.map(f => f.institutionId)).size, color: '#d97706' },
            { label: 'Total Value at Risk', value: formatCurrency(expiringInDays.reduce((s, f) => s + f.amount, 0)), color: '#D97732' },
            { label: 'Compliance Impact', value: expiringInDays.length > 3 ? 'HIGH' : expiringInDays.length > 1 ? 'MEDIUM' : 'LOW', color: expiringInDays.length > 3 ? '#dc2626' : '#d97706' },
          ].map(stat => (
            <div key={stat.label} style={{ background: 'rgba(255,255,255,0.08)', borderRadius: 10, padding: '14px 16px', border: '1px solid rgba(255,255,255,0.1)' }}>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', fontWeight: 600, textTransform: 'uppercase', marginBottom: 6 }}>{stat.label}</div>
              <div style={{ fontSize: 24, fontWeight: 800, color: stat.color }}>{stat.value}</div>
            </div>
          ))}
        </div>
        {expiringInDays.length > 0 && (
          <div style={{ marginTop: 14, background: 'rgba(220,38,38,0.2)', border: '1px solid rgba(220,38,38,0.3)', borderRadius: 8, padding: '10px 14px' }}>
            <div style={{ fontSize: 12, color: '#fca5a5', fontWeight: 600, marginBottom: 4 }}>Recommended Preventive Actions:</div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', lineHeight: 1.6 }}>
              1. Immediately notify institutions with expiring FDRs<br />
              2. Issue formal renewal reminders within 7 days<br />
              3. Schedule verification officer assignments<br />
              4. Escalate critical cases to Executive Authority if unresponded
            </div>
          </div>
        )}
      </div>

      {/* Priority Action Queue */}
      <div className="card" style={{ padding: 20 }}>
        <h3 style={{ margin: '0 0 16px', fontSize: 15, fontWeight: 700, color: '#172B46' }}>Priority Action Queue (Sorted by Risk Score)</h3>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>FDR Number</th>
                <th>Institution</th>
                <th>Risk Score</th>
                <th>Risk Level</th>
                <th>Primary Factor</th>
                <th>Days to Maturity</th>
                <th>Recommended Action</th>
              </tr>
            </thead>
            <tbody>
              {sortedByRisk.map((fdr, idx) => {
                const days = getDaysToMaturity(fdr.maturityDate);
                const riskColor = { low: '#16a34a', medium: '#d97706', high: '#ea580c', critical: '#dc2626' }[fdr.riskLevel];
                return (
                  <tr key={fdr.id}>
                    <td style={{ fontSize: 13, fontWeight: 700, color: idx < 3 ? '#dc2626' : '#374151' }}>#{idx + 1}</td>
                    <td style={{ fontFamily: 'monospace', fontSize: 12, color: '#172B46', fontWeight: 600 }}>{fdr.fdrNumber}</td>
                    <td style={{ fontSize: 12 }}>{fdr.institutionName}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ width: 50, height: 6, background: '#f3f4f6', borderRadius: 3 }}>
                          <div style={{ width: `${fdr.riskScore}%`, height: '100%', background: riskColor, borderRadius: 3 }} />
                        </div>
                        <span style={{ fontSize: 12, fontWeight: 700, color: riskColor }}>{fdr.riskScore}</span>
                      </div>
                    </td>
                    <td>
                      <span style={{ background: `${riskColor}20`, color: riskColor, fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20 }}>
                        {fdr.riskLevel.toUpperCase()}
                      </span>
                    </td>
                    <td style={{ fontSize: 12, color: '#6b7280' }}>
                      {fdr.verificationStatus === 'discrepancy_found' ? '⚠️ Discrepancy' :
                        fdr.lifecycleStatus === 'renewal_pending' ? '🔄 Renewal Pending' :
                        days <= 30 ? '⏰ Maturity Near' : '—'}
                    </td>
                    <td style={{ fontSize: 12, color: days <= 15 ? '#dc2626' : '#6b7280', fontWeight: days <= 15 ? 700 : 400 }}>
                      {days > 0 ? `${days}d left` : `${Math.abs(days)}d ago`}
                    </td>
                    <td style={{ fontSize: 12, color: '#963347', fontWeight: 500, maxWidth: 180 }}>
                      {fdr.riskLevel === 'critical' ? 'Immediate action required' :
                        fdr.riskLevel === 'high' ? 'Review within 3 days' :
                        fdr.riskLevel === 'medium' ? 'Monitor closely' : 'No action needed'}
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
