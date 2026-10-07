import os
from fastapi import APIRouter, UploadFile, File, HTTPException, status
from app.models.schemas import ScanResult, OCRDiagnostics
from app.services.document_parser import parse_document
from app.services.qr_service import detect_qr_codes_from_pil_images
from app.services.entity_extractor import (
    extract_phone_numbers,
    extract_urls,
    extract_social_engineering_signals,
    extract_claimed_entities,
)
from app.services.verification_service import run_verification_engine
from app.services.risk_engine import evaluate_risk
from app.services.ocr_service import get_ocr_diagnostics

router = APIRouter()

SUPPORTED_EXTENSIONS = {"pdf", "png", "jpg", "jpeg"}

@router.get("/health/ocr", response_model=OCRDiagnostics, status_code=status.HTTP_200_OK)
async def ocr_health_check():
    """
    Returns Tesseract OCR availability and engine diagnostics.
    """
    diagnostics = get_ocr_diagnostics()
    return diagnostics

@router.post("/scan", response_model=ScanResult, status_code=status.HTTP_200_OK)
async def scan_file(file: UploadFile = File(...)):
    """
    Accepts multipart/form-data file upload (PDF, PNG, JPG, JPEG).
    Extracts text, phone numbers, URLs, QR codes, social engineering signals,
    executes Phase 3 Verification Engine, and returns ScanResult.
    """
    if not file.filename:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Filename cannot be empty."
        )

    file_ext = file.filename.split(".")[-1].lower() if "." in file.filename else ""
    if file_ext not in SUPPORTED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported file format '{file_ext}'. Supported: PDF, PNG, JPG, JPEG."
        )

    try:
        contents = await file.read()
        if not contents:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Uploaded file is empty."
            )

        # 1. Parse document text, page images, and OCR engine status
        extracted_text, page_images, ocr_status = parse_document(contents, file_ext)

        # 2. Detect QR codes from page images
        qr_codes = detect_qr_codes_from_pil_images(page_images)

        # 3. Extract phone numbers, URLs, entities, and social engineering signals
        phone_numbers = extract_phone_numbers(extracted_text)
        urls = extract_urls(extracted_text, qr_codes)
        social_engineering = extract_social_engineering_signals(extracted_text)
        claimed_entities = extract_claimed_entities(extracted_text)

        # 4. Phase 3: Execute Modular Verification Engine
        verification_result, url_signals = run_verification_engine(
            claimed_entities=claimed_entities,
            phone_numbers=phone_numbers,
            urls=urls,
            qr_codes=qr_codes
        )

        # 5. Evaluate deterministic risk scoring and generate ScanResult
        result = evaluate_risk(
            filename=file.filename,
            file_type=file_ext,
            extracted_text=extracted_text,
            phone_numbers=phone_numbers,
            urls=urls,
            qr_codes=qr_codes,
            social_engineering=social_engineering,
            claimed_entities=claimed_entities,
            ocr_status=ocr_status,
            verification=verification_result,
            url_signals=url_signals
        )

        return result

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An error occurred while processing the document: {str(e)}"
        )
