"""Pydantic schemas for Provider Subscriptions and Billing."""

from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime
import uuid


class SubscriptionPlanResponse(BaseModel):
    id: str
    name: str
    tagline: str
    monthly_price: float
    annual_price: float
    vehicle_limit: int
    booking_limit: int
    ai_assistant_access: str
    smart_pricing_access: str
    analytics: str
    team_members: int
    support: str
    features: List[str]


class SubscriptionUsageSchema(BaseModel):
    vehicles_used: int = Field(..., alias="vehiclesUsed")
    vehicle_limit: int = Field(..., alias="vehicleLimit")
    bookings_used: int = Field(..., alias="bookingsUsed")
    booking_limit: int = Field(..., alias="bookingLimit")
    team_seats_used: int = Field(..., alias="teamSeatsUsed")
    team_seats_limit: int = Field(..., alias="teamSeatsLimit")

    model_config = {"populate_by_name": True}


class ProviderSubscriptionResponse(BaseModel):
    id: str
    provider_id: uuid.UUID
    plan_id: str
    plan_name: Optional[str] = None
    status: str
    billing_cycle: str
    start_date: str
    renewal_date: str
    usage: Dict[str, Any]
    enabled_features: List[str]
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class UpgradeSubscriptionRequest(BaseModel):
    target_plan_id: str = Field(..., examples=["professional"])
    billing_cycle: str = Field(default="monthly", examples=["monthly", "annual"])
    payment_method: Optional[str] = Field(default="Visa ending 4242")


class BillingInvoiceRecordResponse(BaseModel):
    id: str
    invoice_number: str
    provider_id: uuid.UUID
    date: str
    amount: float
    plan_name: str
    billing_cycle: str
    status: str
    payment_method: str
    pdf_url: Optional[str] = None
    created_at: datetime

    model_config = {"from_attributes": True}
