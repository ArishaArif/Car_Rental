"""SQLAlchemy models for Provider SaaS Subscriptions and Billing History."""

import uuid
from datetime import datetime, timezone
from sqlalchemy import String, Float, Integer, ForeignKey, JSON, DateTime
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID

from app.database import Base


class ProviderSubscription(Base):
    __tablename__ = "provider_subscriptions"

    id: Mapped[str] = mapped_column(
        String(50), primary_key=True, default=lambda: f"sub-{uuid.uuid4().hex[:8]}"
    )
    provider_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, unique=True, index=True
    )
    plan_id: Mapped[str] = mapped_column(String(50), default="starter", nullable=False)
    status: Mapped[str] = mapped_column(String(30), default="Active", nullable=False)
    billing_cycle: Mapped[str] = mapped_column(String(20), default="monthly", nullable=False)
    start_date: Mapped[str] = mapped_column(String(30), nullable=False)
    renewal_date: Mapped[str] = mapped_column(String(30), nullable=False)
    usage: Mapped[dict] = mapped_column(JSON, default=dict, nullable=False)
    enabled_features: Mapped[list[str]] = mapped_column(JSON, default=list, nullable=False)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False,
    )


class BillingInvoiceRecord(Base):
    __tablename__ = "provider_billing_invoices"

    id: Mapped[str] = mapped_column(
        String(50), primary_key=True, default=lambda: f"inv-sub-{uuid.uuid4().hex[:8]}"
    )
    invoice_number: Mapped[str] = mapped_column(String(50), unique=True, nullable=False, index=True)
    provider_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    date: Mapped[str] = mapped_column(String(30), nullable=False)
    amount: Mapped[float] = mapped_column(Float, nullable=False)
    plan_name: Mapped[str] = mapped_column(String(60), nullable=False)
    billing_cycle: Mapped[str] = mapped_column(String(20), default="monthly", nullable=False)
    status: Mapped[str] = mapped_column(String(30), default="Paid", nullable=False)
    payment_method: Mapped[str] = mapped_column(String(50), default="Visa ending 4242", nullable=False)
    pdf_url: Mapped[str | None] = mapped_column(String(500), nullable=True)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False
    )
