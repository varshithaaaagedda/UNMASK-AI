import uuid
from typing import List, Dict, Any, Optional
from urllib.parse import urlparse
from app.models.schemas import (
    ScanResult,
    ExtractedContent,
    Evidence,
    ContactVerificationItem,
    LinkAnalysisItem,
    OCRDiagnostics,
    VerificationResult,
    VerificationItem
)
from app.services.ai_reasoning_service import AIReasoningService

def evaluate_risk(
    filename: str,
    file_type: str,
    extracted_text: str,
    phone_numbers: List[str],
    urls: List[str],
    qr_codes: List[str],
    social_engineering: Dict[str, Any],
    claimed_entities: List[str],
    ocr_status: Optional[Dict[str, Any]] = None,
    verification: Optional[VerificationResult] = None,
    url_signals: Optional[List[Dict[str, Any]]] = None
) -> ScanResult:
    """
    Evaluates risk heuristics deterministically and generates structured evidence.
    Enforces strict separation between OBSERVED FACT and INFERENCE.
    """
    scan_id = f"scan-{uuid.uuid4().hex[:10]}"
    score = 0
    evidence_list: List[Evidence] = []
    contact_verification_list: List[ContactVerificationItem] = []
    link_analysis_list: List[LinkAnalysisItem] = []

    claimed_org_name = claimed_entities[0] if claimed_entities else "Claimed Entity"

    # Rule 1: High Urgency (+1)
    if social_engineering.get("has_urgency"):
        score += 1
        phrases_str = ", ".join(f"'{p}'" for p in social_engineering.get("detected_phrases", [])[:3])
        evidence_list.append(Evidence(
            title="Urgency language detected",
            severity="suspicious",
            description=f"Message text contains high-pressure framing: {phrases_str}.",
            category="social_engineering"
        ))

    # Rule 2: Credential Request (+2)
    if social_engineering.get("has_credential_request"):
        score += 2
        evidence_list.append(Evidence(
            title="Account credential request phrasing",
            severity="suspicious",
            description="Document text prompts recipient to confirm account credentials or verify identity.",
            category="social_engineering"
        ))

    # Rule 3: Payment / Transfer Request (+2)
    if social_engineering.get("has_payment_request"):
        score += 2
        evidence_list.append(Evidence(
            title="Payment or fund transfer request",
            severity="high",
            description="Message requests prompt payment, wire transfer, or financial transaction.",
            category="social_engineering"
        ))

    # Verification Engine Signal Processing (Phase 3)
    if verification:
        # Organization Identity Signal
        org_v = verification.organization
        if org_v:
            if org_v.status == "verified":
                evidence_list.append(Evidence(
                    title="Claimed organization recognized",
                    severity="safe",
                    description=org_v.evidence,
                    category="identity"
                ))
            elif org_v.status == "unverified" and claimed_entities:
                evidence_list.append(Evidence(
                    title="Organization unverified in registry",
                    severity="suspicious",
                    description=org_v.evidence,
                    category="identity"
                ))

        # Phone Verification Signals (+3 mismatch, -1 verified)
        for phone_v in verification.phones:
            if phone_v.status == "mismatch":
                score += 3
                evidence_list.append(Evidence(
                    title="Phone contact mismatch",
                    severity="high",
                    description=phone_v.evidence,
                    category="contact"
                ))
                # Fetch official contact for display if available
                official_contact = None
                if verification.organization and verification.organization.status == "verified":
                    from app.services.verification_provider import DemoRegistryProvider
                    prov = DemoRegistryProvider()
                    off_phones = prov.get_official_phones(verification.organization.entity)
                    if off_phones:
                        # Pick formatted phone if present
                        official_contact = next((p for p in off_phones if " " in p), off_phones[0])

                contact_verification_list.append(ContactVerificationItem(
                    claimed_organization=claimed_org_name,
                    phone_found=phone_v.entity,
                    verified_contact=official_contact,
                    status="mismatch",
                    details=phone_v.evidence
                ))
            elif phone_v.status == "verified":
                score -= 1
                evidence_list.append(Evidence(
                    title="Phone contact verified",
                    severity="safe",
                    description=phone_v.evidence,
                    category="contact"
                ))
                contact_verification_list.append(ContactVerificationItem(
                    claimed_organization=claimed_org_name,
                    phone_found=phone_v.entity,
                    verified_contact=phone_v.entity,
                    status="match",
                    details=phone_v.evidence
                ))
            else:
                contact_verification_list.append(ContactVerificationItem(
                    claimed_organization=claimed_org_name,
                    phone_found=phone_v.entity,
                    verified_contact=None,
                    status="unverified",
                    details=phone_v.evidence
                ))

        # Domain Verification Signals (+3 mismatch, +2 lookalike, -1 verified)
        for dom_v in verification.domains:
            if dom_v.status == "mismatch":
                score += 3
                is_lookalike = "lookalike" in dom_v.evidence.lower()
                if is_lookalike:
                    score += 2
                    evidence_list.append(Evidence(
                        title="Possible lookalike domain",
                        severity="high",
                        description=dom_v.evidence,
                        category="url"
                    ))
                else:
                    evidence_list.append(Evidence(
                        title="Domain mismatch detected",
                        severity="high",
                        description=dom_v.evidence,
                        category="url"
                    ))
                
                official_domain = None
                if verification.organization and verification.organization.status == "verified":
                    from app.services.verification_provider import DemoRegistryProvider
                    prov = DemoRegistryProvider()
                    off_doms = prov.get_official_domains(verification.organization.entity)
                    if off_doms:
                        official_domain = off_doms[0]

                link_analysis_list.append(LinkAnalysisItem(
                    url_or_qr=dom_v.entity,
                    destination_domain=dom_v.entity,
                    claimed_domain=official_domain or claimed_org_name,
                    status="high",
                    notes=dom_v.evidence
                ))
            elif dom_v.status == "verified":
                score -= 1
                evidence_list.append(Evidence(
                    title="Domain verified",
                    severity="safe",
                    description=dom_v.evidence,
                    category="url"
                ))
                link_analysis_list.append(LinkAnalysisItem(
                    url_or_qr=dom_v.entity,
                    destination_domain=dom_v.entity,
                    claimed_domain=claimed_org_name,
                    status="safe",
                    notes=dom_v.evidence
                ))
            else:
                link_analysis_list.append(LinkAnalysisItem(
                    url_or_qr=dom_v.entity,
                    destination_domain=dom_v.entity,
                    claimed_domain=claimed_org_name,
                    status="safe" if score <= 2 else "suspicious",
                    notes=dom_v.evidence
                ))

        # QR Verification Signals (+3 mismatch, -1 verified)
        for qr_v in verification.qr_codes:
            if qr_v.status == "mismatch":
                score += 3
                evidence_list.append(Evidence(
                    title="QR destination mismatch",
                    severity="high",
                    description=qr_v.evidence,
                    category="qr"
                ))
                if not any(item.url_or_qr == qr_v.entity for item in link_analysis_list):
                    link_analysis_list.append(LinkAnalysisItem(
                        url_or_qr=qr_v.entity,
                        destination_domain=qr_v.entity,
                        claimed_domain=claimed_org_name,
                        status="high",
                        notes=qr_v.evidence
                    ))
            elif qr_v.status == "verified":
                score -= 1
                evidence_list.append(Evidence(
                    title="QR destination verified",
                    severity="safe",
                    description=qr_v.evidence,
                    category="qr"
                ))
            else:
                evidence_list.append(Evidence(
                    title="Embedded QR code extracted",
                    severity="suspicious" if score >= 3 else "safe",
                    description=qr_v.evidence,
                    category="qr"
                ))

    # Process URL Structural Signals (+1 each)
    if url_signals:
        for sig in url_signals:
            score += 1
            evidence_list.append(Evidence(
                title=sig["signal"].replace("_", " ").title(),
                severity=sig["severity"],
                description=sig["description"],
                category="url"
            ))

    # Fallbacks if verification items list were not passed or empty
    if not contact_verification_list and phone_numbers:
        for phone in phone_numbers:
            contact_verification_list.append(ContactVerificationItem(
                claimed_organization=claimed_org_name,
                phone_found=phone,
                verified_contact=None,
                status="unverified",
                details="Phone number extracted from document text. Directory lookup unverified at this stage."
            ))

    if not link_analysis_list and (urls or qr_codes):
        for item_str in urls + qr_codes:
            parsed = urlparse(item_str if item_str.startswith("http") else f"http://{item_str}")
            domain = parsed.netloc or item_str
            link_analysis_list.append(LinkAnalysisItem(
                url_or_qr=item_str,
                destination_domain=domain,
                claimed_domain=claimed_org_name,
                status="suspicious" if score >= 3 else "safe",
                notes="Extracted payload inspected."
            ))

    # Final Risk Level Determination
    if score <= 2:
        risk_level = "safe"
        threat_type = "Low Risk / Standard Document"
        summary = "UNMASK completed verification analysis. No major impersonation or high-risk mismatch signals were triggered."
        recommendation = "Content appears consistent with standard communication. Exercise standard verification practices."
    elif 3 <= score <= 5:
        risk_level = "suspicious"
        threat_type = "Unverified Communications / Urgency Signals"
        summary = "UNMASK detected suspicious signals including urgency language or unverified contact/domain links."
        recommendation = "Do not use contact numbers or links provided in this message. Verify the sender through an independently sourced official channel."
    else:
        risk_level = "high"
        threat_type = "Potential Impersonation / High Risk"
        summary = "UNMASK identified high-risk signals including contact or domain mismatches, lookalike patterns, or coercive framing."
        recommendation = "Do not call the number, scan the QR code, or click links provided in this document. Confirm the organization independently."

    extracted_content = ExtractedContent(
        text=extracted_text[:1000] if extracted_text else "",
        phone_numbers=phone_numbers,
        urls=urls,
        qr_codes=qr_codes
    )

    ocr_obj = OCRDiagnostics(**ocr_status) if ocr_status else None

    ai_assessment = AIReasoningService().generate_assessment(
        claimed_org=claimed_org_name,
        extracted_text=extracted_text,
        phone_numbers=phone_numbers,
        urls=urls,
        qr_codes=qr_codes,
        verification=verification,
        social_engineering=social_engineering,
        risk_score=score,
        risk_level=risk_level,
        evidence_items=evidence_list
    )

    return ScanResult(
        scan_id=scan_id,
        filename=filename,
        file_type=file_type,
        risk_level=risk_level,
        threat_type=threat_type,
        summary=summary,
        ocr=ocr_obj,
        extracted=extracted_content,
        evidence=evidence_list,
        contact_verification=contact_verification_list,
        link_analysis=link_analysis_list,
        verification=verification,
        recommendation=recommendation,
        ai_assessment=ai_assessment
    )
