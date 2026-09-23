"""
Vehicle service — CRUD, multi-criteria filtering, category statistics, and fleet metrics.
"""

from typing import Optional, List
import uuid
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_, or_, update, delete
from fastapi import HTTPException, status

from app.models.vehicle import Vehicle
from app.models.user import User, UserRole
from app.schemas.vehicle import (
    VehicleCreate,
    VehicleUpdate,
    CategorySummaryResponse,
    FleetStatsSummaryResponse,
)


CATEGORY_METADATA = {
    "Luxury": {"icon": "star", "badge": "Executive Class", "tagline": "Prestige & elite performance models"},
    "SUV": {"icon": "car-estate", "badge": "Spacious & AWD", "tagline": "Family comfort & rugged capability"},
    "Sedan": {"icon": "car-side", "badge": "Everyday Comfort", "tagline": "Smooth, efficient city & road trips"},
    "Economy": {"icon": "fuel", "badge": "Best Value", "tagline": "High MPG, compact & wallet friendly"},
    "Electric": {"icon": "lightning-bolt", "badge": "Zero Emissions", "tagline": "Instant torque & sustainable travel"},
    "Sports": {"icon": "speedometer", "badge": "High Performance", "tagline": "Thrilling acceleration & sharp handling"},
    "Compact": {"icon": "car", "badge": "City Agile", "tagline": "Easy parking & nimble navigation"},
}


async def get_all_vehicles(
    db: AsyncSession,
    category: Optional[str] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    transmission: Optional[str] = None,
    fuel: Optional[str] = None,
    seats: Optional[int] = None,
    location: Optional[str] = None,
    search: Optional[str] = None,
    availability: Optional[str] = None,
    include_archived: bool = False,
    provider_id: Optional[uuid.UUID] = None,
    sort_by: Optional[str] = None,
) -> List[Vehicle]:
    query = select(Vehicle)
    filters = []

    if not include_archived:
        filters.append(Vehicle.availability != "Archived")
        filters.append(Vehicle.is_published == True)

    if category and category != "All":
        filters.append(func.lower(Vehicle.category) == category.lower())

    if transmission and transmission != "All":
        filters.append(func.lower(Vehicle.transmission) == transmission.lower())

    if fuel and fuel != "All":
        filters.append(func.lower(Vehicle.fuel) == fuel.lower())

    if seats and seats > 0:
        filters.append(Vehicle.seats >= seats)

    if min_price is not None:
        filters.append(Vehicle.price_per_day >= min_price)

    if max_price is not None:
        filters.append(Vehicle.price_per_day <= max_price)

    if location:
        filters.append(Vehicle.location.ilike(f"%{location}%"))

    if availability and availability != "All":
        filters.append(Vehicle.availability == availability)

    if provider_id:
        filters.append(Vehicle.provider_id == provider_id)

    if search:
        term = f"%{search.strip()}%"
        filters.append(
            or_(
                Vehicle.brand.ilike(term),
                Vehicle.model.ilike(term),
                Vehicle.location.ilike(term),
                Vehicle.category.ilike(term),
            )
        )

    if filters:
        query = query.where(and_(*filters))

    # Sorting
    if sort_by == "price_asc":
        query = query.order_by(Vehicle.price_per_day.asc())
    elif sort_by == "price_desc":
        query = query.order_by(Vehicle.price_per_day.desc())
    elif sort_by == "rating_desc":
        query = query.order_by(Vehicle.rating.desc())
    elif sort_by == "year_desc":
        query = query.order_by(Vehicle.year.desc())
    else:
        query = query.order_by(Vehicle.created_at.desc())

    result = await db.execute(query)
    return list(result.scalars().all())


async def get_vehicle_by_id(db: AsyncSession, vehicle_id: str) -> Vehicle:
    result = await db.execute(select(Vehicle).where(Vehicle.id == vehicle_id))
    vehicle = result.scalar_one_or_none()
    if not vehicle:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Vehicle with ID '{vehicle_id}' not found",
        )
    return vehicle


async def create_vehicle(
    db: AsyncSession,
    data: VehicleCreate,
    provider: User,
) -> Vehicle:
    vehicle_dict = data.model_dump()
    if not vehicle_dict.get("weekly_price"):
        vehicle_dict["weekly_price"] = round(vehicle_dict["price_per_day"] * 6.2, 2)
    if not vehicle_dict.get("images"):
        vehicle_dict["images"] = [vehicle_dict["image"]]

    vehicle = Vehicle(
        **vehicle_dict,
        provider_id=provider.id if provider.role in (UserRole.PROVIDER, UserRole.FLEET_MANAGER, UserRole.ADMIN) else None,
    )
    db.add(vehicle)
    await db.commit()
    await db.refresh(vehicle)
    return vehicle


async def update_vehicle(
    db: AsyncSession,
    vehicle_id: str,
    data: VehicleUpdate,
    user: User,
) -> Vehicle:
    vehicle = await get_vehicle_by_id(db, vehicle_id)

    # Permission check: Admin or the owner Provider
    if user.role != UserRole.ADMIN and vehicle.provider_id != user.id:
        if user.role != UserRole.FLEET_MANAGER:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to update this vehicle",
            )

    updates = data.model_dump(exclude_none=True)
    if updates:
        for key, val in updates.items():
            setattr(vehicle, key, val)
        await db.commit()
        await db.refresh(vehicle)

    return vehicle


async def set_vehicle_publish_status(
    db: AsyncSession,
    vehicle_id: str,
    is_published: bool,
    user: User,
) -> Vehicle:
    vehicle = await get_vehicle_by_id(db, vehicle_id)
    if user.role != UserRole.ADMIN and vehicle.provider_id != user.id:
        if user.role != UserRole.FLEET_MANAGER:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to modify publish state",
            )

    vehicle.is_published = is_published
    if is_published and vehicle.availability == "Archived":
        vehicle.availability = "Available"

    await db.commit()
    await db.refresh(vehicle)
    return vehicle


async def delete_or_archive_vehicle(
    db: AsyncSession,
    vehicle_id: str,
    user: User,
    permanent: bool = False,
) -> dict:
    vehicle = await get_vehicle_by_id(db, vehicle_id)
    if user.role != UserRole.ADMIN and vehicle.provider_id != user.id:
        if user.role != UserRole.FLEET_MANAGER:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to remove this vehicle",
            )

    if permanent and user.role == UserRole.ADMIN:
        await db.delete(vehicle)
        await db.commit()
        return {"message": f"Vehicle {vehicle_id} permanently deleted"}
    else:
        vehicle.availability = "Archived"
        vehicle.is_published = False
        await db.commit()
        return {"message": f"Vehicle {vehicle_id} archived"}


async def get_category_summaries(db: AsyncSession) -> List[CategorySummaryResponse]:
    result = await db.execute(
        select(
            Vehicle.category,
            func.count(Vehicle.id).label("count"),
            func.min(Vehicle.price_per_day).label("min_price"),
        )
        .where(and_(Vehicle.availability != "Archived", Vehicle.is_published == True))
        .group_by(Vehicle.category)
    )
    rows = result.all()
    summaries = []
    for cat, count, min_price in rows:
        meta = CATEGORY_METADATA.get(
            cat,
            {"icon": "car", "badge": "Featured", "tagline": "Premium selection for all journeys"},
        )
        summaries.append(
            CategorySummaryResponse(
                category=cat,
                count=count,
                min_price=float(min_price) if min_price else 0.0,
                icon=meta["icon"],
                badge=meta["badge"],
                tagline=meta["tagline"],
            )
        )
    return summaries


async def get_fleet_stats(
    db: AsyncSession, provider_id: Optional[uuid.UUID] = None
) -> FleetStatsSummaryResponse:
    query = select(Vehicle)
    if provider_id:
        query = query.where(Vehicle.provider_id == provider_id)

    result = await db.execute(query)
    vehicles = list(result.scalars().all())

    total = len(vehicles)
    available = sum(1 for v in vehicles if v.availability == "Available")
    rented = sum(1 for v in vehicles if v.availability in ("Rented", "Active Rental", "Booked"))
    maintenance = sum(1 for v in vehicles if v.availability == "Maintenance")
    archived = sum(1 for v in vehicles if v.availability == "Archived")

    active_fleet = total - archived
    utilization = round((rented / active_fleet * 100), 1) if active_fleet > 0 else 0.0

    return FleetStatsSummaryResponse(
        total_vehicles=total,
        available_vehicles=available,
        rented_vehicles=rented,
        maintenance_vehicles=maintenance,
        archived_vehicles=archived,
        utilization_rate=utilization,
    )
