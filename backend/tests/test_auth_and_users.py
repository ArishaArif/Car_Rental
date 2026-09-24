"""
Tests for Authentication & User profile management endpoints.
"""

import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_health_and_root(client: AsyncClient):
    """Test /health and / root endpoints."""
    res_health = await client.get("/health")
    assert res_health.status_code == 200
    assert res_health.json()["status"] == "healthy"

    res_root = await client.get("/")
    assert res_root.status_code == 200
    assert "docs" in res_root.json()


@pytest.mark.asyncio
async def test_register_and_login_flow(client: AsyncClient):
    """Test user registration, login failure before verify, and profile retrieval."""
    reg_payload = {
        "full_name": "Test Driver",
        "email": "driver_new@test.com",
        "password": "SecurePassword@123",
        "role": "Customer",
        "phone_number": "+1 (555) 123-4567",
    }
    res_reg = await client.post("/api/v1/auth/register", json=reg_payload)
    assert res_reg.status_code == 201
    assert "Registration successful" in res_reg.json()["message"]

    # Attempt login without email verification (should return 403)
    login_payload = {
        "email": "driver_new@test.com",
        "password": "SecurePassword@123",
    }
    res_login = await client.post("/api/v1/auth/login", json=login_payload)
    assert res_login.status_code == 403
    assert "Email not verified" in res_login.json()["detail"]


@pytest.mark.asyncio
async def test_user_profile_endpoints(client: AsyncClient, test_users):
    """Test GET/PATCH /api/v1/users/me, onboarding setup, and preferences."""
    customer = test_users["customer"]
    headers = customer["headers"]

    # 1. Get Profile
    res_me = await client.get("/api/v1/users/me", headers=headers)
    assert res_me.status_code == 200
    data = res_me.json()
    assert data["email"] == "customer_test@test.com"
    assert data["role"] == "Customer"

    # 2. Update Profile
    update_payload = {
        "city": "Austin, TX",
        "phone_number": "+1 (555) 999-0000",
    }
    res_update = await client.patch("/api/v1/users/me", headers=headers, json=update_payload)
    assert res_update.status_code == 200
    assert res_update.json()["city"] == "Austin, TX"

    # 3. Complete Profile Setup (Onboarding)
    setup_payload = {
        "license_number": "DL-TX-2026-8888",
        "license_expiry": "2029-05-15",
        "city": "Austin, TX",
    }
    res_setup = await client.post("/api/v1/users/profile-setup", headers=headers, json=setup_payload)
    assert res_setup.status_code == 200
    assert res_setup.json()["is_profile_complete"] is True
    assert res_setup.json()["license_number"] == "DL-TX-2026-8888"

    # 4. Update Preferences
    prefs_payload = {
        "language": "Urdu",
        "preferred_category": "SUV",
        "currency": "PKR",
    }
    res_prefs = await client.put("/api/v1/users/preferences", headers=headers, json=prefs_payload)
    assert res_prefs.status_code == 200
    assert res_prefs.json()["preferences"]["currency"] == "PKR"

    # 5. Get User by ID
    user_id = customer["user"].id
    res_by_id = await client.get(f"/api/v1/users/{user_id}", headers=headers)
    assert res_by_id.status_code == 200
    assert res_by_id.json()["id"] == str(user_id)
