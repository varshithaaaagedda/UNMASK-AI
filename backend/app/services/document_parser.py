import io
import fitz  # PyMuPDF
from PIL import Image
from typing import Tuple, List, Dict, Any
from app.services.ocr_service import perform_ocr_on_pil_image, get_ocr_diagnostics

def parse_document(file_bytes: bytes, file_extension: str) -> Tuple[str, List[Image.Image], Dict[str, Any]]:
    """
    Parses PDF or Image file bytes.
    Returns a tuple of:
    (extracted_text, list_of_rendered_page_pil_images, ocr_status_dict)
    """
    ext = file_extension.lower().lstrip('.')
    extracted_text_chunks: List[str] = []
    page_images: List[Image.Image] = []
    ocr_status: Dict[str, Any] = get_ocr_diagnostics()

    if ext == 'pdf':
        try:
            doc = fitz.open(stream=file_bytes, filetype="pdf")
            for page_index in range(len(doc)):
                page = doc[page_index]
                text = page.get_text()
                if text and text.strip():
                    extracted_text_chunks.append(text.strip())

                # Render page to image for QR scanning and potential OCR fallback
                pix = page.get_pixmap(dpi=150)
                img = Image.frombytes("RGB", [pix.width, pix.height], pix.samples)
                page_images.append(img)

                # If page text is sparse/empty, attempt OCR fallback
                if not text or not text.strip():
                    ocr_res = perform_ocr_on_pil_image(img)
                    if ocr_res.get("available") and ocr_res.get("text"):
                        extracted_text_chunks.append(ocr_res["text"])
            doc.close()
        except Exception:
            pass

    elif ext in ['png', 'jpg', 'jpeg']:
        try:
            img = Image.open(io.BytesIO(file_bytes))
            if img.mode != 'RGB':
                img = img.convert('RGB')
            page_images.append(img)

            ocr_res = perform_ocr_on_pil_image(img)
            if ocr_res.get("available") and ocr_res.get("text"):
                extracted_text_chunks.append(ocr_res["text"])
        except Exception:
            pass

    full_text = "\n".join(extracted_text_chunks)
    return full_text, page_images, ocr_status
