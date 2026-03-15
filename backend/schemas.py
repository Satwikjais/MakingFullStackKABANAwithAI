from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime


# Authentication schemas
class LoginRequest(BaseModel):
    username: str = Field(..., min_length=1, max_length=50)
    password: str = Field(..., min_length=1)


class AuthResponse(BaseModel):
    message: str
    status: str
    user_id: Optional[int] = None


# Card schemas
class CardBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)
    details: str = ""


class CardCreate(CardBase):
    column_id: int
    position: int = 0


class CardUpdate(CardBase):
    position: Optional[int] = None


class Card(CardBase):
    id: int
    column_id: int
    position: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# Column schemas
class ColumnBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=100)
    position: int


class ColumnCreate(ColumnBase):
    board_id: int


class ColumnUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=100)
    position: Optional[int] = None


class Column(ColumnBase):
    id: int
    board_id: int
    created_at: datetime
    updated_at: datetime
    cards: List[Card] = []

    class Config:
        from_attributes = True


# Board schemas
class BoardBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)


class BoardCreate(BoardBase):
    user_id: int


class BoardUpdate(BoardBase):
    pass


class Board(BoardBase):
    id: int
    user_id: int
    created_at: datetime
    updated_at: datetime
    columns: List[Column] = []

    class Config:
        from_attributes = True


# User schemas
class UserBase(BaseModel):
    username: str = Field(..., min_length=1, max_length=50)


class UserCreate(UserBase):
    password: str = Field(..., min_length=1)


class User(UserBase):
    id: int
    created_at: datetime
    updated_at: datetime
    boards: List[Board] = []

    class Config:
        from_attributes = True


# API Response schemas
class APIResponse(BaseModel):
    message: str
    status: str
    data: Optional[dict] = None


class BoardResponse(BaseModel):
    board: Board
    status: str = "success"


class CardsResponse(BaseModel):
    cards: List[Card]
    status: str = "success"


class CardResponse(BaseModel):
    card: Card
    status: str = "success"


class ColumnsResponse(BaseModel):
    columns: List[Column]
    status: str = "success"


class ColumnResponse(BaseModel):
    column: Column
    status: str = "success"