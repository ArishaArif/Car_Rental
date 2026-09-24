"""
Tests for Fleet Maintenance, Inspections, Damage Reports, and Operations Tasks.
"""

import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_fleet_operations_workflow(client: AsyncClient, test_users):
    """Test maintenance scheduling, inspection recording, damage filing, and task tracking."""
    provider = test_users["provider"]
    headers = provider["headers"]

    # Create vehicle for maintenance
    res_veh = await client.post(
        "/api/v1/vehicles",
        headers=headers,
        json={
            "brand": "Ford",
            "model": "Explorer AWD",
            "year": 2023,
            "category": "SUV",
            "image": "https://images.unsplash.com/photo-1583121274602-3e2820c69888?q=80&w=800",
            "price_per_day": 80.0,
        },
    )
    assert res_veh.status_code == 201
    veh_id = res_veh.json()["id"]

    # 1. Schedule Maintenance
    maint_payload = {
        "vehicle_id": veh_id,
        "vehicle_name": "Ford Explorer AWD",
        "vehicle_plate": "EXP-7721",
        "type": "Oil Change",
        "due_date": "2026-10-05",
        "estimated_cost": 85.0,
        "service_center": "Metro Ford Hub",
    }
    res_maint = await client.post("/api/v1/fleet/maintenance", headers=headers, json=maint_payload)
    assert res_maint.status_code == 201
    maint_id = res_maint.json()["id"]
    assert res_maint.json()["status"] == "Scheduled"

    # Update Maintenance (Complete)
    res_maint_up = await client.patch(
        f"/api/v1/fleet/maintenance/{maint_id}",
        headers=headers,
        json={"status": "Completed", "actual_cost": 80.0},
    )
    assert res_maint_up.status_code == 200
    assert res_maint_up.json()["status"] == "Completed"

    # 2. Record Inspection
    insp_payload = {
        "vehicle_id": veh_id,
        "vehicle_name": "Ford Explorer AWD",
        "inspector_name": "Marcus Chen",
        "date": "2026-09-23",
        "status": "Completed",
        "type": "Routine",
        "exterior_condition": "Good",
        "interior_condition": "Clean",
        "tires_and_brakes": "Good",
        "fuel_level": 90,
        "odometer_reading": 12500,
        "passed": True,
    }
    res_insp = await client.post("/api/v1/fleet/inspections", headers=headers, json=insp_payload)
    assert res_insp.status_code == 201
    assert res_insp.json()["passed"] is True

    # 3. File Damage Report
    dmg_payload = {
        "vehicle_id": veh_id,
        "vehicle_name": "Ford Explorer AWD",
        "customer_name": "Customer Test",
        "damage_status": "Minor Scratches",
        "description": "Scuff on passenger side mirror.",
        "estimated_charge": 65.0,
    }
    res_dmg = await client.post("/api/v1/fleet/damages", headers=headers, json=dmg_payload)
    assert res_dmg.status_code == 201
    dmg_id = res_dmg.json()["id"]

    res_dmg_up = await client.patch(
        f"/api/v1/fleet/damages/{dmg_id}",
        headers=headers,
        json={"review_status": "Approved"},
    )
    assert res_dmg_up.status_code == 200
    assert res_dmg_up.json()["review_status"] == "Approved"

    # 4. Fleet Task
    task_payload = {
        "title": "Sanitize & Refuel Ford Explorer",
        "description": "Ready vehicle for tomorrow morning rental.",
        "vehicle_id": veh_id,
        "vehicle_name": "Ford Explorer AWD",
        "priority": "High",
        "due_time": "Today, 6:00 PM",
        "category": "Preparation",
    }
    res_task = await client.post("/api/v1/fleet/tasks", headers=headers, json=task_payload)
    assert res_task.status_code == 201
    task_id = res_task.json()["id"]

    res_task_up = await client.patch(
        f"/api/v1/fleet/tasks/{task_id}",
        headers=headers,
        json={"status": "Completed"},
    )
    assert res_task_up.status_code == 200
    assert res_task_up.json()["status"] == "Completed"
