import urllib.request
import json
import os

# 1. Verify FastAPI server on 8000
try:
    with urllib.request.urlopen("http://localhost:8000/health") as res:
        health = json.loads(res.read().decode())
        print("[CHECK 1] Backend Health:", health)
except Exception as e:
    print("[FAIL 1] Backend not responding:", e)

# 2. Verify Next.js server on 3000
try:
    with urllib.request.urlopen("http://localhost:3000/scan") as res:
        print("[CHECK 2] Next.js Scan Page status:", res.status)
except Exception as e:
    print("[FAIL 2] Next.js not responding:", e)

# 3. Simulate multipart file post directly to backend as frontend does
filepath = "c:/UNMASK-AI/backend/scratch/test_sample.png"
with open(filepath, "rb") as f:
    file_bytes = f.read()

boundary = "----WebKitFormBoundaryE2ETest"
body = bytearray()
body.extend(f"--{boundary}\r\n".encode("utf-8"))
body.extend(f'Content-Disposition: form-data; name="file"; filename="{os.path.basename(filepath)}"\r\n'.encode("utf-8"))
body.extend(b"Content-Type: image/png\r\n\r\n")
body.extend(file_bytes)
body.extend(f"\r\n--{boundary}--\r\n".encode("utf-8"))

req = urllib.request.Request(
    "http://localhost:8000/api/v1/scan",
    data=body,
    headers={"Content-Type": f"multipart/form-data; boundary={boundary}"}
)

try:
    with urllib.request.urlopen(req) as resp:
        result = json.loads(resp.read().decode("utf-8"))
        print("[CHECK 3] Direct Scan Result received:")
        print("  - scan_id:", result.get("scan_id"))
        print("  - filename:", result.get("filename"))
        print("  - risk_level:", result.get("risk_level"))
        print("  - threat_type:", result.get("threat_type"))
        print("  - extracted text:", repr(result.get("extracted", {}).get("text")))
        print("  - extracted phone_numbers:", result.get("extracted", {}).get("phone_numbers"))
        print("  - extracted urls:", result.get("extracted", {}).get("urls"))
        print("  - evidence signals count:", len(result.get("evidence", [])))
except Exception as e:
    print("[FAIL 3] Direct Scan error:", e)
