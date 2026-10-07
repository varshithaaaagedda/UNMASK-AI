from typing import List, Optional
from pydantic import BaseModel, Field

class OCRDiagnostics(BaseModel):
    available: bool
    engine: str = "tesseract"
    executable: Optional[str] = None
    version: Optional[str] = None
    error: Optional[str] = None

class ExtractedContent(BaseModel):
    text: str = ""
    phone_numbers: List[str] = Field(default_factory=list)
    urls: List[str] = Field(default_factory=list)
    qr_codes: List[str] = Field(default_factory=list)

class Evidence(BaseModel):
    title: str
    severity: str  # "safe" | "suspicious" | "high"
    description: str
    category: str  # "identity" | "contact" | "qr" | "url" | "social_engineering"

class ContactVerificationItem(BaseModel):
    claimed_organization: str
    phone_found: str
    verified_contact: Optional[str] = None
    status: str  # "match" | "mismatch" | "unverified"
    details: str

class LinkAnalysisItem(BaseModel):
    url_or_qr: str
    destination_domain: Optional[str] = None
    claimed_domain: Optional[str] = None
    status: str  # "safe" | "suspicious" | "high"
    notes: str

class VerificationItem(BaseModel):
    entity: str
    type: str  # "organization" | "phone" | "domain" | "url" | "qr"
    status: str  # "verified" | "mismatch" | "unverified" | "suspicious"
    evidence: str
    source: str
    confidence: str  # "high" | "medium" | "low"
    name: Optional[str] = None
    number: Optional[str] = None

class VerificationResult(BaseModel):
    organization: Optional[VerificationItem] = None
    phones: List[VerificationItem] = Field(default_factory=list)
    domains: List[VerificationItem] = Field(default_factory=list)
    qr_codes: List[VerificationItem] = Field(default_factory=list)

class AIAssessment(BaseModel):
    headline: str
    summary: str
    key_findings: List[str] = Field(default_factory=list)
    confidence: str  # "high" | "medium" | "low"
    recommended_action: str
    reasoning_basis: List[str] = Field(default_factory=list)

class ScanResult(BaseModel):
    scan_id: str
    filename: str
    file_type: str
    risk_level: str  # "safe" | "suspicious" | "high"
    threat_type: str
    summary: str
    ocr: Optional[OCRDiagnostics] = None
    extracted: ExtractedContent
    evidence: List[Evidence] = Field(default_factory=list)
    contact_verification: List[ContactVerificationItem] = Field(default_factory=list)
    link_analysis: List[LinkAnalysisItem] = Field(default_factory=list)
    verification: Optional[VerificationResult] = None
    recommendation: str
    ai_assessment: Optional[AIAssessment] = None
