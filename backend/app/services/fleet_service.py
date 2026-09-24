"""
Fleet operations service — Maintenance tracking, Inspections, Damage reporting, and Task management.
"""

from typing import Optional, List
from datetime import datetime, timezone
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, desc, update, delete
from fastapi import HTTPException, status

from app.models.fleet import MaintenanceRecord, FleetInspection, DamageReport, FleetTask
from app.models.vehicle import Vehicle
from app.schemas.fleet import (
    MaintenanceCreate,
    MaintenanceUpdate,
    InspectionCreate,
    DamageReportCreate,
    DamageReportUpdate,
    FleetTaskCreate,
    FleetTaskUpdate,
)


# ── Maintenance ───────────────────────────────────────────────────────────────
async def get_all_maintenance(
    db: AsyncSession,
    status_filter: Optional[str] = None,
    vehicle_id: Optional[str] = None,
) -> List[MaintenanceRecord]:
    query = select(MaintenanceRecord)
    filters = []

    if status_filter and status_filter != "all":
        filters.append(MaintenanceRecord.status.ilike(status_filter))
    if vehicle_id:
        filters.append(MaintenanceRecord.vehicle_id == vehicle_id)

    if filters:
        query = query.where(and_(*filters))

    query = query.order_by(desc(MaintenanceRecord.created_at))
    result = await db.execute(query)
    return list(result.scalars().all())


async def schedule_maintenance(
    db: AsyncSession, data: MaintenanceCreate
) -> MaintenanceRecord:
    rec = MaintenanceRecord(**data.model_dump())
    db.add(rec)

    # Set vehicle availability to Maintenance if scheduled
    v_res = await db.execute(select(Vehicle).where(Vehicle.id == data.vehicle_id))
    vehicle = v_res.scalar_one_or_none()
    if vehicle:
        vehicle.availability = "Maintenance"

    await db.commit()
    await db.refresh(rec)
    return rec


async def update_maintenance(
    db: AsyncSession, record_id: str, data: MaintenanceUpdate
) -> MaintenanceRecord:
    result = await db.execute(
        select(MaintenanceRecord).where(MaintenanceRecord.id == record_id)
    )
    rec = result.scalar_one_or_none()
    if not rec:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Maintenance record '{record_id}' not found",
        )

    updates = data.model_dump(exclude_none=True)
    for key, val in updates.items():
        setattr(rec, key, val)

    # If completed, free up vehicle
    if rec.status == "Completed":
        rec.completed_date = datetime.now(timezone.utc).strftime("%Y-%m-%d")
        v_res = await db.execute(select(Vehicle).where(Vehicle.id == rec.vehicle_id))
        vehicle = v_res.scalar_one_or_none()
        if vehicle and vehicle.availability == "Maintenance":
            vehicle.availability = "Available"

    await db.commit()
    await db.refresh(rec)
    return rec


# ── Inspections ───────────────────────────────────────────────────────────────
async def get_all_inspections(
    db: AsyncSession,
    status_filter: Optional[str] = None,
    vehicle_id: Optional[str] = None,
) -> List[FleetInspection]:
    query = select(FleetInspection)
    filters = []

    if status_filter and status_filter != "all":
        filters.append(FleetInspection.status.ilike(status_filter))
    if vehicle_id:
        filters.append(FleetInspection.vehicle_id == vehicle_id)

    if filters:
        query = query.where(and_(*filters))

    query = query.order_by(desc(FleetInspection.created_at))
    result = await db.execute(query)
    return list(result.scalars().all())


async def record_inspection(
    db: AsyncSession, data: InspectionCreate
) -> FleetInspection:
    inspection = FleetInspection(**data.model_dump())
    db.add(inspection)
    await db.commit()
    await db.refresh(inspection)
    return inspection


# ── Damage Reports ────────────────────────────────────────────────────────────
async def get_all_damage_reports(
    db: AsyncSession,
    review_status: Optional[str] = None,
    vehicle_id: Optional[str] = None,
) -> List[DamageReport]:
    query = select(DamageReport)
    filters = []

    if review_status and review_status != "all":
        filters.append(DamageReport.review_status.ilike(review_status))
    if vehicle_id:
        filters.append(DamageReport.vehicle_id == vehicle_id)

    if filters:
        query = query.where(and_(*filters))

    query = query.order_by(desc(DamageReport.reported_at))
    result = await db.execute(query)
    return list(result.scalars().all())


async def create_damage_report(
    db: AsyncSession, data: DamageReportCreate
) -> DamageReport:
    report = DamageReport(**data.model_dump())
    db.add(report)
    await db.commit()
    await db.refresh(report)
    return report


async def update_damage_report(
    db: AsyncSession, report_id: str, data: DamageReportUpdate
) -> DamageReport:
    result = await db.execute(
        select(DamageReport).where(DamageReport.id == report_id)
    )
    report = result.scalar_one_or_none()
    if not report:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Damage report '{report_id}' not found",
        )

    updates = data.model_dump(exclude_none=True)
    for key, val in updates.items():
        setattr(report, key, val)

    if report.review_status in ("Resolved", "Approved"):
        report.resolved_at = datetime.now(timezone.utc)

    await db.commit()
    await db.refresh(report)
    return report


# ── Fleet Tasks ───────────────────────────────────────────────────────────────
async def get_all_tasks(
    db: AsyncSession,
    status_filter: Optional[str] = None,
    priority: Optional[str] = None,
) -> List[FleetTask]:
    query = select(FleetTask)
    filters = []

    if status_filter and status_filter != "all":
        filters.append(FleetTask.status.ilike(status_filter))
    if priority and priority != "all":
        filters.append(FleetTask.priority.ilike(priority))

    if filters:
        query = query.where(and_(*filters))

    query = query.order_by(desc(FleetTask.created_at))
    result = await db.execute(query)
    return list(result.scalars().all())


async def create_task(db: AsyncSession, data: FleetTaskCreate) -> FleetTask:
    task = FleetTask(**data.model_dump())
    db.add(task)
    await db.commit()
    await db.refresh(task)
    return task


async def update_task(
    db: AsyncSession, task_id: str, data: FleetTaskUpdate
) -> FleetTask:
    result = await db.execute(select(FleetTask).where(FleetTask.id == task_id))
    task = result.scalar_one_or_none()
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Fleet task '{task_id}' not found",
        )

    updates = data.model_dump(exclude_none=True)
    for key, val in updates.items():
        setattr(task, key, val)

    await db.commit()
    await db.refresh(task)
    return task
