"""Pydantic schemas for Fleet Operations."""

from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime


# ── Maintenance ───────────────────────────────────────────────────────────────
class MaintenanceCreate(BaseModel):
    vehicle_id: str
    vehicle_name: str
    vehicle_plate: str = "FLT-001"
    type: str = "Oil Change"
    due_date: str
    estimated_cost: float = 100.0
    service_center: str = "Fleet Tech Center"
    notes: Optional[str] = None


class MaintenanceUpdate(BaseModel):
    status: Optional[str] = None
    completed_date: Optional[str] = None
    actual_cost: Optional[float] = None
    notes: Optional[str] = None
    odometer_at_service: Optional[int] = None


class MaintenanceResponse(BaseModel):
    id: str
    vehicle_id: str
    vehicle_name: str
    vehicle_plate: str
    type: str
    due_date: str
    completed_date: Optional[str] = None
    status: str
    estimated_cost: float
    actual_cost: Optional[float] = None
    service_center: str
    notes: Optional[str] = None
    odometer_at_service: Optional[int] = None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


# ── Inspections ───────────────────────────────────────────────────────────────
class InspectionCreate(BaseModel):
    vehicle_id: str
    vehicle_name: str
    booking_id: Optional[str] = None
    inspector_name: str = "Marcus Chen"
    date: str
    status: str = "Completed"
    type: str = "Routine"
    exterior_condition: str = "Good"
    interior_condition: str = "Clean"
    tires_and_brakes: str = "Good"
    fuel_level: int = Field(100, ge=0, le=100)
    odometer_reading: int = 15000
    passed: bool = True
    notes: Optional[str] = None


class InspectionResponse(BaseModel):
    id: str
    vehicle_id: str
    vehicle_name: str
    booking_id: Optional[str] = None
    inspector_name: str
    date: str
    status: str
    type: str
    exterior_condition: str
    interior_condition: str
    tires_and_brakes: str
    fuel_level: int
    odometer_reading: int
    passed: bool
    notes: Optional[str] = None
    created_at: datetime

    model_config = {"from_attributes": True}


# ── Damage Reports ────────────────────────────────────────────────────────────
class DamageReportCreate(BaseModel):
    vehicle_id: str
    vehicle_name: str
    booking_id: Optional[str] = None
    customer_name: str = "Customer"
    damage_status: str = "Minor Scratches"
    description: str
    estimated_charge: float = 0.0
    photo_url: Optional[str] = None


class DamageReportUpdate(BaseModel):
    review_status: Optional[str] = None
    estimated_charge: Optional[float] = None
    description: Optional[str] = None


class DamageReportResponse(BaseModel):
    id: str
    vehicle_id: str
    vehicle_name: str
    booking_id: Optional[str] = None
    customer_name: str
    damage_status: str
    description: str
    estimated_charge: float
    review_status: str
    photo_url: Optional[str] = None
    resolved_at: Optional[datetime] = None
    reported_at: datetime

    model_config = {"from_attributes": True}


# ── Fleet Tasks ───────────────────────────────────────────────────────────────
class FleetTaskCreate(BaseModel):
    title: str
    description: str
    vehicle_id: Optional[str] = None
    vehicle_name: Optional[str] = None
    priority: str = "Medium"
    due_time: str = "Today, 5:00 PM"
    category: str = "Preparation"


class FleetTaskUpdate(BaseModel):
    status: Optional[str] = None
    priority: Optional[str] = None
    due_time: Optional[str] = None


class FleetTaskResponse(BaseModel):
    id: str
    title: str
    description: str
    vehicle_id: Optional[str] = None
    vehicle_name: Optional[str] = None
    priority: str
    due_time: str
    status: str
    category: str
    created_at: datetime

    model_config = {"from_attributes": True}
