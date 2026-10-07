import fitz
from fastapi.testclient import TestClient
from app.main import app
import json

client = TestClient(app)

# Create PDF with Northstar Financial demo text
doc = fitz.open()
page = doc.new_page()
text = (
    "Northstar Financial\n\n"
    "URGENT:\n"
    "Your account will be suspended today.\n"
    "Verify immediately by calling the number above\n"
    "or scanning the QR code.\n\n"
    "Contact: +91 1800 123 4567\n"
    "Verify URL: https://northstar-security.example/verify\n"
)
page.insert_text((40, 50), text, fontsize=12)
pdf_bytes = doc.tobytes()
doc.close()

response = client.post(
    "/api/v1/scan",
    files={"file": ("northstar_urgent_notice.pdf", pdf_bytes, "application/pdf")}
)

print("Status Code:", response.status_code)
data = response.json()
print("FULL RESPONSE:")
print(json.dumps(data, indent=2))
