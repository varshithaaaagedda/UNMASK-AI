from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api.routes import scan
from app.services.ocr_service import get_ocr_diagnostics

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="UNMASK AI — Multimodal Scam and Impersonation Verification API",
    version="1.0.0",
)

# Configure CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health", status_code=200)
async def health_check():
    """
    Health check endpoint returning service status and OCR diagnostics.
    """
    ocr_diag = get_ocr_diagnostics()
    return {
        "status": "ok",
        "service": settings.PROJECT_NAME,
        "ocr": {
            "available": ocr_diag["available"],
            "engine": ocr_diag["engine"],
            "version": ocr_diag["version"],
            "error": ocr_diag["error"]
        }
    }

@app.get("/health/ocr", status_code=200)
async def ocr_health_direct():
    """
    Direct health check endpoint returning OCR engine status.
    """
    return get_ocr_diagnostics()

# Include API v1 router
app.include_router(scan.router, prefix=settings.API_V1_STR)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
