# UNMASK AI — Backend Engine

UNMASK AI is a multimodal scam and impersonation verification platform backend built with **FastAPI** and **Python**.

This service extracts text, QR codes, phone numbers, URLs, and social engineering signals from uploaded PDFs and images (PNG, JPG, JPEG), applying a deterministic risk scoring model to generate evidence-oriented security reports.

---

## 1. Setup Virtual Environment

Create a Python 3.10+ virtual environment:

```bash
cd backend
python -m venv venv
```

Activate the virtual environment:

- **Windows (PowerShell)**:
  ```powershell
  .\venv\Scripts\Activate.ps1
  ```
- **Linux / macOS**:
  ```bash
  source venv/bin/activate
  ```

---

## 2. Install Dependencies

```bash
pip install -r requirements.txt
```

---

## 3. Installing Tesseract on Windows

OCR text extraction from scanned images (PNG, JPG) or image-only PDFs requires the **Tesseract-OCR engine** executable to be installed on your operating system.

*(Note: Text-based PDFs do **not** require Tesseract and will continue to work natively even if OCR is unavailable).*

### Installation Steps on Windows:

1. Download the Tesseract Windows Installer:
   - Download `tesseract-ocr-w64-setup-5.3.x.exe` from [UB-Mannheim Tesseract Releases](https://github.com/UB-Mannheim/tesseract/wiki).

2. Run the installer and install Tesseract to the default location:
   `C:\Program Files\Tesseract-OCR\tesseract.exe`

3. Configuration Options:
   - **Option A (Automatic)**: The UNMASK backend automatically detects Tesseract if installed at `C:\Program Files\Tesseract-OCR\tesseract.exe`.
   - **Option B (Environment Variable)**: Copy `.env.example` to `.env` and set `TESSERACT_CMD`:
     ```env
     TESSERACT_CMD="C:\Program Files\Tesseract-OCR\tesseract.exe"
     ```
   - **Option C (System PATH)**: Add `C:\Program Files\Tesseract-OCR` to your Windows System `PATH` environment variable.

4. Verify OCR Status:
   ```bash
   curl http://localhost:8000/api/v1/health/ocr
   ```

---

## 4. Run FastAPI Development Server

```bash
uvicorn app.main:app --reload --port 8000
```

The API will be available at:
- Base URL: `http://localhost:8000`
- Interactive Swagger Documentation: `http://localhost:8000/docs`
- OCR Diagnostics: `http://localhost:8000/api/v1/health/ocr`

---

## 5. API Endpoints

### `GET /health`
Returns system operational health & OCR engine status.

**Response**:
```json
{
  "status": "ok",
  "service": "UNMASK AI",
  "ocr": {
    "available": false,
    "engine": "tesseract",
    "version": null,
    "error": "Tesseract OCR executable not found. Install Tesseract-OCR and configure TESSERACT_CMD in .env or system PATH."
  }
}
```

---

### `GET /api/v1/health/ocr`
Returns dedicated OCR engine status diagnostics.

**Response**:
```json
{
  "available": true,
  "engine": "tesseract",
  "executable": "C:\\Program Files\\Tesseract-OCR\\tesseract.exe",
  "version": "5.3.3.20231005",
  "error": null
}
```

---

### `POST /api/v1/scan`
Uploads a document or screenshot for security signal analysis.

- **Content-Type**: `multipart/form-data`
- **Field**: `file`
- **Supported Formats**: `PDF`, `PNG`, `JPG`, `JPEG`

---

## 6. Running Tests

```bash
pytest
```
