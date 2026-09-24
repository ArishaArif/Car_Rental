"""Pydantic schemas for Admin operations, Verifications, Disputes, and System Config."""

from pydantic import BaseModel, Field, EmailStr
from typing import Optional, List, Dict, Any
from datetime import datetime
import uuid
from app.models.user import UserRole, VerificationStatus


class AdminKPIsResponse(BaseModel):
    total_customers: int = Field(..., alias="totalCustomers")
    total_providers: int = Field(..., alias="totalProviders")
    total_vehicles: int = Field(..., alias="totalVehicles")
    active_rentals: int = Field(..., alias="activeRentals")
    total_bookings: int = Field(..., alias="totalBookings")
    platform_revenue: float = Field(..., alias="platformRevenue")
    pending_verifications: int = Field(..., alias="pendingVerifications")
    open_disputes: int = Field(..., alias="openDisputes")

    model_config = {"populate_by_name": True}


class AdminUserRecordResponse(BaseModel):
    id: str
    name: str
    email: EmailStr
    role: str
    phone: Optional[str] = None
    city: Optional[str] = None
    joined_date: str = Field(..., alias="joinedDate")
    verification_status: str = Field(..., alias="verificationStatus")
    status: str
    license_number: Optional[str] = Field(None, alias="licenseNumber")
    business_name: Optional[str] = Field(None, alias="businessName")
    total_bookings_or_vehicles: int = Field(0, alias="totalBookingsOrVehicles")

    model_config = {"populate_by_name": True}


class AdminProviderRecordResponse(BaseModel):
    id: str
    provider_name: str = Field(..., alias="providerName")
    business_name: str = Field(..., alias="businessName")
    fleet_size: int = Field(..., alias="fleetSize")
    verification_status: str = Field(..., alias="verificationStatus")
    revenue: float
    status: str
    email: EmailStr
    phone: Optional[str] = None
    city: Optional[str] = None
    joined_date: str = Field(..., alias="joinedDate")

    model_config = {"populate_by_name": True}


class VerificationItemResponse(BaseModel):
    id: str
    target_id: str = Field(..., alias="targetId")
    name: str
    type: str
    identifier: str
    submitted_date: str = Field(..., alias="submittedDate")
    status: str
    document_type: str = Field(..., alias="documentType")
    document_number: str = Field(..., alias="documentNumber")
    expiry_date: Optional[str] = Field(None, alias="expiryDate")
    document_url: Optional[str] = Field(None, alias="documentUrl")
    notes: Optional[str] = None

    model_config = {"populate_by_name": True, "from_attributes": True}


class VerificationReviewRequest(BaseModel):
    status: str = Field(..., examples=["Verified", "Rejected", "Suspended"])
    notes: Optional[str] = None


class AdminPaymentRecordResponse(BaseModel):
    id: str
    booking_id: str = Field(..., alias="bookingId")
    customer_name: str = Field(..., alias="customerName")
    provider_name: str = Field(..., alias="providerName")
    vehicle_name: str = Field(..., alias="vehicleName")
    rental_amount: float = Field(..., alias="rentalAmount")
    platform_commission: float = Field(..., alias="platformCommission")
    provider_payout: float = Field(..., alias="providerPayout")
    security_deposit: float = Field(..., alias="securityDeposit")
    refund_status: str = Field(..., alias="refundStatus")
    payout_status: str = Field(..., alias="payoutStatus")
    transaction_date: str = Field(..., alias="transactionDate")

    model_config = {"populate_by_name": True, "from_attributes": True}


class DisputeRecordResponse(BaseModel):
    id: str
    booking_id: str = Field(..., alias="bookingId")
    customer_name: str = Field(..., alias="customerName")
    provider_name: str = Field(..., alias="providerName")
    vehicle_name: str = Field(..., alias="vehicleName")
    disputed_amount: float = Field(..., alias="disputedAmount")
    reason: str
    status: str
    reported_at: str = Field(..., alias="reportedAt")
    evidence: Optional[str] = None
    admin_notes: Optional[str] = Field(None, alias="adminNotes")

    model_config = {"populate_by_name": True, "from_attributes": True}


class DisputeUpdateRequest(BaseModel):
    status: str = Field(..., examples=["Open", "Under Review", "Resolved"])
    admin_notes: Optional[str] = None


class SystemConfigSchema(BaseModel):
    commission_rate: float = Field(10.0, alias="commissionRate")
    vehicle_categories: List[Dict[str, Any]] = Field(default_factory=list, alias="vehicleCategories")
    regions: List[Dict[str, Any]] = Field(default_factory=list)
    pricing_baseline: Dict[str, Any] = Field(default_factory=dict, alias="pricingBaseline")

    model_config = {"populate_by_name": True}
