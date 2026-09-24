"""
AI & Smart Pricing service — Dynamic yield pricing, AI damage inspection engine, and car recommendations.
"""

from typing import Optional, List, Dict, Any
import uuid
from datetime import datetime, timezone
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_
from fastapi import HTTPException, status

from app.models.vehicle import Vehicle
from app.models.user import User, UserRole
from app.schemas.ai import (
    VehiclePricingMetricsResponse,
    PricingFactorSchema,
    InspectionAnalysisResponse,
    DamageFindingSchema,
    DamageAnalysisRequest,
    PhotoTemplateItem,
    AIRecommendationRequest,
)

PHOTO_TEMPLATES: Dict[str, PhotoTemplateItem] = {
    "Front": PhotoTemplateItem(
        title="Front Bumper & Headlights",
        hint="Capture full front grill, bumper, hood, and headlight lenses.",
        mock_uri="https://images.unsplash.com/photo-1617788138017-80ad40651399?q=80&w=800",
    ),
    "Rear": PhotoTemplateItem(
        title="Rear Bumper & Trunk",
        hint="Capture entire rear fender, taillights, and boot lid.",
        mock_uri="https://images.unsplash.com/photo-1549399542-7e3f8b79c341?q=80&w=800",
    ),
    "Left": PhotoTemplateItem(
        title="Left Driver Side Panel",
        hint="Align front & rear doors, side mirrors, and wheel arches.",
        mock_uri="https://images.unsplash.com/photo-1583121274602-3e2820c69888?q=80&w=800",
    ),
    "Right": PhotoTemplateItem(
        title="Right Passenger Side Panel",
        hint="Capture passenger side doors, quarter panel, and skirts.",
        mock_uri="https://images.unsplash.com/photo-1552519507-da3b142c6e3d?q=80&w=800",
    ),
    "Interior": PhotoTemplateItem(
        title="Interior Cabin & Upholstery",
        hint="Ensure seats, floor mats, and steering column are clearly visible.",
        mock_uri="https://images.unsplash.com/photo-1563720223185-11003d516935?q=80&w=800",
    ),
    "Dashboard": PhotoTemplateItem(
        title="Dashboard & Gauge Cluster",
        hint="Take clear view of instrument cluster, screen, and gear shift.",
        mock_uri="https://images.unsplash.com/photo-1590362891988-f77804703088?q=80&w=800",
    ),
}


def get_photo_templates() -> Dict[str, PhotoTemplateItem]:
    return PHOTO_TEMPLATES


def compute_pricing_metrics_for_vehicle(vehicle: Vehicle) -> VehiclePricingMetricsResponse:
    current_price = vehicle.price_per_day
    cat = vehicle.category.lower()

    if "suv" in cat:
        demand_multiplier = 1.14
        demand_level = "Peak"
        utilization_rate = 89.0
        weekend_factor = 1.18
        seasonal_factor = 1.10
        booking_frequency = 7.8
    elif "sedan" in cat:
        demand_multiplier = 1.10
        demand_level = "High"
        utilization_rate = 84.0
        weekend_factor = 1.12
        seasonal_factor = 1.05
        booking_frequency = 6.5
    elif "lux" in cat:
        demand_multiplier = 1.08
        demand_level = "Moderate"
        utilization_rate = 68.0
        weekend_factor = 1.22
        seasonal_factor = 1.12
        booking_frequency = 3.9
    else:
        demand_multiplier = 1.05
        demand_level = "Moderate"
        utilization_rate = 75.0
        weekend_factor = 1.08
        seasonal_factor = 1.02
        booking_frequency = 5.1

    raw_recommended = current_price * demand_multiplier
    recommended_price = round(raw_recommended / 5.0) * 5.0
    if recommended_price == current_price:
        recommended_price = current_price + 5.0

    difference = round(recommended_price - current_price, 2)
    percentage_change = round((difference / current_price) * 100, 1)

    factors = [
        PricingFactorSchema(
            label="Category Market Demand",
            impact=f"+{round((demand_multiplier - 1) * 100)}%",
            positive=True,
        ),
        PricingFactorSchema(
            label="Weekend Surge Premium",
            impact=f"+{round((weekend_factor - 1) * 100)}%",
            positive=True,
        ),
        PricingFactorSchema(
            label="Depot Fleet Utilization",
            impact=f"{utilization_rate}% Occupancy",
            positive=utilization_rate > 70,
        ),
        PricingFactorSchema(
            label="Seasonal Travel Index",
            impact=f"+{round((seasonal_factor - 1) * 100)}%",
            positive=True,
        ),
    ]

    return VehiclePricingMetricsResponse(
        vehicle_id=vehicle.id,
        vehicle_name=f"{vehicle.brand} {vehicle.model}",
        current_price=current_price,
        recommended_price=recommended_price,
        difference=difference,
        percentage_change=percentage_change,
        demand_level=demand_level,
        utilization_rate=utilization_rate,
        weekend_factor=weekend_factor,
        seasonal_factor=seasonal_factor,
        availability_status=vehicle.availability,
        booking_frequency=booking_frequency,
        explanation=f"High weekend and regional demand for {vehicle.category} models supports a yield increase of {abs(difference):.0f} USD/day to optimize fleet ROI.",
        factors=factors,
    )


async def get_vehicle_pricing_metrics(
    db: AsyncSession, vehicle_id: str
) -> VehiclePricingMetricsResponse:
    result = await db.execute(select(Vehicle).where(Vehicle.id == vehicle_id))
    vehicle = result.scalar_one_or_none()
    if not vehicle:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Vehicle '{vehicle_id}' not found",
        )
    return compute_pricing_metrics_for_vehicle(vehicle)


async def get_all_fleet_pricing_metrics(
    db: AsyncSession, provider_id: Optional[uuid.UUID] = None
) -> List[VehiclePricingMetricsResponse]:
    query = select(Vehicle).where(Vehicle.availability != "Archived")
    if provider_id:
        query = query.where(Vehicle.provider_id == provider_id)

    result = await db.execute(query)
    vehicles = list(result.scalars().all())
    return [compute_pricing_metrics_for_vehicle(v) for v in vehicles]


async def apply_pricing_recommendation(
    db: AsyncSession, vehicle_id: str, new_price: float, user: User
) -> Vehicle:
    result = await db.execute(select(Vehicle).where(Vehicle.id == vehicle_id))
    vehicle = result.scalar_one_or_none()
    if not vehicle:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Vehicle '{vehicle_id}' not found",
        )

    if user.role != UserRole.ADMIN and vehicle.provider_id != user.id:
        if user.role != UserRole.FLEET_MANAGER:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to modify pricing for this vehicle",
            )

    vehicle.price_per_day = new_price
    vehicle.weekly_price = round(new_price * 6.2, 2)
    await db.commit()
    await db.refresh(vehicle)
    return vehicle


async def analyze_damage_photos(
    db: AsyncSession, data: DamageAnalysisRequest
) -> InspectionAnalysisResponse:
    inspection_id = f"ai-insp-{uuid.uuid4().hex[:6]}"
    scenario = (data.scenario or "Clean").lower()

    findings: List[DamageFindingSchema] = []
    total_cost = 0.0

    if "minor" in scenario:
        findings.append(
            DamageFindingSchema(
                id="fnd-01",
                category="Rear",
                damage_type="Scratch",
                severity="Minor",
                location="Lower Rear Bumper Diffuser",
                confidence=0.94,
                estimated_repair_cost=85.0,
                evidence_image_url="https://images.unsplash.com/photo-1549399542-7e3f8b79c341?q=80&w=800",
                notes="Light surface clear-coat scratch (length ~12cm). Buffing compound recommended.",
            )
        )
        total_cost = 85.0
        overall = "Needs Minor Repair"
    elif "moderate" in scenario:
        findings.append(
            DamageFindingSchema(
                id="fnd-02",
                category="Left",
                damage_type="Dent",
                severity="Moderate",
                location="Driver Side Door Panel",
                confidence=0.91,
                estimated_repair_cost=220.0,
                evidence_image_url="https://images.unsplash.com/photo-1583121274602-3e2820c69888?q=80&w=800",
                notes="Paintless Dent Repair (PDR) required. Depth ~1.5cm, no structural frame compromise.",
            )
        )
        total_cost = 220.0
        overall = "Requires Provider Attention"
    elif "severe" in scenario:
        findings.append(
            DamageFindingSchema(
                id="fnd-03",
                category="Front",
                damage_type="Dent",
                severity="Severe",
                location="Front Bumper & Headlight Assembly",
                confidence=0.97,
                estimated_repair_cost=580.0,
                evidence_image_url="https://images.unsplash.com/photo-1617788138017-80ad40651399?q=80&w=800",
                notes="Bumper crack and lens fracture. Replacement assembly required before next rental.",
            )
        )
        total_cost = 580.0
        overall = "Requires Provider Attention"
    else:
        overall = "Passed - No Damage"

    return InspectionAnalysisResponse(
        inspection_id=inspection_id,
        vehicle_id=data.vehicle_id,
        booking_id=data.booking_id,
        analyzed_at=datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S UTC"),
        findings=findings,
        total_estimated_cost=total_cost,
        overall_condition=overall,
        disclaimer="AI Computer Vision inspection provided for rapid assessment. Official liability settlements subject to manual provider verification.",
    )


async def recommend_vehicles(
    db: AsyncSession, data: AIRecommendationRequest
) -> List[Vehicle]:
    query = select(Vehicle).where(
        and_(Vehicle.availability != "Archived", Vehicle.is_published == True)
    )

    if data.body_type and data.body_type != "All":
        query = query.where(Vehicle.category.ilike(f"%{data.body_type}%"))
    if data.fuel_type and data.fuel_type != "All":
        query = query.where(Vehicle.fuel.ilike(f"%{data.fuel_type}%"))
    if data.seats and data.seats > 0:
        query = query.where(Vehicle.seats >= data.seats)
    if data.max_price and data.max_price > 0:
        query = query.where(Vehicle.price_per_day <= data.max_price)

    query = query.order_by(Vehicle.rating.desc(), Vehicle.price_per_day.asc()).limit(data.top_n)
    result = await db.execute(query)
    return list(result.scalars().all())
