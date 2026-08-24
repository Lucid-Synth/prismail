import logging
from fastapi import FastAPI, Depends, HTTPException, status, Request
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from pydantic import BaseModel
from typing import List, Annotated
from .models import model
from .config.database import engine, SessionLocal
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError
from .auth import router, get_current_user
from .invoke import generate_cold_email
from fastapi.middleware.cors import CORSMiddleware

logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO)

class User_detail(BaseModel):
    name: str
    email: str
    portfolio: str
    github: str
    phone: str
    company: str
    role: str
    skills: str
    tone: str
    
    
app = FastAPI()

origins = [
    "http://localhost:5173"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_headers=["*"],
    allow_methods=["*"]
)

app.include_router(router)
model.Base.metadata.create_all(bind=engine)


# ---------- Global Error Handlers ----------

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    # Extract first error for clean frontend alert, but also include all
    errors = exc.errors()
    # Build user-friendly message
    first = errors[0] if errors else {}
    loc = " -> ".join(str(x) for x in first.get("loc", []))
    msg = first.get("msg", "Validation failed")
    detail = f"{loc}: {msg}" if loc else msg
    logger.warning(f"Validation error on {request.url.path}: {detail} | errors={errors}")
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={
            "success": False,
            "detail": detail,
            "errors": errors,
        },
    )


@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    logger.warning(f"HTTP {exc.status_code} on {request.url.path}: {exc.detail}")
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "success": False,
            "detail": exc.detail,
        },
        headers=getattr(exc, "headers", None),
    )


@app.exception_handler(SQLAlchemyError)
async def sqlalchemy_exception_handler(request: Request, exc: SQLAlchemyError):
    logger.exception(f"Database error on {request.url.path}: {exc}")
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "success": False,
            "detail": "Database error. Please try again later.",
        },
    )


@app.exception_handler(Exception)
async def generic_exception_handler(request: Request, exc: Exception):
    logger.exception(f"Unhandled error on {request.url.path}: {exc}")
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "success": False,
            "detail": "Internal server error. Please try again later.",
        },
    )

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
        
db_dependency = Annotated[Session,Depends(get_db)]
user_dependency = Annotated[dict, Depends(get_current_user)]

@app.get("/",status_code=status.HTTP_200_OK)
async def user(user: None, db: db_dependency):
    if user is None:
        raise HTTPException (status_code=401, detail='Authentication Failed')
    return {"User": user}

@app.get("/health", status_code=status.HTTP_200_OK)
async def health_check():
    return {"success": True, "status": "ok"}

@app.post('/generate')
def generate_email(user: User_detail,token: user_dependency,db: db_dependency):
    try:
        response = generate_cold_email(
            name=user.name,
            email=user.email,
            portfolio=user.portfolio,
            github=user.github,
            phone=user.phone,
            company=user.company,
            role=user.role,
            skills=user.skills,
            tone=user.tone,
        )
        return { "success": True, "email" : response}
    except HTTPException:
        raise
    except Exception as e:
        logger.exception(f"Error generating email: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to generate email. Please try again later.",
        )