"""
Subscriptions router — SaaS subscription plans, usage telemetry, tier upgrades, and billing history.
"""

from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List

from app.database import get_db
from app.models.user import User
from app.schemas.subscription import (
    SubscriptionPlanResponse,
    ProviderSubscriptionResponse,
    UpgradeSubscriptionRequest,
    BillingInvoiceRecordResponse,
)
from app.services import subscription_service
from app.utils.dependencies import get_current_user

router = APIRouter(prefix="/subscriptions", tags=["Provider Subscriptions"])


@router.get(
    "/plans",
    response_model=List[SubscriptionPlanResponse],
    summary="List SaaS Subscription Plans",
    description="Returns Starter, Professional, and Business fleet management subscription plans with pricing and features.",
)
async def list_plans():
    return subscription_service.get_all_plans()


@router.get(
    "/current",
    response_model=ProviderSubscriptionResponse,
    summary="Get Current Subscription & Usage",
    description="Retrieve the active subscription status, renewal date, and vehicle/booking quota usage for authenticated provider.",
)
async def get_current_subscription(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await subscription_service.get_or_create_provider_subscription(db, current_user)


@router.post(
    "/upgrade",
    response_model=ProviderSubscriptionResponse,
    summary="Upgrade / Change Subscription Tier",
    description="Switch subscription tier (Starter, Professional, Business) and billing cycle (Monthly / Annual).",
)
async def upgrade_subscription(
    data: UpgradeSubscriptionRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await subscription_service.upgrade_provider_subscription(db, data, current_user)


@router.get(
    "/invoices",
    response_model=List[BillingInvoiceRecordResponse],
    summary="List Billing Invoices",
    description="Retrieve SaaS subscription billing invoice receipts and payment statuses.",
)
async def list_invoices(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await subscription_service.get_provider_invoices(db, current_user)
