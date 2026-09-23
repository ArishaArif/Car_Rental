"""
AI router — Computer vision damage inspection, guided photo templates, and personalized vehicle recommendations.
"""

from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Dict, List

from app.database import get_db
from app.schemas.ai import (
    DamageAnalysisRequest,
    InspectionAnalysisResponse,
    PhotoTemplateItem,
    AIRecommendationRequest,
)
from app.schemas.vehicle import VehicleResponse
from app.services import ai_service

router = APIRouter(prefix="/ai", tags=["AI & Computer Vision"])


@router.get(
    "/photo-templates",
    response_model=Dict[str, PhotoTemplateItem],
    summary="Get 6-Point Photo Capture Templates",
    description="Returns instructions, bounding guide hints, and sample photos for Front, Rear, Left, Right, Interior, and Dashboard.",
)
async def get_photo_templates():
    return ai_service.get_photo_templates()


@router.post(
    "/damage-analysis",
    response_model=InspectionAnalysisResponse,
    summary="Analyze Multi-Photo Vehicle Damage",
    description="Run deep inspection across submitted angles to detect body scratches, dents, glass cracks, and estimate repair fees.",
)
async def analyze_damage(
    data: DamageAnalysisRequest,
    db: AsyncSession = Depends(get_db),
):
    return await ai_service.analyze_damage_photos(db, data)


@router.post(
    "/recommend",
    response_model=List[VehicleResponse],
    summary="Recommend Vehicles",
    description="AI recommendation matching customer preferences (seats, category, budget, fuel).",
)
async def recommend_vehicles(
    data: AIRecommendationRequest,
    db: AsyncSession = Depends(get_db),
):
    return await ai_service.recommend_vehicles(db, data)
