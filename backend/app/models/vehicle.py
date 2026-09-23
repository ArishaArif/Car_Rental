"""SQLAlchemy Vehicle and Category models."""

import uuid
from datetime import datetime, timezone
from sqlalchemy import String, Boolean, DateTime, Float, Integer, ForeignKey, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID

from app.database import Base


class Vehicle(Base):
    __tablename__ = "vehicles"

    id: Mapped[str] = mapped_column(
        String(50), primary_key=True, default=lambda: f"veh-{uuid.uuid4().hex[:8]}"
    )
    provider_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True
    )
    brand: Mapped[str] = mapped_column(String(80), nullable=False, index=True)
    model: Mapped[str] = mapped_column(String(80), nullable=False, index=True)
    year: Mapped[int] = mapped_column(Integer, nullable=False)
    category: Mapped[str] = mapped_column(String(50), nullable=False, index=True, default="Sedan")
    
    # Media
    image: Mapped[str] = mapped_column(String(500), nullable=False)
    images: Mapped[list[str]] = mapped_column(JSON, default=list, nullable=False)

    # Pricing
    price_per_day: Mapped[float] = mapped_column(Float, nullable=False)
    weekly_price: Mapped[float | None] = mapped_column(Float, nullable=True)
    security_deposit: Mapped[float] = mapped_column(Float, default=150.0, nullable=False)

    # Specs & Characteristics
    rating: Mapped[float] = mapped_column(Float, default=5.0, nullable=False)
    seats: Mapped[int] = mapped_column(Integer, default=5, nullable=False)
    doors: Mapped[int] = mapped_column(Integer, default=4, nullable=False)
    transmission: Mapped[str] = mapped_column(String(30), default="Automatic", nullable=False)
    fuel: Mapped[str] = mapped_column(String(30), default="Petrol", nullable=False)
    location: Mapped[str] = mapped_column(String(200), default="Downtown Hub", nullable=False)
    mileage: Mapped[int] = mapped_column(Integer, default=12000, nullable=False)
    
    # Status & Operations
    availability: Mapped[str] = mapped_column(
        String(50), default="Available", nullable=False, index=True
    )
    features: Mapped[list[str]] = mapped_column(JSON, default=list, nullable=False)
    description: Mapped[str] = mapped_column(String(2000), default="", nullable=False)
    is_published: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False, index=True)

    # Timestamps
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    def __repr__(self) -> str:
        return f"<Vehicle id={self.id} {self.brand} {self.model} ({self.availability})>"
