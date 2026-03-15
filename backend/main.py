from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session
from sqlalchemy import and_
import hashlib
from typing import List

from database import get_db, init_database
from models import User, Board, KanbanColumn, Card
from schemas import (
    LoginRequest, AuthResponse, BoardResponse, CardsResponse, CardResponse,
    ColumnsResponse, ColumnResponse, CardCreate, CardUpdate, ColumnCreate,
    ColumnUpdate, BoardCreate, BoardUpdate, APIResponse
)

# Initialize database on startup
init_database()

app = FastAPI(title="Project Management Backend", version="1.0.0")


# Authentication endpoints
@app.post("/api/login", response_model=AuthResponse)
async def login(request: LoginRequest, db: Session = Depends(get_db)):
    """Authenticate user and return user info"""
    user = db.query(User).filter(User.username == request.username).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username or password"
        )

    password_hash = hashlib.sha256(request.password.encode()).hexdigest()
    if user.password_hash != password_hash:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username or password"
        )

    return AuthResponse(
        message="Login successful",
        status="success",
        user_id=user.id
    )


@app.post("/api/logout", response_model=APIResponse)
async def logout():
    """Logout user (client-side session cleanup)"""
    return APIResponse(message="Logout successful", status="success")


# Board endpoints
@app.get("/api/board", response_model=BoardResponse)
async def get_board(user_id: int = 1, db: Session = Depends(get_db)):
    """Get the user's Kanban board with all columns and cards"""
    # For MVP, we use user_id=1 (the seeded user)
    # In a real app, this would come from authentication middleware
    board = db.query(Board).filter(Board.user_id == user_id).first()
    if not board:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Board not found"
        )

    return BoardResponse(board=board)


# Column endpoints
@app.post("/api/columns", response_model=ColumnResponse)
async def create_column(request: ColumnCreate, db: Session = Depends(get_db)):
    """Create a new column"""
    # Verify board exists and belongs to user
    board = db.query(Board).filter(and_(Board.id == request.board_id, Board.user_id == 1)).first()
    if not board:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Board not found"
        )

    column = KanbanColumn(
        board_id=request.board_id,
        title=request.title,
        position=request.position
    )
    db.add(column)
    db.commit()
    db.refresh(column)

    return ColumnResponse(column=column)


@app.put("/api/columns/{column_id}", response_model=ColumnResponse)
async def update_column(column_id: int, request: ColumnUpdate, db: Session = Depends(get_db)):
    """Update a column"""
    column = db.query(KanbanColumn).join(Board).filter(
        and_(KanbanColumn.id == column_id, Board.user_id == 1)
    ).first()

    if not column:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Column not found"
        )

    if request.title is not None:
        column.title = request.title
    if request.position is not None:
        column.position = request.position

    db.commit()
    db.refresh(column)

    return ColumnResponse(column=column)


@app.delete("/api/columns/{column_id}", response_model=APIResponse)
async def delete_column(column_id: int, db: Session = Depends(get_db)):
    """Delete a column"""
    column = db.query(KanbanColumn).join(Board).filter(
        and_(KanbanColumn.id == column_id, Board.user_id == 1)
    ).first()

    if not column:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Column not found"
        )

    db.delete(column)
    db.commit()

    return APIResponse(message="Column deleted successfully", status="success")


# Card endpoints
@app.post("/api/cards", response_model=CardResponse)
async def create_card(request: CardCreate, db: Session = Depends(get_db)):
    """Create a new card"""
    # Verify column exists and belongs to user's board
    column = db.query(KanbanColumn).join(Board).filter(
        and_(KanbanColumn.id == request.column_id, Board.user_id == 1)
    ).first()

    if not column:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Column not found"
        )

    card = Card(
        column_id=request.column_id,
        title=request.title,
        details=request.details,
        position=request.position
    )
    db.add(card)
    db.commit()
    db.refresh(card)

    return CardResponse(card=card)


@app.put("/api/cards/{card_id}", response_model=CardResponse)
async def update_card(card_id: int, request: CardUpdate, db: Session = Depends(get_db)):
    """Update a card"""
    card = db.query(Card).join(KanbanColumn).join(Board).filter(
        and_(Card.id == card_id, Board.user_id == 1)
    ).first()

    if not card:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Card not found"
        )

    card.title = request.title
    card.details = request.details
    if request.position is not None:
        card.position = request.position

    db.commit()
    db.refresh(card)

    return CardResponse(card=card)


@app.put("/api/cards/{card_id}/move", response_model=CardResponse)
async def move_card(card_id: int, new_column_id: int, new_position: int, db: Session = Depends(get_db)):
    """Move a card to a different column and/or position"""
    # Verify card exists and belongs to user
    card = db.query(Card).filter(Card.id == card_id).first()

    if not card:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Card not found"
        )

    # Verify target column exists and belongs to user
    target_column = db.query(KanbanColumn).join(Board).filter(
        and_(KanbanColumn.id == new_column_id, Board.user_id == 1)
    ).first()

    if not target_column:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Target column not found"
        )

    card.column_id = new_column_id
    card.position = new_position

    db.commit()
    db.refresh(card)

    return CardResponse(card=card)


@app.delete("/api/cards/{card_id}", response_model=APIResponse)
async def delete_card(card_id: int, db: Session = Depends(get_db)):
    """Delete a card"""
    card = db.query(Card).join(KanbanColumn).join(Board).filter(
        and_(Card.id == card_id, Board.user_id == 1)
    ).first()

    if not card:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Card not found"
        )

    db.delete(card)
    db.commit()

    return APIResponse(message="Card deleted successfully", status="success")


# Mount static files for the frontend (after routes to allow /api)
app.mount("/", StaticFiles(directory="static", html=True), name="static")