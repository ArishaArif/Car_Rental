"""SQLAlchemy models for Fleet Operations: Maintenance, Inspections, Damage Reports, and Tasks."""

import uuid
from datetime import datetime, timezone
from sqlalchemy import String, Boolean, DateTime, Float, Integer, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID

from app.database import Base


class MaintenanceRecord(Base):
    __tablename__ = "fleet_maintenance"

    id: Mapped[str] = mapped_column(
        String(50), primary_key=True, default=lambda: f"maint-{uuid.uuid4().hex[:6]}"
    )
    vehicle_id: Mapped[str] = mapped_column(
        String(50), ForeignKey("vehicles.id", ondelete="CASCADE"), nullable=False, index=True
    )
    vehicle_name: Mapped[str] = mapped_column(String(120), nullable=False)
    vehicle_plate: Mapped[str] = mapped_column(String(50), default="FLT-001", nullable=False)
    type: Mapped[str] = mapped_column(String(60), default="Oil Change", nullable=False)
    due_date: Mapped[str] = mapped_column(String(30), nullable=False)
    completed_date: Mapped[str | None] = mapped_column(String(30), nullable=True)
    status: Mapped[str] = mapped_column(String(40), default="Scheduled", nullable=False, index=True)
    estimated_cost: Mapped[float] = mapped_column(Float, default=100.0, nullable=False)
    actual_cost: Mapped[float | None] = mapped_column(Float, nullable=True)
    service_center: Mapped[str] = mapped_column(String(150), default="Fleet Tech Hub", nullable=False)
    notes: Mapped[str | None] = mapped_column(String(1000), nullable=True)
    odometer_at_service: Mapped[int | None] = mapped_column(Integer, nullable=True)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False,
    )


class FleetInspection(Base):
    __tablename__ = "fleet_inspections"

    id: Mapped[str] = mapped_column(
        String(50), primary_key=True, default=lambda: f"insp-{uuid.uuid4().hex[:6]}"
    )
    vehicle_id: Mapped[str] = mapped_column(
        String(50), ForeignKey("vehicles.id", ondelete="CASCADE"), nullable=False, index=True
    )
    vehicle_name: Mapped[str] = mapped_column(String(120), nullable=False)
    booking_id: Mapped[str | None] = mapped_column(String(50), nullable=True, index=True)
    inspector_name: Mapped[str] = mapped_column(String(100), default="Marcus Chen", nullable=False)
    date: Mapped[str] = mapped_column(String(30), nullable=False)
    status: Mapped[str] = mapped_column(String(40), default="Completed", nullable=False)
    type: Mapped[str] = mapped_column(String(50), default="Routine", nullable=False)
    exterior_condition: Mapped[str] = mapped_column(String(50), default="Good", nullable=False)
    interior_condition: Mapped[str] = mapped_column(String(50), default="Clean", nullable=False)
    tires_and_brakes: Mapped[str] = mapped_column(String(50), default="Good", nullable=False)
    fuel_level: Mapped[int] = mapped_column(Integer, default=100, nullable=False)
    odometer_reading: Mapped[int] = mapped_column(Integer, default=15000, nullable=False)
    passed: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    notes: Mapped[str | None] = mapped_column(String(1000), nullable=True)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False
    )


class DamageReport(Base):
    __tablename__ = "fleet_damage_reports"

    id: Mapped[str] = mapped_column(
        String(50), primary_key=True, default=lambda: f"dmg-{uuid.uuid4().hex[:6]}"
    )
    vehicle_id: Mapped[str] = mapped_column(
        String(50), ForeignKey("vehicles.id", ondelete="CASCADE"), nullable=False, index=True
    )
    vehicle_name: Mapped[str] = mapped_column(String(120), nullable=False)
    booking_id: Mapped[str | None] = mapped_column(String(50), nullable=True, index=True)
    customer_name: Mapped[str] = mapped_column(String(100), default="Customer", nullable=False)
    damage_status: Mapped[str] = mapped_column(String(60), default="Minor Scratches", nullable=False)
    description: Mapped[str] = mapped_column(String(1500), nullable=False)
    estimated_charge: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    review_status: Mapped[str] = mapped_column(String(50), default="Pending Review", nullable=False, index=True)
    photo_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    resolved_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    reported_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False
    )


class FleetTask(Base):
    __tablename__ = "fleet_tasks"

    id: Mapped[str] = mapped_column(
        String(50), primary_key=True, default=lambda: f"task-{uuid.uuid4().hex[:6]}"
    )
    title: Mapped[str] = mapped_column(String(150), nullable=False)
    description: Mapped[str] = mapped_column(String(1000), nullable=False)
    vehicle_id: Mapped[str | None] = mapped_column(String(50), nullable=True)
    vehicle_name: Mapped[str | None] = mapped_column(String(120), nullable=True)
    priority: Mapped[str] = mapped_column(String(30), default="Medium", nullable=False)
    due_time: Mapped[str] = mapped_column(String(40), default="Today, 5:00 PM", nullable=False)
    status: Mapped[str] = mapped_column(String(30), default="Pending", nullable=False, index=True)
    category: Mapped[str] = mapped_column(String(50), default="Preparation", nullable=False)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False
    )
