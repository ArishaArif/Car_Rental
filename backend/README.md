# Car Rental & Fleet Management System — Backend REST API

A scalable, asynchronous REST API engine designed for car rental marketplaces and fleet operations. Built with Python 3.12, FastAPI, SQLAlchemy 2.0 (async), and PostgreSQL.

[![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688?style=flat-square&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![Python](https://img.shields.io/badge/Python-3.12-3776AB?style=flat-square&logo=python&logoColor=white)](https://python.org)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16%2B-336791?style=flat-square&logo=postgresql&logoColor=white)](https://www.postgresql.org)
[![SQLAlchemy](https://img.shields.io/badge/SQLAlchemy-2.0_Async-D71F00?style=flat-square&logo=sqlalchemy&logoColor=white)](https://docs.sqlalchemy.org)
[![Pytest](https://img.shields.io/badge/Tests-100%25_Passing-4CAF50?style=flat-square&logo=pytest&logoColor=white)](https://docs.pytest.org)
[![License](https://img.shields.io/badge/License-MIT-gray?style=flat-square)](LICENSE)

---

## Core Capabilities

- **Multi-Role RBAC**: Distinct permission scopes for `Customer`, `Provider` (Host), `FleetManager`, and `Admin`.
- **Dual-Token JWT Security**: Access and refresh token rotation with server-side database blacklist revocation on logout.
- **Booking & Invoicing Lifecycle**: Real-time tax & deposit price calculations, 4-digit digital pickup codes, drop-off settlement, and automated invoices.
- **Fleet Operations**: Preventative maintenance scheduling, safety inspection checklists, and damage incident reporting.
- **Provider SaaS Subscriptions**: Multi-tiered host plans (`Starter`, `Professional`, `Business`) with live quota usage telemetry.
- **Smart Yield Pricing**: Dynamic demand surge multipliers based on utilization rates and seasonal trends.
- **AI Damage Inspection**: Computer vision photo analysis detecting exterior scratches, dents, and repair estimates.

---

## Architecture

The project follows a clean layered domain architecture:

```
app/
├── models/         # SQLAlchemy 2.0 async ORM entities
├── schemas/        # Pydantic v2 request/response contracts
├── routers/        # FastAPI route controllers (60 endpoints across 12 tags)
├── services/       # Domain business logic & operations
├── utils/          # JWT handlers, hashing, auth dependencies
├── config.py       # Configuration & environment settings
├── database.py     # Async database connection & sessions
├── main.py         # Application entrypoint & CORS middleware
└── seed.py         # Initial demo dataset seeder
```

---

## API Endpoints (60 Endpoints)

<details>
<summary><b>1. Authentication & Security (<code>/api/v1/auth</code>)</b></summary>

- `POST /api/v1/auth/register` — Register new user account
- `POST /api/v1/auth/login` — Authenticate and issue JWT tokens
- `POST /api/v1/auth/refresh` — Refresh access token
- `POST /api/v1/auth/logout` — Blacklist refresh token
- `POST /api/v1/auth/verify-otp` — Verify 6-digit email OTP
- `POST /api/v1/auth/resend-otp` — Resend verification OTP
- `POST /api/v1/auth/forgot-password` — Request password reset
- `POST /api/v1/auth/reset-password` — Set new password with OTP
- `POST /api/v1/auth/google` — Google OAuth2 authentication

</details>

<details>
<summary><b>2. Users & Profiles (<code>/api/v1/users</code>)</b></summary>

- `GET /api/v1/users/me` — Retrieve current user profile
- `PATCH /api/v1/users/me` — Update current user details
- `POST /api/v1/users/profile-setup` — Complete onboarding KYC
- `PUT /api/v1/users/preferences` — Update user preferences
- `GET /api/v1/users/{user_id}` — Get public profile

</details>

<details>
<summary><b>3. Vehicle Catalog & Discovery (<code>/api/v1/vehicles</code>)</b></summary>

- `GET /api/v1/vehicles` — Multi-filter search (category, seats, fuel, price, city)
- `GET /api/v1/vehicles/categories` — Aggregated category metrics
- `GET /api/v1/vehicles/stats` — Fleet status breakdown
- `GET /api/v1/vehicles/{id}` — Vehicle details & rental rules
- `POST /api/v1/vehicles` — Add new vehicle
- `PATCH /api/v1/vehicles/{id}` — Update vehicle listing
- `POST /api/v1/vehicles/{id}/publish` — Publish vehicle listing
- `POST /api/v1/vehicles/{id}/unpublish` — Delist vehicle
- `DELETE /api/v1/vehicles/{id}` — Archive vehicle

</details>

<details>
<summary><b>4. Bookings & Invoicing (<code>/api/v1/bookings</code>)</b></summary>

- `POST /api/v1/bookings/calculate-pricing` — Estimate rental subtotal, tax, deposit
- `POST /api/v1/bookings` — Create reservation & generate 4-digit pickup code
- `GET /api/v1/bookings` — List bookings by role and status
- `GET /api/v1/bookings/{id}` — Booking details & timeline
- `POST /api/v1/bookings/{id}/confirm` — Provider confirmation
- `POST /api/v1/bookings/{id}/cancel` — Cancel reservation
- `POST /api/v1/bookings/{id}/pickup` — Validate pickup code & start rental
- `POST /api/v1/bookings/{id}/return` — Record drop-off odometer/fuel & settle invoice
- `GET /api/v1/bookings/{id}/invoice` — Retrieve itemized invoice
- `GET /api/v1/bookings/revenue/metrics` — Provider revenue metrics

</details>

<details>
<summary><b>5. Fleet Operations (<code>/api/v1/fleet</code>)</b></summary>

- `GET /api/v1/fleet/maintenance` — List maintenance logs
- `POST /api/v1/fleet/maintenance` — Schedule vehicle service
- `PATCH /api/v1/fleet/maintenance/{id}` — Complete service & release vehicle
- `GET /api/v1/fleet/inspections` — Vehicle safety inspection logs
- `POST /api/v1/fleet/inspections` — Record pre-trip / post-return inspection
- `GET /api/v1/fleet/damages` — Damage incident reports
- `POST /api/v1/fleet/damages` — File new damage report
- `PATCH /api/v1/fleet/damages/{id}` — Update damage resolution
- `GET /api/v1/fleet/tasks` — List depot operational tasks
- `POST /api/v1/fleet/tasks` — Create depot task
- `PATCH /api/v1/fleet/tasks/{id}` — Update task status

</details>

<details>
<summary><b>6. SaaS Subscriptions (<code>/api/v1/subscriptions</code>)</b></summary>

- `GET /api/v1/subscriptions/plans` — List provider subscription tiers
- `GET /api/v1/subscriptions/current` — Current plan & usage telemetry
- `POST /api/v1/subscriptions/upgrade` — Upgrade plan & generate invoice
- `GET /api/v1/subscriptions/invoices` — Billing history

</details>

<details>
<summary><b>7. Smart Pricing & AI (<code>/api/v1/pricing</code> & <code>/api/v1/ai</code>)</b></summary>

- `GET /api/v1/pricing/metrics/{id}` — Surge pricing demand index
- `POST /api/v1/pricing/apply-recommendation` — 1-Click apply suggested rate
- `POST /api/v1/ai/damage-analysis` — Computer vision damage analysis
- `GET /api/v1/ai/photo-templates` — 6-Point photo capture guides
- `POST /api/v1/ai/recommend` — Vehicle matchmaking recommendations

</details>

<details>
<summary><b>8. Administration & Notifications (<code>/api/v1/admin</code> & <code>/api/v1/notifications</code>)</b></summary>

- `GET /api/v1/admin/kpis` — Platform revenue, users, and fleet KPIs
- `GET /api/v1/admin/users` — User directory
- `PATCH /api/v1/admin/users/{id}/status` — Activate/suspend user
- `GET /api/v1/admin/providers` — Host directory with fleet telemetry
- `GET /api/v1/admin/verifications` — KYC verification queue
- `POST /api/v1/admin/verifications/{id}/review` — Approve/reject verification
- `GET /api/v1/admin/payments` — Financial payout audits
- `GET /api/v1/admin/disputes` — Dispute resolution queue
- `PATCH /api/v1/admin/disputes/{id}` — Settle dispute & issue refund
- `GET /api/v1/admin/config` — System commission & configurations
- `PATCH /api/v1/admin/config` — Update system config
- `GET /api/v1/notifications` — User notification feed
- `PATCH /api/v1/notifications/{id}/read` — Mark notification read
- `POST /api/v1/notifications/mark-all-read` — Mark all read

</details>

---

## Live API Documentation

The REST API is live in production with HTTP Basic Auth protected interactive Swagger UI documentation:

- **Interactive Swagger UI**: **[https://car-rental-system-backend-m5fh.onrender.com/docs](https://car-rental-system-backend-m5fh.onrender.com/docs)**
- **Health Check**: **[https://car-rental-system-backend-m5fh.onrender.com/health](https://car-rental-system-backend-m5fh.onrender.com/health)**

### Documentation Access Credentials:
| Parameter | Value |
|---|---|
| **Username** | `admin` |
| **Password** | `admin123` |

---

## Seed Accounts for Testing

| Persona | Email | Password | Role Scope |
|---|---|---|---|
| **Platform Admin** | `admin@carrental.com` | `Admin@123456` | Full system governance, KPIs, verification approvals |
| **Fleet Provider** | `host@carrental.com` | `Host@123456` | Vehicle catalog management, bookings, subscription telemetry |
| **Fleet Manager** | `fleet@operations.com` | `Fleet@123456` | Vehicle maintenance scheduling, inspections, damage logs |
| **Customer** | `customer@carrental.com` | `Customer@123456` | Vehicle discovery, reservations, digital pickup check-in |

---

## Quickstart

```bash
# 1. Clone repository
git clone https://github.com/mzaid-dev/car-rental-system-backend.git
cd car-rental-system-backend

# 2. Setup virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt

# 3. Initialize & Seed database
python -m app.seed

# 4. Start development server
python run.py
```

---

## Testing

```bash
pytest -v
```

All 11 automated test suites execute against an isolated in-memory async SQLite engine with 100% pass rate.

---

## Production Deployment

Configure the following environment variables in your cloud hosting provider (e.g., Render, Koyeb, Railway):

```env
DATABASE_URL=postgresql+asyncpg://<USER>:<PASSWORD>@<HOST>:<PORT>/<DB_NAME>?ssl=require
JWT_SECRET_KEY=<RANDOM_32_CHAR_SECRET>
JWT_REFRESH_SECRET_KEY=<RANDOM_32_CHAR_SECRET>
GOOGLE_CLIENT_ID=<GOOGLE_OAUTH_CLIENT_ID>
RESEND_API_KEY=<RESEND_API_KEY>
```

---

## License

Distributed under the [MIT License](LICENSE).
