"""
Users router — authenticated user profile and onboarding setup endpoints.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update
import uuid

from app.database import get_db
from app.models.user import User, UserRole
from app.schemas.user import (
    UserResponse,
    UpdateProfileRequest,
    ProfileSetupRequest,
    CustomerPreferences,
)
from app.utils.dependencies import get_current_user

router = APIRouter(prefix="/users", tags=["Users"])


@router.get(
    "/me",
    response_model=UserResponse,
    summary="Get my profile",
    description="Retrieve the currently authenticated user's complete profile.",
)
async def get_me(current_user: User = Depends(get_current_user)):
    return current_user


@router.patch(
    "/me",
    response_model=UserResponse,
    summary="Update my profile",
    description="Update profile details such as name, phone, city, license, business info, or preferences.",
)
async def update_me(
    data: UpdateProfileRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    updates = data.model_dump(exclude_none=True)
    if updates:
        # If preferences are being updated, merge with existing
        if "preferences" in updates and current_user.preferences:
            merged_prefs = dict(current_user.preferences)
            merged_prefs.update(updates["preferences"])
            updates["preferences"] = merged_prefs

        await db.execute(
            update(User).where(User.id == current_user.id).values(**updates)
        )
        await db.commit()
        await db.refresh(current_user)

    return current_user


@router.post(
    "/profile-setup",
    response_model=UserResponse,
    summary="Complete initial profile setup",
    description="Post-registration role-specific profile completion (driving license for Customer, business details for Provider/FleetManager).",
)
async def setup_profile(
    data: ProfileSetupRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    updates = data.model_dump(exclude_none=True)
    if not updates and current_user.is_profile_complete:
        return current_user

    updates["is_profile_complete"] = True

    for key, val in updates.items():
        setattr(current_user, key, val)

    await db.execute(
        update(User).where(User.id == current_user.id).values(**updates)
    )
    await db.commit()
    await db.refresh(current_user)
    return current_user


@router.put(
    "/preferences",
    response_model=UserResponse,
    summary="Update customer app preferences",
    description="Set language, currency, notifications, and preferred vehicle preferences.",
)
async def update_preferences(
    prefs: CustomerPreferences,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    current_user.preferences = prefs.model_dump()
    await db.execute(
        update(User).where(User.id == current_user.id).values(preferences=current_user.preferences)
    )
    await db.commit()
    await db.refresh(current_user)
    return current_user


@router.get(
    "/{user_id}",
    response_model=UserResponse,
    summary="Get user by ID",
    description="Retrieve public profile info for a specific user ID.",
)
async def get_user_by_id(
    user_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"User with ID {user_id} not found",
        )
    return user
