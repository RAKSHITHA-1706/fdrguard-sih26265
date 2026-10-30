import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Plus, Search, Filter, Download, Eye, CheckCircle, AlertTriangle,
  RefreshCw, Unlock, XCircle, FileText, Clock
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import Modal from '../../components/common/Modal';
import {
  getFDRStatusBadgeClass, getFDRStatusLabel,
  getVerificationStatusBadgeClass, getVerificationStatusLabel,
  formatCurrency, formatDate, getDaysToMaturity, generateId, exportToCSV
} from '../../utils';
import type { FDR, FDRStatus, VerificationStatus } from '../../types';
import { MOCK_INSTITUTIONS } from '../../data/mockData';

function AddFDRModal({ isOpen, onClose, onAdd }: { isOpen: boolean; onClose: () => void; onAdd: (fdr: FDR) => void }) {
  const { institutions, currentUser } = useApp();
  const [form, setForm] = useState({
    institutionId: institutions[0]?.id || '',
    fdrNumber: '',
    bankName: '',
    branchName: '',
    amount: '',
    issueDate: '',
    maturityDate: '',
    interestRate: '',
    remarks: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [uploading, setUploading] = useState(false);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.fdrNumber.trim()) e.fdrNumber = 'FDR number is required';
    if (!form.bankName.trim()) e.bankName = 'Bank name is required';
    if (!form.amount || isNaN(Number(form.amount)) || Number(form.amount) <= 0) e.amount = 'Valid amount required';
    if (!form.issueDate) e.issueDate = 'Issue date required';
    if (!form.maturityDate) e.maturityDate = 'Maturity date required';
    if (form.issueDate && form.maturityDate && new Date(form.maturityDate) <= new Date(form.issueDate)) {
      e.maturityDate = 'Maturity must be after issue date';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    setUploading(true);
    setTimeout(() => {
      const inst = institutions.find(i => i.id === form.institutionId);
      const newFDR: FDR = {
        id: generateId('fdr'),
        fdrNumber: form.fdrNumber,
        institutionId: form.institutionId,
        institutionName: inst?.name || '',
        bankName: form.bankName,
        branchName: form.branchName,
        amount: Number(form.amount),
        issueDate: form.issueDate,
        maturityDate: form.maturityDate,
        interestRate: Number(form.interestRate) || 6.5,
        verificationStatus: 'not_started',
        lifecycleStatus: 'submitted',
        submittedBy: currentUser?.name || 'User',
        submittedDate: new Date().toISOString().split('T')[0],
        renewalCount: 0,
        riskScore: 30,
        riskLevel: 'low',
        remarks: form.remarks,
        documentHash: `sha256:${Date.now().toString(16)}${Math.random().toString(16).substring(2, 10)}`,
      };
      onAdd(newFDR);
      setUploading(false);
      onClose();
    }, 1000);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Upload New FDR" maxWidth={700}
      footer={
        <>
          <button className="btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn-primary" onClick={handleSubmit} disabled={uploading}>
            {uploading ? <><div style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,0.4)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} /> Submitting...</> : <><Plus size={15} /> Submit FDR</>}
          </button>
        </>
      }
    >
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div style={{ gridColumn: 'span 2' }}>
          <label className="form-label">Institution *</label>
          <select className="form-input" value={form.institutionId} onChange={e => setForm(f => ({ ...f, institutionId: e.target.value }))}>
            {institutions.map(i => <option key={i.id} value={i.id}>{i.name}</option>)}
          </select>
        </div>
        <div>
          <label className="form-label">FDR Number *</label>
          <input className="form-input" placeholder="FDR/BANK/YEAR/NUMBER" value={form.fdrNumber}
            onChange={e => setForm(f => ({ ...f, fdrNumber: e.target.value }))}
            style={errors.fdrNumber ? { borderColor: '#dc2626' } : undefined} />
          {errors.fdrNumber && <div style={{ fontSize: 11, color: '#dc2626', marginTop: 3 }}>{errors.fdrNumber}</div>}
        </div>
        <div>
          <label className="form-label">Bank Name *</label>
          <input className="form-input" placeholder="State Bank of India" value={form.bankName}
            onChange={e => setForm(f => ({ ...f, bankName: e.target.value }))}
            style={errors.bankName ? { borderColor: '#dc2626' } : undefined} />
          {errors.bankName && <div style={{ fontSize: 11, color: '#dc2626', marginTop: 3 }}>{errors.bankName}</div>}
        </div>
        <div>
          <label className="form-label">Branch Name</label>
          <input className="form-input" placeholder="Main Branch, City" value={form.branchName}
            onChange={e => setForm(f => ({ ...f, branchName: e.target.value }))} />
        </div>
        <div>
          <label className="form-label">FDR Amount (₹) *</label>
          <input className="form-input" type="number" placeholder="5000000" value={form.amount}
            onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
            style={errors.amount ? { borderColor: '#dc2626' } : undefined} />
          {errors.amount && <div style={{ fontSize: 11, color: '#dc2626', marginTop: 3 }}>{errors.amount}</div>}
          {form.amount && !isNaN(Number(form.amount)) && (
            <div style={{ fontSize: 11, color: '#6b7280', marginTop: 3 }}>{formatCurrency(Number(form.amount))}</div>
          )}
        </div>
        <div>
          <label className="form-label">Issue Date *</label>
          <input className="form-input" type="date" value={form.issueDate}
            onChange={e => setForm(f => ({ ...f, issueDate: e.target.value }))}
            style={errors.issueDate ? { borderColor: '#dc2626' } : undefined} />
          {errors.issueDate && <div style={{ fontSize: 11, color: '#dc2626', marginTop: 3 }}>{errors.issueDate}</div>}
        </div>
        <div>
          <label className="form-label">Maturity Date *</label>
          <input className="form-input" type="date" value={form.maturityDate}
            onChange={e => setForm(f => ({ ...f, maturityDate: e.target.value }))}
            style={errors.maturityDate ? { borderColor: '#dc2626' } : undefined} />
          {errors.maturityDate && <div style={{ fontSize: 11, color: '#dc2626', marginTop: 3 }}>{errors.maturityDate}</div>}
        </div>
        <div>
          <label className="form-label">Interest Rate (%)</label>
          <input className="form-input" type="number" step="0.1" placeholder="6.5" value={form.interestRate}
            onChange={e => setForm(f => ({ ...f, interestRate: e.target.value }))} />
        </div>
        <div style={{ gridColumn: 'span 2' }}>
          <label className="form-label">FDR Document Upload</label>
          <div style={{ border: '2px dashed #E5E2DA', borderRadius: 10, padding: '20px', textAlign: 'center', background: '#fafafa', cursor: 'pointer' }}>
            <FileText size={28} color="#9ca3af" style={{ marginBottom: 8 }} />
            <div style={{ fontSize: 13, color: '#6b7280', marginBottom: 4 }}>Click to upload FDR document</div>
            <div style={{ fontSize: 11, color: '#9ca3af' }}>PDF, JPG, PNG (max 10 MB) · Official scanned deposit certificate</div>
          </div>
        </div>
        <div style={{ gridColumn: 'span 2' }}>
          <label className="form-label">Remarks</label>
          <textarea className="form-input" rows={2} placeholder="Any additional notes..." value={form.remarks}
            onChange={e => setForm(f => ({ ...f, remarks: e.target.value }))} />
        </div>
      </div>
    </Modal>
  );
}

function FDRDetailModal({ fdr, onClose, onStatusChange }: { fdr: FDR; onClose: () => void; onStatusChange: (id: string, status: FDRStatus, verStatus?: VerificationStatus) => void }) {
  const days = getDaysToMaturity(fdr.maturityDate);
  const lifeCycleSteps = [
    { key: 'submitted', label: 'Submitted' },
    { key: 'pending_verification', label: 'Pending Verification' },
    { key: 'verification_complete', label: 'Verified' },
    { key: 'active', label: 'Active' },
    { key: 'expiring_soon', label: 'Expiring Soon' },
    { key: 'renewal_pending', label: 'Renewal Pending' },
    { key: 'matured', label: 'Matured' },
    { key: 'release_requested', label: 'Release Requested' },
    { key: 'released', label: 'Released' },
  ];
  const currentIdx = lifeCycleSteps.findIndex(s => s.key === fdr.lifecycleStatus);

  return (
    <Modal isOpen={true} onClose={onClose} title={`FDR Details: ${fdr.fdrNumber}`} maxWidth={720}
      footer={
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {fdr.verificationStatus === 'not_started' && (
            <button className="btn-primary" style={{ fontSize: 12 }}
              onClick={() => { onStatusChange(fdr.id, 'pending_verification', 'in_progress'); onClose(); }}>
              <CheckCircle size={13} /> Start Verification
            </button>
          )}
          {fdr.verificationStatus === 'in_progress' && (
            <>
              <button className="btn-primary" style={{ fontSize: 12, background: '#16a34a' }}
                onClick={() => { onStatusChange(fdr.id, 'active', 'verified'); onClose(); }}>
                <CheckCircle size={13} /> Mark Verified
              </button>
              <button className="btn-primary" style={{ fontSize: 12, background: '#dc2626' }}
                onClick={() => { onStatusChange(fdr.id, fdr.lifecycleStatus, 'discrepancy_found'); onClose(); }}>
                <AlertTriangle size={13} /> Flag Discrepancy
              </button>
            </>
          )}
          {fdr.lifecycleStatus === 'active' && (
            <button className="btn-outline" style={{ fontSize: 12 }}
              onClick={() => { onStatusChange(fdr.id, 'renewal_pending'); onClose(); }}>
              <RefreshCw size={13} /> Submit Renewal
            </button>
          )}
          {fdr.lifecycleStatus === 'matured' && (
            <button className="btn-outline" style={{ fontSize: 12 }}
              onClick={() => { onStatusChange(fdr.id, 'release_requested'); onClose(); }}>
              <Unlock size={13} /> Request Release
            </button>
          )}
          <button className="btn-secondary" onClick={onClose}>Close</button>
        </div>
      }
    >
      {/* Lifecycle bar */}
      <div style={{ marginBottom: 20, overflowX: 'auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', minWidth: 600 }}>
          {lifeCycleSteps.map((step, idx) => (
            <React.Fragment key={step.key}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                <div style={{
                  width: 24, height: 24, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: idx <= currentIdx ? '#172B46' : '#E5E2DA',
                  color: idx <= currentIdx ? 'white' : '#9ca3af',
                  fontSize: 11, fontWeight: 700, flexShrink: 0,
                }}>
                  {idx < currentIdx ? '✓' : idx + 1}
                </div>
                <div style={{ fontSize: 9, color: idx <= currentIdx ? '#172B46' : '#9ca3af', fontWeight: idx === currentIdx ? 700 : 400, textAlign: 'center', maxWidth: 60, lineHeight: 1.2 }}>
                  {step.label}
                </div>
              </div>
              {idx < lifeCycleSteps.length - 1 && (
                <div style={{ flex: 1, height: 2, background: idx < currentIdx ? '#172B46' : '#E5E2DA', marginBottom: 18 }} />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Details grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        {[
          { label: 'Institution', value: fdr.institutionName },
          { label: 'Bank Name', value: fdr.bankName },
          { label: 'Branch', value: fdr.branchName || 'N/A' },
          { label: 'FDR Amount', value: formatCurrency(fdr.amount) },
          { label: 'Issue Date', value: formatDate(fdr.issueDate) },
          { label: 'Maturity Date', value: formatDate(fdr.maturityDate) },
          { label: 'Interest Rate', value: `${fdr.interestRate}% p.a.` },
          { label: 'Days to Maturity', value: days > 0 ? `${days} days` : `Matured ${Math.abs(days)} days ago`, highlight: days <= 30 },
          { label: 'Lifecycle Status', value: getFDRStatusLabel(fdr.lifecycleStatus) },
          { label: 'Verification Status', value: getVerificationStatusLabel(fdr.verificationStatus) },
          { label: 'Submitted By', value: fdr.submittedBy },
          { label: 'Submitted Date', value: formatDate(fdr.submittedDate) },
          { label: 'Risk Level', value: fdr.riskLevel.toUpperCase() + ` (Score: ${fdr.riskScore}/100)`, highlight: fdr.riskLevel !== 'low' },
          { label: 'Renewal Count', value: String(fdr.renewalCount) },
        ].map(item => (
          <div key={item.label} style={{ background: '#F4F2EC', borderRadius: 8, padding: '10px 14px' }}>
            <div style={{ fontSize: 11, color: '#9ca3af', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.3px', marginBottom: 3 }}>{item.label}</div>
            <div style={{ fontSize: 14, fontWeight: 600, color: item.highlight ? '#dc2626' : '#172B46' }}>{item.value}</div>
          </div>
        ))}
      </div>

      {fdr.remarks && (
        <div style={{ marginTop: 14, background: '#fef3c7', border: '1px solid #fcd34d', borderRadius: 8, padding: '10px 14px' }}>
          <div style={{ fontSize: 11, color: '#92400e', fontWeight: 700, marginBottom: 4 }}>REMARKS</div>
          <div style={{ fontSize: 13, color: '#374151' }}>{fdr.remarks}</div>
        </div>
      )}

      {fdr.documentHash && (
        <div style={{ marginTop: 14, background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 8, padding: '10px 14px' }}>
          <div style={{ fontSize: 11, color: '#166534', fontWeight: 700, marginBottom: 4 }}>DOCUMENT INTEGRITY HASH</div>
          <div style={{ fontSize: 11, fontFamily: 'monospace', color: '#374151', wordBreak: 'break-all' }}>{fdr.documentHash}</div>
        </div>
      )}
    </Modal>
  );
}

export default function FDRManagementPage() {
  const { fdrs, addFDR, updateFDR, currentUser } = useApp();
  const [searchParams] = useSearchParams();
  const [search, setSearch] = useState('');
  const [institutionFilter, setInstitutionFilter] = useState(searchParams.get('institution') || 'all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [verificationFilter, setVerificationFilter] = useState('all');
  const [showAdd, setShowAdd] = useState(false);
  const [selectedFDR, setSelectedFDR] = useState<FDR | null>(null);

  const isInstAdmin = currentUser?.role === 'institution_admin';
  const myFDRs = isInstAdmin ? fdrs.filter(f => f.institutionId === currentUser?.institutionId) : fdrs;

  const filtered = myFDRs.filter(fdr => {
    const matchSearch = fdr.fdrNumber.toLowerCase().includes(search.toLowerCase()) ||
      fdr.institutionName.toLowerCase().includes(search.toLowerCase()) ||
      fdr.bankName.toLowerCase().includes(search.toLowerCase());
    const matchInst = institutionFilter === 'all' || fdr.institutionId === institutionFilter;
    const matchStatus = statusFilter === 'all' || fdr.lifecycleStatus === statusFilter;
    const matchVerif = verificationFilter === 'all' || fdr.verificationStatus === verificationFilter;
    return matchSearch && matchInst && matchStatus && matchVerif;
  });

  const handleStatusChange = (id: string, status: FDRStatus, verStatus?: VerificationStatus) => {
    const updates: Partial<FDR> = { lifecycleStatus: status };
    if (verStatus) updates.verificationStatus = verStatus;
    updateFDR(id, updates);
  };

  const handleExport = () => {
    exportToCSV(filtered.map(f => ({
      FDRNumber: f.fdrNumber,
      Institution: f.institutionName,
      Bank: f.bankName,
      Amount: f.amount,
      IssueDate: f.issueDate,
      MaturityDate: f.maturityDate,
      LifecycleStatus: getFDRStatusLabel(f.lifecycleStatus),
      VerificationStatus: getVerificationStatusLabel(f.verificationStatus),
      RiskLevel: f.riskLevel,
    })), 'fdr_report');
  };

  const institutions = [...new Set(fdrs.map(f => JSON.stringify({ id: f.institutionId, name: f.institutionName })))].map(s => JSON.parse(s) as { id: string; name: string });

  return (
    <div className="page-container animate-fade-in">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h1 className="section-title">FDR Management</h1>
          <p className="section-subtitle">Showing {filtered.length} of {myFDRs.length} FDR records</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn-secondary" onClick={handleExport}><Download size={15} /> Export CSV</button>
          <button className="btn-primary" onClick={() => setShowAdd(true)}><Plus size={15} /> Upload FDR</button>
        </div>
      </div>

      {/* Summary chips */}
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 16 }}>
        {[
          { label: 'All', value: 'all', count: myFDRs.length },
          { label: 'Active', value: 'active', count: myFDRs.filter(f => f.lifecycleStatus === 'active').length, color: '#16a34a' },
          { label: 'Expiring Soon', value: 'expiring_soon', count: myFDRs.filter(f => f.lifecycleStatus === 'expiring_soon').length, color: '#d97706' },
          { label: 'Pending Verification', value: 'pending_verification', count: myFDRs.filter(f => f.lifecycleStatus === 'pending_verification').length, color: '#9333ea' },
          { label: 'Renewal Pending', value: 'renewal_pending', count: myFDRs.filter(f => f.lifecycleStatus === 'renewal_pending').length, color: '#D97732' },
          { label: 'Matured', value: 'matured', count: myFDRs.filter(f => f.lifecycleStatus === 'matured').length, color: '#6b7280' },
        ].map(chip => (
          <button key={chip.value} onClick={() => setStatusFilter(chip.value)}
            style={{
              padding: '5px 14px', borderRadius: 20, fontSize: 13, fontWeight: 600, cursor: 'pointer',
              border: `1.5px solid ${statusFilter === chip.value ? (chip.color || '#172B46') : '#E5E2DA'}`,
              background: statusFilter === chip.value ? (chip.color ? `${chip.color}15` : '#172B4615') : 'white',
              color: statusFilter === chip.value ? (chip.color || '#172B46') : '#6b7280',
              display: 'flex', alignItems: 'center', gap: 6,
            }}>
            {chip.label}
            <span style={{
              background: statusFilter === chip.value ? (chip.color || '#172B46') : '#E5E2DA',
              color: statusFilter === chip.value ? 'white' : '#6b7280',
              borderRadius: 10, fontSize: 11, padding: '0 6px', fontWeight: 700,
            }}>{chip.count}</span>
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="card" style={{ padding: '12px 16px', marginBottom: 16 }}>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: '1 1 200px' }}>
            <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
            <input className="form-input" placeholder="Search FDR number, institution, bank..." value={search}
              onChange={e => setSearch(e.target.value)} style={{ paddingLeft: 30 }} />
          </div>
          {!isInstAdmin && (
            <select className="form-input" value={institutionFilter} onChange={e => setInstitutionFilter(e.target.value)} style={{ flex: '1 1 180px' }}>
              <option value="all">All Institutions</option>
              {institutions.map(i => <option key={i.id} value={i.id}>{i.name}</option>)}
            </select>
          )}
          <select className="form-input" value={verificationFilter} onChange={e => setVerificationFilter(e.target.value)} style={{ flex: '1 1 160px' }}>
            <option value="all">All Verification</option>
            <option value="not_started">Not Started</option>
            <option value="in_progress">In Progress</option>
            <option value="verified">Verified</option>
            <option value="discrepancy_found">Discrepancy Found</option>
          </select>
        </div>
      </div>

      {/* FDR Table */}
      <div className="card">
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>FDR Number</th>
                <th>Institution</th>
                <th>Bank</th>
                <th>Amount</th>
                <th>Maturity Date</th>
                <th>Validity</th>
                <th>Verification</th>
                <th>Status</th>
                <th>Risk</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(fdr => {
                const days = getDaysToMaturity(fdr.maturityDate);
                return (
                  <tr key={fdr.id}>
                    <td>
                      <div style={{ fontFamily: 'monospace', fontSize: 12, fontWeight: 600, color: '#172B46' }}>{fdr.fdrNumber}</div>
                    </td>
                    <td style={{ fontSize: 13 }}>{fdr.institutionName}</td>
                    <td style={{ fontSize: 12, color: '#6b7280' }}>{fdr.bankName}</td>
                    <td style={{ fontSize: 13, fontWeight: 600, color: '#172B46' }}>{formatCurrency(fdr.amount)}</td>
                    <td style={{ fontSize: 12 }}>{formatDate(fdr.maturityDate)}</td>
                    <td>
                      <span style={{
                        fontSize: 12, fontWeight: 600,
                        color: days < 0 ? '#6b7280' : days <= 15 ? '#dc2626' : days <= 60 ? '#d97706' : '#16a34a',
                      }}>
                        {days < 0 ? `${Math.abs(days)}d ago` : `${days}d left`}
                      </span>
                    </td>
                    <td><span className={getVerificationStatusBadgeClass(fdr.verificationStatus)}>{getVerificationStatusLabel(fdr.verificationStatus)}</span></td>
                    <td><span className={getFDRStatusBadgeClass(fdr.lifecycleStatus)}>{getFDRStatusLabel(fdr.lifecycleStatus)}</span></td>
                    <td>
                      <span className="badge" style={{
                        background: fdr.riskLevel === 'low' ? '#dcfce7' : fdr.riskLevel === 'medium' ? '#fef3c7' : '#fee2e2',
                        color: fdr.riskLevel === 'low' ? '#166534' : fdr.riskLevel === 'medium' ? '#92400e' : '#991b1b',
                        fontSize: 11, padding: '3px 8px',
                      }}>
                        {fdr.riskLevel.toUpperCase()}
                      </span>
                    </td>
                    <td>
                      <button className="btn-ghost" style={{ padding: '4px 10px', fontSize: 12 }}
                        onClick={() => setSelectedFDR(fdr)}>
                        <Eye size={13} /> View
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="empty-state"><FileText size={36} /><h3>No FDRs found</h3><p>Adjust filters or upload a new FDR</p></div>
          )}
        </div>
      </div>

      <AddFDRModal isOpen={showAdd} onClose={() => setShowAdd(false)} onAdd={addFDR} />
      {selectedFDR && <FDRDetailModal fdr={selectedFDR} onClose={() => setSelectedFDR(null)} onStatusChange={handleStatusChange} />}
    </div>
  );
}
