import os
import logging
from datetime import timedelta, datetime, timezone
from typing import Annotated
from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from pydantic import BaseModel, Field, field_validator
from starlette import status
from config.database import SessionLocal
from models.model import User
from fastapi.security import OAuth2PasswordBearer,OAuth2PasswordRequestForm
from jose import jwt, JWTError
import bcrypt
import re
from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger(__name__)

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
    username: str = Field(..., min_length=3, max_length=30, description="Username 3-30 chars")
    password: str = Field(..., min_length=8, max_length=72, description="Password 8-72 chars")

    @field_validator("username")
    @classmethod
    def validate_username(cls, v: str) -> str:
        v = v.strip()
        if not v:
            raise ValueError("Username is required")
        if len(v) < 3:
            raise ValueError("Username must be at least 3 characters")
        if not re.match(r"^[a-zA-Z0-9._-]+$", v):
            raise ValueError("Username may only contain letters, numbers, '.', '_' and '-'")
        return v

    @field_validator("password")
    @classmethod
    def validate_password(cls, v: str) -> str:
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters")
        return v
    
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
    try:
        # --- input sanitization (extra guard) ---
        username = create_user_request.username.strip()
        password = create_user_request.password

        if not username or not password:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Username and password are required.",
            )

        # --- duplicate check ---
        existing = db.query(User).filter(User.username == username).first()
        if existing:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Username already exists. Please choose a different one.",
            )

        create_user_model = User(
            username=username,
            hashed_password=hash_password(password)
        )

        db.add(create_user_model)
        db.commit()
        db.refresh(create_user_model)

        logger.info(f"User created: {username}")

        return {
            "success": True,
            "message": "Account created successfully. Please log in.",
            "username": username,
        }

    except HTTPException:
        raise
    except IntegrityError as e:
        db.rollback()
        # race-condition duplicate insert
        logger.warning(f"IntegrityError on signup for '{create_user_request.username}': {e}")
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Username already exists. Please choose a different one.",
        )
    except Exception as e:
        db.rollback()
        logger.exception(f"Unexpected error during signup for '{create_user_request.username}': {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error. Please try again later.",
        )
    
@router.post("/login", response_model=Token)
async def login_for_access_token(form_data: Annotated[OAuth2PasswordRequestForm, Depends()],
                                 db: db_dependency):
    try:
        if not form_data.username or not form_data.password:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Username and password are required.",
            )

        user = authenticate_user(form_data.username.strip(), form_data.password, db)

        if not user:
            # generic message to avoid username enumeration, but frontend can show friendly alert
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect username or password. Please check your credentials and try again.",
                headers={"WWW-Authenticate": "Bearer"},
            )

        token = create_access_token(
            user.username,
            user.id,
            timedelta(minutes=30)
        )

        logger.info(f"User logged in: {user.username}")

        return {
            "access_token": token,
            "token_type": "bearer"
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.exception(f"Unexpected error during login for '{form_data.username}': {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error. Please try again later.",
        )
    
    
def authenticate_user(username: str, password: str, db):
    try:
        user = db.query(User).filter(User.username == username).first()

        if not user:
            return None

        # guard against malformed stored hash
        if not user.hashed_password:
            logger.warning(f"User '{username}' has no hashed_password stored")
            return None

        password_bytes = password.encode("utf-8")[:72]

        if not bcrypt.checkpw(password_bytes, user.hashed_password.encode("utf-8")):
            return None

        return user
    except Exception as e:
        logger.exception(f"Error authenticating user '{username}': {e}")
        return None

def create_access_token(username: str, user_id: int, expire_delta: timedelta):
    if not SECRET_KEY or not ALGORITHM:
        logger.error("SECRET_KEY or ALGORITHM is not configured")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Server misconfiguration. Please contact support.",
        )
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
    if not db_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found.",
        )
    return {
        "success": True,
        "id": db_user.id,
        "username": db_user.username,
    }


@router.get("/me")
async def me(user: user_dependency):
    """Lightweight endpoint that returns username/id directly from JWT without DB hit."""
    return {
        "success": True,
        "id": user["id"],
        "username": user["username"],
    }