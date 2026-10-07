import pytest
from app.services.verification_provider import DemoRegistryProvider
from app.services.verification_service import (
    verify_domain,
    verify_phone,
    verify_organization,
    verify_qr,
    verify_url_structures,
    detect_lookalike_domain,
    run_verification_engine
)
from app.services.risk_engine import evaluate_risk

@pytest.fixture
def provider():
    return DemoRegistryProvider()

def test_organization_verification(provider):
    # 0a. Organization verified
    res_v = verify_organization("Northstar Financial", provider)
    assert res_v.status == "verified"
    assert res_v.name == "Northstar Financial"

    # 0b. Organization unverified
    res_u = verify_organization("Unknown Corp Ltd", provider)
    assert res_u.status == "unverified"
    assert res_u.name == "Unknown Corp Ltd"

def test_exact_trusted_domain(provider):
    # 1. Exact trusted domain -> VERIFIED
    res = verify_domain("https://northstar.example/login", "Northstar Financial", provider)
    assert res.status == "verified"
    assert "northstar.example" in res.entity
    assert "matches trusted domain" in res.evidence

def test_different_domain_mismatch(provider):
    # 2. Different domain -> MISMATCH
    res = verify_domain("https://northstar-fake-bank.example", "Northstar Financial", provider)
    assert res.status == "mismatch"
    assert "does not match the trusted domain" in res.evidence or "lookalike" in res.evidence

def test_unknown_organization_domain(provider):
    # 3. Unknown organization -> UNVERIFIED
    res = verify_domain("https://unknown-site.example", "Unknown Corp 99", provider)
    assert res.status == "unverified"

def test_exact_trusted_phone(provider):
    # 4. Exact trusted phone -> VERIFIED
    res = verify_phone("+91 1800 987 6543", "Northstar Financial", provider)
    assert res.status == "verified"
    assert "matches official contact" in res.evidence

def test_different_phone_mismatch(provider):
    # 5. Different phone -> MISMATCH
    res = verify_phone("+91 1800 123 4567", "Northstar Financial", provider)
    assert res.status == "mismatch"
    assert "does not match the trusted contact" in res.evidence

def test_unknown_phone(provider):
    # 6. Unknown phone -> UNVERIFIED
    res = verify_phone("+1 555 999 8888", "Random Entity Ltd", provider)
    assert res.status == "unverified"

def test_qr_containing_trusted_domain(provider):
    # 7. QR containing trusted domain
    res = verify_qr("https://northstar.example/account", "Northstar Financial", provider)
    assert res.status == "verified"

def test_qr_containing_mismatched_domain(provider):
    # 8. QR containing mismatched domain
    res = verify_qr("https://northstar-security.example/verify", "Northstar Financial", provider)
    assert res.status == "mismatch"
    assert "does not match the trusted domain" in res.evidence

def test_lookalike_domain_detection():
    # 9. Lookalike domain
    is_lookalike = detect_lookalike_domain("northstar.example", "northstar-security.example")
    assert is_lookalike is True

    is_typo = detect_lookalike_domain("northstar.example", "northstarr.example")
    assert is_typo is True

    is_same = detect_lookalike_domain("northstar.example", "northstar.example")
    assert is_same is False

def test_https_and_http_urls():
    # 10. HTTPS URL & 11. HTTP URL
    http_signals = verify_url_structures("http://insecure-site.example/login")
    assert any(s["signal"] == "unencrypted_http" for s in http_signals)

    https_signals = verify_url_structures("https://secure-site.example/login")
    assert not any(s["signal"] == "unencrypted_http" for s in https_signals)

def test_url_with_ip_address():
    # 12. URL with IP address
    ip_signals = verify_url_structures("http://192.168.1.100/verify")
    assert any(s["signal"] == "ip_address_url" for s in ip_signals)

def test_risk_scoring_with_verification_signals(provider):
    # 13. Risk scoring with verification signals
    verification_res, url_signals = run_verification_engine(
        claimed_entities=["Northstar Financial"],
        phone_numbers=["+91 1800 123 4567"],
        urls=["https://northstar-security.example/login"],
        qr_codes=["https://northstar-security.example/verify"],
        provider=provider
    )

    social_eng = {"has_urgency": True, "has_credential_request": True, "has_payment_request": False, "detected_phrases": ["urgent"]}

    scan_result = evaluate_risk(
        filename="suspicious_invoice.png",
        file_type="png",
        extracted_text="URGENT: Verify account immediately at https://northstar-security.example/login or call +91 1800 123 4567",
        phone_numbers=["+91 1800 123 4567"],
        urls=["https://northstar-security.example/login"],
        qr_codes=["https://northstar-security.example/verify"],
        social_engineering=social_eng,
        claimed_entities=["Northstar Financial"],
        verification=verification_res,
        url_signals=url_signals
    )

    assert scan_result.risk_level == "high"
    assert scan_result.verification is not None
    assert scan_result.verification.organization.status == "verified"
    assert scan_result.verification.phones[0].status == "mismatch"
    assert scan_result.verification.domains[0].status == "mismatch"
    assert scan_result.verification.qr_codes[0].status == "mismatch"
