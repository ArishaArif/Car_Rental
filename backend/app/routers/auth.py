"""
Auth router — all /api/v1/auth/* endpoints.
"""

from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.schemas.auth import (
    RegisterRequest, RegisterResponse,
    VerifyOTPRequest, OTPResponse,
    ResendOTPRequest,
    LoginRequest, TokenResponse,
    RefreshRequest, AccessTokenResponse,
    LogoutRequest,
    GoogleAuthRequest,
    ForgotPasswordRequest,
    ResetPasswordRequest,
)
from app.services import auth_service

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post(
    "/register",
    response_model=RegisterResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Register a new user",
    description="Creates a new account and sends a 6-digit OTP to the provided email for verification.",
)
async def register(data: RegisterRequest, db: AsyncSession = Depends(get_db)):
    result = await auth_service.register_user(db, data)
    return RegisterResponse(**result)


@router.post(
    "/verify-otp",
    response_model=OTPResponse,
    summary="Verify email OTP",
    description="Submit the 6-digit OTP received via email to activate your account.",
)
async def verify_otp(data: VerifyOTPRequest, db: AsyncSession = Depends(get_db)):
    result = await auth_service.verify_email_otp(db, data.email, data.otp_code)
    return OTPResponse(**result)


@router.post(
    "/resend-otp",
    response_model=OTPResponse,
    summary="Resend OTP",
    description="Request a new OTP to be sent to your email. Use purpose='email_verification' or 'password_reset'.",
)
async def resend_otp(data: ResendOTPRequest, db: AsyncSession = Depends(get_db)):
    result = await auth_service.resend_otp_code(db, data.email, data.purpose)
    return OTPResponse(**result)


@router.post(
    "/login",
    response_model=TokenResponse,
    summary="Login with email & password",
    description="Authenticate with your credentials and receive JWT access + refresh tokens.",
)
async def login(data: LoginRequest, db: AsyncSession = Depends(get_db)):
    return await auth_service.login_user(db, data)


@router.post(
    "/refresh",
    response_model=AccessTokenResponse,
    summary="Refresh access token",
    description="Exchange a valid refresh token for a new short-lived access token.",
)
async def refresh_token(data: RefreshRequest, db: AsyncSession = Depends(get_db)):
    return await auth_service.refresh_access_token(db, data.refresh_token)


@router.post(
    "/logout",
    response_model=OTPResponse,
    summary="Logout",
    description="Invalidate the provided refresh token. The user will be logged out.",
)
async def logout(data: LogoutRequest, db: AsyncSession = Depends(get_db)):
    result = await auth_service.logout_user(db, data.refresh_token)
    return OTPResponse(**result)


@router.post(
    "/google",
    response_model=TokenResponse,
    summary="Sign in with Google",
    description=(
        "Authenticate using a Google ID token obtained from the Google Sign-In SDK. "
        "Automatically creates an account if the user is new."
    ),
)
async def google_login(data: GoogleAuthRequest, db: AsyncSession = Depends(get_db)):
    return await auth_service.google_auth(db, data.id_token)


@router.post(
    "/forgot-password",
    response_model=OTPResponse,
    summary="Request password reset",
    description="Send a 6-digit OTP to the registered email for password reset.",
)
async def forgot_password(data: ForgotPasswordRequest, db: AsyncSession = Depends(get_db)):
    result = await auth_service.forgot_password(db, data.email)
    return OTPResponse(**result)


@router.post(
    "/reset-password",
    response_model=OTPResponse,
    summary="Reset password",
    description="Use the OTP received via email to set a new password.",
)
async def reset_password(data: ResetPasswordRequest, db: AsyncSession = Depends(get_db)):
    result = await auth_service.reset_password(db, data.email, data.otp_code, data.new_password)
    return OTPResponse(**result)
