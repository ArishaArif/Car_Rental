import secrets
import uuid
from datetime import datetime, timedelta, timezone
from typing import Union

from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update

from app.models.otp import OTP, OTPPurpose
from app.config import settings


def _generate_otp(length: int = 6) -> str:
    """Generate a cryptographically secure numeric OTP."""
    return "".join([str(secrets.randbelow(10)) for _ in range(length)])


def _to_uuid(val: Union[str, uuid.UUID]) -> uuid.UUID:
    return uuid.UUID(str(val)) if not isinstance(val, uuid.UUID) else val


async def create_otp(
    db: AsyncSession,
    user_id: Union[str, uuid.UUID],
    purpose: OTPPurpose,
) -> str:
    """
    Invalidate any existing OTPs for this user+purpose,
    create a new OTP, persist it, and return the code.
    """
    uid = _to_uuid(user_id)
    # Invalidate all existing unused OTPs for this user/purpose
    await db.execute(
        update(OTP)
        .where(OTP.user_id == uid, OTP.purpose == purpose, OTP.is_used == False)  # noqa: E712
        .values(is_used=True)
    )

    code = _generate_otp(settings.OTP_LENGTH)
    expires_at = datetime.now(timezone.utc) + timedelta(minutes=settings.OTP_EXPIRE_MINUTES)

    otp = OTP(
        user_id=uid,
        code=code,
        purpose=purpose,
        is_used=False,
        expires_at=expires_at,
    )
    db.add(otp)
    await db.flush()  # persist without committing (session handles commit)

    return code


async def verify_otp(
    db: AsyncSession,
    user_id: Union[str, uuid.UUID],
    code: str,
    purpose: OTPPurpose,
) -> bool:
    """
    Verify an OTP code for the given user and purpose.

    Raises:
        HTTPException 400 — if OTP is invalid, expired, or already used
    """
    uid = _to_uuid(user_id)
    result = await db.execute(
        select(OTP).where(
            OTP.user_id == uid,
            OTP.code == code,
            OTP.purpose == purpose,
            OTP.is_used == False,  # noqa: E712
        )
    )

    otp = result.scalar_one_or_none()

    if not otp:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid OTP code",
        )

    expires_at = (
        otp.expires_at.replace(tzinfo=timezone.utc)
        if otp.expires_at.tzinfo is None
        else otp.expires_at
    )
    if expires_at < datetime.now(timezone.utc):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="OTP has expired. Please request a new one.",
        )

    # Mark OTP as used
    otp.is_used = True
    await db.flush()


    return True
