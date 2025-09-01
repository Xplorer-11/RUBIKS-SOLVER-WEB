import json
from datetime import timedelta
from fastapi import Depends, FastAPI, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

# Import all the custom modules for database, models, schemas, crud, and security
import crud, models, schemas, security
from database import engine

# This command creates the database tables from your models the first time the app runs
models.Base.metadata.create_all(bind=engine)

# Initialize the FastAPI application
app = FastAPI()

# Your CORS Middleware setup
from fastapi.middleware.cors import CORSMiddleware
origins = ["http://localhost:5173", "http://localhost:3000"]
app.add_middleware(CORSMiddleware, allow_origins=origins, allow_credentials=True, allow_methods=["*"], allow_headers=["*"])


# --- AUTHENTICATION & USER ENDPOINTS ---

@app.post("/users/register", response_model=schemas.User, tags=["Users"])
def create_user(user: schemas.UserCreate, db: Session = Depends(security.get_db)):
    """
    Register a new user in the database.
    """
    db_user = crud.get_user_by_username(db, username=user.username)
    if db_user:
        raise HTTPException(status_code=400, detail="Username already registered")
    return crud.create_user(db=db, user=user)

@app.post("/token", response_model=schemas.Token, tags=["Users"])
def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(security.get_db)):
    """
    Log in a user to get a JWT access token.
    """
    user = crud.get_user_by_username(db, username=form_data.username)
    if not user or not security.verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=security.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = security.create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}


# --- PERSONAL SOLVE TRACKING ENDPOINTS (AUTHENTICATED) ---

@app.post("/solves", response_model=schemas.Solve, tags=["Solves"])
def create_solve_for_user(
    solve: schemas.SolveCreate, 
    db: Session = Depends(security.get_db), 
    current_user: schemas.User = Depends(security.get_current_user)
):
    """
    Save a new solve time for the currently logged-in user.
    """
    return crud.create_solve(db=db, solve=solve, user_id=current_user.id)

@app.get("/solves", response_model=list[schemas.Solve], tags=["Solves"])
def read_solves_for_user(
    db: Session = Depends(security.get_db), 
    current_user: schemas.User = Depends(security.get_current_user)
):
    """
    Get all solve times for the currently logged-in user.
    """
    return crud.get_solves_for_user(db=db, user_id=current_user.id)


# --- EXISTING UNAUTHENTICATED ENDPOINTS ---

@app.get("/", tags=["Public"])
def read_root():
    """
    Root endpoint to confirm the API is running.
    """
    return {"message": "Rubik's Cube Solver API is running."}

@app.get("/stats", tags=["Public"])
def get_wca_stats():
    """
    Reads WCA records from the local wca_records.json file.
    """
    try:
        with open("wca_records.json", "r") as f:
            data = json.load(f)
        return data
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail="wca_records.json file not found.")

# Pydantic model for the original, unauthenticated solver
from pydantic import BaseModel
class CubeRequest(BaseModel):
    cube_string: str

@app.post("/solve", tags=["Public"])
def solve_cube_endpoint(request: CubeRequest):
    """
    Solves a cube string without requiring authentication.
    """
    import kociemba
    try:
        solution = kociemba.solve(request.cube_string.upper())
        return {"solution": solution}
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid or unsolvable cube string.")