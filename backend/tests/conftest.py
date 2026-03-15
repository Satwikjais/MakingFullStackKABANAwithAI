import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from models import Base
from database import get_db


# Test database URL
TEST_DATABASE_URL = "sqlite:///./test_kanban.db"

# Create test engine
test_engine = create_engine(
    TEST_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
    echo=False,
)

# Create test SessionLocal
TestSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)


@pytest.fixture(scope="function")
def db_session():
    """Create a fresh database for each test"""
    # Create all tables
    Base.metadata.create_all(bind=test_engine)

    # Create a new session
    session = TestSessionLocal()

    try:
        yield session
    finally:
        session.rollback()
        session.close()

    # Drop all tables after test
    Base.metadata.drop_all(bind=test_engine)


@pytest.fixture(scope="function")
def client():
    """Test client fixture"""
    from fastapi.testclient import TestClient
    from main import app

    # Override the database dependency
    def override_get_db():
        session = TestSessionLocal()
        try:
            yield session
        finally:
            session.close()

    app.dependency_overrides[get_db] = override_get_db

    with TestClient(app) as test_client:
        yield test_client

    # Clean up
    app.dependency_overrides.clear()