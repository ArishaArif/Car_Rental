"""
Vehicles router — discovery, search, filtering, and provider fleet management.
"""

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional, List
import uuid

from app.database import get_db
from app.models.user import User, UserRole
from app.schemas.vehicle import (
    VehicleCreate,
    VehicleUpdate,
    VehicleResponse,
    CategorySummaryResponse,
    FleetStatsSummaryResponse,
)
from app.services import vehicle_service
from app.utils.dependencies import get_current_user

router = APIRouter(prefix="/vehicles", tags=["Vehicles"])


@router.get(
    "",
    response_model=List[VehicleResponse],
    summary="List & Filter Vehicles",
    description="Discover published vehicles with multi-faceted filtering by category, price, fuel, transmission, seats, location, and search term.",
)
async def list_vehicles(
    category: Optional[str] = Query(None, description="Category filter (e.g. Sedan, SUV, Luxury)"),
    min_price: Optional[float] = Query(None, description="Minimum price per day"),
    max_price: Optional[float] = Query(None, description="Maximum price per day"),
    transmission: Optional[str] = Query(None, description="Transmission type (Automatic / Manual)"),
    fuel: Optional[str] = Query(None, description="Fuel type (Petrol, Diesel, Hybrid, Electric)"),
    seats: Optional[int] = Query(None, description="Minimum number of seats"),
    location: Optional[str] = Query(None, description="Pickup location substring search"),
    search: Optional[str] = Query(None, description="Free text search across brand, model, location"),
    availability: Optional[str] = Query(None, description="Availability state"),
    include_archived: bool = Query(False, description="Include archived fleet (manager/provider only)"),
    provider_id: Optional[uuid.UUID] = Query(None, description="Filter by provider ID"),
    sort_by: Optional[str] = Query(None, description="Sort option: price_asc, price_desc, rating_desc, year_desc"),
    db: AsyncSession = Depends(get_db),
):
    return await vehicle_service.get_all_vehicles(
        db=db,
        category=category,
        min_price=min_price,
        max_price=max_price,
        transmission=transmission,
        fuel=fuel,
        seats=seats,
        location=location,
        search=search,
        availability=availability,
        include_archived=include_archived,
        provider_id=provider_id,
        sort_by=sort_by,
    )


@router.get(
    "/categories",
    response_model=List[CategorySummaryResponse],
    summary="Get Vehicle Category Summaries",
    description="Returns aggregate vehicle count, lowest daily rate, and UI metadata for each car category.",
)
async def get_categories(db: AsyncSession = Depends(get_db)):
    return await vehicle_service.get_category_summaries(db)


@router.get(
    "/stats",
    response_model=FleetStatsSummaryResponse,
    summary="Get Fleet Overview Stats",
    description="Aggregated fleet metrics (total, available, rented, maintenance, utilization rate).",
)
async def get_fleet_stats(
    provider_id: Optional[uuid.UUID] = Query(None, description="Optional provider filter"),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    # If caller is a Provider, default to their fleet unless Admin
    target_provider = provider_id
    if current_user.role == UserRole.PROVIDER and not target_provider:
        target_provider = current_user.id
    return await vehicle_service.get_fleet_stats(db, provider_id=target_provider)


@router.get(
    "/{vehicle_id}",
    response_model=VehicleResponse,
    summary="Get Vehicle Details",
    description="Retrieve comprehensive vehicle specifications, pricing, features, and availability by ID.",
)
async def get_vehicle(vehicle_id: str, db: AsyncSession = Depends(get_db)):
    return await vehicle_service.get_vehicle_by_id(db, vehicle_id)


@router.post(
    "",
    response_model=VehicleResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Add Vehicle to Fleet",
    description="Register a new vehicle with technical specifications, pricing, features, and imagery.",
)
async def create_vehicle(
    data: VehicleCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await vehicle_service.create_vehicle(db, data, current_user)


@router.patch(
    "/{vehicle_id}",
    response_model=VehicleResponse,
    summary="Update Vehicle",
    description="Update vehicle details, daily pricing, mileage, or operational status.",
)
async def update_vehicle(
    vehicle_id: str,
    data: VehicleUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await vehicle_service.update_vehicle(db, vehicle_id, data, current_user)


@router.post(
    "/{vehicle_id}/publish",
    response_model=VehicleResponse,
    summary="Publish Vehicle",
    description="Make vehicle visible and bookable for customer discovery.",
)
async def publish_vehicle(
    vehicle_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await vehicle_service.set_vehicle_publish_status(db, vehicle_id, True, current_user)


@router.post(
    "/{vehicle_id}/unpublish",
    response_model=VehicleResponse,
    summary="Unpublish Vehicle",
    description="Temporarily hide vehicle from customer search.",
)
async def unpublish_vehicle(
    vehicle_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await vehicle_service.set_vehicle_publish_status(db, vehicle_id, False, current_user)


@router.delete(
    "/{vehicle_id}",
    summary="Archive or Delete Vehicle",
    description="Soft-archive vehicle from active inventory (or hard delete if Admin).",
)
async def delete_vehicle(
    vehicle_id: str,
    permanent: bool = Query(False, description="Permanent deletion (Admin only)"),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await vehicle_service.delete_or_archive_vehicle(db, vehicle_id, current_user, permanent=permanent)
