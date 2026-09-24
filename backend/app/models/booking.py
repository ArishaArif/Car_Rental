"""SQLAlchemy Booking and Invoice models."""

import uuid
from datetime import datetime, timezone
from sqlalchemy import String, DateTime, Float, Integer, ForeignKey, JSON, Uuid
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class Booking(Base):
    __tablename__ = "bookings"

    id: Mapped[str] = mapped_column(
        String(50), primary_key=True, default=lambda: f"VLX-BK-{uuid.uuid4().hex[:6].upper()}"
    )
    vehicle_id: Mapped[str] = mapped_column(
        String(50), ForeignKey("vehicles.id", ondelete="RESTRICT"), nullable=False, index=True
    )
    customer_id: Mapped[uuid.UUID] = mapped_column(
        Uuid, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )


    # Rental Schedule & Route
    pickup_date: Mapped[str] = mapped_column(String(30), nullable=False)
    pickup_time: Mapped[str] = mapped_column(String(30), default="10:00 AM", nullable=False)
    return_date: Mapped[str] = mapped_column(String(30), nullable=False)
    return_time: Mapped[str] = mapped_column(String(30), default="10:00 AM", nullable=False)
    rental_days: Mapped[int] = mapped_column(Integer, nullable=False, default=1)
    pickup_location: Mapped[str] = mapped_column(String(200), nullable=False)
    return_location: Mapped[str] = mapped_column(String(200), nullable=False)

    # Financial & Contact
    pricing: Mapped[dict] = mapped_column(JSON, nullable=False)
    customer_details: Mapped[dict] = mapped_column(JSON, nullable=False)
    payment_method: Mapped[str] = mapped_column(String(30), default="Card", nullable=False)
    payment_status: Mapped[str] = mapped_column(String(30), default="Paid", nullable=False)
    status: Mapped[str] = mapped_column(String(30), default="Pending", nullable=False, index=True)

    # Operational Check-in / Turnaround
    pickup_code: Mapped[str] = mapped_column(String(10), nullable=False)
    pickup_mileage: Mapped[int | None] = mapped_column(Integer, nullable=True)
    dropoff_mileage: Mapped[int | None] = mapped_column(Integer, nullable=True)
    dropoff_fuel: Mapped[int | None] = mapped_column(Integer, nullable=True)

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

    # Relationships
    vehicle = relationship("Vehicle", lazy="joined")
    customer = relationship("User", foreign_keys=[customer_id], lazy="joined")
    invoice = relationship("BookingInvoice", back_populates="booking", uselist=False, lazy="joined")

    def __repr__(self) -> str:
        return f"<Booking id={self.id} vehicle={self.vehicle_id} status={self.status}>"


class BookingInvoice(Base):
    __tablename__ = "booking_invoices"

    id: Mapped[str] = mapped_column(
        String(50), primary_key=True, default=lambda: f"INV-{uuid.uuid4().hex[:8].upper()}"
    )
    invoice_number: Mapped[str] = mapped_column(String(50), unique=True, nullable=False, index=True)
    booking_id: Mapped[str] = mapped_column(
        String(50), ForeignKey("bookings.id", ondelete="CASCADE"), nullable=False, unique=True, index=True
    )

    # Invoice Breakdown
    base_rental: Mapped[float] = mapped_column(Float, nullable=False)
    service_fee: Mapped[float] = mapped_column(Float, nullable=False)
    taxes: Mapped[float] = mapped_column(Float, nullable=False)
    security_deposit: Mapped[float] = mapped_column(Float, nullable=False)
    late_charges: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    damage_charges: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    deposit_refund: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    final_amount: Mapped[float] = mapped_column(Float, nullable=False)

    payment_method: Mapped[str] = mapped_column(String(30), default="Card", nullable=False)
    payment_status: Mapped[str] = mapped_column(String(30), default="Paid", nullable=False)

    issued_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False
    )

    booking = relationship("Booking", back_populates="invoice")

    def __repr__(self) -> str:
        return f"<BookingInvoice invoice_number={self.invoice_number} final_amount={self.final_amount}>"
