"""
Notifications router — real-time alerts, unread counts, and read receipts.
"""

from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List

from app.database import get_db
from app.models.user import User
from app.schemas.notification import NotificationCreate, NotificationResponse
from app.services import notification_service
from app.utils.dependencies import get_current_user

router = APIRouter(prefix="/notifications", tags=["Notifications"])


@router.get(
    "",
    response_model=List[NotificationResponse],
    summary="List User Notifications",
    description="Retrieve all notifications relevant to the authenticated user and their current role.",
)
async def list_notifications(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await notification_service.get_user_notifications(db, current_user)


@router.patch(
    "/{notification_id}/read",
    response_model=NotificationResponse,
    summary="Mark Notification as Read",
    description="Update notification status to read.",
)
async def mark_read(
    notification_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await notification_service.mark_notification_read(db, notification_id)


@router.post(
    "/mark-all-read",
    summary="Mark All Notifications Read",
    description="Mark all notifications for current user/role as read.",
)
async def mark_all_read(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await notification_service.mark_all_notifications_read(db, current_user)


@router.post(
    "",
    response_model=NotificationResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create Notification (Internal / Admin)",
    description="Trigger and dispatch a new in-app notification.",
)
async def create_notification(
    data: NotificationCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await notification_service.create_notification(db, data)
