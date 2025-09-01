from sqlalchemy.orm import Session
import models, schemas, security

# --- User CRUD ---
def get_user(db: Session, user_id: int):
    return db.query(models.User).filter(models.User.id == user_id).first()

def get_user_by_username(db: Session, username: str):
    return db.query(models.User).filter(models.User.username == username).first()

def create_user(db: Session, user: schemas.UserCreate):
    hashed_password = security.get_password_hash(user.password)
    db_user = models.User(username=user.username, hashed_password=hashed_password)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

# --- Solve CRUD ---
def get_solves_for_user(db: Session, user_id: int):
    return db.query(models.Solve).filter(models.Solve.owner_id == user_id).all()

def create_solve(db: Session, solve: schemas.SolveCreate, user_id: int):
    db_solve = models.Solve(**solve.dict(), owner_id=user_id)
    db.add(db_solve)
    db.commit()
    db.refresh(db_solve)
    return db_solve