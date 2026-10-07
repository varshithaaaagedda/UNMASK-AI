import pytest
from unittest.mock import MagicMock, patch
from app.services.verification_provider import DemoRegistryProvider
from app.services.verification_service import run_verification_engine
from app.services.risk_engine import evaluate_risk
from app.services.ai_reasoning_service import (
    AIReasoningService,
    MockReasoningProvider,
    GeminiReasoningProvider,
    FaultyProvider,
    build_structured_evidence_payload,
    get_provider_from_config,
)
from app.models.schemas import AIAssessment
from app.core.config import settings

@pytest.fixture
def provider():
    return DemoRegistryProvider()

def test_mock_provider_still_works(provider):
    """1. Test MockReasoningProvider still works."""
    mock_p = MockReasoningProvider()
    ai = mock_p.evaluate(
        claimed_org="Northstar Financial",
        extracted_text="Some text",
        phone_numbers=["+91 1800 123 4567"],
        urls=[],
        qr_codes=[],
        verification=None,
        social_engineering={"has_urgency": True},
        risk_score=5,
        risk_level="high"
    )
    assert isinstance(ai, AIAssessment)
    assert ai.headline == "Potential impersonation detected"

def test_gemini_provider_instantiation():
    """2. Test GeminiReasoningProvider can be instantiated without crashing."""
    g_provider = GeminiReasoningProvider(api_key="test_dummy_key")
    assert g_provider.api_key == "test_dummy_key"
    assert g_provider.model_name == "gemini-3.8-flash"

def test_missing_api_key_fallback():
    """3. Test missing API key falls back to MockReasoningProvider."""
    with patch.object(settings, "AI_REASONING_PROVIDER", "gemini"):
        with patch.object(settings, "GEMINI_API_KEY", None):
            prov = get_provider_from_config()
            assert isinstance(prov, MockReasoningProvider)

def test_invalid_gemini_response_fallback():
    """4. Test invalid Gemini response falls back safely to MockReasoningProvider."""
    service = AIReasoningService(provider=GeminiReasoningProvider(api_key="test_dummy_key"))
    
    with patch("google.genai.Client") as mock_client_cls:
        mock_client = MagicMock()
        mock_client_cls.return_value = mock_client
        mock_response = MagicMock()
        mock_response.text = "INVALID_NON_JSON_RESPONSE"
        mock_client.models.generate_content.return_value = mock_response

        ai = service.generate_assessment(
            claimed_org="Northstar Financial",
            extracted_text="URGENT notice",
            phone_numbers=["+91 1800 123 4567"],
            urls=[],
            qr_codes=[],
            verification=None,
            social_engineering={"has_urgency": True},
            risk_score=5,
            risk_level="high"
        )
        assert isinstance(ai, AIAssessment)
        assert ai.headline == "Potential impersonation detected"

def test_structured_output_validation_with_mocked_gemini():
    """5. Test structured output validation works when Gemini returns valid JSON."""
    g_provider = GeminiReasoningProvider(api_key="test_dummy_key")

    mock_gemini_json = """{
      "headline": "Potential impersonation detected",
      "summary": "Multiple signals conflict with the claimed organization.",
      "key_findings": ["Phone number mismatch detected."],
      "confidence": "high",
      "recommended_action": "Do not call the provided number.",
      "reasoning_basis": ["Phone verification mismatch."]
    }"""

    with patch("google.genai.Client") as mock_client_cls:
        mock_client = MagicMock()
        mock_client_cls.return_value = mock_client
        mock_response = MagicMock()
        mock_response.text = mock_gemini_json
        mock_client.models.generate_content.return_value = mock_response

        ai = g_provider.evaluate(
            claimed_org="Northstar Financial",
            extracted_text="Notice text",
            phone_numbers=["+91 1800 123 4567"],
            urls=[],
            qr_codes=[],
            verification=None,
            social_engineering={"has_urgency": True},
            risk_score=5,
            risk_level="high"
        )
        assert isinstance(ai, AIAssessment)
        assert ai.headline == "Potential impersonation detected"
        assert ai.confidence == "high"
        assert len(ai.key_findings) == 1

def test_high_risk_evidence_assessment(provider):
    """6. Test high-risk evidence produces a valid AI assessment."""
    verification_res, url_signals = run_verification_engine(
        claimed_entities=["Northstar Financial"],
        phone_numbers=["+91 1800 123 4567"],
        urls=["https://northstar-security.example/verify"],
        qr_codes=["https://northstar-security.example/verify"],
        provider=provider
    )

    social_eng = {
        "has_urgency": True,
        "has_credential_request": True,
        "has_payment_request": False,
        "detected_phrases": ["urgent", "account suspended"]
    }

    scan_result = evaluate_risk(
        filename="scam_notice.pdf",
        file_type="pdf",
        extracted_text="URGENT: Your account will be suspended today. Call +91 1800 123 4567 or visit https://northstar-security.example/verify",
        phone_numbers=["+91 1800 123 4567"],
        urls=["https://northstar-security.example/verify"],
        qr_codes=["https://northstar-security.example/verify"],
        social_engineering=social_eng,
        claimed_entities=["Northstar Financial"],
        verification=verification_res,
        url_signals=url_signals
    )

    assert scan_result.risk_level in ["high", "suspicious"]
    assert scan_result.ai_assessment is not None
    ai = scan_result.ai_assessment

    assert ai.headline == "Potential impersonation detected"
    assert any("Phone number does not match" in k for k in ai.key_findings)
    assert any("QR destination does not match" in k or "Domain does not match" in k for k in ai.key_findings)
    assert any("high-pressure language" in k for k in ai.key_findings)
    assert ai.confidence in ["high", "medium"]

def test_safe_evidence_assessment(provider):
    """7. Test safe evidence produces a valid AI assessment."""
    verification_res, url_signals = run_verification_engine(
        claimed_entities=["Northstar Financial"],
        phone_numbers=["+91 1800 987 6543"],
        urls=["https://northstar.example/login"],
        qr_codes=["https://northstar.example/login"],
        provider=provider
    )

    social_eng = {
        "has_urgency": False,
        "has_credential_request": False,
        "has_payment_request": False,
        "detected_phrases": []
    }

    scan_result = evaluate_risk(
        filename="official_statement.pdf",
        file_type="pdf",
        extracted_text="Monthly statement from Northstar Financial. Call +91 1800 987 6543 or visit https://northstar.example/login",
        phone_numbers=["+91 1800 987 6543"],
        urls=["https://northstar.example/login"],
        qr_codes=["https://northstar.example/login"],
        social_engineering=social_eng,
        claimed_entities=["Northstar Financial"],
        verification=verification_res,
        url_signals=url_signals
    )

    assert scan_result.risk_level == "safe"
    assert scan_result.ai_assessment is not None
    ai = scan_result.ai_assessment

    assert ai.headline == "Low-risk indicators detected"
    assert any("matches official" in k or "consistent with" in k for k in ai.key_findings)

def test_unverified_evidence_assessment(provider):
    """8. Test unverified evidence produces an unverified explanation."""
    verification_res, url_signals = run_verification_engine(
        claimed_entities=["Acme Unknown Global"],
        phone_numbers=["+1 555 123 4567"],
        urls=["https://acme-unknown-global.example"],
        qr_codes=[],
        provider=provider
    )

    social_eng = {
        "has_urgency": False,
        "has_credential_request": False,
        "has_payment_request": False,
        "detected_phrases": []
    }

    scan_result = evaluate_risk(
        filename="unknown_letter.pdf",
        file_type="pdf",
        extracted_text="Information notice from Acme Unknown Global.",
        phone_numbers=["+1 555 123 4567"],
        urls=["https://acme-unknown-global.example"],
        qr_codes=[],
        social_engineering=social_eng,
        claimed_entities=["Acme Unknown Global"],
        verification=verification_res,
        url_signals=url_signals
    )

    assert scan_result.ai_assessment is not None
    ai = scan_result.ai_assessment

    assert ai.headline is not None and len(ai.headline) > 0
    assert ai.summary is not None and len(ai.summary) > 0

def test_structured_evidence_payload_builder():
    """Test payload builder does not contain raw text or files."""
    payload = build_structured_evidence_payload(
        claimed_org="Northstar Financial",
        phone_numbers=["+91 1800 123 4567"],
        urls=["https://northstar-security.example/verify"],
        qr_codes=[],
        verification=None,
        social_engineering={"has_urgency": True, "detected_phrases": ["urgent"]},
        risk_score=10,
        risk_level="high"
    )
    assert payload["claimed_organization"] == "Northstar Financial"
    assert "extracted_phone_numbers" in payload
    assert "extracted_text" not in payload  # Ensure raw text/files are excluded
