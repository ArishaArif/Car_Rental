"""
Users router — authenticated user profile endpoints.
"""

from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import update

from app.database import get_db
from app.models.user import User
from app.schemas.user import UserResponse, UpdateProfileRequest
from app.utils.dependencies import get_current_user

router = APIRouter(prefix="/users", tags=["Users"])


@router.get(
    "/me",
    response_model=UserResponse,
    summary="Get my profile",
    description="Retrieve the currently authenticated user's profile.",
)
async def get_me(current_user: User = Depends(get_current_user)):
    return current_user


@router.patch(
    "/me",
    response_model=UserResponse,
    summary="Update my profile",
    description="Update name, phone number, or profile picture.",
)
async def update_me(
    data: UpdateProfileRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    updates = data.model_dump(exclude_none=True)
    if updates:
        await db.execute(
            update(User).where(User.id == current_user.id).values(**updates)
        )
        await db.refresh(current_user)
        # Re-fetch for accurate response
        for key, val in updates.items():
            setattr(current_user, key, val)

    return current_user
