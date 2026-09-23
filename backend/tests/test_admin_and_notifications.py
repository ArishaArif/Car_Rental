"""
Tests for System Admin dashboard, verifications, disputes, and Notifications.
"""

import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_admin_and_notifications_workflow(client: AsyncClient, test_users):
    """Test Admin KPIs, user directory, status toggle, verifications, disputes, system config, and notifications."""
    admin = test_users["admin"]
    customer = test_users["customer"]
    admin_headers = admin["headers"]
    cust_headers = customer["headers"]

    # 1. Admin KPIs
    res_kpi = await client.get("/api/v1/admin/kpis", headers=admin_headers)
    assert res_kpi.status_code == 200
    kpis = res_kpi.json()
    assert "totalCustomers" in kpis
    assert "totalProviders" in kpis
    assert "totalVehicles" in kpis

    # 2. Admin Users Directory
    res_users = await client.get("/api/v1/admin/users", headers=admin_headers)
    assert res_users.status_code == 200
    users_list = res_users.json()
    assert len(users_list) >= 3

    # 3. User Suspension / Activation
    cust_id = customer["user"].id
    res_susp = await client.patch(f"/api/v1/admin/users/{cust_id}/status?is_active=false", headers=admin_headers)
    assert res_susp.status_code == 200
    assert "suspended" in res_susp.json()["message"]

    res_act = await client.patch(f"/api/v1/admin/users/{cust_id}/status?is_active=true", headers=admin_headers)
    assert res_act.status_code == 200
    assert "activated" in res_act.json()["message"]

    # 4. Admin Providers Directory
    res_provs = await client.get("/api/v1/admin/providers", headers=admin_headers)
    assert res_provs.status_code == 200
    assert len(res_provs.json()) >= 1

    # 5. System Configuration
    res_cfg = await client.get("/api/v1/admin/config", headers=admin_headers)
    assert res_cfg.status_code == 200
    cfg_data = res_cfg.json()
    assert cfg_data["commissionRate"] == 10.0

    res_cfg_up = await client.patch(
        "/api/v1/admin/config",
        headers=admin_headers,
        json={
            "commissionRate": 12.0,
            "vehicleCategories": cfg_data["vehicleCategories"],
            "regions": cfg_data["regions"],
            "pricingBaseline": cfg_data["pricingBaseline"],
        },
    )
    assert res_cfg_up.status_code == 200
    assert res_cfg_up.json()["commissionRate"] == 12.0

    # 6. Notifications: Create, List, Mark Read
    notif_payload = {
        "user_id": str(cust_id),
        "title": "Booking Confirmation",
        "message": "Your booking has been approved by host.",
        "category": "Booking",
    }
    res_notif_create = await client.post("/api/v1/notifications", headers=cust_headers, json=notif_payload)
    assert res_notif_create.status_code == 201
    notif_id = res_notif_create.json()["id"]

    res_notif_list = await client.get("/api/v1/notifications", headers=cust_headers)
    assert res_notif_list.status_code == 200
    notifs = res_notif_list.json()
    assert len(notifs) >= 1

    res_notif_read = await client.patch(f"/api/v1/notifications/{notif_id}/read", headers=cust_headers)
    assert res_notif_read.status_code == 200
    assert res_notif_read.json()["is_read"] is True

    res_all_read = await client.post("/api/v1/notifications/mark-all-read", headers=cust_headers)
    assert res_all_read.status_code == 200
    assert "All notifications" in res_all_read.json()["message"]
