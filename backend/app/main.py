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


import secrets
from fastapi.security import HTTPBasic, HTTPBasicCredentials
from fastapi.openapi.docs import get_swagger_ui_html, get_redoc_html
from fastapi import Depends, HTTPException, status

security = HTTPBasic()


def authenticate_docs(credentials: HTTPBasicCredentials = Depends(security)) -> str:
    """Protect interactive documentation with HTTP Basic Authentication."""
    is_correct_username = secrets.compare_digest(credentials.username, "admin")
    is_correct_password = secrets.compare_digest(credentials.password, "admin123")
    if not (is_correct_username and is_correct_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Basic"},
        )
    return credentials.username


app = FastAPI(
    title="Car Rental & Fleet Management API",
    version=settings.APP_VERSION,
    summary="Production-grade REST API powering the Car Rental platform across Customer, Provider, Fleet Manager, and Admin roles.",
    description="""
## Overview

Asynchronous REST API engine powering the Car Rental & Fleet Management platform.
Engineered with Python 3.12, FastAPI, SQLAlchemy 2.0 (async), and PostgreSQL.

---

## Core Capabilities

1. **Enterprise Authentication**: Email/password with OTP verification, Google OAuth2, and JWT dual-token rotation with server-side blacklist revocation.
2. **Vehicle Catalog & Search**: Multi-faceted filter engine (transmission, fuel, seats, price, location) with category aggregations and fleet telemetry.
3. **Bookings & Automated Invoicing**: Real-time rate estimation (platform fee, tax, security deposit), 4-digit digital pickup check-in, and return checkout settlement.
4. **Fleet Operations**: Preventative maintenance scheduling, routine safety inspections, damage reports, and depot operational tasks.
5. **Provider SaaS Subscriptions**: Multi-tiered host plans with real-time usage quotas and billing payment history.
6. **Smart Dynamic Pricing**: Algorithmic demand surge indexing, weekend multipliers, and yield recommendations.
7. **Computer Vision Damage Assessment**: Multi-angle image damage detection and estimated repair quotes.
8. **System Administration**: Platform KPIs, user directories, driver verification queues, financial payouts, and system configurations.
9. **Notification Center**: User notification feed with read-status management and broadcast alerts.
""",
    lifespan=lifespan,
    docs_url=None,
    redoc_url=None,
    openapi_url=None,
)

# ── Protected Documentation Endpoints ─────────────────────────────────────────
@app.get("/docs", include_in_schema=False)
async def get_swagger_documentation(_: str = Depends(authenticate_docs)):
    return get_swagger_ui_html(openapi_url="/openapi.json", title=f"{app.title} - Swagger UI")


@app.get("/redoc", include_in_schema=False)
async def get_redoc_documentation(_: str = Depends(authenticate_docs)):
    return get_redoc_html(openapi_url="/openapi.json", title=f"{app.title} - ReDoc")


@app.get("/openapi.json", include_in_schema=False)
async def get_open_api_endpoint(_: str = Depends(authenticate_docs)):
    return JSONResponse(content=custom_openapi())


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
