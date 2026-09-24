"""Pydantic schemas for auth request/response bodies."""

from pydantic import BaseModel, EmailStr, Field, field_validator
from typing import Optional
import re


from app.models.user import UserRole


# ── Register ──────────────────────────────────────────────────────────────────
class RegisterRequest(BaseModel):
    full_name: str = Field(..., min_length=2, max_length=100, examples=["John Doe"])
    email: EmailStr = Field(..., examples=["john@example.com"])
    password: str = Field(..., min_length=8, max_length=128, examples=["StrongPass@123"])
    role: Optional[UserRole] = Field(default=UserRole.CUSTOMER, examples=[UserRole.CUSTOMER])
    phone_number: Optional[str] = Field(default=None, max_length=30, examples=["+1 (555) 234-5678"])

    @field_validator("password")
    @classmethod
    def validate_password_strength(cls, v: str) -> str:
        if not re.search(r"[A-Z]", v):
            raise ValueError("Password must contain at least one uppercase letter")
        if not re.search(r"[a-z]", v):
            raise ValueError("Password must contain at least one lowercase letter")
        if not re.search(r"\d", v):
            raise ValueError("Password must contain at least one digit")
        if not re.search(r"[!@#$%^&*(),.?\":{}|<>]", v):
            raise ValueError("Password must contain at least one special character")
        return v

    @field_validator("full_name")
    @classmethod
    def validate_full_name(cls, v: str) -> str:
        if not re.match(r"^[a-zA-Z\s'-]+$", v):
            raise ValueError("Full name can only contain letters, spaces, hyphens, and apostrophes")
        return v.strip()


class RegisterResponse(BaseModel):
    message: str
    email: EmailStr
    otp_code: Optional[str] = None


# ── OTP ───────────────────────────────────────────────────────────────────────
class VerifyOTPRequest(BaseModel):
    email: EmailStr
    otp_code: str = Field(..., min_length=6, max_length=6, examples=["123456"])
    purpose: str = Field(default="email_verification", examples=["email_verification"])


class ResendOTPRequest(BaseModel):
    email: EmailStr
    purpose: str = Field(default="email_verification", examples=["email_verification"])


class OTPResponse(BaseModel):
    message: str
    otp_code: Optional[str] = None


# ── Login ─────────────────────────────────────────────────────────────────────
class LoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=1)


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int  # seconds


# ── Refresh ───────────────────────────────────────────────────────────────────
class RefreshRequest(BaseModel):
    refresh_token: str


class AccessTokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    expires_in: int


# ── Logout ────────────────────────────────────────────────────────────────────
class LogoutRequest(BaseModel):
    refresh_token: str


# ── Google OAuth ─────────────────────────────────────────────────────────────
class GoogleAuthRequest(BaseModel):
    id_token: str = Field(..., description="Google ID token from client")


# ── Password Reset ────────────────────────────────────────────────────────────
class ForgotPasswordRequest(BaseModel):
    email: EmailStr


class ResetPasswordRequest(BaseModel):
    email: EmailStr
    otp_code: str = Field(..., min_length=6, max_length=6)
    new_password: str = Field(..., min_length=8, max_length=128)

    @field_validator("new_password")
    @classmethod
    def validate_password_strength(cls, v: str) -> str:
        if not re.search(r"[A-Z]", v):
            raise ValueError("Password must contain at least one uppercase letter")
        if not re.search(r"[a-z]", v):
            raise ValueError("Password must contain at least one lowercase letter")
        if not re.search(r"\d", v):
            raise ValueError("Password must contain at least one digit")
        if not re.search(r"[!@#$%^&*(),.?\":{}|<>]", v):
            raise ValueError("Password must contain at least one special character")
        return v
