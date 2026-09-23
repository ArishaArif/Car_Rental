"""Pydantic schemas for user response and profile update."""

from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime
import uuid


class UserResponse(BaseModel):
    id: uuid.UUID
    full_name: str
    email: EmailStr
    profile_picture: Optional[str] = None
    phone_number: Optional[str] = None
    role: str
    auth_provider: str
    is_active: bool
    is_email_verified: bool
    created_at: datetime
    last_login: Optional[datetime] = None

    model_config = {"from_attributes": True}


class UpdateProfileRequest(BaseModel):
    full_name: Optional[str] = Field(None, min_length=2, max_length=100)
    phone_number: Optional[str] = Field(None, max_length=20)
    profile_picture: Optional[str] = Field(None, max_length=500)
