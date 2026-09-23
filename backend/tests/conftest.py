"""
Pytest configuration & fixtures for testing the FastAPI backend.
Uses an async in-memory SQLite database and FastAPI TestClient / AsyncClient.
"""

import os
import pytest
import pytest_asyncio
from typing import AsyncGenerator
from httpx import AsyncClient, ASGITransport
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.pool import StaticPool

# Set required environment variables before importing app
os.environ["DATABASE_URL"] = "sqlite+aiosqlite:///:memory:"
os.environ["JWT_SECRET_KEY"] = "testsecretkeytestsecretkeytestsecretkey32"
os.environ["JWT_REFRESH_SECRET_KEY"] = "testrefreshsecretkeytestrefreshsecret32"
os.environ["GOOGLE_CLIENT_ID"] = "test-google-client-id.apps.googleusercontent.com"
os.environ["RESEND_API_KEY"] = "re_test_dummy_api_key"

from app.main import app
from app.database import Base, get_db
from app.models.user import User, UserRole, AuthProvider, VerificationStatus
from app.utils.hashing import hash_password
from app.utils.jwt import create_access_token


# Async SQLite engine
test_engine = create_async_engine(
    "sqlite+aiosqlite:///:memory:",
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)

TestingSessionLocal = async_sessionmaker(
    bind=test_engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False,
)


@pytest_asyncio.fixture(scope="session", autouse=True)
async def setup_database():
    """Create all tables before test run."""
    from app.models import (  # noqa: F401
        user,
        otp,
        token_blacklist,
        vehicle,
        booking,
        fleet,
        subscription,
        admin,
        notification,
    )

    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield
    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)


@pytest_asyncio.fixture
async def db_session() -> AsyncGenerator[AsyncSession, None]:
    """Provides an isolated async session for database operations."""
    async with TestingSessionLocal() as session:
        yield session
        await session.rollback()


@pytest_asyncio.fixture
async def client() -> AsyncGenerator[AsyncClient, None]:
    """Async HTTP test client with database dependency override."""
    async def override_get_db():
        async with TestingSessionLocal() as session:
            try:
                yield session
                await session.commit()
            except Exception:
                await session.rollback()
                raise
            finally:
                await session.close()

    app.dependency_overrides[get_db] = override_get_db

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac

    app.dependency_overrides.clear()


@pytest_asyncio.fixture
async def test_users(db_session: AsyncSession):
    """Seed test users for each role and generate valid JWT Bearer tokens."""
    import uuid
    from sqlalchemy import select

    # Helper get or create
    async def get_or_create(email, full_name, role, business_name=None, license_number=None):
        res = await db_session.execute(select(User).where(User.email == email))
        user = res.scalar_one_or_none()
        if not user:
            user = User(
                id=uuid.uuid4(),
                full_name=full_name,
                email=email,
                hashed_password=hash_password("Password@123"),
                auth_provider=AuthProvider.EMAIL,
                role=role,
                is_email_verified=True,
                is_profile_complete=True,
                verification_status=VerificationStatus.VERIFIED,
                business_name=business_name,
                license_number=license_number,
            )
            db_session.add(user)
            await db_session.commit()
            await db_session.refresh(user)
        return user

    admin = await get_or_create("admin_test@test.com", "Admin Test", UserRole.ADMIN)
    provider = await get_or_create("provider_test@test.com", "Provider Test", UserRole.PROVIDER, business_name="Test Motors LLC")
    customer = await get_or_create("customer_test@test.com", "Customer Test", UserRole.CUSTOMER, license_number="DL-TEST-9988")

    admin_token, _, _ = create_access_token(str(admin.id), admin.email, "Admin")
    provider_token, _, _ = create_access_token(str(provider.id), provider.email, "Provider")
    customer_token, _, _ = create_access_token(str(customer.id), customer.email, "Customer")

    return {
        "admin": {"user": admin, "token": admin_token, "headers": {"Authorization": f"Bearer {admin_token}"}},
        "provider": {"user": provider, "token": provider_token, "headers": {"Authorization": f"Bearer {provider_token}"}},
        "customer": {"user": customer, "token": customer_token, "headers": {"Authorization": f"Bearer {customer_token}"}},
    }


