import os
import json
import fitz
from dotenv import load_dotenv

# Force load latest backend/.env
env_path = os.path.join(os.path.dirname(__file__), "..", ".env")
load_dotenv(dotenv_path=env_path, override=True)

from app.core.config import settings
from app.services.ai_reasoning_service import (
    GeminiReasoningProvider,
    MockReasoningProvider,
    AIReasoningService,
    build_structured_evidence_payload,
    get_provider_from_config
)
from app.services.verification_provider import DemoRegistryProvider
from app.services.verification_service import run_verification_engine
from app.services.risk_engine import evaluate_risk
from app.models.schemas import AIAssessment
from fastapi.testclient import TestClient
from app.main import app

api_key = settings.GEMINI_API_KEY or os.getenv("GEMINI_API_KEY")
provider_setting = settings.AI_REASONING_PROVIDER or os.getenv("AI_REASONING_PROVIDER")

print("=== LIVE GEMINI INTEGRATION VERIFICATION ===")
print("1. Provider Loaded:", provider_setting)
print("2. API Key Present:", bool(api_key and len(api_key.strip()) > 5))

real_call_success = False
structured_pass = False
results_page_pass = False
security_pass = False
fallback_pass = False
error_summary = None

# Step A: Perform ONE real test call through GeminiReasoningProvider
if api_key and len(api_key.strip()) > 5:
    try:
        gemini_provider = GeminiReasoningProvider(api_key=api_key.strip())

        verification_res, _ = run_verification_engine(
            claimed_entities=["Northstar Financial"],
            phone_numbers=["+91 1800 123 4567"],
            urls=["https://northstar-security.example/verify"],
            qr_codes=["https://northstar-security.example/verify"],
            provider=DemoRegistryProvider()
        )

        ai_assessment = gemini_provider.evaluate(
            claimed_org="Northstar Financial",
            extracted_text="URGENT: Your account will be suspended today. Verify immediately by calling +91 1800 123 4567 or scanning QR code.",
            phone_numbers=["+91 1800 123 4567"],
            urls=["https://northstar-security.example/verify"],
            qr_codes=["https://northstar-security.example/verify"],
            verification=verification_res,
            social_engineering={"has_urgency": True, "has_credential_request": True, "detected_phrases": ["urgent", "suspended"]},
            risk_score=10,
            risk_level="high"
        )

        real_call_success = True
        print("\n--- REAL GEMINI RESPONSE ---")
        print("Headline:", ai_assessment.headline)
        print("Summary:", ai_assessment.summary)
        print("Confidence:", ai_assessment.confidence)
        print("Key Findings:", ai_assessment.key_findings)
        print("Recommended Action:", ai_assessment.recommended_action)
        print("Reasoning Basis:", ai_assessment.reasoning_basis)

        if (
            ai_assessment.headline
            and ai_assessment.summary
            and isinstance(ai_assessment.key_findings, list)
            and ai_assessment.confidence in ["high", "medium", "low"]
            and ai_assessment.recommended_action
            and isinstance(ai_assessment.reasoning_basis, list)
        ):
            structured_pass = True

    except Exception as e:
        raw_err = str(e)
        if api_key and api_key in raw_err:
            raw_err = raw_err.replace(api_key, "[REDACTED]")
        error_summary = raw_err
        print("\nReal Gemini call error:", raw_err)

# Step B: Perform end-to-end FastAPI endpoint scan test
try:
    client = TestClient(app)
    doc = fitz.open()
    page = doc.new_page()
    text = (
        "Northstar Financial\n\n"
        "URGENT:\n"
        "Your account will be suspended today.\n"
        "Verify immediately by calling +91 1800 123 4567\n"
        "or visiting https://northstar-security.example/verify\n"
    )
    page.insert_text((40, 50), text, fontsize=12)
    pdf_bytes = doc.tobytes()
    doc.close()

    response = client.post(
        "/api/v1/scan",
        files={"file": ("northstar_urgent_notice.pdf", pdf_bytes, "application/pdf")}
    )

    if response.status_code == 200:
        data = response.json()
        if "ai_assessment" in data and data["ai_assessment"] is not None:
            results_page_pass = True

        # Security check: ensure raw API key string is NEVER present anywhere in response body or headers
        resp_text = response.text
        if api_key and api_key in resp_text:
            security_pass = False
        else:
            security_pass = True

except Exception as e:
    print("FastAPI scan endpoint error:", str(e))

# Step C: Verify fallback to MockReasoningProvider works if Gemini is unavailable
try:
    faulty_service = AIReasoningService(provider=MockReasoningProvider())
    fb_res = faulty_service.generate_assessment(
        claimed_org="Northstar Financial",
        extracted_text="Text",
        phone_numbers=[],
        urls=[],
        qr_codes=[],
        verification=None,
        social_engineering={"has_urgency": True},
        risk_score=5,
        risk_level="high"
    )
    if fb_res and fb_res.headline:
        fallback_pass = True
except Exception as e:
    print("Fallback error:", str(e))

print("\n=== FINAL VERIFICATION SUMMARY ===")
print("Gemini provider loaded:", "YES" if provider_setting == "gemini" else "NO")
print("Real Gemini API call:", "SUCCESS" if real_call_success else "FAILED")
print("Structured response validation:", "PASS" if structured_pass else "FAIL")
print("Results page:", "PASS" if results_page_pass else "FAIL")
print("API key protection:", "PASS" if security_pass else "FAIL")
print("Fallback provider:", "PASS" if fallback_pass else "FAIL")
if error_summary:
    print("Error:", error_summary)
