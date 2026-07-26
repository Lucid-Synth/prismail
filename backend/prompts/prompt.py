from langchain_core.prompts import ChatPromptTemplate
from .system_prompts import system_prompt

prompt = ChatPromptTemplate.from_messages(
    [
        ("system", system_prompt),
        (
            "human",
            """
User Details:
Name: {name}
Email: {email}
Portfolio: {portfolio}
GitHub: {github}
Phone: {phone}

Job Details:
Company: {company}
Role: {role}
Skills: {skills}
Tone: {tone}

Retrieved Email Examples:
{emails}

Write a personalized cold email.
            """,
        ),
    ]
)