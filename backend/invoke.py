from backend.services.retriever import retrieve_emails
from langchain_core.prompts import PromptTemplate
from langchain_mistralai import ChatMistralAI
from backend.prompts.prompt import prompt
from dotenv import load_dotenv

load_dotenv()


model = ChatMistralAI(
    model="mistral-large-latest",
    temperature=0.7
)


def get_user_details(
    name: str,
    email: str,
    portfolio: str = "",
    github: str = "",
    phone: str = ""
) -> dict:
    """
    Returns a dictionary containing user information.
    """

    return {
        "name": name,
        "email": email,
        "portfolio": portfolio,
        "github": github,
        "phone": phone,
    }
    
# Demo arguments   
user = get_user_details(
    name="Max alison",
    email="max@example.com",
    portfolio="https://maxyourway.dev",
    github="https://github.com/maxx",
    phone="+91 9876543210"
)

emails = retrieve_emails(
    # Demo arguments
    company="Google",
    role="Backend Engineer",
    skills="Python, FastAPI, PostgreSQL",
    tone="Professional"
)

chain = prompt | model

response = chain.invoke(
    {
        "name": user["name"],
        "email": user["email"],
        "portfolio": user["portfolio"],
        "github": user["github"],
        "phone": user["phone"],
        "company": "Google",
        "role": "Backend Engineer",
        "skills": "Python, FastAPI, PostgreSQL",
        "tone": "Professional",
        "emails": emails,
    }
)

print(response.content)