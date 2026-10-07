import re
from typing import List, Dict, Any, Set
import phonenumbers

# Regex patterns for fallback extraction
URL_REGEX = re.compile(
    r'(https?://[^\s<>"]+|www\.[^\s<>"]+|[a-zA-Z0-9-]+\.(?:example|com|net|org|io|biz|info|co|bank|in|us|uk)[^\s<>"]*)',
    re.IGNORECASE
)

EMAIL_REGEX = re.compile(
    r'[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}',
    re.IGNORECASE
)

PHONE_REGEX = re.compile(
    r'(\+?\d{1,4}[\s.-]?\(?\d{1,4}\)?[\s.-]?\d{1,4}[\s.-]?\d{1,9})'
)

# Social engineering triggers list
SOCIAL_ENGINEERING_TRIGGERS = [
    {"phrase": "urgent", "category": "urgency"},
    {"phrase": "immediately", "category": "urgency"},
    {"phrase": "account suspended", "category": "urgency"},
    {"phrase": "suspension", "category": "urgency"},
    {"phrase": "verify now", "category": "credential_request"},
    {"phrase": "action required", "category": "urgency"},
    {"phrase": "payment required", "category": "payment_request"},
    {"phrase": "transfer funds", "category": "payment_request"},
    {"phrase": "confirm your identity", "category": "credential_request"},
    {"phrase": "click immediately", "category": "urgency"},
    {"phrase": "call now", "category": "urgency"},
    {"phrase": "security alert", "category": "urgency"},
    {"phrase": "within 2 hours", "category": "urgency"},
    {"phrase": "within 24 hours", "category": "urgency"},
    {"phrase": "immediate action", "category": "urgency"},
    {"phrase": "log in to verify", "category": "credential_request"},
]

def extract_phone_numbers(text: str) -> List[str]:
    """
    Extracts and normalizes phone numbers from text using `phonenumbers` + regex fallback.
    """
    found_numbers: Set[str] = set()

    # Use Google's phonenumbers library matcher
    try:
        for match in phonenumbers.PhoneNumberMatcher(text, "IN"): # Default region IN/US
            formatted = phonenumbers.format_number(
                match.number, phonenumbers.PhoneNumberFormat.INTERNATIONAL
            )
            found_numbers.add(formatted)
        for match in phonenumbers.PhoneNumberMatcher(text, "US"):
            formatted = phonenumbers.format_number(
                match.number, phonenumbers.PhoneNumberFormat.INTERNATIONAL
            )
            found_numbers.add(formatted)
    except Exception:
        pass

    # Regex fallback if phonenumbers library found nothing
    if not found_numbers:
        for match in PHONE_REGEX.finditer(text):
            num_str = match.group(0).strip()
            # Basic sanity check length (min 7 digits)
            digits = re.sub(r'\D', '', num_str)
            if 7 <= len(digits) <= 15:
                found_numbers.add(num_str)

    return sorted(list(found_numbers))

def extract_urls(text: str, qr_codes: List[str]) -> List[str]:
    """
    Extracts URLs and web links from text and QR codes.
    """
    urls: Set[str] = set()

    # Match URLs in text
    for match in URL_REGEX.finditer(text):
        url = match.group(0).rstrip('.,;:)')
        if url.startswith(('http://', 'https://', 'www.')) or '.' in url:
            urls.add(url)

    # Add QR code destinations if they resemble URLs
    for qr in qr_codes:
        if qr.startswith(('http://', 'https://', 'www.')) or '.' in qr:
            urls.add(qr)

    return sorted(list(urls))

def extract_social_engineering_signals(text: str) -> Dict[str, Any]:
    """
    Detects social engineering phrases and coercive pressure signals.
    """
    text_lower = text.lower()
    detected_phrases: List[str] = []
    categories_found: Set[str] = set()

    for item in SOCIAL_ENGINEERING_TRIGGERS:
        phrase = item["phrase"]
        if phrase in text_lower:
            detected_phrases.append(phrase)
            categories_found.add(item["category"])

    return {
        "has_urgency": "urgency" in categories_found,
        "has_credential_request": "credential_request" in categories_found,
        "has_payment_request": "payment_request" in categories_found,
        "detected_phrases": detected_phrases,
    }

def extract_claimed_entities(text: str) -> List[str]:
    """
    Attempts to extract organization or entity names mentioned in the document text.
    """
    entities: Set[str] = set()
    # Simple regex heuristics for common organization indicators
    org_patterns = [
        r'([A-Z][A-Za-z0-9\s]+(?:Bank|Financial|Trust|Cloud|Inc|Ltd|Corp|Group|Services|Pay|Capital))',
        r'(?:From|Claimed Organization|Company):\s*([A-Za-z0-9\s]+)',
    ]

    for pattern in org_patterns:
        for match in re.finditer(pattern, text):
            ent = match.group(1).strip()
            if 3 <= len(ent) <= 40 and not ent.startswith("http"):
                entities.add(ent)

    return sorted(list(entities))
