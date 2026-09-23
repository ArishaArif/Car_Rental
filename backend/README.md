<div align="center">

# 🚗 Car Rental & Fleet Management System
### Enterprise Asynchronous REST API Engine

[![FastAPI](https://img.shields.io/badge/FastAPI-0.115.6-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![Python](https://img.shields.io/badge/Python-3.12-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://www.python.org)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Asyncpg-336791?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org)
[![SQLAlchemy 2.0](https://img.shields.io/badge/SQLAlchemy-2.0_Async-D71F00?style=for-the-badge&logo=sqlalchemy&logoColor=white)](https://www.sqlalchemy.org)
[![Tests](https://img.shields.io/badge/Pytest-100%25_Passing-brightgreen?style=for-the-badge&logo=pytest&logoColor=white)](https://docs.pytest.org)
[![JWT Auth](https://img.shields.io/badge/JWT-Rotation_%26_Blacklist-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white)](https://jwt.io)
[![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)](LICENSE)

<br/>

**A production-ready, asynchronous backend API built with FastAPI, SQLAlchemy 2.0, and Asyncpg, powering multi-role Car Rental & Fleet Operations across Customers, Providers, Fleet Managers, and Platform Admins.**

[Features](#-key-features) • [Architecture](#-system-architecture) • [API Reference](#-rest-api-endpoints-60-endpoints) • [Automated Tests](#-automated-testing-suite) • [Live Deployment](#-cloud-deployment-guide) • [Quickstart](#-quickstart-guide)

</div>

---

## 🌟 Key Features

- 🔐 **Enterprise Authentication**: Argon2/Bcrypt password hashing, dual-token JWT lifecycle (access + refresh rotation), token revocation blacklist on logout, 6-digit email OTP verification, and Google OAuth2 integration.
- 👥 **Multi-Role Access Control**: Granular RBAC supporting `Customer`, `Provider` (Host), `FleetManager`, and `Admin` permissions.
- 🚘 **Vehicle Catalog & Multi-Filter Search**: Category aggregations, dynamic search filtering (transmission, fuel, seats, price range, city, dates), and fleet availability states (`Available`, `Rented`, `Maintenance`, `Reserved`).
- 📑 **Booking & Invoicing Engine**: Real-time pricing calculations (10% platform fee, 5% tax, deposits), 4-digit digital pickup check-in codes, odometer & fuel dropoff settlements, and automated itemized `BookingInvoice` generation.
- 🛠️ **Fleet Operations Management**: Preventative maintenance scheduling, vehicle safety inspection checklists (pre-trip / post-return), damage incident logs, and depot operational tasks.
- 💼 **Provider SaaS Subscriptions**: Multi-tiered host plans (`Starter $49`, `Professional $149`, `Business $349`), real-time vehicle & booking quota telemetry, and subscription billing history.
- 📈 **Smart Yield Dynamic Pricing**: Demand surge index calculations, weekend multiplier, fleet utilization rates, and automated price recommendation engine.
- 🤖 **AI Damage Inspection**: Computer vision photo analysis detecting exterior scratches, dents, estimated repair quotes, and 6-point guided vehicle photo capture templates.
- 🛡️ **Comprehensive Admin Center**: Platform-wide KPI dashboards, user directories, host verifications, payout audits, dispute mediation, and system configuration controls.
- 🔔 **Notification Center**: User notification feed with mark-as-read states and role-targeted broadcast alerts.

---

## 🏛️ System Architecture

```text
├── app/
│   ├── config.py              # Pydantic Settings with env parsing & local defaults
│   ├── database.py            # Async engine, sessionmaker, and cross-engine base
│   ├── main.py                # FastAPI app initialization, CORS, global error handlers
│   ├── seed.py                # Comprehensive database seeder with demo dataset
│   │
│   ├── models/                # SQLAlchemy 2.0 Async ORM Models
│   │   ├── admin.py           # KPIs, payouts, dispute logs, system configurations
│   │   ├── booking.py         # Bookings, pricing rules, invoices
│   │   ├── fleet.py           # Maintenance, safety inspections, damage reports, depot tasks
│   │   ├── notification.py    # In-app notifications
│   │   ├── otp.py             # 6-digit verification codes
│   │   ├── subscription.py    # SaaS plans, quota telemetry, billing records
│   │   ├── token_blacklist.py # Blacklisted revoked refresh tokens
│   │   ├── user.py            # Users, roles, KYC verifications, customer preferences
│   │   └── vehicle.py         # Vehicles, categories, pricing, specs
│   │
│   ├── routers/               # 60 REST API Endpoint Controllers (12 Swagger Tags)
│   ├── schemas/               # Pydantic v2 validation & serialization schemas
│   ├── services/              # Clean Business Logic & Domain Service Layer
│   └── utils/                 # Cryptography, JWT handlers, and Auth dependencies
│
├── tests/                     # 100% Passing Automated Pytest Suite
│   ├── conftest.py            # Async in-memory SQLite fixtures & auth clients
│   └── test_*.py              # 8 domain test suites
│
├── .env.example               # Environment variables template
├── pytest.ini                 # Pytest async runner configuration
├── requirements.txt           # Production dependencies
└── run.py                     # Local development runner
```

---

## 📡 REST API Endpoints (60 Endpoints)

<details open>
<summary><b>1. Authentication & Security (<code>/api/v1/auth</code>)</b></summary>

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/v1/auth/register` | Register new user account with role selection |
| `POST` | `/api/v1/auth/login` | Authenticate user & issue access + refresh JWT |
| `POST` | `/api/v1/auth/refresh` | Refresh access token using valid refresh token |
| `POST` | `/api/v1/auth/logout` | Revoke & blacklist refresh token |
| `POST` | `/api/v1/auth/google` | Google OAuth2 ID token authentication |
| `POST` | `/api/v1/auth/verify-otp` | Verify 6-digit email OTP |
| `POST` | `/api/v1/auth/resend-otp` | Request new OTP verification code |
| `POST` | `/api/v1/auth/forgot-password` | Initiate password recovery via email |
| `POST` | `/api/v1/auth/reset-password` | Reset password using verified OTP |

</details>

<details>
<summary><b>2. Users & Profiles (<code>/api/v1/users</code>)</b></summary>

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/v1/users/me` | Retrieve authenticated user profile |
| `PATCH` | `/api/v1/users/me` | Update authenticated user details |
| `POST` | `/api/v1/users/profile-setup` | Complete onboarding KYC & profile setup |
| `PUT` | `/api/v1/users/preferences` | Update customer currency, language, notification preferences |
| `GET` | `/api/v1/users/{user_id}` | Public profile lookup |

</details>

<details>
<summary><b>3. Vehicle Catalog & Fleet Discovery (<code>/api/v1/vehicles</code>)</b></summary>

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/v1/vehicles` | Search & filter vehicles by price, seats, fuel, category, city |
| `GET` | `/api/v1/vehicles/categories` | Aggregated category summaries with icons & metrics |
| `GET` | `/api/v1/vehicles/stats` | Provider & Fleet status metrics (Available, Rented, Maintenance) |
| `GET` | `/api/v1/vehicles/{vehicle_id}` | Detailed vehicle specifications & rental policies |
| `POST` | `/api/v1/vehicles` | Add new vehicle to fleet |
| `PATCH` | `/api/v1/vehicles/{vehicle_id}` | Update vehicle listing details |
| `POST` | `/api/v1/vehicles/{vehicle_id}/publish` | Publish vehicle to public catalog |
| `POST` | `/api/v1/vehicles/{vehicle_id}/unpublish` | Delist vehicle from public search |
| `DELETE` | `/api/v1/vehicles/{vehicle_id}` | Archive / delete vehicle unit |

</details>

<details>
<summary><b>4. Bookings & Invoicing (<code>/api/v1/bookings</code>)</b></summary>

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/v1/bookings/calculate-pricing` | Real-time pricing breakdown with taxes & platform fee |
| `POST` | `/api/v1/bookings` | Create reservation & generate 4-digit pickup code |
| `GET` | `/api/v1/bookings` | List user bookings by role and status |
| `GET` | `/api/v1/bookings/{id}` | Booking details & status timeline |
| `POST` | `/api/v1/bookings/{id}/confirm` | Provider confirmation of reservation |
| `POST` | `/api/v1/bookings/{id}/cancel` | Cancel booking & release vehicle |
| `POST` | `/api/v1/bookings/{id}/pickup` | Validate pickup code & start rental |
| `POST` | `/api/v1/bookings/{id}/return` | Record dropoff odometer/fuel & settle charges |
| `GET` | `/api/v1/bookings/{id}/invoice` | Retrieve itemized digital invoice receipt |
| `GET` | `/api/v1/bookings/revenue/metrics` | Host revenue KPIs, top vehicles, utilization rates |

</details>

<details>
<summary><b>5. Fleet Operations (<code>/api/v1/fleet</code>)</b></summary>

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/v1/fleet/maintenance` | List maintenance service logs |
| `POST` | `/api/v1/fleet/maintenance` | Schedule service & set vehicle to Maintenance |
| `PATCH` | `/api/v1/fleet/maintenance/{id}` | Complete maintenance service & release vehicle |
| `GET` | `/api/v1/fleet/inspections` | Inspection checklists & safety logs |
| `POST` | `/api/v1/fleet/inspections` | Record pre-trip or post-return inspection |
| `GET` | `/api/v1/fleet/damages` | Damage incident reports |
| `POST` | `/api/v1/fleet/damages` | File new vehicle damage report |
| `PATCH` | `/api/v1/fleet/damages/{id}` | Update damage resolution status |
| `GET` | `/api/v1/fleet/tasks` | Operational depot task board |
| `POST` | `/api/v1/fleet/tasks` | Create depot operational task |
| `PATCH` | `/api/v1/fleet/tasks/{id}` | Update task status |

</details>

<details>
<summary><b>6. SaaS Subscriptions (<code>/api/v1/subscriptions</code>)</b></summary>

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/v1/subscriptions/plans` | List available provider subscription plans |
| `GET` | `/api/v1/subscriptions/current` | Active subscription & usage quota telemetry |
| `POST` | `/api/v1/subscriptions/upgrade` | Upgrade subscription tier & generate invoice |
| `GET` | `/api/v1/subscriptions/invoices` | Provider billing payment history |

</details>

<details>
<summary><b>7. Smart Pricing & AI (<code>/api/v1/pricing</code> & <code>/api/v1/ai</code>)</b></summary>

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/v1/pricing/metrics/{id}` | Vehicle demand surge multipliers & rate suggestions |
| `POST` | `/api/v1/pricing/apply-recommendation` | 1-Click apply recommended pricing |
| `POST` | `/api/v1/ai/damage-analysis` | Computer vision damage detection & repair estimate |
| `GET` | `/api/v1/ai/photo-templates` | 6-Point vehicle photography capture guide |
| `POST` | `/api/v1/ai/recommend` | Matchmaking recommendations based on budget |

</details>

<details>
<summary><b>8. Administration & Notifications (<code>/api/v1/admin</code> & <code>/api/v1/notifications</code>)</b></summary>

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/v1/admin/kpis` | Platform-wide revenue, users, fleet, dispute KPIs |
| `GET` | `/api/v1/admin/users` | Platform user directory |
| `PATCH` | `/api/v1/admin/users/{id}/status` | Activate or suspend user account |
| `GET` | `/api/v1/admin/providers` | Host provider directory with fleet stats |
| `GET` | `/api/v1/admin/verifications` | Driver license & business KYC queue |
| `POST` | `/api/v1/admin/verifications/{id}/review` | Approve or reject verification request |
| `GET` | `/api/v1/admin/payments` | Financial payout audit trails |
| `GET` | `/api/v1/admin/disputes` | Customer-Provider dispute resolution queue |
| `PATCH` | `/api/v1/admin/disputes/{id}` | Resolve dispute & issue refunds |
| `GET` | `/api/v1/admin/config` | System commission rate & category configurations |
| `PATCH` | `/api/v1/admin/config` | Update platform operational settings |
| `GET` | `/api/v1/notifications` | User notification inbox |
| `PATCH` | `/api/v1/notifications/{id}/read` | Mark individual notification as read |
| `POST` | `/api/v1/notifications/mark-all-read` | Mark all notifications as read |

</details>

---

## 🧪 Automated Testing Suite

The repository includes a comprehensive, asynchronous Pytest test suite using an in-memory SQLite database runner with zero external dependencies required for testing.

```bash
# Run full automated test suite with verbose output
pytest -v
```

### Test Coverage Breakdown:
| Test Suite | Domain Tested | Result |
|---|---|:---:|
| `test_auth_and_users.py` | Registration, login, profile setup, preferences | **PASSED** ✅ |
| `test_otp_and_password_reset.py` | OTP verification, token rotation, logout blacklist, reset password | **PASSED** ✅ |
| `test_vehicles.py` | Catalog CRUD, multi-filter search, stats, category metrics | **PASSED** ✅ |
| `test_bookings.py` | Pricing calculator, reservation lifecycle, pickup code, dropoff invoice | **PASSED** ✅ |
| `test_fleet_operations.py` | Maintenance service, safety checks, damage incident logs, depot tasks | **PASSED** ✅ |
| `test_subscriptions.py` | SaaS host tiers, quota limits, plan upgrades, billing logs | **PASSED** ✅ |
| `test_ai_and_pricing.py` | Dynamic surge multipliers, AI damage scanner, photo templates | **PASSED** ✅ |
| `test_admin_and_notifications.py` | Platform KPIs, user directory, KYC review, dispute resolution | **PASSED** ✅ |

---

## 🚀 Quickstart Guide

### 1. Clone & Setup Virtual Environment
```bash
git clone https://github.com/mzaid-dev/car-rental-system-backend.git
cd car-rental-system-backend

python -m venv venv
source venv/bin/activate    # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### 2. Configure Environment (.env)
```bash
cp .env.example .env
```
*(Out of the box, default development values are provided for local execution).*

### 3. Seed Initial Demo Dataset
```bash
python -m app.seed
```

### 4. Start Development Server
```bash
python run.py
```
- Interactive Swagger UI: **[http://localhost:8000/api/docs](http://localhost:8000/api/docs)**
- ReDoc Documentation: **[http://localhost:8000/api/redoc](http://localhost:8000/api/redoc)**

---

## 🔑 Demo Test Accounts

| Role | Email | Password |
|---|---|---|
| **Admin** | `admin@carrental.com` | `Admin@123456` |
| **Provider (Host)** | `host@carrental.com` | `Host@123456` |
| **Fleet Manager** | `fleet@operations.com` | `Fleet@123456` |
| **Customer** | `customer@carrental.com` | `Customer@123456` |

---

## ☁️ Cloud Deployment Guide

### Deploying to Render.com (Free Web Service) + Neon.tech (PostgreSQL):
1. Create a free serverless PostgreSQL database on **[Neon.tech](https://neon.tech/)**.
2. Connect your GitHub repository to **[Render.com](https://render.com/)**.
3. Create a **New Web Service**:
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
4. In Render **Environment Variables**, add:
   - `DATABASE_URL`: `postgresql+asyncpg://user:pass@ep-xyz.neon.tech/neondb?ssl=require`
   - `JWT_SECRET_KEY`: `your-random-32-character-secret`
   - `JWT_REFRESH_SECRET_KEY`: `your-random-32-character-refresh-secret`
5. Click **Deploy** — your live API and Swagger docs are ready!

---

## 📄 License
Distributed under the **MIT License**. See `LICENSE` for more information.

<div align="center">
Built with modern software engineering best practices by <b>Muhammad Zaid</b>.
</div>
