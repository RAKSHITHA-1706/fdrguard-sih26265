import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Filter, Building2, MapPin, Phone, Mail, Eye, Edit, MoreVertical } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import Modal from '../../components/common/Modal';
import { getInstitutionStatusBadgeClass, getInstitutionStatusLabel, generateId } from '../../utils';
import type { Institution, InstitutionStatus, InstitutionCategory } from '../../types';

const INDIAN_STATES = ['All States', 'Andhra Pradesh', 'Delhi', 'Gujarat', 'Karnataka', 'Maharashtra', 'Punjab', 'Rajasthan', 'Tamil Nadu', 'Telangana', 'Uttar Pradesh', 'West Bengal'];
const CATEGORIES: { value: string; label: string }[] = [
  { value: 'all', label: 'All Categories' },
  { value: 'engineering', label: 'Engineering' },
  { value: 'management', label: 'Management' },
  { value: 'pharmacy', label: 'Pharmacy' },
  { value: 'architecture', label: 'Architecture' },
  { value: 'mca', label: 'MCA' },
];

function ComplianceBar({ score }: { score: number }) {
  const color = score >= 80 ? '#16a34a' : score >= 60 ? '#d97706' : '#dc2626';
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <div style={{ flex: 1, height: 6, background: '#f3f4f6', borderRadius: 3, overflow: 'hidden' }}>
        <div style={{ width: `${score}%`, height: '100%', background: color, borderRadius: 3, transition: 'width 0.3s' }} />
      </div>
      <span style={{ fontSize: 12, fontWeight: 700, color, minWidth: 32 }}>{score}%</span>
    </div>
  );
}

function AddInstitutionModal({ isOpen, onClose, onAdd }: { isOpen: boolean; onClose: () => void; onAdd: (inst: Institution) => void }) {
  const [form, setForm] = useState({
    name: '', shortName: '', code: '', state: 'Karnataka', city: '', address: '',
    contactPerson: '', contactEmail: '', contactPhone: '', category: 'engineering' as InstitutionCategory,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = 'Institution name is required';
    if (!form.code.trim()) e.code = 'Institution code is required';
    if (!form.city.trim()) e.city = 'City is required';
    if (!form.contactEmail.includes('@')) e.contactEmail = 'Valid email required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    const newInst: Institution = {
      id: generateId('inst'),
      ...form,
      status: 'pending',
      totalFDRs: 0, activeFDRs: 0, expiredFDRs: 0, pendingVerification: 0,
      complianceScore: 0,
      registrationDate: new Date().toISOString().split('T')[0],
      lastActivity: new Date().toISOString().split('T')[0],
    };
    onAdd(newInst);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add New Institution" maxWidth={680}
      footer={
        <>
          <button className="btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn-primary" onClick={handleSubmit}><Plus size={15} /> Add Institution</button>
        </>
      }
    >
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {[
          { label: 'Institution Full Name *', key: 'name', span: 2 },
          { label: 'Short Name / Abbreviation', key: 'shortName' },
          { label: 'Institution Code *', key: 'code' },
          { label: 'City *', key: 'city' },
          { label: 'Contact Person', key: 'contactPerson' },
          { label: 'Contact Email *', key: 'contactEmail', type: 'email' },
          { label: 'Contact Phone', key: 'contactPhone' },
        ].map(field => (
          <div key={field.key} style={{ gridColumn: field.span ? `span ${field.span}` : undefined }}>
            <label className="form-label">{field.label}</label>
            <input
              type={field.type || 'text'}
              className="form-input"
              value={(form as Record<string, string>)[field.key]}
              onChange={e => setForm(f => ({ ...f, [field.key]: e.target.value }))}
              style={errors[field.key] ? { borderColor: '#dc2626' } : undefined}
            />
            {errors[field.key] && <div style={{ fontSize: 11, color: '#dc2626', marginTop: 3 }}>{errors[field.key]}</div>}
          </div>
        ))}
        <div>
          <label className="form-label">State</label>
          <select className="form-input" value={form.state} onChange={e => setForm(f => ({ ...f, state: e.target.value }))}>
            {INDIAN_STATES.filter(s => s !== 'All States').map(s => <option key={s}>{s}</option>)}
          </select>
        </div>
        <div>
          <label className="form-label">Category</label>
          <select className="form-input" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value as InstitutionCategory }))}>
            {CATEGORIES.filter(c => c.value !== 'all').map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
          </select>
        </div>
        <div style={{ gridColumn: 'span 2' }}>
          <label className="form-label">Address</label>
          <textarea className="form-input" rows={2} value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} />
        </div>
      </div>
    </Modal>
  );
}

export default function InstitutionsPage() {
  const { institutions, setInstitutions, currentUser } = useApp();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [stateFilter, setStateFilter] = useState('All States');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showAdd, setShowAdd] = useState(false);

  const filtered = institutions.filter(inst => {
    const matchSearch = inst.name.toLowerCase().includes(search.toLowerCase()) ||
      (inst.code || '').toLowerCase().includes(search.toLowerCase()) ||
      inst.city.toLowerCase().includes(search.toLowerCase());
    const matchState = stateFilter === 'All States' || inst.state === stateFilter;
    const matchCat = categoryFilter === 'all' || inst.category === categoryFilter;
    const matchStatus = statusFilter === 'all' || inst.status === statusFilter;
    return matchSearch && matchState && matchCat && matchStatus;
  });

  const isAdmin = currentUser?.role === 'system_admin';

  return (
    <div className="page-container animate-fade-in">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h1 className="section-title">Institution Management</h1>
          <p className="section-subtitle">{filtered.length} of {institutions.length} institutions</p>
        </div>
        {isAdmin && (
          <button className="btn-primary" onClick={() => setShowAdd(true)}>
            <Plus size={16} /> Add Institution
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="card" style={{ padding: '14px 20px', marginBottom: 16 }}>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: '1 1 200px', minWidth: 200 }}>
            <Search size={15} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
            <input className="form-input" placeholder="Search institutions..." value={search}
              onChange={e => setSearch(e.target.value)} style={{ paddingLeft: 32 }} />
          </div>
          <select className="form-input" value={stateFilter} onChange={e => setStateFilter(e.target.value)} style={{ flex: '1 1 140px', minWidth: 140 }}>
            {INDIAN_STATES.map(s => <option key={s}>{s}</option>)}
          </select>
          <select className="form-input" value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)} style={{ flex: '1 1 140px', minWidth: 140 }}>
            {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
          </select>
          <select className="form-input" value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={{ flex: '1 1 120px', minWidth: 120 }}>
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="pending">Pending</option>
            <option value="suspended">Suspended</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* Institution Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 16 }}>
        {filtered.map(inst => (
          <div key={inst.id} className="card" style={{ padding: 20, transition: 'transform 0.2s, box-shadow 0.2s' }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 24px rgba(0,0,0,0.1)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = ''; (e.currentTarget as HTMLElement).style.boxShadow = ''; }}
          >
            {/* Card header */}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14 }}>
              <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                <div style={{ width: 44, height: 44, borderRadius: 10, background: '#172B46', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 16, fontWeight: 800, flexShrink: 0 }}>
                  {inst.shortName.substring(0, 2)}
                </div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#172B46', lineHeight: 1.3 }}>{inst.name}</div>
                  <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 2 }}>Code: {inst.code}</div>
                </div>
              </div>
              <span className={getInstitutionStatusBadgeClass(inst.status)}>{getInstitutionStatusLabel(inst.status)}</span>
            </div>

            {/* Info */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#6b7280' }}>
                <MapPin size={12} /> {inst.city}, {inst.state}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#6b7280' }}>
                <Mail size={12} /> {inst.contactEmail}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#6b7280' }}>
                <Phone size={12} /> {inst.contactPhone}
              </div>
            </div>

            {/* Stats row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, marginBottom: 14 }}>
              {[
                { label: 'Total', value: inst.totalFDRs },
                { label: 'Active', value: inst.activeFDRs, color: '#16a34a' },
                { label: 'Expired', value: inst.expiredFDRs, color: '#dc2626' },
                { label: 'Pending', value: inst.pendingVerification, color: '#d97706' },
              ].map(stat => (
                <div key={stat.label} style={{ textAlign: 'center', background: '#F4F2EC', borderRadius: 8, padding: '8px 4px' }}>
                  <div style={{ fontSize: 18, fontWeight: 800, color: stat.color || '#172B46' }}>{stat.value}</div>
                  <div style={{ fontSize: 10, color: '#9ca3af', fontWeight: 500 }}>{stat.label}</div>
                </div>
              ))}
            </div>

            {/* Compliance */}
            <div style={{ marginBottom: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontSize: 12, color: '#6b7280', fontWeight: 500 }}>Compliance Score</span>
              </div>
              <ComplianceBar score={inst.complianceScore} />
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn-outline" style={{ flex: 1, justifyContent: 'center', fontSize: 12 }}
                onClick={() => navigate(`/fdrs?institution=${inst.id}`)}>
                <Eye size={13} /> View FDRs
              </button>
              {isAdmin && (
                <button className="btn-secondary" style={{ fontSize: 12, padding: '7px 12px' }}>
                  <Edit size={13} />
                </button>
              )}
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="empty-state" style={{ gridColumn: '1 / -1' }}>
            <Building2 size={40} />
            <h3>No institutions found</h3>
            <p>Try adjusting your filters or search term</p>
          </div>
        )}
      </div>

      <AddInstitutionModal
        isOpen={showAdd}
        onClose={() => setShowAdd(false)}
        onAdd={inst => setInstitutions([...institutions, inst])}
      />
    </div>
  );
}
