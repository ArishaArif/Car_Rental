"""SQLAlchemy User model."""

import uuid
from datetime import datetime, timezone
from sqlalchemy import String, Boolean, DateTime, Enum as SAEnum, JSON, Uuid
from sqlalchemy.orm import Mapped, mapped_column
import enum

from app.database import Base


class AuthProvider(str, enum.Enum):
    EMAIL = "email"
    GOOGLE = "google"


class UserRole(str, enum.Enum):
    CUSTOMER = "Customer"
    PROVIDER = "Provider"
    FLEET_MANAGER = "FleetManager"
    ADMIN = "Admin"
    # Legacy aliases
    USER = "Customer"


class VerificationStatus(str, enum.Enum):
    PENDING = "Pending"
    VERIFIED = "Verified"
    REJECTED = "Rejected"
    SUSPENDED = "Suspended"


class User(Base):
    __tablename__ = "users"

    id: Mapped[uuid.UUID] = mapped_column(
        Uuid, primary_key=True, default=uuid.uuid4
    )
    full_name: Mapped[str] = mapped_column(String(100), nullable=False)

    email: Mapped[str] = mapped_column(String(255), unique=True, nullable=False, index=True)
    hashed_password: Mapped[str | None] = mapped_column(String(255), nullable=True)

    # Auth provider
    auth_provider: Mapped[AuthProvider] = mapped_column(
        SAEnum(AuthProvider, name="auth_provider_enum"), default=AuthProvider.EMAIL, nullable=False
    )
    google_id: Mapped[str | None] = mapped_column(String(255), nullable=True, unique=True)

    # Role & Profile
    role: Mapped[UserRole] = mapped_column(
        SAEnum(UserRole, name="user_role_enum"), default=UserRole.CUSTOMER, nullable=False
    )
    profile_picture: Mapped[str | None] = mapped_column(String(500), nullable=True)
    phone_number: Mapped[str | None] = mapped_column(String(30), nullable=True)
    city: Mapped[str | None] = mapped_column(String(100), nullable=True)

    # Role-specific fields
    license_number: Mapped[str | None] = mapped_column(String(50), nullable=True)
    license_expiry: Mapped[str | None] = mapped_column(String(50), nullable=True)
    business_name: Mapped[str | None] = mapped_column(String(150), nullable=True)
    fleet_size: Mapped[str | None] = mapped_column(String(50), nullable=True)
    department: Mapped[str | None] = mapped_column(String(100), nullable=True)

    # Verification & Preferences
    verification_status: Mapped[VerificationStatus] = mapped_column(
        SAEnum(VerificationStatus, name="verification_status_enum"),
        default=VerificationStatus.PENDING,
        nullable=False,
    )
    preferences: Mapped[dict | None] = mapped_column(JSON, nullable=True, default=dict)

    # Status flags
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    is_email_verified: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    is_profile_complete: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)

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
    last_login: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    def __repr__(self) -> str:
        return f"<User id={self.id} email={self.email} role={self.role}>"

