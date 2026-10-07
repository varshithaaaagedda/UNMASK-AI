import os
import shutil
import logging
import io
from typing import Dict, Any, Tuple, Optional
from PIL import Image
from app.core.config import settings

logger = logging.getLogger("unmask.ocr")

# Common Windows installation paths for Tesseract OCR
WINDOWS_COMMON_PATHS = [
    r"C:\Program Files\Tesseract-OCR\tesseract.exe",
    r"C:\Program Files (x86)\Tesseract-OCR\tesseract.exe",
    os.path.expandvars(r"%LOCALAPPDATA%\Programs\Tesseract-OCR\tesseract.exe"),
    os.path.expandvars(r"%LOCALAPPDATA%\Tesseract-OCR\tesseract.exe"),
]

# Project root tessdata directory fallback
PROJECT_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
PROJECT_TESSDATA = os.path.join(PROJECT_DIR, "tessdata")

def configure_tessdata_env():
    """
    Ensures TESSDATA_PREFIX is configured if a local tessdata directory exists.
    """
    if os.path.isfile(os.path.join(PROJECT_TESSDATA, "eng.traineddata")):
        os.environ["TESSDATA_PREFIX"] = PROJECT_TESSDATA

def find_tesseract_binary() -> Tuple[Optional[str], bool, Optional[str], Optional[str]]:
    """
    Locates the Tesseract binary using priority:
    1. TESSERACT_CMD env / settings
    2. Common Windows paths
    3. System PATH lookup (shutil.which)

    Returns tuple: (executable_path, is_available, version_or_none, error_or_none)
    """
    configure_tessdata_env()
    cmd_candidate: Optional[str] = None

    # Priority A: Environment variable / Settings
    env_tesseract = os.getenv("TESSERACT_CMD") or settings.TESSERACT_CMD
    if env_tesseract and os.path.isfile(env_tesseract):
        cmd_candidate = env_tesseract

    # Priority B: Common Windows installation paths
    if not cmd_candidate:
        for path in WINDOWS_COMMON_PATHS:
            if os.path.isfile(path):
                cmd_candidate = path
                break

    # Priority C: System PATH lookup
    if not cmd_candidate:
        path_which = shutil.which("tesseract")
        if path_which and os.path.isfile(path_which):
            cmd_candidate = path_which

    if not cmd_candidate:
        error_msg = "Tesseract OCR executable not found. Install Tesseract-OCR and configure TESSERACT_CMD in .env or system PATH."
        return None, False, None, error_msg

    # Test running pytesseract to confirm execution and fetch version
    try:
        import pytesseract
        pytesseract.pytesseract.tesseract_cmd = cmd_candidate
        version = str(pytesseract.get_tesseract_version()).strip()
        
        # Perform 1x1 test image OCR execution check to verify language data initialization
        test_img = Image.new("RGB", (10, 10), color="white")
        pytesseract.image_to_string(test_img)

        return cmd_candidate, True, version, None
    except Exception as e:
        error_msg = f"Tesseract executable found at '{cmd_candidate}' but failed execution test: {str(e)}"
        logger.warning(error_msg)
        return cmd_candidate, False, None, error_msg

def get_ocr_diagnostics() -> Dict[str, Any]:
    """
    Returns structured OCR engine status diagnostics.
    """
    executable, available, version, error = find_tesseract_binary()
    return {
        "available": available,
        "engine": "tesseract",
        "executable": executable,
        "version": version,
        "error": error
    }

def perform_ocr_on_pil_image(image: Image.Image) -> Dict[str, Any]:
    """
    Performs OCR text extraction on a PIL Image object.
    Returns structured status dictionary without crashing if OCR is unavailable.
    """
    executable, available, version, error = find_tesseract_binary()

    if not available or not executable:
        return {
            "available": False,
            "text": "",
            "error": error or "Tesseract OCR is not installed or configured."
        }

    try:
        import pytesseract
        pytesseract.pytesseract.tesseract_cmd = executable
        text = pytesseract.image_to_string(image)
        return {
            "available": True,
            "text": text.strip()
        }
    except Exception as e:
        logger.warning(f"OCR execution exception: {e}")
        return {
            "available": False,
            "text": "",
            "error": f"OCR processing failed: {str(e)}"
        }

def perform_ocr_on_image(image_bytes: bytes) -> Dict[str, Any]:
    """
    Performs OCR text extraction on raw image bytes.
    """
    try:
        image = Image.open(io.BytesIO(image_bytes))
        return perform_ocr_on_pil_image(image)
    except Exception as e:
        return {
            "available": False,
            "text": "",
            "error": f"Failed to open image bytes: {str(e)}"
        }
