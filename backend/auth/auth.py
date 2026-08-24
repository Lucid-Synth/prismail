import os
from datetime import timedelta, datetime, timezone
from typing import Annotated
from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from pydantic import BaseModel
from starlette import status
from ..config.database import SessionLocal
from ..models.model import User
from fastapi.security import OAuth2PasswordBearer,OAuth2PasswordRequestForm
from jose import jwt, JWTError
import bcrypt
from dotenv import load_dotenv

load_dotenv()

router = APIRouter(
    prefix='/auth',
    tags=['auth']
)

SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = os.getenv("ALGORITHM")

oauth2_bearer = OAuth2PasswordBearer(tokenUrl='auth/login')


def hash_password(password: str) -> str:
    password_bytes = password.encode("utf-8")[:72]
    return bcrypt.hashpw(password_bytes, bcrypt.gensalt()).decode("utf-8")

class CreateUserRequest(BaseModel):
    username: str
    password: str
    
class Token(BaseModel):
    access_token: str
    token_type: str
    
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
        
db_dependency = Annotated[Session, Depends(get_db)]

@router.post("/signup", status_code=status.HTTP_201_CREATED)
async def create_user(db: db_dependency, create_user_request: CreateUserRequest):
    create_user_model = User(
        username=create_user_request.username,
        hashed_password=hash_password(create_user_request.password)
    )

    db.add(create_user_model)
    db.commit()
    return {
        "success": True
    }
    
@router.post("/login", response_model=Token)
async def login_for_access_token(form_data: Annotated[OAuth2PasswordRequestForm, Depends()],
                                 db: db_dependency):
    user = authenticate_user(form_data.username, form_data.password, db)
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail= "Incorrect username or password"
        )
    
    token = create_access_token(
        user.username,
        user.id,
        timedelta(minutes=30)
    )
    
    return {
        "access_token": token,
        "token_type": "bearer"
    }
    
    
def authenticate_user(username: str, password: str, db):
    user = db.query(User).filter(User.username == username).first()
    
    if not user:
        return False
    
    password_bytes = password.encode("utf-8")[:72]
    
    if not bcrypt.checkpw(password_bytes, user.hashed_password.encode("utf-8")):
        return None
    
    return user

def create_access_token(username: str, user_id: int, expire_delta: timedelta):
    expire = datetime.now(timezone.utc) + expire_delta
    encode = {
        "sub": username,
        "id": user_id,
        "exp": expire
    }
    
    return jwt.encode(encode, SECRET_KEY, algorithm=ALGORITHM)


async def get_current_user(
    token: Annotated[str, Depends(oauth2_bearer)]
):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
    )

    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])

        username: str = payload.get("sub")
        user_id: int = payload.get("id")

        if username is None or user_id is None:
            raise credentials_exception

        return {
            "username": username,
            "id": user_id,
        }

    except JWTError:
        raise credentials_exception
    
user_dependency = Annotated[dict, Depends(get_current_user)]
    
@router.get("/profile")
async def profile(
    user: user_dependency,
    db: db_dependency
):
    db_user = db.query(User).filter(User.id == user["id"]).first()
    return db_user