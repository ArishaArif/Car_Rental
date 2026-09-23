"""Pydantic schemas for Smart Pricing and AI Damage Inspection."""

from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime


# ── Smart Pricing ─────────────────────────────────────────────────────────────
class PricingFactorSchema(BaseModel):
    label: str
    impact: str
    positive: bool


class VehiclePricingMetricsResponse(BaseModel):
    vehicle_id: str
    vehicle_name: str
    current_price: float
    recommended_price: float
    difference: float
    percentage_change: float
    demand_level: str
    utilization_rate: float
    weekend_factor: float
    seasonal_factor: float
    availability_status: str
    booking_frequency: float
    explanation: str
    factors: List[PricingFactorSchema]


class ApplyRecommendationRequest(BaseModel):
    vehicle_id: str
    new_price: float = Field(..., gt=0)


# ── AI Damage Inspection ──────────────────────────────────────────────────────
class CapturedPhotoSchema(BaseModel):
    category: str = Field(..., examples=["Front", "Rear", "Left", "Right", "Interior", "Dashboard"])
    uri: str
    captured_at: Optional[str] = None
    label: Optional[str] = None


class DamageFindingSchema(BaseModel):
    id: str
    category: str
    damage_type: str
    severity: str
    location: str
    confidence: float
    estimated_repair_cost: float
    evidence_image_url: str
    notes: str


class InspectionAnalysisResponse(BaseModel):
    inspection_id: str
    vehicle_id: str
    booking_id: Optional[str] = None
    analyzed_at: str
    findings: List[DamageFindingSchema]
    total_estimated_cost: float
    overall_condition: str
    disclaimer: str


class DamageAnalysisRequest(BaseModel):
    booking_id: Optional[str] = None
    vehicle_id: str
    photos: List[CapturedPhotoSchema]
    scenario: Optional[str] = Field(default="Clean", description="Simulation scenario: Clean, MinorDamage, ModerateDamage, SevereDamage")


class PhotoTemplateItem(BaseModel):
    title: str
    hint: str
    mock_uri: str


# ── AI Recommendations ────────────────────────────────────────────────────────
class AIRecommendationRequest(BaseModel):
    body_type: Optional[str] = None
    fuel_type: Optional[str] = None
    seats: Optional[int] = None
    max_price: Optional[float] = None
    top_n: int = 5
