"""
Subscription service — provider SaaS subscription tiers, plan upgrades, quota tracking, and billing invoices.
"""

from typing import Optional, List
from datetime import datetime, timezone, timedelta
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from fastapi import HTTPException, status

from app.models.subscription import ProviderSubscription, BillingInvoiceRecord
from app.models.user import User, UserRole
from app.schemas.subscription import (
    SubscriptionPlanResponse,
    UpgradeSubscriptionRequest,
)

STATIC_PLANS = [
    SubscriptionPlanResponse(
        id="starter",
        name="Starter",
        tagline="For emerging hosts & small local operators",
        monthly_price=49.0,
        annual_price=470.0,
        vehicle_limit=5,
        booking_limit=30,
        ai_assistant_access="Basic Customer Q&A",
        smart_pricing_access="Manual Rule-based only",
        analytics="Standard Monthly Revenue & Trips",
        team_members=1,
        support="Standard Email (48h SLA)",
        features=[
            "Up to 5 fleet vehicles",
            "30 monthly reservations",
            "Basic Customer AI Q&A",
            "Standard revenue reports",
            "Digital key & contactless check-in",
            "Standard Email Support (48h SLA)",
        ],
    ),
    SubscriptionPlanResponse(
        id="professional",
        name="Professional",
        tagline="For scaling fleets & independent rental services",
        monthly_price=149.0,
        annual_price=1430.0,
        vehicle_limit=25,
        booking_limit=150,
        ai_assistant_access="Full AI Voice & Damage Inspection",
        smart_pricing_access="Automated Demand Surge & Dynamic Yield",
        analytics="Live Fleet Telematics & Utilization Analysis",
        team_members=5,
        support="Priority In-App & Email (4h SLA)",
        features=[
            "Up to 25 fleet vehicles",
            "150 monthly reservations",
            "Automated Smart Dynamic Pricing",
            "AI Damage & Photo Inspection",
            "Advanced Telematics & Turnaround Desk",
            "5 Team Member Logins",
            "Priority In-App Support (4h SLA)",
            "Automated deposit escrow settlements",
        ],
    ),
    SubscriptionPlanResponse(
        id="business",
        name="Business",
        tagline="Enterprise-grade fleet operations & unlimited yield",
        monthly_price=349.0,
        annual_price=3350.0,
        vehicle_limit=-1,
        booking_limit=-1,
        ai_assistant_access="Enterprise Custom AI Telematics",
        smart_pricing_access="Multi-zone Algorithmic Yield Optimization",
        analytics="Executive Custom Reports, Raw CSV & Webhooks",
        team_members=-1,
        support="Dedicated 24/7 Account Manager & Direct Phone",
        features=[
            "Unlimited fleet inventory",
            "Unlimited monthly reservations",
            "Multi-zone Smart Yield Engine",
            "Enterprise AI telematics suite",
            "Unlimited team logins & permissions",
            "Dedicated 24/7 Account Manager",
            "Custom data export & accounting integrations",
            "Custom SLA & platform onboarding",
        ],
    ),
]


def get_all_plans() -> List[SubscriptionPlanResponse]:
    return STATIC_PLANS


async def get_or_create_provider_subscription(
    db: AsyncSession, user: User
) -> ProviderSubscription:
    result = await db.execute(
        select(ProviderSubscription).where(ProviderSubscription.provider_id == user.id)
    )
    sub = result.scalar_one_or_none()

    if not sub:
        plan = STATIC_PLANS[1] if user.role == UserRole.PROVIDER else STATIC_PLANS[0]
        start_date = datetime.now(timezone.utc).strftime("%Y-%m-%d")
        renewal_date = (datetime.now(timezone.utc) + timedelta(days=30)).strftime("%Y-%m-%d")

        sub = ProviderSubscription(
            provider_id=user.id,
            plan_id=plan.id,
            status="Active",
            billing_cycle="monthly",
            start_date=start_date,
            renewal_date=renewal_date,
            usage={
                "vehiclesUsed": 0,
                "vehicleLimit": plan.vehicle_limit,
                "bookingsUsed": 0,
                "bookingLimit": plan.booking_limit,
                "teamSeatsUsed": 1,
                "teamSeatsLimit": plan.team_members,
            },
            enabled_features=plan.features,
        )
        db.add(sub)
        await db.commit()
        await db.refresh(sub)

    return sub


async def upgrade_provider_subscription(
    db: AsyncSession, data: UpgradeSubscriptionRequest, user: User
) -> ProviderSubscription:
    plan = next((p for p in STATIC_PLANS if p.id == data.target_plan_id.lower()), None)
    if not plan:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Subscription plan '{data.target_plan_id}' not found",
        )

    sub = await get_or_create_provider_subscription(db, user)

    amount = plan.annual_price if data.billing_cycle == "annual" else plan.monthly_price
    days = 365 if data.billing_cycle == "annual" else 30

    sub.plan_id = plan.id
    sub.billing_cycle = data.billing_cycle
    sub.status = "Active"
    sub.renewal_date = (datetime.now(timezone.utc) + timedelta(days=days)).strftime("%Y-%m-%d")
    sub.enabled_features = plan.features
    sub.usage = {
        "vehiclesUsed": sub.usage.get("vehiclesUsed", 0),
        "vehicleLimit": plan.vehicle_limit,
        "bookingsUsed": sub.usage.get("bookingsUsed", 0),
        "bookingLimit": plan.booking_limit,
        "teamSeatsUsed": sub.usage.get("teamSeatsUsed", 1),
        "teamSeatsLimit": plan.team_members,
    }

    # Record Billing Invoice
    invoice = BillingInvoiceRecord(
        invoice_number=f"INV-SUB-{datetime.now(timezone.utc).strftime('%Y%m')}-{user.id.hex[:4].upper()}",
        provider_id=user.id,
        date=datetime.now(timezone.utc).strftime("%Y-%m-%d"),
        amount=amount,
        plan_name=f"{plan.name} Tier ({data.billing_cycle.title()})",
        billing_cycle=data.billing_cycle,
        status="Paid",
        payment_method=data.payment_method or "Visa ending 4242",
        pdf_url="https://carrental.app/invoices/sample.pdf",
    )
    db.add(invoice)

    await db.commit()
    await db.refresh(sub)
    return sub


async def get_provider_invoices(
    db: AsyncSession, user: User
) -> List[BillingInvoiceRecord]:
    result = await db.execute(
        select(BillingInvoiceRecord)
        .where(BillingInvoiceRecord.provider_id == user.id)
        .order_by(desc(BillingInvoiceRecord.created_at))
    )
    return list(result.scalars().all())
