import urllib.request
import json
import os

filepath = "c:/UNMASK-AI/backend/scratch/phase3_demo_notice.pdf"
with open(filepath, "rb") as f:
    file_bytes = f.read()

boundary = "----WebKitFormBoundaryPhase3DemoPDF"
body = bytearray()
body.extend(f"--{boundary}\r\n".encode("utf-8"))
body.extend(f'Content-Disposition: form-data; name="file"; filename="{os.path.basename(filepath)}"\r\n'.encode("utf-8"))
body.extend(b"Content-Type: application/pdf\r\n\r\n")
body.extend(file_bytes)
body.extend(f"\r\n--{boundary}--\r\n".encode("utf-8"))

req = urllib.request.Request(
    "http://localhost:8000/api/v1/scan",
    data=body,
    headers={"Content-Type": f"multipart/form-data; boundary={boundary}"}
)

try:
    with urllib.request.urlopen(req) as resp:
        res_json = json.loads(resp.read().decode("utf-8"))
        print("=== PHASE 3 DEMO SCAN RESULT ===")
        print("HTTP STATUS:", resp.status)
        print("SCAN ID:", res_json.get("scan_id"))
        print("RISK LEVEL:", res_json.get("risk_level").upper())
        print("THREAT TYPE:", res_json.get("threat_type"))
        print("SUMMARY:", res_json.get("summary"))
        print("\n--- VERIFICATION OBJECT ---")
        print(json.dumps(res_json.get("verification"), indent=2))
        print("\n--- EVIDENCE CARDS ---")
        for ev in res_json.get("evidence", []):
            print(f"[{ev['severity'].upper()}] {ev['title']}: {ev['description']}")
except Exception as e:
    print("ERROR:", e)
