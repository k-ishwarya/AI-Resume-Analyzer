import os
from pydantic_settings import BaseSettings
from typing import List, Optional

class Settings(BaseSettings):
    APP_NAME: str = "AI Resume Analyzer"
    APP_ENV: str = "development"
    PORT: int = 8000
    
    # JWT - Should be overwritten in .env for production
    SECRET_KEY: str = os.getenv("SECRET_KEY", "default-insecure-dev-secret")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours
    
    # Database (SQLite by default for zero-setup local runs, PostgreSQL for production)
    DATABASE_URL: str = "sqlite:///./resume_analyzer.db"
    
    # Gemini
    GEMINI_API_KEY: str = ""
    GEMINI_MODEL: str = "gemini-3.5-flash"
    
    # Frontend URL for email links
    FRONTEND_URL: str = "http://localhost:5173"

    # SMTP Email configuration (optional; falls back to terminal logger if unconfigured)
    SMTP_HOST: Optional[str] = None
    SMTP_PORT: int = 587
    SMTP_USER: Optional[str] = None
    SMTP_PASSWORD: Optional[str] = None
    EMAILS_FROM_EMAIL: Optional[str] = None
    EMAILS_FROM_NAME: str = "AI Resume Analyzer"

    # Upload limits
    MAX_FILE_SIZE_MB: int = 10
    ALLOWED_EXTENSIONS: List[str] = ["pdf", "docx"]


    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()
