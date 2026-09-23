"""
Tests for Vehicle discovery, multi-filter search, stats, and provider fleet management.
"""

import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_vehicle_lifecycle(client: AsyncClient, test_users):
    """Test creating, filtering, fetching, updating, publishing, and archiving a vehicle."""
    provider = test_users["provider"]
    headers = provider["headers"]

    # 1. Create Vehicle
    create_payload = {
        "brand": "Mercedes-Benz",
        "model": "C300 4MATIC",
        "year": 2024,
        "category": "Sedan",
        "image": "https://images.unsplash.com/photo-1617788138017-80ad40651399?q=80&w=800",
        "price_per_day": 85.0,
        "weekly_price": 520.0,
        "security_deposit": 200.0,
        "seats": 5,
        "doors": 4,
        "transmission": "Automatic",
        "fuel": "Petrol",
        "location": "Airport Terminal 1",
        "features": ["Sunroof", "Leather", "Navigation"],
        "description": "Premium luxury executive sedan.",
    }
    res_create = await client.post("/api/v1/vehicles", headers=headers, json=create_payload)
    assert res_create.status_code == 201
    veh_data = res_create.json()
    veh_id = veh_data["id"]
    assert veh_data["brand"] == "Mercedes-Benz"

    # 2. List & Filter Vehicles
    res_list = await client.get("/api/v1/vehicles?category=Sedan&min_price=50")
    assert res_list.status_code == 200
    vehicles = res_list.json()
    assert len(vehicles) >= 1
    assert any(v["id"] == veh_id for v in vehicles)

    # 3. Get Vehicle by ID
    res_get = await client.get(f"/api/v1/vehicles/{veh_id}")
    assert res_get.status_code == 200
    assert res_get.json()["id"] == veh_id

    # 4. Update Vehicle
    res_update = await client.patch(
        f"/api/v1/vehicles/{veh_id}",
        headers=headers,
        json={"price_per_day": 90.0, "mileage": 5000},
    )
    assert res_update.status_code == 200
    assert res_update.json()["price_per_day"] == 90.0

    # 5. Category Summaries
    res_cats = await client.get("/api/v1/vehicles/categories")
    assert res_cats.status_code == 200
    assert len(res_cats.json()) >= 1

    # 6. Fleet Stats
    res_stats = await client.get("/api/v1/vehicles/stats", headers=headers)
    assert res_stats.status_code == 200
    assert res_stats.json()["total_vehicles"] >= 1

    # 7. Unpublish & Publish
    res_unpub = await client.post(f"/api/v1/vehicles/{veh_id}/unpublish", headers=headers)
    assert res_unpub.status_code == 200
    assert res_unpub.json()["is_published"] is False

    res_pub = await client.post(f"/api/v1/vehicles/{veh_id}/publish", headers=headers)
    assert res_pub.status_code == 200
    assert res_pub.json()["is_published"] is True

    # 8. Archive Vehicle
    res_del = await client.delete(f"/api/v1/vehicles/{veh_id}", headers=headers)
    assert res_del.status_code == 200
    assert "archived" in res_del.json()["message"]
