import io
import json
from PIL import Image, ImageDraw, ImageFont
from fastapi.testclient import TestClient
from app.main import app

def generate_test_image_bytes() -> bytes:
    """
    Creates a clean PNG image with readable black text on a white background.
    """
    img = Image.new('RGB', (800, 300), color=(255, 255, 255))
    d = ImageDraw.Draw(img)

    lines = [
        "URGENT: Your Northstar Financial account requires",
        "immediate verification. Call +91 1800 123 4567 now.",
        "Visit https://northstar-security.example"
    ]

    # Try loading default font or bitmap font
    try:
        font = ImageFont.truetype("arial.ttf", 20)
    except Exception:
        font = ImageFont.load_default()

    y_offset = 40
    for line in lines:
        d.text((40, y_offset), line, fill=(0, 0, 0), font=font)
        y_offset += 40

    img_byte_arr = io.BytesIO()
    img.save(img_byte_arr, format='PNG')
    return img_byte_arr.getvalue()

def run_ocr_verification():
    client = TestClient(app)

    print("--- 1. Testing GET /api/v1/health/ocr ---")
    ocr_health = client.get("/api/v1/health/ocr")
    print(f"Status Code: {ocr_health.status_code}")
    print(json.dumps(ocr_health.json(), indent=2))

    print("\n--- 2. Testing Real Image OCR via POST /api/v1/scan ---")
    image_bytes = generate_test_image_bytes()
    scan_resp = client.post(
        "/api/v1/scan",
        files={"file": ("ocr_security_alert.png", image_bytes, "image/png")}
    )
    print(f"Status Code: {scan_resp.status_code}")
    print("Complete Scan Result JSON:")
    print(json.dumps(scan_resp.json(), indent=2))

if __name__ == "__main__":
    run_ocr_verification()
