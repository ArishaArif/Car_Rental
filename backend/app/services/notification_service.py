"""
Notification service — App alerts, read receipts, and system broadcasts.
"""

from typing import Optional, List
import uuid
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, or_, desc, update
from fastapi import HTTPException, status

from app.models.notification import AppNotification
from app.models.user import User
from app.schemas.notification import NotificationCreate


async def get_user_notifications(
    db: AsyncSession, user: User
) -> List[AppNotification]:
    user_role_str = user.role.value if hasattr(user.role, "value") else str(user.role)
    query = (
        select(AppNotification)
        .where(
            or_(
                AppNotification.user_id == user.id,
                AppNotification.target_role == user_role_str,
                AppNotification.target_role == None,
            )
        )
        .order_by(desc(AppNotification.created_at))
    )
    result = await db.execute(query)
    return list(result.scalars().all())


async def mark_notification_read(
    db: AsyncSession, notification_id: str
) -> AppNotification:
    result = await db.execute(
        select(AppNotification).where(AppNotification.id == notification_id)
    )
    notif = result.scalar_one_or_none()
    if not notif:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Notification '{notification_id}' not found",
        )
    notif.is_read = True
    await db.commit()
    await db.refresh(notif)
    return notif


async def mark_all_notifications_read(
    db: AsyncSession, user: User
) -> dict:
    user_role_str = user.role.value if hasattr(user.role, "value") else str(user.role)
    await db.execute(
        update(AppNotification)
        .where(
            or_(
                AppNotification.user_id == user.id,
                AppNotification.target_role == user_role_str,
            )
        )
        .values(is_read=True)
    )
    await db.commit()
    return {"message": "All notifications marked as read"}


async def create_notification(
    db: AsyncSession, data: NotificationCreate
) -> AppNotification:
    notif = AppNotification(**data.model_dump())
    db.add(notif)
    await db.commit()
    await db.refresh(notif)
    return notif
