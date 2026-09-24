"""
Tests for Provider SaaS Subscriptions and Billing Invoices.
"""

import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_subscription_lifecycle(client: AsyncClient, test_users):
    """Test SaaS tier listing, current subscription retrieval, tier upgrade, and invoice history."""
    provider = test_users["provider"]
    headers = provider["headers"]

    # 1. List Plans
    res_plans = await client.get("/api/v1/subscriptions/plans")
    assert res_plans.status_code == 200
    plans = res_plans.json()
    assert len(plans) == 3
    plan_ids = [p["id"] for p in plans]
    assert "starter" in plan_ids
    assert "professional" in plan_ids
    assert "business" in plan_ids

    # 2. Get Current Subscription
    res_curr = await client.get("/api/v1/subscriptions/current", headers=headers)
    assert res_curr.status_code == 200
    assert res_curr.json()["status"] == "Active"

    # 3. Upgrade Subscription
    upgrade_payload = {
        "target_plan_id": "business",
        "billing_cycle": "annual",
        "payment_method": "Mastercard ending 9999",
    }
    res_up = await client.post("/api/v1/subscriptions/upgrade", headers=headers, json=upgrade_payload)
    assert res_up.status_code == 200
    assert res_up.json()["plan_id"] == "business"
    assert res_up.json()["billing_cycle"] == "annual"

    # 4. List Invoices
    res_inv = await client.get("/api/v1/subscriptions/invoices", headers=headers)
    assert res_inv.status_code == 200
    invoices = res_inv.json()
    assert len(invoices) >= 1
    assert invoices[0]["amount"] == 3350.0
