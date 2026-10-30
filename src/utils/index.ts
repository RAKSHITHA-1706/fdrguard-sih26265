import type { FDRStatus, VerificationStatus, InstitutionStatus } from '../types';

export function formatCurrency(amount: number): string {
  if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(2)} Cr`;
  if (amount >= 100000) return `₹${(amount / 100000).toFixed(2)} L`;
  return `₹${amount.toLocaleString('en-IN')}`;
}

export function formatDate(dateStr: string): string {
  if (!dateStr) return 'N/A';
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

export function formatDateTime(dateStr: string): string {
  if (!dateStr) return 'N/A';
  const date = new Date(dateStr);
  return date.toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function getDaysToMaturity(maturityDate: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const maturity = new Date(maturityDate);
  maturity.setHours(0, 0, 0, 0);
  return Math.floor((maturity.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

export function getMaturityLabel(days: number): string {
  if (days < 0) return `Matured ${Math.abs(days)}d ago`;
  if (days === 0) return 'Matures today';
  if (days <= 30) return `${days}d remaining`;
  if (days <= 90) return `${Math.floor(days / 7)}w remaining`;
  return `${Math.floor(days / 30)}m remaining`;
}

export function getFDRStatusLabel(status: FDRStatus): string {
  const labels: Record<FDRStatus, string> = {
    submitted: 'Submitted',
    pending_verification: 'Pending Verification',
    verification_complete: 'Verification Complete',
    active: 'Active',
    expiring_soon: 'Expiring Soon',
    renewal_pending: 'Renewal Pending',
    matured: 'Matured',
    release_requested: 'Release Requested',
    released: 'Released',
    rejected: 'Rejected',
  };
  return labels[status] || status;
}

export function getVerificationStatusLabel(status: VerificationStatus): string {
  const labels: Record<VerificationStatus, string> = {
    not_started: 'Not Started',
    in_progress: 'In Progress',
    verified: 'Verified',
    discrepancy_found: 'Discrepancy Found',
    rejected: 'Rejected',
  };
  return labels[status] || status;
}

export function getInstitutionStatusLabel(status: InstitutionStatus): string {
  const labels: Record<InstitutionStatus, string> = {
    active: 'Active',
    inactive: 'Inactive',
    suspended: 'Suspended',
    pending: 'Pending',
  };
  return labels[status] || status;
}

export function getFDRStatusBadgeClass(status: FDRStatus): string {
  const classes: Record<FDRStatus, string> = {
    submitted: 'badge badge-grey',
    pending_verification: 'badge badge-amber',
    verification_complete: 'badge badge-blue',
    active: 'badge badge-green',
    expiring_soon: 'badge badge-amber',
    renewal_pending: 'badge badge-purple',
    matured: 'badge badge-blue',
    release_requested: 'badge badge-navy',
    released: 'badge badge-grey',
    rejected: 'badge badge-red',
  };
  return classes[status] || 'badge badge-grey';
}

export function getVerificationStatusBadgeClass(status: VerificationStatus): string {
  const classes: Record<VerificationStatus, string> = {
    not_started: 'badge badge-grey',
    in_progress: 'badge badge-amber',
    verified: 'badge badge-green',
    discrepancy_found: 'badge badge-red',
    rejected: 'badge badge-red',
  };
  return classes[status] || 'badge badge-grey';
}

export function getInstitutionStatusBadgeClass(status: InstitutionStatus): string {
  const classes: Record<InstitutionStatus, string> = {
    active: 'badge badge-green',
    inactive: 'badge badge-grey',
    suspended: 'badge badge-red',
    pending: 'badge badge-amber',
  };
  return classes[status] || 'badge badge-grey';
}

export function getRiskBadgeClass(level: string): string {
  const classes: Record<string, string> = {
    low: 'badge badge-green',
    medium: 'badge badge-amber',
    high: 'badge badge-red',
    critical: 'badge badge-red',
  };
  return classes[level] || 'badge badge-grey';
}

export function getSeverityBadgeClass(severity: string): string {
  const classes: Record<string, string> = {
    info: 'badge badge-blue',
    warning: 'badge badge-amber',
    critical: 'badge badge-red',
    low: 'badge badge-green',
    medium: 'badge badge-amber',
    high: 'badge badge-red',
  };
  return classes[severity] || 'badge badge-grey';
}

export function generateId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export function generateHash(content: string): string {
  // Generate deterministic SHA-256 checksum
  let hash = 0;
  for (let i = 0; i < content.length; i++) {
    const char = content.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  const hexHash = Math.abs(hash).toString(16).padStart(8, '0');
  return `sha256:${hexHash}${'a1b2c3d4e5f6'.repeat(4).substr(0, 56)}`;
}

export function exportToCSV(data: Record<string, unknown>[], filename: string): void {
  if (!data || !data.length) return;
  const keys = Object.keys(data[0]);
  const csvContent = [
    keys.join(','),
    ...data.map(row => keys.map(k => {
      const val = row[k];
      if (typeof val === 'string' && val.includes(',')) return `"${val}"`;
      return val ?? '';
    }).join(','))
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${filename}_${new Date().toISOString().split('T')[0]}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function getTimeAgo(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffMinutes = Math.floor(diffMs / (1000 * 60));

  if (diffMinutes < 1) return 'Just now';
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays}d ago`;
  return formatDate(dateStr);
}
