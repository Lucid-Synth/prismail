from services.retriever import retrieve_emails
from prompts.prompt import prompt

from langchain_groq import ChatGroq
from dotenv import load_dotenv

load_dotenv()


model = ChatGroq(
    model="groq/compound",
    temperature=0.7
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