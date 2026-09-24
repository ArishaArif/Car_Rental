"""Pydantic schemas for App Notifications."""

from pydantic import BaseModel, Field
from typing import Optional, Dict, Any
from datetime import datetime
import uuid


class NotificationCreate(BaseModel):
    user_id: Optional[uuid.UUID] = None
    title: str = Field(..., max_length=200)
    message: str = Field(..., max_length=1000)
    category: str = Field(default="System")
    target_role: Optional[str] = None
    action_route: Optional[str] = None
    metadata_json: Optional[Dict[str, Any]] = None


class NotificationResponse(BaseModel):
    id: str
    user_id: Optional[uuid.UUID] = None
    title: str
    message: str
    category: str
    is_read: bool
    target_role: Optional[str] = None
    action_route: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = Field(None, alias="metadata_json")
    created_at: datetime

    model_config = {"from_attributes": True, "populate_by_name": True}
