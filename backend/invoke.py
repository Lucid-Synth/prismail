import sys
from pathlib import Path

if __package__ is None:
    sys.path.insert(0, str(Path(__file__).resolve().parent))

try:
    from .services.retriever import retrieve_emails
    from .prompts.prompt import prompt
except ImportError:
    from services.retriever import retrieve_emails
    from prompts.prompt import prompt

from langchain_mistralai import ChatMistralAI
from dotenv import load_dotenv

load_dotenv()


model = ChatMistralAI(
    model="mistral-medium-latest",
    temperature=0.7,
)


def generate_cold_email(
    name: str,
    email: str,
    portfolio: str,
    github: str,
    phone: str,
    company: str,
    role: str,
    skills: str,
    tone: str,
) -> str:
    emails = retrieve_emails(
        company=company,
        role=role,
        skills=skills,
        tone=tone,
    )

    chain = prompt | model
    response = chain.invoke(
        {
            "name": name,
            "email": email,
            "portfolio": portfolio,
            "github": github,
            "phone": phone,
            "company": company,
            "role": role,
            "skills": skills,
            "tone": tone,
            "emails": emails,
        }
    )

    return response.content