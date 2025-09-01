from pydantic import BaseModel
from datetime import datetime
from typing import List, Optional

# --- Solve Schemas ---
class SolveBase(BaseModel):
    time_ms: int
    scramble: str

class SolveCreate(SolveBase):
    pass

class Solve(SolveBase):
    id: int
    owner_id: int
    timestamp: datetime

    class Config:
        orm_mode = True

# --- User Schemas ---
class UserBase(BaseModel):
    username: str

class UserCreate(UserBase):
    password: str

class User(UserBase):
    id: int
    solves: List[Solve] = []

    class Config:
        orm_mode = True

# --- JWT Token Schemas ---
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None