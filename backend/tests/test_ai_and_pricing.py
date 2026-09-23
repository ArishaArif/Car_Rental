"""
Tests for Smart Pricing and AI Damage Analysis / Vehicle Recommendation.
"""

import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_smart_pricing_and_ai(client: AsyncClient, test_users):
    """Test dynamic pricing evaluation, recommendation acceptance, photo templates, AI damage inspection, and AI recommendations."""
    provider = test_users["provider"]
    headers = provider["headers"]

    # 1. Create a vehicle
    res_veh = await client.post(
        "/api/v1/vehicles",
        headers=headers,
        json={
            "brand": "BMW",
            "model": "X5 xDrive40i",
            "year": 2024,
            "category": "SUV",
            "image": "https://images.unsplash.com/photo-1583121274602-3e2820c69888?q=80&w=800",
            "price_per_day": 120.0,
        },
    )
    assert res_veh.status_code == 201
    veh_id = res_veh.json()["id"]

    # 2. Get Smart Pricing Metrics
    res_metric = await client.get(f"/api/v1/pricing/metrics/{veh_id}")
    assert res_metric.status_code == 200
    metric_data = res_metric.json()
    assert metric_data["vehicle_id"] == veh_id
    assert metric_data["recommended_price"] > 0
    assert len(metric_data["factors"]) >= 1

    # 3. Apply Recommendation
    res_apply = await client.post(
        "/api/v1/pricing/apply-recommendation",
        headers=headers,
        json={"vehicle_id": veh_id, "new_price": metric_data["recommended_price"]},
    )
    assert res_apply.status_code == 200
    assert res_apply.json()["price_per_day"] == metric_data["recommended_price"]

    # 4. Get 6-Point Photo Templates
    res_temp = await client.get("/api/v1/ai/photo-templates")
    assert res_temp.status_code == 200
    templates = res_temp.json()
    assert "Front" in templates
    assert "Rear" in templates
    assert "Left" in templates
    assert "Right" in templates
    assert "Interior" in templates
    assert "Dashboard" in templates

    # 5. Run AI Damage Inspection
    analysis_payload = {
        "vehicle_id": veh_id,
        "scenario": "MinorDamage",
        "photos": [
            {"category": "Front", "uri": "https://example.com/front.jpg"},
            {"category": "Rear", "uri": "https://example.com/rear.jpg"},
        ],
    }
    res_ai = await client.post("/api/v1/ai/damage-analysis", json=analysis_payload)
    assert res_ai.status_code == 200
    ai_data = res_ai.json()
    assert ai_data["vehicle_id"] == veh_id
    assert ai_data["overall_condition"] == "Needs Minor Repair"
    assert len(ai_data["findings"]) >= 1

    # 6. AI Vehicle Recommendation
    rec_payload = {
        "body_type": "SUV",
        "max_price": 150.0,
        "top_n": 3,
    }
    res_rec = await client.post("/api/v1/ai/recommend", json=rec_payload)
    assert res_rec.status_code == 200
    assert len(res_rec.json()) >= 1
