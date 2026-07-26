from fastapi import FastAPI
from pydantic import BaseModel
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

@app.get('/')
def root():
    return {"Message": "prismail API"}

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