"""
Tests for Bookings pricing calculations, reservations, pickup check-in, returns, and invoices.
"""

import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_booking_workflow(client: AsyncClient, test_users):
    """Test full booking lifecycle: price calculation, creation, pickup, return checkout, and invoice generation."""
    provider = test_users["provider"]
    customer = test_users["customer"]

    # 1. Create a Vehicle first
    veh_payload = {
        "brand": "Audi",
        "model": "A4 Quattro",
        "year": 2024,
        "category": "Sedan",
        "image": "https://images.unsplash.com/photo-1606016159991-dfe4f2746ad5?q=80&w=800",
        "price_per_day": 75.0,
        "security_deposit": 150.0,
        "seats": 5,
        "doors": 4,
        "transmission": "Automatic",
        "fuel": "Petrol",
        "location": "Downtown Hub",
    }
    res_veh = await client.post("/api/v1/vehicles", headers=provider["headers"], json=veh_payload)
    assert res_veh.status_code == 201
    veh_id = res_veh.json()["id"]

    # 2. Calculate Pricing Breakdown
    res_calc = await client.post(
        "/api/v1/bookings/calculate-pricing",
        json={"vehicle_id": veh_id, "rental_days": 3},
    )
    assert res_calc.status_code == 200
    calc_data = res_calc.json()
    assert calc_data["subtotal"] == 225.0
    assert calc_data["serviceFee"] == 22.5
    assert calc_data["taxes"] == 11.25
    assert calc_data["securityDeposit"] == 150.0
    assert calc_data["total"] == 408.75

    # 3. Create Booking
    book_payload = {
        "vehicle_id": veh_id,
        "pickup_date": "2026-10-01",
        "pickup_time": "10:00 AM",
        "return_date": "2026-10-04",
        "return_time": "10:00 AM",
        "rental_days": 3,
        "pickup_location": "Downtown Hub",
        "return_location": "Downtown Hub",
        "customer_details": {
            "fullName": "Customer Test",
            "phone": "+1 555 1234",
            "email": "customer_test@test.com",
            "licenseNumber": "DL-TEST-9988",
        },
        "payment_method": "Card",
    }
    res_book = await client.post("/api/v1/bookings", headers=customer["headers"], json=book_payload)
    assert res_book.status_code == 201
    book_data = res_book.json()
    book_id = book_data["id"]
    pickup_code = book_data["pickup_code"]
    assert len(pickup_code) == 4
    assert book_data["status"] == "Confirmed"

    # 4. Check-in & Pickup
    res_pickup = await client.post(
        f"/api/v1/bookings/{book_id}/pickup",
        headers=provider["headers"],
        json={"pickup_code": pickup_code, "pickup_mileage": 15000},
    )
    assert res_pickup.status_code == 200
    assert res_pickup.json()["status"] == "Active"

    # 5. Process Return & Auto-generate Invoice
    return_payload = {
        "dropoff_mileage": 15450,
        "dropoff_fuel": 95,
        "late_hours": 0,
        "damage_charges": 0.0,
    }
    res_ret = await client.post(
        f"/api/v1/bookings/{book_id}/return",
        headers=provider["headers"],
        json=return_payload,
    )
    assert res_ret.status_code == 200
    inv_data = res_ret.json()
    assert inv_data["booking_id"] == book_id
    assert inv_data["final_amount"] > 0
    assert inv_data["deposit_refund"] == 150.0

    # 6. Fetch Final Invoice
    res_inv = await client.get(f"/api/v1/bookings/{book_id}/invoice", headers=customer["headers"])
    assert res_inv.status_code == 200
    assert res_inv.json()["invoice_number"] == inv_data["invoice_number"]

    # 7. Revenue Metrics
    res_rev = await client.get("/api/v1/bookings/revenue/metrics", headers=provider["headers"])
    assert res_rev.status_code == 200
    assert res_rev.json()["total_revenue"] >= 0
