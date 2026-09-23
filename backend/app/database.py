"""
Async PostgreSQL database connection using SQLAlchemy 2.0 + asyncpg.
"""

from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import DeclarativeBase
from app.config import settings


# ── Engine ────────────────────────────────────────────────────────────────────
engine_kwargs = {"echo": settings.DEBUG}
if not settings.DATABASE_URL.startswith("sqlite"):
    engine_kwargs.update(
        {
            "pool_size": 10,
            "max_overflow": 20,
            "pool_pre_ping": True,
        }
    )

engine = create_async_engine(settings.DATABASE_URL, **engine_kwargs)


# ── Session Factory ───────────────────────────────────────────────────────────
AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False,
)


# ── Base Model ────────────────────────────────────────────────────────────────
class Base(DeclarativeBase):
    pass


# ── Dependency: get_db ────────────────────────────────────────────────────────
async def get_db() -> AsyncSession:
    """FastAPI dependency that yields an async DB session."""
    async with AsyncSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()


# ── Create all tables ─────────────────────────────────────────────────────────
async def create_tables():
    """Called on app startup to create all tables."""
    # Import all models so Base metadata is completely populated
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

    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)


# Alias for seeder / test setup
init_db = create_tables

