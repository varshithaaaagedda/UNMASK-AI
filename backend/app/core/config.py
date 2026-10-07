import os
from typing import List, Optional
from pydantic_settings import BaseSettings

# Path to backend/.env
CORE_DIR = os.path.dirname(os.path.abspath(__file__))
APP_DIR = os.path.dirname(CORE_DIR)
BACKEND_DIR = os.path.dirname(APP_DIR)
ENV_PATH = os.path.join(BACKEND_DIR, ".env")
if not os.path.exists(ENV_PATH):
    ENV_PATH = ".env"

class Settings(BaseSettings):
    PROJECT_NAME: str = "UNMASK AI"
    API_V1_STR: str = "/api/v1"
    CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:8000",
    ]
    TESSERACT_CMD: Optional[str] = None
    GEMINI_API_KEY: Optional[str] = None
    AI_REASONING_PROVIDER: str = "mock"

    model_config = {
        "env_file": ENV_PATH,
        "extra": "ignore"
    }

settings = Settings()
