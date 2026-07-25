from langchain_core.prompts import ChatPromptTemplate
from system_prompts import system_prompt
from user_prompts import human_prompt

prompt = ChatPromptTemplate.from_messages(
    [
        ("system",system_prompt),
        ("human",human_prompt)
    ]
)