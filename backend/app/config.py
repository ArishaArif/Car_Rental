"""
Application configuration using pydantic-settings.
All values are loaded from environment variables or .env file.
"""

from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import AnyHttpUrl
from typing import List


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    # ── App ──────────────────────────────────────────
    APP_NAME: str = "Car Rental API"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = False
    FRONTEND_ORIGINS: List[str] = ["http://localhost:3000", "http://localhost:8081"]

    # ── Database ─────────────────────────────────────
    DATABASE_URL: str

    # ── JWT ──────────────────────────────────────────
    JWT_SECRET_KEY: str
    JWT_REFRESH_SECRET_KEY: str
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # ── Google OAuth2 ─────────────────────────────────
    GOOGLE_CLIENT_ID: str

    # ── Resend Email ─────────────────────────────────
    RESEND_API_KEY: str
    RESEND_FROM_EMAIL: str = "noreply@yourdomain.com"

    # ── OTP ──────────────────────────────────────────
    OTP_EXPIRE_MINUTES: int = 10
    OTP_LENGTH: int = 6


# Singleton settings instance
settings = Settings()
