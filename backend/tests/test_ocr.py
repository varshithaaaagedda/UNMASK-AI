import os
import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.services.ocr_service import (
    find_tesseract_binary,
    get_ocr_diagnostics,
    perform_ocr_on_image
)
from app.services.document_parser import parse_document

client = TestClient(app)

def test_ocr_health_endpoint():
    response = client.get("/api/v1/health/ocr")
    assert response.status_code == 200
    data = response.json()
    assert "available" in data
    assert data["engine"] == "tesseract"
    assert "error" in data

def test_health_check_includes_ocr():
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert "ocr" in data
    assert "available" in data["ocr"]

def test_ocr_unavailable_fallback():
    # If Tesseract binary is missing, perform_ocr_on_image should return available=False without crashing
    dummy_image_bytes = b"\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01\x08\x06\x00\x00\x00\x1f\x15c4\x00\x00\x00\rIDATx\x9cc\xf8\xff\xff?\x03\x00\x05\x00\x01\x0d\x0a-\xb4\x00\x00\x00\x00IEND\xaeB`\x82"
    result = perform_ocr_on_image(dummy_image_bytes)
    assert "available" in result
    assert "text" in result
    if not result["available"]:
        assert result["error"] is not None

def test_text_pdf_extraction_without_ocr():
    # Native text-based PDF text extraction must work 100% even if OCR is unavailable
    import fitz
    doc = fitz.open()
    page = doc.new_page()
    page.insert_text((50, 50), "Northstar Financial Invoice. Contact: +91 1800 123 4567")
    pdf_bytes = doc.tobytes()
    doc.close()

    text, pages, ocr_status = parse_document(pdf_bytes, "pdf")
    assert "Northstar Financial Invoice" in text
    assert "+91 1800 123 4567" in text
    assert "available" in ocr_status
