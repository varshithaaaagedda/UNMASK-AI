import re
from urllib.parse import urlparse
from typing import List, Dict, Any, Optional, Tuple
from app.models.schemas import VerificationItem, VerificationResult
from app.services.verification_provider import VerificationProvider, DemoRegistryProvider

IP_REGEX = re.compile(r'^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$')

def normalize_phone(phone: str) -> str:
    """Strips formatting spaces, dashes, dots, parens; preserves leading '+'."""
    if not phone:
        return ""
    has_plus = phone.strip().startswith("+")
    digits = re.sub(r'\D', '', phone)
    return f"+{digits}" if has_plus else digits

def extract_hostname(url_or_domain: str) -> str:
    """Extracts raw hostname from a URL or domain string."""
    if not url_or_domain:
        return ""
    text = url_or_domain.strip()
    if not text.startswith(('http://', 'https://')):
        text = f"http://{text}"
    try:
        parsed = urlparse(text)
        hostname = parsed.netloc or parsed.path
        # Remove port if present
        if ':' in hostname:
            hostname = hostname.split(':')[0]
        return hostname.lower()
    except Exception:
        return url_or_domain.lower()

def detect_lookalike_domain(trusted_domain: str, candidate_domain: str) -> bool:
    """
    Lightweight heuristic check to detect lookalike domain patterns.
    Examples:
    northstar.example vs northstar-security.example -> True
    northstar.example vs northstarr.example -> True
    """
    if not trusted_domain or not candidate_domain:
        return False
    
    t_host = extract_hostname(trusted_domain)
    c_host = extract_hostname(candidate_domain)

    if t_host == c_host:
        return False

    # Extract core name root before TLD (e.g. "northstar" from "northstar.example")
    t_root = t_host.split('.')[0] if '.' in t_host else t_host
    c_root = c_host.split('.')[0] if '.' in c_host else c_host

    if len(t_root) < 3:
        return False

    # Check substring / prefix / suffix match (e.g. northstar-security vs northstar)
    if t_root in c_root or c_root in t_root:
        return True

    # Check 1-2 character edit distance (typosquatting like northstarr)
    if abs(len(t_root) - len(c_root)) <= 2:
        matches = sum(1 for a, b in zip(t_root, c_root) if a == b)
        if matches >= max(len(t_root), len(c_root)) - 2:
            return True

    return False

def verify_organization(
    claimed_org: Optional[str],
    provider: VerificationProvider
) -> VerificationItem:
    """
    1. Organization Verification
    """
    if not claimed_org:
        return VerificationItem(
            entity="None",
            name="None",
            type="organization",
            status="unverified",
            evidence="No claimed organization identified in document text.",
            source=provider.source_name,
            confidence="low"
        )

    trusted = provider.get_trusted_organization(claimed_org)
    if trusted:
        matched_name = trusted.get("name", claimed_org)
        return VerificationItem(
            entity=matched_name,
            name=matched_name,
            type="organization",
            status="verified",
            evidence=f"Claimed organization '{matched_name}' recognized in trusted organization registry.",
            source=provider.source_name,
            confidence="high"
        )

    return VerificationItem(
        entity=claimed_org,
        name=claimed_org,
        type="organization",
        status="unverified",
        evidence=f"Organization '{claimed_org}' is not present in trusted organization registry.",
        source=provider.source_name,
        confidence="low"
    )

def verify_phone(
    phone: str,
    claimed_org: Optional[str],
    provider: VerificationProvider
) -> VerificationItem:
    """
    3. Phone Verification
    """
    norm_candidate = normalize_phone(phone)
    trusted = provider.get_trusted_organization(claimed_org) if claimed_org else None

    if trusted:
        org_name = trusted.get("name", claimed_org)
        official_phones = provider.get_official_phones(org_name)
        norm_officials = [normalize_phone(p) for p in official_phones]

        if norm_candidate in norm_officials:
            return VerificationItem(
                entity=phone,
                number=phone,
                type="phone",
                status="verified",
                evidence=f"Phone number '{phone}' matches official contact record for '{org_name}'.",
                source=provider.source_name,
                confidence="high"
            )
        else:
            expected_str = ", ".join(official_phones) if official_phones else "N/A"
            return VerificationItem(
                entity=phone,
                number=phone,
                type="phone",
                status="mismatch",
                evidence=f"Number '{phone}' does not match the trusted contact associated with the claimed organization.",
                source=provider.source_name,
                confidence="high"
            )

    return VerificationItem(
        entity=phone,
        number=phone,
        type="phone",
        status="unverified",
        evidence=f"Phone number '{phone}' directory lookup unverified at this stage.",
        source=provider.source_name,
        confidence="low"
    )

def verify_domain(
    domain_or_url: str,
    claimed_org: Optional[str],
    provider: VerificationProvider
) -> VerificationItem:
    """
    2. Domain Verification & 6. Lookalike Domain Detection
    """
    hostname = extract_hostname(domain_or_url)
    trusted = provider.get_trusted_organization(claimed_org) if claimed_org else None

    if trusted:
        org_name = trusted.get("name", claimed_org)
        official_domains = provider.get_official_domains(org_name)
        official_hostnames = [extract_hostname(d) for d in official_domains]

        # Check exact domain match or official subdomain match
        is_exact = any(hostname == o_host or hostname.endswith(f".{o_host}") for o_host in official_hostnames)

        if is_exact:
            return VerificationItem(
                entity=hostname,
                type="domain",
                status="verified",
                evidence=f"Domain '{hostname}' matches trusted domain associated with claimed organization.",
                source=provider.source_name,
                confidence="high"
            )

        # Domain mismatch detected
        is_lookalike = any(detect_lookalike_domain(o_host, hostname) for o_host in official_hostnames)
        expected_domain = official_domains[0] if official_domains else "official domain"

        if is_lookalike:
            evidence_msg = f"Domain '{hostname}' does not match trusted domain '{expected_domain}' for '{org_name}' (possible lookalike domain pattern detected)."
        else:
            evidence_msg = f"The extracted domain does not match the trusted domain associated with the claimed organization."

        return VerificationItem(
            entity=hostname,
            type="domain",
            status="mismatch",
            evidence=evidence_msg,
            source=provider.source_name,
            confidence="high"
        )

    return VerificationItem(
        entity=hostname,
        type="domain",
        status="unverified",
        evidence=f"Domain '{hostname}' extracted from content. Independent domain reputation lookup unverified.",
        source=provider.source_name,
        confidence="medium"
    )

def verify_url_structures(url: str) -> List[Dict[str, Any]]:
    """
    5. URL Analysis (Deterministic structural signal checks)
    """
    signals = []
    url_lower = url.lower().strip()
    hostname = extract_hostname(url)

    # 1. HTTP vs HTTPS
    if url_lower.startswith("http://"):
        signals.append({
            "signal": "unencrypted_http",
            "severity": "suspicious",
            "description": "URL uses unencrypted HTTP protocol instead of HTTPS."
        })

    # 2. IP Address URLs
    if IP_REGEX.match(hostname):
        signals.append({
            "signal": "ip_address_url",
            "severity": "suspicious",
            "description": "URL uses a raw IP address instead of a standard domain name."
        })

    # 3. Userinfo in URL (user@domain)
    if "@" in url_lower.split("/")[2] if "/" in url_lower and len(url_lower.split("/")) > 2 else False:
        signals.append({
            "signal": "url_userinfo_credentials",
            "severity": "suspicious",
            "description": "URL contains userinfo credentials before the hostname."
        })

    # 4. Punycode domains
    if "xn--" in hostname:
        signals.append({
            "signal": "punycode_domain",
            "severity": "suspicious",
            "description": "URL uses Punycode encoding which can mask lookalike internationalized characters."
        })

    # 5. Excessive subdomains / length
    if hostname.count(".") > 3 or len(url) > 75:
        signals.append({
            "signal": "suspicious_url_structure",
            "severity": "suspicious",
            "description": "URL contains excessive subdomains or unusually long query paths."
        })

    return signals

def verify_url(
    url: str,
    claimed_org: Optional[str],
    provider: VerificationProvider
) -> Tuple[VerificationItem, List[Dict[str, Any]]]:
    """
    URL Verification Entrypoint: Performs domain lookup and collects URL structural signals.
    """
    domain_item = verify_domain(url, claimed_org, provider)
    signals = verify_url_structures(url)
    return domain_item, signals

def verify_qr(
    qr_content: str,
    claimed_org: Optional[str],
    provider: VerificationProvider
) -> VerificationItem:
    """
    4. QR Verification
    """
    if not qr_content:
        return VerificationItem(
            entity="None",
            type="qr",
            status="unverified",
            evidence="No QR code content provided.",
            source=provider.source_name,
            confidence="low"
        )

    # If QR content contains a URL, send through domain verification
    if qr_content.startswith(('http://', 'https://', 'www.')) or '.' in qr_content:
        domain_item = verify_domain(qr_content, claimed_org, provider)
        
        status = domain_item.status
        evidence_str = domain_item.evidence
        if status == "mismatch":
            evidence_str = f"QR destination does not match the trusted domain associated with the claimed organization."

        return VerificationItem(
            entity=qr_content,
            type="qr",
            status=status,
            evidence=evidence_str,
            source=domain_item.source,
            confidence=domain_item.confidence
        )

    # Plain text QR payload
    return VerificationItem(
        entity=qr_content,
        type="qr",
        status="unverified",
        evidence=f"QR payload decoded text: '{qr_content[:60]}'. Verification unverified.",
        source=provider.source_name,
        confidence="low"
    )

def run_verification_engine(
    claimed_entities: List[str],
    phone_numbers: List[str],
    urls: List[str],
    qr_codes: List[str],
    provider: Optional[VerificationProvider] = None
) -> Tuple[VerificationResult, List[Dict[str, Any]]]:
    """
    Main entry point for Phase 3 Verification Engine.
    Executes modular verifications and aggregates results.
    """
    if provider is None:
        provider = DemoRegistryProvider()

    claimed_org = claimed_entities[0] if claimed_entities else None

    # 1. Organization verification
    org_item = verify_organization(claimed_org, provider)

    # 2. Phone verifications
    phone_items: List[VerificationItem] = [
        verify_phone(phone, claimed_org, provider) for phone in phone_numbers
    ]

    # 3. Domain verifications & URL structural signals
    domain_items: List[VerificationItem] = []
    url_signals: List[Dict[str, Any]] = []

    for url in urls:
        d_item = verify_domain(url, claimed_org, provider)
        domain_items.append(d_item)
        
        # Collect URL structural signals
        struct_signals = verify_url_structures(url)
        url_signals.extend(struct_signals)

    # 4. QR verifications
    qr_items: List[VerificationItem] = [
        verify_qr(qr, claimed_org, provider) for qr in qr_codes
    ]

    verification_result = VerificationResult(
        organization=org_item,
        phones=phone_items,
        domains=domain_items,
        qr_codes=qr_items
    )

    return verification_result, url_signals
