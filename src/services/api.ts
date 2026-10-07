import {
  AnalysisResult,
  BackendScanResult,
  EvidenceItem,
  RiskLevel,
  InputType,
} from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export async function scanFileApi(file: File): Promise<BackendScanResult> {
  const endpoint = `${API_BASE_URL}/api/v1/scan`;

  const formData = new FormData();
  formData.append('file', file);

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      body: formData,
      // Do NOT set Content-Type header manually.
      // The browser sets multipart/form-data with the boundary automatically.
    });

    if (!response.ok) {
      let message = "UNMASK couldn't analyze this file. Please check the file type and try again.";
      try {
        const errorJson = await response.json();
        if (errorJson && errorJson.detail) {
          if (typeof errorJson.detail === 'string') {
            message = errorJson.detail;
          } else if (Array.isArray(errorJson.detail)) {
            message = errorJson.detail.map((err: { msg?: string }) => err.msg || 'Validation error').join('; ');
          }
        }
      } catch {
        if (response.status === 400) {
          message = "UNMASK couldn't analyze this file. Unsupported or empty file format.";
        } else if (response.status === 422) {
          message = "UNMASK couldn't process this request. Invalid file upload payload.";
        } else if (response.status === 500) {
          message = "UNMASK encountered an internal server error while analyzing this file.";
        }
      }
      throw new Error(message);
    }

    const data: BackendScanResult = await response.json();
    return data;
  } catch (error) {
    if (error instanceof Error) {
      if (error.name === 'TypeError' || error.message.includes('fetch') || error.message.includes('Failed to fetch')) {
        throw new Error("UNMASK server is unavailable. Please check backend status at http://localhost:8000 and try again.");
      }
      throw error;
    }
    throw new Error("UNMASK couldn't analyze this file. Please check the file type and try again.");
  }
}

export function mapBackendToFrontendResult(backendData: BackendScanResult): AnalysisResult {
  const rawRisk = (backendData.risk_level || 'safe').toLowerCase();
  const riskLevel: RiskLevel = rawRisk === 'high' ? 'HIGH' : rawRisk === 'suspicious' ? 'SUSPICIOUS' : 'SAFE';

  const rawFileType = (backendData.file_type || 'png').toUpperCase();
  const fileType: InputType = ['PDF', 'PNG', 'JPG', 'JPEG'].includes(rawFileType)
    ? (rawFileType as InputType)
    : 'PNG';

  // Map Evidence Cards
  const evidence: EvidenceItem[] = (backendData.evidence || []).map((ev, i) => {
    const sev = (ev.severity || 'safe').toLowerCase();
    const status: RiskLevel = sev === 'high' ? 'HIGH' : sev === 'suspicious' ? 'SUSPICIOUS' : 'SAFE';

    let category: EvidenceItem['category'] = 'FILE';
    if (ev.category === 'contact') category = 'CONTACT';
    else if (ev.category === 'url' || ev.category === 'qr') category = 'URL';
    else if (ev.category === 'social_engineering') category = 'LANGUAGE';
    else if (ev.category === 'identity') category = 'IDENTITY';

    return {
      id: `ev-${i + 1}`,
      title: ev.title,
      status,
      explanation: ev.description,
      details: ev.description,
      category,
    };
  });

  // Extract verification objects if available
  const ver = backendData.verification;
  const claimedOrgName = ver?.organization?.entity && ver.organization.entity !== 'None'
    ? ver.organization.entity
    : (backendData.contact_verification?.[0]?.claimed_organization || 'Unverified entity');

  // Map Contact Verification
  const extractedPhones = backendData.extracted?.phone_numbers || [];
  let phoneStatus: 'MISMATCH' | 'MATCH' | 'UNVERIFIED' = 'UNVERIFIED';
  let phoneFound = extractedPhones.length > 0 ? extractedPhones.join(', ') : 'No phone numbers detected.';
  let verifiedPhone = 'Contact verification unavailable at this stage.';
  let phoneDetails = 'Phone number directory lookup unverified at this stage.';

  if (ver?.phones && ver.phones.length > 0) {
    const pv = ver.phones[0];
    phoneFound = pv.entity;
    if (pv.status === 'verified') {
      phoneStatus = 'MATCH';
      verifiedPhone = pv.entity;
    } else if (pv.status === 'mismatch') {
      phoneStatus = 'MISMATCH';
      verifiedPhone = 'Official number mismatch';
    } else {
      phoneStatus = 'UNVERIFIED';
    }
    phoneDetails = `${pv.evidence} (Source: ${pv.source})`;
  } else if (backendData.contact_verification && backendData.contact_verification.length > 0) {
    const cv = backendData.contact_verification[0];
    phoneFound = cv.phone_found || phoneFound;
    verifiedPhone = cv.verified_contact || verifiedPhone;
    const cvStatusRaw = (cv.status || 'unverified').toLowerCase();
    phoneStatus = cvStatusRaw === 'match' ? 'MATCH' : cvStatusRaw === 'mismatch' ? 'MISMATCH' : 'UNVERIFIED';
    phoneDetails = cv.details;
  }

  const contactVerification = {
    claimedOrganization: claimedOrgName,
    phoneFound,
    verifiedOrganizationContact: verifiedPhone,
    status: phoneStatus,
    verificationDetails: phoneDetails,
  };

  // Map Link Analysis & QR Codes
  const extractedUrls = backendData.extracted?.urls || [];
  const extractedQrs = backendData.extracted?.qr_codes || [];
  const hasQrCode = extractedQrs.length > 0;

  let linkStatus: RiskLevel = hasQrCode || extractedUrls.length > 0 ? 'SUSPICIOUS' : 'SAFE';
  let targetDestination = extractedUrls.length > 0 
    ? extractedUrls.join(', ') 
    : (extractedQrs.length > 0 ? extractedQrs.join(', ') : 'No URLs detected.');
  let officialDomain = 'Unverified';
  let linkNotes = !hasQrCode && extractedUrls.length === 0 ? 'No QR codes or URLs detected.' : 'Extracted payload inspected.';

  if (ver?.domains && ver.domains.length > 0) {
    const dv = ver.domains[0];
    targetDestination = dv.entity;
    if (dv.status === 'verified') {
      linkStatus = 'SAFE';
      officialDomain = dv.entity;
    } else if (dv.status === 'mismatch') {
      linkStatus = 'HIGH';
      officialDomain = 'Trusted domain mismatch';
    } else {
      linkStatus = rawRisk === 'high' ? 'HIGH' : rawRisk === 'suspicious' ? 'SUSPICIOUS' : 'SAFE';
    }
    linkNotes = `${dv.evidence} (Source: ${dv.source})`;
  } else if (backendData.link_analysis && backendData.link_analysis.length > 0) {
    const la = backendData.link_analysis[0];
    targetDestination = la.url_or_qr || targetDestination;
    officialDomain = la.destination_domain || officialDomain;
    const laStatusRaw = (la.status || 'safe').toLowerCase();
    linkStatus = laStatusRaw === 'high' ? 'HIGH' : laStatusRaw === 'suspicious' ? 'SUSPICIOUS' : 'SAFE';
    linkNotes = la.notes;
  }

  const linkAnalysis = {
    hasQrCode,
    qrDestination: targetDestination,
    claimedOrg: claimedOrgName,
    officialDomain,
    status: linkStatus,
    notes: linkNotes,
  };

  const aiAssessment = backendData.ai_assessment || undefined;
  const primaryFinding = backendData.threat_type || 'Forensic Scan Results';
  const summaryText = aiAssessment?.summary || backendData.summary || 'UNMASK completed analysis on uploaded document.';

  return {
    id: backendData.scan_id || `scan-${Date.now()}`,
    filename: backendData.filename || 'Uploaded_File',
    fileType,
    fileSize: 'Processed',
    timestamp: new Date().toISOString(),
    date: 'Just now',
    riskLevel,
    primaryFinding,
    supportingText: summaryText,
    evidence,
    contactVerification,
    linkAnalysis,
    aiExplanation: summaryText,
    aiAssessment,
    recommendedActions: {
      primaryAction: aiAssessment?.recommended_action || backendData.recommendation || 'Confirm organization details through an official channel.',
      secondaryInstruction: 'Do not use unverified phone numbers or URLs provided in suspicious documents.'
    },
    riskSummary: {
      risk: riskLevel,
      identity: ver?.organization?.status === 'verified' ? 'VERIFIED' : (riskLevel === 'HIGH' ? 'NOT VERIFIED' : 'PARTIAL'),
      contact: phoneStatus,
      qr: hasQrCode ? (riskLevel === 'HIGH' ? 'HIGH RISK' : 'SUSPICIOUS') : (extractedUrls.length > 0 ? 'SUSPICIOUS' : 'NONE'),
      socialEngineering: (backendData.evidence || []).some(e => e.category === 'social_engineering')
        ? (riskLevel === 'HIGH' ? 'HIGH' : 'MEDIUM')
        : 'LOW'
    },
    rawResult: backendData
  };
}
