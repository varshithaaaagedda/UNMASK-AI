import os
from app.core.config import settings
from app.services.ai_reasoning_service import (
    GeminiReasoningProvider,
    build_structured_evidence_payload,
    AIAssessment
)
from app.services.verification_provider import DemoRegistryProvider
from app.services.verification_service import run_verification_engine

api_key = settings.GEMINI_API_KEY or os.environ.get("GEMINI_API_KEY")

print("1. Configured AI_REASONING_PROVIDER:", repr(settings.AI_REASONING_PROVIDER))
print("2. GEMINI_API_KEY present:", bool(api_key and len(api_key.strip()) > 0))

if not api_key:
    print("3. Gemini API Diagnosis: Missing API key. (GEMINI_API_KEY is not set in backend/.env or environment variables). System safely falls back to local MockReasoningProvider.")
else:
    print("3. Attempting direct call via GeminiReasoningProvider...")
    try:
        provider = GeminiReasoningProvider(api_key=api_key)
        
        verification_res, _ = run_verification_engine(
            claimed_entities=["Northstar Financial"],
            phone_numbers=["+91 1800 123 4567"],
            urls=["https://northstar-security.example/verify"],
            qr_codes=["https://northstar-security.example/verify"],
            provider=DemoRegistryProvider()
        )

        ai_res = provider.evaluate(
            claimed_org="Northstar Financial",
            extracted_text="URGENT notice text",
            phone_numbers=["+91 1800 123 4567"],
            urls=["https://northstar-security.example/verify"],
            qr_codes=["https://northstar-security.example/verify"],
            verification=verification_res,
            social_engineering={"has_urgency": True, "detected_phrases": ["urgent"]},
            risk_score=10,
            risk_level="high"
        )
        print("4. Gemini API Call: SUCCESS")
        print("5. Headline:", repr(ai_res.headline))
        print("6. Summary:", repr(ai_res.summary))
        print("7. Confidence:", repr(ai_res.confidence))
        print("8. Key findings count:", len(ai_res.key_findings))
    except Exception as e:
        error_msg = str(e)
        # Mask any potential raw key in exception text just in case
        if api_key and api_key in error_msg:
            error_msg = error_msg.replace(api_key, "[REDACTED_API_KEY]")
        print("4. Gemini API Call: FAILED")
        print("5. Exact Failure Reason:", error_msg)
        print("6. Fallback Behavior: System automatically falls back to local MockReasoningProvider.")
