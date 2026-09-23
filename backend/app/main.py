"""
Car Rental API — FastAPI Application Entry Point
"""

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.openapi.utils import get_openapi

from app.config import settings
from app.database import create_tables
from app.routers import (
    auth,
    users,
    vehicles,
    bookings,
    fleet,
    subscriptions,
    pricing,
    ai,
    admin,
    notifications,
)


# ── Lifespan ──────────────────────────────────────────────────────────────────
@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup and shutdown lifecycle handler."""
    # Startup
    print(f"🚀 Starting {settings.APP_NAME} v{settings.APP_VERSION}")
    await create_tables()
    print("✅ Database tables ready")
    yield
    # Shutdown
    print("👋 Shutting down...")


# ── Tags metadata ─────────────────────────────────────────────────────────────
tags_metadata = [
    {
        "name": "Authentication",
        "description": "Registration, OTP verification, Google OAuth2, JWT login/refresh, logout, and password recovery.",
    },
    {
        "name": "Users",
        "description": "Authenticated profiles, onboarding setup, and custom app preferences for Customer, Provider, and Fleet Managers.",
    },
    {
        "name": "Vehicles",
        "description": "Vehicle discovery catalog, multi-criteria filtering, category statistics, and provider inventory management.",
    },
    {
        "name": "Bookings",
        "description": "Reservation lifecycle, live pricing calculations, pickup check-in codes, return checkout, and itemized invoices.",
    },
    {
        "name": "Fleet Operations",
        "description": "Vehicle maintenance scheduling, routine inspections, damage reports, and turnaround operational tasks.",
    },
    {
        "name": "Provider Subscriptions",
        "description": "SaaS host tiers (Starter, Professional, Business), usage limits, upgrades, and billing history.",
    },
    {
        "name": "Smart Pricing",
        "description": "Dynamic demand surge engine, weekend/seasonal multipliers, and pricing yield recommendations.",
    },
    {
        "name": "AI & Computer Vision",
        "description": "Multi-photo vehicle damage detection, photo templates, and personalized car recommendations.",
    },
    {
        "name": "System Admin",
        "description": "Platform KPIs, user directories, document verifications, disputes, and system configuration.",
    },
    {
        "name": "Notifications",
        "description": "In-app alerts, role broadcasts, and read status management.",
    },
    {
        "name": "Health",
        "description": "Service health and readiness check.",
    },
    {
        "name": "Root",
        "description": "API root — version and navigation links.",
    },
]


# ── App ───────────────────────────────────────────────────────────────────────
def custom_openapi():
    if app.openapi_schema:
        return app.openapi_schema
    schema = get_openapi(
        title=app.title,
        version=app.version,
        summary=app.summary,
        description=app.description,
        routes=app.routes,
        tags=tags_metadata,
    )
    schema["components"]["securitySchemes"] = {
        "BearerAuth": {
            "type": "http",
            "scheme": "bearer",
            "bearerFormat": "JWT",
            "description": "Paste your access_token here (without the 'Bearer' prefix).",
        }
    }
    app.openapi_schema = schema
    return schema


app = FastAPI(
    title="Car Rental & Fleet Management API",
    version=settings.APP_VERSION,
    summary="Complete REST API powering the Car Rental mobile application across Customer, Provider, Fleet Manager, and Admin roles.",
    description="""
## Overview

REST API powering the **Car Rental & Fleet Management System** mobile application.
Supports **Customer**, **Provider**, **Fleet Manager**, and **Admin** personas.

---

## Core Capabilities

1. 🔐 **Enterprise Auth**: Email/password + OTP, Google OAuth2, JWT Refresh rotation.
2. 🚗 **Vehicle Engine**: Multi-faceted filter/search, category aggregations, fleet statistics.
3. 📑 **Bookings & Invoices**: Real-time rate estimation, 4-digit pickup check-in, return inspection checkout, and itemized billing invoices.
4. 🛠️ **Fleet Operations**: Maintenance logs, digital safety inspections, damage reports, and turnaround task assignment.
5. 💼 **Provider SaaS Subscriptions**: Multi-tier host subscriptions with usage quotas and automated billing history.
6. 📈 **Smart Dynamic Pricing**: AI demand surge, fleet utilization indexing, and rate yield recommendations.
7. 🤖 **AI Damage Inspection**: Computer vision photo analysis detecting scratches, dents, and estimated repair costs.
8. 🛡️ **System Admin & Verifications**: Document review queue, financial payouts, dispute resolution, and system config.
9. 🔔 **Notifications**: Real-time app notifications and read receipts.
""",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
)

# ── CORS Middleware ───────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.FRONTEND_ORIGINS if not settings.DEBUG else ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)



# ── Routers ───────────────────────────────────────────────────────────────────
API_PREFIX = "/api/v1"

app.include_router(auth.router, prefix=API_PREFIX)
app.include_router(users.router, prefix=API_PREFIX)
app.include_router(vehicles.router, prefix=API_PREFIX)
app.include_router(bookings.router, prefix=API_PREFIX)
app.include_router(fleet.router, prefix=API_PREFIX)
app.include_router(subscriptions.router, prefix=API_PREFIX)
app.include_router(pricing.router, prefix=API_PREFIX)
app.include_router(ai.router, prefix=API_PREFIX)
app.include_router(admin.router, prefix=API_PREFIX)
app.include_router(notifications.router, prefix=API_PREFIX)


# ── Bind custom OpenAPI ───────────────────────────────────────────────────────
app.openapi = custom_openapi


# ── Health Check ──────────────────────────────────────────────────────────────
@app.get("/health", tags=["Health"], summary="Health check")
async def health_check():
    return JSONResponse(
        content={
            "status": "healthy",
            "app": settings.APP_NAME,
            "version": settings.APP_VERSION,
        }
    )


@app.get("/", tags=["Root"], summary="API root")
async def root():
    return JSONResponse(
        content={
            "message": f"Welcome to {settings.APP_NAME}",
            "version": settings.APP_VERSION,
            "docs": "/docs",
            "health": "/health",
        }
    )
