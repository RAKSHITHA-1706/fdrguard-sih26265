// Core Types for FDRGuard Application

export type UserRole = 'system_admin' | 'institution_admin' | 'verification_officer';

export interface User {
  id: string;
  name: string;
  role: UserRole;
  email: string;
  institutionId?: string;
  avatar?: string;
}

export type InstitutionStatus = 'active' | 'inactive' | 'suspended' | 'pending';
export type InstitutionCategory = 'engineering' | 'management' | 'pharmacy' | 'architecture' | 'mca';

export interface Institution {
  id: string;
  name: string;
  shortName: string;
  code: string;
  state: string;
  city: string;
  address: string;
  contactPerson: string;
  contactEmail: string;
  contactPhone: string;
  category: InstitutionCategory;
  status: InstitutionStatus;
  totalFDRs: number;
  activeFDRs: number;
  expiredFDRs: number;
  pendingVerification: number;
  complianceScore: number;
  registrationDate: string;
  lastActivity: string;
}

export type FDRStatus = 'submitted' | 'pending_verification' | 'verification_complete' | 'active' | 'expiring_soon' | 'renewal_pending' | 'matured' | 'release_requested' | 'released' | 'rejected';
export type VerificationStatus = 'not_started' | 'in_progress' | 'verified' | 'discrepancy_found' | 'rejected';

export interface FDR {
  id: string;
  fdrNumber: string;
  institutionId: string;
  institutionName: string;
  bankName: string;
  branchName: string;
  amount: number;
  issueDate: string;
  maturityDate: string;
  interestRate: number;
  verificationStatus: VerificationStatus;
  lifecycleStatus: FDRStatus;
  uploadedDocumentUrl?: string;
  documentHash?: string;
  remarks?: string;
  submittedBy: string;
  submittedDate: string;
  verifiedBy?: string;
  verifiedDate?: string;
  renewalCount: number;
  riskScore: number;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
}

export interface FDRRenewal {
  id: string;
  fdrId: string;
  newFDRNumber: string;
  newMaturityDate: string;
  newAmount: number;
  submittedDate: string;
  status: 'pending' | 'approved' | 'rejected';
  remarks?: string;
}

export interface AuditEvent {
  id: string;
  eventType: string;
  userId: string;
  userName: string;
  action: string;
  entityType: 'fdr' | 'institution' | 'user' | 'system';
  entityId: string;
  entityName: string;
  timestamp: string;
  previousValue?: string;
  newValue?: string;
  remarks?: string;
  documentRef?: string;
  integrityHash: string;
  ipAddress: string;
  severity: 'info' | 'warning' | 'critical';
}

export interface SecurityEvent {
  id: string;
  eventType: 'failed_login' | 'unauthorized_access' | 'bulk_download' | 'restricted_record_access' | 'unusual_activity' | 'api_abuse' | 'record_modification_attempt' | 'session_anomaly';
  userId?: string;
  userName?: string;
  timestamp: string;
  ipAddress: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'investigating' | 'resolved' | 'false_positive';
  affectedResource?: string;
  resolvedBy?: string;
  resolvedAt?: string;
  location?: string;
}

export interface Notification {
  id: string;
  type: 'fdr_expiry' | 'maturity_alert' | 'renewal_reminder' | 'verification_pending' | 'document_discrepancy' | 'release_request' | 'security_alert' | 'compliance_warning';
  title: string;
  message: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  isRead: boolean;
  timestamp: string;
  institutionId?: string;
  institutionName?: string;
  fdrId?: string;
  fdrNumber?: string;
  link?: string;
}

export interface AnomalyRecord {
  id: string;
  type: 'duplicate_fdr' | 'duplicate_document' | 'suspicious_pattern' | 'repeated_bank_reference';
  severity: 'low' | 'medium' | 'high' | 'critical';
  institution1Id: string;
  institution1Name: string;
  institution2Id: string;
  institution2Name: string;
  fdr1Number: string;
  fdr2Number: string;
  description: string;
  detectedDate: string;
  status: 'open' | 'investigating' | 'resolved' | 'false_positive';
  investigatedBy?: string;
  notes?: string;
}

export interface RiskAssessment {
  fdrId: string;
  fdrNumber: string;
  institutionId: string;
  institutionName: string;
  riskScore: number;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  factors: RiskFactor[];
  recommendedAction: string;
  daysToMaturity: number;
  lastUpdated: string;
}

export interface RiskFactor {
  factor: string;
  weight: number;
  score: number;
  description: string;
}
