"""
Admin router — System health KPIs, verification requests, disputes, payment audits, and platform configuration.
"""

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional, List
import uuid

from app.database import get_db
from app.models.user import User
from app.schemas.admin import (
    AdminKPIsResponse,
    AdminUserRecordResponse,
    AdminProviderRecordResponse,
    VerificationItemResponse,
    VerificationReviewRequest,
    AdminPaymentRecordResponse,
    DisputeRecordResponse,
    DisputeUpdateRequest,
    SystemConfigSchema,
)
from app.services import admin_service
from app.utils.dependencies import get_current_admin, get_current_user

router = APIRouter(prefix="/admin", tags=["System Admin"])


@router.get(
    "/kpis",
    response_model=AdminKPIsResponse,
    summary="Get System KPIs",
    description="Platform wide statistics: total customers, providers, active rentals, total revenue, pending verifications, and open disputes.",
)
async def get_kpis(
    current_admin: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
):
    return await admin_service.get_system_kpis(db)


@router.get(
    "/users",
    response_model=List[AdminUserRecordResponse],
    summary="List All Users (Directory)",
    description="Retrieve all registered users with role, verification status, and activity state.",
)
async def list_users(
    current_admin: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
):
    return await admin_service.get_all_users_directory(db)


@router.patch(
    "/users/{user_id}/status",
    summary="Update User Active / Suspended State",
    description="Suspend or activate a user account.",
)
async def update_user_status(
    user_id: uuid.UUID,
    is_active: bool = Query(..., description="True for active, False to suspend"),
    current_admin: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
):
    return await admin_service.update_user_active_status(db, user_id, is_active)


@router.get(
    "/providers",
    response_model=List[AdminProviderRecordResponse],
    summary="List All Providers",
    description="Directory of host providers with fleet sizes, verification status, and revenue.",
)
async def list_providers(
    current_admin: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
):
    return await admin_service.get_all_providers_directory(db)


@router.get(
    "/verifications",
    response_model=List[VerificationItemResponse],
    summary="List Document Verification Queue",
    description="Queue of pending, verified, or rejected driver's licenses and business registrations.",
)
async def list_verifications(
    status: Optional[str] = Query(None, description="Filter: Pending, Verified, Rejected"),
    current_admin: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
):
    return await admin_service.get_all_verifications(db, status_filter=status)


@router.post(
    "/verifications/{item_id}/review",
    response_model=VerificationItemResponse,
    summary="Review Verification Document",
    description="Approve, reject, or suspend a user/provider document verification.",
)
async def review_verification(
    item_id: str,
    data: VerificationReviewRequest,
    current_admin: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
):
    return await admin_service.review_verification(db, item_id, data)


@router.get(
    "/payments",
    response_model=List[AdminPaymentRecordResponse],
    summary="List Financial Transactions & Payouts",
    description="Audit log of rental amounts, commission splits, security deposits, and provider payout statuses.",
)
async def list_payments(
    current_admin: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
):
    return await admin_service.get_all_payments(db)


@router.get(
    "/disputes",
    response_model=List[DisputeRecordResponse],
    summary="List Rental Disputes",
    description="Customer and provider dispute claims over charges or vehicle damage.",
)
async def list_disputes(
    status: Optional[str] = Query(None, description="Status filter: Open, Under Review, Resolved"),
    current_admin: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
):
    return await admin_service.get_all_disputes(db, status_filter=status)


@router.patch(
    "/disputes/{dispute_id}",
    response_model=DisputeRecordResponse,
    summary="Update Dispute Resolution",
    description="Resolve or update investigation notes for a dispute.",
)
async def update_dispute(
    dispute_id: str,
    data: DisputeUpdateRequest,
    current_admin: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
):
    return await admin_service.update_dispute(db, dispute_id, data)


@router.get(
    "/config",
    response_model=SystemConfigSchema,
    summary="Get System Configuration",
    description="Retrieve commission rate, vehicle categories, enabled regions, and baseline pricing settings.",
)
async def get_config(
    current_admin: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
):
    cfg = await admin_service.get_or_create_system_config(db)
    return SystemConfigSchema(
        commission_rate=cfg.commission_rate,
        vehicle_categories=cfg.vehicle_categories,
        regions=cfg.regions,
        pricing_baseline=cfg.pricing_baseline,
    )


@router.patch(
    "/config",
    response_model=SystemConfigSchema,
    summary="Update System Configuration",
    description="Modify platform commission %, categories, regions, or rate baselines.",
)
async def update_config(
    data: SystemConfigSchema,
    current_admin: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
):
    cfg = await admin_service.update_system_config(db, data)
    return SystemConfigSchema(
        commission_rate=cfg.commission_rate,
        vehicle_categories=cfg.vehicle_categories,
        regions=cfg.regions,
        pricing_baseline=cfg.pricing_baseline,
    )
