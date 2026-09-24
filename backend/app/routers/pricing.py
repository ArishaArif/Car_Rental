"""
Smart Pricing router — dynamic demand surge calculation, fleet yield metrics, and pricing recommendations.
"""

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional, List
import uuid

from app.database import get_db
from app.models.user import User
from app.schemas.ai import (
    VehiclePricingMetricsResponse,
    ApplyRecommendationRequest,
)
from app.schemas.vehicle import VehicleResponse
from app.services import ai_service
from app.utils.dependencies import get_current_user

router = APIRouter(prefix="/pricing", tags=["Smart Pricing"])


@router.get(
    "/metrics",
    response_model=List[VehiclePricingMetricsResponse],
    summary="Get Fleet-wide Smart Pricing Metrics",
    description="Calculate dynamic demand surge, weekend factor, seasonal index, and suggested price adjustments across the fleet.",
)
async def get_all_metrics(
    provider_id: Optional[uuid.UUID] = Query(None, description="Optional provider filter"),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await ai_service.get_all_fleet_pricing_metrics(db, provider_id=provider_id)


@router.get(
    "/metrics/{vehicle_id}",
    response_model=VehiclePricingMetricsResponse,
    summary="Get Vehicle Dynamic Pricing Evaluation",
    description="Evaluate real-time pricing signals, demand multiplier, and rate recommendation for a specific vehicle.",
)
async def get_vehicle_metrics(
    vehicle_id: str,
    db: AsyncSession = Depends(get_db),
):
    return await ai_service.get_vehicle_pricing_metrics(db, vehicle_id)


@router.post(
    "/apply-recommendation",
    response_model=VehicleResponse,
    summary="Accept Smart Pricing Recommendation",
    description="Apply the AI recommended daily rate to the vehicle listing.",
)
async def apply_recommendation(
    data: ApplyRecommendationRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await ai_service.apply_pricing_recommendation(db, data.vehicle_id, data.new_price, current_user)
