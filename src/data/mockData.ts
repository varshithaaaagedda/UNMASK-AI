import { AnalysisResult, HistoryItem, InputType } from '@/types';

export const INITIAL_MOCK_RESULTS: Record<string, AnalysisResult> = {
  'invoice-september': {
    id: 'invoice-september',
    filename: 'Invoice_September.pdf',
    fileType: 'PDF',
    fileSize: '1.2 MB',
    timestamp: '2026-10-06T09:42:00Z',
    date: 'Today at 09:42 AM',
    riskLevel: 'HIGH',
    primaryFinding: 'Potential impersonation detected',
    supportingText: 'UNMASK found multiple signals that conflict with the claimed organization identity.',
    evidence: [
      {
        id: 'ev-1',
        title: 'Contact mismatch',
        status: 'HIGH',
        explanation: "The supplied phone number (+91 98765 43210) does not match the organization's verified contact information.",
        details: 'Verified database records indicate Northstar Financial official contact is +91 1800 123 4567. The number listed in the document has been flagged in recent impersonation reports.',
        category: 'CONTACT'
      },
      {
        id: 'ev-2',
        title: 'Suspicious QR destination',
        status: 'HIGH',
        explanation: 'The QR code redirects to a domain that does not match the claimed organization.',
        details: 'QR payload resolves to "https://northstar-account-check.example-security-verify.com", registered 48 hours ago under a privacy proxy, rather than the legitimate domain "northstarbank.example".',
        category: 'URL'
      },
      {
        id: 'ev-3',
        title: 'Urgency language',
        status: 'SUSPICIOUS',
        explanation: 'The message pressures the recipient to take immediate action within 2 hours.',
        details: 'Natural language parser detected high-pressure coercive framing ("Immediate suspension unless paid in 2 hours"), a classic indicator of social engineering tactics.',
        category: 'LANGUAGE'
      },
      {
        id: 'ev-4',
        title: 'Identity claim',
        status: 'SUSPICIOUS',
        explanation: 'The document claims to represent an organization that could not be independently verified via digital signature.',
        details: 'PDF digital signature header is missing or unverified. Issuer authority certificate is not present in standard enterprise trust store.',
        category: 'IDENTITY'
      }
    ],
    contactVerification: {
      claimedOrganization: 'Northstar Financial',
      phoneFound: '+91 98765 43210',
      verifiedOrganizationContact: '+91 1800 123 4567',
      status: 'MISMATCH',
      verificationDetails: 'Verified against official regulatory registry database (Ref #REG-2026-881A).'
    },
    linkAnalysis: {
      hasQrCode: true,
      qrDestination: 'https://northstar-account-check.example-security-verify.com',
      claimedOrg: 'Northstar Financial',
      officialDomain: 'northstarbank.example',
      status: 'HIGH',
      notes: 'Domain age: 2 days old. SSL Issuer: Let\'s Encrypt (Self-declared hostname mismatch).'
    },
    aiExplanation: "This document appears to impersonate a financial organization. The strongest warning signal is the mismatch between the supplied phone number and the organization's verified contact information. The embedded QR code also points to a domain unrelated to the organization.",
    recommendedActions: {
      primaryAction: 'Do not call the number or scan the QR code provided in this document.',
      secondaryInstruction: 'Verify the organization using an independently sourced official website or contact channel.'
    },
    riskSummary: {
      risk: 'HIGH',
      identity: 'NOT VERIFIED',
      contact: 'MISMATCH',
      qr: 'HIGH RISK',
      socialEngineering: 'HIGH'
    }
  },

  'bank-message': {
    id: 'bank-message',
    filename: 'Bank_Message.png',
    fileType: 'PNG',
    fileSize: '450 KB',
    timestamp: '2026-10-05T16:15:00Z',
    date: 'Yesterday at 04:15 PM',
    riskLevel: 'SUSPICIOUS',
    primaryFinding: 'Unverified SMS authentication link',
    supportingText: 'UNMASK detected an shortened URL directing to a newly registered non-standard domain.',
    evidence: [
      {
        id: 'ev-bm-1',
        title: 'Shortened link destination',
        status: 'SUSPICIOUS',
        explanation: 'The embedded link redirects through an anonymous URL shortener service.',
        details: 'The link shortener resolves to "apex-verify-auth.example", which is not part of the standard institutional domain umbrella.',
        category: 'URL'
      },
      {
        id: 'ev-bm-2',
        title: 'Account alert phrasing',
        status: 'SUSPICIOUS',
        explanation: 'Message claims account credentials will expire without immediate validation.',
        details: 'Standard financial security protocol specifies password reset triggers are initiated by user request, not unprompted broadcast SMS.',
        category: 'LANGUAGE'
      }
    ],
    contactVerification: {
      claimedOrganization: 'Apex Trust Bank',
      phoneFound: '+1 (800) 555-0199',
      verifiedOrganizationContact: '+1 (800) 555-0100',
      status: 'UNVERIFIED',
      verificationDetails: 'Originating sender code belongs to a standard web-to-SMS gateway.'
    },
    linkAnalysis: {
      hasQrCode: false,
      qrDestination: 'https://apex-verify-auth.example/login',
      claimedOrg: 'Apex Trust Bank',
      officialDomain: 'apextrust.example',
      status: 'SUSPICIOUS',
      notes: 'Domain registered 14 days ago. Contains login form matching bank visual branding.'
    },
    aiExplanation: "This screenshot contains a security notice claiming to be from Apex Trust Bank. While the visual formatting resembles standard bank communications, the destination link leads to an unverified third-party domain rather than the bank's official portal.",
    recommendedActions: {
      primaryAction: 'Do not click the link or log in through the provided web page.',
      secondaryInstruction: 'Navigate directly to your official banking app or URL manually entered in your browser.'
    },
    riskSummary: {
      risk: 'SUSPICIOUS',
      identity: 'PARTIAL',
      contact: 'UNVERIFIED',
      qr: 'SUSPICIOUS',
      socialEngineering: 'MEDIUM'
    }
  },

  'company-invite': {
    id: 'company-invite',
    filename: 'Company_Invite.pdf',
    fileType: 'PDF',
    fileSize: '880 KB',
    timestamp: '2026-10-04T11:20:00Z',
    date: '2 days ago',
    riskLevel: 'SAFE',
    primaryFinding: 'Verified digital signature & authentic domains',
    supportingText: 'UNMASK verified all contact numbers, domain records, and cryptographically signed headers.',
    evidence: [
      {
        id: 'ev-ci-1',
        title: 'Verified digital signature',
        status: 'SAFE',
        explanation: 'Document contains a valid cryptographic signature issued to Acorn Cloud Inc.',
        details: 'Certificate chain validated against DigiCert Trusted Root Authority. Timestamp authority confirmed intact.',
        category: 'IDENTITY'
      },
      {
        id: 'ev-ci-2',
        title: 'Official domain alignment',
        status: 'SAFE',
        explanation: 'All links point to verified corporate subdomains (acorncloud.example).',
        details: 'DNS resolution confirms ownership matching company corporate registrar records.',
        category: 'URL'
      }
    ],
    contactVerification: {
      claimedOrganization: 'Acorn Cloud Inc.',
      phoneFound: '+1 (888) 234-5678',
      verifiedOrganizationContact: '+1 (888) 234-5678',
      status: 'MATCH',
      verificationDetails: 'Contact number matches published enterprise directory.'
    },
    linkAnalysis: {
      hasQrCode: true,
      qrDestination: 'https://calendar.acorncloud.example/meet/v1',
      claimedOrg: 'Acorn Cloud Inc.',
      officialDomain: 'acorncloud.example',
      status: 'SAFE',
      notes: 'Domain verified. SSL Certificate valid for 365 days.'
    },
    aiExplanation: "This document shows strong evidence of authenticity. The digital signature is valid, all included web links belong to the official organization domain, and contact details match verified public directory records.",
    recommendedActions: {
      primaryAction: 'No action required. Content verified as safe.',
      secondaryInstruction: 'You may proceed with the meeting link or document request normally.'
    },
    riskSummary: {
      risk: 'SAFE',
      identity: 'VERIFIED',
      contact: 'MATCH',
      qr: 'SAFE',
      socialEngineering: 'LOW'
    }
  }
};

export const RECENT_SCANS_LIST: HistoryItem[] = [
  {
    id: 'invoice-september',
    filename: 'Invoice_September.pdf',
    type: 'PDF',
    risk: 'HIGH',
    detectedIssue: 'Contact mismatch',
    date: 'Today'
  },
  {
    id: 'bank-message',
    filename: 'Bank_Message.png',
    type: 'PNG',
    risk: 'SUSPICIOUS',
    detectedIssue: 'Suspicious QR destination',
    date: 'Yesterday'
  },
  {
    id: 'company-invite',
    filename: 'Company_Invite.pdf',
    type: 'PDF',
    risk: 'SAFE',
    detectedIssue: 'No major issues detected',
    date: '2 days ago'
  }
];

export function createDynamicAnalysis(inputName: string, inputType: InputType): AnalysisResult {
  const isUrl = inputType === 'URL' || inputName.toLowerCase().startsWith('http') || inputName.toLowerCase().includes('www.');
  const isContact = inputType === 'CONTACT' || /^\+?[0-9\s-]{7,15}$/.test(inputName.trim());
  
  if (isUrl) {
    const isCleanDomain = inputName.includes('google') || inputName.includes('github') || inputName.includes('microsoft');
    const risk: 'HIGH' | 'SUSPICIOUS' | 'SAFE' = isCleanDomain ? 'SAFE' : 'HIGH';
    
    return {
      id: `scan-${Date.now()}`,
      filename: inputName,
      fileType: 'URL',
      fileSize: 'Web URL',
      timestamp: new Date().toISOString(),
      date: 'Just now',
      riskLevel: risk,
      primaryFinding: isCleanDomain ? 'Verified authentic web domain' : 'Unverified domain with high-risk redirect patterns',
      supportingText: isCleanDomain 
        ? 'UNMASK confirmed domain registration, SSL certificates, and official organizational ownership.' 
        : 'UNMASK detected recent domain registration and potential credential harvesting indicators.',
      evidence: [
        {
          id: 'ev-dyn-1',
          title: isCleanDomain ? 'Verified SSL Certificate' : 'Suspicious Domain Reputation',
          status: risk,
          explanation: isCleanDomain ? 'Valid EV SSL certificate issued to verified corporate entity.' : 'Target hostname was registered recently under proxy registration.',
          details: 'Domain WHOIS and Certificate transparency logs analyzed.',
          category: 'URL'
        },
        {
          id: 'ev-dyn-2',
          title: isCleanDomain ? 'Clean Safety Record' : 'Login Form Detector',
          status: isCleanDomain ? 'SAFE' : 'SUSPICIOUS',
          explanation: isCleanDomain ? 'No malicious activity reported across 70+ threat engines.' : 'Page contains password field mimicking known cloud service login.',
          details: 'Static DOM and form action analysis completed.',
          category: 'IDENTITY'
        }
      ],
      contactVerification: {
        claimedOrganization: isCleanDomain ? 'Verified Web Entity' : 'Unknown Provider',
        phoneFound: 'N/A',
        verifiedOrganizationContact: 'N/A',
        status: 'UNVERIFIED',
        verificationDetails: 'URL analysis only'
      },
      linkAnalysis: {
        hasQrCode: false,
        qrDestination: inputName,
        claimedOrg: isCleanDomain ? 'Official Services' : 'Claimed Portal',
        officialDomain: isCleanDomain ? inputName : 'unknown-official.example',
        status: risk,
        notes: isCleanDomain ? 'Clean security record.' : 'Domain age less than 30 days.'
      },
      aiExplanation: isCleanDomain
        ? 'This URL corresponds to a known, established organization with valid cryptographic trust certificates.'
        : 'This URL raises safety concerns due to recent domain creation and potential brand impersonation markers.',
      recommendedActions: {
        primaryAction: isCleanDomain ? 'Safe to visit.' : 'Do not enter credentials or personal information on this page.',
        secondaryInstruction: 'Always confirm web address spelling in your browser address bar.'
      },
      riskSummary: {
        risk,
        identity: isCleanDomain ? 'VERIFIED' : 'NOT VERIFIED',
        contact: 'UNVERIFIED',
        qr: 'NONE',
        socialEngineering: isCleanDomain ? 'LOW' : 'HIGH'
      }
    };
  }

  if (isContact) {
    return {
      id: `scan-${Date.now()}`,
      filename: inputName,
      fileType: 'CONTACT',
      fileSize: 'Contact String',
      timestamp: new Date().toISOString(),
      date: 'Just now',
      riskLevel: 'HIGH',
      primaryFinding: 'Contact number flags mismatch with official registry',
      supportingText: 'UNMASK verified this phone number against global telecom registries and corporate contacts.',
      evidence: [
        {
          id: 'ev-cnt-1',
          title: 'Unlisted VOIP route',
          status: 'HIGH',
          explanation: 'Phone number uses a virtual VOIP carrier commonly associated with short-term spoofing.',
          details: 'Carrier lookup indicates Non-Fixed VoIP number origin.',
          category: 'CONTACT'
        },
        {
          id: 'ev-cnt-2',
          title: 'Reported in threat database',
          status: 'HIGH',
          explanation: 'This contact string was flagged in 14 user impersonation complaints in the last 7 days.',
          details: 'Cross-referenced with global threat exchange feeds.',
          category: 'CONTACT'
        }
      ],
      contactVerification: {
        claimedOrganization: 'Claimed Financial Service',
        phoneFound: inputName,
        verifiedOrganizationContact: '+1 (800) 000-1122 (Official)',
        status: 'MISMATCH',
        verificationDetails: 'Mismatch identified via verified organization database.'
      },
      linkAnalysis: {
        hasQrCode: false,
        status: 'SAFE'
      },
      aiExplanation: 'The submitted phone number does not correspond to the official published contact channels for the claimed entity and shows characteristics of temporary virtual routing.',
      recommendedActions: {
        primaryAction: 'Do not call or reply to messages from this phone number.',
        secondaryInstruction: 'Contact the organization directly using the phone number listed on their official website.'
      },
      riskSummary: {
        risk: 'HIGH',
        identity: 'NOT VERIFIED',
        contact: 'MISMATCH',
        qr: 'NONE',
        socialEngineering: 'HIGH'
      }
    };
  }

  // Default File dynamic scan
  const isHighRisk = inputName.toLowerCase().includes('invoice') || inputName.toLowerCase().includes('urgent') || inputName.toLowerCase().includes('payment');
  const risk = isHighRisk ? 'HIGH' : 'SUSPICIOUS';

  return {
    id: `scan-${Date.now()}`,
    filename: inputName,
    fileType: inputType,
    fileSize: '1.4 MB',
    timestamp: new Date().toISOString(),
    date: 'Just now',
    riskLevel: risk,
    primaryFinding: isHighRisk ? 'Potential impersonation detected' : 'Unverified document structure and links',
    supportingText: 'UNMASK completed deep analysis of document layout, contact numbers, embedded URLs, and signature certificates.',
    evidence: [
      {
        id: 'ev-f-1',
        title: 'Contact mismatch',
        status: 'HIGH',
        explanation: 'The supplied phone number does not match the organization\'s verified contact information.',
        details: 'Extracted contact details were checked against official registry databases.',
        category: 'CONTACT'
      },
      {
        id: 'ev-f-2',
        title: 'Suspicious QR destination',
        status: 'HIGH',
        explanation: 'The embedded QR code redirects to an unverified third-party domain.',
        details: 'QR barcode extracted and decoded.',
        category: 'URL'
      },
      {
        id: 'ev-f-3',
        title: 'Urgency language',
        status: 'SUSPICIOUS',
        explanation: 'The document includes language pressuring the recipient for prompt action.',
        details: 'High urgency triggers detected during semantic text pass.',
        category: 'LANGUAGE'
      },
      {
        id: 'ev-f-4',
        title: 'Identity claim',
        status: 'SUSPICIOUS',
        explanation: 'The document claims to represent an organization that could not be independently verified.',
        details: 'No valid digital certificate found.',
        category: 'IDENTITY'
      }
    ],
    contactVerification: {
      claimedOrganization: 'Apex Global Ltd',
      phoneFound: '+91 99887 76655',
      verifiedOrganizationContact: '+91 1800 555 9900',
      status: 'MISMATCH',
      verificationDetails: 'Verified against corporate lookup service.'
    },
    linkAnalysis: {
      hasQrCode: true,
      qrDestination: 'https://apex-global-verify.example',
      claimedOrg: 'Apex Global Ltd',
      officialDomain: 'apexglobal.example',
      status: 'HIGH',
      notes: 'Redirect destination domain differs from claimed corporate root.'
    },
    aiExplanation: `UNMASK analyzed ${inputName} and detected multiple security risk indicators. The most prominent signal is a discrepancy between the contact number in the document and the official verified organization database.`,
    recommendedActions: {
      primaryAction: 'Do not use the contact details or scan embedded codes from this document.',
      secondaryInstruction: 'Verify the organization through an independently sourced official channel.'
    },
    riskSummary: {
      risk: risk,
      identity: 'NOT VERIFIED',
      contact: 'MISMATCH',
      qr: 'HIGH RISK',
      socialEngineering: 'HIGH'
    }
  };
}
