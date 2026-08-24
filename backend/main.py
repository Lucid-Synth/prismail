from fastapi import FastAPI, Depends, HTTPException, status
from pydantic import BaseModel
from typing import List, Annotated
from .models import model
from .config.database import engine, SessionLocal
from sqlalchemy.orm import Session
from .auth import router, get_current_user
from .invoke import generate_cold_email
from fastapi.middleware.cors import CORSMiddleware

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

@app.post('/generate')
def generate_email(user: User_detail,token: user_dependency,db: db_dependency):
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
    return { "email" : response}