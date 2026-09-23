"""
Fleet operations router — maintenance scheduling, routine inspections, damage reports, and operational task tracking.
"""

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional, List

from app.database import get_db
from app.models.user import User
from app.schemas.fleet import (
    MaintenanceCreate,
    MaintenanceUpdate,
    MaintenanceResponse,
    InspectionCreate,
    InspectionResponse,
    DamageReportCreate,
    DamageReportUpdate,
    DamageReportResponse,
    FleetTaskCreate,
    FleetTaskUpdate,
    FleetTaskResponse,
)
from app.services import fleet_service
from app.utils.dependencies import get_current_user

router = APIRouter(prefix="/fleet", tags=["Fleet Operations"])


# ── Maintenance ───────────────────────────────────────────────────────────────
@router.get(
    "/maintenance",
    response_model=List[MaintenanceResponse],
    summary="List Maintenance Records",
    description="Retrieve vehicle maintenance logs filtered by status (Scheduled, In Progress, Completed, Overdue) or vehicle ID.",
)
async def list_maintenance(
    status: Optional[str] = Query(None, description="Status filter: Scheduled, In Progress, Completed, Overdue"),
    vehicle_id: Optional[str] = Query(None, description="Filter by vehicle ID"),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await fleet_service.get_all_maintenance(db, status_filter=status, vehicle_id=vehicle_id)


@router.post(
    "/maintenance",
    response_model=MaintenanceResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Schedule Fleet Maintenance",
    description="Schedule vehicle service (oil change, brake inspection, tire rotation, detailing) and set unit to Maintenance state.",
)
async def schedule_maintenance(
    data: MaintenanceCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await fleet_service.schedule_maintenance(db, data)


@router.patch(
    "/maintenance/{record_id}",
    response_model=MaintenanceResponse,
    summary="Update Maintenance Record",
    description="Update maintenance progress, actual service cost, or complete service to return vehicle to Available fleet.",
)
async def update_maintenance(
    record_id: str,
    data: MaintenanceUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await fleet_service.update_maintenance(db, record_id, data)


# ── Inspections ───────────────────────────────────────────────────────────────
@router.get(
    "/inspections",
    response_model=List[InspectionResponse],
    summary="List Fleet Inspections",
    description="List pre-trip, post-return, and routine safety inspections.",
)
async def list_inspections(
    status: Optional[str] = Query(None, description="Status: Completed, In Progress, Pending, Failed"),
    vehicle_id: Optional[str] = Query(None, description="Filter by vehicle ID"),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await fleet_service.get_all_inspections(db, status_filter=status, vehicle_id=vehicle_id)


@router.post(
    "/inspections",
    response_model=InspectionResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Record Fleet Inspection",
    description="Submit digital inspection check for tires, brakes, interior, exterior, fuel level, and odometer.",
)
async def record_inspection(
    data: InspectionCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await fleet_service.record_inspection(db, data)


# ── Damage Reports ────────────────────────────────────────────────────────────
@router.get(
    "/damages",
    response_model=List[DamageReportResponse],
    summary="List Damage Reports",
    description="Retrieve vehicle damage incident reports filtered by review status (Pending Review, Approved, Disputed, Resolved).",
)
async def list_damage_reports(
    status: Optional[str] = Query(None, description="Review status filter"),
    vehicle_id: Optional[str] = Query(None, description="Filter by vehicle ID"),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await fleet_service.get_all_damage_reports(db, review_status=status, vehicle_id=vehicle_id)


@router.post(
    "/damages",
    response_model=DamageReportResponse,
    status_code=status.HTTP_201_CREATED,
    summary="File Damage Report",
    description="Report vehicle damage with description, estimated repair fee, and evidence photo URL.",
)
async def create_damage_report(
    data: DamageReportCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await fleet_service.create_damage_report(db, data)


@router.patch(
    "/damages/{report_id}",
    response_model=DamageReportResponse,
    summary="Update Damage Review Status",
    description="Approve, dispute, or resolve a damage incident claim.",
)
async def update_damage_report(
    report_id: str,
    data: DamageReportUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await fleet_service.update_damage_report(db, report_id, data)


# ── Tasks ─────────────────────────────────────────────────────────────────────
@router.get(
    "/tasks",
    response_model=List[FleetTaskResponse],
    summary="List Fleet Operations Tasks",
    description="List operational tasks (Vehicle Preparation, Cleaning, Shuttle, Inspections).",
)
async def list_tasks(
    status: Optional[str] = Query(None, description="Status filter: Pending, Completed"),
    priority: Optional[str] = Query(None, description="Priority filter: High, Medium, Low"),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await fleet_service.get_all_tasks(db, status_filter=status, priority=priority)


@router.post(
    "/tasks",
    response_model=FleetTaskResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create Operations Task",
    description="Dispatch an operational task for turnaround staff or depot crew.",
)
async def create_task(
    data: FleetTaskCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await fleet_service.create_task(db, data)


@router.patch(
    "/tasks/{task_id}",
    response_model=FleetTaskResponse,
    summary="Update Task Status",
    description="Update task progress or mark as Completed.",
)
async def update_task(
    task_id: str,
    data: FleetTaskUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await fleet_service.update_task(db, task_id, data)
