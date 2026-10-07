import urllib.request
import json
import os

filepath = "c:/UNMASK-AI/backend/scratch/test_sample.png"
with open(filepath, "rb") as f:
    file_bytes = f.read()

boundary = "----WebKitFormBoundary7MA4YWxkTrZu0gW"
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
    with urllib.request.urlopen(req) as response:
        res_json = json.loads(response.read().decode("utf-8"))
        print("STATUS:", response.status)
        print(json.dumps(res_json, indent=2))
except Exception as e:
    print("ERROR:", e)
