"""Pydantic schemas for user response, profile setup, and profile updates."""

from pydantic import BaseModel, EmailStr, Field
from typing import Optional, Dict, Any
from datetime import datetime
import uuid
from app.models.user import UserRole, VerificationStatus


class CustomerPreferences(BaseModel):
    language: Optional[str] = "English"
    preferred_category: Optional[str] = "All"
    preferred_transmission: Optional[str] = "All"
    push_notifications: Optional[bool] = True
    sms_notifications: Optional[bool] = False
    email_receipts: Optional[bool] = True
    biometric_login: Optional[bool] = False
    location_services: Optional[bool] = True
    currency: Optional[str] = "USD"
    distance_unit: Optional[str] = "km"


class UserResponse(BaseModel):
    id: uuid.UUID
    full_name: str
    email: EmailStr
    profile_picture: Optional[str] = None
    phone_number: Optional[str] = None
    city: Optional[str] = None
    role: UserRole
    auth_provider: str
    is_active: bool
    is_email_verified: bool
    is_profile_complete: bool
    verification_status: VerificationStatus
    license_number: Optional[str] = None
    license_expiry: Optional[str] = None
    business_name: Optional[str] = None
    fleet_size: Optional[str] = None
    department: Optional[str] = None
    preferences: Optional[Dict[str, Any]] = None
    created_at: datetime
    last_login: Optional[datetime] = None

    model_config = {"from_attributes": True}


class ProfileSetupRequest(BaseModel):
    role: Optional[UserRole] = None
    phone_number: Optional[str] = Field(None, max_length=30)
    city: Optional[str] = Field(None, max_length=100)
    profile_picture: Optional[str] = Field(None, max_length=500)
    license_number: Optional[str] = Field(None, max_length=50)
    license_expiry: Optional[str] = Field(None, max_length=50)
    business_name: Optional[str] = Field(None, max_length=150)
    fleet_size: Optional[str] = Field(None, max_length=50)
    department: Optional[str] = Field(None, max_length=100)
    preferences: Optional[Dict[str, Any]] = None


class UpdateProfileRequest(BaseModel):
    full_name: Optional[str] = Field(None, min_length=2, max_length=100)
    phone_number: Optional[str] = Field(None, max_length=30)
    city: Optional[str] = Field(None, max_length=100)
    profile_picture: Optional[str] = Field(None, max_length=500)
    license_number: Optional[str] = Field(None, max_length=50)
    license_expiry: Optional[str] = Field(None, max_length=50)
    business_name: Optional[str] = Field(None, max_length=150)
    fleet_size: Optional[str] = Field(None, max_length=50)
    department: Optional[str] = Field(None, max_length=100)
    preferences: Optional[Dict[str, Any]] = None
