import sys
import json
import fitz  # PyMuPDF
from fastapi.testclient import TestClient
from app.main import app

def generate_test_pdf() -> bytes:
    doc = fitz.open()
    page = doc.new_page()
    content = (
        "Northstar Financial\n"
        "URGENT: Verify your account immediately. Call now.\n"
        "Contact: +91 1800 123 4567\n"
        "Official Portal: https://northstar-security.example"
    )
    page.insert_text((50, 50), content, fontsize=12)
    pdf_bytes = doc.tobytes()
    doc.close()
    return pdf_bytes

def run_verification():
    client = TestClient(app)
    
    print("--- 1. Testing GET /health ---")
    health_resp = client.get("/health")
    print(f"Status Code: {health_resp.status_code}")
    print(f"Response: {json.dumps(health_resp.json(), indent=2)}")

    print("\n--- 2. Testing POST /api/v1/scan ---")
    pdf_bytes = generate_test_pdf()
    scan_resp = client.post(
        "/api/v1/scan",
        files={"file": ("test_northstar_notice.pdf", pdf_bytes, "application/pdf")}
    )
    print(f"Status Code: {scan_resp.status_code}")
    print("Complete JSON Response:")
    print(json.dumps(scan_resp.json(), indent=2))

if __name__ == "__main__":
    run_verification()
