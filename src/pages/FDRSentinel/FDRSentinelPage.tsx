import React, { useState } from 'react';
import {
  Shield, Upload, FileText, AlertTriangle, CheckCircle, XCircle,
  Search, Eye, Hash, AlertCircle, Info, Download
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatCurrency, formatDate } from '../../utils';

interface ExtractedField {
  field: string;
  extracted: string;
  submitted: string;
  match: 'match' | 'mismatch' | 'missing';
  critical: boolean;
}

interface AnalysisResult {
  fdrId: string;
  fdrNumber: string;
  institution: string;
  documentHash: string;
  analysisDate: string;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  riskScore: number;
  extractedFields: ExtractedField[];
  issues: string[];
  recommendation: string;
  isDuplicate: boolean;
}

const MOCK_ANALYSES: Record<string, AnalysisResult> = {
  'fdr-007': {
    fdrId: 'fdr-007',
    fdrNumber: 'FDR/AXIS/2024/018901',
    institution: 'Manipal Institute of Technology',
    documentHash: 'sha256:a9f2b8c1d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9',
    analysisDate: new Date().toISOString(),
    riskLevel: 'critical',
    riskScore: 95,
    extractedFields: [
      { field: 'FDR Number', extracted: 'FDR/AXIS/2024/018901', submitted: 'FDR/AXIS/2024/018901', match: 'match', critical: true },
      { field: 'Bank Name', extracted: 'Axis Bank Ltd.', submitted: 'Axis Bank', match: 'match', critical: true },
      { field: 'FDR Amount', extracted: '₹50,00,000', submitted: '₹45,00,000', match: 'mismatch', critical: true },
      { field: 'Issue Date', extracted: '01-Feb-2024', submitted: '01-Feb-2024', match: 'match', critical: true },
      { field: 'Maturity Date', extracted: 'As submitted', submitted: 'As submitted', match: 'match', critical: true },
      { field: 'Beneficiary Name', extracted: 'MANIPAL INST. OF TECH.', submitted: 'Manipal Institute of Technology', match: 'match', critical: false },
      { field: 'Account Number', extracted: 'XXXXX4521', submitted: 'Not provided', match: 'missing', critical: false },
      { field: 'Interest Rate', extracted: '6.60%', submitted: '6.60%', match: 'match', critical: false },
    ],
    issues: [
      'CRITICAL: FDR amount mismatch - Document shows ₹50,00,000 but form submitted ₹45,00,000 (₹5L discrepancy)',
      'WARNING: Account number not provided in submission form',
      'INFO: Beneficiary name format differs (abbreviation vs full name) - acceptable variation',
    ],
    recommendation: 'Do NOT approve. Amount mismatch is significant and requires clarification from the institution and independent bank confirmation before any further action.',
    isDuplicate: false,
  },
  'fdr-001': {
    fdrId: 'fdr-001',
    fdrNumber: 'FDR/SBI/2024/001892',
    institution: 'R.V. College of Engineering',
    documentHash: 'sha256:3a7bd3e2360a3d29eea436fcfb7e44c735d117c42d1c1835420b6b9942dd4f1b',
    analysisDate: new Date().toISOString(),
    riskLevel: 'low',
    riskScore: 12,
    extractedFields: [
      { field: 'FDR Number', extracted: 'FDR/SBI/2024/001892', submitted: 'FDR/SBI/2024/001892', match: 'match', critical: true },
      { field: 'Bank Name', extracted: 'State Bank of India', submitted: 'State Bank of India', match: 'match', critical: true },
      { field: 'FDR Amount', extracted: '₹50,00,000', submitted: '₹50,00,000', match: 'match', critical: true },
      { field: 'Issue Date', extracted: '01-Apr-2024', submitted: '01-Apr-2024', match: 'match', critical: true },
      { field: 'Maturity Date', extracted: 'As submitted', submitted: 'As submitted', match: 'match', critical: true },
      { field: 'Beneficiary Name', extracted: 'RV COLLEGE OF ENGINEERING', submitted: 'R.V. College of Engineering', match: 'match', critical: false },
      { field: 'Interest Rate', extracted: '6.50%', submitted: '6.50%', match: 'match', critical: false },
    ],
    issues: [
      'INFO: All critical fields match between document and submitted data.',
      'INFO: Minor name format difference (uppercase in document) - within acceptable range.',
    ],
    recommendation: 'Document consistency check passed. Proceed with verification. Note: This automated check does not replace independent bank confirmation of FDR issuance.',
    isDuplicate: false,
  },
};

export default function FDRSentinelPage() {
  const { fdrs } = useApp();
  const [selectedFDRId, setSelectedFDRId] = useState('');
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [uploadMode, setUploadMode] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);

  const handleAnalyze = () => {
    if (!selectedFDRId) return;
    setAnalyzing(true);
    setTimeout(() => {
      const result = MOCK_ANALYSES[selectedFDRId] || {
        fdrId: selectedFDRId,
        fdrNumber: fdrs.find(f => f.id === selectedFDRId)?.fdrNumber || 'Unknown',
        institution: fdrs.find(f => f.id === selectedFDRId)?.institutionName || 'Unknown',
        documentHash: `sha256:${Math.random().toString(16).substr(2, 64)}`,
        analysisDate: new Date().toISOString(),
        riskLevel: 'low' as const,
        riskScore: 18,
        extractedFields: [
          { field: 'FDR Number', extracted: fdrs.find(f => f.id === selectedFDRId)?.fdrNumber || 'N/A', submitted: fdrs.find(f => f.id === selectedFDRId)?.fdrNumber || 'N/A', match: 'match' as const, critical: true },
          { field: 'Bank Name', extracted: fdrs.find(f => f.id === selectedFDRId)?.bankName || 'N/A', submitted: fdrs.find(f => f.id === selectedFDRId)?.bankName || 'N/A', match: 'match' as const, critical: true },
          { field: 'FDR Amount', extracted: formatCurrency(fdrs.find(f => f.id === selectedFDRId)?.amount || 0), submitted: formatCurrency(fdrs.find(f => f.id === selectedFDRId)?.amount || 0), match: 'match' as const, critical: true },
          { field: 'Issue Date', extracted: formatDate(fdrs.find(f => f.id === selectedFDRId)?.issueDate || ''), submitted: formatDate(fdrs.find(f => f.id === selectedFDRId)?.issueDate || ''), match: 'match' as const, critical: true },
        ],
        issues: ['INFO: All extracted fields match submitted data. No discrepancies detected.'],
        recommendation: 'Consistency check passed. Proceed with normal verification. Always confirm with bank independently.',
        isDuplicate: false,
      };
      setAnalysisResult(result);
      setAnalyzing(false);
    }, 2000);
  };

  const riskColors = {
    low: { bg: '#dcfce7', color: '#166534', border: '#bbf7d0' },
    medium: { bg: '#fef3c7', color: '#92400e', border: '#fcd34d' },
    high: { bg: '#ffedd5', color: '#9a3412', border: '#fb923c' },
    critical: { bg: '#fee2e2', color: '#991b1b', border: '#fca5a5' },
  };

  return (
    <div className="page-container animate-fade-in">
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
          <div style={{ width: 40, height: 40, background: '#963347', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Shield size={22} color="white" />
          </div>
          <div>
            <h1 className="section-title">FDR Sentinel</h1>
            <p className="section-subtitle">Automated Document Authenticity & Consistency Detection</p>
          </div>
        </div>
        <div style={{ background: '#fef3c7', border: '1px solid #fcd34d', borderRadius: 10, padding: '10px 14px', fontSize: 12, color: '#92400e', marginTop: 12 }}>
          <strong>⚠️ Important:</strong> This tool performs automated consistency checks between submitted form data and document content.
          A passing check does NOT confirm that an FDR is genuine. Only an authorized bank confirmation independently verifies issuance.
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 16 }}>
        {/* Left Panel - Select FDR */}
        <div>
          <div className="card" style={{ padding: 20, marginBottom: 16 }}>
            <h3 style={{ margin: '0 0 16px', fontSize: 15, fontWeight: 700, color: '#172B46' }}>
              Select FDR to Analyze
            </h3>
            <div style={{ marginBottom: 12 }}>
              <label className="form-label">Select from Existing FDRs</label>
              <select className="form-input" value={selectedFDRId} onChange={e => { setSelectedFDRId(e.target.value); setAnalysisResult(null); }}>
                <option value="">-- Select FDR --</option>
                {fdrs.map(fdr => (
                  <option key={fdr.id} value={fdr.id}>
                    {fdr.fdrNumber} ({fdr.institutionName.split(' ').slice(0, 2).join(' ')})
                  </option>
                ))}
              </select>
            </div>
            <div style={{ marginBottom: 16 }}>
              <label className="form-label">Or Upload New Document</label>
              <div
                style={{ border: '2px dashed #E5E2DA', borderRadius: 10, padding: '20px', textAlign: 'center', cursor: 'pointer', background: '#fafafa' }}
                onClick={() => document.getElementById('sentinel-upload')?.click()}
              >
                <Upload size={24} color="#9ca3af" style={{ marginBottom: 8 }} />
                <div style={{ fontSize: 13, color: '#6b7280' }}>
                  {uploadFile ? uploadFile.name : 'Click to upload FDR document'}
                </div>
                <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 4 }}>Supported formats: PDF, JPG, PNG (Max 10 MB)</div>
                <input id="sentinel-upload" type="file" style={{ display: 'none' }} onChange={e => setUploadFile(e.target.files?.[0] || null)} />
              </div>
            </div>
            <button
              className="btn-primary"
              style={{ width: '100%', justifyContent: 'center' }}
              onClick={handleAnalyze}
              disabled={!selectedFDRId || analyzing}
            >
              {analyzing ? (
                <>
                  <div style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.4)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                  Analyzing...
                </>
              ) : (
                <><Search size={15} /> Run Analysis</>
              )}
            </button>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>

          {/* Quick stats */}
          <div className="card" style={{ padding: 20 }}>
            <h3 style={{ margin: '0 0 14px', fontSize: 14, fontWeight: 700, color: '#172B46' }}>Sentinel Statistics</h3>
            {[
              { label: 'Analyses This Month', value: '47', color: '#172B46' },
              { label: 'Discrepancies Found', value: '3', color: '#dc2626' },
              { label: 'Pass Rate', value: '93.6%', color: '#16a34a' },
              { label: 'Duplicate Flags', value: '1', color: '#d97706' },
            ].map(stat => (
              <div key={stat.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid #f5f5f5' }}>
                <span style={{ fontSize: 13, color: '#6b7280' }}>{stat.label}</span>
                <span style={{ fontSize: 14, fontWeight: 700, color: stat.color }}>{stat.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right Panel - Analysis Results */}
        <div>
          {!analysisResult && !analyzing && (
            <div className="card" style={{ padding: 40, textAlign: 'center' }}>
              <Shield size={48} color="#E5E2DA" style={{ marginBottom: 16 }} />
              <h3 style={{ fontSize: 16, fontWeight: 600, color: '#6b7280', margin: '0 0 8px' }}>
                Select an FDR and Run Analysis
              </h3>
              <p style={{ fontSize: 13, color: '#9ca3af', margin: 0, lineHeight: 1.6, maxWidth: 400, marginLeft: 'auto', marginRight: 'auto' }}>
                FDR Sentinel will simulate document extraction, compare with submitted data, and generate a consistency report.
              </p>
              <div style={{ marginTop: 24, display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
                <div style={{ background: '#fde8ec', border: '1px solid #fca5a5', borderRadius: 8, padding: '10px 14px', fontSize: 12, color: '#963347', maxWidth: 180, textAlign: 'center' }}>
                  <AlertCircle size={16} style={{ marginBottom: 6 }} /><br />
                  Try <strong>FDR/AXIS/2024/018901</strong> for a discrepancy example
                </div>
                <div style={{ background: '#dcfce7', border: '1px solid #bbf7d0', borderRadius: 8, padding: '10px 14px', fontSize: 12, color: '#166534', maxWidth: 180, textAlign: 'center' }}>
                  <CheckCircle size={16} style={{ marginBottom: 6 }} /><br />
                  Try <strong>FDR/SBI/2024/001892</strong> for a clean example
                </div>
              </div>
            </div>
          )}

          {analyzing && (
            <div className="card" style={{ padding: 40, textAlign: 'center' }}>
              <div style={{ width: 60, height: 60, border: '4px solid #E5E2DA', borderTopColor: '#963347', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 20px' }} />
              <h3 style={{ fontSize: 16, fontWeight: 600, color: '#172B46', margin: '0 0 12px' }}>
                Analyzing Document...
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxWidth: 320, margin: '0 auto', textAlign: 'left' }}>
                {['Extracting document content via OCR simulation', 'Parsing FDR fields and metadata', 'Comparing with submitted form data', 'Checking document fingerprint registry', 'Generating risk assessment report'].map((step, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#6b7280' }}>
                    <div style={{ width: 18, height: 18, borderRadius: '50%', background: '#172B46', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'white', animation: `pulse-slow ${1 + i * 0.3}s infinite` }} />
                    </div>
                    {step}
                  </div>
                ))}
              </div>
            </div>
          )}

          {analysisResult && !analyzing && (
            <div className="animate-fade-in">
              {/* Risk Level Banner */}
              <div style={{
                ...riskColors[analysisResult.riskLevel],
                border: `1px solid ${riskColors[analysisResult.riskLevel].border}`,
                borderRadius: 12,
                padding: '16px 20px',
                marginBottom: 16,
                display: 'flex',
                alignItems: 'center',
                gap: 14,
              }}>
                {analysisResult.riskLevel === 'critical' || analysisResult.riskLevel === 'high'
                  ? <XCircle size={28} color={riskColors[analysisResult.riskLevel].color} />
                  : <CheckCircle size={28} color={riskColors[analysisResult.riskLevel].color} />}
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 16, fontWeight: 800, color: riskColors[analysisResult.riskLevel].color }}>
                    Risk Level: {analysisResult.riskLevel.toUpperCase()} · Score: {analysisResult.riskScore}/100
                  </div>
                  <div style={{ fontSize: 13, color: riskColors[analysisResult.riskLevel].color, opacity: 0.8, marginTop: 3 }}>
                    {analysisResult.recommendation}
                  </div>
                </div>
                <button className="btn-secondary" style={{ fontSize: 12, flexShrink: 0 }}>
                  <Download size={13} /> Report
                </button>
              </div>

              {/* Document Details */}
              <div className="card" style={{ padding: 20, marginBottom: 16 }}>
                <h3 style={{ margin: '0 0 14px', fontSize: 14, fontWeight: 700, color: '#172B46' }}>Document Information</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  {[
                    { label: 'FDR Number', value: analysisResult.fdrNumber },
                    { label: 'Institution', value: analysisResult.institution },
                    { label: 'Analysis Date', value: new Date(analysisResult.analysisDate).toLocaleString('en-IN') },
                    { label: 'Duplicate Detected', value: analysisResult.isDuplicate ? 'YES - Flag raised' : 'No duplicate found' },
                  ].map(item => (
                    <div key={item.label}>
                      <div style={{ fontSize: 11, color: '#9ca3af', fontWeight: 600, textTransform: 'uppercase' }}>{item.label}</div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: '#172B46', marginTop: 2 }}>{item.value}</div>
                    </div>
                  ))}
                </div>
                <div style={{ marginTop: 12 }}>
                  <div style={{ fontSize: 11, color: '#9ca3af', fontWeight: 600, textTransform: 'uppercase', marginBottom: 4 }}>Document Hash</div>
                  <div style={{ fontFamily: 'monospace', fontSize: 11, color: '#374151', background: '#F4F2EC', padding: '6px 10px', borderRadius: 6, wordBreak: 'break-all' }}>
                    {analysisResult.documentHash}
                  </div>
                </div>
              </div>

              {/* Field Comparison */}
              <div className="card" style={{ padding: 20, marginBottom: 16 }}>
                <h3 style={{ margin: '0 0 14px', fontSize: 14, fontWeight: 700, color: '#172B46' }}>Field Comparison</h3>
                <div className="table-container">
                  <table>
                    <thead>
                      <tr>
                        <th>Field</th>
                        <th>Extracted from Document</th>
                        <th>Submitted in Form</th>
                        <th>Match</th>
                        <th>Critical</th>
                      </tr>
                    </thead>
                    <tbody>
                      {analysisResult.extractedFields.map(field => (
                        <tr key={field.field} style={{ background: field.match === 'mismatch' ? '#fef2f2' : field.match === 'missing' ? '#fffbeb' : 'white' }}>
                          <td style={{ fontWeight: 600, fontSize: 13 }}>{field.field}</td>
                          <td style={{ fontSize: 13, fontFamily: 'monospace', color: field.match === 'mismatch' ? '#dc2626' : '#374151' }}>{field.extracted}</td>
                          <td style={{ fontSize: 13, fontFamily: 'monospace', color: field.match === 'mismatch' ? '#dc2626' : '#374151' }}>{field.submitted}</td>
                          <td>
                            {field.match === 'match' && <span className="badge badge-green"><CheckCircle size={11} /> Match</span>}
                            {field.match === 'mismatch' && <span className="badge badge-red"><XCircle size={11} /> Mismatch</span>}
                            {field.match === 'missing' && <span className="badge badge-amber"><AlertTriangle size={11} /> Missing</span>}
                          </td>
                          <td>{field.critical ? <span className="badge badge-red" style={{ fontSize: 10 }}>Critical</span> : <span className="badge badge-grey" style={{ fontSize: 10 }}>Info</span>}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Issues */}
              <div className="card" style={{ padding: 20 }}>
                <h3 style={{ margin: '0 0 14px', fontSize: 14, fontWeight: 700, color: '#172B46' }}>Detected Issues & Notes</h3>
                {analysisResult.issues.map((issue, idx) => {
                  const isC = issue.startsWith('CRITICAL');
                  const isW = issue.startsWith('WARNING');
                  return (
                    <div key={idx} style={{
                      display: 'flex', gap: 10, padding: '10px 12px', borderRadius: 8, marginBottom: 8,
                      background: isC ? '#fef2f2' : isW ? '#fffbeb' : '#f0f9ff',
                      border: `1px solid ${isC ? '#fca5a5' : isW ? '#fcd34d' : '#bae6fd'}`,
                    }}>
                      {isC ? <XCircle size={16} color="#dc2626" style={{ flexShrink: 0, marginTop: 1 }} />
                        : isW ? <AlertTriangle size={16} color="#d97706" style={{ flexShrink: 0, marginTop: 1 }} />
                        : <Info size={16} color="#0284c7" style={{ flexShrink: 0, marginTop: 1 }} />}
                      <span style={{ fontSize: 13, color: isC ? '#991b1b' : isW ? '#92400e' : '#075985' }}>{issue}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
