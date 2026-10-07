import cv2
import numpy as np
from PIL import Image
from typing import List

def detect_qr_codes_from_pil_images(images: List[Image.Image]) -> List[str]:
    """
    Detects and decodes QR codes from a list of PIL Images using OpenCV QRCodeDetector.
    """
    detected_qrs: List[str] = []
    detector = cv2.QRCodeDetector()

    for img in images:
        try:
            # Convert PIL Image to OpenCV format (numpy array BGR)
            open_cv_image = cv2.cvtColor(np.array(img), cv2.COLOR_RGB2BGR)

            # Try multi-QR detection first
            retval, decoded_info, points, straight_qrcode = detector.detectAndDecodeMulti(open_cv_image)
            if retval and decoded_info:
                for info in decoded_info:
                    if info and info.strip() and info.strip() not in detected_qrs:
                        detected_qrs.append(info.strip())
            else:
                # Single QR detection fallback
                val, points, qrcode = detector.detectAndDecode(open_cv_image)
                if val and val.strip() and val.strip() not in detected_qrs:
                    detected_qrs.append(val.strip())
        except Exception as e:
            continue

    return detected_qrs
