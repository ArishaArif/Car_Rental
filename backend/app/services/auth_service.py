import uuid
from datetime import datetime, timezone

from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update


from app.models.user import User, AuthProvider, UserRole
from app.models.token_blacklist import TokenBlacklist
from app.models.otp import OTPPurpose
from app.schemas.auth import RegisterRequest, LoginRequest, TokenResponse, AccessTokenResponse
from app.utils.hashing import hash_password, verify_password
from app.utils.jwt import create_access_token, create_refresh_token, decode_refresh_token
from app.services.otp_service import create_otp, verify_otp
from app.services.email_service import send_otp_email
from app.services.google_service import verify_google_token
from app.config import settings


# ── Register ──────────────────────────────────────────────────────────────────
async def register_user(db: AsyncSession, data: RegisterRequest) -> dict:
    """
    Register a new user:
    1. Check email not already taken
    2. Hash password
    3. Create user (unverified)
    4. Generate + send OTP
    """
    # Check duplicate
    result = await db.execute(select(User).where(User.email == data.email))
    existing = result.scalar_one_or_none()
    if existing:
        if existing.is_email_verified:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="An account with this email already exists",
            )
        else:
            # Resend OTP to unverified user
            otp_code = await create_otp(db, str(existing.id), OTPPurpose.EMAIL_VERIFICATION)
            await send_otp_email(existing.email, existing.full_name, otp_code, "email_verification")
            return {"message": "Account exists but email not verified. A new OTP has been sent.", "email": data.email}

    # Create user
    user = User(
        full_name=data.full_name,
        email=data.email,
        hashed_password=hash_password(data.password),
        auth_provider=AuthProvider.EMAIL,
        role=data.role or UserRole.CUSTOMER,
        phone_number=data.phone_number,
        is_email_verified=False,
    )
    db.add(user)
    await db.flush()  # Get user.id assigned

    # Generate and send OTP
    otp_code = await create_otp(db, str(user.id), OTPPurpose.EMAIL_VERIFICATION)
    await send_otp_email(user.email, user.full_name, otp_code, "email_verification")

    return {
        "message": "Registration successful. Please check your email for the verification code.",
        "email": data.email,
    }


# ── Verify OTP ────────────────────────────────────────────────────────────────
async def verify_email_otp(db: AsyncSession, email: str, code: str) -> dict:
    """Verify OTP and mark user as email-verified."""
    result = await db.execute(select(User).where(User.email == email))
    user = result.scalar_one_or_none()

    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    if user.is_email_verified:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already verified")

    await verify_otp(db, str(user.id), code, OTPPurpose.EMAIL_VERIFICATION)

    # Activate user
    await db.execute(
        update(User)
        .where(User.id == user.id)
        .values(is_email_verified=True)
    )

    return {"message": "Email verified successfully. You can now log in."}


# ── Resend OTP ────────────────────────────────────────────────────────────────
async def resend_otp_code(db: AsyncSession, email: str, purpose: str) -> dict:
    """Resend OTP code to user's email."""
    result = await db.execute(select(User).where(User.email == email))
    user = result.scalar_one_or_none()

    if not user:
        # Don't leak whether the user exists
        return {"message": "If an account with this email exists, a new OTP has been sent."}

    otp_purpose = OTPPurpose(purpose)
    otp_code = await create_otp(db, str(user.id), otp_purpose)
    await send_otp_email(user.email, user.full_name, otp_code, purpose)

    return {"message": "If an account with this email exists, a new OTP has been sent."}


# ── Login ─────────────────────────────────────────────────────────────────────
async def login_user(db: AsyncSession, data: LoginRequest) -> TokenResponse:
    """Authenticate email/password and return token pair."""
    result = await db.execute(select(User).where(User.email == data.email))
    user = result.scalar_one_or_none()

    # Generic error to prevent email enumeration
    invalid_exc = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid email or password",
    )

    if not user or user.hashed_password is None:
        raise invalid_exc

    if not verify_password(data.password, user.hashed_password):
        raise invalid_exc

    if not user.is_active:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Account is deactivated")

    if not user.is_email_verified:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Email not verified. Please verify your email first.",
        )

    # Issue tokens
    access_token, _, expires_in = create_access_token(
        user_id=str(user.id), email=user.email, role=user.role.value
    )
    refresh_token, refresh_jti, refresh_expires_at = create_refresh_token(str(user.id))

    # Update last login
    await db.execute(
        update(User).where(User.id == user.id).values(last_login=datetime.now(timezone.utc))
    )

    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        expires_in=expires_in,
    )


# ── Refresh Token ─────────────────────────────────────────────────────────────
async def refresh_access_token(db: AsyncSession, refresh_token: str) -> AccessTokenResponse:
    """Validate refresh token, check blacklist, issue new access token."""
    payload = decode_refresh_token(refresh_token)
    user_id = payload.get("sub")
    jti = payload.get("jti")

    # Check blacklist
    bl_result = await db.execute(
        select(TokenBlacklist).where(TokenBlacklist.token_jti == jti)
    )
    if bl_result.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Refresh token has been revoked",
        )

    # Fetch user
    user_uuid = uuid.UUID(str(user_id)) if not isinstance(user_id, uuid.UUID) else user_id
    result = await db.execute(select(User).where(User.id == user_uuid))
    user = result.scalar_one_or_none()


    if not user or not user.is_active:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")

    access_token, _, expires_in = create_access_token(
        user_id=str(user.id), email=user.email, role=user.role.value
    )

    return AccessTokenResponse(access_token=access_token, expires_in=expires_in)


# ── Logout ────────────────────────────────────────────────────────────────────
async def logout_user(db: AsyncSession, refresh_token: str) -> dict:
    """Blacklist the provided refresh token."""
    payload = decode_refresh_token(refresh_token)
    jti = payload.get("jti")
    user_id = payload.get("sub")

    # Check not already blacklisted
    bl_result = await db.execute(
        select(TokenBlacklist).where(TokenBlacklist.token_jti == jti)
    )
    if not bl_result.scalar_one_or_none():
        exp_ts = payload.get("exp")
        expires_at = datetime.fromtimestamp(exp_ts, tz=timezone.utc)

        user_uuid = uuid.UUID(str(user_id)) if user_id else None
        bl = TokenBlacklist(
            token_jti=jti,
            user_id=user_uuid,
            expires_at=expires_at,
        )
        db.add(bl)

    return {"message": "Logged out successfully"}


# ── Google OAuth ──────────────────────────────────────────────────────────────
async def google_auth(db: AsyncSession, id_token_str: str) -> TokenResponse:
    """
    Verify Google ID token, create or update user, return JWT tokens.
    """
    google_user = verify_google_token(id_token_str)

    # Try to find user by Google ID or email
    result = await db.execute(
        select(User).where(
            (User.google_id == google_user.google_id) | (User.email == google_user.email)
        )
    )
    user = result.scalar_one_or_none()

    if not user:
        # Create new Google user (auto-verified)
        user = User(
            full_name=google_user.full_name,
            email=google_user.email,
            auth_provider=AuthProvider.GOOGLE,
            google_id=google_user.google_id,
            profile_picture=google_user.picture,
            is_email_verified=True,
            hashed_password=None,
        )
        db.add(user)
        await db.flush()
    else:
        # Link Google ID if user registered with email
        updates: dict = {"last_login": datetime.now(timezone.utc)}
        if not user.google_id:
            updates["google_id"] = google_user.google_id
        if not user.profile_picture and google_user.picture:
            updates["profile_picture"] = google_user.picture
        if not user.is_email_verified:
            updates["is_email_verified"] = True
        await db.execute(update(User).where(User.id == user.id).values(**updates))

    # Issue tokens
    access_token, _, expires_in = create_access_token(
        user_id=str(user.id), email=user.email, role=user.role.value
    )
    refresh_token, refresh_jti, refresh_expires_at = create_refresh_token(str(user.id))

    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        expires_in=expires_in,
    )


# ── Forgot Password ───────────────────────────────────────────────────────────
async def forgot_password(db: AsyncSession, email: str) -> dict:
    """Send a password reset OTP."""
    result = await db.execute(select(User).where(User.email == email))
    user = result.scalar_one_or_none()

    # Don't reveal if user exists
    if user and user.auth_provider == AuthProvider.EMAIL:
        otp_code = await create_otp(db, str(user.id), OTPPurpose.PASSWORD_RESET)
        await send_otp_email(user.email, user.full_name, otp_code, "password_reset")

    return {"message": "If an account with this email exists, a password reset code has been sent."}


# ── Reset Password ────────────────────────────────────────────────────────────
async def reset_password(db: AsyncSession, email: str, code: str, new_password: str) -> dict:
    """Verify reset OTP and update password."""
    result = await db.execute(select(User).where(User.email == email))
    user = result.scalar_one_or_none()

    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    if user.auth_provider != AuthProvider.EMAIL:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password reset is only available for email accounts",
        )

    await verify_otp(db, str(user.id), code, OTPPurpose.PASSWORD_RESET)

    await db.execute(
        update(User)
        .where(User.id == user.id)
        .values(hashed_password=hash_password(new_password))
    )

    return {"message": "Password reset successfully. You can now log in with your new password."}
