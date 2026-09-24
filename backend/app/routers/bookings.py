"""
Bookings router — reservations, pricing engine, check-in pickup, return checkout, invoices & revenue analytics.
"""

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional, List
import uuid

from app.database import get_db
from app.models.user import User
from app.schemas.booking import (
    CreateBookingRequest,
    CalculatePricingRequest,
    CheckInPickupRequest,
    ProcessReturnRequest,
    BookingResponse,
    BookingInvoiceResponse,
    RevenueMetricsResponse,
)
from app.services import booking_service
from app.utils.dependencies import get_current_user

router = APIRouter(prefix="/bookings", tags=["Bookings"])


@router.get(
    "",
    response_model=List[BookingResponse],
    summary="List Bookings",
    description="Retrieve bookings filtered by status, vehicle, or role (Customer, Provider, Fleet Manager, Admin).",
)
async def list_bookings(
    status: Optional[str] = Query(None, description="Status filter: Pending, Confirmed, Active, Completed, Cancelled"),
    vehicle_id: Optional[str] = Query(None, description="Filter by vehicle ID"),
    customer_id: Optional[uuid.UUID] = Query(None, description="Filter by customer UUID (Admin/Fleet Manager only)"),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await booking_service.get_all_bookings(
        db=db,
        user=current_user,
        status_filter=status,
        customer_id=customer_id,
        vehicle_id=vehicle_id,
    )


@router.post(
    "/calculate-pricing",
    summary="Estimate Booking Pricing",
    description="Calculate live pricing breakdown (subtotal, platform fee, taxes, security deposit, and total) before reservation.",
)
async def calculate_pricing(
    data: CalculatePricingRequest,
    db: AsyncSession = Depends(get_db),
):
    return await booking_service.estimate_price(db, data)


@router.get(
    "/revenue/metrics",
    response_model=RevenueMetricsResponse,
    summary="Get Revenue Analytics & KPIs",
    description="Get daily, weekly, monthly, total revenue, top-performing fleet vehicles, category breakdown, and weekly trend.",
)
async def get_revenue_metrics(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await booking_service.get_revenue_metrics(db, current_user)


@router.get(
    "/{booking_id}",
    response_model=BookingResponse,
    summary="Get Booking Details",
    description="Retrieve full details for a booking including pricing breakdown, customer details, vehicle, and invoice.",
)
async def get_booking(
    booking_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await booking_service.get_booking_by_id(db, booking_id, current_user)


@router.post(
    "",
    response_model=BookingResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create New Booking",
    description="Reserve a vehicle. Generates a secure 4-digit pickup code and reserves the fleet unit.",
)
async def create_booking(
    data: CreateBookingRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await booking_service.create_booking(db, data, current_user)


@router.post(
    "/{booking_id}/confirm",
    response_model=BookingResponse,
    summary="Confirm Booking",
    description="Confirm reservation status.",
)
async def confirm_booking(
    booking_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await booking_service.confirm_booking(db, booking_id, current_user)


@router.post(
    "/{booking_id}/cancel",
    response_model=BookingResponse,
    summary="Cancel Booking",
    description="Cancel reservation and release vehicle back to available fleet inventory.",
)
async def cancel_booking(
    booking_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await booking_service.cancel_booking(db, booking_id, current_user)


@router.post(
    "/{booking_id}/pickup",
    response_model=BookingResponse,
    summary="Check-in & Pickup Vehicle",
    description="Validate customer 4-digit pickup code at pickup desk, record departure odometer, and activate rental.",
)
async def check_in_pickup(
    booking_id: str,
    data: CheckInPickupRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await booking_service.check_in_pickup(db, booking_id, data, current_user)


@router.post(
    "/{booking_id}/return",
    response_model=BookingInvoiceResponse,
    summary="Process Vehicle Return & Generate Invoice",
    description="Record return odometer and fuel level, apply late or damage charges if any, calculate deposit refund, and generate final invoice.",
)
async def process_return(
    booking_id: str,
    data: ProcessReturnRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await booking_service.process_vehicle_return(db, booking_id, data, current_user)


@router.get(
    "/{booking_id}/invoice",
    response_model=BookingInvoiceResponse,
    summary="Get Final Booking Invoice",
    description="Retrieve itemized post-return billing invoice for a reservation.",
)
async def get_invoice(
    booking_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await booking_service.get_booking_invoice(db, booking_id, current_user)
