<div align="center">

<img src="https://img.shields.io/badge/FastAPI-0.115.6-009688?style=for-the-badge&logo=fastapi&logoColor=white"/>
<img src="https://img.shields.io/badge/Python-3.12-3776AB?style=for-the-badge&logo=python&logoColor=white"/>
<img src="https://img.shields.io/badge/PostgreSQL-asyncpg-336791?style=for-the-badge&logo=postgresql&logoColor=white"/>
<img src="https://img.shields.io/badge/JWT-Auth-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white"/>
<img src="https://img.shields.io/badge/Google_OAuth2-4285F4?style=for-the-badge&logo=google&logoColor=white"/>
<img src="https://img.shields.io/badge/Resend-Email-000000?style=for-the-badge"/>

# 🚗 Car Rental & Fleet Management — Backend REST API

**Enterprise-grade, async FastAPI backend powering the Car Rental & Fleet Management application across Customer, Provider, Fleet Manager, and Admin roles.**

[API Docs](http://localhost:8000/docs) · [ReDoc](http://localhost:8000/redoc) · [Health Check](http://localhost:8000/health)

</div>

---

## Overview

This is the central backend REST API for the **Car Rental & Fleet Management System**. Built on modern asynchronous Python (FastAPI, SQLAlchemy 2.0 async, asyncpg, Pydantic v2), it delivers scalable and secure APIs for vehicle discovery, live pricing calculations, digital pickup check-in, return inspection checkout, automated invoicing, fleet maintenance, provider SaaS subscriptions, AI damage detection, dynamic smart pricing, and administrative operations.

---

## ✨ System Architecture & Modules

| Module | Purpose | Key Endpoints |
|---|---|---|
| 🔐 **Auth & Security** | Email OTP, Google OAuth2, JWT Refresh rotation, password recovery | `/api/v1/auth/*` |
| 👤 **Users & Profiles** | Role profiles (Customer, Provider, Fleet Manager), onboarding setup, preferences | `/api/v1/users/*` |
| 🚗 **Vehicles Engine** | Multi-faceted filter/search, category aggregations, fleet statistics | `/api/v1/vehicles/*` |
| 📑 **Bookings & Invoices** | Price estimator, reservations, pickup codes, return settlement & invoices | `/api/v1/bookings/*` |
| 🛠️ **Fleet Operations** | Maintenance logs, safety inspections, damage reports, operational tasks | `/api/v1/fleet/*` |
| 💼 **Provider Subscriptions** | SaaS host tiers (Starter, Professional, Business), usage quotas, billing history | `/api/v1/subscriptions/*` |
| 📈 **Smart Pricing** | AI dynamic demand surge, weekend/seasonal multipliers, rate recommendations | `/api/v1/pricing/*` |
| 🤖 **AI & Damage Inspection** | Computer vision damage detection, photo templates, vehicle recommendations | `/api/v1/ai/*` |
| 🛡️ **System Admin** | Platform KPIs, user directories, document verifications, disputes & system config | `/api/v1/admin/*` |
| 🔔 **Notifications** | Real-time app notifications, role broadcasts, read receipts | `/api/v1/notifications/*` |

---

## 📂 Project Structure

```
backend/
├── app/
│   ├── main.py              # FastAPI app · CORS · lifespan · OpenAPI schemas · routers
│   ├── config.py            # pydantic-settings (environment variable validation)
│   ├── database.py          # Async PostgreSQL engine · session · table creation
│   ├── seed.py              # Initial dataset seeder (test users, fleet, mock bookings)
│   │
│   ├── models/              # SQLAlchemy 2.0 ORM Models
│   │   ├── user.py          # User, Roles, VerificationStatus, Preferences
│   │   ├── otp.py           # Email verification & password reset OTPs
│   │   ├── token_blacklist.py # Blacklisted JWT refresh tokens
│   │   ├── vehicle.py       # Vehicle catalog, specs, pricing, availability
│   │   ├── booking.py       # Booking reservations, pricing breakdown, Invoices
│   │   ├── fleet.py         # Maintenance, Inspections, Damage Reports, Tasks
│   │   ├── subscription.py  # Provider SaaS Subscriptions, Billing Invoices
│   │   ├── admin.py         # Verifications, Payment audits, Disputes, SystemConfig
│   │   └── notification.py  # App Notifications
│   │
│   ├── schemas/             # Strict Pydantic v2 Request/Response validation
│   │   ├── auth.py          # Register, Login, OTP, Google OAuth2, Reset
│   │   ├── user.py          # User profile, setup request, preferences
│   │   ├── vehicle.py       # Vehicle CRUD, category summaries, fleet stats
│   │   ├── booking.py       # Price estimation, booking responses, invoices
│   │   ├── fleet.py         # Maintenance, Inspections, Damages, Tasks
│   │   ├── subscription.py  # Plans, subscription responses, upgrades, invoices
│   │   ├── ai.py            # Smart pricing metrics, damage analysis, recommendations
│   │   ├── admin.py         # KPIs, verification reviews, disputes, config
│   │   └── notification.py  # Notification responses
│   │
│   ├── routers/             # FastAPI Route Handlers (60 REST endpoints)
│   │   ├── auth.py          # Authentication router
│   │   ├── users.py         # User & profile router
│   │   ├── vehicles.py      # Vehicle catalog router
│   │   ├── bookings.py      # Bookings & invoicing router
│   │   ├── fleet.py         # Fleet maintenance & inspections router
│   │   ├── subscriptions.py # Provider SaaS subscriptions router
│   │   ├── pricing.py       # Smart yield pricing router
│   │   ├── ai.py            # AI damage analysis & recommend router
│   │   ├── admin.py         # System administration router
│   │   └── notifications.py # Notification center router
│   │
│   ├── services/            # Pure business logic layer
│   │   ├── auth_service.py
│   │   ├── otp_service.py
│   │   ├── email_service.py
│   │   ├── google_service.py
│   │   ├── vehicle_service.py
│   │   ├── booking_service.py
│   │   ├── fleet_service.py
│   │   ├── subscription_service.py
│   │   ├── ai_service.py
│   │   ├── admin_service.py
│   │   └── notification_service.py
│   │
│   └── utils/               # Cryptography, JWT, and Auth Dependencies
│       ├── jwt.py
│       ├── hashing.py
│       └── dependencies.py  # get_current_user, get_current_admin
│
├── requirements.txt
├── run.py                   # Development server entry point
└── .env.example             # Template for configuration
```

---

## 🚀 Getting Started

### 1 — Environment Configuration

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Configure your PostgreSQL connection and API keys:

```env
DATABASE_URL=postgresql+asyncpg://postgres:postgres@localhost:5432/car_rental_db
JWT_SECRET_KEY=your-32-character-access-secret
JWT_REFRESH_SECRET_KEY=your-32-character-refresh-secret
GOOGLE_CLIENT_ID=your-google-oauth-client-id.apps.googleusercontent.com
RESEND_API_KEY=re_your_api_key
```

### 2 — Initialize & Seed Database

```bash
# Seed initial test accounts, vehicles, bookings, and fleet maintenance
python -m app.seed
```

### 3 — Run Development Server

```bash
python run.py
```

Server starts at: `http://localhost:8000`  
Swagger UI Interactive Documentation: `http://localhost:8000/docs`

---

## 🔑 Seed Test Accounts

| Role | Email | Password |
|---|---|---|
| **Admin** | `admin@carrental.com` | `Admin@123456` |
| **Provider** | `provider@fleetowner.com` | `Provider@123456` |
| **Fleet Manager** | `fleet@operations.com` | `Fleet@123456` |
| **Customer** | `customer@carrental.com` | `Customer@123456` |
