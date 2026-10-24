import logging

from sqlalchemy import create_engine, text
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import DeclarativeBase, sessionmaker

from app.config import get_settings

logger = logging.getLogger(__name__)
settings = get_settings()

engine = create_engine(
    settings.database_url,
    pool_pre_ping=True,
    pool_recycle=1800,
    pool_size=5,
    max_overflow=10,
    connect_args={"connect_timeout": 3},
    echo=False,
)

SessionLocal = sessionmaker(
    bind=engine,
    autoflush=False,
    autocommit=False,
    expire_on_commit=False,
)


class Base(DeclarativeBase):
    """Declarative base class shared by all ORM models."""


def check_database() -> bool:
    """Return True if MySQL answers a trivial query, False otherwise."""
    try:
        with engine.connect() as connection:
            connection.execute(text("SELECT 1"))
        return True
    except SQLAlchemyError as exc:
        logger.warning("Database check failed: %s", exc.__class__.__name__)
        return False


def dispose_engine() -> None:
    engine.dispose()