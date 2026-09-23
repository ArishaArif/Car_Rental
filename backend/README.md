<div align="center">

<img src="https://img.shields.io/badge/FastAPI-0.115.6-009688?style=for-the-badge&logo=fastapi&logoColor=white"/>
<img src="https://img.shields.io/badge/Python-3.12-3776AB?style=for-the-badge&logo=python&logoColor=white"/>
<img src="https://img.shields.io/badge/PostgreSQL-asyncpg-336791?style=for-the-badge&logo=postgresql&logoColor=white"/>
<img src="https://img.shields.io/badge/JWT-Auth-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white"/>
<img src="https://img.shields.io/badge/Google_OAuth2-4285F4?style=for-the-badge&logo=google&logoColor=white"/>
<img src="https://img.shields.io/badge/Resend-Email-000000?style=for-the-badge"/>

# 🚗 Car Rental — Backend API

**Production-grade FastAPI authentication backend for the Car Rental mobile platform.**

[API Docs](http://localhost:8000/docs) · [ReDoc](http://localhost:8000/redoc) · [Health Check](http://localhost:8000/health)

</div>

---

## Overview

This is the backend service for the **Car Rental** React Native application. It provides a complete, secure authentication system with support for email/password login, Google OAuth2, OTP email verification, JWT token management, and password reset.

The frontend (React Native) connects to this API to authenticate users across four roles: **Customer**, **Provider**, **Fleet Manager**, and **Admin**.

---

## ✨ Features

| Feature | Implementation |
|---|---|
| 📧 **Email/Password Auth** | Register → OTP verify → login |
| 🔑 **Google OAuth2** | Verify Google ID token from mobile client |
| 🎟️ **JWT Tokens** | Short-lived access (30 min) + long-lived refresh (7 days) |
| 📬 **Email OTP** | Delivered via [Resend.com](https://resend.com) with premium HTML template |
| 🔒 **Secure Logout** | Refresh token blacklisting in PostgreSQL |
| 🔄 **Password Reset** | OTP-based forgot/reset password flow |
| 🐘 **Async PostgreSQL** | SQLAlchemy 2.0 + asyncpg with connection pooling |
| 📖 **Auto Docs** | Swagger UI `/docs` + ReDoc `/redoc` |
| 🛡️ **Role Support** | User, Admin roles on JWT payload |

---

## Architecture

```
backend/
├── app/
│   ├── main.py              # FastAPI app · CORS · lifespan · routers
│   ├── config.py            # pydantic-settings (env validation)
│   ├── database.py          # Async engine · session · auto-create tables
│   │
│   ├── models/              # SQLAlchemy ORM (PostgreSQL)
│   │   ├── user.py          # User — UUID PK, Google ID, role, verified flag
│   │   ├── otp.py           # OTP — code, purpose, expiry, used flag
│   │   └── token_blacklist.py  # Revoked refresh tokens (JTI-based)
│   │
│   ├── schemas/             # Pydantic v2 request / response shapes
│   │   ├── auth.py          # Register, Login, OTP, Google, Reset schemas
│   │   └── user.py          # UserResponse, UpdateProfile
│   │
│   ├── routers/             # FastAPI route handlers
│   │   ├── auth.py          # POST /api/v1/auth/*  (9 endpoints)
│   │   └── users.py         # GET/PATCH /api/v1/users/me
│   │
│   ├── services/            # Business logic (no HTTP concerns)
│   │   ├── auth_service.py  # Orchestrates all auth flows
│   │   ├── otp_service.py   # Generate · store · verify OTPs
│   │   ├── email_service.py # Resend.com HTML email
│   │   └── google_service.py  # Google ID token verification
│   │
│   └── utils/
│       ├── jwt.py           # create / decode access & refresh tokens
│       ├── hashing.py       # bcrypt hash / verify
│       └── dependencies.py  # get_current_user · get_current_admin
│
├── requirements.txt
├── run.py                   # Dev server (uvicorn --reload)
└── .env.example             # Environment variable template
```

---

## Quickstart

### Prerequisites

- Python **3.11+**
- PostgreSQL **14+** (local or cloud)
- A [Resend.com](https://resend.com) account (free)
- A Google Cloud project with an OAuth 2.0 Client ID

### 1 — Clone & enter the backend

```bash
cd backend
```

### 2 — Create a virtual environment

```bash
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
```

### 3 — Install dependencies

```bash
pip install -r requirements.txt
```

### 4 — Configure environment

```bash
cp .env.example .env
```

Open `.env` and fill in:

| Variable | Description | Where to get it |
|---|---|---|
| `DATABASE_URL` | `postgresql+asyncpg://user:pass@host:5432/dbname` | Your PostgreSQL instance |
| `JWT_SECRET_KEY` | Random 64-char hex string | `python -c "import secrets; print(secrets.token_hex(32))"` |
| `JWT_REFRESH_SECRET_KEY` | Another random 64-char hex string | Same command |
| `GOOGLE_CLIENT_ID` | OAuth 2.0 Client ID | [Google Cloud Console](https://console.cloud.google.com) → Credentials |
| `RESEND_API_KEY` | API Key | [resend.com](https://resend.com) → API Keys |
| `RESEND_FROM_EMAIL` | Verified sender email | Resend domain settings |

### 5 — Create the database

```bash
# Using psql
createdb car_rental_db

# Or with connection string
psql -U postgres -c "CREATE DATABASE car_rental_db;"
```

### 6 — Run the server

```bash
python run.py
```

| URL | Purpose |
|---|---|
| `http://localhost:8000` | API root |
| `http://localhost:8000/docs` | **Swagger UI** (interactive) |
| `http://localhost:8000/redoc` | ReDoc (clean reference) |
| `http://localhost:8000/health` | Health check |

> **Tables are auto-created on startup** — no migration needed for development.

---

## API Reference

### Authentication — `/api/v1/auth`

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `POST` | `/register` | Create account, sends OTP email | — |
| `POST` | `/verify-otp` | Confirm 6-digit OTP → activate account | — |
| `POST` | `/resend-otp` | Re-send OTP to email | — |
| `POST` | `/login` | Email + password → access + refresh tokens | — |
| `POST` | `/refresh` | Swap refresh token for new access token | — |
| `POST` | `/logout` | Revoke refresh token | — |
| `POST` | `/google` | Google ID token → access + refresh tokens | — |
| `POST` | `/forgot-password` | Send password-reset OTP | — |
| `POST` | `/reset-password` | Set new password using OTP | — |

### Users — `/api/v1/users`

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `GET` | `/me` | Fetch authenticated user profile | ✅ Bearer |
| `PATCH` | `/me` | Update name / phone / profile picture | ✅ Bearer |

### System

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/health` | Health check (no auth) |
| `GET` | `/` | API info |

---

## Auth Flows

### Email Registration

```
POST /auth/register   { full_name, email, password }
  → 201 · OTP sent to email

POST /auth/verify-otp { email, otp_code }
  → 200 · account activated

POST /auth/login      { email, password }
  → 200 · { access_token, refresh_token, expires_in }
```

### Google OAuth (Mobile)

```
1. Mobile app calls Google Sign-In SDK
2. SDK returns an id_token

POST /auth/google     { id_token }
  → 200 · { access_token, refresh_token, expires_in }
      (creates account automatically if new user)
```

### Authenticated Request

```
GET /users/me
Authorization: Bearer <access_token>
  → 200 · { id, full_name, email, role, ... }
```

### Token Refresh

```
POST /auth/refresh    { refresh_token }
  → 200 · { access_token, expires_in }
```

### Password Reset

```
POST /auth/forgot-password { email }
  → 200 · OTP sent to email

POST /auth/reset-password  { email, otp_code, new_password }
  → 200 · password updated
```

---

## Security Notes

- **Passwords** are hashed with bcrypt (cost factor 12)
- **Access tokens** expire in 30 minutes; signed with a dedicated secret
- **Refresh tokens** expire in 7 days; signed with a separate secret
- **Logout** blacklists the refresh token JTI in the database
- **OTPs** are cryptographically random, expire in 10 minutes, and are single-use
- **Email enumeration** is prevented — forgot password / resend OTP always return the same response regardless of whether the email exists
- **Password strength** is validated server-side (uppercase, lowercase, digit, special character)

---

## Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/) → **APIs & Services** → **Credentials**
2. Click **Create Credentials** → **OAuth 2.0 Client ID**
3. Choose **Android** or **iOS** (depending on your mobile target)
4. Copy the **Client ID** into `.env` as `GOOGLE_CLIENT_ID`
5. In the React Native app, initialise Google Sign-In with the same Client ID
6. After the user signs in, send the `id_token` to `POST /api/v1/auth/google`

---

## Resend Email Setup

1. Sign up at [resend.com](https://resend.com) — free tier: **3,000 emails/month**
2. Go to **API Keys** → create a key
3. Go to **Domains** → add and verify your domain (or use `onboarding@resend.dev` for testing)
4. Set `RESEND_API_KEY` and `RESEND_FROM_EMAIL` in `.env`

---

## Frontend Integration

The frontend (`authService.ts`) currently uses mock data. To connect to this backend, replace the mock calls with real HTTP requests to `http://localhost:8000/api/v1`.

| Frontend method | Backend endpoint |
|---|---|
| `authService.register(...)` | `POST /api/v1/auth/register` |
| `authService.verifyOtp(...)` | `POST /api/v1/auth/verify-otp` |
| `authService.login(...)` | `POST /api/v1/auth/login` |
| `authService.forgotPassword(...)` | `POST /api/v1/auth/forgot-password` |
| `authService.resetPassword(...)` | `POST /api/v1/auth/reset-password` |
| `authService.logout()` | `POST /api/v1/auth/logout` |

---

## Development

```bash
# Run with hot reload
python run.py

# Check all routes
curl http://localhost:8000/openapi.json | python -m json.tool | grep '"path"'

# Run a quick health check
curl http://localhost:8000/health
```

---

## Branch Strategy

This backend lives on the `backend` branch and is merged into `main` via Pull Request.

```
main          ← stable, reviewed code only
  └── backend ← this branch · all backend development here
```

Never push directly to `main`. Open a PR from `backend → main` for review.

---

<div align="center">
  <sub>Car Rental Platform · Backend Service · FastAPI + PostgreSQL</sub>
</div>
