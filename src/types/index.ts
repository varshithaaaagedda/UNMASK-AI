export type RiskLevel = 'HIGH' | 'SUSPICIOUS' | 'SAFE';

export type InputType = 'PDF' | 'PNG' | 'JPG' | 'JPEG' | 'URL' | 'CONTACT';

export interface EvidenceItem {
  id: string;
  title: string;
  status: RiskLevel;
  explanation: string;
  details?: string;
  category: 'CONTACT' | 'URL' | 'LANGUAGE' | 'IDENTITY' | 'FILE';
}

export interface ContactVerification {
  claimedOrganization: string;
  phoneFound: string;
  verifiedOrganizationContact: string;
  status: 'MISMATCH' | 'MATCH' | 'UNVERIFIED';
  verificationDetails: string;
}

export interface LinkAnalysis {
  hasQrCode: boolean;
  qrDestination?: string;
  claimedOrg?: string;
  officialDomain?: string;
  status: RiskLevel;
  notes?: string;
}

export interface RiskSummaryMetrics {
  risk: RiskLevel;
  identity: 'VERIFIED' | 'NOT VERIFIED' | 'PARTIAL';
  contact: 'MATCH' | 'MISMATCH' | 'UNVERIFIED';
  qr: 'SAFE' | 'SUSPICIOUS' | 'HIGH RISK' | 'NONE';
  socialEngineering: 'LOW' | 'MEDIUM' | 'HIGH';
}

export interface BackendAIAssessment {
  headline: string;
  summary: string;
  key_findings: string[];
  confidence: string; // "high" | "medium" | "low"
  recommended_action: string;
  reasoning_basis: string[];
}

export interface AnalysisResult {
  id: string;
  filename: string;
  fileType: InputType;
  fileSize?: string;
  timestamp: string;
  date: string;
  riskLevel: RiskLevel;
  primaryFinding: string;
  supportingText: string;
  evidence: EvidenceItem[];
  contactVerification: ContactVerification;
  linkAnalysis: LinkAnalysis;
  aiExplanation: string;
  aiAssessment?: BackendAIAssessment;
  recommendedActions: {
    primaryAction: string;
    secondaryInstruction: string;
  };
  riskSummary: RiskSummaryMetrics;
  rawResult?: BackendScanResult;
}

export interface HistoryItem {
  id: string;
  filename: string;
  type: InputType;
  risk: RiskLevel;
  detectedIssue: string;
  date: string;
}

export interface ActiveScanProgress {
  step: number;
  label: string;
  completedSteps: string[];
  isDone: boolean;
}

// FastAPI Backend API Schema Definitions
export interface BackendOCRDiagnostics {
  available: boolean;
  engine: string;
  executable?: string | null;
  version?: string | null;
  error?: string | null;
}

export interface BackendExtractedContent {
  text: string;
  phone_numbers: string[];
  urls: string[];
  qr_codes: string[];
}

export interface BackendEvidence {
  title: string;
  severity: string; // "safe" | "suspicious" | "high"
  description: string;
  category: string; // "identity" | "contact" | "qr" | "url" | "social_engineering"
}

export interface BackendContactVerificationItem {
  claimed_organization: string;
  phone_found: string;
  verified_contact?: string | null;
  status: string; // "match" | "mismatch" | "unverified"
  details: string;
}

export interface BackendLinkAnalysisItem {
  url_or_qr: string;
  destination_domain?: string | null;
  claimed_domain?: string | null;
  status: string; // "safe" | "suspicious" | "high"
  notes: string;
}

export interface BackendVerificationItem {
  entity: string;
  type: string; // "organization" | "phone" | "domain" | "url" | "qr"
  status: string; // "verified" | "mismatch" | "unverified" | "suspicious"
  evidence: string;
  source: string;
  confidence: string; // "high" | "medium" | "low"
}

export interface BackendVerificationResult {
  organization?: BackendVerificationItem | null;
  phones: BackendVerificationItem[];
  domains: BackendVerificationItem[];
  qr_codes: BackendVerificationItem[];
}

export interface BackendScanResult {
  scan_id: string;
  filename: string;
  file_type: string;
  risk_level: string; // "safe" | "suspicious" | "high"
  threat_type: string;
  summary: string;
  ocr?: BackendOCRDiagnostics | null;
  extracted: BackendExtractedContent;
  evidence: BackendEvidence[];
  contact_verification: BackendContactVerificationItem[];
  link_analysis: BackendLinkAnalysisItem[];
  verification?: BackendVerificationResult | null;
  recommendation: string;
  ai_assessment?: BackendAIAssessment | null;
}
