"""Pydantic schemas for Vehicle domain."""

from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
import uuid


class VehicleBase(BaseModel):
    brand: str = Field(..., min_length=1, max_length=80, examples=["Toyota"])
    model: str = Field(..., min_length=1, max_length=80, examples=["Corolla Hybrid"])
    year: int = Field(..., ge=1990, le=2035, examples=[2024])
    category: str = Field(default="Sedan", examples=["Sedan"])
    image: str = Field(..., max_length=500, examples=["https://images.unsplash.com/photo-1623869675781-80aa31012a5a?q=80&w=800"])
    images: Optional[List[str]] = Field(default_factory=list)
    price_per_day: float = Field(..., gt=0, examples=[55.0])
    weekly_price: Optional[float] = Field(default=None, examples=[340.0])
    security_deposit: float = Field(default=150.0, ge=0, examples=[150.0])
    rating: float = Field(default=5.0, ge=0.0, le=5.0, examples=[4.9])
    seats: int = Field(default=5, ge=1, le=50, examples=[5])
    doors: int = Field(default=4, ge=1, le=10, examples=[4])
    transmission: str = Field(default="Automatic", examples=["Automatic"])
    fuel: str = Field(default="Petrol", examples=["Hybrid"])
    location: str = Field(default="Downtown Hub", max_length=200, examples=["Airport Terminal 1 - Hub West"])
    mileage: int = Field(default=12000, ge=0, examples=[14200])
    availability: str = Field(default="Available", examples=["Available"])
    features: List[str] = Field(default_factory=list, examples=[["Bluetooth Audio", "Backup Camera", "Adaptive Cruise"]])
    description: str = Field(default="", max_length=2000, examples=["Spacious and fuel-efficient sedan."])
    is_published: bool = Field(default=True)


class VehicleCreate(VehicleBase):
    pass


class VehicleUpdate(BaseModel):
    brand: Optional[str] = Field(None, min_length=1, max_length=80)
    model: Optional[str] = Field(None, min_length=1, max_length=80)
    year: Optional[int] = Field(None, ge=1990, le=2035)
    category: Optional[str] = None
    image: Optional[str] = Field(None, max_length=500)
    images: Optional[List[str]] = None
    price_per_day: Optional[float] = Field(None, gt=0)
    weekly_price: Optional[float] = None
    security_deposit: Optional[float] = Field(None, ge=0)
    rating: Optional[float] = Field(None, ge=0.0, le=5.0)
    seats: Optional[int] = Field(None, ge=1, le=50)
    doors: Optional[int] = Field(None, ge=1, le=10)
    transmission: Optional[str] = None
    fuel: Optional[str] = None
    location: Optional[str] = Field(None, max_length=200)
    mileage: Optional[int] = Field(None, ge=0)
    availability: Optional[str] = None
    features: Optional[List[str]] = None
    description: Optional[str] = Field(None, max_length=2000)
    is_published: Optional[bool] = None


class VehicleResponse(VehicleBase):
    id: str
    provider_id: Optional[uuid.UUID] = None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class CategorySummaryResponse(BaseModel):
    category: str
    count: int
    min_price: float
    icon: str
    badge: str
    tagline: str


class FleetStatsSummaryResponse(BaseModel):
    total_vehicles: int
    available_vehicles: int
    rented_vehicles: int
    maintenance_vehicles: int
    archived_vehicles: int
    utilization_rate: float
