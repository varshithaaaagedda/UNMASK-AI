import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.services.entity_extractor import (
    extract_phone_numbers,
    extract_urls,
    extract_social_engineering_signals,
)
from app.services.risk_engine import evaluate_risk

client = TestClient(app)

def test_phone_extraction():
    sample_text = "Please contact Northstar Financial at +91 98765 43210 or call +1-800-555-0199 for assistance."
    phones = extract_phone_numbers(sample_text)
    assert len(phones) >= 1
    assert any("98765" in p or "800" in p for p in phones)

def test_url_extraction():
    sample_text = "Visit https://northstar-account-check.example-security-verify.com to log in."
    urls = extract_urls(sample_text, ["https://qr-destination.example"])
    assert "https://northstar-account-check.example-security-verify.com" in urls
    assert "https://qr-destination.example" in urls

def test_social_engineering_detection():
    sample_text = "URGENT: Your account suspended unless you verify now and confirm your identity!"
    signals = extract_social_engineering_signals(sample_text)
    assert signals["has_urgency"] is True
    assert signals["has_credential_request"] is True
    assert len(signals["detected_phrases"]) >= 2

def test_risk_scoring():
    result = evaluate_risk(
        filename="test_invoice.pdf",
        file_type="pdf",
        extracted_text="URGENT: Immediate payment required or account suspended.",
        phone_numbers=["+91 98765 43210"],
        urls=["https://phishing-portal.example"],
        qr_codes=["https://qr-portal.example"],
        social_engineering={
            "has_urgency": True,
            "has_credential_request": True,
            "has_payment_request": True,
            "detected_phrases": ["urgent", "account suspended", "payment required"]
        },
        claimed_entities=["Northstar Financial"]
    )
    assert result.risk_level in ["suspicious", "high"]
    assert len(result.evidence) >= 3
    assert result.scan_id.startswith("scan-")

def test_scan_endpoint_pdf():
    # Test uploading a minimal mock PDF file
    import fitz
    doc = fitz.open()
    page = doc.new_page()
    text = (
        "URGENT: Action required.\n"
        "Claimed Organization: Northstar Financial\n"
        "Please call +91 98765 43210 or visit https://northstar-check.example\n"
        "to verify your account immediately."
    )
    page.insert_text((20, 40), text, fontsize=10)
    pdf_bytes = doc.tobytes()
    doc.close()

    response = client.post(
        "/api/v1/scan",
        files={"file": ("test_notice.pdf", pdf_bytes, "application/pdf")}
    )

    assert response.status_code == 200
    data = response.json()
    assert data["filename"] == "test_notice.pdf"
    assert data["file_type"] == "pdf"
    assert data["risk_level"] in ["suspicious", "high"]
    assert len(data["evidence"]) > 0
    assert "recommendation" in data
