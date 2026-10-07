import os
from app.core.config import settings
from app.services.ai_reasoning_service import (
    get_provider_from_config,
    GeminiReasoningProvider,
    MockReasoningProvider,
    AIReasoningService
)
from app.services.verification_provider import DemoRegistryProvider
from app.services.verification_service import run_verification_engine
from app.services.risk_engine import evaluate_risk

print("1. AI_REASONING_PROVIDER from config:", repr(settings.AI_REASONING_PROVIDER))
print("2. GEMINI_API_KEY detected:", bool(settings.GEMINI_API_KEY and len(settings.GEMINI_API_KEY.strip()) > 0))

provider = get_provider_from_config()
print("3. Active provider type:", type(provider).__name__)

# Make a test evaluation call with Northstar Financial evidence
verification_res, url_signals = run_verification_engine(
    claimed_entities=["Northstar Financial"],
    phone_numbers=["+91 1800 123 4567"],
    urls=["https://northstar-security.example/verify"],
    qr_codes=["https://northstar-security.example/verify"],
    provider=DemoRegistryProvider()
)

social_eng = {
    "has_urgency": True,
    "has_credential_request": True,
    "has_payment_request": False,
    "detected_phrases": ["urgent", "account suspended"]
}

result = evaluate_risk(
    filename="northstar_test.pdf",
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

print("4. Risk level:", result.risk_level)
if result.ai_assessment:
    print("5. ai_assessment headline:", repr(result.ai_assessment.headline))
    print("6. ai_assessment summary:", repr(result.ai_assessment.summary))
    print("7. ai_assessment confidence:", repr(result.ai_assessment.confidence))
    print("8. ai_assessment key findings count:", len(result.ai_assessment.key_findings))
else:
    print("5. ai_assessment is None")
