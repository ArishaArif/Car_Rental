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
from app.routers import auth, users


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
        "description": (
            "All authentication endpoints — email/password registration, OTP verification, "
            "login, Google OAuth2, token refresh, logout, and password reset. "
            "No `Authorization` header required unless noted."
        ),
    },
    {
        "name": "Users",
        "description": (
            "Authenticated user profile endpoints. "
            "Requires a valid **Bearer** access token in the `Authorization` header."
        ),
    },
    {
        "name": "Health",
        "description": "Service health and readiness check. No authentication required.",
    },
    {
        "name": "Root",
        "description": "API root — version and links.",
    },
]


# ── App ───────────────────────────────────────────────────────────────────────
# Security scheme: adds the 🔒 Authorize button in Swagger UI
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
    title="Car Rental API",
    version=settings.APP_VERSION,
    summary="Authentication & User management for the Car Rental mobile platform.",
    description="""
## Overview

REST API powering the **Car Rental** React Native mobile application.
Supports **Customer**, **Provider**, **Fleet Manager**, and **Admin** roles.

---

## Authentication Methods

| Method | How it works |
|---|---|
| 📧 **Email + Password** | Register → verify OTP → login → JWT |
| 🔑 **Google OAuth2** | Send `id_token` from Google Sign-In SDK → JWT |
| 🔄 **Token Refresh** | Exchange refresh token for new access token |
| 🔒 **Logout** | Refresh token is blacklisted in the database |

---

## Token Usage

After login, you receive two tokens:

```
{
  "access_token":  "eyJ...",   // Use in Authorization header · expires 30 min
  "refresh_token": "eyJ...",   // Store securely · expires 7 days
  "token_type":    "bearer",
  "expires_in":    1800
}
```

Include the access token on every protected request:
```
Authorization: Bearer <access_token>
```

Use the **Authorize 🔒** button at the top of this page to set your token.

---

## Email Registration Flow

```
POST /api/v1/auth/register        → account created (unverified) + OTP emailed
POST /api/v1/auth/verify-otp      → account activated
POST /api/v1/auth/login           → { access_token, refresh_token }
```

## Google OAuth Flow

```
(mobile) Google Sign-In → id_token
POST /api/v1/auth/google { id_token }  → { access_token, refresh_token }
```

## Password Reset Flow

```
POST /api/v1/auth/forgot-password  → OTP emailed
POST /api/v1/auth/reset-password   → password updated
```

---

## Error Format

All errors follow a consistent shape:

```json
{
  "detail": "Human-readable error message"
}
```

Common HTTP status codes:

| Code | Meaning |
|---|---|
| `400` | Bad request / validation error |
| `401` | Invalid or expired token |
| `403` | Forbidden (account inactive / unverified) |
| `404` | Resource not found |
| `409` | Conflict (e.g. email already registered) |
| `422` | Request body validation failed |
| `500` | Internal server error |
    """,
    contact={
        "name": "Car Rental Team",
        "url": "https://github.com/ArishaArif/Car_Rental",
    },
    license_info={
        "name": "MIT",
    },
    openapi_tags=tags_metadata,
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
    lifespan=lifespan,
)



# ── CORS ──────────────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.FRONTEND_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


from app.routers import auth, users, vehicles, bookings, fleet, subscriptions, pricing, ai


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
