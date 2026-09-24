"""SQLAlchemy models for Admin Domain: Verifications, Payments, Disputes, and System Config."""

import uuid
from datetime import datetime, timezone
from sqlalchemy import String, Boolean, DateTime, Float, Integer, ForeignKey, JSON
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.dialects.postgresql import UUID

from app.database import Base


class VerificationItem(Base):
    __tablename__ = "admin_verifications"

    id: Mapped[str] = mapped_column(
        String(50), primary_key=True, default=lambda: f"ver-{uuid.uuid4().hex[:6]}"
    )
    target_id: Mapped[str] = mapped_column(String(50), nullable=False, index=True)
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    type: Mapped[str] = mapped_column(String(30), default="Customer", nullable=False)
    identifier: Mapped[str] = mapped_column(String(100), nullable=False)
    submitted_date: Mapped[str] = mapped_column(String(30), nullable=False)
    status: Mapped[str] = mapped_column(String(30), default="Pending", nullable=False, index=True)
    document_type: Mapped[str] = mapped_column(String(80), default="Driver's License", nullable=False)
    document_number: Mapped[str] = mapped_column(String(80), nullable=False)
    expiry_date: Mapped[str | None] = mapped_column(String(50), nullable=True)
    document_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    notes: Mapped[str | None] = mapped_column(String(1000), nullable=True)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False
    )


class PaymentRecord(Base):
    __tablename__ = "admin_payments"

    id: Mapped[str] = mapped_column(
        String(50), primary_key=True, default=lambda: f"pmt-{uuid.uuid4().hex[:6]}"
    )
    booking_id: Mapped[str] = mapped_column(String(50), nullable=False, index=True)
    customer_name: Mapped[str] = mapped_column(String(100), nullable=False)
    provider_name: Mapped[str] = mapped_column(String(100), nullable=False)
    vehicle_name: Mapped[str] = mapped_column(String(120), nullable=False)
    rental_amount: Mapped[float] = mapped_column(Float, nullable=False)
    platform_commission: Mapped[float] = mapped_column(Float, nullable=False)
    provider_payout: Mapped[float] = mapped_column(Float, nullable=False)
    security_deposit: Mapped[float] = mapped_column(Float, default=150.0, nullable=False)
    refund_status: Mapped[str] = mapped_column(String(50), default="No Refund Required", nullable=False)
    payout_status: Mapped[str] = mapped_column(String(30), default="Paid", nullable=False)
    transaction_date: Mapped[str] = mapped_column(String(30), nullable=False)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False
    )


class DisputeRecord(Base):
    __tablename__ = "admin_disputes"

    id: Mapped[str] = mapped_column(
        String(50), primary_key=True, default=lambda: f"dsp-{uuid.uuid4().hex[:6]}"
    )
    booking_id: Mapped[str] = mapped_column(String(50), nullable=False, index=True)
    customer_name: Mapped[str] = mapped_column(String(100), nullable=False)
    provider_name: Mapped[str] = mapped_column(String(100), nullable=False)
    vehicle_name: Mapped[str] = mapped_column(String(120), nullable=False)
    disputed_amount: Mapped[float] = mapped_column(Float, nullable=False)
    reason: Mapped[str] = mapped_column(String(1000), nullable=False)
    status: Mapped[str] = mapped_column(String(40), default="Open", nullable=False, index=True)
    reported_at: Mapped[str] = mapped_column(String(30), nullable=False)
    evidence: Mapped[str | None] = mapped_column(String(500), nullable=True)
    admin_notes: Mapped[str | None] = mapped_column(String(1000), nullable=True)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False
    )


class SystemConfigRecord(Base):
    __tablename__ = "system_configurations"

    id: Mapped[str] = mapped_column(String(50), primary_key=True, default="default")
    commission_rate: Mapped[float] = mapped_column(Float, default=10.0, nullable=False)
    vehicle_categories: Mapped[list[dict]] = mapped_column(JSON, default=list, nullable=False)
    regions: Mapped[list[dict]] = mapped_column(JSON, default=list, nullable=False)
    pricing_baseline: Mapped[dict] = mapped_column(JSON, default=dict, nullable=False)

    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False,
    )
