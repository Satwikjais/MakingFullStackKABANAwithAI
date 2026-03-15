import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy.pool import StaticPool
from models import Base, User, Board, KanbanColumn, Card
import hashlib


# Database configuration
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./kanban.db")

# Create engine with SQLite-specific settings
engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {},
    poolclass=StaticPool if DATABASE_URL.startswith("sqlite") else None,
    echo=False,  # Set to True for SQL debugging
)

# Create SessionLocal class
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def get_db() -> Session:
    """Dependency to get database session"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def create_tables():
    """Create all database tables"""
    Base.metadata.create_all(bind=engine)


def seed_database(db: Session = None):
    """Seed the database with initial data"""
    if db is None:
        db = SessionLocal()
        close_db = True
    else:
        close_db = False

    try:
        # Check if database is already seeded
        user = db.query(User).filter(User.username == "user").first()
        if user:
            return  # Already seeded

        # Create default user
        password_hash = hashlib.sha256("password".encode()).hexdigest()
        user = User(username="user", password_hash=password_hash)
        db.add(user)
        db.flush()  # Get user.id

        # Create default board
        board = Board(user_id=user.id, name="My Project")
        db.add(board)
        db.flush()  # Get board.id

        # Create default columns
        columns_data = [
            ("Backlog", 0),
            ("Discovery", 1),
            ("In Progress", 2),
            ("Review", 3),
            ("Done", 4),
        ]

        columns = []
        for title, position in columns_data:
            column = KanbanColumn(board_id=board.id, title=title, position=position)
            db.add(column)
            columns.append(column)

        db.flush()  # Get column ids

        # Create default cards
        cards_data = [
            (columns[0].id, "Align roadmap themes", "Draft quarterly themes with impact statements and metrics.", 0),
            (columns[0].id, "Gather customer signals", "Review support tags, sales notes, and churn feedback.", 1),
            (columns[1].id, "Prototype analytics view", "Sketch initial dashboard layout and key drill-downs.", 0),
            (columns[2].id, "Refine status language", "Standardize column labels and tone across the board.", 0),
            (columns[2].id, "Design card layout", "Add hierarchy and spacing for scanning dense lists.", 1),
            (columns[3].id, "QA micro-interactions", "Verify hover, focus, and loading states.", 0),
            (columns[4].id, "Ship marketing page", "Final copy approved and asset pack delivered.", 0),
            (columns[4].id, "Close onboarding sprint", "Document release notes and share internally.", 1),
        ]

        for column_id, title, details, position in cards_data:
            card = Card(column_id=column_id, title=title, details=details, position=position)
            db.add(card)

        db.commit()
        print("Database seeded successfully")

    except Exception as e:
        db.rollback()
        print(f"Error seeding database: {e}")
        raise
    finally:
        if close_db:
            db.close()


def init_database():
    """Initialize database: create tables"""
    create_tables()