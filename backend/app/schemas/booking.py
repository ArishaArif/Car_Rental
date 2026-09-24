"""Pydantic schemas for Bookings and Invoicing."""

from pydantic import BaseModel, Field, EmailStr
from typing import Optional, List, Dict, Any
from datetime import datetime
import uuid

from app.schemas.vehicle import VehicleResponse


class BookingPricingSchema(BaseModel):
    daily_price: float = Field(..., alias="dailyPrice")
    rental_days: int = Field(..., alias="rentalDays")
    subtotal: float
    service_fee: float = Field(..., alias="serviceFee")
    taxes: float
    security_deposit: float = Field(..., alias="securityDeposit")
    total: float

    model_config = {"populate_by_name": True}


class BookingCustomerDetailsSchema(BaseModel):
    full_name: str = Field(..., alias="fullName")
    phone: str
    email: EmailStr
    license_number: Optional[str] = Field(None, alias="licenseNumber")
    notes: Optional[str] = None

    model_config = {"populate_by_name": True}


class CalculatePricingRequest(BaseModel):
    vehicle_id: str
    rental_days: int = Field(default=1, ge=1)
    pickup_date: Optional[str] = None
    return_date: Optional[str] = None


class CreateBookingRequest(BaseModel):
    vehicle_id: str
    pickup_date: str
    pickup_time: str = "10:00 AM"
    return_date: str
    return_time: str = "10:00 AM"
    rental_days: int = Field(..., ge=1)
    pickup_location: str
    return_location: str
    customer_details: BookingCustomerDetailsSchema
    payment_method: str = "Card"


class CheckInPickupRequest(BaseModel):
    pickup_code: str = Field(..., min_length=4, max_length=10)
    pickup_mileage: Optional[int] = None


class ProcessReturnRequest(BaseModel):
    dropoff_mileage: Optional[int] = None
    dropoff_fuel: Optional[int] = Field(None, ge=0, le=100)
    late_hours: Optional[int] = 0
    damage_charges: Optional[float] = 0.0
    notes: Optional[str] = None


class BookingInvoiceResponse(BaseModel):
    id: str
    invoice_number: str
    booking_id: str
    base_rental: float
    service_fee: float
    taxes: float
    security_deposit: float
    late_charges: float
    damage_charges: float
    deposit_refund: float
    final_amount: float
    payment_method: str
    payment_status: str
    issued_at: datetime

    model_config = {"from_attributes": True}


class BookingResponse(BaseModel):
    id: str
    vehicle_id: str
    customer_id: uuid.UUID
    pickup_date: str
    pickup_time: str
    return_date: str
    return_time: str
    rental_days: int
    pickup_location: str
    return_location: str
    pricing: Dict[str, Any]
    customer_details: Dict[str, Any]
    payment_method: str
    payment_status: str
    status: str
    pickup_code: str
    pickup_mileage: Optional[int] = None
    dropoff_mileage: Optional[int] = None
    dropoff_fuel: Optional[int] = None
    created_at: datetime
    updated_at: datetime
    vehicle: Optional[VehicleResponse] = None
    invoice: Optional[BookingInvoiceResponse] = None

    model_config = {"from_attributes": True}


class TopVehicleMetricSchema(BaseModel):
    id: str
    brand: str
    model: str
    category: str
    image: str
    trips_count: int
    revenue: float


class RevenueCategoryMetricSchema(BaseModel):
    category: str
    amount: float
    percentage: float


class WeeklyTrendMetricSchema(BaseModel):
    day: str
    amount: float


class RevenueMetricsResponse(BaseModel):
    daily_revenue: float
    weekly_revenue: float
    monthly_revenue: float
    total_revenue: float
    completed_rentals_count: int
    cancelled_bookings_count: int
    active_rentals_count: int
    pending_bookings_count: int
    cancellation_rate: float
    top_vehicles: List[TopVehicleMetricSchema]
    revenue_by_category: List[RevenueCategoryMetricSchema]
    weekly_trend: List[WeeklyTrendMetricSchema]
