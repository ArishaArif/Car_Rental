# Car Rental & Fleet Management System — Backend API

An asynchronous, production-ready REST API powering multi-tenant car rental and fleet management operations. Engineered with Python 3.12, FastAPI, SQLAlchemy 2.0 (async), and PostgreSQL.

[![Python Version](https://img.shields.io/badge/Python-3.12-3776AB?style=flat-square&logo=python&logoColor=white)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688?style=flat-square&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16%2B-336791?style=flat-square&logo=postgresql&logoColor=white)](https://www.postgresql.org)
[![SQLAlchemy](https://img.shields.io/badge/SQLAlchemy-2.0_Async-D71F00?style=flat-square&logo=sqlalchemy&logoColor=white)](https://docs.sqlalchemy.org/en/20/)
[![Pytest](https://img.shields.io/badge/Tests-100%25_Passing-4CAF50?style=flat-square&logo=pytest&logoColor=white)](https://docs.pytest.org)
[![Security](https://img.shields.io/badge/Auth-JWT_Rotation_%26_Blacklist-1A1A1A?style=flat-square)](https://jwt.io)
[![License](https://img.shields.io/badge/License-MIT-gray?style=flat-square)](LICENSE)

---

## Highlights

- **Asynchronous Architecture**: Non-blocking I/O across all layers using FastAPI, `asyncpg`, and SQLAlchemy 2.0 async sessions.
- **Strict Role-Based Access Control**: Domain separation across `Customer`, `Provider` (Host), `FleetManager`, and `Admin` personas.
- **Dual-Token Authentication**: JWT access and refresh token lifecycle with server-side database blacklist revocation upon logout.
- **Dynamic Pricing Engine**: Algorithmic yield pricing adjusting rates based on real-time fleet utilization, weekend surge indices, and demand trends.
- **Vehicle Lifecycle Management**: Complete operational states (`Available`, `Rented`, `Maintenance`, `Reserved`) with inspection checklists and maintenance scheduling.
- **Computer Vision Damage Assessment**: Image analysis pipeline for vehicle damage detection, repair cost estimation, and 6-point guided photo capture templates.
- **Provider SaaS Billing**: Tiered subscription management (`Starter`, `Professional`, `Business`) with real-time quota telemetry and billing history.
- **Automated Invoicing**: Reservation lifecycle settlement calculating platform commissions, taxes, security deposits, and final drop-off adjustments.

---

## Domain Architecture

The application is structured using layered domain-driven design principles with clear separation of concerns:

```
app/
├── models/         # SQLAlchemy 2.0 declarative database entities
├── schemas/        # Pydantic v2 validation & serialization contracts
├── routers/        # FastAPI HTTP route controllers (60 endpoints across 12 tags)
├── services/       # Domain business logic & external integrations
├── utils/          # JWT handlers, password hashing (Argon2/Bcrypt), auth dependencies
├── config.py       # Pydantic Settings with env parsing & local fallbacks
├── database.py     # Async engine & session lifecycle management
├── main.py         # Application entrypoint & CORS middleware
└── seed.py         # Realistic demo data seeder
```

---

## API Surface

The API exposes **60 REST endpoints** grouped by functional domains:

| Domain | Base Path | Description |
|---|---|---|
| **Authentication** | `/api/v1/auth` | Registration, login, OTP verification, Google OAuth2, token refresh, and logout |
| **Users** | `/api/v1/users` | Profile retrieval, onboarding KYC setup, user preferences |
| **Vehicles** | `/api/v1/vehicles` | Multi-parameter search, category metrics, fleet status, CRUD listings |
| **Bookings** | `/api/v1/bookings` | Price calculation, reservation lifecycle, 4-digit pickup check-in, invoices |
| **Fleet Operations** | `/api/v1/fleet` | Scheduled maintenance, safety inspections, damage reports, operational tasks |
| **Subscriptions** | `/api/v1/subscriptions` | Host SaaS tiers, usage quotas, tier upgrades, invoice history |
| **Smart Pricing** | `/api/v1/pricing` | Utilization surge metrics and 1-click price recommendations |
| **AI Services** | `/api/v1/ai` | Damage detection analysis, 6-point capture templates, vehicle recommendations |
| **Administration** | `/api/v1/admin` | Platform KPIs, user management, KYC approvals, disputes, system configs |
| **Notifications** | `/api/v1/notifications` | User alerts, status updates, broadcast notifications |

Interactive OpenAPI documentation is available locally at `/api/docs` (Swagger UI) and `/api/redoc` (ReDoc).

---

## Getting Started

### Prerequisites

- Python 3.12+
- PostgreSQL (or local SQLite for zero-dependency development)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/mzaid-dev/car-rental-system-backend.git
   cd car-rental-system-backend
   ```

2. **Create and activate a virtual environment:**
   ```bash
   python -m venv venv
   source venv/bin/activate  # Windows: venv\Scripts\activate
   ```

3. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Configure environment variables:**
   ```bash
   cp .env.example .env
   ```
   *(The application includes sensible local development defaults and runs out of the box).*

5. **Seed demo data (optional):**
   ```bash
   python -m app.seed
   ```

6. **Start the development server:**
   ```bash
   python run.py
   ```
   The API server will start on `http://localhost:8000`.

---

## Seed Accounts for Testing

When seeded, the database contains pre-configured accounts for each role:

| Persona | Email | Password | Role Scope |
|---|---|---|---|
| **Platform Admin** | `admin@carrental.com` | `Admin@123456` | Full system governance, KPIs, verification approvals |
| **Fleet Provider** | `host@carrental.com` | `Host@123456` | Vehicle catalog management, bookings, subscription telemetry |
| **Fleet Manager** | `fleet@operations.com` | `Fleet@123456` | Vehicle maintenance scheduling, inspections, damage logs |
| **Customer** | `customer@carrental.com` | `Customer@123456` | Vehicle discovery, reservations, digital pickup check-in |

---

## Testing

The project includes an end-to-end automated test suite built on `pytest` and `pytest-asyncio`. Tests execute against an isolated in-memory SQLite database and test client with zero external infrastructure required.

```bash
# Execute full test suite
pytest -v
```

### Test Coverage Overview

- **Auth & Lifecycle**: Registration, email OTP verification, token refresh rotation, and blacklist validation upon logout.
- **Vehicle Catalog**: Search query filters (fuel, transmission, seats, price, availability), category metrics, and fleet statistics.
- **Booking Engine**: Dynamic rate calculation, 4-digit pickup code verification, drop-off settlement, and invoice generation.
- **Fleet Workflows**: Maintenance service lifecycle, pre/post trip inspection checklists, and damage logs.
- **SaaS Subscriptions**: Plan tier upgrades, quota limits, and billing history.
- **AI & Pricing**: Surge pricing multipliers and computer vision damage analysis endpoints.
- **Administration**: KPI aggregations, user directory status controls, and KYC reviews.

---

## Production Deployment

### Container / Cloud Service (e.g. Render, Railway, Fly.io)

1. Connect your repository to your hosting platform.
2. Configure build and start commands:
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
3. Supply production environment variables:
   ```env
   DATABASE_URL=postgresql+asyncpg://<USER>:<PASSWORD>@<HOST>:<PORT>/<DB_NAME>?ssl=require
   JWT_SECRET_KEY=<32_CHARACTER_RANDOM_SECRET>
   JWT_REFRESH_SECRET_KEY=<32_CHARACTER_RANDOM_SECRET>
   GOOGLE_CLIENT_ID=<GOOGLE_OAUTH_CLIENT_ID>
   RESEND_API_KEY=<RESEND_API_KEY>
   ```

---

## License

This project is licensed under the [MIT License](LICENSE).
