import os
from pydantic_settings import BaseSettings
from typing import List, Optional

class Settings(BaseSettings):
    APP_NAME: str = "AI Resume Analyzer"
    APP_ENV: str = "development"
    PORT: int = 8000
    
    # JWT
    SECRET_KEY: str = "ai_resume_analyzer_super_secure_jwt_secret_token_2026_xyz"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours
    
    # Database (SQLite by default for zero-setup local runs, PostgreSQL for production)
    DATABASE_URL: str = "sqlite:///./resume_analyzer.db"
    
    # Gemini
    GEMINI_API_KEY: str = ""
    GEMINI_MODEL: str = "gemini-3.8-flash"
    
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
