"""
Tests for OTP generation, verification, resend, and password reset flows.
"""

import pytest
from httpx import AsyncClient
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.user import User, AuthProvider, UserRole
from app.models.otp import OTP, OTPPurpose
from app.utils.hashing import hash_password


@pytest.mark.asyncio
async def test_otp_verification_and_resend(client: AsyncClient, db_session: AsyncSession):
    """Test registering, fetching generated OTP from DB, verifying, and checking email verified flag."""
    email = "test_otp_user@carrental.com"

    # 1. Register
    reg_res = await client.post(
        "/api/v1/auth/register",
        json={
            "full_name": "OTP Verifier",
            "email": email,
            "password": "StrongPassword@123",
            "role": "Customer",
        },
    )
    assert reg_res.status_code == 201

    # 2. Query OTP from DB
    u_res = await db_session.execute(select(User).where(User.email == email))
    user = u_res.scalar_one()
    assert user.is_email_verified is False

    otp_res = await db_session.execute(
        select(OTP).where(OTP.user_id == user.id, OTP.purpose == OTPPurpose.EMAIL_VERIFICATION)
    )
    otp_record = otp_res.scalars().first()
    assert otp_record is not None
    code = otp_record.code

    # 3. Verify OTP
    verify_res = await client.post(
        "/api/v1/auth/verify-otp",
        json={"email": email, "otp_code": code, "purpose": "email_verification"},
    )
    assert verify_res.status_code == 200
    assert "verified" in verify_res.json()["message"]

    # 4. Check user is now verified
    await db_session.refresh(user)
    assert user.is_email_verified is True

    # 5. Login now succeeds
    login_res = await client.post(
        "/api/v1/auth/login",
        json={"email": email, "password": "StrongPassword@123"},
    )
    assert login_res.status_code == 200
    assert "access_token" in login_res.json()
    assert "refresh_token" in login_res.json()

    # 6. Test Token Refresh
    refresh_token = login_res.json()["refresh_token"]
    refresh_res = await client.post(
        "/api/v1/auth/refresh",
        json={"refresh_token": refresh_token},
    )
    assert refresh_res.status_code == 200
    assert "access_token" in refresh_res.json()

    # 7. Test Logout (Blacklist token)
    logout_res = await client.post(
        "/api/v1/auth/logout",
        json={"refresh_token": refresh_token},
    )
    assert logout_res.status_code == 200
    assert "Logged out" in logout_res.json()["message"]


@pytest.mark.asyncio
async def test_forgot_and_reset_password(client: AsyncClient, db_session: AsyncSession):
    """Test forgot password OTP dispatch and password reset."""
    email = "reset_test_user@carrental.com"

    # Create verified user
    user = User(
        full_name="Reset User",
        email=email,
        hashed_password=hash_password("OldPassword@123"),
        auth_provider=AuthProvider.EMAIL,
        role=UserRole.CUSTOMER,
        is_email_verified=True,
        is_profile_complete=True,
    )
    db_session.add(user)
    await db_session.commit()
    await db_session.refresh(user)

    # 1. Forgot password request
    forgot_res = await client.post(
        "/api/v1/auth/forgot-password",
        json={"email": email},
    )
    assert forgot_res.status_code == 200

    # 2. Get reset OTP code from DB
    otp_res = await db_session.execute(
        select(OTP).where(OTP.user_id == user.id, OTP.purpose == OTPPurpose.PASSWORD_RESET)
    )
    otp_record = otp_res.scalars().first()
    assert otp_record is not None
    code = otp_record.code

    # 3. Reset password
    reset_res = await client.post(
        "/api/v1/auth/reset-password",
        json={
            "email": email,
            "otp_code": code,
            "new_password": "NewPassword@12345",
        },
    )
    assert reset_res.status_code == 200
    assert "successful" in reset_res.json()["message"]

    # 4. Login with new password
    login_new = await client.post(
        "/api/v1/auth/login",
        json={"email": email, "password": "NewPassword@12345"},
    )
    assert login_new.status_code == 200
    assert "access_token" in login_new.json()
