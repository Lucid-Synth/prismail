from fastapi import FastAPI, Depends, HTTPException, status
from pydantic import BaseModel
from typing import List, Annotated
from .models import model
from .config.database import engine, SessionLocal
from sqlalchemy.orm import Session
from .auth import auth
from .invoke import generate_cold_email

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

app.include_router(auth.router)
model.Base.metadata.create_all(bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
        
db_dependency = Annotated[Session,Depends(get_db)]

@app.get("/",status_code=status.HTTP_200_OK)
async def user(user: None, db: db_dependency):
    if user is None:
        raise HTTPException (status_code=401, detail='Authentication Failed')
    return {"User": user}

@app.post('/generate')
def generate_email(user: User_detail):
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